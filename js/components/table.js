(function () {
  'use strict';

  const Table = {
    render: function (container, columns, rows, options) {
      options = options || {};
      const target = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!target) return;

      columns = Array.isArray(columns) ? columns : [];
      rows = Array.isArray(rows) ? rows : [];

      if (options.loading) {
        target.innerHTML =
          '<div class="table-state" role="status" aria-live="polite">' +
          '<span class="loading-spinner" aria-hidden="true"></span>' +
          '<span>' + this.escapeHtml(options.loadingText || 'در حال بارگذاری...') + '</span>' +
          '</div>';
        return;
      }

      if (!columns.length) {
        target.innerHTML =
          '<div class="table-empty">' +
          this.escapeHtml(options.emptyText || 'ستونی برای نمایش تعریف نشده است.') +
          '</div>';
        return;
      }

      let html = '<div class="table-wrapper' +
        (options.wrapperClass ? ' ' + this.escapeHtml(options.wrapperClass) : '') +
        '"><table class="data-table' +
        (options.tableClass ? ' ' + this.escapeHtml(options.tableClass) : '') +
        '">';

      if (options.caption) {
        html += '<caption class="table-caption">' +
          this.escapeHtml(options.caption) + '</caption>';
      }

      html += '<thead><tr>';
      columns.forEach(function (column) {
        const label = column.label || column.key || '';
        const align = column.align ? ' class="text-' + this.escapeHtml(column.align) + '"' : '';
        html += '<th scope="col"' + align + '>' + this.escapeHtml(label) + '</th>';
      }, this);
      html += '</tr></thead><tbody>';

      if (!rows.length) {
        html += '<tr><td class="table-empty-cell" colspan="' + columns.length + '">' +
          this.escapeHtml(options.emptyText || 'داده‌ای برای نمایش وجود ندارد.') +
          '</td></tr>';
      } else {
        rows.forEach(function (row, rowIndex) {
          let rowClass = '';
          if (typeof options.rowClassName === 'function') {
            rowClass = options.rowClassName(row, rowIndex) || '';
          }
          html += '<tr' + (rowClass ? ' class="' + this.escapeHtml(rowClass) + '"' : '') + '>';

          columns.forEach(function (column) {
            let value = typeof column.render === 'function'
              ? column.render(row, rowIndex)
              : row && column.key != null ? row[column.key] : '';
            const align = column.align ? ' class="text-' + this.escapeHtml(column.align) + '"' : '';

            // raw is an explicit opt-in for trusted HTML (for example, action buttons).
            const cell = column.raw === true
              ? String(value == null ? '' : value)
              : this.escapeHtml(value == null ? '' : value);

            html += '<td' + align + '>' + cell + '</td>';
          }, this);

          html += '</tr>';
        }, this);
      }

      html += '</tbody></table></div>';
      target.innerHTML = html;
    },

    escapeHtml: function (value) {
      const div = document.createElement('div');
      div.textContent = String(value == null ? '' : value);
      return div.innerHTML;
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Table = Table;
})();