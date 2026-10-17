(function () {
  'use strict';

  const Modal = {
    open: function (options) {
      options = options || {};
      const id = options.id || 'pms-modal';
      this.close(id);

      const title = options.title || 'اطلاعات';
      const content = options.content || '';
      const footer = options.footer || '';
      const titleId = id + '-title';
      const modal = document.createElement('div');

      modal.id = id;
      modal.className = 'modal-overlay';
      modal.setAttribute('data-modal-overlay', '');
      modal._pmsPreviousFocus = document.activeElement;
      modal._pmsOptions = options;

      modal.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + this.escapeHtml(titleId) + '">' +
          '<div class="modal-header">' +
            '<h3 id="' + this.escapeHtml(titleId) + '">' + this.escapeHtml(title) + '</h3>' +
            '<button type="button" class="modal-close" data-modal-close aria-label="بستن پنجره">×</button>' +
          '</div>' +
          '<div class="modal-body">' + content + '</div>' +
          (footer ? '<div class="modal-footer">' + footer + '</div>' : '') +
        '</div>';

      document.body.appendChild(modal);

      const closeButton = modal.querySelector('[data-modal-close]');
      if (closeButton) closeButton.addEventListener('click', function () { Modal.close(id); });

      modal.addEventListener('click', function (event) {
        if (event.target === modal && options.closeOnOverlay !== false) Modal.close(id);
      });

      modal._pmsEscapeHandler = function (event) {
        if (event.key !== 'Escape' || options.closeOnEscape === false) return;
        const overlays = document.querySelectorAll('[data-modal-overlay]');
        if (overlays.length && overlays[overlays.length - 1] === modal) {
          event.preventDefault();
          Modal.close(id);
        }
      };
      document.addEventListener('keydown', modal._pmsEscapeHandler);
      document.body.classList.add('modal-open');

      const focusTarget = modal.querySelector(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();

      if (typeof options.onOpen === 'function') options.onOpen(modal);
      return modal;
    },

    close: function (id) {
      const modal = document.getElementById(id || 'pms-modal');
      if (!modal) return;

      if (modal._pmsEscapeHandler) {
        document.removeEventListener('keydown', modal._pmsEscapeHandler);
      }
      const previousFocus = modal._pmsPreviousFocus;
      const options = modal._pmsOptions || {};
      modal.remove();

      if (!document.querySelector('.modal-overlay')) {
        document.body.classList.remove('modal-open');
      }

      if (typeof options.onClose === 'function') options.onClose();
      if (previousFocus && typeof previousFocus.focus === 'function' && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    },

    closeAll: function () {
      document.querySelectorAll('[data-modal-overlay]').forEach(function (modal) {
        if (modal._pmsEscapeHandler) {
          document.removeEventListener('keydown', modal._pmsEscapeHandler);
        }
        modal.remove();
      });
      document.body.classList.remove('modal-open');
    },

    escapeHtml: function (value) {
      const div = document.createElement('div');
      div.textContent = String(value == null ? '' : value);
      return div.innerHTML;
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Modal = Modal;
})();