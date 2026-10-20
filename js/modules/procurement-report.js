(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const Report = {
    data: null,
    lastHeaders: [],
    lastRows: [],
    busy: false,

    init: function () {
      if (this.bound) return;
      this.bound = true;
      const generate = document.getElementById('prc-report-generate');
      const refresh = document.getElementById('prc-report-refresh');
      const csv = document.getElementById('prc-report-csv');
      const print = document.getElementById('prc-report-print');
      if (generate) generate.addEventListener('click', () => this.run(false));
      if (refresh) refresh.addEventListener('click', () => this.run(true));
      if (csv) csv.addEventListener('click', () => this.exportCsv());
      if (print) print.addEventListener('click', () => window.print());
      this.addStyles();
    },

    el: function (id) { return document.getElementById(id); },
    esc: function (value) {
      const node = document.createElement('span');
      node.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
      return node.innerHTML;
    },
    n: function (value) {
      const num = Number(value);
      return Number.isFinite(num) ? num.toLocaleString('fa-IR', { maximumFractionDigits: 3 }) : '۰';
    },
    raw: function (value) {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    },
    getData: async function (fresh) {
      if (this.data && !fresh) return this.data;
      const response = await window.PMS.Api.get('/procurement/reports');
      const data = window.PMS.Api.extractData(response) || {};
      this.data = {
        generatedAt: data.generatedAt || new Date().toISOString(),
        projects: Array.isArray(data.projects) ? data.projects : [],
        needs: Array.isArray(data.needs) ? data.needs : [],
        orders: Array.isArray(data.orders) ? data.orders : []
      };
      return this.data;
    },
    run: async function (fresh) {
      if (this.busy) return;
      this.busy = true;
      this.error('');
      this.setStatus('در حال دریافت و آماده‌سازی گزارش…');
      ['prc-report-generate', 'prc-report-refresh'].forEach(id => { if (this.el(id)) this.el(id).disabled = true; });
      try {
        const data = await this.getData(fresh);
        this.render(data);
        this.setStatus('گزارش آماده است · زمان دریافت اطلاعات: ' + new Date(data.generatedAt).toLocaleString('fa-IR'));
      } catch (error) {
        this.error((error && error.message) || 'ساخت گزارش تأمین ملزومات ناموفق بود. دسترسی گزارش یا تأمین ملزومات را بررسی کنید.');
        this.setStatus('');
      } finally {
        this.busy = false;
        ['prc-report-generate', 'prc-report-refresh'].forEach(id => { if (this.el(id)) this.el(id).disabled = false; });
      }
    },
    setStatus: function (message) {
      const el = this.el('prc-report-status');
      if (el) el.textContent = message || '';
    },
    error: function (message) {
      const el = this.el('prc-report-error');
      if (!el) return;
      el.textContent = message || '';
      el.hidden = !message;
    },
    filters: function () {
      const val = id => (this.el(id) && this.el(id).value || '').trim().toLocaleLowerCase();
      return {
        type: val('prc-report-type') || 'summary',
        from: this.el('prc-report-from') ? this.el('prc-report-from').value : '',
        to: this.el('prc-report-to') ? this.el('prc-report-to').value : '',
        project: val('prc-report-project'),
        material: val('prc-report-material'),
        supplier: val('prc-report-supplier'),
        status: val('prc-report-status') || 'all'
      };
    },
    dateKey: function (value) {
      if (!value) return '';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
    },
    inDateRange: function (value, filters) {
      const date = this.dateKey(value);
      if (filters.from && (!date || date < filters.from)) return false;
      if (filters.to && (!date || date > filters.to)) return false;
      return true;
    },
    projectMatches: function (record, filters) {
      if (!filters.project) return true;
      const labels = [
        record.ProjectCode, record.ProjectTitle, record.ProjectID, record.ProjectName,
        ...(Array.isArray(record.ProjectLabels) ? record.ProjectLabels : []),
        ...(Array.isArray(record.ProjectIDs) ? record.ProjectIDs : [])
      ];
      return labels.some(value => String(value || '').toLocaleLowerCase().includes(filters.project));
    },
    materialMatches: function (record, filters) {
      if (!filters.material) return true;
      return [record.ItemName, record.ItemCode, record.Unit, record.Description, record.Notes]
        .some(value => String(value || '').toLocaleLowerCase().includes(filters.material));
    },
    orderState: function (order) {
      const status = String(order.Status || '').toUpperCase();
      if (status === 'CANCELLED' || status === 'VOID' || status === 'DELETED') return 'cancelled';
      const items = Array.isArray(order.Items) ? order.Items : [];
      if (items.length && items.every(item => this.raw(item.OrderedQuantity) > 0 && this.raw(item.ReceivedQuantity) >= this.raw(item.OrderedQuantity))) return 'complete';
      if (items.some(item => this.raw(item.ReceivedQuantity) > 0)) return 'partial';
      return 'open';
    },
    statusMatches: function (status, filter) {
      if (filter === 'all') return true;
      if (filter === 'cancelled') return status === 'cancelled';
      if (filter === 'complete') return status === 'complete' || status === 'received';
      if (filter === 'partial') return status === 'partial' || status === 'partially_ordered' || status === 'partially_received';
      return status !== 'complete' && status !== 'received' && status !== 'cancelled';
    },
    filtered: function (data, filters) {
      const needs = data.needs.filter(need => this.inDateRange(need.CreatedAt, filters) &&
        this.projectMatches(need, filters) && this.materialMatches(need, filters) &&
        this.statusMatches(String(need.ProcurementStatus || '').toLowerCase(), filters.status));
      const orders = data.orders.filter(order => this.inDateRange(order.OrderDate || order.CreatedAt, filters) &&
        this.projectMatches(order, filters) &&
        (!filters.supplier || String(order.SupplierName || '').toLocaleLowerCase().includes(filters.supplier)) &&
        (filters.status === 'all' || this.statusMatches(this.orderState(order), filters.status)) &&
        (filters.material === '' || (Array.isArray(order.Items) && order.Items.some(item => this.materialMatches(item, filters)))));
      return { needs, orders };
    },
    flattenOrderItems: function (orders) {
      const rows = [];
      orders.forEach(order => (Array.isArray(order.Items) ? order.Items : []).forEach(item => {
        const ordered = this.raw(item.OrderedQuantity);
        const received = Math.min(ordered, this.raw(item.ReceivedQuantity));
        rows.push({
          date: order.OrderDate || order.CreatedAt || '',
          order: order.OrderNumber || order.ID || '',
          project: (item.ProjectLabels || order.ProjectLabels || []).join('، ') || item.ProjectID || order.ProjectID || 'عمومی',
          supplier: order.SupplierName || '',
          item: item.ItemName || '',
          code: item.ItemCode || '',
          unit: item.Unit || '',
          ordered, received, pending: Math.max(0, ordered - received),
          unitPrice: item.UnitPrice === '' || item.UnitPrice === null || item.UnitPrice === undefined ? null : this.raw(item.UnitPrice),
          value: item.UnitPrice === '' || item.UnitPrice === null || item.UnitPrice === undefined ? null : ordered * this.raw(item.UnitPrice),
          status: this.orderState(order),
          notes: item.Notes || order.Notes || ''
        });
      }));
      return rows;
    },
    flattenReceipts: function (orders, filters) {
      const rows = [];
      orders.forEach(order => (Array.isArray(order.Items) ? order.Items : []).forEach(item => {
        (Array.isArray(item.Receipts) ? item.Receipts : []).forEach(receipt => {
          if (!this.inDateRange(receipt.ReceivedAt, filters)) return;
          if (filters.project && !this.projectMatches({ ProjectID: receipt.ProjectID, ProjectLabels: item.ProjectLabels || order.ProjectLabels }, filters)) return;
          if (!this.materialMatches(item, filters)) return;
          if (filters.supplier && !String(order.SupplierName || '').toLocaleLowerCase().includes(filters.supplier)) return;
          rows.push({
            date: receipt.ReceivedAt || '', order: order.OrderNumber || order.ID || '',
            project: (item.ProjectLabels || order.ProjectLabels || []).join('، ') || receipt.ProjectID || 'عمومی',
            supplier: order.SupplierName || '', item: item.ItemName || '', code: item.ItemCode || '',
            quantity: this.raw(receipt.QuantityReceived), unit: item.Unit || '',
            notes: receipt.Notes || ''
          });
        });
      }));
      return rows.sort((a, b) => this.dateKey(b.date).localeCompare(this.dateKey(a.date)));
    },
    render: function (data) {
      const filters = this.filters();
      const filtered = this.filtered(data, filters);
      const needs = filtered.needs;
      const orders = filtered.orders;
      const orderItems = this.flattenOrderItems(orders).filter(row => !filters.material || (row.item + ' ' + row.code).toLocaleLowerCase().includes(filters.material));
      const receipts = this.flattenReceipts(data.orders, filters);
      const total = (rows, key) => rows.reduce((sum, row) => sum + this.raw(row[key]), 0);
      const requested = total(needs, 'RequestedQuantity');
      const neededOrdered = total(needs, 'OrderedQuantity');
      const needReceived = total(needs, 'ReceivedQuantity');
      const orderQty = total(orderItems, 'ordered');
      const receivedQty = total(orderItems, 'received');
      const orderValue = orderItems.reduce((sum, row) => sum + (row.value || 0), 0);
      const type = filters.type;
      let headers = [], rows = [], title = 'گزارش جامع تأمین ملزومات';
      if (type === 'needs') {
        title = 'گزارش نیازهای ملزومات';
        headers = ['تاریخ ثبت', 'پروژه', 'ملزوم', 'کد ملزوم', 'مقدار نیاز', 'سفارش‌شده', 'دریافت‌شده', 'باقی‌مانده سفارش', 'باقی‌مانده دریافت', 'وضعیت', 'توضیحات'];
        rows = needs.map(n => [n.CreatedAt || '', [n.ProjectCode, n.ProjectTitle].filter(Boolean).join(' — ') || n.ProjectID || 'عمومی', n.ItemName || '', n.ItemCode || '', n.RequestedQuantity, n.OrderedQuantity, n.ReceivedQuantity, n.RemainingToOrderQuantity, n.RemainingDeliveryQuantity, n.ProcurementStatus, n.Notes || '']);
      } else if (type === 'orders') {
        title = 'گزارش سفارش‌های خرید';
        headers = ['تاریخ سفارش', 'شماره سفارش', 'پروژه', 'تأمین‌کننده', 'ملزوم', 'کد ملزوم', 'واحد', 'سفارش‌شده', 'دریافت‌شده', 'باقی‌مانده', 'قیمت واحد', 'ارزش سفارش', 'وضعیت', 'توضیحات'];
        rows = orderItems.map(r => [r.date, r.order, r.project, r.supplier, r.item, r.code, r.unit, r.ordered, r.received, r.pending, r.unitPrice === null ? 'ثبت نشده' : r.unitPrice, r.value === null ? 'ثبت نشده' : r.value, r.status, r.notes]);
      } else if (type === 'receipts') {
        title = 'گزارش دریافت‌های انبار';
        headers = ['تاریخ دریافت', 'شماره سفارش', 'پروژه', 'تأمین‌کننده', 'ملزوم', 'کد ملزوم', 'مقدار دریافت', 'واحد', 'توضیحات'];
        rows = receipts.map(r => [r.date, r.order, r.project, r.supplier, r.item, r.code, r.quantity, r.unit, r.notes]);
      } else if (type === 'materials') {
        title = 'تحلیل تأمین بر اساس ملزوم';
        headers = ['ملزوم', 'کد', 'واحد', 'مقدار موردنیاز', 'مقدار سفارش', 'مقدار دریافت', 'باقی‌مانده دریافت', 'تعداد سفارش‌ها', 'ارزش سفارش با قیمت ثبت‌شده'];
        const map = new Map();
        needs.forEach(n => {
          const key = [n.ItemCode || n.ItemName, n.Unit].join('|');
          const row = map.get(key) || { name: n.ItemName || '', code: n.ItemCode || '', unit: n.Unit || '', requested: 0, ordered: 0, received: 0, orderCount: 0, value: 0 };
          row.requested += this.raw(n.RequestedQuantity); map.set(key, row);
        });
        orderItems.forEach(item => {
          const key = [item.code || item.item, item.unit].join('|');
          const row = map.get(key) || { name: item.item, code: item.code, unit: item.unit, requested: 0, ordered: 0, received: 0, orderCount: 0, value: 0 };
          row.ordered = Math.max(row.ordered, 0) + item.ordered; row.received += item.received; row.orderCount++; row.value += item.value || 0; map.set(key, row);
        });
        rows = Array.from(map.values()).sort((a,b) => a.name.localeCompare(b.name)).map(r => [r.name, r.code, r.unit, r.requested, r.ordered, r.received, Math.max(0, r.ordered-r.received), r.orderCount, r.value]);
      } else if (type === 'projects') {
        title = 'تحلیل تأمین بر اساس پروژه';
        headers = ['پروژه', 'تعداد نیازها', 'مقدار موردنیاز', 'مقدار سفارش', 'مقدار دریافت', 'مانده دریافت', 'تعداد سفارش‌ها', 'ارزش سفارش'];
        const map = new Map();
        const add = (key, label) => { const row = map.get(key) || { label, needCount: 0, requested: 0, ordered: 0, received: 0, orders: new Set(), value: 0 }; map.set(key, row); return row; };
        needs.forEach(n => { const key = String(n.ProjectID || 'GENERAL'); const row = add(key, [n.ProjectCode,n.ProjectTitle].filter(Boolean).join(' — ') || (n.ProjectID || 'عمومی')); row.needCount++; row.requested += this.raw(n.RequestedQuantity); });
        orders.forEach(o => (Array.isArray(o.Items) ? o.Items : []).forEach(i => {
          const allocations = Array.isArray(i.Allocations) ? i.Allocations.filter(a => a.ProjectID) : [];
          if (allocations.length) {
            allocations.forEach(a => {
              const id = String(a.ProjectID);
              const row = add(id, (i.ProjectLabels || o.ProjectLabels || []).join('، ') || id);
              const allocated = this.raw(a.AllocatedQuantity);
              const projectReceived = (Array.isArray(i.Receipts) ? i.Receipts : []).filter(rec => String(rec.ProjectID || '') === id).reduce((sum, rec) => sum + this.raw(rec.QuantityReceived), 0);
              row.orders.add(String(o.ID)); row.ordered += allocated; row.received += Math.min(allocated, projectReceived);
              row.value += i.UnitPrice === '' || i.UnitPrice === null || i.UnitPrice === undefined ? 0 : this.raw(i.UnitPrice) * allocated;
            });
          } else {
            const id = String(i.ProjectID || o.ProjectID || 'GENERAL');
            const row = add(id, (i.ProjectLabels || o.ProjectLabels || []).join('، ') || (id === 'GENERAL' ? 'عمومی' : id));
            row.orders.add(String(o.ID)); row.ordered += this.raw(i.OrderedQuantity); row.received += this.raw(i.ReceivedQuantity);
            row.value += i.UnitPrice === '' || i.UnitPrice === null || i.UnitPrice === undefined ? 0 : this.raw(i.UnitPrice) * this.raw(i.OrderedQuantity);
          }
        }));
        rows = Array.from(map.values()).sort((a,b) => a.label.localeCompare(b.label)).map(r => [r.label, r.needCount, r.requested, r.ordered, r.received, Math.max(0,r.ordered-r.received), r.orders.size, r.value]);
      } else if (type === 'suppliers') {
        title = 'تحلیل تأمین‌کنندگان';
        headers = ['تأمین‌کننده', 'تعداد سفارش', 'تعداد اقلام', 'مقدار سفارش', 'مقدار دریافت', 'مانده دریافت', 'ارزش سفارش با قیمت ثبت‌شده'];
        const map = new Map();
        orderItems.forEach(item => { const key = item.supplier || 'بدون تأمین‌کننده'; const row = map.get(key) || { orders: new Set(), lines: 0, ordered: 0, received: 0, value: 0 }; row.orders.add(item.order); row.lines++; row.ordered += item.ordered; row.received += item.received; row.value += item.value || 0; map.set(key,row); });
        rows = Array.from(map.entries()).sort((a,b) => b[1].value-a[1].value).map(([name,r]) => [name,r.orders.size,r.lines,r.ordered,r.received,Math.max(0,r.ordered-r.received),r.value]);
      } else if (type === 'monthly') {
        title = 'روند ماهانه سفارش و دریافت';
        headers = ['ماه', 'تعداد سفارش', 'مقدار سفارش', 'ارزش سفارش با قیمت ثبت‌شده', 'تعداد دریافت', 'مقدار دریافت'];
        const map = new Map();
        orders.forEach(order => { const month = String(order.OrderDate || order.CreatedAt || '').slice(0,7) || 'بدون تاریخ'; const row = map.get(month) || { orders: new Set(), ordered: 0, value: 0, receipts: 0, received: 0 }; row.orders.add(String(order.ID)); (order.Items || []).forEach(item => { row.ordered += this.raw(item.OrderedQuantity); if (item.UnitPrice !== '' && item.UnitPrice !== null && item.UnitPrice !== undefined) row.value += this.raw(item.UnitPrice)*this.raw(item.OrderedQuantity); }); map.set(month,row); });
        receipts.forEach(receipt => { const month = String(receipt.date || '').slice(0,7) || 'بدون تاریخ'; const row = map.get(month) || { orders: new Set(), ordered: 0, value: 0, receipts: 0, received: 0 }; row.receipts++; row.received += receipt.quantity; map.set(month,row); });
        rows = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([month,r]) => [month,r.orders.size,r.ordered,r.value,r.receipts,r.received]);
      } else {
        title = 'خلاصه مدیریتی تأمین ملزومات';
        headers = ['شاخص', 'مقدار'];
        rows = [
          ['نیازهای منطبق با فیلتر', needs.length], ['مقدار کل نیاز ثبت‌شده', requested],
          ['مقدار تخصیص‌یافته به نیازها', neededOrdered], ['مقدار دریافت‌شده برای نیازها', needReceived],
          ['سفارش‌های منطبق با فیلتر', orders.length], ['تعداد اقلام سفارش', orderItems.length],
          ['مقدار کل سفارش', orderQty], ['مقدار کل دریافت', receivedQty],
          ['مانده دریافت', Math.max(0, orderQty-receivedQty)], ['ارزش سفارش با قیمت ثبت‌شده', orderValue],
          ['دریافت‌های ثبت‌شده در بازه', receipts.length], ['نیازهای دارای مانده سفارش', needs.filter(n => this.raw(n.RemainingToOrderQuantity)>0).length],
          ['نیازهای دارای مانده دریافت', needs.filter(n => this.raw(n.RemainingDeliveryQuantity)>0).length]
        ];
      }
      const host = this.el('prc-report-results');
      const cards = '<div class="procurement-report-kpis"><div><small>تعداد نیازها</small><strong>' + this.n(needs.length) + '</strong></div><div><small>تعداد سفارش‌ها</small><strong>' + this.n(orders.length) + '</strong></div><div><small>مقدار سفارش‌شده</small><strong>' + this.n(orderQty) + '</strong></div><div><small>مقدار دریافت‌شده</small><strong>' + this.n(receivedQty) + '</strong></div><div><small>مانده دریافت</small><strong>' + this.n(Math.max(0,orderQty-receivedQty)) + '</strong></div><div><small>ارزش سفارش ثبت‌شده</small><strong>' + this.n(orderValue) + '</strong></div></div>';
      host.innerHTML = '<div class="procurement-report-print-title"><h2>' + this.esc(title) + '</h2><p>تاریخ تهیه: ' + this.esc(new Date().toLocaleString('fa-IR')) + '</p></div>' + cards + '<div class="procurement-report-table-wrap"><table class="data-table procurement-report-table"><thead><tr>' + headers.map(h => '<th>' + this.esc(h) + '</th>').join('') + '</tr></thead><tbody>' + (rows.length ? rows.map(row => '<tr>' + row.map(cell => '<td>' + this.esc(cell) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + headers.length + '">با فیلترهای انتخاب‌شده داده‌ای پیدا نشد.</td></tr>') + '</tbody></table></div><p class="procurement-report-footnote">مبالغ فقط بر اساس قیمت واحد ثبت‌شده محاسبه شده‌اند؛ قیمت‌های خالی به‌عنوان صفر در ارزش مالی لحاظ نشده‌اند. در تحلیل ملزوم، مقدار سفارش از سفارش‌های ثبت‌شده و مقدار موردنیاز از نیازهای ثبت‌شده محاسبه می‌شود.</p>';
      this.lastHeaders = headers;
      this.lastRows = rows;
      if (this.el('prc-report-csv')) this.el('prc-report-csv').disabled = rows.length === 0;
      if (this.el('prc-report-print')) this.el('prc-report-print').disabled = rows.length === 0;
    },
    exportCsv: function () {
      if (!this.lastRows.length) return;
      const quote = value => '"' + String(value === null || value === undefined ? '' : value).replace(/"/g, '""') + '"';
      const csv = '\uFEFF' + [this.lastHeaders, ...this.lastRows].map(row => row.map(quote).join(',')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'procurement-report-' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    addStyles: function () {
      if (document.getElementById('procurement-report-styles')) return;
      const style = document.createElement('style');
      style.id = 'procurement-report-styles';
      style.textContent = '.procurement-report-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.procurement-report-filters label{display:flex;flex-direction:column;gap:6px;font-size:.85rem;color:var(--text-muted,#64748b)}.procurement-report-filters input,.procurement-report-filters select{width:100%;min-width:0;box-sizing:border-box;min-height:40px}.procurement-report-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:16px}.procurement-report-actions [role=status]{font-size:.82rem;color:var(--text-muted,#64748b)}.procurement-report-results{margin-top:18px}.procurement-report-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}.procurement-report-kpis>div{border:1px solid var(--border-color,#dce4eb);border-radius:10px;padding:12px;min-width:0}.procurement-report-kpis small{display:block;color:var(--text-muted,#64748b);margin-bottom:6px}.procurement-report-kpis strong{display:block;font-size:1.1rem;overflow-wrap:anywhere}.procurement-report-table-wrap{overflow:auto;max-width:100%}.procurement-report-table{min-width:680px}.procurement-report-table th{white-space:nowrap}.procurement-report-footnote{font-size:.8rem;color:var(--text-muted,#64748b);line-height:1.8}.procurement-report-print-title h2{margin-bottom:4px}.procurement-report-print-title p{font-size:.8rem;color:var(--text-muted,#64748b)}@media(max-width:850px){.procurement-report-filters{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.procurement-report-filters,.procurement-report-kpis{grid-template-columns:1fr 1fr}.procurement-report-actions .btn{flex:1 1 44%;min-height:42px}}@media print{body *{visibility:hidden!important}#procurement-report-results,#procurement-report-results *{visibility:visible!important}#procurement-report-results{position:absolute;left:0;top:0;width:100%;margin:0;padding:0;background:#fff;color:#111}#procurement-report-results .procurement-report-table{min-width:0;width:100%;font-size:8pt;border-collapse:collapse}#procurement-report-results th,#procurement-report-results td{border:1px solid #888;padding:5px;overflow-wrap:anywhere}#procurement-report-results .procurement-report-kpis>div{border:1px solid #999;break-inside:avoid}.procurement-report-builder{display:none!important}}';
      document.head.appendChild(style);
    }
  };

  window.PMS.Modules.ProcurementReport = Report;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Report.init());
  else Report.init();
})();