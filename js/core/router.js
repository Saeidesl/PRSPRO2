
(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const Router = {
    pages: {
      login: 'pages/login.html',
      dashboard: 'pages/dashboard.html',
      projects: 'pages/projects.html',
      'design-cases': 'pages/design-cases.html',
      'project-detail': 'pages/project-detail.html',
      events: 'pages/events.html',
      workflows: 'pages/workflows.html',
      'project-statuses': 'pages/project-statuses.html',
      'event-types': 'pages/event-types.html',
      procurement: 'pages/procurement.html',
      attachments: 'pages/attachments.html',
      reports: 'pages/reports.html',
      users: 'pages/users.html',
      departments: 'pages/departments.html',
      roles: 'pages/roles.html',
      permissions: 'pages/permissions.html',
      audit: 'pages/audit.html',
      settings: 'pages/settings.html',
      admin: 'pages/admin.html'
    },

    currentPage: null,
    layoutRendered: false,
    handling: false,
    pending: false,
    permissions: [],
    permissionsLoaded: false,
    permissionsRequest: null,
    serverIsAdmin: false,
    authGeneration: 0,
    authExpiredListener: null,

    routePermissions: {
      dashboard: ['REPORT_VIEW'],
      projects: ['PROJECT_VIEW', 'PROJECT_CREATE'],
      'design-cases': ['PROJECT_VIEW', 'PROJECT_CREATE'],
      'project-detail': ['PROJECT_VIEW'],
      events: ['EVENT_VIEW', 'EVENT_CREATE'],
      workflows: ['WORKFLOW_MANAGE'],
      'project-statuses': ['PROJECT_STATUS_MANAGE'],
      'event-types': ['EVENT_TYPE_MANAGE'],
      procurement: ['PROCUREMENT_VIEW', 'PROCUREMENT_MANAGE'],
      attachments: ['ATTACHMENT_VIEW'],
      reports: ['REPORT_VIEW'],
      users: ['USER_VIEW', 'USER_CREATE'],
      departments: ['DEPARTMENT_MANAGE'],
      roles: ['ROLE_MANAGE'],
      permissions: ['PERMISSION_MANAGE'],
      audit: ['REPORT_VIEW'],
      settings: ['SYSTEM_SETTINGS'],
      admin: ['SYSTEM_SETTINGS']
    },

getBaseUrl: function () {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const projectName = 'PRSPRO2';

  if (parts.length && parts[0].toLowerCase() === projectName.toLowerCase()) {
    // The isolated staging frontend is published under /PRSPRO2/staging/.
    if (parts[1] && parts[1].toLowerCase() === 'staging') {
      return new URL('/' + parts[0] + '/staging/', window.location.origin);
    }
    return new URL('/' + parts[0] + '/', window.location.origin);
  }

  return new URL('/PRSPRO2/', window.location.origin);
},
    resolveUrl: function (path) {
      path = String(path || '').trim();
      if (!path) throw new Error('مسیر فایل خالی است.');

      if (/^(https?:)?\/\//i.test(path)) {
        return new URL(path, window.location.href).href;
      }

      if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path)) {
        return new URL(path).href;
      }

      return new URL(path.replace(/^\/+/, ''), Router.getBaseUrl()).href;
    },

    isLoggedIn: function () {
      return !!(
        window.PMS.Session &&
        typeof window.PMS.Session.isAuthenticated === 'function' &&
        window.PMS.Session.isAuthenticated()
      );
    },

    getUser: function () {
      if (window.PMS.Session &&
          typeof window.PMS.Session.getUser === 'function') {
        return window.PMS.Session.getUser() || {};
      }

      return {};
    },

    isAdmin: function () {
      // Only the authenticated backend response is authoritative.
      return Router.serverIsAdmin === true;
    },

    getHomeRoute: function () {
      return 'events';
    },

    loadPermissions: async function () {
      if (Router.permissionsLoaded) return true;
      if (Router.permissionsRequest) return Router.permissionsRequest;

      const generation = Router.authGeneration;
      Router.permissionsRequest = (async function () {
        try {
          if (!window.PMS.Api ||
              typeof window.PMS.Api.get !== 'function') {
            throw new Error('سرویس API در دسترس نیست.');
          }

          const response = await window.PMS.Api.get('/auth/me/permissions');

          let data = response &&
            Object.prototype.hasOwnProperty.call(response, 'data')
            ? response.data
            : response;

          if (data && data.success === false) {
            throw new Error(
              data.error && data.error.message
                ? data.error.message
                : 'دریافت دسترسی‌ها ناموفق بود.'
            );
          }

          if (data && data.data) data = data.data;

          if (generation !== Router.authGeneration) return false;
          Router.serverIsAdmin = !!(data && data.isAdmin === true);

          let list = [];

          if (Array.isArray(data)) {
            list = data;
          } else if (data && Array.isArray(data.permissions)) {
            list = data.permissions;
          } else if (data && Array.isArray(data.items)) {
            list = data.items;
          }

          Router.permissions = list.map(function (item) {
            if (typeof item === 'string') return item;

            return item &&
              (item.Code || item.PermissionCode || item.code || '');
          }).filter(Boolean);

          Router.permissionsLoaded = true;
          return true;
        } catch (error) {
          console.error('خطا در دریافت دسترسی‌ها:', error);
          if (generation === Router.authGeneration) {
            Router.permissions = [];
            Router.permissionsLoaded = false;
            Router.serverIsAdmin = false;
          }
          return false;
        } finally {
          if (generation === Router.authGeneration) Router.permissionsRequest = null;
        }
      })();

      return Router.permissionsRequest;
    },

    hasRouteAccess: function (route) {
      if (Router.isAdmin()) return true;

      const mainRoute = String(route || '').split('/')[0];

      if (!Router.pages[mainRoute] || !Router.permissionsLoaded) {
        return false;
      }

      const required = Router.routePermissions[mainRoute] || [];

      return required.some(function (permission) {
        return Router.permissions.indexOf(permission) !== -1;
      });
    },

    resetAuthState: function () {
      Router.authGeneration += 1;
      Router.permissions = [];
      Router.permissionsLoaded = false;
      Router.permissionsRequest = null;
      Router.serverIsAdmin = false;
      Router.currentPage = null;
      if (window.PMS.Permissions && typeof window.PMS.Permissions.clear === 'function') {
        window.PMS.Permissions.clear();
      }
    },

    init: function () {
      window.addEventListener('hashchange', function () {
        Router.handle();
      });

      if (Router.authExpiredListener) {
        window.removeEventListener('pms:auth-expired', Router.authExpiredListener);
      }
      Router.authExpiredListener = function (event) {
        const detail = event && event.detail ? event.detail : {};
        if (window.PMS.Auth && typeof window.PMS.Auth.handleAuthExpired === 'function') {
          window.PMS.Auth.handleAuthExpired(detail.message || 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
        } else {
          Router.resetAuthState();
          if (window.PMS.Session && typeof window.PMS.Session.clear === 'function') window.PMS.Session.clear();
          Router.navigate('login', true);
        }
      };
      window.addEventListener('pms:auth-expired', Router.authExpiredListener);

      Router.handle();
    },

    handle: async function () {
      if (Router.handling) {
        // Preserve the latest requested route while a navigation is in progress.
        Router.pending = true;
        return;
      }
      Router.handling = true;
      Router.pending = false;

      try {
        let route = window.location.hash.replace(/^#/, '').trim();

        if (!route) route = Router.getHomeRoute();

        let mainRoute = route.split('/')[0];

        if (!Router.pages[mainRoute]) {
          route = Router.getHomeRoute();
          mainRoute = 'events';
        }

        if (!Router.isLoggedIn() && mainRoute !== 'login') {
          Router.changeRoute('login', true);
          route = 'login';
          mainRoute = 'login';
        }

        if (Router.isLoggedIn() && mainRoute === 'login') {
          route = Router.getHomeRoute();
          mainRoute = 'events';
          Router.changeRoute(route, true);
        }

        if (mainRoute === 'login') {
          await Router.loadLogin();
          return;
        }

        if (!Router.isLoggedIn()) return;

        const permissionsOk = await Router.loadPermissions();

        if (!permissionsOk || !Router.hasRouteAccess(route)) {
          const fallbackRoutes = Router.isAdmin()
            ? ['dashboard', 'events', 'projects']
            : [
                'events',
                'projects',
                'dashboard',
                'reports',
                'users',
                'workflows',
                'event-types',
                'attachments',
                'departments',
                'roles',
                'permissions',
                'audit',
                'settings',
                'admin'
              ];

          const fallbackRoute = permissionsOk
            ? fallbackRoutes.find(function (candidate) {
                return Router.hasRouteAccess(candidate);
              })
            : null;

          if (!fallbackRoute) {
            if (!Router.layoutRendered) Router.renderLayout();

            const content = document.getElementById('page-content');

            if (content) {
              content.innerHTML =
                '<div class="alert alert-danger">' +
                'شما به هیچ صفحه قابل‌نمایشی دسترسی ندارید. ' +
                'از مدیر سامانه بخواهید دسترسی مناسب را برای نقش شما فعال کند.' +
                '</div>';
            }

            return;
          }

          route = fallbackRoute;
          mainRoute = fallbackRoute;
          Router.changeRoute(fallbackRoute, true);
        }

        if (!Router.layoutRendered) Router.renderLayout();

        await Router.loadPage(mainRoute, route);
      } catch (error) {
        console.error('Router Error:', error);

        const content = document.getElementById('page-content');
        if (content) {
          const message = error && error.message
            ? error.message
            : 'خطای نامشخص هنگام باز کردن صفحه.';
          content.innerHTML =
            '<div class="alert alert-danger" role="alert" style="direction:rtl;text-align:right;padding:16px">' +
            '<strong>صفحه باز نشد.</strong><br>' +
            String(message).replace(/[&<>"]/g, function (character) {
              return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character];
            }) +
            '</div>';
        }
      } finally {
        Router.handling = false;
        if (Router.pending) {
          Router.pending = false;
          Promise.resolve().then(function () {
            Router.handle();
          });
        }
      }
    },

    changeRoute: function (route, replace) {
      const target = '#' + (route || Router.getHomeRoute());

      if (window.location.hash === target) return;

      if (replace) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search + target
        );
      } else {
        window.location.hash = route;
      }
    },

    renderLayout: function () {
      if (!window.PMS.Layout ||
          typeof window.PMS.Layout.render !== 'function') {
        console.error('PMS.Layout.render پیدا نشد.');
        return;
      }

      try {
        window.PMS.Layout.render();
      } catch (error) {
        console.error('خطا در ساختار ظاهری صفحه:', error);
      }

      // If the shell was created, continue to the requested page even if
      // a non-essential layout initializer failed.
      Router.layoutRendered = !!document.getElementById('page-content');

      if (!Router.layoutRendered) {
        throw new Error('ساختار اصلی صفحه ساخته نشد؛ عنصر page-content در دسترس نیست.');
      }

      if (typeof window.PMS.Layout.setActiveRoute === 'function') {
        try {
          window.PMS.Layout.setActiveRoute();
        } catch (error) {
          console.warn('به‌روزرسانی منوی فعال انجام نشد:', error);
        }
      }
    },

    loadLogin: async function () {
      const app = document.getElementById('app');

      if (!app) {
        console.error('عنصر app پیدا نشد.');
        return;
      }

      try {
        const pageUrl = Router.resolveUrl(Router.pages.login);
        const response = await fetch(pageUrl, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(
            'خطا در بارگذاری صفحه ورود: ' +
            response.status + ' - ' + pageUrl
          );
        }

        app.innerHTML = await response.text();
        Router.layoutRendered = false;

        await Router.executePageScripts(app);
        Router.initPageModule('login');
      } catch (error) {
        console.error('Login Router Error:', error);

        app.innerHTML =
          '<div class="alert alert-danger">' +
          'خطا در بارگذاری صفحه ورود. کنسول مرورگر را بررسی کنید.' +
          '</div>';
      }
    },

    loadPage: async function (page, route) {
      const content = document.getElementById('page-content');

      if (!content) {
        console.error('page-content پیدا نشد.');
        return;
      }

      const pagePath = Router.pages[page];

      if (!pagePath) {
        console.error('مسیر صفحه تعریف نشده است:', page);
        return;
      }

      if (!Router.hasRouteAccess(route)) {
        content.innerHTML =
          '<div class="alert alert-danger">' +
          'شما اجازه مشاهده این صفحه را ندارید.' +
          '</div>';
        return;
      }

      try {
        const pageUrl = Router.resolveUrl(pagePath);
        const response = await fetch(pageUrl, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(
            'خطا در بارگذاری صفحه: ' +
            response.status + ' - ' + pageUrl
          );
        }

        content.innerHTML = await response.text();
        Router.currentPage = route;

        await Router.executePageScripts(content);

        if (window.PMS.Layout &&
            typeof window.PMS.Layout.setActiveRoute === 'function') {
          window.PMS.Layout.setActiveRoute();
        }

        Router.initPageModule(page);
      } catch (error) {
        console.error('Router Error:', error);

        content.innerHTML =
          '<div class="alert alert-danger">' +
          'خطا در بارگذاری صفحه. کنسول مرورگر را بررسی کنید.' +
          '</div>';
      }
    },

    executePageScripts: async function (container) {
      const scripts = Array.from(container.querySelectorAll('script'));

      for (const oldScript of scripts) {
        const newScript = document.createElement('script');

        Array.from(oldScript.attributes).forEach(function (attribute) {
          newScript.setAttribute(attribute.name, attribute.value);
        });

        if (oldScript.hasAttribute('src')) {
          newScript.src = Router.resolveUrl(oldScript.getAttribute('src'));
          newScript.async = false;
        } else {
          newScript.textContent = oldScript.textContent;
        }

        const loaded = new Promise(function (resolve, reject) {
          if (!newScript.hasAttribute('src')) {
            resolve();
            return;
          }

          newScript.onload = resolve;

          newScript.onerror = function () {
            reject(
              new Error('بارگذاری اسکریپت ناموفق بود: ' + newScript.src)
            );
          };
        });

        oldScript.parentNode.replaceChild(newScript, oldScript);

        if (newScript.hasAttribute('src')) await loaded;
      }
    },

    initPageModule: function (page) {
      const moduleMap = {
        dashboard: 'Dashboard',
        projects: 'Projects',
        'design-cases': 'DesignCases',
        'project-detail': 'ProjectDetail',
        events: 'Events',
        workflows: 'Workflows',
        'project-statuses': 'ProjectStatuses',
        'event-types': 'EventTypes',
        attachments: 'Attachments',
        reports: 'Reports',
        users: 'Users',
        departments: 'Departments',
        roles: 'Roles',
        permissions: 'Permissions',
        audit: 'Audit',
        settings: 'Settings',
        admin: 'Admin',
        login: 'Auth'
      };

      const moduleName = moduleMap[page];
      if (!moduleName) return;

      const module = window.PMS.Modules[moduleName];

      if (!module || typeof module.init !== 'function') {
        console.warn('ماژول صفحه پیدا نشد:', moduleName);
        return;
      }

      try {
        module.init();
      } catch (error) {
        console.error('خطا در اجرای init ماژول:', moduleName, error);
      }
    },

    go: function (route) {
      window.location.hash = route || Router.getHomeRoute();
    },

    getCurrentRoute: function () {
      return window.location.hash.replace(/^#/, '').trim() ||
        Router.getHomeRoute();
    },

    navigate: function (route, replace) {
      route = route || Router.getHomeRoute();
      Router.changeRoute(route, !!replace);

      if (Router.getCurrentRoute() === route && !Router.handling) {
        Router.handle();
      }
    }
  };

  window.PMS.Router = Router;
})();
