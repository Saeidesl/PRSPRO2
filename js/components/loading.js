(function () {
  'use strict';

  const Loading = {
    show: function (container, message) {
      const target = typeof container === 'string'
        ? document.querySelector(container)
        : container;
      if (!target) return;

      target.setAttribute('aria-busy', 'true');
      target.innerHTML =
        '<div class="loading-state" role="status" aria-live="polite">' +
          '<span class="loading-spinner" aria-hidden="true"></span>' +
          '<span>' + this.escapeHtml(message || 'در حال بارگذاری...') + '</span>' +
        '</div>';
      return target;
    },

    hide: function (container) {
      const target = typeof container === 'string'
        ? document.querySelector(container)
        : container;
      if (!target) return;
      target.removeAttribute('aria-busy');
      target.innerHTML = '';
    },

    overlay: function (message) {
      let element = document.getElementById('pms-loading-overlay');
      if (element) {
        const text = element.querySelector('.loading-text');
        if (text) text.textContent = message || 'در حال پردازش...';
        return element;
      }

      element = document.createElement('div');
      element.id = 'pms-loading-overlay';
      element.className = 'pms-loading-overlay';
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-busy', 'true');
      element.innerHTML =
        '<span class="loading-spinner" aria-hidden="true"></span>' +
        '<div class="loading-text"></div>';

      const text = element.querySelector('.loading-text');
      if (text) text.textContent = message || 'در حال پردازش...';

      document.body.appendChild(element);
      return element;
    },

    hideOverlay: function () {
      const element = document.getElementById('pms-loading-overlay');
      if (element) element.remove();
    },

    escapeHtml: function (value) {
      const div = document.createElement('div');
      div.textContent = String(value == null ? '' : value);
      return div.innerHTML;
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Loading = Loading;
})();