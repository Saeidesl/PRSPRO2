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
        <section><h4>ملزومات تعریف‌شده</h4><p style="font-size:12px;color:var(--color-text-secondary)">مصرف کل پس از ثبت تعداد قطعی تولید، با احتساب ضایعات محاسبه می‌شود.</p><div id="material-specs-list"></div></section>
        <form id="material-specs-form" class="form" style="margin-top:18px;border-top:1px solid var(--color-border);padding-top:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><h4 style="margin:0">تعریف چندتایی ملزومات</h4></div>
          <p style="font-size:12px;color:var(--color-text-secondary);line-height:1.8">هر ردیف یک ملزوم است. می‌توانید چند ردیف را هم‌زمان ثبت کنید یا با «ویرایش / نسخه جدید» یک مشخصه قبلی را برای ایجاد نسخه جدید به ردیف‌ها اضافه کنید.</p>
          <div id="ms-rows" style="display:grid;gap:12px;margin-top:12px"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-primary" id="ms-save" type="submit">ذخیره همه ملزومات</button><button class="btn btn-light" id="ms-reset" type="button">پاک‌کردن ردیف‌ها</button></div>
        </form>
        <section style="margin-top:22px"><h4>تاریخچه محاسبات نیاز قطعی</h4><div id="material-specs-history"></div></section>
      </div>`;
    document.body.appendChild(modal);

    const loading = modal.querySelector('#material-specs-loading');
    const error = modal.querySelector('#material-specs-error');
    const list = modal.querySelector('#material-specs-list');
    const historyRoot = modal.querySelector('#material-specs-history');
    const form = modal.querySelector('#material-specs-form');
    const rowsRoot = modal.querySelector('#ms-rows');
    let specs = [];
    let history = [];

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }
    function renumberRows() {
      const allRows = Array.from(rowsRoot.querySelectorAll('[data-ms-row]'));
      allRows.forEach((row, index) => {
        const title = row.querySelector('[data-ms-row-title]');
        if (title) title.textContent = 'ملزوم ' + (index + 1);
        const remove = row.querySelector('[data-ms-remove]');
        if (remove) remove.disabled = allRows.length <= 1;
      });
    }
    function addRow(item) {
      item = item || {};
      const row = document.createElement('article');
      row.setAttribute('data-ms-row', '1');
      row.style.cssText = 'border:1px solid var(--color-border);border-radius:10px;padding:14px;background:var(--color-surface-alt,var(--color-surface));';
      row.innerHTML = '<input type="hidden" name="specId">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px"><strong data-ms-row-title>ملزوم</strong><button type="button" class="btn btn-light" data-ms-remove>حذف ردیف</button></div>' +
        '<div class="form-row"><div class="form-group"><label>نام ملزوم *</label><input name="ItemName" maxlength="160" required></div>' +
        '<div class="form-group"><label>واحد اندازه‌گیری *</label><select name="Unit" required><option value="عدد">عدد</option><option value="متر">متر</option><option value="سانتی‌متر">سانتی‌متر</option><option value="میلی‌متر">میلی‌متر</option><option value="مترمربع">مترمربع</option><option value="کیلوگرم">کیلوگرم</option><option value="گرم">گرم</option><option value="لیتر">لیتر</option><option value="میلی‌لیتر">میلی‌لیتر</option><option value="رول">رول</option><option value="بسته">بسته</option><option value="جفت">جفت</option><option value="دست">دست</option><option value="یارد">یارد</option></select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>مصرف برای هر واحد محصول *</label><input name="ConsumptionPerUnit" type="number" min="0.0001" step="0.0001" required></div>' +
        '<div class="form-group"><label>ضایعات مجاز (%)</label><input name="WastagePercent" type="number" min="0" max="100" step="0.1" value="0"></div></div>' +
        '<div class="form-group"><label>توضیحات</label><textarea name="Notes" rows="2" maxlength="500"></textarea></div>' +
        '<div style="display:flex;justify-content:flex-start;margin-top:8px"><button type="button" class="btn btn-secondary" data-add-next>+ افزودن ردیف بعدی</button></div>';
      const value = (name) => row.querySelector('[name="' + name + '"]');
      value('specId').value = item.ID || item.specId || '';
      value('ItemName').value = item.ItemName || '';
      const unit = value('Unit');
      if (item.Unit && !Array.from(unit.options).some((option) => option.value === String(item.Unit))) {
        const legacy = document.createElement('option');
        legacy.value = item.Unit; legacy.textContent = item.Unit + ' (واحد قدیمی)'; legacy.dataset.legacyUnit = '1';
        unit.appendChild(legacy);
      }
      unit.value = item.Unit || 'عدد';
      value('ConsumptionPerUnit').value = item.ConsumptionPerUnit == null ? '' : item.ConsumptionPerUnit;
      value('WastagePercent').value = item.WastagePercent == null ? 0 : item.WastagePercent;
      value('Notes').value = item.Notes || '';
      row.querySelector('[data-ms-remove]').addEventListener('click', () => {
        if (rowsRoot.querySelectorAll('[data-ms-row]').length <= 1) {
          showError('حداقل یک ردیف باید باقی بماند.');
          return;
        }
        row.remove(); renumberRows();
      });
      row.querySelector('[data-add-next]').addEventListener('click', () => {
        const nextRow = addRow({});
        nextRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nextRow.querySelector('[name="ItemName"]').focus();
      });
      rowsRoot.appendChild(row);
      renumberRows();
      return row;
    }
    function resetForm() {
      rowsRoot.innerHTML = '';
      addRow({});
      modal.querySelector('#ms-save').textContent = 'ذخیره همه ملزومات';
      error.hidden = true;
    }
    function renderSpecs() {
      if (!specs.length) {
        list.innerHTML = '<p class="table-empty">هنوز مشخصات مصرفی تعریف نشده است.</p>';
        return;
      }
      list.innerHTML = '<div style="display:grid;gap:8px">' + specs.map((item) => {
        return '<article style="border:1px solid var(--color-border);border-radius:10px;padding:12px;display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap">' +
          '<div style="min-width:0;flex:1"><strong>' + escape(item.ItemName) + '</strong><div style="font-size:12px;margin-top:6px;color:var(--color-text-secondary)">مصرف هر واحد: ' + escape(item.ConsumptionPerUnit) + ' ' + escape(item.Unit) + ' · ضایعات: ' + escape(item.WastagePercent || 0) + '%</div><div style="font-size:12px;margin-top:4px">نسخه ' + escape(item.Revision || 1) + '</div>' + (item.Notes ? '<p style="font-size:12px;margin:6px 0 0">' + escape(item.Notes) + '</p>' : '') + '</div><button type="button" class="btn btn-sm btn-secondary" data-edit="' + escape(item.ID) + '">ویرایش / نسخه جدید</button></article>';
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
      const edit = event.target.closest('[data-edit]');
      if (edit) {
        const spec = specs.find((item) => String(item.ID) === String(edit.getAttribute('data-edit')));
        if (!spec) return;
        const row = addRow(spec);
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.querySelector('[name="ItemName"]').focus();
      }
    });
    addRow({});
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.saving === '1') return;
      error.hidden = true;
      const rowNodes = Array.from(rowsRoot.querySelectorAll('[data-ms-row]'));
      const entries = rowNodes.map((row) => {
        const get = (name) => row.querySelector('[name="' + name + '"]').value.trim();
        const unitSelect = row.querySelector('[name="Unit"]');
        const payload = {
          ItemName: get('ItemName'),
          ConsumptionPerUnit: Number(get('ConsumptionPerUnit')),
          WastagePercent: Number(get('WastagePercent') || 0),
          Notes: get('Notes')
        };
        const selectedOption = unitSelect.options[unitSelect.selectedIndex];
        if (!(selectedOption && selectedOption.dataset.legacyUnit === '1' && get('specId'))) payload.Unit = unitSelect.value.trim();
        return { row, id: get('specId'), unitValue: unitSelect.value.trim(), payload };
      });
      const seen = new Set();
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i], p = entry.payload;
        if (!p.ItemName || !entry.unitValue || !Number.isFinite(p.ConsumptionPerUnit) || p.ConsumptionPerUnit <= 0 ||
            !Number.isFinite(p.WastagePercent) || p.WastagePercent < 0 || p.WastagePercent > 100) {
          showError('ردیف ' + (i + 1) + ': نام، واحد، مصرف مثبت و درصد ضایعات بین صفر تا ۱۰۰ را بررسی کنید.');
          entry.row.scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
        }
        const key = (p.ItemName + '|' + entry.unitValue).toLocaleLowerCase('fa');
        if (seen.has(key)) {
          showError('نام و واحد اندازه‌گیری یکسان را در چند ردیف تکرار نکنید.');
          entry.row.scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
        }
        seen.add(key);
      }
      const button = modal.querySelector('#ms-save');
      form.dataset.saving = '1'; button.disabled = true;
      form.querySelectorAll('[data-ms-remove], [data-add-next]').forEach((control) => { control.disabled = true; });
      let savedCount = 0;
      try {
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          button.textContent = 'در حال ذخیره ' + (i + 1) + ' از ' + entries.length + '...';
          if (entry.id) await window.PMS.Api.put('/material-specifications/' + encodeURIComponent(entry.id), entry.payload);
          else await window.PMS.Api.post('/projects/' + encodeURIComponent(projectId) + '/material-specifications', entry.payload);
          savedCount += 1;
        }
        const refreshed = await Promise.all([
          window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-specifications'),
          window.PMS.Api.get('/projects/' + encodeURIComponent(projectId) + '/material-calculations').catch(() => ({ data: { items: [] } }))
        ]);
        specs = unwrap(refreshed[0]); specs = Array.isArray(specs) ? specs : [];
        history = unwrap(refreshed[1]); history = Array.isArray(history) ? history : [];
        renderSpecs(); renderHistory(); resetForm();
      } catch (saveError) {
        showError('ذخیره ' + savedCount + ' از ' + entries.length + ' ردیف انجام شد؛ ذخیره بقیه ناموفق بود: ' + String(saveError && saveError.message || saveError) + '. ردیف‌ها را بررسی کنید و دوباره تلاش کنید.');
      } finally {
        delete form.dataset.saving; button.disabled = false;
        form.querySelectorAll('[data-ms-remove], [data-add-next]').forEach((control) => { control.disabled = false; });
        button.textContent = 'ذخیره همه ملزومات';
        renumberRows();
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
  }

  window.PMS = window.PMS || {};
  window.PMS.MaterialPlanning = window.PMS.MaterialPlanning || {};
  window.PMS.MaterialPlanning.open = open;

  document.addEventListener('click', function (event) {
    const button = event.target.closest('.project-material-specs-button');
    if (button && button.getAttribute('data-project-id')) {
      open(button.getAttribute('data-project-id'));
    }
  });
})();
