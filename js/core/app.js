/**
 * ============================================================
 * PRODUCTION MANAGEMENT SYSTEM
 * APPLICATION CORE
 * ============================================================
 */
(function () {
  'use strict';

  const App = {
    initialized: false,

    init: function () {
      if (this.initialized) return;
      this.initialized = true;
      this.removeLoading();

      try {
        if (!window.PMS || !PMS.Router || typeof PMS.Router.init !== 'function') {
          throw new Error('هسته مسیریابی برنامه بارگذاری نشده است.');
        }
        if (!PMS.Session || typeof PMS.Session.isAuthenticated !== 'function') {
          throw new Error('سرویس نشست کاربر بارگذاری نشده است.');
        }

        // Router handles both login and authenticated routes.
        // Do not bypass it: it owns the login page and route lifecycle.
        PMS.Router.init();
      } catch (error) {
        console.error('PMS startup error:', error);
        this.showStartupError(error);
      }
    },

    removeLoading: function () {
      const loading = document.getElementById('app-loading');
      if (loading) loading.remove();
    },

    showStartupError: function (error) {
      const app = document.getElementById('app');
      if (!app) return;
      const message = error && error.message
        ? error.message
        : 'خطای نامشخص هنگام راه‌اندازی سامانه.';
      app.innerHTML =
        '<div style="max-width:720px;margin:40px auto;padding:24px;border:1px solid #d1d9e0;border-radius:12px;background:var(--color-surface,#fff);color:var(--color-text,#1f2328);font-family:Tahoma,Arial,sans-serif;direction:rtl;line-height:1.9">' +
        '<h2 style="margin-top:0">سامانه به‌درستی راه‌اندازی نشد</h2>' +
        '<p>خطای شروع برنامه شناسایی شد. لطفاً صفحه را دوباره بارگذاری کنید؛ اگر مشکل ادامه داشت، متن زیر را ارسال کنید.</p>' +
        '<pre style="white-space:pre-wrap;overflow-wrap:anywhere;background:var(--color-surface-alt,#f6f8fa);padding:12px;border-radius:8px">' +
        String(message).replace(/[&<>"]/g, function (character) {
          return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character];
        }) +
        '</pre><button onclick="window.location.reload()" style="padding:10px 16px;border:0;border-radius:8px;cursor:pointer">بارگذاری مجدد</button></div>';
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.App = App;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      App.init();
    }, { once: true });
  } else {
    App.init();
  }
})();
