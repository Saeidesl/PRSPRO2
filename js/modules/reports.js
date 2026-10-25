(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const Reports = {
    currentReport: null,
    selectedEventIds: [],

    init: function () {
      const select = document.getElementById('project-report-project');
      const loadButton = document.getElementById('project-report-load');
      const printButton = document.getElementById('project-report-print');
      if (!select || select.dataset.bound === '1') return;

      select.dataset.bound = '1';
      if (loadButton) loadButton.addEventListener('click', function () { Reports.loadReport(); });
      if (select) select.addEventListener('change', function () {
        if (loadButton) loadButton.disabled = !select.value;
      });
      if (printButton) printButton.addEventListener('click', function () {
        if (!Reports.currentReport) return;
        window.print();
      });
      this.bindBuilder();
      this.loadProjects();
    },


    bindBuilder: function () {
      ['project-report-event-search', 'project-report-event-from', 'project-report-event-to', 'project-report-event-sort'].forEach(function (id) {
        const control = document.getElementById(id);
        if (!control || control.dataset.bound === '1') return;
        control.dataset.bound = '1';
        control.addEventListener('input', function () { Reports.renderReport(); });
        control.addEventListener('change', function () { Reports.renderReport(); });
      });
      document.querySelectorAll('[data-report-section]').forEach(function (control) {
        if (control.dataset.bound === '1') return;
        control.dataset.bound = '1';
        control.addEventListener('change', function () { Reports.renderReport(); });
      });
      const bindings = [
        ['project-report-template-save', function () { Reports.saveTemplate(); }],
        ['project-report-template-load', function () { Reports.applyTemplate(); }],
        ['project-report-template-delete', function () { Reports.deleteTemplate(); }],
        ['project-report-export-csv', function () { Reports.exportCsv(); }]
      ];
      bindings.forEach(function (item) {
        const button = document.getElementById(item[0]);
        if (!button || button.dataset.bound === '1') return;
        button.dataset.bound = '1';
        button.addEventListener('click', item[1]);
      });
      this.refreshTemplates();
    },

    escape: function (value) {
      return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    unwrap: function (response) {
      let data = response;
      for (let i = 0; i < 3; i++) {
        if (data && !Array.isArray(data) && typeof data === 'object' && data.data !== undefined) {
          data = data.data;
        } else break;
      }
      return data;
    },

    formatDate: function (value) {
      if (!value) return '—';
      const date = new Date(value);
      if (!isFinite(date.getTime())) return this.escape(value);
      try {
        return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }).format(date);
      } catch (error) {
        return date.toLocaleString('fa-IR');
      }
    },

    showMessage: function (message, isError) {
      const status = document.getElementById('project-report-status');
      if (!status) return;
      status.hidden = !message;
      status.textContent = message || '';
      status.className = isError ? 'alert alert-danger' : 'alert alert-info';
    },

    loadProjects: async function () {
      const select = document.getElementById('project-report-project');
      const loadButton = document.getElementById('project-report-load');
      if (!select) return;
      select.disabled = true;
      this.showMessage('در حال دریافت فهرست پروژه‌ها…', false);
      try {
        const response = await PMS.Api.get('/reports/projects');
        const data = this.unwrap(response);
        const projects = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
        select.innerHTML = '<option value="">انتخاب پروژه</option>' + projects.map(function (project) {
          const id = project.ID || project.Id || project.id || '';
          const code = project.ProjectCode || project.Code || id;
          const title = project.Title || project.Name || '';
          return '<option value="' + Reports.escape(id) + '">' +
            Reports.escape(code + (title ? ' — ' + title : '')) + '</option>';
        }).join('');
        this.showMessage(projects.length ? '' : 'پروژه‌ای برای گزارش در دسترس نیست.', !projects.length);
      } catch (error) {
        this.showMessage(error.message || 'دریافت فهرست پروژه‌ها ناموفق بود.', true);
      } finally {
        select.disabled = false;
        if (loadButton) loadButton.disabled = !select.value;
      }
    },

    loadReport: async function () {
      const select = document.getElementById('project-report-project');
      const loadButton = document.getElementById('project-report-load');
      const printButton = document.getElementById('project-report-print');
      const target = document.getElementById('project-report-content');
      if (!select || !select.value || !target) return;

      if (loadButton) { loadButton.disabled = true; loadButton.textContent = 'در حال دریافت…'; }
      if (printButton) printButton.disabled = true;
      target.innerHTML = '<div class="table-state">در حال آماده‌سازی گزارش پروژه…</div>';
      this.showMessage('', false);
      try {
        const response = await PMS.Api.get('/reports/project/' + encodeURIComponent(select.value));
        const data = this.unwrap(response);
        if (!data || !data.project) throw new Error('اطلاعات گزارش از سرور کامل دریافت نشد.');
        this.currentReport = data;
        this.selectedEventIds = (data.events || []).map(function (event) {
          return String(event.ID || event.Id || '');
        }).filter(Boolean);
        this.renderReport();
        if (printButton) printButton.disabled = false;
      } catch (error) {
        this.currentReport = null;
        target.innerHTML = '';
        this.showMessage(error.message || 'ساخت گزارش ناموفق بود.', true);
      } finally {
        if (loadButton) { loadButton.disabled = !select.value; loadButton.textContent = 'ساخت گزارش'; }
      }
    },


    filterEvents: function (events) {
      const query = String((document.getElementById('project-report-event-search') || {}).value || '').trim().toLocaleLowerCase();
      const fromValue = (document.getElementById('project-report-event-from') || {}).value || '';
      const toValue = (document.getElementById('project-report-event-to') || {}).value || '';
      const sort = (document.getElementById('project-report-event-sort') || {}).value || 'newest';
      const from = fromValue ? new Date(fromValue + 'T00:00:00').getTime() : null;
      const to = toValue ? new Date(toValue + 'T23:59:59.999').getTime() : null;
      return events.filter(function (event) {
        const searchable = [event.EventTypeName, event.EventTypeCode, event.Title, event.DepartmentName,
          event.PerformedByName, event.CreatorName, event.Description, event.Notes, event.Remarks]
          .join(' ').toLocaleLowerCase();
        if (query && searchable.indexOf(query) === -1) return false;
        const rawDate = event.OccurredAt || event.CreatedAt;
        const timestamp = rawDate ? new Date(rawDate).getTime() : NaN;
        if (from !== null && (!isFinite(timestamp) || timestamp < from)) return false;
        if (to !== null && (!isFinite(timestamp) || timestamp > to)) return false;
        return true;
      }).sort(function (a, b) {
        const aTime = new Date(a.OccurredAt || a.CreatedAt || 0).getTime() || 0;
        const bTime = new Date(b.OccurredAt || b.CreatedAt || 0).getTime() || 0;
        return sort === 'oldest' ? aTime - bTime : bTime - aTime;
      });
    },

    selectedSections: function () {
      const selected = {};
      document.querySelectorAll('[data-report-section]').forEach(function (input) {
        selected[input.getAttribute('data-report-section')] = !!input.checked;
      });
      return selected;
    },

    templateKey: 'pms_project_report_templates_v1',

    readTemplates: function () {
      try {
        const templates = JSON.parse(window.localStorage.getItem(this.templateKey) || '{}');
        return templates && typeof templates === 'object' && !Array.isArray(templates) ? templates : {};
      } catch (error) { return {}; }
    },

    refreshTemplates: function () {
      const select = document.getElementById('project-report-template-list');
      if (!select) return;
      const templates = this.readTemplates();
      const previous = select.value;
      select.innerHTML = '<option value="">انتخاب قالب ذخیره‌شده</option>' +
        Object.keys(templates).sort().map(function (name) {
          return '<option value="' + Reports.escape(name) + '">' + Reports.escape(name) + '</option>';
        }).join('');
      if (Object.prototype.hasOwnProperty.call(templates, previous)) select.value = previous;
    },

    saveTemplate: function () {
      const input = document.getElementById('project-report-template-name');
      const name = String(input && input.value || '').trim();
      if (!name) { this.showMessage('نام قالب را وارد کنید.', true); return; }
      const templates = this.readTemplates();
      templates[name] = {
        sections: this.selectedSections(),
        search: (document.getElementById('project-report-event-search') || {}).value || '',
        from: (document.getElementById('project-report-event-from') || {}).value || '',
        to: (document.getElementById('project-report-event-to') || {}).value || '',
        sort: (document.getElementById('project-report-event-sort') || {}).value || 'newest'
      };
      try {
        window.localStorage.setItem(this.templateKey, JSON.stringify(templates));
        this.refreshTemplates();
        const select = document.getElementById('project-report-template-list');
        if (select) select.value = name;
        this.showMessage('قالب در همین مرورگر ذخیره شد.', false);
      } catch (error) { this.showMessage('ذخیره قالب در مرورگر ممکن نیست.', true); }
    },

    applyTemplate: function () {
      const select = document.getElementById('project-report-template-list');
      const name = select && select.value;
      const config = this.readTemplates()[name];
      if (!config) { this.showMessage('یک قالب ذخیره‌شده انتخاب کنید.', true); return; }
      document.querySelectorAll('[data-report-section]').forEach(function (input) {
        const key = input.getAttribute('data-report-section');
        input.checked = !config.sections || config.sections[key] !== false;
      });
      [['project-report-event-search', config.search || ''],
       ['project-report-event-from', config.from || ''],
       ['project-report-event-to', config.to || ''],
       ['project-report-event-sort', config.sort || 'newest']].forEach(function (item) {
        const input = document.getElementById(item[0]);
        if (input) input.value = item[1];
      });
      this.renderReport();
      this.showMessage('قالب اعمال شد.', false);
    },

    deleteTemplate: function () {
      const select = document.getElementById('project-report-template-list');
      const name = select && select.value;
      if (!name) { this.showMessage('یک قالب ذخیره‌شده انتخاب کنید.', true); return; }
      const templates = this.readTemplates();
      delete templates[name];
      try {
        window.localStorage.setItem(this.templateKey, JSON.stringify(templates));
        this.refreshTemplates();
        this.showMessage('قالب حذف شد.', false);
      } catch (error) { this.showMessage('حذف قالب انجام نشد.', true); }
    },

    exportCsv: function () {
      if (!this.currentReport || !this.currentReport.project) {
        this.showMessage('ابتدا گزارش یک پروژه را بسازید.', true); return;
      }
      const config = this.selectedSections(), project = this.currentReport.project, rows = [['بخش', 'عنوان', 'مقدار']];
      const add = function (section, label, value) { rows.push([section, label, value == null ? '' : String(value)]); };
      if (config.project !== false) {
        [['کد پروژه', project.ProjectCode], ['عنوان', project.Title], ['تعداد', project.Quantity],
         ['وضعیت', project.Status], ['تاریخ ایجاد', project.CreatedAt], ['توضیحات', project.Description]]
          .forEach(function (item) { add('پروژه', item[0], item[1]); });
      }
      if (config.events !== false) {
        this.filterEvents(this.currentReport.events || []).filter(function (event) {
          return Reports.selectedEventIds.indexOf(String(event.ID || event.Id || '')) !== -1;
        }).forEach(function (event) {
          add('رویداد', 'نام', event.EventTypeName || event.EventTypeCode || event.Title);
          add('رویداد', 'واحد', event.DepartmentName);
          add('رویداد', 'ثبت‌کننده', event.PerformedByName || event.CreatorName);
          add('رویداد', 'تاریخ', event.OccurredAt || event.CreatedAt);
          add('رویداد', 'تعداد', event.Quantity ?? event.VariantQuantity ?? event.TotalQuantity ?? '');
          add('رویداد', 'توضیحات', event.Description || event.Notes || event.Remarks);
        });
      }
      if (config.needs !== false) {
        (((this.currentReport.procurement || {}).needs) || []).forEach(function (need) {
          add('ملزومات', 'نام', need.ItemName || need.Name || need.SupplyName);
          add('ملزومات', 'مقدار موردنیاز', need.RequestedQuantity ?? need.RequiredQuantity ?? need.Quantity);
          add('ملزومات', 'سفارش‌شده', need.OrderedQuantity);
          add('ملزومات', 'تحویل‌شده', need.ReceivedQuantity);
          add('ملزومات', 'وضعیت', need.ProcurementStatus || need.Status);
        });
      }
      if (config.orders !== false) {
        (((this.currentReport.procurement || {}).orders) || []).forEach(function (order) {
          (order.Items || []).forEach(function (item) {
            add('سفارش', 'شماره', order.OrderCode || order.ID);
            add('سفارش', 'ملزوم', item.ItemName || item.Name || item.SupplyName);
            add('سفارش', 'تاریخ سفارش', order.OrderDate || order.CreatedAt);
            add('سفارش', 'تاریخ تحویل', item.DeliveryDate || item.ReceivedAt || order.DeliveryDate || order.ReceivedAt);
            add('سفارش', 'وضعیت', item.Status || order.Status);
          });
        });
      }
      const csv = '\uFEFF' + rows.map(function (row) {
        return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'project-report-' + String(project.ProjectCode || project.ID || 'export').replace(/[^a-zA-Z0-9_-]/g, '_') + '.csv';
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      this.showMessage('خروجی CSV آماده شد.', false);
    },

    renderReport: function () {
      const target = document.getElementById('project-report-content');
      const data = this.currentReport;
      if (!target || !data || !data.project) return;
      const project = data.project;
      const events = Array.isArray(data.events) ? data.events : [];
      const procurement = data.procurement || {};
      const needs = Array.isArray(procurement.needs) ? procurement.needs : [];
      const orders = Array.isArray(procurement.orders) ? procurement.orders : [];
      const calculations = Array.isArray(procurement.calculations) ? procurement.calculations : [];
      const selected = this.selectedEventIds;

      const visibleEvents = this.filterEvents(events);
      const eventRows = visibleEvents.length ? visibleEvents.map((event) => {
        const id = String(event.ID || event.Id || '');
        const checked = selected.indexOf(id) !== -1 ? ' checked' : '';
        const detail = event.Description || event.Notes || event.Remarks || '';
        const quantity = event.Quantity || event.VariantQuantity || event.TotalQuantity || '';
        return '<label class="project-report-event-row">' +
          '<input type="checkbox" data-report-event="' + this.escape(id) + '"' + checked + '>' +
          '<span class="project-report-event-main"><strong>' +
          this.escape(event.EventTypeName || event.EventTypeCode || event.Title || 'رویداد تولید') +
          '</strong><small>' + this.escape(event.DepartmentName || 'واحد نامشخص') +
          ' · ' + this.escape(event.PerformedByName || event.CreatorName || 'ثبت‌کننده نامشخص') +
          ' · ' + this.formatDate(event.OccurredAt || event.CreatedAt) + '</small>' +
          (quantity !== '' ? '<small>تعداد: ' + this.escape(quantity) + '</small>' : '') +
          (detail ? '<small>' + this.escape(detail) + '</small>' : '') +
          '</span></label>';
      }).join('') : '<div class="table-empty">برای این پروژه رویدادی ثبت نشده است.</div>';

      const needRows = needs.map((need) => '<tr><td>' + this.escape(need.ItemName || need.Name || need.SupplyName || '—') +
        '</td><td>' + this.escape(need.ItemCode || need.MaterialCode || need.Code || '—') +
        '</td><td>' + this.escape(need.Unit || need.UnitOfMeasure || '—') +
        '</td><td>' + this.escape(need.RequestedQuantity ?? need.RequiredQuantity ?? need.Quantity ?? '—') +
        '</td><td>' + this.escape(need.OrderedQuantity ?? '—') +
        '</td><td>' + this.escape(need.ReceivedQuantity ?? '—') +
        '</td><td>' + this.escape(need.RemainingToOrderQuantity ?? '—') +
        '</td><td>' + this.escape(need.ProcurementStatus || need.Status || '—') + '</td></tr>').join('');

      const calculationRows = calculations.map((row) => '<tr><td>' + this.escape(row.MaterialSpecName || row.MaterialSpecID || '—') +
        '</td><td>' + this.escape(row.BasisQuantity ?? '—') +
        '</td><td>' + this.escape(row.ConsumptionPerUnit ?? '—') +
        '</td><td>' + this.escape(row.WastagePercent ?? 0) + '%</td><td>' +
        this.escape(row.CalculatedQuantity ?? '—') + '</td><td>' +
        this.escape(row.VarianceQuantity ?? '—') + '</td><td>' +
        this.formatDate(row.CreatedAt) + '</td></tr>').join('');

      const orderRows = [];
      orders.forEach((order) => {
        const items = Array.isArray(order.Items) ? order.Items : [];
        if (!items.length) {
          orderRows.push('<tr><td>' + this.escape(order.OrderCode || order.ID || '—') +
            '</td><td>—</td><td>' + this.formatDate(order.OrderDate || order.CreatedAt) +
            '</td><td>' + this.formatDate(order.DeliveryDate || order.ReceivedAt) +
            '</td><td>' + this.escape(order.Status || '—') + '</td></tr>');
          return;
        }
        items.forEach((item) => orderRows.push('<tr><td>' +
          this.escape(order.OrderCode || order.ID || '—') + '</td><td>' +
          this.escape(item.ItemName || item.Name || item.SupplyName || '—') + '</td><td>' +
          this.formatDate(order.OrderDate || order.CreatedAt) + '</td><td>' +
          this.formatDate(item.DeliveryDate || item.ReceivedAt || order.DeliveryDate || order.ReceivedAt) +
          '</td><td>' + this.escape(item.Status || order.Status || '—') + '</td></tr>'));
      });

      target.innerHTML =
        '<div class="project-report-toolbar no-print"><div><strong>انتخاب رویدادهای گزارش</strong>' +
        '<p>رویدادهایی را که می‌خواهید در نسخه چاپی درج شوند انتخاب یا از انتخاب خارج کنید.</p></div>' +
        '<div class="project-report-selection-actions"><button type="button" class="btn btn-secondary" id="project-report-select-all">انتخاب همه</button>' +
        '<button type="button" class="btn btn-light" id="project-report-select-none">پاک کردن انتخاب</button></div></div>' +
        '<article id="project-report-print-area" class="project-report-paper">' +
        '<header class="project-report-title"><h2>گزارش تولید پروژه</h2><p>زمان تهیه: ' + this.formatDate(data.generatedAt) + '</p></header>' +
        '<section data-report-output="project" class="project-report-section"><h3>اطلاعات کلی پروژه</h3><div class="project-report-facts">' +
        '<div><span>کد پروژه</span><strong>' + this.escape(project.ProjectCode || '—') + '</strong></div>' +
        '<div><span>عنوان پروژه</span><strong>' + this.escape(project.Title || '—') + '</strong></div>' +
        '<div><span>تعداد پیشنهادی</span><strong>' + this.escape(project.Quantity === '' ? '—' : project.Quantity) + '</strong></div>' +
        '<div><span>وضعیت</span><strong>' + this.escape(project.Status || '—') + '</strong></div>' +
        '<div><span>تاریخ ایجاد</span><strong>' + this.formatDate(project.CreatedAt) + '</strong></div>' +
        '<div><span>آخرین ویرایش</span><strong>' + this.formatDate(project.UpdatedAt) + '</strong></div>' +
        '</div>' + (project.Description ? '<p class="project-report-description">' + this.escape(project.Description) + '</p>' : '') + '</section>' +
        '<section data-report-output="events" class="project-report-section"><h3>رویدادهای انتخاب‌شده</h3><div class="project-report-events">' + eventRows + '</div></section>' +
        '<section data-report-output="needs" class="project-report-section"><h3>ملزومات ثبت‌شده برای پروژه</h3>' +
        (needs.length ? '<div class="table-wrapper"><table class="data-table"><thead><tr><th>ملزوم</th><th>کد</th><th>واحد</th><th>نیاز</th><th>سفارش</th><th>دریافت</th><th>کسری سفارش</th><th>وضعیت</th></tr></thead><tbody>' + needRows + '</tbody></table></div>' : '<p class="project-report-muted">ملزومی برای این پروژه ثبت نشده است.</p>') + '</section>' +
        '<section data-report-output="calculations" class="project-report-section"><h3>تاریخچه محاسبه نیاز ملزومات</h3>' +
        (calculations.length ? '<div class="table-wrapper"><table class="data-table"><thead><tr><th>شناسه مشخصات</th><th>تعداد مبنا</th><th>مصرف هر واحد</th><th>ضایعات</th><th>نیاز محاسبه‌شده</th><th>اختلاف</th><th>تاریخ</th></tr></thead><tbody>' + calculationRows + '</tbody></table></div>' : '<p class="project-report-muted">تاریخچه محاسبه‌ای برای این پروژه ثبت نشده است.</p>') + '</section>' +
        '<section data-report-output="orders" class="project-report-section"><h3>سفارش‌ها و تحویل ملزومات</h3>' +
        (orderRows.length ? '<div class="table-wrapper"><table class="data-table"><thead><tr><th>شماره سفارش</th><th>ملزوم</th><th>تاریخ سفارش</th><th>تاریخ تحویل</th><th>وضعیت</th></tr></thead><tbody>' + orderRows.join('') + '</tbody></table></div>' : '<p class="project-report-muted">سفارشی برای این پروژه پیدا نشد.</p>') + '</section>' +
        '</article>';

      const sections = this.selectedSections();
      target.querySelectorAll('[data-report-output]').forEach(function (section) {
        const key = section.getAttribute('data-report-output');\n        section.style.display = sections[key] === false ? 'none' : '';
      });
      target.querySelectorAll('[data-report-event]').forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
          const id = String(checkbox.getAttribute('data-report-event') || '');
          if (checkbox.checked && Reports.selectedEventIds.indexOf(id) === -1) Reports.selectedEventIds.push(id);
          if (!checkbox.checked) Reports.selectedEventIds = Reports.selectedEventIds.filter(function (item) { return item !== id; });
          Reports.applyEventSelection();
        });
      });
      const all = document.getElementById('project-report-select-all');
      const none = document.getElementById('project-report-select-none');
      if (all) all.addEventListener('click', function () {
        Reports.selectedEventIds = visibleEvents.map(function (event) { return String(event.ID || event.Id || ''); }).filter(Boolean);
        Reports.renderReport();
      });
      if (none) none.addEventListener('click', function () {
        Reports.selectedEventIds = [];
        Reports.renderReport();
      });
      this.applyEventSelection();
    },

    applyEventSelection: function () {
      const area = document.getElementById('project-report-print-area');
      if (!area) return;
      area.querySelectorAll('[data-report-event]').forEach(function (checkbox) {
        const row = checkbox.closest('.project-report-event-row');
        if (row) row.classList.toggle('is-excluded', !checkbox.checked);
      });
    }
  };

  window.PMS.Modules.Reports = Reports;
})();