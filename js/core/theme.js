/* Central light/dark theme controller. No dependencies. */
(function () {
  'use strict';

  var STORAGE_KEY = 'pms-theme';
  var root = document.documentElement;
  var Theme = {
    getSystemTheme: function () {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    getStoredTheme: function () {
      try {
        var value = window.localStorage.getItem(STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : null;
      } catch (error) {
        return null;
      }
    },
    apply: function (theme, persist) {
      var selected = theme === 'dark' ? 'dark' : 'light';
      root.setAttribute('data-theme', selected);
      root.style.colorScheme = selected;
      if (persist !== false) {
        try { window.localStorage.setItem(STORAGE_KEY, selected); } catch (error) { /* Storage may be blocked. */ }
      }
      this.updateControl();
      return selected;
    },
    toggle: function () {
      return this.apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    },
    updateControl: function () {
      var button = document.getElementById('theme-toggle-button');
      if (!button) return;
      var dark = root.getAttribute('data-theme') === 'dark';
      button.setAttribute('aria-label', dark ? 'تغییر به تم روشن' : 'تغییر به تم تیره');
      button.setAttribute('aria-pressed', dark ? 'true' : 'false');
      button.setAttribute('title', dark ? 'تم تیره فعال است؛ برای تم روشن کلیک کنید' : 'تم روشن فعال است؛ برای تم تیره کلیک کنید');
      var icon = button.querySelector('.theme-toggle-icon');
      var label = button.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = dark ? '☀' : '☾';
      if (label) label.textContent = dark ? 'روشن' : 'تیره';
    },
    bindControl: function () {
      var button = document.getElementById('theme-toggle-button');
      if (!button || button.dataset.themeBound === 'true') {
        this.updateControl();
        return;
      }
      button.dataset.themeBound = 'true';
      button.addEventListener('click', function () { Theme.toggle(); });
      this.updateControl();
    },
    init: function () {
      var stored = this.getStoredTheme();
      this.apply(stored || this.getSystemTheme(), false);
      if (window.matchMedia) {
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        var onSystemChange = function (event) {
          if (!Theme.getStoredTheme()) Theme.apply(event.matches ? 'dark' : 'light', false);
        };
        if (media.addEventListener) media.addEventListener('change', onSystemChange);
        else if (media.addListener) media.addListener(onSystemChange);
      }
    }
  };

  Theme.init();
  window.PMS = window.PMS || {};
  window.PMS.Theme = Theme;
})();
