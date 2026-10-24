/**
 * ============================================================
 * PRODUCTION MANAGEMENT SYSTEM
 * SESSION
 * ============================================================
 */

(function () {
  'use strict';

  const KEY = 'pms_session';

  const Session = {
    save: function (data) {
      if (!data) return;

      // Keep the in-memory/API token in sync even when browser storage is
      // unavailable (for example, private browsing or a storage quota error).
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch (error) {
        // Session storage is a persistence convenience, not an auth authority.
      }

      if (data.token && window.PMS && PMS.Api &&
          typeof PMS.Api.setToken === 'function') {
        PMS.Api.setToken(data.token);
      }
    },

    get: function () {
      try {
        const value = localStorage.getItem(KEY);
        if (!value) return null;
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    },

    getUser: function () {
      const session = this.get();
      return session && session.user ? session.user : null;
    },

    getToken: function () {
      const session = this.get();
      if (session && session.token) return session.token;

      return window.PMS && PMS.Api &&
        typeof PMS.Api.getToken === 'function'
        ? PMS.Api.getToken()
        : null;
    },

    isAuthenticated: function () {
      return !!this.getToken();
    },

    clear: function () {
      // Always clear the in-memory/API token even if localStorage throws.
      try {
        localStorage.removeItem(KEY);
      } catch (error) {
        // Continue clearing the remaining local authentication state.
      }

      if (window.PMS && PMS.Api &&
          typeof PMS.Api.clearToken === 'function') {
        PMS.Api.clearToken();
      }
    },

    setUser: function (user) {
      const session = this.get() || {};
      session.user = user;
      this.save(session);
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Session = Session;
})();