(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const state = { needs: [], orders: [], projects: [], loading: false, loadingProjectNeeds: false, saving: false };

  function jalaliDateToIso(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const ascii = raw.replace(/[۰-۹٠-٩]/g, function (digit) {
      const persian = '۰۱۲۳۴۵۶۷۸۹';
      const arabic = '٠١٢٣٤٥٦٧٨٩';
      const index = persian.indexOf(digit);
      return String(index >= 0 ? index : arabic.indexOf(digit));
    }).replace(/[.-]/g, '/');
    const match = ascii.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) throw new Error('تاریخ را به شکل شمسی سال/ماه/روز وارد کنید؛ مانند ۱۴۰۵/۰۷/۲۷.');
    const jy = Number(match[1]), jm = Number(match[2]), jd = Number(match[3]);
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) throw new Error('تاریخ شمسی معتبر نیست.');
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'
    });
    const start = Date.UTC(jy + 621, 2, 18);
    for (let offset = 0; offset < 371; offset++) {
      const date = new Date(start + offset * 86400000);
      const parts = {};
      formatter.formatToParts(date).forEach(function (part) {
        if (part.type === 'year' || part.type === 'month' || part.type === 'day') parts[part.type] = Number(part.value);
      });
      if (parts.year === jy && parts.month === jm && parts.day === jd) {
        return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
      }
    }
    throw new Error('این تاریخ شمسی معتبر نیست.');
  }

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
    const message = root && root.querySelector('.procurement-inline-message');
    if (message) message.remove();
  }

  function closeModal() {
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

  function projectCodeFor(id) {
    if (!id) return 'سفارش عمومی';
    const project = state.projects.find(function (item) {
      return String(projectId(item)) === String(id);
    });
    return project ? projectLabel(project) : 'کد پروژه نامشخص';
  }

  function parseDate(value) {
    if (!value) return null;
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
    const textValue = String(value).trim();
    const dateOnly = textValue.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
    const parsed = dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(textValue);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }

  function formatDate(value) {
    const parsed = parseDate(value);
    if (!parsed) return 'نامشخص';
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(parsed);
    } catch (error) {
      return new Intl.DateTimeFormat('fa-IR').format(parsed);
    }
  }

  function elapsedDays(startValue, endValue) {
    const start = parseDate(startValue);
    const end = parseDate(endValue);
    if (!start || !end) return null;
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return Math.max(0, Math.floor((endDay - startDay) / 86400000));
  }

  function daysSince(value) {
    return elapsedDays(value, new Date());
  }

  function statusBadge(label, kind) {
    return '<span class="procurement-status-badge is-' + kind + '">' + escape(label) + '</span>';
  }

  function bindCardToggles(container) {
    if (!container || container.dataset.cardToggleBound === '1') return;
    container.dataset.cardToggleBound = '1';
    container.addEventListener('click', function (event) {
      const button = event.target.closest('[data-procurement-toggle]');
      if (!button || !container.contains(button)) return;
      const targetId = button.getAttribute('aria-controls');
      const details = targetId ? document.getElementById(targetId) : null;
      if (!details) return;
      const opening = details.hidden;
      details.hidden = !opening;
      button.setAttribute('aria-expanded', opening ? 'true' : 'false');
      const hint = button.querySelector('.procurement-card-hint');
      if (hint) hint.textContent = opening ? 'بستن جزئیات' : 'مشاهده جزئیات';
      button.classList.toggle('is-expanded', opening);
    });
  }

  function renderNeeds() {
    const container = $('procurement-needs-table');
    if (!container) return;
    bindCardToggles(container);
    if (!state.needs.length) {
      container.innerHTML = '<div class="table-empty">نیازی ثبت نشده است.</div>';
      return;
    }
    const groups = new Map();
    state.needs.forEach(function (item) {
      const projectIdValue = item.ProjectID || '';
      const groupKey = projectIdValue ? String(projectIdValue) : '__unknown_project__';
      if (!groups.has(groupKey)) groups.set(groupKey, {
        label: projectIdValue ? projectCodeFor(projectIdValue) : 'پروژه نامشخص',
        items: []
      });
      const requested = Math.max(0, Number(item.RequestedQuantity || 0));
      const ordered = Math.min(requested, Math.max(0, Number(item.OrderedQuantity || 0)));
      const received = Math.min(ordered, Math.max(0, Number(item.ReceivedQuantity || 0)));
      const toOrder = Math.max(0, requested - ordered);
      const toReceive = Math.max(0, ordered - received);
      let label = 'تأمین کامل', kind = 'complete';
      if (toOrder > 0 && toReceive > 0) { label = 'نیاز به سفارش و دریافت'; kind = 'partial'; }
      else if (toOrder > 0) { label = 'در انتظار سفارش'; kind = 'waiting'; }
      else if (toReceive > 0) { label = received > 0 ? 'دریافت ناقص' : 'در انتظار دریافت'; kind = received > 0 ? 'partial' : 'delivery'; }
      groups.get(groupKey).items.push({ item, requested, received, toOrder, toReceive, label, kind });
    });
    const cards = Array.from(groups.values()).map(function (group, index) {
      const waitingOrder = group.items.filter(function (x) { return x.toOrder > 0; }).length;
      const waitingReceipt = group.items.filter(function (x) { return x.toReceive > 0; }).length;
      const completed = group.items.filter(function (x) { return x.toOrder === 0 && x.toReceive === 0; }).length;
      let overallLabel = 'همه اقلام تأمین شده', overallKind = 'complete';
      if (waitingOrder > 0 && waitingReceipt > 0) { overallLabel = 'نیاز به سفارش و دریافت'; overallKind = 'partial'; }
      else if (waitingOrder > 0) { overallLabel = 'در انتظار سفارش'; overallKind = 'waiting'; }
      else if (waitingReceipt > 0) { overallLabel = 'در انتظار دریافت'; overallKind = 'delivery'; }
      const detailId = 'procurement-needs-detail-' + index;
      const lines = group.items.map(function (entry) {
        const item = entry.item;
        return '<div class="procurement-need-item">' +
          '<div class="procurement-need-item-heading"><strong>' + escape(item.ItemName || 'ملزوم بدون نام') + '</strong>' +
          (item.ItemCode ? '<small>' + escape(item.ItemCode) + '</small>' : '') + '</div>' +
          '<div class="procurement-need-item-values">' +
          '<div><span>نیاز ثبت‌شده</span><strong>' + number(entry.requested) + ' ' + escape(item.Unit || '') + '</strong></div>' +
          '<div><span>در انتظار سفارش</span><strong class="' + (entry.toOrder > 0 ? 'procurement-quantity-warn' : '') + '">' + number(entry.toOrder) + '</strong></div>' +
          '<div><span>در انتظار دریافت</span><strong class="' + (entry.toReceive > 0 ? 'procurement-quantity-pending' : '') + '">' + number(entry.toReceive) + '</strong></div>' +
          '<div><span>دریافت‌شده</span><strong class="procurement-quantity-done">' + number(entry.received) + '</strong></div>' +
          '<div class="procurement-need-item-status">' + statusBadge(entry.label, entry.kind) + '</div>' +
          '</div></div>';
      }).join('');
      return '<section class="procurement-summary-card is-' + overallKind + '">' +
        '<button type="button" class="procurement-summary-card-head" data-procurement-toggle aria-expanded="false" aria-controls="' + detailId + '">' +
        '<span class="procurement-summary-card-main"><strong class="procurement-project-code">' + escape(group.label) + '</strong>' +
        '<span class="procurement-summary-card-meta">' + number(group.items.length) + ' قلم ملزوم</span></span>' +
        '<span class="procurement-summary-card-status">' + statusBadge(overallLabel, overallKind) +
        '<span class="procurement-card-hint">مشاهده جزئیات</span><span class="procurement-card-chevron" aria-hidden="true">⌄</span></span></button>' +
        '<div class="procurement-summary-card-stats"><span>در انتظار سفارش <b>' + number(waitingOrder) + '</b></span>' +
        '<span>در انتظار دریافت <b>' + number(waitingReceipt) + '</b></span><span>تأمین کامل <b>' + number(completed) + '</b></span></div>' +
        '<div class="procurement-summary-card-details" id="' + detailId + '" hidden><div class="procurement-needs-project-items">' + lines + '</div></div></section>';
    });
    container.innerHTML = '<div class="procurement-summary-grid">' + cards.join('') + '</div>';
  }

  function renderOrders() {
    const container = $('procurement-orders-table');
    if (!container) return;
    bindCardToggles(container);
    if (!state.orders.length) {
      container.innerHTML = '<div class="table-empty">سفارشی ثبت نشده است.</div>';
      return;
    }
    const needsById = {};
    state.needs.forEach(function (need) { if (need && need.ID) needsById[String(need.ID)] = need; });
    const cards = state.orders.map(function (order, index) {
      const orderDate = order.OrderDate || order.CreatedAt;
      const age = daysSince(orderDate);
      const items = Array.isArray(order.Items) ? order.Items : [];
      const projectLabels = [];
      items.forEach(function (line) {
        const linkedNeed = needsById[String(line.MaterialNeedID || '')];
        const ids = Array.isArray(line.ProjectIDs) && line.ProjectIDs.length ? line.ProjectIDs : [line.ProjectID || order.ProjectID || (linkedNeed && linkedNeed.ProjectID) || ''];
        ids.forEach(function (id) {
          const label = projectCodeFor(id);
          if (id && projectLabels.indexOf(label) === -1) projectLabels.push(label);
        });
      });
      const projectLabelText = projectLabels.length ? projectLabels.join('، ') : 'سفارش عمومی';
      const itemDetails = items.map(function (line) {
        const ordered = Math.max(0, Number(line.OrderedQuantity || 0));
        const received = Math.min(ordered, Math.max(0, Number(line.ReceivedQuantity || 0)));
        const remaining = Math.max(0, ordered - received);
        const surplus = Math.max(0, Number(line.SurplusQuantity) || 0);
        const priceKnown = line.UnitPrice !== '' && line.UnitPrice !== undefined && line.UnitPrice !== null && isFinite(Number(line.UnitPrice));
        const surplusCost = line.SurplusCost !== '' && line.SurplusCost !== undefined && line.SurplusCost !== null
          ? Number(line.SurplusCost) : (priceKnown ? surplus * Number(line.UnitPrice) : null);
        const receiptRecords = Array.isArray(line.Receipts) ? line.Receipts.slice().sort(function (a, b) {
          return (parseDate(a.ReceivedAt) || new Date(0)) - (parseDate(b.ReceivedAt) || new Date(0));
        }) : [];
        let cumulativeReceived = 0;
        let completedAt = null;
        receiptRecords.forEach(function (receipt) {
          cumulativeReceived += Math.max(0, Number(receipt.QuantityReceived) || 0);
          if (!completedAt && ordered > 0 && cumulativeReceived >= ordered) completedAt = receipt.ReceivedAt;
        });
        const receiptDates = receiptRecords.length
          ? '<div class="procurement-item-receipt-dates"><strong>تاریخ‌های دریافت:</strong>' +
            receiptRecords.map(function (receipt) { return '<span>' + escape(formatDate(receipt.ReceivedAt)) + ' — ' + number(receipt.QuantityReceived) + ' ' + escape(line.Unit || '') + '</span>'; }).join('') + '</div>'
          : received >= ordered && ordered > 0
            ? '<div class="procurement-item-receipt-dates"><strong>تاریخ دریافت:</strong><span>مقدار تحویل کامل ثبت شده؛ تاریخچه دریافت از سرور در دسترس نیست</span></div>'
            : '<div class="procurement-item-receipt-dates"><strong>تاریخ دریافت:</strong><span>هنوز دریافتی ثبت نشده</span></div>';
        const completionDays = completedAt ? elapsedDays(orderDate, completedAt) : null;
        const completionText = completedAt
          ? '<div class="procurement-item-completion"><strong>تاریخ تکمیل دریافت:</strong> ' + escape(formatDate(completedAt)) + ' <span>مدت از سفارش تا تحویل کامل: <b>' + number(completionDays === null ? 0 : completionDays) + ' روز</b></span></div>'
          : received >= ordered && ordered > 0
            ? '<div class="procurement-item-completion"><strong>تحویل کامل است؛</strong> تاریخ تکمیل دریافت در دسترس نیست، بنابراین مدت دقیق قابل محاسبه نیست.</div>'
            : '<div class="procurement-item-completion is-pending"><strong>مدت تا تحویل کامل:</strong> هنوز تکمیل نشده' + (age === null ? '' : '؛ ' + number(age) + ' روز از تاریخ سفارش گذشته') + '</div>';
        const status = remaining <= 0 ? statusBadge('تحویل کامل', 'complete') : (received > 0 ? statusBadge('تحویل ناقص', 'partial') : statusBadge('در انتظار دریافت', 'delivery'));
        return '<div class="procurement-order-line procurement-order-overview-line"><div class="procurement-line-title"><strong>' + escape(line.ItemName || 'ملزوم بدون نام') + '</strong>' +
          (line.ItemCode ? '<small>' + escape(line.ItemCode) + '</small>' : '') + '</div>' +
          '<div class="procurement-line-metrics"><span>سفارش: <b>' + number(ordered) + ' ' + escape(line.Unit || '') + '</b></span>' +
          '<span>دریافت: <b class="procurement-quantity-done">' + number(received) + '</b></span>' +
          '<span>مانده: <b class="' + (remaining > 0 ? 'procurement-quantity-pending' : 'procurement-quantity-done') + '">' + number(remaining) + '</b></span>' + status + '</div>' +
          receiptDates + completionText +
          (surplus > 0 ? '<div class="form-help procurement-surplus-line">مازاد خرید: ' + number(surplus) + ' ' + escape(line.Unit || '') + (surplusCost !== null ? '؛ ارزش مازاد: ' + number(surplusCost) : '؛ قیمت واحد ثبت نشده') + '</div>' : '') +
          '</div>';
      }).join('');
      const itemCount = items.length;
      const receivedCount = items.filter(function (line) { return Number(line.OrderedQuantity || 0) > 0 && Number(line.ReceivedQuantity || 0) >= Number(line.OrderedQuantity || 0); }).length;
      const partialCount = items.filter(function (line) { return Number(line.ReceivedQuantity || 0) > 0 && Number(line.ReceivedQuantity || 0) < Number(line.OrderedQuantity || 0); }).length;
      const pendingCount = Math.max(0, itemCount - receivedCount);
      let overallLabel = statusLabel(order.Status), overallKind = 'waiting';
      if (itemCount && receivedCount === itemCount) { overallLabel = 'تحویل کامل'; overallKind = 'complete'; }
      else if (receivedCount || partialCount) { overallLabel = 'تحویل ناقص'; overallKind = 'partial'; }
      else if (String(order.Status || '').toUpperCase() === 'CANCELLED') { overallLabel = 'لغوشده'; overallKind = 'waiting'; }
      else if (!itemCount) { overallLabel = statusLabel(order.Status || 'OPEN'); overallKind = 'waiting'; }
      const detailId = 'procurement-order-detail-' + index;
      return '<section class="procurement-summary-card is-' + overallKind + '">' +
        '<button type="button" class="procurement-summary-card-head" data-procurement-toggle aria-expanded="false" aria-controls="' + detailId + '">' +
        '<span class="procurement-summary-card-main"><strong class="procurement-project-code">' + escape(projectLabelText) + '</strong>' +
        '<span class="procurement-summary-card-meta">' + escape(order.OrderNumber || 'شماره سفارش ثبت نشده') + ' · ' + escape(order.SupplierName || 'تأمین‌کننده ثبت نشده') + '</span></span>' +
        '<span class="procurement-summary-card-status">' + statusBadge(overallLabel, overallKind) + '<span class="procurement-card-hint">مشاهده جزئیات</span><span class="procurement-card-chevron" aria-hidden="true">⌄</span></span></button>' +
        '<div class="procurement-summary-card-stats"><span>تاریخ سفارش <b>' + escape(formatDate(orderDate)) + '</b></span><span>مدت سپری‌شده <b>' + (age === null ? 'نامشخص' : number(age) + ' روز') + '</b></span><span>اقلام <b>' + number(itemCount) + '</b></span><span>در انتظار دریافت <b>' + number(pendingCount) + '</b></span></div>' +
        '<div class="procurement-summary-card-details" id="' + detailId + '" hidden><div class="procurement-order-detail-meta"><span>تأمین‌کننده: <b>' + escape(order.SupplierName || 'ثبت نشده') + '</b></span><span>وضعیت ثبت‌شده سفارش: <b>' + escape(statusLabel(order.Status)) + '</b></span></div>' +
        '<div class="procurement-needs-project-items">' + (itemDetails || '<div class="table-empty">اقلامی برای این سفارش ثبت نشده است.</div>') + '</div></div></section>';
    });
    container.innerHTML = '<div class="procurement-summary-grid">' + cards.join('') + '</div>';
  }

  function renderSummary(summary) {
    summary = summary || {};
    setText('procurement-needs-count', number(summary.activeNeeds !== undefined ? summary.activeNeeds : state.needs.length));
    setText('procurement-needs-open', number(summary.openNeeds !== undefined ? summary.openNeeds :
      state.needs.filter(function (x) { return Number(x.OrderedQuantity || 0) < Number(x.RequestedQuantity || 0); }).length));
    setText('procurement-orders-count', number(summary.activeOrders !== undefined ? summary.activeOrders : (summary.orders !== undefined ? summary.orders : state.orders.length)));
    setText('procurement-orders-open', number(summary.openOrders !== undefined ? summary.openOrders :
      state.orders.filter(function (x) { return String(x.Status).toUpperCase() !== 'RECEIVED'; }).length));
    setText('procurement-surplus-lines', number(summary.surplusLineCount || 0));
    setText('procurement-surplus-cost', number(summary.surplusCost || 0));
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
        PMS.Api.get('/procurement/orders'),
        loadProjectsForOrder()
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
    root.querySelector('[data-close-procurement]').addEventListener('click', closeModal);
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

  function receiptProjectOptions() {
    return [option('', 'انتخاب پروژه یا سفارش عمومی', true), option('__GENERAL__', 'سفارش عمومی', false)]
      .concat(state.projects.map(function (project) {
        return option(projectId(project), projectLabel(project), false);
      })).join('');
  }

  function orderItemRow(index, need) {
    need = need || {};
    const remaining = Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0));
    const quantity = need.ID ? (remaining > 0 ? remaining : '') : '';
    const needSummary = need.ID
      ? '<span class="procurement-need-note">نیاز اصلی: ' + number(need.RequestedQuantity) + ' ' + escape(need.Unit || '') + ' · سفارش قبلی: ' + number(need.OrderedQuantity) + ' · باقی‌مانده: ' + number(remaining) + (remaining === 0 ? ' · نیاز قبلاً کامل سفارش داده شده است' : '') + '</span>'
      : '<span class="procurement-need-note">قلم جدید؛ خارج از نیاز اصلی ثبت‌شده پروژه</span>';
    return '<div class="procurement-order-row" data-order-item="' + index + '">' +
      '<div class="procurement-order-row-head"><span class="procurement-row-number">ردیف ' + (index + 1) + '</span><button type="button" class="btn btn-light procurement-remove-row" data-remove-item aria-label="حذف ردیف">حذف</button></div>' +
      '<input type="hidden" name="MaterialNeedID" value="' + (need.ID ? escapeField(need.ID) : '') + '">' +
      '<div class="procurement-order-fields">' +
      '<label class="form-group procurement-field-name"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200" value="' + escapeField(need.ItemName) + '"></label>' +
      '<label class="form-group"><span>واحد اندازه‌گیری *</span><input name="Unit" required maxlength="100" value="' + escapeField(need.Unit) + '"></label>' +
      '<label class="form-group"><span>نیاز اصلی</span><input type="text" readonly value="' + escapeField(need.ID ? number(need.RequestedQuantity) : 'قلم جدید') + '"></label>' +
      '<label class="form-group"><span>مقدار سفارش *</span><input name="OrderedQuantity" type="number" min="0.001" step="any" required value="' + (quantity === '' ? '' : escapeField(quantity)) + '"></label>' +
      '<label class="form-group"><span>قیمت واحد (اختیاری)</span><input name="UnitPrice" type="number" min="0" step="any"></label>' +
      '<label class="form-group"><span>توضیحات قلم</span><input name="Notes" maxlength="500" value="' + escapeField(need.Notes) + '"></label>' +
      '</div><div class="procurement-row-footer">' + needSummary + '<div class="form-help procurement-surplus-preview" data-surplus-preview hidden></div></div></div>';
  }

  function updateSurplusPreview(row, isProjectOrder) {
    const preview = row.querySelector('[data-surplus-preview]');
    if (!preview) return;
    if (!isProjectOrder) {
      preview.hidden = true;
      return;
    }
    const quantityField = row.querySelector('[name="OrderedQuantity"]');
    const needField = row.querySelector('[name="MaterialNeedID"]');
    const quantity = Number(quantityField && quantityField.value || 0);
    const need = state.needs.find(function (item) {
      return String(item.ID) === String(needField && needField.value || '');
    });
    const remaining = need
      ? Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0))
      : 0;
    const surplus = Math.max(0, quantity - remaining);
    preview.textContent = surplus > 0
      ? 'مازاد خرید قابل ثبت: ' + number(surplus) + ' ' + String((row.querySelector('[name="Unit"]') || {}).value || (need && need.Unit) || '')
      : 'مازاد خریدی برای این ردیف محاسبه نشده است.';
    preview.hidden = false;
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
    // Only show needs that still have an un-ordered quantity. The original need remains unchanged.
    const projectNeeds = (Array.isArray(needs) ? needs : []).filter(function (need) {
      return Math.max(0, Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0)) > 0;
    });
    if (!projectNeeds.length) {
      itemsRoot.innerHTML = orderItemRow(0);
      return;
    }
    itemsRoot.innerHTML = projectNeeds.map(function (need, index) {
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
      '<label class="form-group"><span>تأمین‌کننده</span><input name="SupplierName" maxlength="200"></label>' +
      '<label class="form-group"><span>تاریخ سفارش (اختیاری)</span><input name="OrderDate" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۷/۲۷"></label>' +
      '<label class="form-group"><span>تاریخ تحویل مورد انتظار</span><input name="ExpectedDeliveryDate" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۷/۲۷"></label>' +
      '<label class="form-group"><span>توضیحات سفارش</span><input name="Notes" maxlength="1000"></label>' +
      '</div><section class="procurement-items-section"><div class="procurement-items-heading"><div><h4>اقلام سفارش</h4><p>اقلام را در ردیف‌های زیر بررسی یا ویرایش کنید.</p></div><button type="button" class="btn btn-secondary" id="procurement-add-order-item">+ افزودن ردیف</button></div>' +
      '<div class="procurement-order-list" id="procurement-order-items">' + orderItemRow(0) + '</div></section>' +
      '<div class="modal-actions procurement-submit-actions"><button type="submit" class="btn btn-primary">ثبت سفارش</button></div></form>');

    const itemsRoot = root.querySelector('#procurement-order-items');
    const projectSelect = root.querySelector('[name="ProjectID"]');
    if (projectSelect) {
      projectSelect.addEventListener('change', async function () {
        if (!projectSelect.value) {
          itemsRoot.innerHTML = orderItemRow(0);
          clearMessage();
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
          itemsRoot.querySelectorAll('[data-order-item]').forEach(function (row) {
            updateSurplusPreview(row, isProjectOrder);
          });
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
      const rows = itemsRoot.querySelectorAll('[data-order-item]');
      updateSurplusPreview(rows[rows.length - 1], isProjectOrder);
    });
    itemsRoot.addEventListener('input', function (event) {
      if (event.target.matches('[name="OrderedQuantity"], [name="Unit"], [name="ItemName"]')) {
        const row = event.target.closest('[data-order-item]');
        if (row) updateSurplusPreview(row, isProjectOrder);
      }
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
      let orderDateIso = '', expectedDeliveryDateIso = '';
      try {
        orderDateIso = jalaliDateToIso(header.OrderDate);
        expectedDeliveryDateIso = jalaliDateToIso(header.ExpectedDeliveryDate);
      } catch (dateError) {
        showMessage(dateError.message || 'تاریخ سفارش معتبر نیست.', true);
        return;
      }
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
          UnitPrice: get('UnitPrice') === '' ? '' : Number(get('UnitPrice')),
          Notes: get('Notes')
        };
        if (!item.MaterialNeedID) delete item.MaterialNeedID;
        if (isProjectOrder && selectedProject) item.ProjectID = selectedProject;
        return item;
      });
      const body = {
        SupplierName: header.SupplierName || '',
        OrderDate: orderDateIso,
        ExpectedDeliveryDate: expectedDeliveryDateIso,
        Notes: header.Notes || '',
        Items: items
      };
      if (isProjectOrder) body.ProjectID = selectedProject;

      state.saving = true;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'در حال ثبت...';
      try {
        await PMS.Api.post('/procurement/orders', body);
        closeModal();
        await load();
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
  async function openReceiptForm() {
    try {
      await loadProjectsForOrder();
    } catch (error) {
      showMessage('دریافت فهرست پروژه‌ها ناموفق بود. لطفاً دوباره تلاش کنید.', true);
      return;
    }

    const root = modal('ثبت دریافت واقعی انبار',
      '<form id="procurement-receipt-form">' +
      '<div class="form-grid procurement-receipt-header">' +
      '<label class="form-group"><span>پروژه / نوع سفارش *</span><select name="ProjectID" required>' + receiptProjectOptions() + '</select></label>' +
      '<label class="form-group"><span>تاریخ دریافت</span><input name="ReceivedAt" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۷/۲۷"></label>' +
      '<label class="form-group"><span>توضیحات دریافت</span><input name="Notes" maxlength="500" placeholder="اختیاری"></label>' +
      '</div>' +
      '<section class="procurement-items-section procurement-receipt-section">' +
      '<div class="procurement-items-heading"><div><h4>اقلام قابل دریافت</h4><p>پروژه را انتخاب کنید یا برای سفارش عمومی «سفارش عمومی» را برگزینید.</p></div></div>' +
      '<div id="procurement-receipt-items" class="procurement-receipt-items"><div class="table-empty">ابتدا پروژه را انتخاب کنید.</div></div>' +
      '</section>' +
      '<div class="procurement-receipt-summary" id="procurement-receipt-summary" hidden></div>' +
      '<div class="modal-actions procurement-submit-actions"><button type="submit" class="btn btn-primary">ثبت دریافت اقلام انتخاب‌شده</button></div>' +
      '</form>');

    const form = root.querySelector('#procurement-receipt-form');
    const projectSelect = form.elements.ProjectID;
    const itemsContainer = root.querySelector('#procurement-receipt-items');
    const summary = root.querySelector('#procurement-receipt-summary');
    const receiveDate = form.elements.ReceivedAt;

    function projectOrderItems(projectId) {
      const entries = [];
      const needsById = {};
      state.needs.forEach(function (need) {
        if (need && need.ID) needsById[String(need.ID)] = need;
      });
      state.orders.forEach(function (order) {
        (Array.isArray(order.Items) ? order.Items : []).forEach(function (item) {
          const need = needsById[String(item.MaterialNeedID || '')];
          const projectIds = Array.isArray(item.ProjectIDs) ? item.ProjectIDs.map(String) : [];
          const legacyProjectId = item.ProjectID || order.ProjectID || (need && need.ProjectID) || '';
          const general = projectIds.length === 0 && !legacyProjectId;
          if (projectId === '__GENERAL__' ? !general : !(projectIds.includes(String(projectId)) || String(legacyProjectId) === String(projectId))) return;

          const allocations = Array.isArray(item.Allocations) ? item.Allocations : [];
          const hasProjectAllocations = allocations.length > 0;
          const allocated = hasProjectAllocations
            ? allocations.filter(function (allocation) { return String(allocation.ProjectID || '') === String(projectId); })
                .reduce(function (sum, allocation) { return sum + Math.max(0, Number(allocation.AllocatedQuantity) || 0); }, 0)
            : Math.max(0, Number(item.OrderedQuantity || 0));
          const receiptRecords = Array.isArray(item.Receipts) ? item.Receipts : [];
          const receivedForSelection = hasProjectAllocations
            ? receiptRecords.filter(function (receipt) { return String(receipt.ProjectID || '') === String(projectId); })
                .reduce(function (sum, receipt) { return sum + Math.max(0, Number(receipt.QuantityReceived) || 0); }, 0)
            : Math.max(0, Number(item.ReceivedQuantity || 0));
          const ordered = projectId === '__GENERAL__' ? Math.max(0, Number(item.OrderedQuantity || 0)) : allocated;
          const received = projectId === '__GENERAL__' ? Math.max(0, Number(item.ReceivedQuantity || 0)) : receivedForSelection;
          entries.push({
            order: order,
            item: item,
            ordered: ordered,
            received: received,
            remaining: Math.max(0, ordered - received),
            projectId: projectId === '__GENERAL__' ? '' : String(projectId)
          });
        });
      });
      return entries;
    }

    function renderReceiptItems() {
      const projectId = projectSelect.value;
      if (!projectId) {
        itemsContainer.innerHTML = '<div class="table-empty">ابتدا پروژه یا سفارش عمومی را انتخاب کنید.</div>';
        summary.hidden = true;
        return;
      }
      const entries = projectOrderItems(projectId);
      if (!entries.length) {
        itemsContainer.innerHTML = '<div class="table-empty">برای این پروژه سفارشی ثبت نشده است.</div>';
        summary.hidden = true;
        return;
      }
      itemsContainer.innerHTML = '<div class="procurement-receipt-list">' + entries.map(function (entry, index) {
        const item = entry.item;
        const disabled = entry.remaining <= 0;
        return '<div class="procurement-receipt-row' + (disabled ? ' is-complete' : '') + '" data-receipt-row="' + index + '">' +
          '<label class="procurement-receipt-select"><input type="checkbox" name="SelectedItem" value="' + escapeField(item.ID) + '"' + (disabled ? ' disabled' : '') + '><span class="procurement-receipt-checkmark"></span></label>' +
          '<div class="procurement-receipt-item-info"><strong>' + escape(item.ItemName || 'ملزوم') + '</strong>' +
          '<span>' + escape(entry.order.OrderNumber || 'سفارش') + (item.Unit ? ' · ' + escape(item.Unit) : '') + '</span>' +
          '<small>سفارش: ' + number(entry.ordered) + ' · دریافت‌شده: ' + number(entry.received) + ' · باقی‌مانده: ' + number(entry.remaining) + '</small></div>' +
          '<label class="procurement-receipt-quantity"><span>مقدار دریافتی</span><input type="number" name="ReceiptQuantity" min="0.001" step="any" max="' + entry.remaining + '" value="' + (disabled ? '' : entry.remaining) + '" disabled placeholder="مقدار"></label>' +
          (disabled ? '<span class="procurement-receipt-status">دریافت کامل</span>' : '') +
          '</div>';
      }).join('') + '</div>';
      summary.hidden = false;
      updateReceiptSummary();
    }

    function updateReceiptSummary() {
      const rows = Array.from(itemsContainer.querySelectorAll('[data-receipt-row]'));
      let selectedCount = 0;
      let selectedQuantity = 0;
      rows.forEach(function (row) {
        const checkbox = row.querySelector('[name="SelectedItem"]');
        const quantity = row.querySelector('[name="ReceiptQuantity"]');
        if (checkbox && checkbox.checked && quantity && !quantity.disabled) {
          selectedCount++;
          selectedQuantity += Number(quantity.value || 0);
        }
      });
      summary.textContent = selectedCount
        ? 'اقلام انتخاب‌شده: ' + number(selectedCount) + ' · مجموع مقدار دریافتی: ' + number(selectedQuantity)
        : 'برای ثبت دریافت، یک یا چند قلم را انتخاب کنید.';
    }

    projectSelect.addEventListener('change', renderReceiptItems);
    itemsContainer.addEventListener('change', function (event) {
      if (event.target.matches('[name="SelectedItem"]')) {
        const row = event.target.closest('[data-receipt-row]');
        const quantity = row && row.querySelector('[name="ReceiptQuantity"]');
        if (quantity) quantity.disabled = !event.target.checked;
      }
      updateReceiptSummary();
    });
    itemsContainer.addEventListener('input', updateReceiptSummary);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (state.saving) return;
      const rows = Array.from(itemsContainer.querySelectorAll('[data-receipt-row]'));
      const selected = rows.filter(function (row) {
        const checkbox = row.querySelector('[name="SelectedItem"]');
        return checkbox && checkbox.checked;
      }).map(function (row) {
        const checkbox = row.querySelector('[name="SelectedItem"]');
        const quantity = row.querySelector('[name="ReceiptQuantity"]');
        const entry = projectOrderItems(projectSelect.value).find(function (x) {
          return String(x.item.ID) === String(checkbox.value);
        });
        return { itemId: checkbox.value, quantity: Number(quantity && quantity.value), entry: entry };
      });

      if (!selected.length) {
        showMessage('لطفاً دست‌کم یک قلم را برای دریافت انتخاب کنید.', true);
        return;
      }
      const invalid = selected.find(function (x) {
        return !x.entry || !Number.isFinite(x.quantity) || x.quantity <= 0 || x.quantity > x.entry.remaining;
      });
      if (invalid) {
        showMessage('مقدار دریافت باید بیشتر از صفر و حداکثر برابر با باقی‌مانده همان قلم باشد.', true);
        return;
      }

      state.saving = true;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'در حال ثبت دریافت‌ها...';
      try {
        const receipts = selected.map(function (receipt) {
          const body = {
            PurchaseOrderItemID: receipt.itemId,
            ProjectID: projectSelect.value === '__GENERAL__' ? '' : projectSelect.value,
            QuantityReceived: receipt.quantity,
            Notes: form.elements.Notes.value || ''
          };
          if (receiveDate.value) body.ReceivedAt = new Date(jalaliDateToIso(receiveDate.value) + 'T12:00:00Z').toISOString();
          return body;
        });
        await PMS.Api.post('/procurement/receipts/batch', { Receipts: receipts });
        closeModal();
        await load();
        showMessage('دریافت ' + number(selected.length) + ' قلم با موفقیت ثبت شد.', false);
      } catch (err) {
        showMessage(err.message || 'ثبت دریافت ناموفق بود؛ هیچ قلمی نباید ثبت شده باشد. وضعیت سفارش‌ها را دوباره بررسی کنید.', true);
      } finally {
        state.saving = false;
        if (submit.isConnected) {
          submit.disabled = false;
          submit.textContent = 'ثبت دریافت اقلام انتخاب‌شده';
        }
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