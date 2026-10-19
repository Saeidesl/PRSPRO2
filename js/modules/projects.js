(function () {
  'use strict';

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
        '@media(max-width:520px){.project-list-card-main{padding:11px;gap:9px}.project-list-card-code{font-size:12px}.project-list-card-title{font-size:11px}.project-list-card-actions{padding:0 11px 11px}.project-list-card-actions .btn{flex:1}}'
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
            max-width:560px;
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

            <button
              type="button"
              id="project-create-close"
              class="btn btn-light"
              aria-label="بستن"
            >✕</button>
          </div>

          <div
            id="project-create-error"
            class="alert alert-danger"
            hidden
            style="margin-bottom:16px;"
          ></div>

          <form id="project-create-form">
            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-title">
                نام پروژه <span style="color:var(--color-danger);">*</span>
              </label>

              <input
                type="text"
                id="new-project-title"
                name="Title"
                required
                maxlength="200"
                autocomplete="off"
                placeholder="نام پروژه تولید"
                style="width:100%;box-sizing:border-box;"
              >
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-code">
                کد پروژه <span style="color:var(--color-danger);">*</span>
              </label>

              <input
                type="text"
                id="new-project-code"
                name="ProjectCode"
                required
                maxlength="100"
                autocomplete="off"
                placeholder="مثلاً PRJ-001"
                style="width:100%;box-sizing:border-box;"
              >
            </div>

            <div class="filter-group" style="margin-bottom:16px;">
              <label for="new-project-quantity">
                تعداد کل پروژه <span style="color:var(--color-danger);">*</span>
              </label>
              <input
                type="number"
                id="new-project-quantity"
                name="Quantity"
                required
                min="1"
                step="1"
                inputmode="numeric"
                placeholder="تعداد کل قطعات"
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
                پروژه از اولین مرحله گردش کار انتخاب‌شده شروع می‌شود.
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

            ${this.canManageProcurement() ? `
              <div class="alert alert-info" style="margin-bottom:16px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                  <input type="checkbox" id="new-project-add-needs">
                  <span>پس از ثبت پروژه، ثبت نیازهای ملزومات این پروژه را هم انجام بدهم</span>
                </label>
              </div>
            ` : ''}

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

      const closeButton = modal.querySelector('#project-create-close');
      const cancelButton = modal.querySelector('#project-create-cancel');
      const form = modal.querySelector('#project-create-form');
      const workflowSelect = modal.querySelector('#new-project-workflow');

      const closeModal = () => {
        if (this.isSaving) {
          return;
        }

        modal.remove();

        if (this.modal === modal) {
          this.modal = null;
        }
      };

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

      try {
        const response = await window.PMS.Api.get('/workflows');
        const workflows = this.normalizeWorkflows(response);

        if (this.modal !== modal) {
          return;
        }

        this.workflows = workflows;

        if (workflows.length === 0) {
          workflowSelect.innerHTML =
            '<option value="">گردش کار فعالی پیدا نشد</option>';

          this.showFormError(
            modal,
            'برای ایجاد پروژه، ابتدا باید یک گردش کار دارای مرحله ایجاد کنید.'
          );

          return;
        }

        workflowSelect.innerHTML =
          '<option value="">انتخاب گردش کار</option>' +
          workflows.map((workflow) => {
            const id = workflow.ID || workflow.Id || workflow.id;
            const name =
              workflow.Name ||
              workflow.Title ||
              workflow.WorkflowName ||
              workflow.Code ||
              id;

            return `
              <option value="${this.escape(id)}">
                ${this.escape(name)}
              </option>
            `;
          }).join('');

      } catch (error) {
        workflowSelect.innerHTML =
          '<option value="">خطا در دریافت گردش کارها</option>';

        this.showFormError(
          modal,
          'دریافت گردش کارها ناموفق بود. فرم را ببند و دوباره تلاش کن. ' +
          this.getErrorMessage(error)
        );
      }

      const codeInput = modal.querySelector('#new-project-code');

      if (codeInput) {
        codeInput.focus();
      }
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
      const addNeedsInput = modal.querySelector('#new-project-add-needs');
      const shouldAddNeeds = !!(addNeedsInput && addNeedsInput.checked);
      const submitButton = modal.querySelector('#project-create-submit');

      const project = {
        ProjectCode: codeInput.value.trim(),
        Title: titleInput.value.trim(),
        Quantity: Number(quantityInput.value),
        WorkflowID: workflowSelect.value,
        Description: descriptionInput.value.trim()
      };

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

      if (!Number.isFinite(project.Quantity) || project.Quantity < 1 || !Number.isInteger(project.Quantity)) {
        this.showFormError(modal, 'تعداد پروژه باید یک عدد صحیح بزرگ‌تر از صفر باشد.');
        quantityInput.focus();
        return;
      }

      if (!project.WorkflowID) {
        this.showFormError(modal, 'یک گردش کار انتخاب کن.');
        workflowSelect.focus();
        return;
      }

      this.isSaving = true;
      submitButton.disabled = true;
      submitButton.textContent = 'در حال ثبت...';

      this.clearFormError(modal);

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

        const exists = this.projects.some((item) => {
          return String(item.ID || item.Id || item.id) === createdId;
        });

        if (!exists) {
          this.projects.unshift(created);
        }

        // فهرست فعلی را بلافاصله به‌روز می‌کنیم.
        this.applyFilters();

        modal.remove();

        if (this.modal === modal) {
          this.modal = null;
        }

        alert('پروژه با موفقیت ثبت شد.');

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
        this.showFormError(
          modal,
          this.getErrorMessage(error) || 'ثبت پروژه ناموفق بود.'
        );
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

      return map[status] || status || '-';
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