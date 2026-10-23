(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const state = { needs: [], orders: [], projects: [], loading: false, loadingProjectNeeds: false, saving: false, filters: { needs: { status: 'active', query: '' }, orders: { status: 'active', query: '' } } };

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
      const printButton = event.target.closest('[data-print-order-sheet]');
      if (printButton && container.contains(printButton)) {
        event.preventDefault(); event.stopPropagation();
        const orderIndex = Number(printButton.getAttribute('data-print-order-sheet'));
        const order = Number.isInteger(orderIndex) ? state.orders[orderIndex] : null;
        if (order) openOrderSupplySheet(order);
        return;
      }
      const receiveButton = event.target.closest('[data-receive-order]');
      if (receiveButton && container.contains(receiveButton)) {
        event.preventDefault(); event.stopPropagation();
        openReceiptForm({ orderId: receiveButton.getAttribute('data-receive-order') || '', itemId: receiveButton.getAttribute('data-receive-item') || '', projectId: receiveButton.getAttribute('data-receive-project') || '' });
        return;
      }
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
      const received = Math.min(requested, Math.max(0, Number(item.ReceivedQuantity || 0)));
      const toOrder = Math.max(0, Number(item.RemainingToOrderQuantity !== undefined ? item.RemainingToOrderQuantity : requested - ordered));
      const toReceive = Math.max(0, Number(item.RemainingDeliveryQuantity !== undefined ? item.RemainingDeliveryQuantity : ordered - received));
      const overOrdered = Math.max(0, Number(item.OverOrderedQuantity || 0));
      const needsReview = String(item.Status || '').toUpperCase() === 'NEEDS_REVIEW';
      let label = needsReview ? 'بازبینی نیاز پس از ابطال رویداد' : (overOrdered > 0 ? 'خرید مازاد؛ نیازمند بررسی' : 'تأمین کامل');
      let kind = (needsReview || overOrdered > 0) ? 'partial' : 'complete';
      if (needsReview) { /* Keep the reconciliation warning as the primary status. */ }
      else if (toOrder > 0 && toReceive > 0) { label = 'نیاز به سفارش و دریافت'; kind = 'partial'; }
      else if (toOrder > 0) { label = 'در انتظار سفارش'; kind = 'waiting'; }
      else if (toReceive > 0) { label = received > 0 ? 'دریافت ناقص' : 'در انتظار دریافت'; kind = received > 0 ? 'partial' : 'delivery'; }
      groups.get(groupKey).items.push({ item, requested, received, toOrder, toReceive, overOrdered, needsReview, label, kind });
    });
    const cards = Array.from(groups.values()).map(function (group, index) {
      const waitingOrder = group.items.filter(function (x) { return x.toOrder > 0; }).length;
      const waitingReceipt = group.items.filter(function (x) { return x.toReceive > 0; }).length;
      const overOrderedCount = group.items.filter(function (x) { return x.overOrdered > 0; }).length;
      const needsReviewCount = group.items.filter(function (x) { return x.needsReview; }).length;
      const completed = group.items.filter(function (x) { return x.toOrder === 0 && x.toReceive === 0 && x.overOrdered === 0 && !x.needsReview; }).length;
      let overallLabel = 'همه اقلام تأمین شده', overallKind = 'complete';
      if (needsReviewCount > 0) { overallLabel = 'نیازمند بازبینی'; overallKind = 'partial'; }
      else if (overOrderedCount > 0) { overallLabel = 'خرید مازاد؛ نیازمند بررسی'; overallKind = 'partial'; }
      else if (waitingOrder > 0 && waitingReceipt > 0) { overallLabel = 'نیاز به سفارش و دریافت'; overallKind = 'partial'; }
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
          (Number(item.OverOrderedQuantity || 0) > 0 ? '<div><span>خرید مازاد</span><strong class="procurement-quantity-warn">' + number(item.OverOrderedQuantity) + '</strong></div>' : '') +
          '<div class="procurement-need-item-status">' + statusBadge(entry.label, entry.kind) + '</div>' +
          '</div></div>';
      }).join('');
      const filterStatus = needsReviewCount > 0 || overOrderedCount > 0 || (waitingOrder > 0 && waitingReceipt > 0) ? 'partial' : (waitingOrder > 0 ? 'waiting-order' : (waitingReceipt > 0 ? 'waiting-receipt' : 'complete'));
      return '<section class="procurement-summary-card is-' + overallKind + '" data-procurement-card data-filter-status="' + filterStatus + '">' +
        '<button type="button" class="procurement-summary-card-head" data-procurement-toggle aria-expanded="false" aria-controls="' + detailId + '">' +
        '<span class="procurement-summary-card-main"><strong class="procurement-project-code">' + escape(group.label) + '</strong>' +
        '<span class="procurement-summary-card-meta">' + number(group.items.length) + ' قلم ملزوم</span></span>' +
        '<span class="procurement-summary-card-status">' + statusBadge(overallLabel, overallKind) +
        '<span class="procurement-card-hint">مشاهده جزئیات</span><span class="procurement-card-chevron" aria-hidden="true">⌄</span></span></button>' +
        '<div class="procurement-summary-card-stats"><span>در انتظار سفارش <b>' + number(waitingOrder) + '</b></span>' +
        '<span>در انتظار دریافت <b>' + number(waitingReceipt) + '</b></span><span>خرید مازاد <b>' + number(overOrderedCount) + '</b></span><span>تأمین کامل <b>' + number(completed) + '</b></span></div>' +
        '<div class="procurement-summary-card-details" id="' + detailId + '" hidden><div class="procurement-needs-project-items">' + lines + '</div></div></section>';
    });
    container.innerHTML = '<div class="procurement-summary-grid">' + cards.join('') + '</div>';
    applyProcurementFilters('needs');
  }

  function applyProcurementFilters(type) {
    const container = $(type === 'needs' ? 'procurement-needs-table' : 'procurement-orders-table');
    if (!container) return;
    const controls = document.querySelector('[data-procurement-controls="' + type + '"]');
    const filter = state.filters[type] || { status: 'active', query: '' };
    const cards = Array.from(container.querySelectorAll('[data-procurement-card]'));
    let visible = 0;
    cards.forEach(function (card) {
      const status = card.getAttribute('data-filter-status') || '';
      const statusMatch = filter.status === 'all' ||
        (filter.status === 'active'
          ? (type === 'needs'
              ? status === 'waiting-order' || status === 'partial'
              : status !== 'complete' && status !== 'cancelled')
          : status === filter.status);
      const queryMatch = !filter.query || String(card.textContent || '').toLocaleLowerCase().indexOf(filter.query.toLocaleLowerCase()) !== -1;
      const show = statusMatch && queryMatch;
      card.hidden = !show;
      if (show) visible++;
    });
    let empty = container.querySelector('[data-procurement-filter-empty]');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'table-empty procurement-filter-empty';
      empty.setAttribute('data-procurement-filter-empty', '1');
      container.appendChild(empty);
    }
    empty.hidden = visible > 0 || cards.length === 0;
    empty.textContent = filter.query ? 'موردی با این عبارت و وضعیت پیدا نشد.' : 'موردی با این وضعیت برای نمایش وجود ندارد.';
  }

  function bindProcurementFilters() {
    document.querySelectorAll('[data-procurement-controls]').forEach(function (controls) {
      if (controls.dataset.bound === '1') return;
      controls.dataset.bound = '1';
      const type = controls.getAttribute('data-procurement-controls');
      const search = controls.querySelector('[data-procurement-search]');
      const status = controls.querySelector('[data-procurement-status]');
      if (search) search.addEventListener('input', function () {
        state.filters[type].query = String(search.value || '').trim();
        applyProcurementFilters(type);
      });
      if (status) status.addEventListener('change', function () {
        state.filters[type].status = status.value || 'active';
        applyProcurementFilters(type);
      });
    });
  }

  function canManageProcurement() {
    const permissions = window.PMS && window.PMS.Router && Array.isArray(window.PMS.Router.permissions) ? window.PMS.Router.permissions : [];
    return !!(window.PMS && window.PMS.Router && typeof window.PMS.Router.isAdmin === 'function' && window.PMS.Router.isAdmin()) || permissions.indexOf('PROCUREMENT_MANAGE') !== -1;
  }

  function openOrderSupplySheet(order) {
    const items = Array.isArray(order.Items) ? order.Items : [];
    const needsById = {};
    state.needs.forEach(function (need) { if (need && need.ID) needsById[String(need.ID)] = need; });
    const projectLabels = [];
    items.forEach(function (line) {
      const linkedNeed = needsById[String(line.MaterialNeedID || '')];
      const ids = Array.isArray(line.ProjectIDs) && line.ProjectIDs.length
        ? line.ProjectIDs
        : [line.ProjectID || order.ProjectID || (linkedNeed && linkedNeed.ProjectID) || ''];
      ids.forEach(function (id) {
        if (!id) return;
        const label = projectCodeFor(id);
        if (projectLabels.indexOf(label) === -1) projectLabels.push(label);
      });
    });
    const projectText = projectLabels.length ? projectLabels.join('، ') : 'سفارش عمومی';
    const itemRows = items.map(function (line, index) {
      const color = line.ColorBreakdown || line.Colors || line.Color || line.Colour || '';
      const description = line.Description || line.Notes || '';
      return '<tr><td class="num">' + number(index + 1) + '</td><td><strong>' + escape(line.ItemName || 'ملزوم بدون نام') + '</strong>' +
        (line.ItemCode ? '<div class="sub">' + escape(line.ItemCode) + '</div>' : '') + '</td>' +
        '<td class="qty">' + number(line.OrderedQuantity || 0) + '</td><td>' + escape(line.Unit || '') + '</td>' +
        '<td class="color-cell">' + (color ? escape(color) : '&nbsp;') + '</td><td class="desc-cell">' + (description ? escape(description) : '&nbsp;') + '</td></tr>';
    }).join('');
    const date = formatDate(order.OrderDate || order.CreatedAt);
    const orderNo = order.OrderNumber || order.ID || order.PurchaseOrderID || '—';
    const notes = order.Notes || '';
    const win = window.open('', '_blank');
    if (!win) {
      window.alert('باز شدن برگه مسدود شد. اجازه بازشدن پنجره برای این سایت را فعال کنید و دوباره تلاش کنید.');
      return;
    }
    const page = '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>برگه درخواست خرید - ' + escape(orderNo) + '</title><style>' +
      '*{box-sizing:border-box}body{margin:0;background:#eee;color:#111;font-family:Tahoma,Arial,sans-serif}.toolbar{position:sticky;top:0;z-index:2;background:#222;color:#fff;padding:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.toolbar button{border:1px solid #fff;background:#fff;color:#111;border-radius:5px;padding:9px 15px;font:inherit;cursor:pointer}.sheet-wrap{padding:20px}.sheet{width:794px;min-height:1123px;margin:0 auto;background:#fff;padding:34px;border:1px solid #111;box-shadow:0 3px 14px #bbb;direction:rtl;font-size:13px}.sheet-header{display:flex;justify-content:space-between;align-items:center;border:2px solid #111;padding:14px;margin-bottom:14px}.brand{font-size:22px;font-weight:bold}.subtitle{font-size:12px;margin-top:6px}.stamp{border:1px solid #111;padding:10px;text-align:center;min-width:140px;line-height:1.9}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}.meta div{border:1px solid #333;padding:9px;min-height:37px}.label{font-weight:bold}.items{width:100%;border-collapse:collapse;table-layout:fixed}.items th,.items td{border:1px solid #111;padding:9px 7px;text-align:right;vertical-align:middle;overflow-wrap:anywhere}.items th{background:#eee;text-align:center}.items .num{width:6%;text-align:center}.items td:nth-child(2){width:27%}.items .qty{width:12%;text-align:center}.items td:nth-child(4){width:9%;text-align:center}.items .color-cell{width:21%;min-height:45px}.items .desc-cell{width:25%}.sub{font-size:10px;margin-top:4px}.section-title{font-size:14px;font-weight:bold;border:1px solid #111;padding:8px;margin-top:16px}.swatch{height:210px;border:1px solid #111;border-top:0;position:relative;background:#fff}.swatch:before{content:"";position:absolute;inset:10px;border:1px dashed #aaa}.swatch-label{position:absolute;top:14px;right:14px;background:#fff;padding:4px 8px;font-size:11px}.notes{min-height:48px;border:1px solid #111;border-top:0;padding:10px;white-space:pre-wrap}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.signatures div{border:1px solid #111;height:76px;padding:8px;font-weight:bold}.foot{border-top:1px solid #111;margin-top:18px;padding-top:8px;font-size:10px;display:flex;justify-content:space-between}.num,.qty{font-variant-numeric:tabular-nums}@media print{body{background:#fff}.toolbar{display:none}.sheet-wrap{padding:0}.sheet{width:100%;min-height:0;margin:0;border:0;box-shadow:none;padding:10mm;page-break-after:avoid}@page{size:A4;margin:0}}' +
      '</style></head><body><div class="toolbar"><button type="button" onclick="window.print()">چاپ / ذخیره PDF</button><button type="button" onclick="downloadPng()">دانلود عکس PNG</button><button type="button" onclick="window.close()">بستن</button></div>' +
      '<div class="sheet-wrap"><main class="sheet" id="sheet"><header class="sheet-header"><div><div class="brand">برگه درخواست خرید ملزومات</div><div class="subtitle">فرم رسمی درخواست تأمین ملزومات تولید</div></div><div class="stamp"><b>شماره سفارش</b><br>' + escape(orderNo) + '<br><b>تاریخ</b> ' + escape(date) + '</div></header>' +
      '<section class="meta"><div><span class="label">کد / عنوان پروژه:</span> ' + escape(projectText) + '</div><div><span class="label">تأمین‌کننده:</span> ' + escape(order.SupplierName || '................................') + '</div>' +
      '<div><span class="label">تاریخ تحویل مورد انتظار:</span> ' + escape(order.ExpectedDeliveryDate ? formatDate(order.ExpectedDeliveryDate) : '................................') + '</div><div><span class="label">تعداد اقلام:</span> ' + number(items.length) + '</div></section>' +
      '<table class="items"><thead><tr><th class="num">ردیف</th><th>نام ملزوم / کد</th><th class="qty">مقدار</th><th>واحد</th><th class="color-cell">رنگ‌بندی</th><th class="desc-cell">توضیحات</th></tr></thead><tbody>' +
      (itemRows || '<tr><td colspan="6">قلمی برای این سفارش ثبت نشده است.</td></tr>') + '</tbody></table>' +
      '<div class="section-title">محل چسباندن نمونه پارچه / نمونه رنگ</div><div class="swatch"><span class="swatch-label">نمونه پارچه را در این قسمت بچسبانید</span></div>' +
      '<div class="section-title">توضیحات تکمیلی</div><div class="notes">' + (notes ? escape(notes) : ' ') + '</div>' +
      '<section class="signatures"><div>تنظیم‌کننده برگه<br><br>نام و امضا:</div><div>مسئول خرید<br><br>نام و امضا:</div><div>تأیید نهایی<br><br>نام و امضا:</div></section>' +
      '<footer class="foot"><span>فرم درخواست خرید ملزومات</span><span>این برگه همراه سفارش به مسئول خرید تحویل شود.</span></footer></main></div>' +
      '<script>function downloadPng(){var el=document.getElementById("sheet");var css=' + JSON.stringify(' *{box-sizing:border-box}body{margin:0;background:#fff;color:#111;font-family:Tahoma,Arial,sans-serif}.sheet{width:794px;min-height:1123px;background:#fff;padding:34px;direction:rtl;font-size:13px}.sheet-header{display:flex;justify-content:space-between;align-items:center;border:2px solid #111;padding:14px;margin-bottom:14px}.brand{font-size:22px;font-weight:bold}.subtitle{font-size:12px;margin-top:6px}.stamp{border:1px solid #111;padding:10px;text-align:center;min-width:140px;line-height:1.9}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}.meta div{border:1px solid #333;padding:9px;min-height:37px}.label{font-weight:bold}.items{width:100%;border-collapse:collapse;table-layout:fixed}.items th,.items td{border:1px solid #111;padding:9px 7px;text-align:right;vertical-align:middle;overflow-wrap:anywhere}.items th{background:#eee;text-align:center}.items .num{width:6%;text-align:center}.items td:nth-child(2){width:27%}.items .qty{width:12%;text-align:center}.items td:nth-child(4){width:9%;text-align:center}.items .color-cell{width:21%}.items .desc-cell{width:25%}.sub{font-size:10px;margin-top:4px}.section-title{font-size:14px;font-weight:bold;border:1px solid #111;padding:8px;margin-top:16px}.swatch{height:210px;border:1px solid #111;border-top:0;position:relative;background:#fff}.swatch:before{content:"";position:absolute;inset:10px;border:1px dashed #aaa}.swatch-label{position:absolute;top:14px;right:14px;background:#fff;padding:4px 8px;font-size:11px}.notes{min-height:48px;border:1px solid #111;border-top:0;padding:10px;white-space:pre-wrap}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.signatures div{border:1px solid #111;height:76px;padding:8px;font-weight:bold}.foot{border-top:1px solid #111;margin-top:18px;padding-top:8px;font-size:10px;display:flex;justify-content:space-between}.num,.qty{font-variant-numeric:tabular-nums}') + ';var html=el.outerHTML;var svg="<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"794\\" height=\\"1123\\"><foreignObject width=\\"100%\\" height=\\"100%\\"><div xmlns=\\"http://www.w3.org/1999/xhtml\\" style=\\"width:794px;height:1123px;background:#fff;\\"><style>"+css+"</style>"+html+"</div></foreignObject></svg>";var blob=new Blob([svg],{type:"image/svg+xml;charset=utf-8"});var url=URL.createObjectURL(blob);var img=new Image();img.onload=function(){var c=document.createElement("canvas");c.width=1588;c.height=2246;var ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.scale(2,2);ctx.drawImage(img,0,0,794,1123);URL.revokeObjectURL(url);c.toBlob(function(png){if(!png){alert("ساخت عکس ناموفق بود؛ از چاپ PDF استفاده کنید.");return;}var a=document.createElement("a");a.href=URL.createObjectURL(png);a.download="supply-order-' + String(orderNo).replace(/[^a-zA-Z0-9_-]/g,'') + '.png";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);},"image/png");};img.onerror=function(){URL.revokeObjectURL(url);alert("ساخت عکس در این مرورگر پشتیبانی نشد؛ از چاپ PDF استفاده کنید.");};img.src=url;}</script></body></html>';
    win.document.open();
    win.document.write(page);
    win.document.close();
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
      const isCancelledOrder = String(order.Status || '').toUpperCase() === 'CANCELLED';
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
        const linkedNeed = needsById[String(line.MaterialNeedID || '')];
        const linkedProjects = Array.isArray(line.ProjectIDs) && line.ProjectIDs.length ? line.ProjectIDs.map(String) : [line.ProjectID || order.ProjectID || (linkedNeed && linkedNeed.ProjectID) || ''].filter(Boolean).map(String);
        const receiveProject = linkedProjects.length === 1 ? linkedProjects[0] : '';
        const receiveButton = remaining > 0 && !isCancelledOrder && canManageProcurement() ? '<button type="button" class="btn btn-primary procurement-receive-item-button" data-receive-order="' + escapeField(order.ID || order.PurchaseOrderID || '') + '" data-receive-item="' + escapeField(line.ID || line.PurchaseOrderItemID || '') + '" data-receive-project="' + escapeField(receiveProject) + '">تحویل گرفتن</button>' : '';
        return '<div class="procurement-order-line procurement-order-overview-line"><div class="procurement-line-title"><strong>' + escape(line.ItemName || 'ملزوم بدون نام') + '</strong>' +
          (line.ItemCode ? '<small>' + escape(line.ItemCode) + '</small>' : '') + '</div>' +
          '<div class="procurement-line-metrics"><span>سفارش: <b>' + number(ordered) + ' ' + escape(line.Unit || '') + '</b></span>' +
          '<span>دریافت: <b class="procurement-quantity-done">' + number(received) + '</b></span>' +
          '<span>مانده: <b class="' + (remaining > 0 ? 'procurement-quantity-pending' : 'procurement-quantity-done') + '">' + number(remaining) + '</b></span>' + status + '</div>' +
          receiptDates + completionText + receiveButton +
          (surplus > 0 ? '<div class="form-help procurement-surplus-line">مازاد خرید: ' + number(surplus) + ' ' + escape(line.Unit || '') + (surplusCost !== null ? '؛ ارزش مازاد: ' + number(surplusCost) : '؛ قیمت واحد ثبت نشده') + '</div>' : '') +
          '</div>';
      }).join('');
      const orderHasPending = items.some(function (line) { return Number(line.OrderedQuantity || 0) > Number(line.ReceivedQuantity || 0); });
      const orderReceiveButton = orderHasPending && !isCancelledOrder && canManageProcurement() ? '<button type="button" class="btn btn-primary procurement-receive-order-button" data-receive-order="' + escapeField(order.ID || order.PurchaseOrderID || '') + '">تحویل گرفتن سفارش</button>' : '';
      const printOrderButton = '<button type="button" class="btn btn-secondary procurement-print-order-button" data-print-order-sheet="' + index + '">چاپ برگه سفارش ملزومات</button>';
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
      const filterStatus = overallKind === 'complete' ? 'complete' : (overallKind === 'partial' ? 'partial' : (String(order.Status || '').toUpperCase() === 'CANCELLED' ? 'cancelled' : 'waiting'));
      return '<section class="procurement-summary-card is-' + overallKind + '" data-procurement-card data-filter-status="' + filterStatus + '">' +
        '<button type="button" class="procurement-summary-card-head" data-procurement-toggle aria-expanded="false" aria-controls="' + detailId + '">' +
        '<span class="procurement-summary-card-main"><strong class="procurement-project-code">' + escape(projectLabelText) + '</strong>' +
        '<span class="procurement-summary-card-meta">' + escape(order.OrderNumber || 'شماره سفارش ثبت نشده') + ' · ' + escape(order.SupplierName || 'تأمین‌کننده ثبت نشده') + '</span></span>' +
        '<span class="procurement-summary-card-status">' + statusBadge(overallLabel, overallKind) + '<span class="procurement-card-hint">مشاهده جزئیات</span><span class="procurement-card-chevron" aria-hidden="true">⌄</span></span></button>' +
        '<div class="procurement-summary-card-stats"><span>تاریخ سفارش <b>' + escape(formatDate(orderDate)) + '</b></span><span>مدت سپری‌شده <b>' + (age === null ? 'نامشخص' : number(age) + ' روز') + '</b></span><span>اقلام <b>' + number(itemCount) + '</b></span><span>در انتظار دریافت <b>' + number(pendingCount) + '</b></span>' + orderReceiveButton + printOrderButton + '</div>' +
        '<div class="procurement-summary-card-details" id="' + detailId + '" hidden><div class="procurement-order-detail-meta"><span>تأمین‌کننده: <b>' + escape(order.SupplierName || 'ثبت نشده') + '</b></span><span>وضعیت ثبت‌شده سفارش: <b>' + escape(statusLabel(order.Status)) + '</b></span></div>' +
        '<div class="procurement-needs-project-items">' + (itemDetails || '<div class="table-empty">اقلامی برای این سفارش ثبت نشده است.</div>') + '</div></div></section>';
    });
    container.innerHTML = '<div class="procurement-summary-grid">' + cards.join('') + '</div>';
    applyProcurementFilters('orders');
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
    setText('procurement-tab-needs-count', number(state.needs.length));
    setText('procurement-tab-orders-count', number(state.orders.length));
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
      const workspacePromise = (async function () {
        try {
          return unwrap(await PMS.Api.get('/procurement/workspace')) || {};
        } catch (workspaceError) {
          // Keep the current page compatible while an older Apps Script deployment is active.
          const legacy = await Promise.all([
            PMS.Api.get('/procurement/dashboard'),
            PMS.Api.get('/procurement/needs'),
            PMS.Api.get('/procurement/orders')
          ]);
          const dashboard = unwrap(legacy[0]) || {};
          return {
            summary: dashboard.summary || dashboard,
            needs: list(legacy[1], ['needs', 'items', 'Needs']),
            orders: list(legacy[2], ['orders', 'items', 'Orders'])
          };
        }
      })();
      const results = await Promise.all([workspacePromise, loadProjectsForOrder()]);
      const workspace = results[0] || {};
      state.needs = list(workspace.needs, ['needs', 'items', 'Needs']);
      state.orders = list(workspace.orders, ['orders', 'items', 'Orders']);
      renderSummary(workspace.summary || {});
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


  function requestIdempotencyKey(prefix) {
    let token = '';
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') token = window.crypto.randomUUID();
    } catch (error) {}
    if (!token) token = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    return String(prefix || 'REQ') + '-' + token;
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
      // A project lookup failure must not prevent read-only procurement lists from loading.
      try {
        const result = await PMS.Api.get('/projects');
        state.projects = normalizeProjects(result);
      } catch (fallbackError) {
        state.projects = [];
      }
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
      '<div class="procurement-order-row-head"><span class="procurement-row-number">ردیف ' + (index + 1) + '</span></div>' +
      '<input type="hidden" name="MaterialNeedID" value="' + (need.ID ? escapeField(need.ID) : '') + '">' +
      '<div class="procurement-order-fields">' +
      '<label class="form-group procurement-field-name"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200" value="' + escapeField(need.ItemName) + '"></label>' +
      '<label class="form-group"><span>واحد اندازه‌گیری *</span><input name="Unit" required maxlength="100" value="' + escapeField(need.Unit) + '"></label>' +
      '<label class="form-group"><span>نیاز اصلی</span><input type="text" readonly value="' + escapeField(need.ID ? number(need.RequestedQuantity) : 'قلم جدید') + '"></label>' +
      '<label class="form-group"><span>مقدار سفارش *</span><input name="OrderedQuantity" type="number" min="0.001" step="any" required value="' + (quantity === '' ? '' : escapeField(quantity)) + '"></label>' +
      '<label class="form-group"><span>قیمت واحد (اختیاری)</span><input name="UnitPrice" type="number" min="0" step="any"></label>' +
      '<label class="form-group"><span>توضیحات قلم</span><input name="Notes" maxlength="500" value="' + escapeField(need.Notes) + '"></label>' +
      '</div><div class="procurement-row-footer">' + needSummary + '<div class="form-help procurement-surplus-preview" data-surplus-preview hidden></div><button type="button" class="btn btn-light procurement-remove-row" data-remove-item aria-label="حذف ردیف">حذف این ردیف</button></div></div>';
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
      const remaining = need.RemainingToOrderQuantity !== undefined
        ? Number(need.RemainingToOrderQuantity || 0)
        : Number(need.RequestedQuantity || 0) - Number(need.OrderedQuantity || 0);
      return Math.max(0, remaining) > 0;
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
      '</div><section class="procurement-items-section"><div class="procurement-items-heading"><div><h4>اقلام سفارش</h4><p>اطلاعات هر قلم را در ردیف مربوط وارد کنید.</p></div></div>' +
      '<div class="procurement-order-list" id="procurement-order-items">' + orderItemRow(0) + '</div><div class="procurement-items-actions"><button type="button" class="btn btn-secondary" id="procurement-add-order-item">+ افزودن ردیف</button></div></section>' +
      '<div class="modal-actions procurement-submit-actions"><button type="submit" class="btn btn-primary">ثبت سفارش</button></div></form>');

    const orderForm = root.querySelector('#procurement-order-form');
    orderForm.dataset.idempotencyKey = requestIdempotencyKey('PO');
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
        IdempotencyKey: form.dataset.idempotencyKey,
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
  async function openReceiptForm(options) { options = options || {};
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
    form.dataset.idempotencyKey = requestIdempotencyKey('REC');
    const projectSelect = form.elements.ProjectID;
    if (options.orderId) {
      const orderOption = document.createElement('option');
      orderOption.value = '__ORDER__';
      orderOption.textContent = 'تمام اقلام باقی‌مانده این سفارش';
      projectSelect.insertBefore(orderOption, projectSelect.options[1] || null);
    }
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
        if (String(order.Status || '').toUpperCase() === 'CANCELLED') return;
        if (options.orderId && String(order.ID || order.PurchaseOrderID || '') !== String(options.orderId)) return;
        (Array.isArray(order.Items) ? order.Items : []).forEach(function (item) {
          if (options.itemId && String(item.ID || item.PurchaseOrderItemID || '') !== String(options.itemId)) return;
          const need = needsById[String(item.MaterialNeedID || '')];
          const allocations = Array.isArray(item.Allocations) ? item.Allocations : [];
          const receiptRecords = Array.isArray(item.Receipts) ? item.Receipts : [];
          const fallbackProjectId = String(item.ProjectID || order.ProjectID || (need && need.ProjectID) || '');

          if (projectId === '__ORDER__') {
            if (allocations.length) {
              const allocatedByProject = {};
              allocations.forEach(function (allocation) {
                const id = String(allocation.ProjectID || '');
                if (!id) return;
                allocatedByProject[id] = (allocatedByProject[id] || 0) + Math.max(0, Number(allocation.AllocatedQuantity) || 0);
              });
              Object.keys(allocatedByProject).forEach(function (id) {
                const ordered = allocatedByProject[id];
                const received = receiptRecords.filter(function (receipt) { return String(receipt.ProjectID || '') === id; })
                  .reduce(function (sum, receipt) { return sum + Math.max(0, Number(receipt.QuantityReceived) || 0); }, 0);
                entries.push({ order: order, item: item, ordered: ordered, received: received,
                  remaining: Math.max(0, ordered - received), projectId: id });
              });
              const allocatedTotal = Object.keys(allocatedByProject).reduce(function (sum, id) { return sum + allocatedByProject[id]; }, 0);
              const unallocatedOrdered = Math.max(0, Number(item.OrderedQuantity || 0) - allocatedTotal);
              if (unallocatedOrdered > 0) {
                const unallocatedReceived = receiptRecords.filter(function (receipt) { return !String(receipt.ProjectID || '').trim(); })
                  .reduce(function (sum, receipt) { return sum + Math.max(0, Number(receipt.QuantityReceived) || 0); }, 0);
                entries.push({ order: order, item: item, ordered: unallocatedOrdered, received: unallocatedReceived,
                  remaining: Math.max(0, unallocatedOrdered - unallocatedReceived), projectId: '' });
              }
            } else {
              const ordered = Math.max(0, Number(item.OrderedQuantity || 0));
              const received = Math.max(0, Number(item.ReceivedQuantity || 0));
              entries.push({ order: order, item: item, ordered: ordered, received: received,
                remaining: Math.max(0, ordered - received), projectId: fallbackProjectId });
            }
            return;
          }

          const projectIds = Array.isArray(item.ProjectIDs) ? item.ProjectIDs.map(String) : [];
          const general = projectIds.length === 0 && !fallbackProjectId;
          if (projectId === '__GENERAL__' ? !general : !(projectIds.includes(String(projectId)) || fallbackProjectId === String(projectId))) return;

          const hasProjectAllocations = allocations.length > 0;
          const allocated = hasProjectAllocations
            ? allocations.filter(function (allocation) { return String(allocation.ProjectID || '') === String(projectId); })
                .reduce(function (sum, allocation) { return sum + Math.max(0, Number(allocation.AllocatedQuantity) || 0); }, 0)
            : Math.max(0, Number(item.OrderedQuantity || 0));
          const receivedForSelection = hasProjectAllocations
            ? receiptRecords.filter(function (receipt) { return String(receipt.ProjectID || '') === String(projectId); })
                .reduce(function (sum, receipt) { return sum + Math.max(0, Number(receipt.QuantityReceived) || 0); }, 0)
            : Math.max(0, Number(item.ReceivedQuantity || 0));
          const ordered = projectId === '__GENERAL__' ? Math.max(0, Number(item.OrderedQuantity || 0)) : allocated;
          const received = projectId === '__GENERAL__' ? Math.max(0, Number(item.ReceivedQuantity || 0)) : receivedForSelection;
          entries.push({ order: order, item: item, ordered: ordered, received: received,
            remaining: Math.max(0, ordered - received), projectId: projectId === '__GENERAL__' ? '' : String(projectId) });
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
        itemsContainer.innerHTML = '<div class="table-empty">برای انتخاب فعلی، قلمی با مقدار باقی‌مانده پیدا نشد.</div>';
        summary.hidden = true;
        return;
      }
      itemsContainer.innerHTML = '<div class="procurement-receipt-list">' + entries.map(function (entry, index) {
        const item = entry.item;
        const disabled = entry.remaining <= 0;
        const preselected = !disabled && ((options.itemId && String(item.ID || item.PurchaseOrderItemID || '') === String(options.itemId)) || (options.orderId && String(entry.order.ID || entry.order.PurchaseOrderID || '') === String(options.orderId)));
        return '<div class="procurement-receipt-row' + (disabled ? ' is-complete' : '') + '" data-receipt-row="' + index + '">' +
          '<label class="procurement-receipt-select"><input type="checkbox" name="SelectedItem" value="' + escapeField(item.ID || item.PurchaseOrderItemID || '') + '"' + (disabled ? ' disabled' : '') + (preselected ? ' checked' : '') + '><span class="procurement-receipt-checkmark"></span></label>' +
          '<div class="procurement-receipt-item-info"><strong>' + escape(item.ItemName || 'ملزوم') + '</strong>' +
          '<span>' + escape(entry.order.OrderNumber || 'سفارش') + (item.Unit ? ' · ' + escape(item.Unit) : '') + '</span>' +
          '<small>سفارش: ' + number(entry.ordered) + ' · دریافت‌شده: ' + number(entry.received) + ' · باقی‌مانده: ' + number(entry.remaining) + '</small></div>' +
          '<label class="procurement-receipt-quantity"><span>مقدار دریافتی</span><input type="number" name="ReceiptQuantity" min="0.001" step="any" max="' + entry.remaining + '" value="' + (disabled ? '' : entry.remaining) + '"' + (disabled || !preselected ? ' disabled' : '') + ' placeholder="مقدار"></label>' +
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
    if (options.orderId) { projectSelect.value = '__ORDER__'; renderReceiptItems(); }
    else if (options.projectId) { projectSelect.value = options.projectId; renderReceiptItems(); }
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
      const availableEntries = projectOrderItems(projectSelect.value);
      const selected = rows.filter(function (row) {
        const checkbox = row.querySelector('[name="SelectedItem"]');
        return checkbox && checkbox.checked;
      }).map(function (row) {
        const checkbox = row.querySelector('[name="SelectedItem"]');
        const quantity = row.querySelector('[name="ReceiptQuantity"]');
        const rowIndex = Number(row.getAttribute('data-receipt-row'));
        const entry = Number.isInteger(rowIndex) ? availableEntries[rowIndex] : null;
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
            ProjectID: receipt.entry ? String(receipt.entry.projectId || '') : (projectSelect.value === '__GENERAL__' || projectSelect.value === '__ORDER__' ? '' : projectSelect.value),
            QuantityReceived: receipt.quantity,
            IdempotencyKey: form.dataset.idempotencyKey + ':' + receipt.itemId,
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
        showMessage(err.message || 'ثبت دریافت ناموفق بود. برای اطمینان از وضعیت نهایی، فهرست سفارش‌ها و دریافت‌ها را به‌روزرسانی کنید؛ در خطای سیستمی ممکن است بخشی از عملیات نیازمند بررسی باشد.', true);
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
    bindProcurementFilters();
    const refresh = $('procurement-refresh');
    if (refresh && !refresh.dataset.bound) {
      refresh.dataset.bound = '1';
      refresh.addEventListener('click', function () { load(false); });
    }
    const canManage = canManageProcurement();
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