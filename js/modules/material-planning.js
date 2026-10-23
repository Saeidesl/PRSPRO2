(function () {
  'use strict';

  function escape(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function unwrap(value) {
    let data = value;
    for (let i = 0; i < 5 && data && !Array.isArray(data); i += 1) {
      if (data.data !== undefined) { data = data.data; continue; }
      if (data.items !== undefined) { data = data.items; continue; }
      break;
    }
    return data;
  }

  function canEdit() {
    const router = window.PMS && window.PMS.Router;
    return !!(router && ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
      (Array.isArray(router.permissions) && router.permissions.indexOf('PROJECT_EDIT') !== -1)));
  }

  async function open(projectId) {
    if (!canEdit()) {
      window.PMS.Alert && window.PMS.Alert.error
        ? window.PMS.Alert.error('دسترسی ویرایش مشخصات مصرف را ندارید.')
        : alert('دسترسی ویرایش مشخصات مصرف را ندارید.');
      return;
    }
    const old = document.getElementById('project-material-specs-modal');
    if (old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'project-material-specs-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10070;background:var(--color-overlay,rgba(0,0,0,.48));display:flex;align-items:center;justify-content:center;padding:12px;overflow:auto;direction:rtl;';
    modal.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="material-specs-title" style="background:var(--color-surface,#fff);color:var(--color-text,#222);width:100%;max-width:960px;max-height:94vh;overflow:auto;border-radius:14px;padding:18px;box-sizing:border-box">
        <header style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px">
          <div><h3 id="material-specs-title" style="margin:0 0 6px">مشخصات مصرف ملزومات</h3><p style="margin:0;font-size:12px;color:var(--color-text-secondary)">پروژه: ${escape(projectId)} — تعداد پیشنهادی و تعداد قطعی دو مفهوم جدا هستند.</p></div>
          <button type="button" class="btn btn-light" data-close>بستن</button>
        </header>
        <div id="material-specs-loading" class="loading-state">در حال دریافت اطلاعات...</div>
        <div id="material-specs-error" class="alert alert-danger" hidden></div>
        <section><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h4>ملزومات تعریف‌شده</h4><button type="button" class="btn btn-secondary" id="material-specs-estimate">محاسبه نیاز برآوردی</button></div><p style="font-size:12px;color:var(--color-text-secondary)">فقط ملزوماتی که سیاست سفارش زودهنگام آن‌ها مجاز است در این محاسبه لحاظ می‌شوند.</p><div id="material-specs-list"></div><div id="material-specs-estimate-result" class="alert alert-info" hidden style="margin-top:10px"></div></section>
        <form id="material-specs-form" class="form" style="margin-top:18px;border-top:1px solid var(--color-border);padding-top:16px">
          <input type="hidden" name="specId">
          <h4 id="material-specs-form-title">افزودن ملزوم</h4>
          <div class="form-row">
            <div class="form-group"><label for="ms-item-name">نام ملزوم</label><input id="ms-item-name" name="ItemName" maxlength="160" required></div>
            <div class="form-group"><label for="ms-unit">واحد اندازه‌گیری</label><input id="ms-unit" name="Unit" maxlength="40" placeholder="متر، عدد، کیلوگرم..." required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label for="ms-consumption">مصرف برای هر واحد محصول</label><input id="ms-consumption" name="ConsumptionPerUnit" type="number" min="0.0001" step="0.0001" required></div>
            <div class="form-group"><label for="ms-wastage">ضایعات مجاز (%)</label><input id="ms-wastage" name="WastagePercent" type="number" min="0" max="100" step="0.1" value="0"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label for="ms-policy">سیاست سفارش زودهنگام</label><select id="ms-policy" name="EarlyOrderPolicy"><option value="DISABLED">غیرفعال</option><option value="ESTIMATE_ALLOWED">بر اساس تعداد پیشنهادی مجاز</option><option value="MANUAL_ALLOWED">مقدار دستی مجاز</option></select></div>
            <div class="form-group"><label for="ms-early-qty">مقدار مجاز سفارش دستی</label><input id="ms-early-qty" name="EarlyOrderQuantity" type="number" min="0.0001" step="0.0001" disabled></div>
          </div>
          <div class="form-group"><label for="ms-notes">توضیحات</label><textarea id="ms-notes" name="Notes" rows="2"></textarea></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" id="ms-save" type="submit">ذخیره مشخصات</button><button class="btn btn-light" id="ms-reset" type="button">پاک‌کردن فرم</button></div>
        </form>
        <section style="margin-top:22px"><h4>تاریخچه محاسبات نیاز قطعی</h4><div id="material-specs-history"></div></section>
      </div>`;
    document.body.appendChild(modal);

    const loading = modal.querySelector('#material-specs-loading');
    const error = modal.querySelector('#material-specs-error');
    const list = modal.querySelector('#material-specs-list');
    const historyRoot = modal.querySelector('#material-specs-history');
    const form = modal.querySelector('#material-specs-form');
    const policy = form.elements.EarlyOrderPolicy;
    const earlyQty = form.elements.EarlyOrderQuantity;
    let specs = [];
    let history = [];

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }
    function updatePolicy() {
      const manual = policy.value === 'MANUAL_ALLOWED';
      earlyQty.disabled = !manual;
      earlyQty.required = manual;
      earlyQty.parentElement.style.opacity = manual ? '1' : '.65';
    }
    function resetForm() {
      form.reset();
      form.elements.specId.value = '';
      form.elements.WastagePercent.value = '0';
      modal.querySelector('#material-specs-form-title').textContent = 'افزودن ملزوم';
      modal.querySelector('#ms-save').textContent = 'ذخیره مشخصات';
      error.hidden = true;
      updatePolicy();
    }
    function renderSpecs() {
      if (!specs.length) {
        list.innerHTML = '<p class="table-empty">هنوز مشخصات مصرفی تعریف نشده است.</p>';
        return;
      }
      list.innerHTML = '<div style="display:grid;gap:8px">' + specs.map((item) => {
        const labels = { DISABLED: 'سفارش زودهنگام غیرفعال', ESTIMATE_ALLOWED: 'سفارش برآوردی مجاز', MANUAL_ALLOWED: 'مقدار دستی مجاز' };
        return '<article style="border:1px solid var(--color-border);border-radius:10px;padding:12px;display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap">' +
          '<div style="min-width:0;flex:1"><strong>' + escape(item.ItemName) + '</strong><div style="font-size:12px;margin-top:6px;color:var(--color-text-secondary)">مصرف هر واحد: ' + escape(item.ConsumptionPerUnit) + ' ' + escape(item.Unit) + ' · ضایعات: ' + escape(item.WastagePercent || 0) + '%</div><div style="font-size:12px;margin-top:4px">' + escape(labels[item.EarlyOrderPolicy] || item.EarlyOrderPolicy) + ' · نسخه ' + escape(item.Revision || 1) + '</div>' + (item.Notes ? '<p style="font-size:12px;margin:6px 0 0">' + escape(item.Notes) + '</p>' : '') + '</div><button type="button" class="btn btn-sm btn-secondary" data-edit="' + escape(item.ID) + '">ویرایش / نسخه جدید</button></article>';
      }).join('') + '</div>';
    }
    function renderHistory() {
      historyRoot.innerHTML = history.length ? '<div style="display:grid;gap:6px">' + history.slice(0, 30).map((row) =>
        '<div style="border-bottom:1px solid var(--color-border);padding:8px 0;font-size:12px;display:flex;gap:10px;flex-wrap:wrap"><strong>' + escape(row.ItemName || row.MaterialNeedID || 'محاسبه') + '</strong><span>تعداد مبنا: ' + escape(row.BasisQuantity) + '</span><span>نیاز: ' + escape(row.CalculatedQuantity) + '</span><span>اختلاف: ' + escape(row.VarianceQuantity) + '</span><span>' + escape(row.CreatedAt || '') + '</span></div>'
      ).join('') + '</div>' : '<p class="table-empty">هنوز محاسبه‌ای ثبت نشده است.</p>';
    }

    modal.addEventListener('click', async (event) => {
      if (event.target.closest('[data-close]')) { modal.remove(); return; }
      if (event.target.closest('#ms-reset')) { resetForm(); return; }
      if (event.target.closest('#material-specs-estimate')) {
        const estimateButton = modal.querySelector('#material-specs-estimate');
        const estimateResult = modal.querySelector('#material-specs-estimate-result');
        estimateButton.disabled = true;
        estimateButton.textContent = 'در حال محاسبه...';
        estimateResult.hidden = true;
        try {
          const response = await window.PMS.Api.post('/projects/' + encodeURIComponent(projectId) + '/material-estimates', {});
          const result = unwrap(response) || {};
          const items = Array.isArray(result) ? result : (result && Array.isArray(result.items) ? result.items : []);
          estimateResult.textContent = items.length
            ? 'نیاز برآوردی برای ' + items.length + ' ملزوم ثبت شد. می‌توانید مقدار سفارش را در بخش تدارکات بررسی کنید.'
            : 'محاسبه انجام شد؛ مورد جدیدی برای نمایش برنگشت.';
          estimateResult.hidden = false;
          const refreshed = await window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-calculations');
          history = unwrap(refreshed); history = Array.isArray(history) ? history : [];
          renderHistory();
        } catch (estimateError) {
          estimateResult.textContent = 'محاسبه نیاز برآوردی ناموفق بود: ' + String(estimateError && estimateError.message || estimateError);
          estimateResult.hidden = false;
        } finally {
          estimateButton.disabled = false;
          estimateButton.textContent = 'محاسبه نیاز برآوردی';
        }
        return;
      }
      const edit = event.target.closest('[data-edit]');
      if (edit) {
        const spec = specs.find((item) => String(item.ID) === String(edit.getAttribute('data-edit')));
        if (!spec) return;
        form.elements.specId.value = spec.ID;
        form.elements.ItemName.value = spec.ItemName || '';
        form.elements.Unit.value = spec.Unit || '';
        form.elements.ConsumptionPerUnit.value = spec.ConsumptionPerUnit ?? '';
        form.elements.WastagePercent.value = spec.WastagePercent ?? 0;
        form.elements.EarlyOrderPolicy.value = spec.EarlyOrderPolicy || 'DISABLED';
        form.elements.EarlyOrderQuantity.value = spec.EarlyOrderQuantity || '';
        form.elements.Notes.value = spec.Notes || '';
        modal.querySelector('#material-specs-form-title').textContent = 'ایجاد نسخه جدید از مشخصات';
        modal.querySelector('#ms-save').textContent = 'ثبت نسخه جدید';
        updatePolicy();
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    policy.addEventListener('change', updatePolicy);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.saving === '1') return;
      error.hidden = true;
      const payload = {
        ItemName: form.elements.ItemName.value.trim(),
        Unit: form.elements.Unit.value.trim(),
        ConsumptionPerUnit: Number(form.elements.ConsumptionPerUnit.value),
        WastagePercent: Number(form.elements.WastagePercent.value || 0),
        EarlyOrderPolicy: policy.value,
        EarlyOrderQuantity: policy.value === 'MANUAL_ALLOWED' ? Number(earlyQty.value) : '',
        Notes: form.elements.Notes.value.trim()
      };
      const button = modal.querySelector('#ms-save');
      form.dataset.saving = '1'; button.disabled = true; button.textContent = 'در حال ذخیره...';
      try {
        const id = form.elements.specId.value;
        if (id) await window.PMS.Api.put('/material-specifications/' + encodeURIComponent(id), payload);
        else await window.PMS.Api.post('/projects/' + encodeURIComponent(projectId) + '/material-specifications', payload);
        const refreshed = await Promise.all([
          window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-specifications'),
          window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-calculations').catch(() => ({ data: { items: [] } }))
        ]);
        specs = unwrap(refreshed[0]); specs = Array.isArray(specs) ? specs : [];
        history = unwrap(refreshed[1]); history = Array.isArray(history) ? history : [];
        renderSpecs(); renderHistory(); resetForm();
      } catch (saveError) {
        showError('ذخیره مشخصات ناموفق بود: ' + String(saveError && saveError.message || saveError));
      } finally {
        delete form.dataset.saving; button.disabled = false;
        button.textContent = form.elements.specId.value ? 'ثبت نسخه جدید' : 'ذخیره مشخصات';
      }
    });

    try {
      const result = await Promise.all([
        window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-specifications'),
        window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-calculations').catch(() => ({ data: { items: [] } }))
      ]);
      specs = unwrap(result[0]); specs = Array.isArray(specs) ? specs : [];
      history = unwrap(result[1]); history = Array.isArray(history) ? history : [];
      renderSpecs(); renderHistory();
    } catch (loadError) {
      showError('بارگذاری اطلاعات ناموفق بود: ' + String(loadError && loadError.message || loadError));
    } finally {
      loading.hidden = true;
    }
    updatePolicy();
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest('.project-material-specs-button');
    if (button && button.getAttribute('data-project-id')) {
      open(button.getAttribute('data-project-id'));
    }
  });
})();
