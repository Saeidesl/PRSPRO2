(function () {
  'use strict';

  const ProjectDetail = {
    projectId: null,
    project: null,
    events: [],
    auditRecords: [],
    auditLoadError: '',
    users: [],
    departments: [],
    eventTypes: [],
    projectStatuses: [],
    workflowSteps: [],
    eventData: {},
    eventFields: {},
    loadVersion: 0,

    init: function () {
      this.projectId = this.getProjectId();

      if (!this.projectId) {
        this.showError('شناسه پروژه مشخص نیست.');
        return;
      }

      this.bindEvents();
      this.bindProjectPassportImageEvents();
      this.ensureProjectPassportStyles();
      this.load();
      this.loadProjectPassportImages(false);
      this.loadAuditHistory(false);
    },

    getProjectId: function () {
      const hash = window.location.hash || '';
      const parts = hash.split('/');

      if (
        parts.length < 2 ||
        parts[0] !== '#project-detail'
      ) {
        return null;
      }

      try {
        return decodeURIComponent(parts[1]);
      } catch (error) {
        return parts[1];
      }
    },

    getProjectCacheKey: function () {
      return window.PMS.Cache.keys.PROJECT + '_' + this.projectId;
    },

    getEventsCacheKey: function () {
      return window.PMS.Cache.keys.PROJECT_EVENTS + '_' + this.projectId;
    },

    getEventDetailsCacheKey: function () {
      return this.getEventsCacheKey() + '_DETAILS';
    },

    getCacheKey: function (base, id) {
      return base + '_' + String(id);
    },

    bindEvents: function () {
      const backButton = document.getElementById(
        'project-back-button'
      );

      const addEventButton = document.getElementById(
        'project-add-event-button'
      );

      if (backButton && !backButton.dataset.projectDetailBound) {
        backButton.dataset.projectDetailBound = '1';

        backButton.addEventListener('click', function () {
          window.location.hash = '#projects';
        });
      }

      const router = window.PMS.Router;
      const canCreateEvents = !!(
        router &&
        ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
          (Array.isArray(router.permissions) &&
            router.permissions.indexOf('EVENT_CREATE') !== -1))
      );

      if (addEventButton) {
        addEventButton.hidden = !canCreateEvents;
      }

      if (addEventButton && !addEventButton.dataset.projectDetailBound) {
        addEventButton.dataset.projectDetailBound = '1';

        addEventButton.addEventListener('click', function () {
          if (!ProjectDetail.projectId || !canCreateEvents) return;

          if (window.PMS.Events) {
            window.PMS.Events.preselectedProjectId = ProjectDetail.projectId;
          }

          window.location.hash = '#events';
        });
      }

      const auditRetry = document.getElementById('project-management-history-retry');
      if (auditRetry && !auditRetry.dataset.bound) {
        auditRetry.dataset.bound = '1';
        auditRetry.addEventListener('click', function () {
          ProjectDetail.loadAuditHistory(true);
        });
      }
    },

    loadAuditHistory: async function (forceRefresh) {
      const container = document.getElementById('project-management-history');
      const loading = document.getElementById('project-management-history-loading');
      const error = document.getElementById('project-management-history-error');
      const router = window.PMS.Router;
      const canViewAudit = !!(router &&
        ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
          (Array.isArray(router.permissions) && router.permissions.indexOf('REPORT_VIEW') !== -1)));

      const retry = document.getElementById('project-management-history-retry');
      if (!container) return;
      if (retry) retry.hidden = true;
      if (!canViewAudit) {
        if (loading) loading.hidden = true;
        if (error) {
          error.textContent = 'برای مشاهده تغییرات مدیریتی، دسترسی گزارش‌گیری لازم است.';
          error.hidden = false;
        }
        return;
      }

      if (loading) loading.hidden = false;
      if (error) error.hidden = true;

      try {
        const key = 'project_audit_' + String(this.projectId);
        const response = forceRefresh
          ? await window.PMS.Api.getFresh('/audit/entity/PROJECT/' + encodeURIComponent(this.projectId), key)
          : await window.PMS.Api.getCached('/audit/entity/PROJECT/' + encodeURIComponent(this.projectId), key);
        this.auditRecords = this.normalizeArray(response ? response.data : null, ['audits', 'items', 'Audits', 'Items']);
        this.auditLoadError = '';
        this.renderAuditHistory();
        await this.loadVoidedEventAuditHistory();
      } catch (auditError) {
        this.auditLoadError = auditError && auditError.message ? auditError.message : 'دریافت تغییرات مدیریتی ناموفق بود.';
        if (error) {
          error.textContent = this.auditLoadError;
          error.hidden = false;
        }
        if (container && !this.auditRecords.length) {
          container.innerHTML = '<div class="table-empty">دریافت تغییرات مدیریتی ناموفق بود.</div>';
        }
        if (retry) retry.hidden = false;
      } finally {
        if (loading) loading.hidden = true;
      }
    },

    loadVoidedEventAuditHistory: async function () {
      const router = window.PMS && window.PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const canViewAudit = !!(router && (
        (typeof router.isAdmin === 'function' && router.isAdmin()) ||
        permissions.indexOf('REPORT_VIEW') !== -1
      ));
      if (!canViewAudit) return;

      const self = this;
      const voided = (this.events || []).filter(function (event) {
        const status = String(event.Status || '').toUpperCase();
        return status === 'VOID' || status === 'CANCELLED';
      });
      await Promise.all(voided.map(async function (event) {
        const id = event.ID || event.Id || event.id;
        if (!id) return;
        try {
          const key = 'event_audit_' + String(id);
          const response = await window.PMS.Api.getCached('/audit/entity/EVENT/' + encodeURIComponent(id), key);
          const records = self.normalizeArray(response ? response.data : null, ['audits', 'items', 'Audits', 'Items']);
          records.forEach(function (record) {
            if (!self.auditRecords.some(function (existing) { return String(existing.ID || existing.Id) === String(record.ID || record.Id); })) {
              self.auditRecords.push(record);
            }
          });
        } catch (error) {}
      }));
      this.renderAuditHistory();
    },

    renderAuditHistory: function () {
      const container = document.getElementById('project-management-history');
      if (!container) return;
      this.ensureManagementHistoryStyles();
      const records = (this.auditRecords || []).slice().sort(function (a, b) {
        return new Date(b.CreatedAt || 0).getTime() - new Date(a.CreatedAt || 0).getTime();
      });
      if (!records.length) {
        container.innerHTML = '<div class="table-empty">تغییر مدیریتی برای این پروژه ثبت نشده است.</div>';
        return;
      }

      const actionLabels = {
        CREATE: 'ایجاد رکورد',
        UPDATE: 'ویرایش اطلاعات',
        DELETE: 'حذف رکورد',
        VOID: 'ابطال رویداد',
        PROJECT_CREATED: 'ایجاد پروژه',
        PROJECT_UPDATED: 'ویرایش اطلاعات پروژه',
        PROJECT_DELETED: 'حذف پروژه',
        EVENT_VOIDED: 'ابطال رویداد',
        EVENT_CANCELLED: 'لغو رویداد',
        EVENT_UPDATED: 'ویرایش رویداد'
      };

      container.innerHTML = records.map((record) => {
        const action = String(record.Action || 'تغییر مدیریتی');
        const entityType = String(record.EntityType || '').toUpperCase();
        const actionLabel = action === 'CREATE' && entityType === 'PROJECT'
          ? 'ایجاد پروژه'
          : (action === 'UPDATE' && entityType === 'PROJECT'
            ? 'ویرایش اطلاعات پروژه'
            : (action === 'VOID' && entityType === 'EVENT'
              ? 'ابطال رویداد'
              : (actionLabels[action] || action)));
        const user = this.findById(this.users, record.UserID || record.UserId);
        const userName = user ? (user.Name || user.FullName || user.Username) : (record.UserID || record.UserId || '-');
        const oldData = this.parseAuditData(record.OldData);
        const newData = this.parseAuditData(record.NewData);
        const changes = this.renderAuditDiff(oldData, newData);
        return '<article class="project-management-record">' +
          '<div class="project-management-record-head"><strong>' + this.escape(actionLabel) + '</strong><span>' + this.escape(this.formatDate(record.CreatedAt)) + '</span></div>' +
          '<div class="project-management-record-meta"><span>کاربر: ' + this.escape(userName) + '</span>' +
          (record.Reason ? '<span>دلیل: ' + this.escape(record.Reason) + '</span>' : '') + '</div>' +
          (changes ? '<details class="project-management-record-details"><summary>مشاهده جزئیات تغییر</summary>' + changes + '</details>' : '') +
          '</article>';
      }).join('');
    },

    ensureManagementHistoryStyles: function () {
      let style = document.getElementById('project-management-history-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'project-management-history-styles';
        document.head.appendChild(style);
      }
      style.textContent = [
        '.project-management-history-intro{font-size:12px;line-height:2;color:var(--color-text-secondary);margin:0 0 14px}',
        '.project-management-record{padding:12px 0;border-bottom:1px solid var(--color-border)}',
        '.project-management-record:last-child{border-bottom:0}',
        '.project-management-record-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
        '.project-management-record-head strong{font-size:13px;color:var(--color-text)}',
        '.project-management-record-head span,.project-management-record-meta{font-size:11px;color:var(--color-text-secondary);line-height:1.9}',
        '.project-management-record-meta{display:flex;gap:6px 16px;flex-wrap:wrap;margin-top:5px}',
        '.project-management-record-details{margin-top:8px;border:1px solid var(--color-border);border-radius:8px;padding:8px 10px;background:var(--color-surface)}',
        '.project-management-record-details summary{font-size:11px;cursor:pointer;color:var(--color-primary);font-weight:700}',
        '.project-management-diff{display:flex;flex-direction:column;gap:7px;margin-top:10px}',
        '.project-management-diff-row{display:grid;grid-template-columns:minmax(100px,.6fr) repeat(2,minmax(0,1fr));gap:8px;padding:8px;border-radius:7px;background:var(--color-background);font-size:11px;overflow-wrap:anywhere}',
        '.project-management-diff-row>strong{color:var(--color-text)}',
        '.project-management-diff-row>span{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--color-text-secondary)}',
        '.project-management-diff-row small{display:block;color:var(--color-text-muted);margin-bottom:3px}',
        '@media(max-width:600px){.project-management-diff-row{grid-template-columns:minmax(0,1fr)}.project-management-record-head{flex-direction:column;gap:2px}}'
      ].join('\n');
    },

    parseAuditData: function (value) {
      if (!value) return {};
      if (typeof value === 'object') return value;
      try {
        const parsed = JSON.parse(String(value));
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (error) {
        return {};
      }
    },

    renderAuditDiff: function (oldData, newData) {
      const keys = Array.from(new Set(Object.keys(oldData || {}).concat(Object.keys(newData || {}))));
      const labels = {
        ProjectCode: 'کد پروژه', Title: 'عنوان پروژه', Description: 'توضیحات',
        Status: 'وضعیت', CurrentStepID: 'مرحله فعلی', WorkflowID: 'گردش کار',
        EventTypeID: 'نوع رویداد', OccurredAt: 'تاریخ رویداد', Reason: 'دلیل'
      };
      const changes = keys.filter(function (key) {
        return JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
      });
      if (!changes.length) return '';
      return '<div class="project-management-diff">' + changes.map((key) => {
        return '<div class="project-management-diff-row"><strong>' + this.escape(labels[key] || key) + '</strong>' +
          '<span><small>قبل:</small> ' + this.escape(this.auditValue(oldData[key])) + '</span>' +
          '<span><small>بعد:</small> ' + this.escape(this.auditValue(newData[key])) + '</span></div>';
      }).join('') + '</div>';
    },

    auditValue: function (value) {
      if (value === null || value === undefined || value === '') return '-';
      if (typeof value === 'object') {
        try { return JSON.stringify(value); } catch (error) { return String(value); }
      }
      return String(value);
    },

    load: async function () {
      const version = ++this.loadVersion;
      const loading = document.getElementById('project-detail-loading');
      const cachedProject = window.PMS.Cache.get(this.getProjectCacheKey());
      const cachedEvents = window.PMS.Cache.get(this.getEventsCacheKey());
      const cachedDetails = window.PMS.Cache.get(this.getEventDetailsCacheKey());

      if (cachedProject !== null) {
        this.project = cachedProject;
        this.renderProject(cachedProject);
      }

      if (cachedDetails !== null) {
        this.applyEventDetailsBundle(cachedDetails, version);
      } else if (cachedEvents !== null) {
        this.events = this.normalizeEvents(cachedEvents);
        this.renderEvents(this.events);
      }

      if (cachedProject !== null || cachedEvents !== null || cachedDetails !== null) {
        if (loading) loading.hidden = true;
        this.showContent();
      }

      const projectPromise = window.PMS.Api.getCached(
        '/projects/' + encodeURIComponent(this.projectId),
        this.getProjectCacheKey(),
        {
          onRefresh: function (data) {
            if (version !== ProjectDetail.loadVersion) return;
            const project = ProjectDetail.unwrap(data);
            if (!project || typeof project !== 'object') return;
            ProjectDetail.project = project;
            ProjectDetail.renderProject(project);
            ProjectDetail.loadWorkflowSteps(project, version);
            ProjectDetail.showContent();
          }
        }
      );

      const eventsPromise = window.PMS.Api.getCached(
        '/projects/' + encodeURIComponent(this.projectId) + '/details',
        this.getEventDetailsCacheKey(),
        {
          onRefresh: function (data) {
            if (version !== ProjectDetail.loadVersion) return;
            ProjectDetail.applyEventDetailsBundle(data, version);
            ProjectDetail.showContent();
          }
        }
      );

      const results = await Promise.allSettled([projectPromise, eventsPromise]);
      if (version !== this.loadVersion) return;

      let projectLoaded = cachedProject !== null;
      let projectError = null;
      const projectResult = results[0];
      if (projectResult.status === 'fulfilled') {
        const project = this.unwrap(projectResult.value && projectResult.value.data);
        if (project && typeof project === 'object') {
          this.project = project;
          this.renderProject(project);
          this.loadWorkflowSteps(project, version);
          projectLoaded = true;
        } else if (!projectLoaded) {
          projectError = new Error('اطلاعات پروژه از سرور دریافت نشد.');
        }
      } else {
        projectError = projectResult.reason;
      }

      let eventsLoaded = cachedDetails !== null || cachedEvents !== null;
      const eventsResult = results[1];
      if (eventsResult.status === 'fulfilled') {
        const result = eventsResult.value;
        if (result && result.data !== undefined) {
          this.applyEventDetailsBundle(result.data, version);
          this.loadVoidedEventAuditHistory();
          eventsLoaded = true;
        }
      } else {
        console.warn('دریافت رویدادهای پروژه ناموفق بود:', eventsResult.reason);
        if (!eventsLoaded) {
          const eventsContainer = document.getElementById('project-detail-events');
          if (eventsContainer) {
            eventsContainer.textContent = 'رویدادهای پروژه دریافت نشدند؛ ممکن است دسترسی مشاهده رویدادها را نداشته باشید.';
          }
        }
      }

      if (projectLoaded) {
        this.showContent();
      } else {
        this.showError(projectError || new Error('خطا در دریافت اطلاعات پروژه.'));
      }

      if (loading) loading.hidden = true;
    },

    unwrap: function (data) {
      if (
        data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        data.data !== undefined
      ) {
        return data.data;
      }

      return data;
    },

    normalizeArray: function (data, possibleKeys) {
      data = this.unwrap(data);

      if (Array.isArray(data)) return data;
      if (!data || typeof data !== 'object') return [];

      for (let i = 0; i < possibleKeys.length; i++) {
        if (Array.isArray(data[possibleKeys[i]])) {
          return data[possibleKeys[i]];
        }
      }

      return [];
    },

    normalizeEvents: function (data) {
      return this.normalizeArray(data, [
        'events',
        'items',
        'Events',
        'Items'
      ]);
    },

    renderProject: function (project) {
      if (!project) return;

      const title = document.getElementById('project-detail-title');
      const code = document.getElementById('project-detail-code');
      const status = document.getElementById('project-detail-status');
      const step = document.getElementById('project-detail-step');
      const created = document.getElementById('project-detail-created');
      const updated = document.getElementById('project-detail-updated');
      const info = document.getElementById('project-detail-info');

      if (title) {
        title.textContent = project.Title || '-';
      }

      if (code) {
        code.textContent = project.ProjectCode || '-';
      }

      if (status) {
        status.textContent = this.statusText(project.Status);
      }

      if (step) {
        step.textContent = this.getStepName(project.CurrentStepID);
      }

      if (created) {
        created.textContent = this.formatDate(project.CreatedAt);
      }

      if (updated) {
        updated.textContent = this.formatDate(project.UpdatedAt);
      }

      let colorSize = { colors: [], sizes: [] };
      const rawColorSize = project.ColorSizeJSON || project.colorSizeJSON || project.color_size_json;
      if (rawColorSize) {
        try {
          const parsed = typeof rawColorSize === 'string' ? JSON.parse(rawColorSize) : rawColorSize;
          if (parsed && typeof parsed === 'object') {
            colorSize.colors = Array.isArray(parsed.colors) ? parsed.colors : [];
            colorSize.sizes = Array.isArray(parsed.sizes) ? parsed.sizes : [];
          }
        } catch (error) {
          console.warn('خواندن رنگ‌بندی و سایزبندی پروژه انجام نشد.', error);
        }
      }

      const colorNames = colorSize.colors.map(function (value) { return String(value || '').trim(); }).filter(Boolean);
      const sizeNames = colorSize.sizes.map(function (value) { return String(value || '').trim(); }).filter(Boolean);

      if (info) {
        info.innerHTML =
          '<div class="detail-list">' +
            this.detailRow('شناسه پروژه', project.ID) +
            this.detailRow('کد پروژه', project.ProjectCode) +
            this.detailRow('عنوان پروژه', project.Title) +
            this.detailRow('تعداد اولیه', project.Quantity) +
            this.detailRow('رنگ‌بندی', colorNames.length ? colorNames.join('، ') : 'تعریف نشده') +
            this.detailRow('سایزبندی', sizeNames.length ? sizeNames.join('، ') : 'تعریف نشده') +
            this.detailRow('توضیحات', project.Description) +
            this.detailRow('شناسه فرایند', project.WorkflowID) +
            this.detailRow(
              'مرحله فعلی',
              this.getStepName(project.CurrentStepID)
            ) +
            this.detailRow('وضعیت کار در مرحله', project.CurrentStepStatus) +
          '</div>';
      }
    },

    loadProjectPassportImages: async function (forceRefresh) {
      const projectId = this.projectId;
      const types = [
        { type: 'SEWING_PASSPORT', containerId: 'project-detail-sewing-passport', label: 'شناسنامه دوخت' },
        { type: 'CUTTING_PASSPORT', containerId: 'project-detail-cutting-passport', label: 'شناسنامه برش' }
      ];
      const router = window.PMS && window.PMS.Router;
      const canViewAttachments = !!(router &&
        ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
          (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_VIEW') !== -1)));

      types.forEach(function (entry) {
        const container = document.getElementById(entry.containerId);
        if (!container) return;
        container.innerHTML = canViewAttachments
          ? '<div class="loading-state">در حال دریافت تصاویر...</div>'
          : '<div class="table-empty">دسترسی مشاهده پیوست‌ها را ندارید.</div>';
      });
      if (!canViewAttachments || !projectId) return;

      try {
        const cacheKey = 'project_attachments_' + String(projectId);
        const response = forceRefresh
          ? await window.PMS.Api.getFresh('/projects/' + encodeURIComponent(projectId) + '/attachments', cacheKey)
          : await window.PMS.Api.getCached('/projects/' + encodeURIComponent(projectId) + '/attachments', cacheKey);
        const attachments = this.normalizeArray(response, ['attachments', 'items', 'Attachments', 'Items']);
        types.forEach((entry) => {
          const container = document.getElementById(entry.containerId);
          if (!container) return;
          const items = attachments.filter(function (item) {
            const mime = String(item.MimeType || item.mimeType || '').toLowerCase();
            const type = String(item.AttachmentType || item.attachmentType || '').toUpperCase();
            const status = String(item.Status || 'ACTIVE').toUpperCase();
            return mime.indexOf('image/') === 0 && type === entry.type &&
              status !== 'DELETED' && status !== 'VOID';
          });
          if (!items.length) {
            container.innerHTML = '<div class="table-empty">هنوز تصویری برای ' + entry.label + ' ثبت نشده است.</div>';
            return;
          }
          container.innerHTML = '<div class="project-passport-grid">' + items.map((item) => {
            const id = item.ID || item.Id || item.id || '';
            const name = item.FileName || item.fileName || entry.label;
            return '<article class="project-passport-item">' +
              '<div class="project-passport-file-name">' + this.escape(name) + '</div>' +
              '<button type="button" class="btn btn-light" data-project-passport-preview="' + this.escape(id) + '" data-project-passport-type="' + entry.type + '">مشاهده تصویر</button>' +
              '</article>';
          }).join('') + '</div>';
        });
      } catch (error) {
        types.forEach(function (entry) {
          const container = document.getElementById(entry.containerId);
          if (container) {
            container.innerHTML = '<div class="alert alert-danger">' +
              ProjectDetail.escape(error && error.message ? error.message : 'دریافت تصاویر شناسنامه ناموفق بود.') +
              ' <button type="button" class="btn btn-light" data-project-passport-retry>تلاش مجدد</button></div>';
          }
        });
      }
    },

    previewProjectPassportImage: async function (attachmentId, label) {
      if (!attachmentId) return;
      try {
        const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download', { trackSync: false });
        const data = this.unwrap(response);
        const base64 = data && (data.Base64 || data.base64);
        if (!base64) throw new Error('داده تصویر در پاسخ موجود نیست.');
        const modal = document.createElement('div');
        modal.className = 'project-passport-preview-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', label || 'پیش‌نمایش تصویر شناسنامه');
        modal.innerHTML = '<button type="button" class="project-passport-preview-close">بستن ×</button><img alt="' + this.escape(label || 'تصویر شناسنامه پروژه') + '">';
        const image = modal.querySelector('img');
        image.src = 'data:' + String(data.MimeType || data.mimeType || 'image/jpeg') + ';base64,' + base64;
        const close = function () { modal.remove(); document.removeEventListener('keydown', onKey); };
        const onKey = function (event) { if (event.key === 'Escape') close(); };
        modal.addEventListener('click', function (event) {
          if (event.target === modal || event.target.closest('.project-passport-preview-close')) close();
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(modal);
        modal.querySelector('.project-passport-preview-close').focus();
      } catch (error) {
        window.alert(error && error.message ? error.message : 'نمایش تصویر ناموفق بود.');
      }
    },

    bindProjectPassportImageEvents: function () {
      const content = document.getElementById('project-detail-content');
      if (!content || content.dataset.passportEventsBound) return;
      content.dataset.passportEventsBound = '1';
      content.addEventListener('click', function (event) {
        const preview = event.target.closest('[data-project-passport-preview]');
        if (preview) {
          const type = preview.getAttribute('data-project-passport-type');
          ProjectDetail.previewProjectPassportImage(
            preview.getAttribute('data-project-passport-preview'),
            type === 'SEWING_PASSPORT' ? 'شناسنامه دوخت' : 'شناسنامه برش'
          );
          return;
        }
        if (event.target.closest('[data-project-passport-retry]')) {
          ProjectDetail.loadProjectPassportImages(true);
        }
      });
    },

    ensureProjectPassportStyles: function () {
      if (document.getElementById('project-passport-styles')) return;
      const style = document.createElement('style');
      style.id = 'project-passport-styles';
      style.textContent = [
        '.project-passport-intro{margin:0 0 12px;color:var(--color-text-secondary);font-size:12px}',
        '.project-passport-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}',
        '.project-passport-item{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border:1px solid var(--color-border);border-radius:8px;padding:12px;min-width:0}',
        '.project-passport-file-name{font-size:12px;overflow-wrap:anywhere;min-width:0}',
        '.project-passport-preview-overlay{position:fixed;inset:0;z-index:30000;background:#000d;display:flex;align-items:center;justify-content:center;padding:18px}',
        '.project-passport-preview-overlay img{display:block;max-width:100%;max-height:88vh;object-fit:contain}',
        '.project-passport-preview-close{position:absolute;top:12px;right:12px;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}',
        '@media(max-width:600px){.project-passport-item{align-items:flex-start;flex-direction:column}.project-passport-item button{width:100%}}'
      ].join('\n');
      document.head.appendChild(style);
    },

    detailRow: function (label, value) {
      return (
        '<div class="detail-row">' +
          '<strong>' + this.escape(label) + ':</strong>' +
          '<span>' + this.escape(
            value === null || value === undefined || value === ''
              ? '-'
              : value
          ) + '</span>' +
        '</div>'
      );
    },

    loadSharedData: async function (version) {
      const api = window.PMS.Api;
      const cache = window.PMS.Cache;
      const applyLookups = function (data) {
        const lookups = ProjectDetail.unwrap(data) || {};
        ProjectDetail.users = ProjectDetail.normalizeArray(
          lookups.users,
          ['users', 'items', 'Users', 'Items']
        );
        ProjectDetail.departments = ProjectDetail.normalizeArray(
          lookups.departments,
          ['departments', 'items', 'Departments', 'Items']
        );
        ProjectDetail.eventTypes = ProjectDetail.normalizeArray(
          lookups.eventTypes,
          ['eventTypes', 'items', 'EventTypes', 'Items']
        );
        ProjectDetail.projectStatuses = ProjectDetail.normalizeArray(
          lookups.projectStatuses,
          ['projectStatuses', 'statuses', 'items', 'ProjectStatuses']
        );
      };

      try {
        // One PROJECT_VIEW-authorized request supplies all read-only labels.
        // This avoids several requests that may be forbidden to ordinary project viewers.
        const result = await api.getCached(
          '/project-dashboard/lookups',
          'dashboard_project_lookups_v1',
          {
            onRefresh: function (data) {
              if (version !== ProjectDetail.loadVersion) return;
              applyLookups(data);
              ProjectDetail.renderEvents(ProjectDetail.events);
            }
          }
        );

        if (version !== ProjectDetail.loadVersion) return;
        applyLookups(result.data);
      } catch (error) {
        console.warn('دریافت اطلاعات تکمیلی پروژه انجام نشد.', error);
      }
    },

    loadWorkflowSteps: async function (project, version) {
      if (!project || !project.WorkflowID) return;

      const cacheKey = this.getCacheKey(
        window.PMS.Cache.keys.WORKFLOW_STEPS,
        project.WorkflowID
      );

      try {
        const result = await window.PMS.Api.getCached(
          '/workflows/' +
            encodeURIComponent(project.WorkflowID) +
            '/steps',
          cacheKey,
          {
            onRefresh: function (data) {
              if (version !== ProjectDetail.loadVersion) return;

              ProjectDetail.workflowSteps =
                ProjectDetail.normalizeArray(
                  data,
                  ['steps', 'items', 'Steps', 'Items']
                );

              ProjectDetail.renderProject(ProjectDetail.project);
            }
          }
        );

        if (version !== this.loadVersion) return;

        this.workflowSteps = this.normalizeArray(
          result.data,
          ['steps', 'items', 'Steps', 'Items']
        );

        this.renderProject(this.project);
      } catch (error) {
        console.warn('دریافت مراحل فرایند انجام نشد.', error);
      }
    },

    applyEventDetailsBundle: function (data, version) {
      const bundle = this.unwrap(data);
      if (!bundle || typeof bundle !== 'object') return;

      this.events = this.normalizeEvents(bundle.events || []);
      this.eventData = {};

      const eventData = bundle.eventData && typeof bundle.eventData === 'object'
        ? bundle.eventData
        : {};

      Object.keys(eventData).forEach(function (eventId) {
        ProjectDetail.eventData[String(eventId)] =
          ProjectDetail.normalizeEventData(eventData[eventId]);
      });

      this.eventFields = {};
      const eventFields = bundle.eventFields && typeof bundle.eventFields === 'object'
        ? bundle.eventFields
        : {};

      Object.keys(eventFields).forEach(function (typeId) {
        ProjectDetail.eventFields[String(typeId)] =
          ProjectDetail.normalizeArray(eventFields[typeId]).filter(function (field) {
            return !field.Status ||
              String(field.Status).toUpperCase() === 'ACTIVE';
          });
      });

      this.renderEvents(this.events);

      this.loadSharedData(version).then(function () {
        if (version === ProjectDetail.loadVersion) {
          ProjectDetail.renderEvents(ProjectDetail.events);
          ProjectDetail.renderAuditHistory();
        }
      });
    },

    normalizeEventData: function (data) {
      data = this.unwrap(data);

      if (!data || typeof data !== 'object') {
        return {};
      }

      if (Array.isArray(data)) {
        return {};
      }

      if (
        data.DataJSON &&
        typeof data.DataJSON === 'string'
      ) {
        try {
          return JSON.parse(data.DataJSON);
        } catch (error) {
          return {};
        }
      }

      if (
        data.dataJSON &&
        typeof data.dataJSON === 'string'
      ) {
        try {
          return JSON.parse(data.dataJSON);
        } catch (error) {
          return {};
        }
      }

      if (
        data.Data &&
        typeof data.Data === 'object' &&
        !Array.isArray(data.Data)
      ) {
        return data.Data;
      }

      if (
        data.data &&
        typeof data.data === 'object' &&
        !Array.isArray(data.data)
      ) {
        return data.data;
      }

      return data;
    },

    isCuttingEventType: function (eventType) {
      if (!eventType) return false;
      const typeName = String(eventType.Name || eventType.Title || '').toLocaleLowerCase('fa');
      const typeCode = String(eventType.Code || '').toUpperCase();
      const department = this.findById(this.departments, eventType.DepartmentID);
      const departmentName = String(department && (department.Name || department.Title || department.Code) || '').toLocaleLowerCase('fa');
      const departmentCode = String(department && department.Code || '').toUpperCase();
      return /برش|cutting/.test(typeName) ||
        /CUTTING|CUT/.test(typeCode) ||
        /برش|cutting/.test(departmentName) ||
        /CUTTING|CUT/.test(departmentCode);
    },

    renderCuttingSummary: function (events) {
      const eventTypes = Array.isArray(this.eventTypes) ? this.eventTypes : [];
      const cuttingTypes = eventTypes.filter(function (type) {
        const track = type.TrackVariantQuantity === true ||
          String(type.TrackVariantQuantity).toLowerCase() === 'true';
        return ProjectDetail.isCuttingEventType(type) && (track || /برش|cutting/i.test(String(type.Name || type.Code || '')));
      });
      const cuttingTypeIds = new Set(cuttingTypes.map(function (type) {
        return String(type.ID || type.Id || type.id || '');
      }).filter(Boolean));
      const totals = new Map();
      let batches = 0;
      let totalQuantity = 0;
      let finalized = false;

      (Array.isArray(events) ? events : []).forEach(function (event) {
        const status = String(event.Status || '').toUpperCase();
        if (status === 'VOID' || status === 'CANCELLED' || status === 'CANCELED') return;
        const typeId = String(event.EventTypeID || event.EventTypeId || '');
        const type = ProjectDetail.findById(eventTypes, typeId);
        if (!type || !ProjectDetail.isCuttingEventType(type)) return;

        const typeName = String(type.Name || type.Title || type.Code || event.EventTypeName || '').toLocaleLowerCase('fa');
        if (/پایان برش|اتمام برش|تکمیل برش|برش نهایی|final cutting|cutting complete/.test(typeName)) {
          finalized = true;
        }

        const tracksQuantity = type.TrackVariantQuantity === true ||
          String(type.TrackVariantQuantity).toLowerCase() === 'true';
        if (!tracksQuantity || !cuttingTypeIds.has(typeId)) return;

        let variants = [];
        try {
          const raw = event.VariantDetailsJSON || event.variantDetailsJSON || '[]';
          variants = Array.isArray(raw) ? raw : JSON.parse(String(raw));
        } catch (error) {
          variants = [];
        }
        if (!Array.isArray(variants) || !variants.length) return;

        let eventHasQuantity = false;
        variants.forEach(function (variant) {
          variant = variant || {};
          const quantity = Number(variant.VariantQuantity);
          if (!isFinite(quantity) || quantity <= 0 || Math.floor(quantity) !== quantity) return;
          const color = String(variant.Color || '').trim();
          const size = String(variant.Size || '').trim();
          const key = JSON.stringify([color, size]);
          const previous = totals.get(key) || { color: color, size: size, quantity: 0 };
          previous.quantity += quantity;
          totals.set(key, previous);
          totalQuantity += quantity;
          eventHasQuantity = true;
        });
        if (eventHasQuantity) batches += 1;
      });

      if (!cuttingTypes.length && !batches) return '';
      const rows = Array.from(totals.values()).sort(function (a, b) {
        return a.color.localeCompare(b.color, 'fa') || a.size.localeCompare(b.size, 'fa');
      });
      const rowsHtml = rows.length ? rows.map(function (row) {
        const label = [row.color, row.size].filter(Boolean).join(' / ') || 'بدون تفکیک رنگ و سایز';
        return '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 11px;border:1px solid var(--color-border);border-radius:9px;min-width:0">' +
          '<span style="overflow-wrap:anywhere">' + ProjectDetail.escape(label) + '</span>' +
          '<strong style="white-space:nowrap">' + ProjectDetail.escape(row.quantity.toLocaleString('fa-IR')) + ' عدد</strong></div>';
      }).join('') : '<div class="table-empty">هنوز مرحله برشی با تعداد ثبت‌شده برای این پروژه وجود ندارد.</div>';

      return '<section class="cutting-summary-panel" aria-label="خلاصه تجمعی برش" style="margin:0 0 18px;padding:15px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px">' +
          '<div><h3 style="margin:0 0 4px;font-size:15px">خلاصه تجمعی برش</h3><p style="margin:0;color:var(--color-text-secondary);font-size:12px">مجموع مراحل برش ثبت‌شده؛ رویدادهای باطل‌شده محاسبه نمی‌شوند.</p></div>' +
          '<span style="display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:' + (finalized ? 'color-mix(in srgb,#16a34a 13%,var(--color-surface))' : 'var(--color-surface-hover)') + ';color:' + (finalized ? '#16824a' : 'var(--color-text-secondary)') + ';font-size:12px;font-weight:700">' +
            (finalized ? 'برش تکمیل‌شده' : 'در حال برش') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">' +
          '<div style="flex:1;min-width:120px;padding:12px;border-radius:10px;background:var(--color-surface-hover)"><div style="font-size:12px;color:var(--color-text-secondary)">تعداد تجمعی برش</div><strong style="display:block;font-size:24px;margin-top:3px">' + ProjectDetail.escape(totalQuantity.toLocaleString('fa-IR')) + '</strong></div>' +
          '<div style="flex:1;min-width:120px;padding:12px;border-radius:10px;background:var(--color-surface-hover)"><div style="font-size:12px;color:var(--color-text-secondary)">مراحل دارای تعداد</div><strong style="display:block;font-size:24px;margin-top:3px">' + ProjectDetail.escape(batches.toLocaleString('fa-IR')) + '</strong></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">' + rowsHtml + '</div>' +
        '<p style="margin:10px 0 0;color:var(--color-text-secondary);font-size:11px">برای محاسبه، نوع رویداد باید به واحد برش مرتبط باشد و گزینه «مقدار تولید/تحویل برای ترکیب انتخاب‌شده ثبت شود» فعال باشد. تکمیل نهایی از نام رویداد پایان/اتمام برش تشخیص داده می‌شود.</p>' +
      '</section>';
    },

    renderEvents: function (events) {
      const container = document.getElementById(
        'project-detail-events'
      );

      const count = document.getElementById(
        'project-detail-events-count'
      );

      events = Array.isArray(events) ? events : [];

      if (count) {
        count.textContent = String(events.length);
      }

      if (!container) return;

      this.ensureTimelineStyles();

      if (events.length === 0) {
        container.innerHTML =
          '<div class="table-empty">رویدادی برای این پروژه ثبت نشده است.</div>';
        return;
      }

      const sortedEvents = events.slice().sort(function (a, b) {
        const aDate = ProjectDetail.getEventTimestamp(a);
        const bDate = ProjectDetail.getEventTimestamp(b);

        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;

        // نمایش آخرین فعالیت در ابتدای خط زمانی
        return bDate - aDate;
      });

      let html = this.renderCuttingSummary(events) + '<div class="pms-timeline">';

      sortedEvents.forEach(function (event) {
        const eventTypeId = event.EventTypeID || event.EventTypeId;

        const eventType = ProjectDetail.findById(
          ProjectDetail.eventTypes,
          eventTypeId
        );

        const performer = ProjectDetail.findById(
          ProjectDetail.users,
          event.PerformedBy || event.PerformedByID
        );

        const creator = ProjectDetail.findById(
          ProjectDetail.users,
          event.CreatedBy || event.CreatedByID
        );

        const department = ProjectDetail.findById(
          ProjectDetail.departments,
          event.DepartmentID || event.DepartmentId
        );

        const eventTitle = eventType
          ? (
              eventType.Name ||
              eventType.Title ||
              eventType.Code ||
              'رویداد'
            )
          : (
              event.EventTypeName ||
              event.EventTypeTitle ||
              event.EventTypeCode ||
              'رویداد'
            );

        const eventId = String(event.ID || event.Id || '');
        const dynamicData = ProjectDetail.eventData[eventId];
        const fields = ProjectDetail.eventFields[
          String(eventTypeId || '')
        ] || [];

        const occurredAt =
          event.OccurredAt ||
          event.occurredAt ||
          event.CreatedAt ||
          event.createdAt;

        const createdAt = event.CreatedAt || event.createdAt;

        const departmentName = department
          ? department.Name || department.Title || department.Code
          : event.DepartmentName || '';

        const performerName = performer
          ? performer.Name || performer.Username
          : event.PerformedByName || '';

        const creatorName = creator
          ? creator.Name || creator.Username
          : event.CreatedByName || '';

        html +=
          '<article class="pms-timeline-item">' +
            '<div class="pms-timeline-marker"></div>' +
            '<div class="pms-timeline-card">' +

              '<div class="pms-timeline-header">' +
                '<div>' +
                  '<div class="pms-timeline-title">' +
                    ProjectDetail.escape(eventTitle) +
                  '</div>' +
                  '<div class="pms-timeline-date">' +
                    '<span>تاریخ وقوع: </span>' +
                    ProjectDetail.escape(
                      ProjectDetail.formatDate(occurredAt)
                    ) +
                  '</div>' +
                '</div>' +
                '<span class="pms-timeline-status">' +
                  ProjectDetail.escape(
                    ProjectDetail.statusText(event.Status)
                  ) +
                '</span>' +
              '</div>' +

              '<div class="pms-timeline-meta">' +
                ProjectDetail.metaItem('واحد', departmentName) +
                ProjectDetail.metaItem('اجراکننده', performerName) +
                ProjectDetail.metaItem('ثبت‌کننده', creatorName) +
              '</div>' +

              '<div class="pms-timeline-description">' +
                ProjectDetail.escape(
                  event.Description ||
                  event.description ||
                  'توضیحی ثبت نشده است.'
                ) +
              '</div>' +

              ProjectDetail.renderDynamicData(dynamicData, fields) +

              '<div class="pms-timeline-footer">' +
                '<span>تاریخ ثبت: ' +
                  ProjectDetail.escape(
                    ProjectDetail.formatDate(createdAt)
                  ) +
                '</span>' +
                '<span>شناسه رویداد: ' +
                  ProjectDetail.escape(eventId || '-') +
                '</span>' +
              '</div>' +

            '</div>' +
          '</article>';
      });

      html += '</div>';
      container.innerHTML = html;
    },

    getEventTimestamp: function (event) {
      if (!event) return null;

      const value =
        event.OccurredAt ||
        event.occurredAt ||
        event.CreatedAt ||
        event.createdAt;

      if (!value) return null;

      const timestamp = new Date(value).getTime();

      return Number.isNaN(timestamp) ? null : timestamp;
    },

    metaItem: function (label, value) {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        return '';
      }

      return (
        '<div class="pms-timeline-meta-item">' +
          '<span>' + this.escape(label) + '</span>' +
          '<strong>' + this.escape(value) + '</strong>' +
        '</div>'
      );
    },

    renderDynamicData: function (data, fields) {
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return '';
      }

      const keys = Object.keys(data).filter(function (key) {
        return data[key] !== null &&
          data[key] !== undefined &&
          String(data[key]) !== '';
      });

      if (!keys.length) return '';

      const orderedFields = (Array.isArray(fields) ? fields : [])
        .slice()
        .sort(function (a, b) {
          return Number(a.FieldOrder || 0) -
            Number(b.FieldOrder || 0);
        });

      let html =
        '<div class="pms-timeline-dynamic">' +
          '<strong>اطلاعات تکمیلی</strong>' +
          '<div class="pms-timeline-dynamic-grid">';

      keys.forEach(function (key) {
        const field = orderedFields.find(function (item) {
          return String(item.Code) === String(key);
        });

        const label = field
          ? field.Name || field.Code
          : key;

        const value = data[key];

        let displayValue = value;

        if (typeof value === 'object') {
          try {
            displayValue = JSON.stringify(value);
          } catch (error) {
            displayValue = String(value);
          }
        }

        html +=
          '<div class="pms-timeline-dynamic-item">' +
            '<span>' + ProjectDetail.escape(label) + '</span>' +
            '<strong>' + ProjectDetail.escape(displayValue) + '</strong>' +
          '</div>';
      });

      html += '</div></div>';

      return html;
    },

    findById: function (items, id) {
      if (
        !Array.isArray(items) ||
        id === null ||
        id === undefined ||
        id === ''
      ) {
        return null;
      }

      const targetId = String(id);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!item) continue;

        const possibleIds = [
          item.ID,
          item.Id,
          item.id
        ];

        for (let j = 0; j < possibleIds.length; j++) {
          if (
            possibleIds[j] !== null &&
            possibleIds[j] !== undefined &&
            String(possibleIds[j]) === targetId
          ) {
            return item;
          }
        }
      }

      return null;
    },

    getStepName: function (stepId) {
      if (!stepId) return '-';

      const step = this.findById(this.workflowSteps, stepId);

      return step
        ? step.Name || step.Title || step.Code || String(stepId)
        : String(stepId);
    },

    ensureTimelineStyles: function () {
      if (document.getElementById('pms-timeline-styles')) return;

      const style = document.createElement('style');
      style.id = 'pms-timeline-styles';

      style.textContent = `
        .pms-timeline {
          position: relative;
          padding: 8px 18px 8px 0;
        }

        .pms-timeline:before {
          content: "";
          position: absolute;
          right: 7px;
          top: 14px;
          bottom: 18px;
          width: 2px;
          background: var(--color-border);
        }

        .pms-timeline-item {
          position: relative;
          padding: 0 24px 22px 0;
        }

        .pms-timeline-marker {
          position: absolute;
          right: 0;
          top: 14px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          border: 3px solid var(--color-surface);
          box-shadow: 0 0 0 1px var(--color-border);
          z-index: 1;
        }

        .pms-timeline-card {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 16px;
          background: var(--color-surface);
          box-shadow: var(--shadow-sm);
          min-width: 0;
        }

        .pms-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .pms-timeline-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text);
        }

        .pms-timeline-date {
          margin-top: 5px;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .pms-timeline-status {
          display: inline-block;
          border-radius: 20px;
          padding: 4px 9px;
          background: var(--color-surface-alt);
          color: var(--color-text);
          font-size: 11px;
        }

        .pms-timeline-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          padding: 12px 0;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }

        .pms-timeline-meta-item,
        .pms-timeline-dynamic-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 100px;
          overflow-wrap: anywhere;
        }

        .pms-timeline-meta-item span,
        .pms-timeline-dynamic-item span {
          color: var(--color-text-muted);
          font-size: 11px;
        }

        .pms-timeline-meta-item strong,
        .pms-timeline-dynamic-item strong {
          color: var(--color-text);
          font-size: 13px;
          font-weight: 600;
        }

        .pms-timeline-description {
          margin-top: 13px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.9;
          color: var(--color-text);
          font-size: 13px;
        }

        .pms-timeline-dynamic {
          margin-top: 15px;
          padding: 12px;
          border-radius: 8px;
          background: var(--color-surface-alt);
        }

        .pms-timeline-dynamic > strong {
          display: block;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .pms-timeline-dynamic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .pms-timeline-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin-top: 14px;
          color: var(--color-text-muted);
          font-size: 11px;
        }

        @media (max-width: 600px) {
          .pms-timeline-card {
            padding: 12px;
          }

          .pms-timeline-header {
            flex-direction: column;
          }

          .pms-timeline-meta {
            gap: 12px;
          }
        }
      `;

      document.head.appendChild(style);
    },

    showContent: function () {
      const content = document.getElementById(
        'project-detail-content'
      );

      const errorBox = document.getElementById(
        'project-detail-error'
      );

      if (content) content.hidden = false;
      if (errorBox) errorBox.hidden = true;
    },

    showError: function (error) {
      const loading = document.getElementById(
        'project-detail-loading'
      );

      const errorBox = document.getElementById(
        'project-detail-error'
      );

      if (loading) loading.hidden = true;
      if (!errorBox) return;

      errorBox.textContent =
        error && error.message
          ? error.message
          : 'خطا در دریافت اطلاعات پروژه.';

      errorBox.hidden = false;
    },

    statusText: function (status) {
      const map = {
        ACTIVE: 'فعال',
        INACTIVE: 'غیرفعال',
        ON_HOLD: 'متوقف',
        COMPLETED: 'تکمیل‌شده',
        CANCELLED: 'لغوشده',
        VOID: 'باطل‌شده',
        DELETED: 'حذف‌شده',
        PENDING: 'در انتظار',
        DRAFT: 'پیش‌نویس',
        SUBMITTED: 'ثبت‌شده',
        APPROVED: 'تأییدشده',
        REJECTED: 'ردشده'
      };

      const custom = this.projectStatuses.find(function (item) {
        return String(item.Code || item.ID || '').toLowerCase() === String(status || '').toLowerCase();
      });
      return (custom && (custom.Name || custom.Code)) || map[String(status || '').toUpperCase()] || status || '-';
    },

    formatDate: function (value) {
      if (!value) return '-';

      try {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
          return String(value);
        }

        return date.toLocaleString('fa-IR');
      } catch (error) {
        return String(value);
      }
    },

    escape: function (value) {
      if (value === null || value === undefined) return '';

      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};
  window.PMS.ProjectDetail = ProjectDetail;
  window.PMS.Modules.ProjectDetail = ProjectDetail;
})();