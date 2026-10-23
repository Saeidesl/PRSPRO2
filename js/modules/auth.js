(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const Auth = {
    init: function () {
      const form = document.getElementById('login-form');

      if (!form) {
        console.warn('فرم ورود با شناسه login-form پیدا نشد.');
        return;
      }

      if (form.dataset.authInitialized === 'true') return;
      form.dataset.authInitialized = 'true';

      form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const usernameInput = form.querySelector('[name="username"]');
        const passwordInput = form.querySelector('[name="password"]');
        const submitButton = form.querySelector('[type="submit"]');
        const message = document.getElementById('login-error') ||
          document.getElementById('login-message');

        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const originalButtonText = submitButton ? submitButton.textContent : '';

        if (message) {
          message.textContent = '';
          message.classList.add('hidden');
          message.style.display = '';
        }

        try {
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'در حال ورود...';
          }

          const data = await Auth.login(username, password);
          const user = data.user || {};
          const isAdmin =
            user.IsAdmin === true ||
            String(user.IsAdmin).toLowerCase() === 'true' ||
            String(user.DepartmentCode || '').trim().toUpperCase() === 'ADMIN';

          await PMS.Router.navigate(isAdmin ? 'dashboard' : 'events', true);
        } catch (error) {
          console.error('Login Error:', error);

          if (message) {
            message.textContent = error.message || 'ورود ناموفق بود.';
            message.classList.remove('hidden');
            message.style.display = 'block';
          } else {
            alert(error.message || 'ورود ناموفق بود.');
          }
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText || 'ورود';
          }
        }
      });
    },

    login: async function (username, password) {
      if (!username || !password) {
        throw new Error('نام کاربری و رمز عبور الزامی است.');
      }

      const result = await PMS.Api.post('/auth/login', {
        username: username,
        password: password
      });

      if (!result || !result.data) {
        throw new Error('اطلاعات ورود از سرور دریافت نشد.');
      }

      const data = result.data;

      if (!data.token) {
        throw new Error('نشست کاربر ایجاد نشد.');
      }

      // Reset all in-memory authorization state before switching accounts.
      if (PMS.Router && typeof PMS.Router.resetAuthState === 'function') {
        PMS.Router.resetAuthState();
      }
      if (PMS.Layout && typeof PMS.Layout.resetAuthState === 'function') {
        PMS.Layout.resetAuthState();
      }

      // Do not let cached data from a previous account appear in this session.
      if (PMS.Cache && typeof PMS.Cache.clear === 'function') {
        PMS.Cache.clear();
      }

      PMS.Session.save({
        token: data.token,
        user: data.user || null
      });

      if (
        data.permissions &&
        Array.isArray(data.permissions) &&
        PMS.Permissions &&
        typeof PMS.Permissions.set === 'function'
      ) {
        PMS.Permissions.set(data.permissions);
      }

      return data;
    },

    logout: async function () {
      // Keep the token available until the server has had a chance to revoke
      // the current session. Always clear local state afterwards.
      try {
        if (PMS.Api && typeof PMS.Api.post === 'function') {
          await PMS.Api.post('/auth/logout', {});
        }
      } catch (error) {
        console.warn('بستن نشست سرور انجام نشد؛ پاک‌سازی محلی ادامه پیدا می‌کند.', error);
      } finally {
        try {
          if (PMS.Permissions && typeof PMS.Permissions.clear === 'function') {
            PMS.Permissions.clear();
          }
        } catch (error) {
          console.warn('پاک‌سازی مجوزهای محلی انجام نشد:', error);
        }

        try {
          if (PMS.Cache && typeof PMS.Cache.clear === 'function') {
            PMS.Cache.clear();
          }
        } catch (error) {
          console.warn('پاک‌سازی کش محلی انجام نشد:', error);
        }

        try {
          if (PMS.Session && typeof PMS.Session.clear === 'function') {
            PMS.Session.clear();
          } else if (PMS.Api && typeof PMS.Api.clearToken === 'function') {
            PMS.Api.clearToken();
          }
        } catch (error) {
          console.error('پاک‌سازی نشست محلی انجام نشد:', error);
        }
      }

      if (PMS.Router && typeof PMS.Router.resetAuthState === 'function') {
        PMS.Router.resetAuthState();
      }
      if (PMS.Layout && typeof PMS.Layout.resetAuthState === 'function') {
        PMS.Layout.resetAuthState();
      }

      if (PMS.Router && typeof PMS.Router.navigate === 'function') {
        PMS.Router.navigate('login', true);
      } else {
        window.location.hash = '#login';
      }
    },

    handleAuthExpired: function (message) {
      // Do not call /auth/logout: the server has already rejected this token.
      try {
        if (PMS.Permissions && typeof PMS.Permissions.clear === 'function') PMS.Permissions.clear();
        if (PMS.Cache && typeof PMS.Cache.clear === 'function') PMS.Cache.clear();
        if (PMS.Session && typeof PMS.Session.clear === 'function') PMS.Session.clear();
        else if (PMS.Api && typeof PMS.Api.clearToken === 'function') PMS.Api.clearToken();
      } finally {
        if (PMS.Router && typeof PMS.Router.resetAuthState === 'function') PMS.Router.resetAuthState();
        if (PMS.Layout && typeof PMS.Layout.resetAuthState === 'function') PMS.Layout.resetAuthState();
        if (PMS.Router && typeof PMS.Router.navigate === 'function') PMS.Router.navigate('login', true);
        else window.location.hash = '#login';
      }
      window.setTimeout(function () {
        const target = document.getElementById('login-message') || document.getElementById('login-error');
        if (target && message) {
          target.textContent = message;
          target.classList.remove('hidden');
          target.style.display = 'block';
        }
      }, 0);
    },

    me: async function () {
      const result = await PMS.Api.get('/auth/me');

      if (result && result.data) {
        PMS.Session.setUser(result.data);
      }

      return result;
    },

    isLoggedIn: function () {
      return PMS.Session.isAuthenticated();
    }
  };

  window.PMS.Auth = Auth;
  window.PMS.Modules.Auth = Auth;
})();