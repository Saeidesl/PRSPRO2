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
      this.loadProjects();
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

    renderReport: function () {
      const target = document.getElementById('project-report-content');
      const data = this.currentReport;
      if (!target || !data || !data.project) return;
      const project = data.project;
      const events = Array.isArray(data.events) ? data.events : [];
      const procurement = data.procurement || {};
      const needs = Array.isArray(procurement.needs) ? procurement.needs : [];
      const orders = Array.isArray(procurement.orders) ? procurement.orders : [];
      const selected = this.selectedEventIds;

      const eventRows = events.length ? events.map((event) => {
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
        '</td><td>' + this.escape(need.MaterialCode || need.Code || '—') +
        '</td><td>' + this.escape(need.Unit || need.UnitOfMeasure || '—') +
        '</td><td>' + this.escape(need.RequiredQuantity || need.Quantity || '—') +
        '</td><td>' + this.escape(need.Status || '—') + '</td></tr>').join('');

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
        '<section class="project-report-section"><h3>اطلاعات کلی پروژه</h3><div class="project-report-facts">' +
        '<div><span>کد پروژه</span><strong>' + this.escape(project.ProjectCode || '—') + '</strong></div>' +
        '<div><span>عنوان پروژه</span><strong>' + this.escape(project.Title || '—') + '</strong></div>' +
        '<div><span>تعداد پیشنهادی</span><strong>' + this.escape(project.Quantity === '' ? '—' : project.Quantity) + '</strong></div>' +
        '<div><span>وضعیت</span><strong>' + this.escape(project.Status || '—') + '</strong></div>' +
        '<div><span>تاریخ ایجاد</span><strong>' + this.formatDate(project.CreatedAt) + '</strong></div>' +
        '<div><span>آخرین ویرایش</span><strong>' + this.formatDate(project.UpdatedAt) + '</strong></div>' +
        '</div>' + (project.Description ? '<p class="project-report-description">' + this.escape(project.Description) + '</p>' : '') + '</section>' +
        '<section class="project-report-section"><h3>رویدادهای انتخاب‌شده</h3><div class="project-report-events">' + eventRows + '</div></section>' +
        '<section class="project-report-section"><h3>ملزومات ثبت‌شده برای پروژه</h3>' +
        (needs.length ? '<div class="table-wrapper"><table class="data-table"><thead><tr><th>ملزوم</th><th>کد</th><th>واحد</th><th>مقدار</th><th>وضعیت</th></tr></thead><tbody>' + needRows + '</tbody></table></div>' : '<p class="project-report-muted">ملزومی برای این پروژه ثبت نشده است.</p>') + '</section>' +
        '<section class="project-report-section"><h3>سفارش‌ها و تحویل ملزومات</h3>' +
        (orderRows.length ? '<div class="table-wrapper"><table class="data-table"><thead><tr><th>شماره سفارش</th><th>ملزوم</th><th>تاریخ سفارش</th><th>تاریخ تحویل</th><th>وضعیت</th></tr></thead><tbody>' + orderRows.join('') + '</tbody></table></div>' : '<p class="project-report-muted">سفارشی برای این پروژه پیدا نشد.</p>') + '</section>' +
        '</article>';

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
        Reports.selectedEventIds = events.map(function (event) { return String(event.ID || event.Id || ''); }).filter(Boolean);
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