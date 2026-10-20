(function () {
  'use strict';
  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const TEMPLATE_KEY = 'pms.projectReportTemplate.v1';
  const Report = {
    projects: [],
    events: [],
    needs: [],

    init() {
      const on = (id, event, handler) => {
        const el = this.$(id);
        if (el) el.addEventListener(event, handler);
      };
      on('pr-project-search', 'input', () => this.renderProjectOptions());
      on('pr-project', 'change', () => this.selectProject());
      on('pr-generate', 'click', () => this.generate());
      on('pr-print', 'click', () => window.print());
      on('pr-select-all-events', 'click', () => this.setEventSelection(true));
      on('pr-clear-events', 'click', () => this.setEventSelection(false));
      on('pr-save-template', 'click', () => this.saveTemplate());
      on('pr-load-template', 'click', () => this.loadTemplate());
      this.addStyles();
      this.loadProjects();
    },

    $(id) { return document.getElementById(id); },
    data(response) { return window.PMS.Api.extractData(response); },
    async get(path) { return this.data(await window.PMS.Api.get(path)); },

    array(value) {
      if (Array.isArray(value)) return value;
      if (value && Array.isArray(value.items)) return value.items;
      if (value && Array.isArray(value.projects)) return value.projects;
      if (value && Array.isArray(value.events)) return value.events;
      if (value && Array.isArray(value.data)) return value.data;
      return [];
    },

    idOf(item) { return String(item.ID || item.Id || item.id || ''); },

    async loadProjects() {
      try {
        const result = await this.get('/projects');
        this.projects = this.array(result);
        this.renderProjectOptions();
      } catch (error) {
        this.error('دریافت فهرست پروژه‌ها ناموفق بود. دسترسی مشاهده پروژه‌ها را بررسی کنید.');
      }
    },

    renderProjectOptions() {
      const search = (this.$('pr-project-search').value || '').trim().toLocaleLowerCase();
      const select = this.$('pr-project');
      const previous = select.value;
      const rows = this.projects.filter(project =>
        [project.ProjectCode, project.Code, project.Title, project.Name, project.ID]
          .some(value => String(value || '').toLocaleLowerCase().includes(search))
      );
      select.innerHTML = '<option value="">انتخاب پروژه...</option>' + rows.map(project =>
        '<option value="' + this.esc(this.idOf(project)) + '">' +
        this.esc((project.ProjectCode || project.Code || 'بدون کد') + ' — ' +
        (project.Title || project.Name || 'بدون عنوان')) + '</option>'
      ).join('');
      if (rows.some(project => this.idOf(project) === previous)) select.value = previous;
    },

    async selectProject() {
      this.$('pr-preview').hidden = true;
      this.$('pr-print').disabled = true;
      this.$('pr-generate').disabled = !this.$('pr-project').value;
      this.$('pr-event-picker').hidden = true;
      this.$('pr-events-list').innerHTML = '';
      this.events = [];
      this.needs = [];
      if (!this.$('pr-project').value) return;

      this.error('');
      const projectId = this.$('pr-project').value;
      try {
        const results = await Promise.all([
          this.get('/projects/' + encodeURIComponent(projectId) + '/events'),
          this.optional('/procurement/needs')
        ]);
        this.events = this.array(results[0]);
        this.needs = this.array(results[1]).filter(item =>
          String(item.ProjectID || item.projectId || '') === String(projectId)
        );
        this.renderEvents();
      } catch (error) {
        this.error('دریافت رویدادهای پروژه انجام نشد: ' + (error.message || 'خطای نامشخص'));
      }
    },

    async optional(path) {
      try { return await this.get(path); } catch (error) { return []; }
    },

    renderEvents() {
      const host = this.$('pr-events-list');
      if (!this.events.length) {
        host.innerHTML = '<p class="form-help">برای این پروژه رویدادی پیدا نشد.</p>';
      } else {
        host.innerHTML = this.events.map(event => {
          const id = this.idOf(event);
          const type = event.EventTypeName || event.TypeName || event.EventTypeID || 'رویداد';
          const description = event.Title || event.Description || event.Notes || type;
          const date = event.OccurredAt || event.CreatedAt || 'تاریخ ثبت نشده';
          return '<label class="pr-event-choice"><input type="checkbox" value="' + this.esc(id) +
            '" checked><span><strong>' + this.esc(type) + '</strong><span>' +
            this.esc(description) + '</span><small>' + this.esc(date) +
            '</small></span></label>';
        }).join('');
      }
      this.$('pr-event-picker').hidden = false;
    },

    setEventSelection(checked) {
      this.$('pr-events-list').querySelectorAll('input[type="checkbox"]')
        .forEach(input => { input.checked = checked; });
    },

    selectedEvents() {
      const selected = new Set(Array.from(
        this.$('pr-events-list').querySelectorAll('input[type="checkbox"]:checked')
      ).map(input => input.value));
      return this.events.filter(event => selected.has(this.idOf(event)));
    },

    fields() {
      const definitions = [
        ['pr-col-type', 'نوع رویداد', event => event.EventTypeName || event.TypeName || event.EventTypeID || '—'],
        ['pr-col-description', 'شرح', event => event.Title || event.Description || event.Notes || '—'],
        ['pr-col-unit', 'واحد', event => event.DepartmentName || event.UnitName || event.DepartmentID || '—'],
        ['pr-col-person', 'ثبت‌کننده', event => event.CreatedByName || event.UserName || event.CreatedBy || event.OperatorName || '—'],
        ['pr-col-date', 'تاریخ', event => event.OccurredAt || event.CreatedAt || '—']
      ];
      return definitions.filter(item => this.$(item[0]).checked)
        .map(item => ({ label: item[1], value: item[2] }));
    },

    generate() {
      const projectId = this.$('pr-project').value;
      const project = this.projects.find(item => this.idOf(item) === projectId);
      if (!project) return;

      const events = this.selectedEvents();
      const layout = this.$('pr-layout').value;
      const title = (this.$('pr-title').value || '').trim() || 'گزارش از پروژه‌ها';
      const showSummary = this.$('pr-show-summary').checked;
      const showStaff = this.$('pr-show-staff').checked;
      const showEvents = this.$('pr-show-events').checked;
      const showSupplies = this.$('pr-show-supplies').checked;
      const fields = this.fields();

      const summary = '<section class="pr-section"><h2>اطلاعات کلی پروژه</h2><div class="pr-summary">' +
        this.summaryItem('کد پروژه', project.ProjectCode || project.Code) +
        this.summaryItem('عنوان پروژه', project.Title || project.Name) +
        this.summaryItem('تعداد کل', project.Quantity ?? project.TotalQuantity) +
        this.summaryItem('وضعیت', this.statusLabel(project.Status)) +
        this.summaryItem('تاریخ ایجاد', project.CreatedAt) +
        this.summaryItem('مرحله فعلی', project.CurrentStepName || project.CurrentStage || project.CurrentStepID) +
        '</div></section>';

      const staffRows = this.staffFromEvents(events);
      const staff = '<section class="pr-section"><h2>اپراتورها و مسئولان بخش‌ها</h2><table><thead><tr><th>واحد / بخش</th><th>اپراتور / ثبت‌کننده</th><th>تاریخ فعالیت</th></tr></thead><tbody>' +
        (staffRows || '<tr><td colspan="3">اطلاعات اپراتورها در رویدادهای منتخب موجود نیست.</td></tr>') +
        '</tbody></table></section>';

      let eventContent = '';
      if (layout === 'timeline') {
        eventContent = this.timeline(events, fields);
      } else {
        eventContent = this.eventTable(events, fields);
      }
      const eventSection = '<section class="pr-section"><h2>رویدادهای منتخب (' + events.length + ')</h2>' +
        eventContent + '</section>';

      const supplies = this.supplyTable();
      const header = '<header class="pr-head"><div><div class="pr-company">مدیریت تولید پوشاک</div><small>گزارش سوابق پروژه</small></div>' +
        '<div class="pr-doc-title"><h1>' + this.esc(title) + '</h1><span>تاریخ تهیه: ' +
        this.esc(new Date().toLocaleDateString('fa-IR')) + '</span></div></header>';

      let body = '';
      if (showSummary) body += summary;
      if (showStaff) body += staff;
      if (showEvents) body += eventSection;
      if (showSupplies) body += supplies;

      const modeClass = layout === 'timeline' ? ' pr-layout-timeline' : (layout === 'table' ? ' pr-layout-table' : '');
      this.$('pr-preview').innerHTML = '<article class="pr-paper' + modeClass + '" id="pr-paper">' +
        header + body + '<footer class="pr-footer"><span>تهیه‌شده از سامانه مدیریت تولید</span>' +
        '<span>امضا / تأیید: ........................</span></footer></article>';
      this.$('pr-preview').hidden = false;
      this.$('pr-print').disabled = false;
    },

    summaryItem(label, value) {
      return '<div><small>' + this.esc(label) + '</small><strong>' + this.esc(value) + '</strong></div>';
    },

    eventTable(events, fields) {
      if (!fields.length) return '<p class="pr-note">حداقل یک ستون از بخش «ستون‌های رویداد» را انتخاب کنید.</p>';
      const headers = fields.map(field => '<th>' + this.esc(field.label) + '</th>').join('');
      const rows = events.map(event => '<tr>' + fields.map(field =>
        '<td>' + this.esc(field.value(event)) + '</td>'
      ).join('') + '</tr>').join('');
      return '<div class="pr-table-wrap"><table><thead><tr>' + headers + '</tr></thead><tbody>' +
        (rows || '<tr><td colspan="' + fields.length + '">رویدادی انتخاب نشده است.</td></tr>') +
        '</tbody></table></div>';
    },

    timeline(events, fields) {
      if (!events.length) return '<p class="pr-note">رویدادی انتخاب نشده است.</p>';
      const sorted = events.slice().sort((a, b) =>
        new Date(a.OccurredAt || a.CreatedAt || 0).getTime() -
        new Date(b.OccurredAt || b.CreatedAt || 0).getTime()
      );
      return '<ol class="pr-timeline">' + sorted.map(event => {
        const details = fields.map(field => '<div><small>' + this.esc(field.label) +
          '</small><span>' + this.esc(field.value(event)) + '</span></div>').join('');
        return '<li><div class="pr-timeline-date">' +
          this.esc(event.OccurredAt || event.CreatedAt || 'تاریخ ثبت نشده') +
          '</div><div class="pr-timeline-card"><strong>' +
          this.esc(event.EventTypeName || event.TypeName || 'رویداد') +
          '</strong>' + details + '</div></li>';
      }).join('') + '</ol>';
    },

    supplyTable() {
      const rows = this.needs.map(item => '<tr><td>' + this.esc(item.ItemName || item.MaterialName || '—') +
        '</td><td>' + this.esc((item.RequestedQuantity ?? item.Quantity ?? '—') + ' ' + (item.Unit || '')) +
        '</td><td>' + this.esc(item.CreatedAt || item.OrderedAt || '—') +
        '</td><td>' + this.esc(item.ReceivedAt || item.DeliveredAt || 'ثبت نشده') +
        '</td><td>' + this.esc(item.Status || '—') + '</td></tr>').join('');
      return '<section class="pr-section"><h2>تأمین ملزومات پروژه</h2><div class="pr-table-wrap"><table>' +
        '<thead><tr><th>قلم</th><th>مقدار</th><th>تاریخ ثبت نیاز</th><th>تاریخ تحویل</th><th>وضعیت</th></tr></thead><tbody>' +
        (rows || '<tr><td colspan="5">نیاز ملزومات قابل‌نمایشی برای این پروژه پیدا نشد یا دسترسی آن موجود نیست.</td></tr>') +
        '</tbody></table></div></section>';
    },

    staffFromEvents(events) {
      const unique = new Map();
      events.forEach(event => {
        const unit = event.DepartmentName || event.UnitName || event.DepartmentID || '—';
        const person = event.CreatedByName || event.UserName || event.CreatedBy || event.OperatorName || '—';
        const date = event.OccurredAt || event.CreatedAt || '—';
        const key = String(unit) + '|' + String(person) + '|' + String(date);
        unique.set(key, '<tr><td>' + this.esc(unit) + '</td><td>' + this.esc(person) +
          '</td><td>' + this.esc(date) + '</td></tr>');
      });
      return Array.from(unique.values()).join('');
    },

    saveTemplate() {
      const config = {
        layout: this.$('pr-layout').value,
        title: this.$('pr-title').value,
        sections: {
          summary: this.$('pr-show-summary').checked,
          staff: this.$('pr-show-staff').checked,
          events: this.$('pr-show-events').checked,
          supplies: this.$('pr-show-supplies').checked
        },
        columns: ['type', 'description', 'unit', 'person', 'date'].reduce((result, key) => {
          result[key] = this.$('pr-col-' + key).checked;
          return result;
        }, {})
      };
      try {
        window.localStorage.setItem(TEMPLATE_KEY, JSON.stringify(config));
        this.templateStatus('تنظیمات گزارش در همین مرورگر ذخیره شد.');
      } catch (error) {
        this.templateStatus('ذخیره تنظیمات در این مرورگر امکان‌پذیر نیست.');
      }
    },

    loadTemplate() {
      try {
        const raw = window.localStorage.getItem(TEMPLATE_KEY);
        if (!raw) {
          this.templateStatus('هنوز تنظیماتی ذخیره نشده است.');
          return;
        }
        const config = JSON.parse(raw);
        if (config.layout) this.$('pr-layout').value = config.layout;
        if (typeof config.title === 'string') this.$('pr-title').value = config.title;
        const sectionMap = { summary: 'pr-show-summary', staff: 'pr-show-staff', events: 'pr-show-events', supplies: 'pr-show-supplies' };
        Object.keys(sectionMap).forEach(key => {
          if (config.sections && typeof config.sections[key] === 'boolean') {
            this.$(sectionMap[key]).checked = config.sections[key];
          }
        });
        ['type', 'description', 'unit', 'person', 'date'].forEach(key => {
          if (config.columns && typeof config.columns[key] === 'boolean') {
            this.$('pr-col-' + key).checked = config.columns[key];
          }
        });
        this.templateStatus('تنظیمات ذخیره‌شده بازیابی شد.');
      } catch (error) {
        this.templateStatus('بازیابی تنظیمات ناموفق بود.');
      }
    },

    templateStatus(message) {
      const element = this.$('pr-template-status');
      if (element) element.textContent = message;
    },

    statusLabel(value) {
      const labels = {
        ACTIVE: 'فعال', COMPLETED: 'تکمیل‌شده', ON_HOLD: 'متوقف',
        CANCELLED: 'لغوشده', INACTIVE: 'غیرفعال'
      };
      return labels[value] || value || '—';
    },

    error(message) {
      const element = this.$('pr-builder-error');
      element.textContent = message;
      element.hidden = !message;
    },

    esc(value) {
      const element = document.createElement('div');
      element.textContent = String(value == null || value === '' ? '—' : value);
      return element.innerHTML;
    },

    addStyles() {
      if (document.getElementById('pr-report-styles')) return;
      const style = document.createElement('style');
      style.id = 'pr-report-styles';
      style.textContent = [
        '#project-report-builder .pr-builder-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-bottom:16px}',
        '#project-report-builder .pr-builder-grid label{display:flex;flex-direction:column;gap:6px;font-weight:600}',
        '#project-report-builder .pr-builder-grid input,#project-report-builder .pr-builder-grid select{width:100%;min-height:40px;padding:8px;border:1px solid var(--color-border,#d5dce5);border-radius:8px;background:var(--color-surface,#fff);color:inherit}',
        '.pr-option-group{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px;margin:12px 0;border:1px solid var(--color-border,#d5dce5);border-radius:10px}',
        '.pr-option-group strong{width:100%}.pr-option-group label{display:inline-flex;align-items:center;gap:6px}',
        '.pr-event-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.pr-event-heading h4{margin:10px 0}',
        '#pr-events-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px}',
        '.pr-event-choice{display:flex;gap:9px;align-items:flex-start;border:1px solid var(--color-border,#d5dce5);border-radius:9px;padding:10px;cursor:pointer}',
        '.pr-event-choice>span{display:flex;flex-direction:column;gap:4px;min-width:0}.pr-event-choice small{color:var(--color-text-secondary,#68778a)}',
        '.pr-builder-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:16px 0}.pr-builder-actions #pr-template-status{font-size:12px}',
        '.pr-paper{direction:rtl;background:#fff;color:#172b45;border:1px solid #d4dce6;padding:22px;max-width:100%;font-family:Tahoma,Arial,sans-serif}',
        '.pr-head{display:flex;justify-content:space-between;gap:16px;border-bottom:2px solid #416787;padding-bottom:14px;margin-bottom:18px}.pr-company{font-size:18px;font-weight:bold}.pr-doc-title{text-align:left;overflow-wrap:anywhere}.pr-doc-title h1{font-size:22px;margin:0 0 8px}',
        '.pr-section{border:1px solid #a9bfd2;border-radius:7px;overflow:hidden;margin:14px 0;break-inside:avoid}.pr-section h2{background:#416787;color:#fff;font-size:14px;margin:0;padding:9px 12px}',
        '.pr-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.pr-summary div{padding:10px;border-bottom:1px solid #e1e8ef;min-width:0}.pr-summary small{display:block;color:#52677a;margin-bottom:5px}.pr-summary strong{overflow-wrap:anywhere}',
        '.pr-table-wrap{overflow-x:auto}.pr-paper table{width:100%;border-collapse:collapse;font-size:11px}.pr-paper th,.pr-paper td{border:1px solid #d9e2eb;padding:8px;text-align:right;vertical-align:top}.pr-paper th{background:#eaf1f7}.pr-paper tbody tr:nth-child(even){background:#f6f9fc}',
        '.pr-timeline{list-style:none;padding:0 18px 0 0;margin:14px}.pr-timeline li{position:relative;border-right:2px solid #8ca9c2;padding:0 18px 18px 0}.pr-timeline li:before{content:"";position:absolute;right:-7px;top:4px;width:12px;height:12px;border-radius:50%;background:#416787}.pr-timeline-date{font-size:11px;color:#52677a;margin-bottom:6px}.pr-timeline-card{border:1px solid #d9e2eb;border-radius:8px;padding:10px}.pr-timeline-card>strong{display:block;margin-bottom:8px}.pr-timeline-card>div{display:flex;gap:8px;margin:4px 0}.pr-timeline-card small{color:#52677a;min-width:70px}.pr-note{font-size:11px;padding:10px;color:#52677a}',
        '.pr-layout-table .pr-head{border-bottom:1px solid #c9d5e0}.pr-layout-table .pr-section{border:0;border-bottom:1px solid #d9e2eb;border-radius:0}.pr-layout-table .pr-section h2{background:#eef3f8;color:#172b45;border-right:4px solid #416787}.pr-layout-table .pr-summary{grid-template-columns:repeat(6,minmax(0,1fr))}.pr-layout-table .pr-paper table{font-size:10px}.pr-footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid #c9d5e0;padding-top:12px;font-size:11px}',
        '@media(max-width:600px){.pr-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.pr-paper{padding:10px}.pr-head{flex-direction:column}.pr-doc-title{text-align:right}.pr-paper table{font-size:9px}}',
        '@media print{body *{visibility:hidden!important}#pr-paper,#pr-paper *{visibility:visible!important}#pr-paper{position:absolute;inset:0 auto auto 0;width:100%;max-width:none;border:0;padding:8mm;box-sizing:border-box;font-size:10pt}.pr-paper table{font-size:8.5pt}.pr-section{break-inside:avoid}#pr-paper .pr-section h2{print-color-adjust:exact;-webkit-print-color-adjust:exact}.pr-paper th,.pr-paper tbody tr:nth-child(even){print-color-adjust:exact;-webkit-print-color-adjust:exact}}'
      ].join('');
      document.head.appendChild(style);
    }
  };

  window.PMS.Modules.ProjectReport = Report;
})();