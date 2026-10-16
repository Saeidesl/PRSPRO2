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
      var themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', selected === 'dark' ? '#0d1117' : '#ffffff');
      if (persist !== false) {
        try { window.localStorage.setItem(STORAGE_KEY, selected); } catch (error) {}
      }
      this.updateControl();
      return selected;
    },
    toggle: function () {
      return this.apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    },
    updateControl: function () {
      var buttons = document.querySelectorAll('[data-theme-toggle], #theme-toggle-button');
      var dark = root.getAttribute('data-theme') === 'dark';
      buttons.forEach(function (button) {
        button.setAttribute('aria-label', dark ? 'تغییر به تم روشن' : 'تغییر به تم تیره');
        button.setAttribute('aria-pressed', dark ? 'true' : 'false');
        button.setAttribute('title', dark ? 'تم تیره فعال است؛ برای تم روشن کلیک کنید' : 'تم روشن فعال است؛ برای تم تیره کلیک کنید');
        var icon = button.querySelector('.theme-toggle-icon');
        var label = button.querySelector('.theme-toggle-label');
        var iconText = dark ? '☀' : '☾';
        var labelText = dark ? 'روشن' : 'تیره';
        // Avoid rewriting identical text: doing so triggers MutationObserver again.
        if (icon && icon.textContent !== iconText) icon.textContent = iconText;
        if (label && label.textContent !== labelText) label.textContent = labelText;
      });
    },
    init: function () {
      document.addEventListener('click', function (event) {
        var target = event.target;
        var button = target && target.closest && target.closest('[data-theme-toggle], #theme-toggle-button');
        if (button) Theme.toggle();
      });

      if (window.MutationObserver) {
        var observer = new MutationObserver(function () {
          Theme.updateControl();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }

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
