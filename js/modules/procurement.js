(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const state = { needs: [], orders: [], loading: false };

  function unwrap(value) {
    if (value && value.data !== undefined) return unwrap(value.data);
    return value;
  }

  function list(value, keys) {
    value = unwrap(value);
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    for (let i = 0; i < keys.length; i++) {
      if (Array.isArray(value[keys[i]])) return value[keys[i]];
    }
    return [];
  }

  function escape(value) {
    return String(value == null || value === '' ? '-' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('fa-IR') : '۰';
  }

  function statusLabel(status) {
    const labels = {
      ACTIVE: 'فعال', OPEN: 'باز', ORDERED: 'سفارش‌شده',
      PARTIALLY_ORDERED: 'سفارش ناقص', PARTIALLY_RECEIVED: 'دریافت ناقص',
      RECEIVED: 'دریافت کامل', COMPLETE: 'تکمیل‌شده',
      NEEDS_REVIEW: 'نیازمند بررسی', CANCELLED: 'لغوشده'
    };
    return labels[String(status || '').toUpperCase()] || status || '-';
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function renderNeeds() {
    const container = $('procurement-needs-table');
    if (!container) return;
    if (!state.needs.length) {
      container.innerHTML = '<div class="table-empty">نیازی ثبت نشده است.</div>';
      return;
    }
    container.innerHTML = '<table class="data-table"><thead><tr><th>ملزوم</th><th>پروژه</th><th>مقدار موردنیاز</th><th>سفارش‌شده</th><th>دریافت‌شده</th><th>باقی‌مانده سفارش</th><th>وضعیت</th></tr></thead><tbody>' +
      state.needs.map(function (item) {
        return '<tr><td>' + escape(item.ItemName) + '</td><td>' +
          escape(item.ProjectCode || item.ProjectID || 'موجودی عمومی') + '</td><td>' +
          number(item.RequestedQuantity) + ' ' + escape(item.Unit) + '</td><td>' +
          number(item.OrderedQuantity) + '</td><td>' + number(item.ReceivedQuantity) +
          '</td><td>' + number(Math.max(0, Number(item.RequestedQuantity || 0) - Number(item.OrderedQuantity || 0))) +
          '</td><td>' + escape(statusLabel(item.CalculatedStatus || item.ProcurementStatus || item.Status)) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderOrders() {
    const container = $('procurement-orders-table');
    if (!container) return;
    if (!state.orders.length) {
      container.innerHTML = '<div class="table-empty">سفارشی ثبت نشده است.</div>';
      return;
    }
    container.innerHTML = '<table class="data-table"><thead><tr><th>شماره سفارش</th><th>تأمین‌کننده</th><th>تاریخ سفارش</th><th>تاریخ تحویل مورد انتظار</th><th>وضعیت دریافت</th><th>توضیحات</th></tr></thead><tbody>' +
      state.orders.map(function (item) {
        return '<tr><td>' + escape(item.OrderNumber) + '</td><td>' + escape(item.SupplierName) +
          '</td><td>' + escape(item.OrderDate) + '</td><td>' + escape(item.ExpectedDeliveryDate) +
          '</td><td>' + escape(statusLabel(item.Status)) + '</td><td>' + escape(item.Notes) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderSummary(summary) {
    summary = summary || {};
    setText('procurement-needs-count', number(summary.activeNeeds !== undefined ? summary.activeNeeds : state.needs.length));
    setText('procurement-needs-open', number(summary.openNeeds !== undefined ? summary.openNeeds :
      state.needs.filter(function (x) { return Number(x.OrderedQuantity || 0) < Number(x.RequestedQuantity || 0); }).length));
    setText('procurement-orders-count', number(summary.orders !== undefined ? summary.orders : state.orders.length));
    setText('procurement-orders-open', number(summary.openOrders !== undefined ? summary.openOrders :
      state.orders.filter(function (x) { return String(x.Status).toUpperCase() !== 'RECEIVED'; }).length));
  }

  async function load() {
    if (state.loading) return;
    state.loading = true;
    const loading = $('procurement-loading');
    const error = $('procurement-error');
    const content = $('procurement-content');
    const button = $('procurement-refresh');
    if (loading) loading.hidden = false;
    if (error) { error.hidden = true; error.textContent = ''; }
    if (button) button.disabled = true;
    try {
      const results = await Promise.all([
        PMS.Api.get('/procurement/dashboard'),
        PMS.Api.get('/procurement/needs'),
        PMS.Api.get('/procurement/orders')
      ]);
      const summaryData = unwrap(results[0]) || {};
      state.needs = list(results[1], ['needs', 'items', 'Needs']);
      state.orders = list(results[2], ['orders', 'items', 'Orders']);
      renderSummary(summaryData.summary || summaryData);
      renderNeeds();
      renderOrders();
      if (content) content.hidden = false;
    } catch (err) {
      if (error) {
        error.textContent = err && err.message ? err.message : 'دریافت اطلاعات تأمین ناموفق بود.';
        error.hidden = false;
      }
    } finally {
      state.loading = false;
      if (loading) loading.hidden = true;
      if (button) button.disabled = false;
    }
  }

  function init() {
    const button = $('procurement-refresh');
    if (button && !button.dataset.bound) {
      button.dataset.bound = '1';
      button.addEventListener('click', load);
    }
    load();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();