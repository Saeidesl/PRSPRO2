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
      this.loadProjectsForDeletion();

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
      const previewButton = document.getElementById('admin-delete-project-preview');
      const deleteButton = document.getElementById('admin-delete-project-confirm');
      if (previewButton && !previewButton.dataset.bound) {
        previewButton.dataset.bound = 'true';
        previewButton.addEventListener('click', function () { Admin.previewProjectDeletion(); });
      }
      if (deleteButton && !deleteButton.dataset.bound) {
        deleteButton.dataset.bound = 'true';
        deleteButton.addEventListener('click', function () { Admin.deleteProject(); });
      }
      const projectSelect = document.getElementById('admin-delete-project-id');
      const projectCode = document.getElementById('admin-delete-project-code');
      if (projectSelect && !projectSelect.dataset.bound) {
        projectSelect.dataset.bound = 'true';
        projectSelect.addEventListener('change', function () {
          Admin.deletionPreview = null;
          const result = document.getElementById('admin-delete-project-preview-result');
          if (result) result.textContent = '';
          if (deleteButton) deleteButton.disabled = true;
          if (projectCode) projectCode.value = '';
        });
      }
      if (projectCode && !projectCode.dataset.bound) {
        projectCode.dataset.bound = 'true';
        projectCode.addEventListener('input', function () { Admin.updateDeleteButton(); });
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

    deletionPreview: null,

    loadProjectsForDeletion: async function () {
      const select = document.getElementById('admin-delete-project-id');
      if (!select) return;
      try {
        const response = await PMS.Api.get('/projects', { trackSync: false });
        const projects = PMS.Api.extractData(response);
        if (!Array.isArray(projects)) throw new Error('فهرست پروژه‌ها در قالب مورد انتظار دریافت نشد.');
        select.innerHTML = '<option value="">انتخاب پروژه…</option>' + projects.map(function (project) {
          const id = project.ID || project.Id || '';
          const code = project.ProjectCode || '';
          const name = project.ProjectName || project.Name || '';
          return '<option value="' + Admin.escape(id) + '">' + Admin.escape(code + (name ? ' — ' + name : '')) + '</option>';
        }).join('');
      } catch (error) {
        select.innerHTML = '<option value="">دریافت پروژه‌ها ناموفق بود</option>';
        Admin.setDeletionMessage(error && error.message ? error.message : 'دریافت فهرست پروژه‌ها ناموفق بود.', true);
      }
    },

    previewProjectDeletion: async function () {
      const select = document.getElementById('admin-delete-project-id');
      const result = document.getElementById('admin-delete-project-preview-result');
      const button = document.getElementById('admin-delete-project-preview');
      if (!select || !select.value) {
        this.setDeletionMessage('ابتدا پروژه را انتخاب کنید.', true);
        return;
      }
      this.deletionPreview = null;
      this.updateDeleteButton();
      if (button) button.disabled = true;
      if (result) result.textContent = 'در حال بررسی وابستگی‌ها…';
      try {
        const response = await PMS.Api.get('/admin/projects/' + encodeURIComponent(select.value) + '/deletion-preview', { trackSync: false, retry: false });
        const preview = PMS.Api.extractData(response);
        if (!preview || !preview.project || !preview.counts) throw new Error('پاسخ پیش‌نمایش معتبر نیست.');
        this.deletionPreview = preview;
        const labels = {
          events: 'رویدادها', eventData: 'داده‌های رویداد', attachments: 'پیوست‌ها',
          materialNeeds: 'نیازهای ملزومات', purchaseOrders: 'سفارش‌های خرید',
          purchaseOrderItems: 'اقلام سفارش', allocations: 'تخصیص‌ها', receipts: 'رسیدها',
          materialSpecifications: 'مشخصات ملزومات', materialCalculations: 'محاسبات ملزومات'
        };
        const lines = Object.keys(labels).map(function (key) {
          return '<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0"><span>' +
            Admin.escape(labels[key]) + '</span><strong>' + Number(preview.counts[key] || 0) + '</strong></div>';
        }).join('');
        if (result) result.innerHTML = '<div><strong>پروژه: ' + Admin.escape(preview.project.ProjectCode) + ' — ' +
          Admin.escape(preview.project.ProjectName || '') + '</strong></div><div style="margin-top:8px">' + lines + '</div>';
        this.setDeletionMessage('پیش‌نمایش آماده است. کد پروژه را برای تأیید وارد کنید.', false);
        this.updateDeleteButton();
      } catch (error) {
        if (result) result.textContent = '';
        this.setDeletionMessage(error && error.message ? error.message : 'بررسی اطلاعات وابسته ناموفق بود.', true);
      } finally {
        if (button) button.disabled = false;
      }
    },

    updateDeleteButton: function () {
      const button = document.getElementById('admin-delete-project-confirm');
      const code = document.getElementById('admin-delete-project-code');
      const select = document.getElementById('admin-delete-project-id');
      const expected = this.deletionPreview && this.deletionPreview.confirmationCode;
      if (button) button.disabled = !(this.deletionPreview && select && select.value === String(this.deletionPreview.project.ID) &&
        code && expected && code.value.trim() === String(expected).trim());
    },

    deleteProject: async function () {
      if (!this.deletionPreview) return;
      const preview = this.deletionPreview;
      if (!window.confirm('این عملیات اطلاعات وابسته به پروژه «' + preview.project.ProjectCode + '» را حذف می‌کند. ادامه می‌دهید؟')) return;
      const button = document.getElementById('admin-delete-project-confirm');
      const select = document.getElementById('admin-delete-project-id');
      const code = document.getElementById('admin-delete-project-code');
      if (button) button.disabled = true;
      try {
        await PMS.Api.delete('/admin/projects/' + encodeURIComponent(preview.project.ID), {
          body: { confirmationCode: code ? code.value.trim() : '' },
          trackSync: false,
          retry: false
        });
        this.deletionPreview = null;
        if (code) code.value = '';
        this.setDeletionMessage('درخواست حذف با موفقیت انجام شد.', false);
        if (select) {
          const option = select.querySelector('option[value="' + CSS.escape(String(preview.project.ID)) + '"]');
          if (option) option.remove();
          select.value = '';
        }
        const result = document.getElementById('admin-delete-project-preview-result');
        if (result) result.textContent = '';
        await this.loadProjectsForDeletion();
      } catch (error) {
        this.setDeletionMessage(error && error.message ? error.message : 'حذف پروژه ناموفق بود. وضعیت رکوردها را بررسی کنید.', true);
      } finally {
        this.updateDeleteButton();
      }
    },

    setDeletionMessage: function (message, isError) {
      const element = document.getElementById('admin-delete-project-message');
      if (!element) return;
      element.style.color = isError ? 'var(--color-danger, #cf222e)' : 'var(--color-success, #1a7f37)';
      element.textContent = message;
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