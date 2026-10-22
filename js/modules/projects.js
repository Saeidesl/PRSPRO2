(function () {
  'use strict';

  function projectSettingsStorageKey() {
    const router = window.PMS && window.PMS.Router;
    const user = router && typeof router.getUser === 'function'
      ? router.getUser()
      : (window.PMS && window.PMS.Session && window.PMS.Session.getUser
        ? window.PMS.Session.getUser()
        : {});
    const userId = user && (user.ID || user.Id || user.id || user.Username || user.Email);
    if (userId) return 'pms_project_create_settings_v1_user_' + String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');

    const token = String(window.PMS && window.PMS.Api && window.PMS.Api.getToken
      ? window.PMS.Api.getToken() || ''
      : '');
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'pms_project_create_settings_v1_' + (hash >>> 0).toString(36);
  }

  function projectJalaliDateToIso(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const ascii = raw.replace(/[۰-۹٠-٩]/g, function (digit) {
      const persian = '۰۱۲۳۴۵۶۷۸۹';
      const arabic = '٠١٢٣٤٥٦٧٨٩';
      const index = persian.indexOf(digit);
      return String(index >= 0 ? index : arabic.indexOf(digit));
    }).replace(/[.-]/g, '/');
    const match = ascii.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) throw new Error('تاریخ را به شکل شمسی سال/ماه/روز وارد کنید؛ مانند ۱۴۰۵/۰۷/۲۷.');
    const jy = Number(match[1]), jm = Number(match[2]), jd = Number(match[3]);
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) throw new Error('تاریخ شمسی معتبر نیست.');
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
    const start = Date.UTC(jy + 621, 2, 18);
    for (let offset = 0; offset < 371; offset++) {
      const date = new Date(start + offset * 86400000);
      const parts = {};
      formatter.formatToParts(date).forEach(function (part) { if (part.type === 'year' || part.type === 'month' || part.type === 'day') parts[part.type] = Number(part.value); });
      if (parts.year === jy && parts.month === jm && parts.day === jd) return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
    }
    throw new Error('این تاریخ شمسی معتبر نیست.');
  }

  const CACHE_KEY = window.PMS.Cache.keys.PROJECTS;

  const Projects = {
    projects: [],
    workflows: [],
    projectStatuses: [],
    workflowStepsByWorkflow: {},
    stageLookupsLoaded: false,
    modal: null,
    isSaving: false,

    init: function () {
      this.ensureProjectStyles();
      this.bindEvents();
      const router = window.PMS.Router;
      const canViewProjects = !!(
        router &&
        (router.isAdmin() ||
          (Array.isArray(router.permissions) &&
            router.permissions.indexOf('PROJECT_VIEW') !== -1))
      );

      if (canViewProjects) {
        this.loadProjects();
        this.loadProjectStatuses();
      } else {
        // Create-only users should not trigger a forbidden project-list request.
        const card = document.querySelector('.page-section > .card');
        if (card) card.hidden = true;
      }
    },

    ensureProjectStyles: function () {
      if (document.getElementById('projects-card-view-styles')) return;
      const style = document.createElement('style');
      style.id = 'projects-card-view-styles';
      style.textContent = [
        '#projects-page-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}',
        '#projects-page-tools .filter-bar{display:flex;align-items:end;gap:10px;flex:1;min-width:240px;flex-wrap:wrap}',
        '#projects-page-tools .filter-group{flex:1;min-width:180px}',
        '#projects-page-tools .filter-group label{display:block;margin-bottom:6px;color:var(--color-text-secondary);font-size:12px}',
        '#projects-page-tools input,#projects-page-tools select{width:100%;min-height:42px;padding:9px 12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text);font:inherit}',
        '#projects-table-container.projects-card-list{display:flex;flex-direction:column;gap:9px;min-width:0}',
        '.project-list-card{border:1px solid var(--color-border);border-radius:13px;background:var(--color-surface);overflow:hidden;transition:border-color .16s ease,box-shadow .16s ease}',
        '.project-list-card:hover{border-color:color-mix(in srgb,var(--color-primary) 35%,var(--color-border));box-shadow:var(--shadow-sm,0 3px 12px rgba(0,0,0,.06))}',
        '.project-list-card-main{display:flex;align-items:center;gap:12px;padding:14px 15px;min-width:0}',
        '.project-list-card-indicator{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:var(--color-text-secondary)}',
        '.project-list-card-indicator.is-active{background:#16a34a}.project-list-card-indicator.is-hold{background:#eab308}.project-list-card-indicator.is-completed{background:#3b82f6}.project-list-card-indicator.is-cancelled{background:#ef4444}',
        '.project-list-card-content{flex:1;min-width:0}',
        '.project-list-card-code{font-size:14px;font-weight:850;line-height:1.8;overflow-wrap:anywhere;color:var(--color-text)}',
        '.project-list-card-title{font-size:12px;color:var(--color-text-secondary);line-height:1.8;overflow-wrap:anywhere}',
        '.project-list-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:7px}',
        '.project-list-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:18px;border:1px solid var(--color-border);background:var(--color-surface-hover);color:var(--color-text-secondary);font-size:10px;line-height:1.7;font-weight:700}',
        '.project-list-badge.is-active{color:#16824a;background:color-mix(in srgb,#16a34a 12%,var(--color-surface));border-color:color-mix(in srgb,#16a34a 25%,transparent)}',
        '.project-list-badge.is-hold{color:#a16207;background:color-mix(in srgb,#eab308 13%,var(--color-surface));border-color:color-mix(in srgb,#eab308 28%,transparent)}',
        '.project-list-badge.is-completed{color:#2563eb;background:color-mix(in srgb,#3b82f6 12%,var(--color-surface));border-color:color-mix(in srgb,#3b82f6 25%,transparent)}',
        '.project-list-badge.is-cancelled{color:#b91c1c;background:color-mix(in srgb,#ef4444 12%,var(--color-surface));border-color:color-mix(in srgb,#ef4444 25%,transparent)}',
        '.project-list-card-activity{font-size:11px;color:var(--color-text-secondary);line-height:1.8;margin-top:5px}',
        '.project-list-card-actions{display:flex;align-items:center;justify-content:flex-start;gap:7px;flex-wrap:wrap;padding:0 15px 13px 15px}',
        '.project-list-card-actions .btn{min-height:34px}',
        '@media(max-width:520px){.project-list-card-main{padding:11px;gap:9px}.project-list-card-code{font-size:12px}.project-list-card-title{font-size:11px}.project-list-card-actions{padding:0 11px 11px}.project-list-card-actions .btn{flex:1}}',
        '.project-create-progress{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding:12px 14px;border:1px solid color-mix(in srgb,var(--color-primary) 30%,var(--color-border));border-radius:10px;background:color-mix(in srgb,var(--color-primary) 7%,var(--color-surface));color:var(--color-text);font-size:13px;line-height:1.8}',
        '.project-create-progress[hidden]{display:none}',
        '.project-create-progress.is-success{border-color:#16a34a;background:color-mix(in srgb,#16a34a 9%,var(--color-surface))}',
        '.project-create-progress.is-error{border-color:#dc2626;background:color-mix(in srgb,#dc2626 8%,var(--color-surface))}',
        '.project-create-progress-spinner{width:17px;height:17px;flex:0 0 17px;border:2px solid color-mix(in srgb,var(--color-primary) 25%,transparent);border-top-color:var(--color-primary);border-radius:50%;animation:project-create-spin .8s linear infinite}',
        '.project-create-progress.is-success .project-create-progress-spinner,.project-create-progress.is-error .project-create-progress-spinner{display:none}',
        '@keyframes project-create-spin{to{transform:rotate(360deg)}}'
      ].join('');
      document.head.appendChild(style);
    },

    bindEvents: function () {
      const statusFilter = document.getElementById('project-status-filter');
      const searchInput = document.getElementById('project-search');
      const createButton = document.getElementById('project-create-button');

      if (statusFilter) {
        statusFilter.addEventListener('change', () => {
          this.applyFilters();
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.applyFilters();
        });
      }

      if (createButton) {
        createButton.addEventListener('click', () => {
          this.openCreateForm();
        });
      }

      const tableContainer = document.getElementById('projects-table-container');
      if (tableContainer) {
        tableContainer.addEventListener('click', (event) => {
          const button = event.target.closest('.project-material-needs-button');
          if (!button) return;
          const projectId = button.getAttribute('data-project-id');
          if (projectId) this.openProjectNeedsForm(projectId);
        });
      }
    },

    canManageProcurement: function () {
      const router = window.PMS && window.PMS.Router;
      return !!(router && (
        router.isAdmin() ||
        (Array.isArray(router.permissions) &&
          router.permissions.indexOf('PROCUREMENT_MANAGE') !== -1)
      ));
    },

    openProjectNeedsForm: function (projectId) {
      const project = this.projects.find((item) =>
        String(item.ID || item.Id || item.id) === String(projectId)
      ) || {};
      const existingModal = document.getElementById('project-needs-modal');
      if (existingModal) existingModal.remove();

      const modal = document.createElement('div');
      modal.id = 'project-needs-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:10050;background:var(--color-overlay,rgba(0,0,0,.45));display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;direction:rtl;';
      modal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="project-needs-title" style="background:var(--color-surface,#fff);color:var(--color-text,#222);width:100%;max-width:900px;max-height:92vh;overflow:auto;border-radius:12px;padding:20px;box-sizing:border-box;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px"><div><h3 id="project-needs-title" style="margin:0 0 6px">ثبت نیازهای ملزومات پروژه</h3><div>' + this.escape(project.ProjectCode || '') + ' — ' + this.escape(project.Title || project.Name || '') + '</div></div><button type="button" class="btn btn-light" data-needs-close>بستن</button></div>' +
        '<div class="alert alert-info">هر ردیف یک نیاز جداگانه است. برای سفارش‌گذاری، بعداً از دکمه «سفارش مرتبط با پروژه» استفاده کنید.</div>' +
        '<form id="project-needs-form"><div id="project-needs-rows"></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn btn-secondary" id="project-needs-add-row">+ افزودن ردیف</button><button type="submit" class="btn btn-primary">ثبت نیازها</button></div>' +
        '<div id="project-needs-error" class="alert alert-danger" hidden style="margin-top:12px"></div></form></div>';
      document.body.appendChild(modal);

      const rows = modal.querySelector('#project-needs-rows');
      const form = modal.querySelector('#project-needs-form');
      const errorBox = modal.querySelector('#project-needs-error');
      const close = () => { if (!modal.dataset.saving) modal.remove(); };
      modal.querySelector('[data-needs-close]').addEventListener('click', close);
      modal.addEventListener('click', (event) => { if (event.target === modal) close(); });

      const addRow = () => {
        const index = rows.querySelectorAll('[data-need-row]').length;
        const row = document.createElement('div');
        row.className = 'card';
        row.setAttribute('data-need-row', String(index));
        row.style.cssText = 'margin-top:12px;border:1px solid var(--color-border,#ddd);border-radius:8px;padding:14px;';
        row.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><strong>نیاز ' + (index + 1) + '</strong><button type="button" class="btn btn-light" data-need-remove>حذف ردیف</button></div>' +
          '<div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">' +
          '<label class="form-group"><span>نام ملزوم *</span><input name="ItemName" required maxlength="200" style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>واحد اندازه‌گیری *</span><input name="Unit" required maxlength="100" style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>مقدار موردنیاز *</span><input name="RequestedQuantity" type="number" min="0.001" step="any" required style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>تاریخ موردنیاز</span><input name="NeededBy" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۷/۲۷" style="width:100%;box-sizing:border-box"></label>' +
          '<label class="form-group"><span>توضیحات</span><input name="Notes" maxlength="500" style="width:100%;box-sizing:border-box"></label></div>';
        rows.appendChild(row);
      };

      modal.querySelector('#project-needs-add-row').addEventListener('click', addRow);
      rows.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-need-remove]');
        if (!remove) return;
        if (rows.querySelectorAll('[data-need-row]').length <= 1) {
          errorBox.textContent = 'حداقل یک ردیف باید باقی بماند.';
          errorBox.hidden = false;
          return;
        }
        remove.closest('[data-need-row]').remove();
      });
      addRow();

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (modal.dataset.saving) return;
        errorBox.hidden = true;
        const dataRows = Array.from(rows.querySelectorAll('[data-need-row]')).map((row) => {
          const get = (name) => row.querySelector('[name="' + name + '"]').value.trim();
          return {
            row,
            payload: {
              ProjectID: String(projectId),
              ItemName: get('ItemName'),
              Unit: get('Unit'),
              RequestedQuantity: Number(get('RequestedQuantity')),
              NeededBy: get('NeededBy'),
              Notes: get('Notes')
            }
          };
        });
        const submit = form.querySelector('[type="submit"]');
        modal.dataset.saving = '1';
        submit.disabled = true;
        submit.textContent = 'در حال ثبت...';
        let saved = 0;
        try {
          dataRows.forEach((entry) => {
            entry.payload.NeededBy = projectJalaliDateToIso(entry.payload.NeededBy);
          });
          for (let i = 0; i < dataRows.length; i++) {
            await window.PMS.Api.post('/procurement/needs', dataRows[i].payload);
            dataRows[i].row.remove();
            saved++;
          }
          modal.remove();
          window.alert('تعداد ' + saved + ' نیاز برای پروژه ثبت شد.');
        } catch (error) {
          delete modal.dataset.saving;
          errorBox.textContent = (error && error.message ? error.message : 'ثبت نیازها ناموفق بود.') +
            (saved ? ' تا پیش از خطا، ' + saved + ' ردیف ثبت شده است؛ فقط ردیف‌های باقی‌مانده را دوباره ثبت کنید.' : '');
          errorBox.hidden = false;
          submit.disabled = false;
          submit.textContent = 'ثبت نیازها';
        }
      });
    },

    loadProjectStatuses: async function () {
      try {
        const result = await window.PMS.Api.getCached(
          '/project-dashboard/lookups',
          'dashboard_project_lookups_v1'
        );
        let data = result && result.data !== undefined ? result.data : result;
        for (let i = 0; i < 4 && data && !Array.isArray(data); i++) {
          if (data.data !== undefined) { data = data.data; continue; }
          break;
        }
        this.projectStatuses = data && Array.isArray(data.projectStatuses) ? data.projectStatuses : [];
        const select = document.getElementById('project-status-filter');
        if (select && this.projectStatuses.length) {
          const current = select.value;
          select.innerHTML = '<option value="">همه وضعیت‌ها</option>' + this.projectStatuses.map((item) => {
            const code = item.Code || item.ID || '';
            const name = item.Name || item.Code || code;
            return '<option value="' + this.escape(code) + '">' + this.escape(name) + '</option>';
          }).join('');
          if (Array.from(select.options).some((option) => option.value === current)) select.value = current;
          this.applyFilters();
        }
      } catch (error) {
        // در صورت در دسترس نبودن فهرست وضعیت‌های سفارشی، گزینه‌های قبلی حفظ می‌شوند.
      }
    },

    loadStageLookups: async function () {
      const workflowIds = Array.from(new Set((this.projects || [])
        .map((project) => String(project.WorkflowID || project.WorkflowId || ''))
        .filter(Boolean)));
      if (!workflowIds.length) return;

      try {
        const entries = await Promise.all(workflowIds.map(async (workflowId) => {
          const result = await window.PMS.Api.getCached(
            '/workflows/' + encodeURIComponent(workflowId) + '/steps',
            'workflow_steps_' + workflowId
          );
          let data = result && result.data !== undefined ? result.data : result;
          for (let i = 0; i < 5 && data && !Array.isArray(data); i++) {
            if (Array.isArray(data.items)) { data = data.items; break; }
            if (Array.isArray(data.steps)) { data = data.steps; break; }
            if (Array.isArray(data.data)) { data = data.data; break; }
            if (data.data !== undefined) { data = data.data; continue; }
            break;
          }
          return [workflowId, Array.isArray(data) ? data : []];
        }));
        const lookup = {};
        entries.forEach(([workflowId, steps]) => {
          lookup[workflowId] = steps.sort((a, b) =>
            Number(a.StepOrder || a.Order || a.stepOrder || 0) -
            Number(b.StepOrder || b.Order || b.stepOrder || 0)
          );
        });
        this.workflowStepsByWorkflow = lookup;
        this.stageLookupsLoaded = true;
        this.applyFilters();
      } catch (error) {
        console.warn('دریافت نام مراحل پروژه‌ها انجام نشد.', error);
      }
    },

    getProjectStageName: function (project) {
      const explicit = project.CurrentStepName || project.CurrentStepTitle ||
        project.CurrentStageName || project.CurrentStage || project.StageName;
      if (explicit && !this.isLikelyStepCode(explicit)) return String(explicit).trim();

      const workflowId = String(project.WorkflowID || project.WorkflowId || '');
      const steps = this.workflowStepsByWorkflow[workflowId] || [];
      const currentStepId = project.CurrentStepID || project.CurrentStageID ||
        project.CurrentStep || project.CurrentStageCode || '';
      const step = steps.find((item) => {
        const ids = [item.ID, item.Id, item.id, item.Code, item.code];
        return ids.some((value) => value !== null && value !== undefined &&
          String(value).toLowerCase() === String(currentStepId).toLowerCase());
      });

      return String((step && (step.Name || step.Title || step.name || step.title)) ||
        explicit || currentStepId || 'نامشخص').trim();
    },

    isLikelyStepCode: function (value) {
      const text = String(value || '').trim();
      return /^[A-Z0-9_-]+$/.test(text) && /[A-Z]/.test(text);
    },

    // ========================================================
    // بارگذاری پروژه‌ها
    // ========================================================

    loadProjects: async function () {
      const loading = document.getElementById('projects-loading');

      const cached = window.PMS.Cache.get(CACHE_KEY);

      if (cached !== null) {
        this.projects = this.normalizeProjects(cached);
        this.applyFilters();
        this.loadStageLookups();

        if (loading) {
          loading.hidden = true;
        }
      } else if (loading) {
        loading.hidden = false;
      }

      try {
        const result = await window.PMS.Api.getCached(
          '/projects',
          CACHE_KEY,
          {
            onRefresh: (data) => {
              this.projects = this.normalizeProjects(data);
              this.applyFilters();
              this.loadStageLookups();
            },

            onError: (error, isBackground) => {
              if (!isBackground) {
                this.showError(error);
              }
            }
          }
        );

        if (result && result.cached === false) {
          this.projects = this.normalizeProjects(result.data);
          this.applyFilters();
          this.loadStageLookups();
        }

        if (loading) {
          loading.hidden = true;
        }
      } catch (error) {
        if (loading) {
          loading.hidden = true;
        }

        if (cached === null) {
          this.showError(error);
        }
      }
    },

    normalizeProjects: function (data) {
      if (Array.isArray(data)) {
        return data;
      }

      if (data && Array.isArray(data.projects)) {
        return data.projects;
      }

      if (data && Array.isArray(data.items)) {
        return data.items;
      }

      if (data && data.data) {
        return this.normalizeProjects(data.data);
      }

      return [];
    },

    // ========================================================
    // فرم ایجاد پروژه
    // ========================================================

    openCreateForm: async function () {
      if (this.modal) {
        this.modal.remove();
      }

      const modal = document.createElement('div');

      modal.id = 'project-create-modal';

      modal.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'background:var(--color-overlay)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'padding:16px',
        'overflow-y:auto'
      ].join(';');

      modal.innerHTML = `
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-create-title"
          style="
            background:var(--color-surface);
            width:100%;
            max-width:760px;
            max-height:90vh;
            overflow-y:auto;
            border-radius:10px;
            padding:24px;
            box-sizing:border-box;
            direction:rtl;
            color:var(--color-text);
          "
        >
          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:20px;
          ">
            <h3 id="project-create-title" style="margin:0;">
              ایجاد پروژه جدید
            </h3>

            <div style="display:flex;align-items:center;gap:8px">
              <button type="button" id="project-settings-open" class="btn btn-light" aria-label="تنظیمات فرم ایجاد پروژه" title="تنظیمات فرم" style="display:inline-flex;align-items:center;gap:7px">
                <span aria-hidden="true" style="font-size:18px;line-height:1">⚙</span>
                <span>تنظیمات</span>
              </button>
              <button type="button" id="project-create-close" class="btn btn-light" aria-label="بستن">✕</button>
            </div>
          </div>

          <div
            id="project-create-error"
            class="alert alert-danger"
            hidden
            style="margin-bottom:16px;"
          ></div>
          <div
            id="project-create-progress"
            class="project-create-progress"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            hidden
          >
            <span class="project-create-progress-spinner" aria-hidden="true"></span>
            <span id="project-create-progress-text"></span>
          </div>

          <form id="project-create-form">
            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-code">کد پروژه <span style="color:var(--color-danger);">*</span></label>
              <input type="text" id="new-project-code" name="ProjectCode" required maxlength="100" autocomplete="off" placeholder="کد پروژه را وارد کنید" style="width:100%;box-sizing:border-box;">
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">کد را اپراتور وارد می‌کند و پس از ایجاد پروژه قابل تغییر نیست.</small>
            </div>
            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-title">نام پروژه <span style="color:var(--color-danger);">*</span></label>
              <input type="text" id="new-project-title" name="Title" required maxlength="200" autocomplete="off" placeholder="نام پروژه تولید" style="width:100%;box-sizing:border-box;">
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-quantity">
                تعداد پیشنهادی <span style="color:var(--color-text-secondary);font-size:12px;">(اختیاری)</span>
              </label>
              <input
                type="number"
                id="new-project-quantity"
                name="Quantity"
                min="1"
                step="1"
                inputmode="numeric"
                placeholder="تعداد پیشنهادی قطعات"
                style="width:100%;box-sizing:border-box;"
              >
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-workflow">
                گردش کار <span style="color:var(--color-danger);">*</span>
              </label>

              <select
                id="new-project-workflow"
                name="WorkflowID"
                required
                style="width:100%;box-sizing:border-box;"
              >
                <option value="">در حال دریافت گردش کارها...</option>
              </select>

              <small style="display:block;margin-top:6px;color:var(--color-text-secondary);">
                یک گردش کار را انتخاب کنید. پس از ایجاد پروژه، مسیر گردش کار قابل تغییر نیست.
              </small>
            </div>

            <div class="filter-group" style="margin-bottom:20px;">
              <label for="new-project-description">
                توضیحات
              </label>

              <textarea
                id="new-project-description"
                name="Description"
                rows="3"
                placeholder="توضیحات اختیاری درباره پروژه"
                style="width:100%;box-sizing:border-box;resize:vertical;"
              ></textarea>
            </div>

            <div id="new-project-departments-setting" class="filter-group" style="margin-bottom:18px;">
              <label>واحدهای مجاز برای مشاهده پروژه و ثبت رویداد <span style="color:var(--color-danger);">*</span></label>
              <div id="new-project-departments" class="project-access-grid" role="group" aria-label="انتخاب واحدهای مجاز" aria-describedby="new-project-departments-help"><div class="project-lookup-loading">در حال دریافت واحدها…</div></div>
              <small id="new-project-departments-help" style="display:block;margin-top:6px;color:var(--color-text-secondary);">حداقل یک واحد را انتخاب کنید.</small>
            </div>
            <div id="new-project-users-setting" class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-users">کاربران مجاز <span style="color:var(--color-text-secondary);font-size:12px;">(اختیاری)</span></label>
              <select id="new-project-users" name="AllowedUserIDs" multiple size="5" style="width:100%;box-sizing:border-box;min-height:120px;"></select>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">اگر انتخاب نشود، محدودیت اختصاصی کاربر برای پروژه ثبت نمی‌شود.</small>
            </div>
            <div id="new-project-status-setting" class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-status">وضعیت پروژه پس از ایجاد</label>
              <select id="new-project-status" name="Status" style="width:100%;box-sizing:border-box;"><option value="">در حال دریافت وضعیت‌ها...</option></select>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">وضعیتی که انتخاب می‌کنید هنگام ثبت پروژه اعمال می‌شود.</small>
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-file">افزودن فایل <span style="color:var(--color-text-secondary);font-size:12px;">(اختیاری)</span></label>
              <input type="file" id="new-project-file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style="width:100%;box-sizing:border-box;">
              <small id="new-project-file-help" style="display:block;margin-top:5px;color:var(--color-text-secondary);">فایل پس از ایجاد پروژه به پیوست‌های همان پروژه اضافه می‌شود. برای بارگذاری به دسترسی افزودن فایل نیاز است.</small>
            </div>

            <div id="new-project-notify-setting" class="filter-group" style="margin-bottom:16px;">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="new-project-notify" checked>
                <span>فعال بودن اطلاع‌رسانی</span>
              </label>
              <small style="display:block;margin-top:5px;color:var(--color-text-secondary);">این گزینه به‌صورت پیش‌فرض فعال است.</small>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;margin:4px 0 16px;">
              ${this.canManageProcurement() ? '<button type="button" id="new-project-needs-button" class="btn btn-secondary">ملزومات موردنیاز</button>' : ''}
              <button type="button" id="new-project-color-size-button" class="btn btn-secondary">تعریف رنگ‌بندی و سایزبندی</button>
            </div>
            <div id="new-project-needs-summary" style="font-size:12px;color:var(--color-text-secondary);margin:-8px 0 14px;">ملزومات اختیاری است و هنوز موردی تعریف نشده است.</div>
            <div id="new-project-color-size-summary" style="font-size:12px;color:var(--color-text-secondary);margin:-8px 0 16px;">رنگ‌بندی و سایزبندی اختیاری است و هنوز تعریف نشده است.</div>

            <div style="
              display:flex;
              justify-content:flex-start;
              gap:10px;
              flex-wrap:wrap;
            ">
              <button
                type="submit"
                id="project-create-submit"
                class="btn btn-primary"
              >
                ثبت پروژه
              </button>

              <button
                type="button"
                id="project-create-cancel"
                class="btn btn-light"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;

      const settingsModal = document.createElement('div');
      settingsModal.id = 'project-create-settings-modal';
      settingsModal.style.cssText = 'position:fixed;inset:0;z-index:10020;background:var(--color-overlay,rgba(0,0,0,.5));display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;direction:rtl;';
      settingsModal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="project-create-settings-title" style="background:var(--color-surface);color:var(--color-text);width:100%;max-width:680px;max-height:88vh;overflow:auto;border:1px solid var(--color-border);border-radius:14px;padding:20px;box-sizing:border-box;box-shadow:var(--shadow-lg,0 18px 50px rgba(0,0,0,.2))">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px"><h3 id="project-create-settings-title" style="margin:0">تنظیمات پیش‌فرض ایجاد پروژه</h3><button type="button" class="btn btn-light" data-settings-close aria-label="بستن تنظیمات">✕</button></div>' +
        '<p style="font-size:12px;line-height:1.9;color:var(--color-text-secondary);margin:0 0 16px">این انتخاب‌ها برای دفعات بعد ذخیره می‌شوند و هنگام ساخت پروژه جدید به‌صورت پیش‌فرض اعمال خواهند شد.</p>' +
        '<div id="project-create-settings-content"></div>' +
        '<div id="project-settings-error" class="alert alert-danger" hidden style="margin-top:12px"></div>' +
        '<div style="display:flex;justify-content:flex-start;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid var(--color-border)"><button type="button" class="btn btn-primary" data-settings-save>ذخیره تنظیمات</button><button type="button" class="btn btn-light" data-settings-cancel>بستن</button></div></div>';
      modal.appendChild(settingsModal);
      const settingsContent = settingsModal.querySelector('#project-create-settings-content');
      ['new-project-departments-setting','new-project-users-setting','new-project-status-setting','new-project-notify-setting'].forEach((id) => {
        const setting = modal.querySelector('#' + id);
        if (setting && settingsContent) settingsContent.appendChild(setting);
      });
      const projectSettingsKey = projectSettingsStorageKey();
      const getSelectedDepartmentIds = () => Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]:checked')).map((input) => input.value).filter(Boolean);
      const getSelectedUserIds = () => Array.from(modal.querySelector('#new-project-users').selectedOptions).map((option) => option.value).filter(Boolean);
      const saveProjectSettings = () => {
        const settings = { departmentIds:getSelectedDepartmentIds(), userIds:getSelectedUserIds(), notifyEnabled:!!modal.querySelector('#new-project-notify').checked, status:String((modal.querySelector('#new-project-status') || {}).value || '') };
        try { localStorage.setItem(projectSettingsKey, JSON.stringify(settings)); } catch (error) {}
        return settings;
      };
      const applySavedProjectSettings = () => {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(projectSettingsKey) || 'null'); } catch (error) {}
        const checks = Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]'));
        if (saved && Array.isArray(saved.departmentIds)) checks.forEach((input) => { input.checked = saved.departmentIds.map(String).includes(String(input.value)); });
        const userSelect = modal.querySelector('#new-project-users');
        if (saved && Array.isArray(saved.userIds)) Array.from(userSelect.options).forEach((option) => { option.selected = saved.userIds.map(String).includes(String(option.value)); });
        const notify = modal.querySelector('#new-project-notify');
        if (saved && typeof saved.notifyEnabled === 'boolean') notify.checked = saved.notifyEnabled;
        const statusSelect = modal.querySelector('#new-project-status');
        if (statusSelect && saved && saved.status && Array.from(statusSelect.options).some((option) => option.value === saved.status)) statusSelect.value = saved.status;
        else if (statusSelect && statusSelect.options.length > 1) {
          const awaiting = Array.from(statusSelect.options).find((option) => /در\s*انتظار\s*اقدام/.test(option.textContent));
          statusSelect.value = awaiting ? awaiting.value : statusSelect.options[1].value;
        }
      };
      const openSettings = () => { settingsModal.style.display = 'flex'; const first = settingsModal.querySelector('input,select,button'); if (first) first.focus(); };
      const closeSettings = () => { settingsModal.style.display = 'none'; };
      modal.querySelector('#project-settings-open').addEventListener('click', openSettings);
      settingsModal.querySelector('[data-settings-close]').addEventListener('click', closeSettings);
      settingsModal.querySelector('[data-settings-cancel]').addEventListener('click', closeSettings);
      settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettings(); });
      settingsModal.querySelector('[data-settings-save]').addEventListener('click', () => {
        const error = settingsModal.querySelector('#project-settings-error');
        if (!getSelectedDepartmentIds().length) {
          error.textContent = 'حداقل یک واحد مجاز انتخاب کنید.';
          error.hidden = false;
          return;
        }
        const statusSelect = modal.querySelector('#new-project-status');
        if (statusSelect && statusSelect.options.length > 1 && !statusSelect.value) {
          error.textContent = 'وضعیت پروژه پس از ایجاد را انتخاب کنید.';
          error.hidden = false;
          return;
        }
        saveProjectSettings();
        error.hidden = true;
        closeSettings();
      });
      settingsContent.addEventListener('change', saveProjectSettings);
      settingsContent.addEventListener('click', (event) => {
        if (event.target && event.target.matches('input[name="AvailableDepartmentIDs"]')) saveProjectSettings();
      });

      const closeButton = modal.querySelector('#project-create-close');
      const cancelButton = modal.querySelector('#project-create-cancel');
      const form = modal.querySelector('#project-create-form');
      const workflowSelect = modal.querySelector('#new-project-workflow');
      const departmentsSelect = modal.querySelector('#new-project-departments');
      const usersSelect = modal.querySelector('#new-project-users');
      const fileInput = modal.querySelector('#new-project-file');
      const fileHelp = modal.querySelector('#new-project-file-help');
      const routerForAttachments = window.PMS.Router;
      const canUploadProjectAttachment = !!(routerForAttachments &&
        (routerForAttachments.isAdmin() ||
          (Array.isArray(routerForAttachments.permissions) &&
            routerForAttachments.permissions.indexOf('ATTACHMENT_UPLOAD') !== -1)));
      if (!canUploadProjectAttachment && fileInput) {
        fileInput.disabled = true;
        if (fileHelp) fileHelp.textContent = 'برای افزودن فایل، مدیر باید دسترسی ATTACHMENT_UPLOAD را به نقش شما بدهد.';
      }

      const closeModal = () => {
        if (this.isSaving) {
          return;
        }

        modal.remove();

        if (this.modal === modal) {
          this.modal = null;
        }
      };

      const colorSizeButton = modal.querySelector('#new-project-color-size-button');
      if (colorSizeButton) colorSizeButton.addEventListener('click', () => this.openColorSizeForm(modal));
      const needsButton = modal.querySelector('#new-project-needs-button');
      if (needsButton) needsButton.addEventListener('click', () => this.openDraftNeedsForm(modal));

      closeButton.addEventListener('click', closeModal);
      cancelButton.addEventListener('click', closeModal);

      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });

      const escapeHandler = (event) => {
        if (event.key === 'Escape' && this.modal === modal) {
          closeModal();
        }
      };

      document.addEventListener('keydown', escapeHandler);

      const originalRemove = modal.remove.bind(modal);

      modal.remove = () => {
        document.removeEventListener('keydown', escapeHandler);
        originalRemove();
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.createProject(modal);
      });

      const renderProjectLookups = (rawData) => {
        let lookupData = rawData;
        for (let depth = 0; depth < 3 && lookupData && lookupData.data !== undefined &&
          !Array.isArray(lookupData.departments); depth += 1) {
          lookupData = lookupData.data;
        }
        if (!lookupData || typeof lookupData !== 'object') lookupData = {};

        const workflows = this.normalizeWorkflows({
          workflows: Array.isArray(lookupData.workflows) ? lookupData.workflows : []
        });
        const departments = Array.isArray(lookupData.departments) ? lookupData.departments : [];
        const users = Array.isArray(lookupData.users) ? lookupData.users : [];
        const projectStatuses = Array.isArray(lookupData.projectStatuses) ? lookupData.projectStatuses : [];

        if (this.modal !== modal) return;
        this.workflows = workflows;

        workflowSelect.innerHTML = workflows.length
          ? '<option value="">انتخاب گردش کار</option>' + workflows.map((workflow) => {
              const id = workflow.ID || workflow.Id || workflow.id;
              const name = workflow.Name || workflow.Title || workflow.WorkflowName || workflow.Code || id;
              return '<option value="' + this.escape(id) + '">' + this.escape(name) + '</option>';
            }).join('')
          : '<option value="">گردش کار فعالی پیدا نشد</option>';
        workflowSelect.value = '';

        departmentsSelect.innerHTML = departments.map((department) => {
          const id = department.ID || department.Id || department.id;
          const name = department.Name || department.Title || department.Code || id;
          return '<label class="project-access-option"><input type="checkbox" name="AvailableDepartmentIDs" value="' +
            this.escape(id) + '"><span>' + this.escape(name) + '</span></label>';
        }).join('');

        usersSelect.innerHTML = users.map((user) => {
          const id = user.ID || user.Id || user.id;
          const name = user.Name || user.FullName || user.Username || id;
          return '<option value="' + this.escape(id) + '">' + this.escape(name) + '</option>';
        }).join('');

        const statusSelect = modal.querySelector('#new-project-status');
        if (statusSelect) statusSelect.innerHTML = projectStatuses.length
          ? '<option value="">انتخاب وضعیت</option>' + projectStatuses.map((status) => {
              const value = status.Code || status.ID || status.Id || status.id;
              const name = status.Name || status.Code || value;
              return '<option value="' + this.escape(value) + '">' + this.escape(name) + '</option>';
            }).join('')
          : '<option value="">وضعیت فعالی تعریف نشده است</option>';

        const designDepartment = departments.find((department) =>
          String(department.Code || '').toUpperCase() === 'DESIGN' ||
          String(department.Name || '').includes('طراحی')
        );
        if (designDepartment) {
          const designId = String(designDepartment.ID || designDepartment.Id || designDepartment.id);
          const designCheckbox = Array.from(
            departmentsSelect.querySelectorAll('input[name="AvailableDepartmentIDs"]')
          ).find((input) => input.value === designId);
          if (designCheckbox) designCheckbox.checked = true;
        }

        applySavedProjectSettings();

        if (!workflows.length) {
          this.showFormError(modal, 'برای ایجاد پروژه، ابتدا باید یک گردش کار فعال و دارای مرحله ایجاد کنید.');
        } else if (!departments.length) {
          this.showFormError(modal, 'واحد فعالی برای انتخاب پیدا نشد. ابتدا واحدها را بررسی کنید.');
        } else {
          this.clearFormError(modal);
        }
      };

      try {
        // Scope cached names and IDs to the current authenticated session so
        // another user on the same device never sees a previous user's lookup cache.
        const sessionToken = String(window.PMS.Api.getToken() || '');
        let lookupHash = 2166136261;
        for (let i = 0; i < sessionToken.length; i += 1) {
          lookupHash ^= sessionToken.charCodeAt(i);
          lookupHash = Math.imul(lookupHash, 16777619);
        }
        const lookupCacheKey = 'project-form-lookups-v1-' + (lookupHash >>> 0).toString(36);

        // Cached data is shown immediately on repeat visits while the same
        // request refreshes in the background; no separate /workflows call.
        const lookupResult = await window.PMS.Api.getCached(
          '/project-form/lookups',
          lookupCacheKey,
          {
            onRefresh: (freshData) => {
              if (this.modal === modal) renderProjectLookups(freshData);
            }
          }
        );

        if (this.modal !== modal) return;
        renderProjectLookups(lookupResult && lookupResult.data !== undefined
          ? lookupResult.data
          : lookupResult);
      } catch (error) {
        if (this.modal !== modal) return;
        workflowSelect.innerHTML = '<option value="">خطا در دریافت اطلاعات فرم</option>';
        departmentsSelect.innerHTML = '<div class="project-lookup-error">دریافت واحدها ناموفق بود.</div>';
        this.showFormError(
          modal,
          'دریافت اطلاعات فرم ایجاد پروژه ناموفق بود. دوباره تلاش کنید. ' +
          this.getErrorMessage(error)
        );
      }

      // کد پروژه را اپراتور وارد می‌کند؛ پس از ثبت، بک‌اند آن را ثابت نگه می‌دارد.
    },

    openDraftNeedsForm: function (projectModal) {
      const existing = document.getElementById('project-draft-needs-modal');
      if (existing) existing.remove();
      let saved = [];
      try { saved = JSON.parse(projectModal.dataset.projectNeeds || '[]'); } catch (error) {}
      const modal = document.createElement('div');
      modal.id = 'project-draft-needs-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:10030;background:var(--color-overlay,rgba(0,0,0,.48));display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;overflow:auto;';
      modal.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="project-draft-needs-title" style="background:var(--color-surface);color:var(--color-text);width:100%;max-width:760px;max-height:90vh;overflow:auto;border-radius:12px;padding:20px;box-sizing:border-box"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h3 id="project-draft-needs-title">ملزومات موردنیاز پروژه</h3><button type="button" class="btn btn-light" data-draft-needs-close>بستن</button></div><p style="color:var(--color-text-secondary);font-size:12px;line-height:1.8">نیازها را تعریف کنید؛ پس از ثبت پروژه، این موارد به همان پروژه متصل می‌شوند. این فرم سفارش خرید ثبت نمی‌کند.</p><form id="project-draft-needs-form"><div id="project-draft-needs-rows"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn btn-secondary" id="project-draft-needs-add">+ افزودن ردیف</button><button type="submit" class="btn btn-primary">ذخیره نیازها</button></div><div id="project-draft-needs-error" class="alert alert-danger" hidden style="margin-top:12px"></div></form></div>';
      document.body.appendChild(modal);
      const rows = modal.querySelector('#project-draft-needs-rows');
      const error = modal.querySelector('#project-draft-needs-error');
      const addRow = (item) => {
        const row = document.createElement('div');
        row.setAttribute('data-draft-need-row','1');
        row.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;border:1px solid var(--color-border);border-radius:8px;padding:12px;margin-top:10px';
        row.innerHTML = '<label>نام ملزوم *<input name="ItemName" required maxlength="200" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label>واحد اندازه‌گیری *<input name="Unit" required maxlength="100" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label>مقدار موردنیاز *<input name="RequestedQuantity" type="number" min="0.001" step="any" required style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label>توضیحات<input name="Notes" maxlength="500" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><button type="button" class="btn btn-light" data-draft-need-remove>حذف ردیف</button>';
        ['ItemName','Unit','RequestedQuantity','Notes'].forEach((name) => { if (item && item[name] !== undefined) row.querySelector('[name="'+name+'"]').value = item[name]; });
        row.querySelector('[data-draft-need-remove]').addEventListener('click', () => row.remove());
        rows.appendChild(row);
      };
      (saved.length ? saved : [{}]).forEach(addRow);
      modal.querySelector('#project-draft-needs-add').addEventListener('click', () => addRow({}));
      const close = () => modal.remove();
      modal.querySelector('[data-draft-needs-close]').addEventListener('click', close);
      modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
      modal.querySelector('#project-draft-needs-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const items = Array.from(rows.querySelectorAll('[data-draft-need-row]')).map((row) => {
          const get = (name) => row.querySelector('[name="'+name+'"]').value.trim();
          return { ItemName:get('ItemName'), Unit:get('Unit'), RequestedQuantity:Number(get('RequestedQuantity')), Notes:get('Notes') };
        });
        if (!items.length) { projectModal.dataset.projectNeeds = '[]'; close(); return; }
        if (items.some((item) => !item.ItemName || !item.Unit || !Number.isFinite(item.RequestedQuantity) || item.RequestedQuantity <= 0)) {
          error.textContent = 'نام ملزوم، واحد اندازه‌گیری و مقدار مثبت برای هر ردیف الزامی است.';
          error.hidden = false;
          return;
        }
        projectModal.dataset.projectNeeds = JSON.stringify(items);
        const summary = projectModal.querySelector('#new-project-needs-summary');
        if (summary) summary.textContent = items.length + ' ردیف ملزومات برای ثبت همراه پروژه آماده است.';
        close();
      });
    },

    openColorSizeForm: function (projectModal) {
      const existing = document.getElementById('project-color-size-modal');
      if (existing) existing.remove();

      let saved = { colors: [], sizes: [] };
      try {
        saved = JSON.parse(projectModal.dataset.colorSizeJson || '{"colors":[],"sizes":[]}');
      } catch (error) {}

      const modal = document.createElement('div');
      modal.id = 'project-color-size-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.48);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;overflow:auto;';
      modal.innerHTML =
        '<div role="dialog" aria-modal="true" aria-labelledby="project-color-size-title" style="background:var(--color-surface,#fff);color:var(--color-text,#222);width:100%;max-width:760px;max-height:90vh;overflow:auto;border-radius:14px;padding:20px;box-sizing:border-box;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><h3 id="project-color-size-title" style="margin:0">رنگ‌بندی و سایزبندی پروژه</h3><button type="button" class="btn btn-light" data-color-size-close>بستن</button></div>' +
          '<p style="font-size:12px;color:var(--color-text-secondary);line-height:1.9;margin:0 0 16px">هر رنگ و هر سایز را در یک ردیف وارد کنید. با دکمه افزودن می‌توانید ردیف جدید بسازید و ردیف‌های اضافی را حذف کنید. مقدار تولید هر ترکیب بعداً در رویدادهای تولید ثبت می‌شود.</p>' +
          '<form id="project-color-size-form">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">' +
              '<section><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px"><strong>رنگ‌ها</strong><button type="button" class="btn btn-secondary" data-color-size-add="colors">+ افزودن رنگ</button></div><div data-color-size-list="colors"></div></section>' +
              '<section><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px"><strong>سایزها</strong><button type="button" class="btn btn-secondary" data-color-size-add="sizes">+ افزودن سایز</button></div><div data-color-size-list="sizes"></div></section>' +
            '</div>' +
            '<div id="project-color-size-error" class="alert alert-danger" hidden style="margin-top:12px"></div>' +
            '<div style="display:flex;gap:8px;justify-content:flex-start;margin-top:16px;flex-wrap:wrap"><button type="submit" class="btn btn-primary">ذخیره مشخصات</button><button type="button" class="btn btn-light" data-color-size-clear>پاک کردن همه</button></div>' +
          '</form>' +
        '</div>';
      document.body.appendChild(modal);

      const form = modal.querySelector('#project-color-size-form');
      const errorBox = modal.querySelector('#project-color-size-error');
      const limits = { colors: { max: 80, label: 'رنگ' }, sizes: { max: 40, label: 'سایز' } };

      const getList = (kind) => modal.querySelector('[data-color-size-list="' + kind + '"]');

      const addRow = (kind, value) => {
        const list = getList(kind);
        if (!list || list.querySelectorAll('[data-variant-row]').length >= 100) {
          errorBox.textContent = 'حداکثر ۱۰۰ ' + limits[kind].label + ' می‌توانید تعریف کنید.';
          errorBox.hidden = false;
          return;
        }
        const row = document.createElement('div');
        row.setAttribute('data-variant-row', '1');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = limits[kind].max;
        input.value = value || '';
        input.placeholder = kind === 'colors' ? 'مثلاً مشکی' : 'مثلاً XL';
        input.setAttribute('aria-label', limits[kind].label);
        input.style.cssText = 'min-width:0;flex:1;width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid var(--color-border,#ddd);border-radius:8px;background:var(--color-surface,#fff);color:inherit;font:inherit;';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn btn-light';
        remove.textContent = 'حذف';
        remove.setAttribute('aria-label', 'حذف ' + limits[kind].label);
        remove.addEventListener('click', () => {
          row.remove();
          if (!list.querySelector('[data-variant-row]')) addRow(kind, '');
          errorBox.hidden = true;
        });
        row.appendChild(input);
        row.appendChild(remove);
        list.appendChild(row);
      };

      const renderList = (kind, values) => {
        const list = getList(kind);
        list.replaceChildren();
        (Array.isArray(values) ? values : []).forEach((value) => addRow(kind, value));
        if (!list.querySelector('[data-variant-row]')) addRow(kind, '');
      };

      renderList('colors', saved.colors);
      renderList('sizes', saved.sizes);

      modal.querySelectorAll('[data-color-size-add]').forEach((button) => {
        button.addEventListener('click', () => {
          addRow(button.getAttribute('data-color-size-add'), '');
          errorBox.hidden = true;
        });
      });

      const close = () => modal.remove();
      modal.querySelector('[data-color-size-close]').addEventListener('click', close);
      modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
      modal.querySelector('[data-color-size-clear]').addEventListener('click', () => {
        renderList('colors', []);
        renderList('sizes', []);
        errorBox.hidden = true;
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const normalize = (kind) => {
          const seen = new Set();
          const values = Array.from(getList(kind).querySelectorAll('input'))
            .map((input) => input.value.trim())
            .filter(Boolean);
          const result = [];
          for (const value of values) {
            if (value.length > limits[kind].max) {
              throw new Error('نام هر ' + limits[kind].label + ' حداکثر ' + limits[kind].max + ' نویسه باشد.');
            }
            const key = value.toLocaleLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              result.push(value);
            }
          }
          if (result.length > 100) {
            throw new Error('حداکثر ۱۰۰ ' + limits[kind].label + ' می‌توانید تعریف کنید.');
          }
          return result;
        };

        try {
          const colors = normalize('colors');
          const sizes = normalize('sizes');
          projectModal.dataset.colorSizeJson = JSON.stringify({ colors: colors, sizes: sizes });
          const summary = projectModal.querySelector('#new-project-color-size-summary');
          if (summary) {
            summary.textContent = (colors.length || sizes.length)
              ? colors.length + ' رنگ و ' + sizes.length + ' سایز تعریف شده'
              : 'هنوز رنگ یا سایزی تعریف نشده است.';
          }
          close();
        } catch (error) {
          errorBox.textContent = error && error.message ? error.message : 'بررسی رنگ‌بندی و سایزبندی ناموفق بود.';
          errorBox.hidden = false;
        }
      });
    },

    normalizeWorkflows: function (response) {
      let data = response;

      if (data && data.success === true && data.data !== undefined) {
        data = data.data;
      }

      if (data && data.data !== undefined) {
        data = data.data;
      }

      if (Array.isArray(data)) {
        return data.filter((workflow) => {
          return String(workflow.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
        });
      }

      if (data && Array.isArray(data.workflows)) {
        return this.normalizeWorkflows(data.workflows);
      }

      if (data && Array.isArray(data.items)) {
        return this.normalizeWorkflows(data.items);
      }

      return [];
    },

    // ========================================================
    // ثبت پروژه
    // ========================================================

    createProject: async function (modal) {
      if (this.isSaving) {
        return;
      }

      const codeInput = modal.querySelector('#new-project-code');
      const titleInput = modal.querySelector('#new-project-title');
      const quantityInput = modal.querySelector('#new-project-quantity');
      const workflowSelect = modal.querySelector('#new-project-workflow');
      const descriptionInput = modal.querySelector('#new-project-description');
      const shouldAddNeeds = false;
      const departmentsSelect = modal.querySelector('#new-project-departments');
      const usersSelect = modal.querySelector('#new-project-users');
      const fileInput = modal.querySelector('#new-project-file');
      const notifyInput = modal.querySelector('#new-project-notify');
      const selectedDepartments = Array.from(modal.querySelectorAll('input[name="AvailableDepartmentIDs"]:checked')).map((input) => input.value).filter(Boolean);
      const selectedUsers = Array.from(usersSelect.selectedOptions).map((option) => option.value).filter(Boolean);
      const selectedFile = fileInput && fileInput.files ? fileInput.files[0] : null;
      const submitButton = modal.querySelector('#project-create-submit');
      const progressBox = modal.querySelector('#project-create-progress');
      const progressText = modal.querySelector('#project-create-progress-text');
      const updateProgress = (message, state) => {
        if (!progressBox || !progressText) return;
        progressBox.hidden = false;
        progressBox.classList.remove('is-success', 'is-error');
        if (state === 'success') progressBox.classList.add('is-success');
        if (state === 'error') progressBox.classList.add('is-error');
        progressText.textContent = message;
      };
      const routerForAttachments = window.PMS.Router;
      const canUploadProjectAttachment = !!(routerForAttachments &&
        (routerForAttachments.isAdmin() ||
          (Array.isArray(routerForAttachments.permissions) &&
            routerForAttachments.permissions.indexOf('ATTACHMENT_UPLOAD') !== -1)));

      let colorSize = { colors: [], sizes: [] };
      try { colorSize = JSON.parse(modal.dataset.colorSizeJson || '{"colors":[],"sizes":[]}'); } catch (error) {}
      const project = {
        ProjectCode: codeInput.value.trim(),
        Title: titleInput.value.trim(),
        Quantity: quantityInput.value.trim() === '' ? '' : Number(quantityInput.value),
        WorkflowID: workflowSelect.value,
        Description: descriptionInput.value.trim(),
        ColorSizeJSON: JSON.stringify({
          colors: Array.isArray(colorSize.colors) ? colorSize.colors : [],
          sizes: Array.isArray(colorSize.sizes) ? colorSize.sizes : []
        }),
        AvailableDepartmentIDs: selectedDepartments,
        AllowedUserIDs: selectedUsers,
        NotifyEnabled: !!(notifyInput && notifyInput.checked),
        Status: String((modal.querySelector('#new-project-status') || {}).value || '')
      };
      try {
        localStorage.setItem(projectSettingsStorageKey(), JSON.stringify({
          departmentIds: selectedDepartments, userIds: selectedUsers, notifyEnabled: project.NotifyEnabled, status: project.Status
        }));
      } catch (settingsSaveError) {}

      if (!project.ProjectCode) {
        this.showFormError(modal, 'کد پروژه را وارد کن.');
        codeInput.focus();
        return;
      }

      if (!project.Title) {
        this.showFormError(modal, 'نام پروژه را وارد کن.');
        titleInput.focus();
        return;
      }

      if (quantityInput.value.trim() !== '' &&
          (!Number.isFinite(project.Quantity) || project.Quantity < 1 || !Number.isInteger(project.Quantity))) {
        this.showFormError(modal, 'تعداد پروژه باید یک عدد صحیح بزرگ‌تر از صفر باشد.');
        quantityInput.focus();
        return;
      }

      if (!project.WorkflowID) {
        this.showFormError(modal, 'یک گردش کار انتخاب کن.');
        workflowSelect.focus();
        return;
      }

      if (!project.AvailableDepartmentIDs.length) {
        this.showFormError(modal, 'حداقل یک واحد مجاز برای پروژه انتخاب کن.');
        const settingsOverlay = modal.querySelector('#project-create-settings-modal');
        if (settingsOverlay) {
          settingsOverlay.style.display = 'flex';
          const settingsError = settingsOverlay.querySelector('#project-settings-error');
          if (settingsError) { settingsError.textContent = 'حداقل یک واحد مجاز انتخاب کنید.'; settingsError.hidden = false; }
        }
        departmentsSelect.focus();
        return;
      }
      if (project.Status === '') {
        this.showFormError(modal, 'وضعیت پروژه پس از ایجاد را در تنظیمات انتخاب کن.');
        const settingsOverlay = modal.querySelector('#project-create-settings-modal');
        if (settingsOverlay) {
          settingsOverlay.style.display = 'flex';
          const settingsError = settingsOverlay.querySelector('#project-settings-error');
          if (settingsError) { settingsError.textContent = 'وضعیت پروژه پس از ایجاد را انتخاب کنید.'; settingsError.hidden = false; }
        }
        return;
      }

      if (selectedFile && !canUploadProjectAttachment) {
        this.showFormError(modal, 'برای بارگذاری فایل، دسترسی افزودن پیوست لازم است.');
        fileInput.focus();
        return;
      }
      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
        this.showFormError(modal, 'حجم فایل حداکثر ۵ مگابایت باشد.');
        fileInput.focus();
        return;
      }

      this.isSaving = true;
      submitButton.disabled = true;
      submitButton.textContent = 'در حال ثبت...';
      // Keep the user informed even when the server request takes several seconds.
      this.clearFormError(modal);
      updateProgress('در حال ذخیره اطلاعات پروژه در سرور؛ لطفاً این پنجره را نبندید.', 'loading');

      try {
        const response = await window.PMS.Api.post('/projects', project);

        const created = this.extractCreatedProject(response);

        if (!created || !(created.ID || created.Id || created.id)) {
          throw new Error(
            this.getErrorMessage(response) ||
            'پاسخ سرور برای ثبت پروژه معتبر نیست.'
          );
        }

        const createdId = String(created.ID || created.Id || created.id);
        updateProgress('پروژه ذخیره شد. در حال تکمیل اطلاعات وابسته...', 'loading');

        let attachmentWarning = '';
        let needsWarning = '';
        let draftNeeds = [];
        try { draftNeeds = JSON.parse(modal.dataset.projectNeeds || '[]'); } catch (error) {}
        if (draftNeeds.length) {
          try {
            for (let i = 0; i < draftNeeds.length; i++) {
              updateProgress('پروژه ثبت شد؛ در حال ثبت ملزومات (' + (i + 1) + ' از ' + draftNeeds.length + ')...', 'loading');
              await window.PMS.Api.post('/procurement/needs', Object.assign({}, draftNeeds[i], { ProjectID: createdId }));
            }
          } catch (needsError) {
            needsWarning = ' پروژه ایجاد شد، اما ثبت همه ملزومات ناموفق بود: ' + this.getErrorMessage(needsError);
          }
        }
        if (selectedFile) {
          updateProgress('پروژه ثبت شد؛ در حال بارگذاری فایل پیوست...', 'loading');
          try {
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
              reader.onload = () => {
                const result = String(reader.result || '');
                const comma = result.indexOf(',');
                if (comma < 0) reject(new Error('ساختار فایل نامعتبر است.'));
                else resolve(result.slice(comma + 1));
              };
              reader.readAsDataURL(selectedFile);
            });
            await window.PMS.Api.post('/projects/' + encodeURIComponent(createdId) + '/attachments', {
              FileName: selectedFile.name,
              MimeType: selectedFile.type || 'application/octet-stream',
              Base64: base64
            });
          } catch (attachmentError) {
            attachmentWarning = ' پروژه ایجاد شد، اما بارگذاری فایل ناموفق بود: ' + this.getErrorMessage(attachmentError);
          }
        }

        const exists = this.projects.some((item) => {
          return String(item.ID || item.Id || item.id) === createdId;
        });

        if (!exists) {
          this.projects.unshift(created);
        }

        // فهرست فعلی را بلافاصله به‌روز می‌کنیم.
        this.applyFilters();

        updateProgress('ثبت پروژه تمام شد.', 'success');
        // Let the success state be announced before closing the form.
        if (this.modal === modal) {
          this.modal = null;
        }
        modal.remove();

        alert('پروژه با موفقیت ثبت شد.' + attachmentWarning + needsWarning);

        if (shouldAddNeeds) {
          this.openProjectNeedsForm(createdId);
        }

        // Refresh the list only when the user is allowed to view projects.
        const router = window.PMS.Router;
        const canViewProjects = !!(
          router &&
          (router.isAdmin() ||
            (Array.isArray(router.permissions) &&
              router.permissions.indexOf('PROJECT_VIEW') !== -1))
        );

        if (canViewProjects) {
          this.loadProjects();
        }

      } catch (error) {
        const message = this.getErrorMessage(error) || 'ثبت پروژه ناموفق بود.';
        updateProgress('ثبت پروژه ناموفق بود: ' + message, 'error');
        this.showFormError(modal, message);
      } finally {
        this.isSaving = false;

        if (submitButton.isConnected) {
          submitButton.disabled = false;
          submitButton.textContent = 'ثبت پروژه';
        }
      }
    },

    extractCreatedProject: function (response) {
      if (!response) {
        return null;
      }

      if (response.success === false) {
        throw new Error(this.getErrorMessage(response));
      }

      let data = response;

      if (data.data !== undefined) {
        data = data.data;
      }

      if (data && data.data !== undefined) {
        data = data.data;
      }

      if (data && (data.ID || data.Id || data.id)) {
        return data;
      }

      return null;
    },

    showFormError: function (modal, message) {
      const errorBox = modal.querySelector('#project-create-error');

      if (!errorBox) {
        return;
      }

      errorBox.textContent = message;
      errorBox.hidden = false;
    },

    clearFormError: function (modal) {
      const errorBox = modal.querySelector('#project-create-error');

      if (errorBox) {
        errorBox.textContent = '';
        errorBox.hidden = true;
      }
    },

    getErrorMessage: function (error) {
      if (!error) {
        return '';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error.message) {
        return error.message;
      }

      if (error.error && error.error.message) {
        return error.error.message;
      }

      if (error.data && error.data.message) {
        return error.data.message;
      }

      if (error.messageText) {
        return error.messageText;
      }

      return '';
    },

    // ========================================================
    // فیلتر پروژه‌ها
    // ========================================================

    applyFilters: function () {
      const statusFilter = document.getElementById('project-status-filter');
      const searchInput = document.getElementById('project-search');

      const status = statusFilter ? statusFilter.value : '';
      const search = searchInput
        ? searchInput.value.trim().toLocaleLowerCase('fa')
        : '';

      const filtered = (this.projects || []).filter((project) => {
        if (status && String(project.Status || '') !== status) {
          return false;
        }

        if (search) {
          const code = String(project.ProjectCode || '').toLocaleLowerCase('fa');
          const title = String(project.Title || '').toLocaleLowerCase('fa');

          if (
            code.indexOf(search) === -1 &&
            title.indexOf(search) === -1
          ) {
            return false;
          }
        }

        return true;
      });

      this.render(filtered);
    },

    // ========================================================
    // نمایش جدول پروژه‌ها
    // ========================================================

    render: function (projects) {
      const container = document.getElementById('projects-table-container');
      const empty = document.getElementById('projects-empty');
      if (!container) return;

      container.classList.add('projects-card-list');

      if (!projects || projects.length === 0) {
        container.innerHTML = '';
        container.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;

      const statusClass = (status) => {
        const value = String(status || '').toUpperCase();
        if (value === 'ACTIVE') return 'is-active';
        if (value === 'ON_HOLD' || value === 'INACTIVE') return 'is-hold';
        if (value === 'COMPLETED') return 'is-completed';
        if (value === 'CANCELLED' || value === 'VOID' || value === 'DELETED') return 'is-cancelled';
        return '';
      };

      let html = '';
      projects.forEach((project) => {
        const id = project.ID || project.Id || project.id || '';
        const stateClass = statusClass(project.Status);
        const step = this.getProjectStageName(project);
        const quantity = project.Quantity !== undefined && project.Quantity !== null && project.Quantity !== ''
          ? 'تعداد: ' + this.escape(project.Quantity.toLocaleString ? project.Quantity.toLocaleString('fa-IR') : project.Quantity)
          : '';
        html += `
          <article class="project-list-card">
            <div class="project-list-card-main">
              <span class="project-list-card-indicator ${stateClass}" aria-hidden="true"></span>
              <div class="project-list-card-content">
                <div class="project-list-card-code">${this.escape(project.ProjectCode || 'بدون کد')}</div>
                <div class="project-list-card-title">${this.escape(project.Title || project.Name || 'بدون عنوان')}</div>
                <div class="project-list-card-meta">
                  <span class="project-list-badge ${stateClass}"><span aria-hidden="true">●</span> ${this.escape(this.statusText(project.Status))}</span>
                  <span class="project-list-badge">مرحله: ${this.escape(step)}</span>
                  ${project.CurrentStepStatus ? '<span class="project-list-badge">وضعیت مرحله: ' + this.escape(project.CurrentStepStatus) + '</span>' : ''}
                  ${quantity ? '<span class="project-list-badge">' + quantity + '</span>' : ''}
                </div>
                <div class="project-list-card-activity">آخرین بروزرسانی: ${this.escape(this.formatDate(project.UpdatedAt))}</div>
              </div>
            </div>
            <div class="project-list-card-actions">
              <button type="button" class="btn btn-sm btn-light project-view-button" data-project-id="${this.escape(id)}">مشاهده پروژه</button>
              ${this.canManageProcurement() ? `
                <button type="button" class="btn btn-sm btn-secondary project-material-needs-button" data-project-id="${this.escape(id)}">ملزومات</button>
              ` : ''}
            </div>
          </article>
        `;
      });

      container.innerHTML = html;
      container.hidden = false;

      container.querySelectorAll('.project-view-button').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.getAttribute('data-project-id');
          if (id) window.location.hash = '#project-detail/' + encodeURIComponent(id);
        });
      });
    },

    // ========================================================
    // وضعیت پروژه
    // ========================================================

    statusText: function (status) {
      const map = {
        ACTIVE: 'فعال',
        INACTIVE: 'غیرفعال',
        ON_HOLD: 'متوقف',
        COMPLETED: 'تکمیل‌شده',
        CANCELLED: 'لغوشده',
        VOID: 'باطل‌شده',
        DELETED: 'حذف‌شده'
      };

      const custom = this.projectStatuses.find((item) =>
        String(item.Code || item.ID || '').toLowerCase() === String(status || '').toLowerCase()
      );
      return (custom && (custom.Name || custom.Code)) || map[String(status || '').toUpperCase()] || status || '-';
    },

    // ========================================================
    // تاریخ
    // ========================================================

    formatDate: function (value) {
      if (!value) {
        return '-';
      }

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

    // ========================================================
    // نمایش خطا
    // ========================================================

    showError: function (error) {
      const errorBox = document.getElementById('projects-error');

      if (!errorBox) {
        return;
      }

      errorBox.textContent =
        this.getErrorMessage(error) || 'خطا در دریافت پروژه‌ها.';

      errorBox.hidden = false;
    },

    // ========================================================
    // جلوگیری از ورود HTML ناخواسته
    // ========================================================

    escape: function (value) {
      if (value === null || value === undefined) {
        return '';
      }

      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // ==========================================================
  // ثبت ماژول در فضای عمومی برنامه
  // ==========================================================

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  window.PMS.Projects = Projects;
  window.PMS.Modules.Projects = Projects;

})();