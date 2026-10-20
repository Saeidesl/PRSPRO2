(function () {
  'use strict';
  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};
  const Report = {
    projects: [], events: [], needs: [], orders: [], receipts: [],
    init() {
      this.$('pr-project-search').addEventListener('input', () => this.renderProjectOptions());
      this.$('pr-project').addEventListener('change', () => this.selectProject());
      this.$('pr-generate').addEventListener('click', () => this.generate());
      this.$('pr-print').addEventListener('click', () => window.print());
      this.loadProjects();
      this.addStyles();
    },
    $(id) { return document.getElementById(id); },
    data(response) { return window.PMS.Api.extractData(response); },
    array(value) {
      if (Array.isArray(value)) return value;
      if (value && Array.isArray(value.items)) return value.items;
      if (value && Array.isArray(value.projects)) return value.projects;
      if (value && Array.isArray(value.events)) return value.events;
      if (value && Array.isArray(value.data)) return value.data;
      return [];
    },
    async get(path) { return this.data(await window.PMS.Api.get(path)); },
    async loadProjects() {
      try {
        const result = await this.get('/projects');
        this.projects = this.array(result);
        this.renderProjectOptions();
      } catch (error) { this.error('دریافت فهرست پروژه‌ها ناموفق بود. ممکن است دسترسی مشاهده پروژه‌ها لازم باشد.'); }
    },
    renderProjectOptions() {
      const query = (this.$('pr-project-search').value || '').trim().toLocaleLowerCase();
      const select = this.$('pr-project'), previous = select.value;
      const rows = this.projects.filter(p => [p.ProjectCode,p.Title,p.Name,p.ID].some(v => String(v || '').toLocaleLowerCase().includes(query)));
      select.innerHTML = '<option value="">انتخاب پروژه...</option>' + rows.map(p => '<option value="' + this.esc(p.ID || p.Id || p.id) + '">' + this.esc((p.ProjectCode || p.Code || 'بدون کد') + ' — ' + (p.Title || p.Name || 'بدون عنوان')) + '</option>').join('');
      if (rows.some(p => String(p.ID || p.Id || p.id) === previous)) select.value = previous;
    },
    async selectProject() {
      this.$('pr-preview').hidden = true;
      this.$('pr-print').disabled = true;
      this.$('pr-generate').disabled = !this.$('pr-project').value;
      this.$('pr-event-picker').hidden = true;
      this.$('pr-events-list').innerHTML = '';
      if (!this.$('pr-project').value) return;
      this.error('');
      const id = this.$('pr-project').value;
      try {
        const [events, needs, orders] = await Promise.all([
          this.get('/projects/' + encodeURIComponent(id) + '/events'),
          this.optional('/procurement/needs'),
          this.optional('/procurement/orders')
        ]);
        this.events = this.array(events);
        this.needs = this.array(needs).filter(x => String(x.ProjectID || '') === String(id));
        this.orders = this.array(orders).filter(x => String(x.ProjectID || '') === String(id) || (Array.isArray(x.Items) && x.Items.some(i => String(i.ProjectID || x.ProjectID || '') === String(id))));
        this.renderEvents();
      } catch (error) { this.error('دریافت رویدادهای پروژه انجام نشد: ' + (error.message || 'خطای نامشخص')); }
    },
    async optional(path) { try { return await this.get(path); } catch (e) { return []; } },
    renderEvents() {
      const host = this.$('pr-events-list');
      host.innerHTML = this.events.length ? this.events.map((e,i) => {
        const id = e.ID || e.Id || e.id;
        const type = e.EventTypeName || e.TypeName || e.EventTypeID || 'رویداد';
        const title = e.Title || e.Description || e.Notes || type;
        const date = e.OccurredAt || e.CreatedAt || '';
        return '<label class="pr-event-choice"><input type="checkbox" value="' + this.esc(id) + '" checked><span><strong>' + this.esc(type) + '</strong><br>' + this.esc(title) + '<small>' + this.esc(date) + '</small></span></label>';
      }).join('') : '<p>برای این پروژه رویدادی پیدا نشد.</p>';
      this.$('pr-event-picker').hidden = false;
    },
    generate() {
      const projectId = this.$('pr-project').value;
      const project = this.projects.find(p => String(p.ID || p.Id || p.id) === projectId);
      if (!project) return;
      const selectedIds = Array.from(this.$('pr-events-list').querySelectorAll('input:checked')).map(x => x.value);
      const events = this.events.filter(e => selectedIds.includes(String(e.ID || e.Id || e.id)));
      const showStaff = this.$('pr-show-staff').checked, showEvents = this.$('pr-show-events').checked, showSupplies = this.$('pr-show-supplies').checked;
      const staffRows = this.staffFromEvents(events);
      const eventRows = events.map(e => '<tr><td>' + this.esc(e.EventTypeName || e.TypeName || e.EventTypeID || '—') + '</td><td>' + this.esc(e.Title || e.Description || '—') + '</td><td>' + this.esc(e.DepartmentName || e.UnitName || e.DepartmentID || '—') + '</td><td>' + this.esc(e.CreatedByName || e.UserName || e.CreatedBy || '—') + '</td><td>' + this.esc(e.OccurredAt || e.CreatedAt || '—') + '</td></tr>').join('');
      const supplyRows = this.needs.map(n => '<tr><td>' + this.esc(n.ItemName || '—') + '</td><td>' + this.esc((n.RequestedQuantity ?? '—') + ' ' + (n.Unit || '')) + '</td><td>' + this.esc(n.CreatedAt || n.OrderedAt || '—') + '</td><td>' + this.esc(n.ReceivedAt || n.DeliveredAt || 'در داده نیاز ثبت نشده') + '</td><td>' + this.esc(n.Status || '—') + '</td></tr>').join('') || '<tr><td colspan="5">اطلاعات نیازهای ملزومات پروژه در دسترس نیست یا برای این پروژه ثبت نشده است.</td></tr>';
      this.$('pr-preview').innerHTML = '<article class="pr-paper" id="pr-paper"><header class="pr-head"><div><div class="pr-company">مدیریت تولید پوشاک</div><small>گزارش سوابق پروژه</small></div><div class="pr-doc-title"><h1>گزارش از پروژه‌ها</h1><span>تاریخ تهیه: ' + this.esc(new Date().toLocaleDateString('fa-IR')) + '</span></div></header>' +
        '<section class="pr-section"><h2>اطلاعات کلی پروژه</h2><div class="pr-summary"><div><small>کد پروژه</small><strong>' + this.esc(project.ProjectCode || project.Code || '—') + '</strong></div><div><small>عنوان پروژه</small><strong>' + this.esc(project.Title || project.Name || '—') + '</strong></div><div><small>تعداد کل</small><strong>' + this.esc(project.Quantity ?? project.TotalQuantity ?? '—') + '</strong></div><div><small>وضعیت</small><strong>' + this.esc(project.Status || '—') + '</strong></div><div><small>تاریخ ایجاد</small><strong>' + this.esc(project.CreatedAt || '—') + '</strong></div><div><small>مرحله فعلی</small><strong>' + this.esc(project.CurrentStepName || project.CurrentStage || project.CurrentStepID || '—') + '</strong></div></div></section>' +
        (showStaff ? '<section class="pr-section"><h2>اپراتورها و مسئولان بخش‌ها</h2><table><thead><tr><th>واحد / بخش</th><th>اپراتور / ثبت‌کننده</th><th>تاریخ فعالیت</th></tr></thead><tbody>' + (staffRows || '<tr><td colspan="3">نام اپراتورها در داده‌های رویدادهای انتخاب‌شده موجود نیست.</td></tr>') + '</tbody></table></section>' : '') +
        (showEvents ? '<section class="pr-section"><h2>رویدادهای منتخب</h2><table><thead><tr><th>نوع رویداد</th><th>شرح</th><th>واحد</th><th>ثبت‌کننده</th><th>تاریخ</th></tr></thead><tbody>' + (eventRows || '<tr><td colspan="5">رویدادی انتخاب نشده است.</td></tr>') + '</tbody></table></section>' : '') +
        (showSupplies ? '<section class="pr-section"><h2>تأمین ملزومات پروژه</h2><table><thead><tr><th>قلم</th><th>مقدار</th><th>تاریخ ثبت نیاز</th><th>تاریخ تحویل</th><th>وضعیت</th></tr></thead><tbody>' + supplyRows + '</tbody></table><p class="pr-note">سفارش‌ها و رسیدهای تحویل در صورت وجود داده‌های قابل‌دسترسی اضافه می‌شوند.</p></section>' : '') +
        '<footer class="pr-footer"><span>تهیه‌شده از سامانه مدیریت تولید</span><span>امضا / تأیید: ........................</span></footer></article>';
      this.$('pr-preview').hidden = false; this.$('pr-print').disabled = false;
    },
    staffFromEvents(events) {
      const unique = new Map();
      events.forEach(e => {
        const unit = e.DepartmentName || e.UnitName || e.DepartmentID || '—';
        const person = e.CreatedByName || e.UserName || e.CreatedBy || e.OperatorName || '—';
        const date = e.OccurredAt || e.CreatedAt || '—';
        unique.set(String(unit) + '|' + String(person) + '|' + String(date), '<tr><td>' + this.esc(unit) + '</td><td>' + this.esc(person) + '</td><td>' + this.esc(date) + '</td></tr>');
      });
      return Array.from(unique.values()).join('');
    },
    error(message) { const el=this.$('pr-builder-error'); el.textContent=message; el.hidden=!message; },
    esc(value) { const d=document.createElement('div'); d.textContent=String(value == null || value === '' ? '—' : value); return d.innerHTML; },
    addStyles() {
      if (document.getElementById('pr-report-styles')) return;
      const style=document.createElement('style'); style.id='pr-report-styles';
      style.textContent='.pr-event-choice{display:flex;gap:9px;align-items:flex-start;border:1px solid var(--color-border);border-radius:9px;padding:10px;cursor:pointer}.pr-event-choice small{display:block;color:var(--color-text-secondary);margin-top:4px}.pr-paper{direction:rtl;background:#fff;color:#172b45;border:1px solid #d4dce6;padding:22px;max-width:100%;font-family:Tahoma,Arial,sans-serif}.pr-head{display:flex;justify-content:space-between;gap:16px;border-bottom:2px solid #416787;padding-bottom:14px;margin-bottom:18px}.pr-company{font-size:18px;font-weight:bold}.pr-doc-title{text-align:left}.pr-doc-title h1{font-size:22px;margin:0 0 8px}.pr-section{border:1px solid #a9bfd2;border-radius:7px;overflow:hidden;margin:14px 0;break-inside:avoid}.pr-section h2{background:#416787;color:#fff;font-size:14px;margin:0;padding:9px 12px}.pr-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}.pr-summary div{padding:10px;border-bottom:1px solid #e1e8ef}.pr-summary small{display:block;color:#52677a;margin-bottom:5px}.pr-summary strong{overflow-wrap:anywhere}.pr-paper table{width:100%;border-collapse:collapse;font-size:11px}.pr-paper th,.pr-paper td{border:1px solid #d9e2eb;padding:8px;text-align:right;vertical-align:top}.pr-paper th{background:#eaf1f7}.pr-paper tbody tr:nth-child(even){background:#f6f9fc}.pr-note{font-size:10px;padding:0 10px;color:#52677a}.pr-footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid #c9d5e0;padding-top:12px;font-size:11px}@media(max-width:600px){.pr-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.pr-paper{padding:10px;overflow-x:auto}.pr-paper table{font-size:9px}}@media print{body *{visibility:hidden!important}#pr-paper,#pr-paper *{visibility:visible!important}#pr-paper{position:absolute;inset:0 auto auto 0;width:100%;max-width:none;border:0;padding:8mm;box-sizing:border-box;font-size:10pt}.pr-paper table{font-size:8.5pt}.pr-section{break-inside:avoid}#pr-paper .pr-section h2{print-color-adjust:exact;-webkit-print-color-adjust:exact}.pr-paper th,.pr-paper tbody tr:nth-child(even){print-color-adjust:exact;-webkit-print-color-adjust:exact}}';
      document.head.appendChild(style);
    }
  };
  window.PMS.Modules.ProjectReport = Report;
})();