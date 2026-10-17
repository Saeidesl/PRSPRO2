(function () {
  'use strict';

  const Form = {
    serialize: function (form) {
      const target = typeof form === 'string'
        ? document.querySelector(form)
        : form;
      if (!target) return {};

      const data = {};
      target.querySelectorAll('input, select, textarea').forEach(function (element) {
        if (!element.name || element.disabled) return;

        if (element.type === 'checkbox') {
          data[element.name] = element.checked;
          return;
        }

        if (element.type === 'radio') {
          if (element.checked) data[element.name] = element.value;
          return;
        }

        if (element.tagName === 'SELECT' && element.multiple) {
          data[element.name] = Array.from(element.selectedOptions).map(function (option) {
            return option.value;
          });
          return;
        }

        data[element.name] = element.value;
      });

      return data;
    },

    fill: function (form, data) {
      const target = typeof form === 'string'
        ? document.querySelector(form)
        : form;
      if (!target || !data) return;

      target.querySelectorAll('input, select, textarea').forEach(function (element) {
        if (!element.name || !Object.prototype.hasOwnProperty.call(data, element.name)) return;
        const value = data[element.name];

        if (element.type === 'checkbox') {
          element.checked = Form.toBoolean(value);
          return;
        }

        if (element.type === 'radio') {
          element.checked = element.value === String(value == null ? '' : value);
          return;
        }

        if (element.tagName === 'SELECT' && element.multiple) {
          const selected = Array.isArray(value) ? value.map(String) : [String(value == null ? '' : value)];
          Array.from(element.options).forEach(function (option) {
            option.selected = selected.indexOf(option.value) !== -1;
          });
          return;
        }

        element.value = value == null ? '' : value;
      });
    },

    validate: function (form, showMessage) {
      const target = typeof form === 'string'
        ? document.querySelector(form)
        : form;
      if (!target) return false;

      const valid = typeof target.checkValidity === 'function'
        ? target.checkValidity()
        : true;
      if (!valid && showMessage !== false && typeof target.reportValidity === 'function') {
        target.reportValidity();
      }
      return valid;
    },

    reset: function (form) {
      const target = typeof form === 'string'
        ? document.querySelector(form)
        : form;
      if (target && typeof target.reset === 'function') target.reset();
    },

    setDisabled: function (form, disabled) {
      const target = typeof form === 'string'
        ? document.querySelector(form)
        : form;
      if (!target) return;

      target.querySelectorAll('input, select, textarea, button').forEach(function (element) {
        element.disabled = !!disabled;
      });
    },

    toBoolean: function (value) {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['false', '0', 'no', 'off', ''].indexOf(normalized) !== -1) return false;
        if (['true', '1', 'yes', 'on'].indexOf(normalized) !== -1) return true;
      }
      return Boolean(value);
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Form = Form;
})();