(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const state = { needs: [], orders: [], projects: [], loading: false, loadingProjectNeeds: false };

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

  function escapeField(value) {
    return String(value == null ? '' : value)
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


  function option(value, label, selected) {
    const rawValue = String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<option value="' + rawValue + '"' + (selected ? ' selected' : '') + '>' + escape(label) + '</option>';
  }
  function clearMessage() {
    const root = $('procurement-modal-root');
    if (root) root.innerHTML = '';
  }
  function showMessage(message, isError) {
    const root = $('procurement-modal-root');
    if (!root) { window.alert(message); return; }
    let box = root.querySelector('.procurement-inline-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'procurement-inline-message alert';
      root.prepend(box);
    }
    box.classList.toggle('alert-danger', !!isError);
    box.classList.toggle('alert-success', !isError);
    box.textContent = message;
    box.hidden = false;
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
    setText('procurement-orders-count', number(summary.activeOrders !== undefined ? summary.activeOrders : (summary.orders !== undefined ? summary.orders : state.orders.length)));
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
  function normalizeProjects(value) {
    value = unwrap(value);
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value.projects)) return value.projects;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.Projects)) return value.Projects;
    return [];
  }

  function projectId(project) {
    return project.ID || project.ProjectID || project.Id || project.id || '';
  }

  function projectLabel(project) {
    const code = project.ProjectCode || project.Code || project.code || '';
    const name = project.ProjectName || project.Name || project.Title || project.name || '';
    const label = [code, name].filter(Boolean).join(' — ');
    return label || String(projectId(project));
  }

  async function loadProjectsForOrder() {
    try {
      const result = await PMS.Api.getCached('/projects', 'procurement-projects', {});
      state.projects = normalizeProjects(result && result.cached === true ? result.data : result);
      if (!state.projects.length && result && result.data) {
        state.projects = normalizeProjects(result.data);
      }
    } catch (error) {
      // Try the direct API if this client does not support cached requests here.
      const result = await PMS.Api.get('/projects');
      state.projects = normalizeProjects(result);
    }
    return state.projects;
  }

  function projectOptions() {
    return [option('', 'انتخاب پروژه', true)].concat(state.projects.map(function (project) {
      return option(projectId(project), projectLabel(project), false);
    })).join('');
  }

  function orderItemRow(index, need) {
    need = need || {};
    const remaining = Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0));
    const quantity = need.ID ? (remaining > 0 ? remaining : Number(need.RequestedQuantity || 0)) : '';
    return '<div class="card procurement-order-item" data-order-item="' + index + '"><div class="card-header"><strong>قلم ' + (index + 1) +
      '</strong><button type="button" class="btn btn-light" data-remove-item>حذف ردیف</button></div><div class="card-body"><div class="form-grid">' +
      '<input type="hidden" name="MaterialNeedID" value="' + (need.ID ? escapeField(need.ID) : '') + '">' +
      '<label class="form-group"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200" value="' + escapeField(need.ItemName) + '"></label>' +
      '' +'<label class="form-group"><span>واحد اندازه‌گیری *</span><input name="Unit" required maxlength="100" value="' + escapeField(need.Unit) + '"></label>' +
      '<label class="form-group"><span>مقدار سفارش *</span><input name="OrderedQuantity" type="number" min="0.001" step="any" required value="' + (quantity === '' ? '' : escapeField(quantity)) + '"></label>' +
      '<label class="form-group"><span>توضیحات</span><input name="Notes" maxlength="500" value="' + escapeField(need.Notes) + '"></label>' +
      '</div></div></div>';
  }

  async function loadNeedsForProject(projectId) {
    const result = await PMS.Api.get('/procurement/needs');
    const allNeeds = list(result, ['needs', 'items', 'Needs']);
    state.needs = allNeeds;
    return allNeeds.filter(function (need) {
      return String(need.ProjectID || '') === String(projectId);
    });
  }

  function renderOrderNeedRows(itemsRoot, needs) {
    itemsRoot.innerHTML = '';
    const openNeeds = (needs || []).filter(function (need) {
      return Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0)) > 0;
    });
    if (!openNeeds.length) {
      itemsRoot.innerHTML = orderItemRow(0);
      return;
    }
    itemsRoot.innerHTML = openNeeds.map(function (need, index) {
      return orderItemRow(index, need);
    }).join('');
  }

  async function openOrderForm(orderType) {
    const isProjectOrder = orderType === 'PROJECT';
    try {
      if (isProjectOrder) {
        await loadProjectsForOrder();
        if (!state.projects.length) {
          showMessage('فهرست پروژه‌ها دریافت نشد یا پروژه‌ای برای انتخاب وجود ندارد.', true);
          return;
        }
      }
    } catch (error) {
      showMessage('دریافت فهرست پروژه‌ها ناموفق بود. لطفاً دوباره تلاش کنید.', true);
      return;
    }

    const title = isProjectOrder ? 'ثبت سفارش مرتبط با پروژه' : 'ثبت سفارش عمومی';
    const projectField = isProjectOrder
      ? '<label class="form-group"><span>کد پروژه *</span><select name="ProjectID" required>' + projectOptions() + '</select></label>'
      : '';
    const root = modal(title,
      '<form id="procurement-order-form" data-order-type="' + orderType + '"><div class="form-grid">' +
      projectField +
      '<label class="form-group"><span>تاریخ سفارش (اختیاری)</span><input name="OrderDate" type="date"></label>' +
      '</div><div class="card"><div class="card-header"><h4>اقلام موردنیاز</h4></div><div class="card-body">' +
      '<div id="procurement-order-items">' + orderItemRow(0) + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-secondary" id="procurement-add-order-item">+ افزودن ردیف</button></div>' +
      '</div></div><div class="modal-actions"><button type="submit" class="btn btn-primary">ثبت سفارش</button></div></form>');

    const itemsRoot = root.querySelector('#procurement-order-items');
    const projectSelect = root.querySelector('[name="ProjectID"]');
    if (projectSelect) {
      projectSelect.addEventListener('change', async function () {
        if (!projectSelect.value) {
          itemsRoot.innerHTML = orderItemRow(0);
          return;
        }
        if (state.loadingProjectNeeds) return;
        state.loadingProjectNeeds = true;
        projectSelect.disabled = true;
        const submitButton = root.querySelector('#procurement-order-form [type="submit"]');
        if (submitButton) submitButton.disabled = true;
        try {
          const needs = await loadNeedsForProject(projectSelect.value);
          renderOrderNeedRows(itemsRoot, needs);
          const openNeeds = needs.filter(function (need) {
            return Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0)) > 0;
          });
          if (!openNeeds.length) showMessage('برای این پروژه نیازِ باز برای سفارش وجود ندارد؛ در صورت نیاز می‌توانید اقلام را دستی وارد کنید.', false);
          else clearMessage();
        } catch (error) {
          showMessage('دریافت نیازهای این پروژه ناموفق بود. اقلام را می‌توانید دستی وارد کنید.', true);
          itemsRoot.innerHTML = orderItemRow(0);
        } finally {
          state.loadingProjectNeeds = false;
          projectSelect.disabled = false;
          if (submitButton) submitButton.disabled = false;
        }
      });
    }
    root.querySelector('#procurement-add-order-item').addEventListener('click', function () {
      itemsRoot.insertAdjacentHTML('beforeend', orderItemRow(itemsRoot.querySelectorAll('[data-order-item]').length));
    });
    itemsRoot.addEventListener('click', function (event) {
      const button = event.target.closest('[data-remove-item]');
      if (!button) return;
      if (itemsRoot.querySelectorAll('[data-order-item]').length <= 1) {
        showMessage('سفارش باید دست‌کم یک ردیف داشته باشد.', true);
        return;
      }
      button.closest('[data-order-item]').remove();
    });

    root.querySelector('#procurement-order-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      if (state.saving) return;
      const form = event.currentTarget;
      const header = Object.fromEntries(new FormData(form).entries());
      const selectedProject = isProjectOrder ? header.ProjectID : '';
      const items = Array.from(form.querySelectorAll('[data-order-item]')).map(function (row) {
        const get = function (name) {
          const field = row.querySelector('[name="' + name + '"]');
          return field ? field.value.trim() : '';
        };
        const item = {
          MaterialNeedID: get('MaterialNeedID'),
          ItemName: get('ItemName'),
          Unit: get('Unit'),
          OrderedQuantity: Number(get('OrderedQuantity')),
          Notes: get('Notes')
        };
        if (!item.MaterialNeedID) delete item.MaterialNeedID;
        if (isProjectOrder && selectedProject) item.ProjectID = selectedProject;
        return item;
      });
      const body = {
        OrderDate: header.OrderDate,
        Items: items
      };
      if (isProjectOrder) body.ProjectID = selectedProject;

      state.saving = true;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'در حال ثبت...';
      try {
        await PMS.Api.post('/procurement/orders', body);
        clearMessage();
        await load(true);
        showMessage(isProjectOrder ? 'سفارش مرتبط با پروژه ثبت شد.' : 'سفارش عمومی ثبت شد.', false);
      } catch (err) {
        showMessage(err.message || 'ثبت سفارش ناموفق بود.', true);
      } finally {
        state.saving = false;
        if (submit.isConnected) {
          submit.disabled = false;
          submit.textContent = 'ثبت سفارش';
        }
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
    const refresh = $('procurement-refresh');
    if (refresh && !refresh.dataset.bound) {
      refresh.dataset.bound = '1';
      refresh.addEventListener('click', function () { load(false); });
    }
    const permissions = window.PMS && window.PMS.Router && Array.isArray(window.PMS.Router.permissions)
      ? window.PMS.Router.permissions : [];
    const canManage = !!(window.PMS && window.PMS.Router && typeof window.PMS.Router.isAdmin === 'function' && window.PMS.Router.isAdmin()) || permissions.indexOf('PROCUREMENT_MANAGE') !== -1;
    ['procurement-create-project-order', 'procurement-create-general-order', 'procurement-create-receipt'].forEach(function (id) {
      const button = $(id);
      if (button) button.hidden = !canManage;
    });
    if (canManage) {
      [['procurement-create-project-order', function () { openOrderForm('PROJECT'); }],
       ['procurement-create-general-order', function () { openOrderForm('GENERAL'); }],
       ['procurement-create-receipt', openReceiptForm]].forEach(function (entry) {
        const button = $(entry[0]);
        if (button && !button.dataset.bound) {
          button.dataset.bound = '1';
          button.addEventListener('click', entry[1]);
        }
      });
    }
    load(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();