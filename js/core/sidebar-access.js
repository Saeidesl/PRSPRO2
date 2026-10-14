(function () {
  'use strict';

  window.PMS = window.PMS || {};

  function install() {
    if (!window.PMS || !PMS.Layout || !PMS.Router) {
      return false;
    }

    const Layout = PMS.Layout;
    const Router = PMS.Router;

    if (Layout.__unifiedAccessInstalled) {
      return true;
    }

    Layout.__unifiedAccessInstalled = true;

    // مرجع تشخیص دسترسی فقط Router است.
    // دیگر مجوزهای SIDEBAR_*_VIEW بررسی نمی‌شوند.

    function isAdmin() {
      return typeof Router.isAdmin === 'function' &&
        Router.isAdmin();
    }

    function hasMenuPermission(route) {
      if (isAdmin()) {
        return true;
      }

      if (typeof Router.hasRouteAccess !== 'function') {
        return false;
      }

      return Router.hasRouteAccess(route);
    }

    // در صورت وجود تابع نمایش منو، آن را با دسترسی واحد هماهنگ می‌کنیم.
    if (typeof Layout.getVisibleNavItems === 'function') {
      const originalGetVisibleNavItems = Layout.getVisibleNavItems;

      Layout.getVisibleNavItems = function () {
        const items = originalGetVisibleNavItems.call(this);

        if (!Array.isArray(items)) {
          return [];
        }

        return items.filter(function (item) {
          return item &&
            item.route &&
            hasMenuPermission(item.route);
        });
      };
    }

    // صفحه وضعیت‌های پروژه باید در Router مجوز مشخص داشته باشد.
    if (
      Router.pages &&
      Router.pages['project-statuses'] &&
      Router.routePermissions &&
      !Router.routePermissions['project-statuses']
    ) {
      Router.routePermissions['project-statuses'] = [
        'PROJECT_STATUS_MANAGE'
      ];
    }

    // افزودن گزینه وضعیت‌های پروژه، فقط اگر در برنامه تعریف شده باشد.
    if (Array.isArray(Layout.navItems)) {
      const hasStatusItem = Layout.navItems.some(function (item) {
        return item.route === 'project-statuses';
      });

      if (
        Router.pages &&
        Router.pages['project-statuses'] &&
        !hasStatusItem
      ) {
        Layout.navItems.push({
          route: 'project-statuses',
          label: 'وضعیت‌های پروژه',
          icon: '◉',
          permission: 'PROJECT_STATUS_MANAGE'
        });
      }
    }

    // تابع عمومی برای بررسی دسترسی منو؛ بدون مجوزهای تکراری.
    window.PMS.SidebarAccess = {
      install: install,
      hasMenuPermission: hasMenuPermission
    };

    if (typeof Layout.renderNav === 'function') {
      Layout.renderNav();
    }

    return true;
  }

  window.PMS.SidebarAccess = {
    install: install,
    hasMenuPermission: function (route) {
      if (!window.PMS || !PMS.Router) {
        return false;
      }

      if (typeof PMS.Router.isAdmin === 'function' &&
          PMS.Router.isAdmin()) {
        return true;
      }

      return typeof PMS.Router.hasRouteAccess === 'function' &&
        PMS.Router.hasRouteAccess(route);
    }
  };

  if (!install()) {
    document.addEventListener('DOMContentLoaded', install);
  }
})();