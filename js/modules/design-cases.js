(function () {
  'use strict';
  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const MODULE = {
    rows: [],
    busy: false,
    statusLabels: {
      DRAFT: 'پیش‌نویس', IN_DESIGN: 'در حال طراحی', PATTERN_MAKING: 'الگوسازی',
      MATERIALS_PENDING: 'در انتظار ملزومات', SAMPLE_SEWING: 'دوخت نمونه',
      REVISION_REQUIRED: 'نیازمند اصلاح', READY_FOR_APPROVAL: 'آماده تأیید',
      REJECTED: 'ردشده', APPROVED: 'تأییدشده / وارد تولید', ARCHIVED: 'بایگانی'
    },
    esc: function (value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);
      });
    },
    data: function (response) {
      return window.PMS.Api.extractData(response);
    },
    init: function () {
      const create = document.getElementById('design-case-create');
      const refresh = document.getElementById('design-case-refresh');
      const search = document.getElementById('design-case-search');
      const filter = document.getElementById('design-case-status-filter');
      if (create) create.addEventListener('click', () => this.openCreate());
      if (refresh) refresh.addEventListener('click', () => this.load(true));
      if (search) search.addEventListener('input', () => this.render());
      if (filter) filter.addEventListener('change', () => this.render());
      this.load();
    },
    feedback: function (message, kind) {
      const target = document.getElementById('design-case-feedback');
      if (!target) return;
      target.className = 'design-case-feedback' + (kind ? ' is-' + kind : '');
      target.textContent = message || '';
    },
    load: async function (fresh) {
      const target = document.getElementById('design-case-list');
      if (!target) return;
      target.innerHTML = '<div class="card"><div class="card-body">در حال دریافت پرونده‌ها...</div></div>';
      this.feedback('');
      try {
        const response = fresh
          ? await window.PMS.Api.get('/design-cases', { retry: false })
          : await window.PMS.Api.get('/design-cases', { retry: false });
        const data = this.data(response);
        this.rows = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
        this.render();
      } catch (error) {
        target.innerHTML = '<div class="card"><div class="card-body"><strong>بارگذاری پرونده‌ها انجام نشد.</strong><p>دسترسی کاربر و اتصال به محیط آزمایشی را بررسی کنید.</p><button type="button" class="btn btn-secondary" id="design-case-retry">تلاش دوباره</button></div></div>';
        const retry = document.getElementById('design-case-retry');
        if (retry) retry.addEventListener('click', () => this.load(true));
        this.feedback(error && error.message ? error.message : 'خطا در دریافت اطلاعات.', 'error');
      }
    },
    render: function () {
      const target = document.getElementById('design-case-list');
      if (!target) return;
      const search = String((document.getElementById('design-case-search') || {}).value || '').trim().toLowerCase();
      const status = String((document.getElementById('design-case-status-filter') || {}).value || '');
      const rows = this.rows.filter((row) => {
        const rowStatus = String(row.Status || row.status || 'DRAFT');
        const haystack = [row.Title, row.title, row.ID, row.Id, row.Description].join(' ').toLowerCase();
        return (!status || status === rowStatus) && (!search || haystack.indexOf(search) !== -1);
      });
      if (!rows.length) {
        target.innerHTML = '<div class="card design-case-empty"><div class="card-body"><div class="design-case-empty-icon" aria-hidden="true">◇</div><h3>پرونده‌ای برای نمایش نیست</h3><p>می‌توانید اولین پرونده طرح را ثبت کنید یا فیلترها را تغییر دهید.</p><button type="button" class="btn btn-primary" id="design-case-empty-create">ایجاد پرونده طرح</button></div></div>';
        const button = document.getElementById('design-case-empty-create');
        if (button) button.addEventListener('click', () => this.openCreate());
        return;
      }
      target.innerHTML = rows.map((row) => {
        const id = row.ID || row.Id || row.id || '';
        const rowStatus = String(row.Status || row.status || 'DRAFT');
        const materials = this.materials(row);
        const createdAt = row.CreatedAt ? new Date(row.CreatedAt) : null;
        const date = createdAt && !isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString('fa-IR') : '—';
        return '<article class="card design-case-card">' +
          '<div class="design-case-card-main"><div class="design-case-card-heading"><h3>' + this.esc(row.Title || row.title || 'بدون عنوان') + '</h3>' +
          '<span class="design-case-status status-' + this.esc(rowStatus.toLowerCase()) + '">' + this.esc(this.statusLabels[rowStatus] || rowStatus) + '</span></div>' +
          '<p class="design-case-description">' + this.esc(row.Description || row.description || 'توضیحی ثبت نشده است.') + '</p>' +
          '<div class="design-case-meta"><span>شناسه: <bdi>' + this.esc(id || '—') + '</bdi></span><span>ملزومات: ' + materials.length + ' قلم</span><span>ثبت: ' + this.esc(date) + '</span></div></div>' +
          '<div class="design-case-card-actions"><button type="button" class="btn btn-secondary" data-design-case-open="' + this.esc(id) + '">مشاهده جزئیات</button></div></article>';
      }).join('');
      target.querySelectorAll('[data-design-case-open]').forEach((button) => {
        button.addEventListener('click', () => this.openDetails(button.getAttribute('data-design-case-open')));
      });
    },
    materials: function (row) {
      let materials = row.RequiredMaterials;
      if (!Array.isArray(materials)) {
        try { materials = JSON.parse(row.RequiredMaterialsJSON || '[]'); } catch (error) { materials = []; }
      }
      return Array.isArray(materials) ? materials : [];
    },
    modal: function (content, title) {
      const root = document.getElementById('design-case-modal-root');
      if (!root) return;
      root.innerHTML = '<div class="design-case-overlay" data-design-case-dismiss><section class="card design-case-dialog" role="dialog" aria-modal="true" aria-label="' + this.esc(title) + '"><header class="design-case-dialog-header"><h3>' + this.esc(title) + '</h3><button type="button" class="design-case-close" aria-label="بستن" data-design-case-close>×</button></header><div class="design-case-dialog-body">' + content + '</div></section></div>';
      root.querySelector('[data-design-case-close]').addEventListener('click', () => { root.innerHTML = ''; });
      root.querySelector('[data-design-case-dismiss]').addEventListener('click', (event) => { if (event.target === event.currentTarget) root.innerHTML = ''; });
      root.querySelector('.design-case-dialog').addEventListener('keydown', (event) => {
        if (event.key === 'Escape') root.innerHTML = '';
      });
    },
    openCreate: function () {
      this.modal(
        '<form id="design-case-create-form">' +
          '<div class="design-case-form-grid"><div class="form-group full"><label for="design-case-title-input">نام طرح <span aria-hidden="true">*</span></label><input id="design-case-title-input" name="Title" maxlength="200" required placeholder="مثلاً مانتو مدل بهار"></div>' +
          '<div class="form-group full"><label for="design-case-description-input">توضیحات</label><textarea id="design-case-description-input" name="Description" rows="3" maxlength="2000" placeholder="توضیحات اولیه طرح و نیازمندی‌ها"></textarea></div></div>' +
          '<div id="design-case-form-feedback" class="design-case-form-feedback" role="alert"></div><div class="design-case-materials-heading"><div><h4>ملزومات اولیه</h4><p>در صورت نیاز اقلام را اضافه کنید.</p></div><button type="button" class="btn btn-secondary" id="design-case-add-material">+ افزودن قلم</button></div>' +
          '<div id="design-case-material-rows"></div><div class="design-case-form-actions"><button type="button" class="btn btn-secondary" data-design-case-close>انصراف</button><button type="submit" class="btn btn-primary" id="design-case-save">ثبت پرونده</button></div></form>',
        'ایجاد پرونده طرح'
      );
      const root = document.getElementById('design-case-modal-root');
      root.querySelectorAll('[data-design-case-close]').forEach((button) => button.addEventListener('click', () => { root.innerHTML = ''; }));
      const rows = root.querySelector('#design-case-material-rows');
      const addRow = () => {
        const row = document.createElement('div');
        row.className = 'design-case-material-row';
        row.innerHTML = '<div class="form-group"><label>نام قلم</label><input data-material-name maxlength="160" placeholder="پارچه، دکمه و..."></div><div class="form-group"><label>واحد</label><input data-material-unit maxlength="40" placeholder="متر، عدد..." ></div><div class="form-group"><label>مقدار</label><input data-material-quantity type="number" min="0.001" step="any" placeholder="0"></div><div class="form-group"><label>توضیحات</label><input data-material-description maxlength="500" placeholder="اختیاری"></div><button type="button" class="btn btn-ghost" data-material-remove aria-label="حذف قلم">حذف</button>';
        row.querySelector('[data-material-remove]').addEventListener('click', () => row.remove());
        rows.appendChild(row);
      };
      root.querySelector('#design-case-add-material').addEventListener('click', addRow);
      root.querySelector('#design-case-create-form').addEventListener('submit', (event) => this.submitCreate(event));
      root.querySelector('#design-case-title-input').focus();
    },
    submitCreate: async function (event) {
      event.preventDefault();
      if (this.busy) return;
      const form = event.currentTarget;
      const root = document.getElementById('design-case-modal-root');
      const save = root.querySelector('#design-case-save');
      const materials = [];
      let invalid = false;
      root.querySelectorAll('.design-case-material-row').forEach((row) => {
        const name = row.querySelector('[data-material-name]').value.trim();
        const unit = row.querySelector('[data-material-unit]').value.trim();
        const quantityText = row.querySelector('[data-material-quantity]').value;
        const description = row.querySelector('[data-material-description]').value.trim();
        if (!name && !unit && !quantityText && !description) return;
        const quantity = Number(quantityText);
        if (!name || !unit || !quantityText || !Number.isFinite(quantity) || quantity <= 0) {
          invalid = true;
          return;
        }
        materials.push({ ItemName: name, Unit: unit, RequiredQuantity: quantity, Description: description });
      });
      if (invalid) {
        const inlineFeedback = root.querySelector('#design-case-form-feedback');
        if (inlineFeedback) inlineFeedback.textContent = 'برای هر قلم ملزومات، نام، واحد و مقدار مثبت را کامل کنید.';
        return;
      }
      const body = {
        Title: form.elements.Title.value.trim(),
        Description: form.elements.Description.value.trim(),
        RequiredMaterials: materials,
        IdempotencyKey: this.uuid()
      };
      this.busy = true;
      save.disabled = true;
      save.textContent = 'در حال ثبت...';
      try {
        const response = await window.PMS.Api.post('/design-cases', body, { retry: false });
        const created = this.data(response);
        window.PMS.Api.invalidateMany(['design-cases', 'projects']);
        root.innerHTML = '';
        this.feedback('پرونده طرح با موفقیت ثبت شد.', 'success');
        await this.load(true);
        const id = created && (created.ID || created.Id || created.id);
        if (id) await this.openDetails(id);
      } catch (error) {
        const inlineFeedback = root.querySelector('#design-case-form-feedback');
        if (inlineFeedback) inlineFeedback.textContent = error && error.message ? error.message : 'ثبت پرونده انجام نشد.';
        save.disabled = false;
        save.textContent = 'تلاش دوباره';
      } finally {
        this.busy = false;
      }
    },
    uuid: function () {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
      return 'dc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    },
    openDetails: async function (id) {
      if (!id) return;
      this.modal('<p>در حال دریافت جزئیات پرونده...</p>', 'جزئیات پرونده طرح');
      try {
        const response = await window.PMS.Api.get('/design-cases/' + encodeURIComponent(id), { retry: false });
        const row = this.data(response) || {};
        const materials = this.materials(row);
        const status = String(row.Status || 'DRAFT');
        const history = Array.isArray(row.History) ? row.History : [];
        const materialsHtml = materials.length ? '<div class="design-case-detail-materials">' + materials.map((item) =>
          '<div class="design-case-detail-material"><strong>' + this.esc(item.ItemName || item.name || '—') + '</strong><span>' +
          this.esc(item.RequiredQuantity !== undefined ? item.RequiredQuantity : item.quantity) + ' ' + this.esc(item.Unit || item.unit || '') +
          '</span><small>' + this.esc(item.Description || item.description || '') + '</small></div>').join('') + '</div>' :
          '<p class="design-case-muted">ملزوماتی برای این پرونده ثبت نشده است.</p>';
        const historyHtml = history.length ? '<ol class="design-case-history">' + history.map((item) =>
          '<li><strong>' + this.esc(item.Action || 'تغییر') + '</strong><span>' + this.esc(this.statusLabels[item.ToStatus] || item.ToStatus || '') +
          '</span><small>' + this.esc(item.CreatedAt || '') + '</small></li>').join('') + '</ol>' :
          '<p class="design-case-muted">سابقه‌ای ثبت نشده است.</p>';
        this.modal('<div class="design-case-detail-summary"><span class="design-case-status status-' + this.esc(status.toLowerCase()) + '">' +
          this.esc(this.statusLabels[status] || status) + '</span><h4>' + this.esc(row.Title || 'بدون عنوان') + '</h4><p>' +
          this.esc(row.Description || 'توضیحی ثبت نشده است.') + '</p><div class="design-case-detail-id">شناسه: <bdi>' + this.esc(row.ID || id) + '</bdi></div></div>' +
          '<h4>ملزومات</h4>' + materialsHtml + '<h4>تاریخچه</h4>' + historyHtml +
          (status === 'READY_FOR_APPROVAL' ? '<div class="design-case-note">این پرونده آماده تأیید است؛ فرم اتصال به تولید در مرحله بعدی تکمیل می‌شود.</div>' : ''),
          'جزئیات پرونده طرح');
      } catch (error) {
        this.modal('<div class="alert alert-danger">' + this.esc(error && error.message ? error.message : 'دریافت جزئیات انجام نشد.') + '</div>', 'جزئیات پرونده طرح');
      }
    }
  };
  window.PMS.Modules.DesignCases = MODULE;
})();