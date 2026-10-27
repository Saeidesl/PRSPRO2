(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const Admin = {
    refreshTimer: null,
    busy: false,

    init: function () {
      this.bindEvents();
      this.loadSessions();

      if (this.refreshTimer) window.clearInterval(this.refreshTimer);
      const self = this;
      this.refreshTimer = window.setInterval(function () {
        const route = window.PMS.Router && window.PMS.Router.getCurrentRoute
          ? window.PMS.Router.getCurrentRoute().split('/')[0]
          : '';
        if (route !== 'admin') {
          window.clearInterval(self.refreshTimer);
          self.refreshTimer = null;
          return;
        }
        self.loadSessions(true);
      }, 30000);
    },

    bindEvents: function () {
      const refresh = document.getElementById('admin-sessions-refresh');
      const table = document.getElementById('admin-sessions-table');
      if (refresh && !refresh.dataset.bound) {
        refresh.dataset.bound = 'true';
        refresh.addEventListener('click', function () { Admin.loadSessions(); });
      }
      if (table && !table.dataset.bound) {
        table.dataset.bound = 'true';
        table.addEventListener('click', function (event) {
          const button = event.target.closest('.admin-session-revoke');
          if (!button || button.disabled) return;
          Admin.revokeSession(button.dataset.sessionId, button.dataset.userName);
        });
      }
    },

    loadSessions: async function (quiet) {
      if (this.busy) return;
      this.busy = true;
      const loading = document.getElementById('admin-sessions-loading');
      const message = document.getElementById('admin-sessions-message');
      const refresh = document.getElementById('admin-sessions-refresh');
      if (loading && !quiet) loading.hidden = false;
      if (message && !quiet) message.textContent = '';
      if (refresh) refresh.disabled = true;

      try {
        const response = await PMS.Api.get('/admin/sessions', { trackSync: false, retry: false });
        const data = response && response.data ? response.data : response;
        const sessions = data && Array.isArray(data.sessions) ? data.sessions : [];
        const onlineCount = document.getElementById('admin-online-count');
        const totalCount = document.getElementById('admin-total-count');
        if (onlineCount) onlineCount.textContent = String(data.onlineCount || 0);
        if (totalCount) totalCount.textContent = String(data.totalSessions || sessions.length);

        this.renderSessions(sessions);
        if (message && !quiet) message.textContent = 'فهرست نشست‌ها به‌روز شد.';
      } catch (error) {
        if (message) {
          message.textContent = error && error.message
            ? error.message
            : 'دریافت فهرست نشست‌ها ناموفق بود.';
          message.style.color = 'var(--color-danger, #cf222e)';
        }
      } finally {
        this.busy = false;
        if (loading) loading.hidden = true;
        if (refresh) refresh.disabled = false;
      }
    },

    renderSessions: function (sessions) {
      const body = document.getElementById('admin-sessions-table');
      const wrap = document.getElementById('admin-sessions-table-wrap');
      const empty = document.getElementById('admin-sessions-empty');
      if (!body || !wrap || !empty) return;

      if (!sessions.length) {
        body.textContent = '';
        wrap.hidden = true;
        empty.hidden = false;
        return;
      }

      empty.hidden = true;
      wrap.hidden = false;
      body.innerHTML = sessions.map(function (session) {
        const status = session.online
          ? '<span style="color:var(--color-success,#1a7f37);font-weight:600">● آنلاین</span>'
          : '<span class="text-muted">○ غیرفعال / بدون فعالیت اخیر</span>';
        const action = session.isCurrent
          ? '<span class="text-muted">نشست فعلی شما</span>'
          : '<button type="button" class="btn btn-sm btn-danger admin-session-revoke" data-session-id="' +
            Admin.escape(session.sessionId) + '" data-user-name="' +
            Admin.escape(session.userName) + '">خاتمه نشست</button>';
        return '<tr>' +
          '<td><strong>' + Admin.escape(session.userName || 'کاربر') + '</strong><br><span class="text-muted">' +
          Admin.escape(session.username || '') + '</span></td>' +
          '<td>' + status + '</td>' +
          '<td>' + Admin.escape(Admin.formatDate(session.createdAt)) + '</td>' +
          '<td>' + Admin.escape(Admin.formatDate(session.lastSeenAt)) + '</td>' +
          '<td style="white-space:nowrap">' + action + '</td>' +
          '</tr>';
      }).join('');
    },

    revokeSession: async function (sessionId, userName) {
      const name = userName || 'این کاربر';
      if (!window.confirm('نشست «' + name + '» خاتمه داده شود؟ کاربر در درخواست بعدی مجبور به ورود مجدد خواهد شد.')) return;

      const message = document.getElementById('admin-sessions-message');
      const buttons = document.querySelectorAll('.admin-session-revoke');
      buttons.forEach(function (button) { button.disabled = true; });
      try {
        await PMS.Api.delete('/admin/sessions/' + encodeURIComponent(sessionId), {
          trackSync: false,
          retry: false
        });
        if (message) {
          message.style.color = 'var(--color-success, #1a7f37)';
          message.textContent = 'نشست کاربر خاتمه یافت.';
        }
        await this.loadSessions(true);
      } catch (error) {
        if (message) {
          message.style.color = 'var(--color-danger, #cf222e)';
          message.textContent = error && error.message ? error.message : 'خاتمه نشست ناموفق بود.';
        }
      } finally {
        buttons.forEach(function (button) { button.disabled = false; });
      }
    },

    formatDate: function (value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '—';
      try {
        return new Intl.DateTimeFormat('fa-IR', {
          dateStyle: 'short',
          timeStyle: 'short'
        }).format(date);
      } catch (error) {
        return date.toLocaleString();
      }
    },

    escape: function (value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }
  };

  window.PMS.Admin = Admin;
  window.PMS.Modules.Admin = Admin;
})();