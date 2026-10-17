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


  function modal(title, body) {
    clearMessage();
    const root = $('procurement-modal-root');
    root.innerHTML = '<div class="card procurement-form-card"><div class="card-header"><h3>' + escape(title) +
      '</h3><button type="button" class="btn btn-light" data-close-procurement>بستن</button></div><div class="card-body">' + body + '</div></div>';
    root.querySelector('[data-close-procurement]').addEventListener('click', clearMessage);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return root;
  }
  function needOptions(selected) {
    return [option('', 'بدون اتصال به نیاز ثبت‌شده', !selected)].concat(state.needs.map(function (need) {
      return option(need.ID, (need.ItemName || 'ملزوم') + ' — باقی‌مانده: ' +
        number(Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0))) +
        ' ' + (need.Unit || '') + (need.ProjectCode || need.ProjectID ? ' — پروژه ' + (need.ProjectCode || need.ProjectID) : ''),
        String(need.ID) === String(selected || ''));
    })).join('');
  }
  function openNeedForm() {
    const root = modal('ثبت نیاز ملزومات',
      '<form id="procurement-need-form"><div class="form-grid">' +
      '<label class="form-group"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200"></label>' +
      '<label class="form-group"><span>کد ملزوم</span><input name="ItemCode" maxlength="100"></label>' +
      '<label class="form-group"><span>واحد اندازه‌گیری *</span><input name="Unit" required></label>' +
      '<label class="form-group"><span>مقدار موردنیاز *</span><input name="RequestedQuantity" type="number" min="0.001" step="any" required></label>' +
      '<label class="form-group"><span>شناسه پروژه (اختیاری)</span><input name="ProjectID" placeholder="شناسه دقیق پروژه"></label>' +
      '<label class="form-group"><span>تاریخ نیاز</span><input name="NeededBy" type="date"></label>' +
      '<label class="form-group"><span>توضیحات</span><input name="Notes" maxlength="500"></label>' +
      '</div><div class="modal-actions"><button class="btn btn-primary" type="submit">ثبت نیاز</button></div></form>');
    root.querySelector('#procurement-need-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      if (state.saving) return;
      const form = event.currentTarget;
      const body = Object.fromEntries(new FormData(form).entries());
      body.RequestedQuantity = Number(body.RequestedQuantity);
      if (!body.ProjectID) delete body.ProjectID;
      state.saving = true;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true; submit.textContent = 'در حال ثبت...';
      try {
        await PMS.Api.post('/procurement/needs', body);
        clearMessage(); await load(true); showMessage('نیاز ملزومات ثبت شد.', false);
      } catch (err) {
        showMessage(err.message || 'ثبت نیاز ناموفق بود.', true);
      } finally {
        state.saving = false;
        if (submit.isConnected) { submit.disabled = false; submit.textContent = 'ثبت نیاز'; }
      }
    });
  }
  function orderItemRow(index) {
    return '<div class="card procurement-order-item" data-order-item="' + index + '"><div class="card-header"><strong>قلم سفارش ' + (index + 1) +
      '</strong><button type="button" class="btn btn-light" data-remove-item>حذف قلم</button></div><div class="card-body"><div class="form-grid">' +
      '<label class="form-group"><span>اتصال به نیاز موجود</span><select name="MaterialNeedID">' + needOptions('') + '</select></label>' +
      '<label class="form-group"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200"></label>' +
      '<label class="form-group"><span>کد ملزوم</span><input name="ItemCode" maxlength="100"></label>' +
      '<label class="form-group"><span>واحد *</span><input name="Unit" required></label>' +
      '<label class="form-group"><span>مقدار سفارش *</span><input name="OrderedQuantity" type="number" min="0.001" step="any" required></label>' +
      '<label class="form-group"><span>قیمت واحد</span><input name="UnitPrice" type="number" min="0" step="any"></label>' +
      '<label class="form-group"><span>شناسه پروژه (اختیاری)</span><input name="ProjectID" placeholder="شناسه پروژه"></label>' +
      '<label class="form-group"><span>توضیحات قلم</span><input name="Notes" maxlength="300"></label>' +
      '</div></div></div>';
  }
  function openOrderForm() {
    const root = modal('ثبت سفارش خرید',
      '<form id="procurement-order-form"><div class="form-grid">' +
      '<label class="form-group"><span>شماره سفارش</span><input name="OrderNumber" maxlength="100" placeholder="خودکار"></label>' +
      '<label class="form-group"><span>تأمین‌کننده</span><input name="SupplierName" maxlength="200"></label>' +
      '<label class="form-group"><span>تاریخ سفارش</span><input name="OrderDate" type="date"></label>' +
      '<label class="form-group"><span>تاریخ تحویل مورد انتظار</span><input name="ExpectedDeliveryDate" type="date"></label>' +
      '<label class="form-group"><span>توضیحات سفارش</span><input name="Notes" maxlength="500"></label>' +
      '</div><div id="procurement-order-items">' + orderItemRow(0) + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-secondary" id="procurement-add-order-item">+ افزودن قلم</button>' +
      '<button type="submit" class="btn btn-primary">ثبت سفارش</button></div></form>');
    const itemsRoot = root.querySelector('#procurement-order-items');
    root.querySelector('#procurement-add-order-item').addEventListener('click', function () {
      itemsRoot.insertAdjacentHTML('beforeend', orderItemRow(itemsRoot.querySelectorAll('[data-order-item]').length));
    });
    itemsRoot.addEventListener('click', function (event) {
      const button = event.target.closest('[data-remove-item]');
      if (!button) return;
      if (itemsRoot.querySelectorAll('[data-order-item]').length <= 1) {
        showMessage('سفارش باید دست‌کم یک قلم داشته باشد.', true); return;
      }
      button.closest('[data-order-item]').remove();
    });
    itemsRoot.addEventListener('change', function (event) {
      if (!event.target.matches('select[name="MaterialNeedID"]')) return;
      const row = event.target.closest('[data-order-item]');
      const need = state.needs.find(function (item) { return String(item.ID) === String(event.target.value); });
      if (!need) return;
      row.querySelector('[name="ItemName"]').value = need.ItemName || '';
      row.querySelector('[name="ItemCode"]').value = need.ItemCode || '';
      row.querySelector('[name="Unit"]').value = need.Unit || '';
      row.querySelector('[name="ProjectID"]').value = need.ProjectID || '';
      const remaining = Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0));
      row.querySelector('[name="OrderedQuantity"]').value = remaining > 0 ? remaining : '';
    });
    root.querySelector('#procurement-order-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      if (state.saving) return;
      const form = event.currentTarget;
      const header = Object.fromEntries(new FormData(form).entries());
      const items = Array.from(form.querySelectorAll('[data-order-item]')).map(function (row) {
        const get = function (name) { return row.querySelector('[name="' + name + '"]').value.trim(); };
        const item = {
          MaterialNeedID: get('MaterialNeedID'), ItemName: get('ItemName'), ItemCode: get('ItemCode'),
          Unit: get('Unit'), OrderedQuantity: Number(get('OrderedQuantity')),
          UnitPrice: get('UnitPrice') === '' ? '' : Number(get('UnitPrice')),
          ProjectID: get('ProjectID'), Notes: get('Notes')
        };
        if (!item.MaterialNeedID) delete item.MaterialNeedID;
        if (!item.ProjectID) delete item.ProjectID;
        return item;
      });
      const body = {
        OrderNumber: header.OrderNumber, SupplierName: header.SupplierName,
        OrderDate: header.OrderDate, ExpectedDeliveryDate: header.ExpectedDeliveryDate,
        Notes: header.Notes, Items: items
      };
      state.saving = true;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true; submit.textContent = 'در حال ثبت...';
      try {
        await PMS.Api.post('/procurement/orders', body);
        clearMessage(); await load(true); showMessage('سفارش خرید ثبت شد.', false);
      } catch (err) {
        showMessage(err.message || 'ثبت سفارش ناموفق بود.', true);
      } finally {
        state.saving = false;
        if (submit.isConnected) { submit.disabled = false; submit.textContent = 'ثبت سفارش'; }
      }
    });
  }
  function openReceiptForm() {
    const allItems = [];
    state.orders.forEach(function (order) {
      (Array.isArray(order.Items) ? order.Items : []).forEach(function (item) {
        const remaining = Math.max(0, Number(item.OrderedQuantity || 0) - Number(item.ReceivedQuantity || 0));
        if (remaining > 0) allItems.push({ order: order, item: item, remaining: remaining });
      });
    });
    const itemOptions = allItems.map(function (entry) {
      return option(entry.item.ID, (entry.order.OrderNumber || 'سفارش') + ' — ' + entry.item.ItemName +
        ' — باقی‌مانده ' + number(entry.remaining) + ' ' + (entry.item.Unit || ''), false);
    }).join('');
    const root = modal('ثبت دریافت واقعی انبار',
      allItems.length ? '<form id="procurement-receipt-form"><div class="form-grid">' +
      '<label class="form-group"><span>قلم سفارش *</span><select name="PurchaseOrderItemID" required>' +
      option('', 'انتخاب قلم سفارش', true) + itemOptions + '</select></label>' +
      '<label class="form-group"><span>مقدار دریافت‌شده *</span><input name="QuantityReceived" type="number" min="0.001" step="any" required></label>' +
      '<label class="form-group"><span>تاریخ دریافت</span><input name="ReceivedAt" type="date"></label>' +
      '<label class="form-group"><span>شناسه پروژه (اختیاری)</span><input name="ProjectID" placeholder="شناسه پروژه"></label>' +
      '<label class="form-group"><span>توضیحات</span><input name="Notes" maxlength="500"></label>' +
      '</div><p class="form-help">برای تحویل مرحله‌ای، هر بار یک رسید جدا ثبت کنید.</p>' +
      '<div class="modal-actions"><button type="submit" class="btn btn-primary">ثبت دریافت</button></div></form>'
      : '<div class="table-empty">قلم سفارشی با مقدار دریافت‌نشده وجود ندارد.</div>');
    const form = root.querySelector('#procurement-receipt-form');
    if (!form) return;
    form.querySelector('[name="PurchaseOrderItemID"]').addEventListener('change', function () {
      const found = allItems.find(function (entry) { return String(entry.item.ID) === String(form.elements.PurchaseOrderItemID.value); });
      if (found) form.elements.QuantityReceived.max = found.remaining;
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (state.saving) return;
      const body = Object.fromEntries(new FormData(form).entries());
      body.QuantityReceived = Number(body.QuantityReceived);
      if (!body.ProjectID) delete body.ProjectID;
      if (body.ReceivedAt) body.ReceivedAt = new Date(body.ReceivedAt + 'T12:00:00').toISOString();
      state.saving = true;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true; submit.textContent = 'در حال ثبت...';
      try {
        await PMS.Api.post('/procurement/receipts', body);
        clearMessage(); await load(true); showMessage('دریافت انبار ثبت شد.', false);
      } catch (err) {
        showMessage(err.message || 'ثبت دریافت ناموفق بود.', true);
      } finally {
        state.saving = false;
        if (submit.isConnected) { submit.disabled = false; submit.textContent = 'ثبت دریافت'; }
      }
    });
  }
  function bind(id, callback) {
    const button = $(id);
    if (button && !button.dataset.bound) {
      button.dataset.bound = '1'; button.addEventListener('click', callback);
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