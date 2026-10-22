(function () {
  'use strict';

  const PMS = window.PMS = window.PMS || {};

  const WORKFLOWS_CACHE_KEY =
    PMS.Cache && PMS.Cache.keys && PMS.Cache.keys.WORKFLOWS
      ? PMS.Cache.keys.WORKFLOWS
      : 'workflows';

  const DEPARTMENTS_CACHE_KEY =
    PMS.Cache && PMS.Cache.keys && PMS.Cache.keys.DEPARTMENTS
      ? PMS.Cache.keys.DEPARTMENTS
      : 'departments';

  const STEP_CACHE_PREFIX =
    PMS.Cache && PMS.Cache.keys && PMS.Cache.keys.WORKFLOW_STEPS
      ? PMS.Cache.keys.WORKFLOW_STEPS
      : 'workflow_steps';

  const ASSIGNMENT_CACHE_PREFIX =
    PMS.Cache && PMS.Cache.keys &&
    PMS.Cache.keys.WORKFLOW_DEPARTMENT_STEPS
      ? PMS.Cache.keys.WORKFLOW_DEPARTMENT_STEPS
      : 'workflow_department_steps';

  const state = {
    workflows: [],
    departments: [],
    steps: [],
    assignments: [],
    workflowId: '',
    loading: false,
    saving: false,
    workflowDataRequestId: 0,
    initialRequestId: 0
  };

  function init() {
    const page = document.querySelector('.page-section');
    let section = document.getElementById('workflow-department-assignments');

    if (!section && !page) {
      console.warn('صفحه گردش کار برای اتصال واحدها پیدا نشد.');
      return;
    }

    if (!section) {
      section = document.createElement('section');
      section.id = 'workflow-department-assignments';
      section.className = 'card';
      section.style.marginBottom = '20px';

      section.innerHTML = `
      <div class="card-body">
        <div class="page-header">
          <div>
            <h3>اتصال بخش‌ها به مراحل فرایند</h3>
            <p>برای هر بخش، یک مرحله از Workflow انتخاب کن.</p>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-group">
            <label for="wsd-workflow">انتخاب Workflow</label>
            <select id="wsd-workflow" class="form-control">
              <option value="">در حال دریافت...</option>
            </select>
          </div>
        </div>

        <div id="wsd-message" class="alert" hidden></div>

        <div id="wsd-loading" class="loading-state" hidden>
          در حال دریافت اطلاعات...
        </div>

        <div id="wsd-content" hidden>
          <div id="wsd-bulk-editor"></div>

          <h4>اتصال‌های ثبت‌شده</h4>

          <div id="wsd-empty" class="table-empty" hidden>
            هنوز بخشی به مراحل این Workflow متصل نشده است.
          </div>

          <div
            id="wsd-table-container"
            class="table-wrapper"
            hidden
          ></div>
        </div>
      </div>
    `;

      const header = page.querySelector('.page-header');

      if (header) {
        header.insertAdjacentElement('afterend', section);
      } else {
        page.prepend(section);
      }
    }

    // Make initialization safe if the section was rendered by the page itself.
    if (section.dataset.wsdInitialized === 'true') return;
    section.dataset.wsdInitialized = 'true';

    injectStyles();
    bindEvents();
    loadInitialData();
  }

  function bindEvents() {
    const workflowSelect = document.getElementById('wsd-workflow');
    const table = document.getElementById('wsd-table-container');
    const editor = document.getElementById('wsd-bulk-editor');

    workflowSelect.addEventListener('change', async function () {
      state.workflowId = this.value;
      await loadWorkflowData();
    });

    editor.addEventListener('click', function (event) {
      const button = event.target.closest('#wsd-bulk-save');
      if (button) saveAllAssignments();
    });

    editor.addEventListener('input', function (event) {
      if (event.target && event.target.id === 'wsd-department-search') {
        filterAssignmentRows(event.target.value);
      }
    });

    table.addEventListener('click', function (event) {
      const button = event.target.closest('.wsd-remove-button');
      if (button) removeAssignment(button.getAttribute('data-id'));
    });
  }

  async function loadInitialData() {
    const requestId = ++state.initialRequestId;
    setMessage('', '');
    setLoading(true);

    try {
      const result = await PMS.Api.getCached(
        '/workflow-management/bootstrap',
        'workflowManagementBootstrap',
        {
          onRefresh: function (data) {
            if (requestId !== state.initialRequestId) return;
            state.workflows = normalizeList(data && data.workflows, ['items', 'workflows']).filter(isActive);
            state.departments = normalizeList(data && data.departments, ['items', 'departments']).filter(isActive);
            if (PMS.Cache) {
              PMS.Cache.set(WORKFLOWS_CACHE_KEY, state.workflows);
              PMS.Cache.set(DEPARTMENTS_CACHE_KEY, state.departments);
            }
            renderWorkflowOptions();
            renderDepartmentOptions();
          },
          onError: function (error) {
            console.warn('Workflow management bootstrap refresh failed:', error);
          }
        }
      );

      if (requestId !== state.initialRequestId) return;
      const data = result.data || {};
      state.workflows = normalizeList(data.workflows, ['items', 'workflows']).filter(isActive);
      state.departments = normalizeList(data.departments, ['items', 'departments']).filter(isActive);

      if (PMS.Cache) {
        PMS.Cache.set(WORKFLOWS_CACHE_KEY, state.workflows);
        PMS.Cache.set(DEPARTMENTS_CACHE_KEY, state.departments);
      }
      renderWorkflowOptions();
      renderDepartmentOptions();

      if (!state.workflows.length) {
        setMessage('هیچ Workflowای برای انتخاب وجود ندارد.', 'info');
        return;
      }

      state.workflowId = String(getId(state.workflows[0]));
      document.getElementById('wsd-workflow').value = state.workflowId;
      await loadWorkflowData();
    } catch (error) {
      if (requestId !== state.initialRequestId) return;
      console.error('Workflow assignment initialization failed:', error);
      setMessage(getErrorMessage(error), 'danger');
    } finally {
      if (requestId === state.initialRequestId) setLoading(false);
    }
  }

  async function loadWorkflowData() {
    const requestId = ++state.workflowDataRequestId;
    const content = document.getElementById('wsd-content');

    if (!state.workflowId) {
      content.hidden = true;
      state.steps = [];
      state.assignments = [];
      renderStepOptions();
      renderAssignments();
      return;
    }

    const workflowId = state.workflowId;
    state.loading = true;
    setLoading(true);
    setMessage('', '');

    try {
      const result = await PMS.Api.getCached(
        '/workflows/' + encodeURIComponent(workflowId) + '/management-data',
        getManagementDataCacheKey(workflowId),
        {
          onRefresh: function (data) {
            if (requestId !== state.workflowDataRequestId || workflowId !== state.workflowId) return;
            applyWorkflowManagementData(data);
            content.hidden = false;
            renderBulkEditor();
          },
          onError: function (error) {
            if (requestId === state.workflowDataRequestId) {
              console.warn('Workflow management data refresh failed:', error);
            }
          }
        }
      );

      if (requestId !== state.workflowDataRequestId || workflowId !== state.workflowId) return;
      applyWorkflowManagementData(result.data);
      content.hidden = false;
      renderBulkEditor();

      if (state.steps.length === 0) {
        setMessage('برای این Workflow هنوز مرحله فعالی ثبت نشده است.', 'info');
      }
    } catch (error) {
      if (requestId !== state.workflowDataRequestId) return;
      console.error('Loading workflow management data failed:', error);
      content.hidden = true;
      setMessage(getErrorMessage(error), 'danger');
    } finally {
      if (requestId === state.workflowDataRequestId) {
        state.loading = false;
        setLoading(false);
      }
    }
  }

  function applyWorkflowManagementData(data) {
    data = data || {};
    state.steps = normalizeList(data.steps, ['items', 'steps']).filter(function (step) {
      const status = getValue(step, 'Status', 'status');
      return !status || String(status).toUpperCase() === 'ACTIVE';
    });
    state.assignments = normalizeList(data.assignments, ['items', 'assignments']).filter(isActive);
    sortSteps();
    renderStepOptions();
    renderAssignments();
  }

  function isActive(item) {
    const status = getValue(item, 'Status', 'status');

    return (
      !status ||
      String(status).toUpperCase() === 'ACTIVE'
    );
  }

  function sortSteps() {
    state.steps.sort(function (a, b) {
      return Number(
        getValue(a, 'StepOrder', 'stepOrder') || 0
      ) - Number(
        getValue(b, 'StepOrder', 'stepOrder') || 0
      );
    });
  }

  function getStepCacheKey(workflowId) {
    return STEP_CACHE_PREFIX + '_' + workflowId;
  }

  function getManagementDataCacheKey(workflowId) {
    return 'workflowManagementData_' + workflowId;
  }

  function getAssignmentCacheKey(workflowId) {
    return ASSIGNMENT_CACHE_PREFIX + '_' + workflowId;
  }

  function invalidateCache(key) {
    if (!key) return;

    try {
      if (
        PMS.Api &&
        typeof PMS.Api.invalidate === 'function'
      ) {
        PMS.Api.invalidate(key);
      }

      if (
        PMS.Cache &&
        typeof PMS.Cache.invalidate === 'function'
      ) {
        PMS.Cache.invalidate(key);
      }

      if (
        PMS.Cache &&
        typeof PMS.Cache.remove === 'function'
      ) {
        PMS.Cache.remove(key);
      }

      if (
        PMS.Cache &&
        typeof PMS.Cache.delete === 'function'
      ) {
        PMS.Cache.delete(key);
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', key, error);
    }
  }

  function invalidateWorkflowAssignmentCaches(workflowId) {
    if (!workflowId) return;

    invalidateCache(getManagementDataCacheKey(workflowId));
    invalidateCache(getAssignmentCacheKey(workflowId));
    invalidateCache(getStepCacheKey(workflowId));
    invalidateCache('workflowManagementBootstrap');
    invalidateCache(WORKFLOWS_CACHE_KEY);
    invalidateCache(DEPARTMENTS_CACHE_KEY);
  }

  function renderWorkflowOptions() {
    const select = document.getElementById('wsd-workflow');

    if (!select) return;

    let html = '<option value="">انتخاب Workflow</option>';

    state.workflows.forEach(function (workflow) {
      const id = getId(workflow);
      const name = getValue(workflow, 'Name', 'name') || 'بدون نام';
      const code = getValue(workflow, 'Code', 'code') || '';

      html +=
        '<option value="' + escapeAttribute(id) + '">' +
        escapeHtml(name) +
        (code ? ' (' + escapeHtml(code) + ')' : '') +
        '</option>';
    });

    select.innerHTML = html;

    if (state.workflowId) {
      select.value = state.workflowId;
    }
  }

  function renderDepartmentOptions() {
    const select = document.getElementById('wsd-department');

    if (!select) return;

    let html = '<option value="">انتخاب بخش</option>';

    state.departments.forEach(function (department) {
      const id = getId(department);
      const name = getValue(department, 'Name', 'name') || 'بدون نام';
      const code = getValue(department, 'Code', 'code') || '';

      html +=
        '<option value="' + escapeAttribute(id) + '">' +
        escapeHtml(name) +
        (code ? ' (' + escapeHtml(code) + ')' : '') +
        '</option>';
    });

    select.innerHTML = html;
  }

  function renderStepOptions() {
    const select = document.getElementById('wsd-step');

    if (!select) return;

    let html = '<option value="">انتخاب مرحله</option>';

    state.steps.forEach(function (step) {
      const id = getId(step);
      const name = getValue(step, 'Name', 'name') || 'بدون نام';
      const order = getValue(step, 'StepOrder', 'stepOrder');

      html +=
        '<option value="' + escapeAttribute(id) + '">' +
        (
          order !== undefined &&
          order !== null &&
          order !== ''
            ? escapeHtml(String(order)) + '. '
            : ''
        ) +
        escapeHtml(name) +
        '</option>';
    });

    select.innerHTML = html;
  }

  function injectStyles() {
    if (document.getElementById('wsd-professional-styles')) return;
    const style = document.createElement('style');
    style.id = 'wsd-professional-styles';
    style.textContent = `
      #workflow-department-assignments .wsd-shell{display:grid;gap:18px}
      #workflow-department-assignments .wsd-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:18px;border:1px solid var(--border-color,#e5e7eb);border-radius:14px;background:var(--card-bg,#fff)}
      #workflow-department-assignments .wsd-heading{display:flex;align-items:flex-start;gap:12px}
      #workflow-department-assignments .wsd-heading-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:12px;background:var(--primary-soft,#eef2ff);color:var(--primary-color,#4f46e5);font-size:20px}
      #workflow-department-assignments .wsd-heading h4{margin:0 0 5px;font-size:16px;font-weight:750}
      #workflow-department-assignments .wsd-muted{color:var(--text-muted,#6b7280);font-size:13px;line-height:1.8;margin:0}
      #workflow-department-assignments .wsd-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      #workflow-department-assignments .wsd-metric{padding:15px 16px;border:1px solid var(--border-color,#e5e7eb);border-radius:12px;background:var(--card-bg,#fff);min-width:0}
      #workflow-department-assignments .wsd-metric-label{font-size:12px;color:var(--text-muted,#6b7280);margin-bottom:6px}
      #workflow-department-assignments .wsd-metric-value{font-size:24px;font-weight:800;line-height:1.2}
      #workflow-department-assignments .wsd-search{position:relative;min-width:min(100%,260px);flex:1}
      #workflow-department-assignments .wsd-search input{width:100%;min-height:42px;border:1px solid var(--border-color,#d1d5db);border-radius:10px;padding:9px 38px 9px 12px;background:var(--input-bg,var(--card-bg,#fff));color:inherit}
      #workflow-department-assignments .wsd-search-icon{position:absolute;right:13px;top:10px;color:var(--text-muted,#6b7280)}
      #workflow-department-assignments .wsd-table-wrap{border:1px solid var(--border-color,#e5e7eb);border-radius:12px;overflow:hidden;background:var(--card-bg,#fff)}
      #workflow-department-assignments .wsd-table{width:100%;border-collapse:collapse}
      #workflow-department-assignments .wsd-table th{font-size:12px;font-weight:700;text-align:right;color:var(--text-muted,#6b7280);background:var(--surface-muted,#f8fafc);padding:13px 16px;white-space:nowrap}
      #workflow-department-assignments .wsd-table td{padding:13px 16px;border-top:1px solid var(--border-color,#edf0f3);vertical-align:middle}
      #workflow-department-assignments .wsd-table tbody tr:hover{background:var(--hover-bg,rgba(148,163,184,.07))}
      #workflow-department-assignments .wsd-dept-name{font-weight:700}
      #workflow-department-assignments .wsd-dept-code{display:block;color:var(--text-muted,#6b7280);font-size:11px;margin-top:3px}
      #workflow-department-assignments .wsd-select{width:100%;min-height:40px;border:1px solid var(--border-color,#d1d5db);border-radius:9px;padding:7px 10px;background:var(--input-bg,var(--card-bg,#fff));color:inherit}
      #workflow-department-assignments .wsd-status{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:700;white-space:nowrap}
      #workflow-department-assignments .wsd-status.is-linked{color:#047857;background:rgba(16,185,129,.12)}
      #workflow-department-assignments .wsd-status.is-new{color:var(--text-muted,#6b7280);background:rgba(148,163,184,.14)}
      #workflow-department-assignments .wsd-row-hidden{display:none!important}
      #workflow-department-assignments .wsd-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 16px;border-top:1px solid var(--border-color,#e5e7eb);background:var(--surface-muted,#f8fafc)}
      #workflow-department-assignments .wsd-count{font-size:12px;color:var(--text-muted,#6b7280)}
      #workflow-department-assignments .wsd-save{min-height:42px;border-radius:10px;padding:10px 18px;font-weight:750}
      #workflow-department-assignments .wsd-tip{display:flex;gap:9px;align-items:flex-start;padding:12px 14px;border-radius:10px;background:var(--surface-muted,#f8fafc);color:var(--text-muted,#6b7280);font-size:12px;line-height:1.9}
      @media(max-width:700px){
        #workflow-department-assignments .wsd-metrics{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
        #workflow-department-assignments .wsd-metric{padding:11px 9px}
        #workflow-department-assignments .wsd-metric-value{font-size:20px}
        #workflow-department-assignments .wsd-toolbar{padding:14px}
        #workflow-department-assignments .wsd-table-wrap{border:0;background:transparent;overflow:visible}
        #workflow-department-assignments .wsd-table,#workflow-department-assignments .wsd-table tbody{display:block;width:100%}
        #workflow-department-assignments .wsd-table thead{display:none}
        #workflow-department-assignments .wsd-table tbody{display:grid;gap:10px}
        #workflow-department-assignments .wsd-table tr{display:grid;grid-template-columns:1fr;gap:9px;padding:13px;border:1px solid var(--border-color,#e5e7eb);border-radius:12px;background:var(--card-bg,#fff)}
        #workflow-department-assignments .wsd-table td{display:block;border:0;padding:0}
        #workflow-department-assignments .wsd-table td:nth-child(2):before{content:'مرحله مقصد';display:block;font-size:11px;color:var(--text-muted,#6b7280);margin-bottom:5px}
        #workflow-department-assignments .wsd-table td:nth-child(3){display:flex;justify-content:flex-start}
        #workflow-department-assignments .wsd-footer{align-items:stretch}
        #workflow-department-assignments .wsd-save{width:100%}
        #workflow-department-assignments .wsd-search{min-width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  function renderBulkEditor() {
    const container = document.getElementById('wsd-bulk-editor');
    if (!container) return;

    if (!state.departments.length || !state.steps.length) {
      container.innerHTML = '<div class="alert alert-info">برای ثبت اتصال، باید حداقل یک بخش و یک مرحله فعال وجود داشته باشد.</div>';
      return;
    }

    const currentByDepartment = {};
    state.assignments.forEach(function(item) {
      currentByDepartment[String(getValue(item, 'DepartmentID', 'departmentId'))] = item;
    });

    const linkedCount = Object.keys(currentByDepartment).length;
    const availableCount = Math.max(0, state.departments.length - linkedCount);
    const rows = state.departments.map(function(department) {
      const departmentId = String(getId(department));
      const current = currentByDepartment[departmentId];
      const currentStepId = current ? String(getValue(current, 'WorkflowStepID', 'workflowStepId')) : '';
      const name = getValue(department, 'Name', 'name') || 'بدون نام';
      const code = getValue(department, 'Code', 'code') || '';
      const currentStep = current && state.steps.find(function(step) {
        return String(getId(step)) === currentStepId;
      });
      const currentStepName = currentStep
        ? ((getValue(currentStep, 'StepOrder', 'stepOrder') || '') + '. ' + (getValue(currentStep, 'Name', 'name') || ''))
        : '';
      const options = ['<option value="">انتخاب مرحله</option>'].concat(
        state.steps.map(function(step) {
          const stepId = String(getId(step));
          const stepName = getValue(step, 'Name', 'name') || 'بدون نام';
          const order = getValue(step, 'StepOrder', 'stepOrder');
          const label = (order !== undefined && order !== null && order !== '' ? String(order) + '. ' : '') + stepName;
          return '<option value="' + escapeAttribute(stepId) + '"' +
            (stepId === currentStepId ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
        })
      ).join('');

      return '<tr class="wsd-assignment-row" data-search="' + escapeAttribute((name + ' ' + code + ' ' + currentStepName).toLowerCase()) + '">' +
        '<td><span class="wsd-dept-name">' + escapeHtml(name) + '</span>' +
        (code ? '<span class="wsd-dept-code">' + escapeHtml(code) + '</span>' : '') + '</td>' +
        '<td>' + (current
          ? '<div class="wsd-muted" style="font-weight:650;color:inherit">' + escapeHtml(currentStepName.replace(/^\\.\\s*/, '')) + '</div><div class="wsd-muted">برای تغییر مرحله، ابتدا اتصال فعلی را از فهرست پایین حذف کنید.</div>'
          : '<select aria-label="انتخاب مرحله برای ' + escapeAttribute(name) + '" class="wsd-select wsd-bulk-step" data-department-id="' + escapeAttribute(departmentId) + '"><option value="">انتخاب مرحله</option>' + options + '</select>') +
        '</td><td>' + (current
          ? '<span class="wsd-status is-linked">● متصل</span>'
          : '<span class="wsd-status is-new">○ آماده اتصال</span>') + '</td></tr>';
    }).join('');

    container.innerHTML =
      '<div class="wsd-shell">' +
        '<div class="wsd-toolbar">' +
          '<div class="wsd-heading"><div class="wsd-heading-icon" aria-hidden="true">⇄</div><div><h4>تخصیص واحدها به مراحل تولید</h4><p class="wsd-muted">برای هر واحد یک مرحله تعیین کنید؛ همه انتخاب‌های جدید با یک درخواست ثبت می‌شوند.</p></div></div>' +
          '<div class="wsd-search"><span class="wsd-search-icon" aria-hidden="true">⌕</span><input id="wsd-department-search" type="search" placeholder="جست‌وجوی نام یا کد واحد..." aria-label="جست‌وجوی واحدها"></div>' +
        '</div>' +
        '<div class="wsd-metrics">' +
          '<div class="wsd-metric"><div class="wsd-metric-label">تعداد مراحل فعال</div><div class="wsd-metric-value">' + state.steps.length + '</div></div>' +
          '<div class="wsd-metric"><div class="wsd-metric-label">واحدهای متصل</div><div class="wsd-metric-value">' + linkedCount + '</div></div>' +
          '<div class="wsd-metric"><div class="wsd-metric-label">واحدهای باقی‌مانده</div><div class="wsd-metric-value">' + availableCount + '</div></div>' +
        '</div>' +
        '<div class="wsd-table-wrap"><table class="wsd-table"><thead><tr><th style="width:32%">واحد / دپارتمان</th><th>مرحله گردش‌کار</th><th style="width:145px">وضعیت اتصال</th></tr></thead><tbody>' + rows + '</tbody></table>' +
          '<div class="wsd-footer"><span id="wsd-pending-count" class="wsd-count">اتصال جدیدی انتخاب نشده است.</span><button type="button" id="wsd-bulk-save" class="btn btn-primary wsd-save">ثبت اتصال‌های انتخاب‌شده</button></div>' +
        '</div>' +
        '<div class="wsd-tip"><span aria-hidden="true">ⓘ</span><span>در هر گردش‌کار، هر واحد فقط به یک مرحله متصل می‌شود. اتصال‌های ثبت‌شده برای جلوگیری از تغییر ناخواسته قفل هستند؛ برای جابه‌جایی، اتصال فعلی را از فهرست پایین حذف کنید و سپس اتصال جدید را ثبت کنید.</span></div>' +
      '</div>';

    container.querySelectorAll('.wsd-bulk-step').forEach(function(select) {
      select.addEventListener('change', updatePendingCount);
    });
    updatePendingCount();
  }

  function updatePendingCount() {
    const selects = Array.from(document.querySelectorAll('#wsd-bulk-editor .wsd-bulk-step'));
    const count = selects.filter(function(select) { return !!select.value; }).length;
    const label = document.getElementById('wsd-pending-count');
    const button = document.getElementById('wsd-bulk-save');
    if (label) label.textContent = count
      ? count + ' اتصال جدید برای ثبت آماده است.'
      : 'اتصال جدیدی انتخاب نشده است.';
    if (button && !state.saving) button.disabled = count === 0 || state.loading;
  }

  function filterAssignmentRows(query) {
    const normalized = String(query || '').trim().toLowerCase();
    document.querySelectorAll('#wsd-bulk-editor .wsd-assignment-row').forEach(function(row) {
      const haystack = String(row.getAttribute('data-search') || '');
      row.classList.toggle('wsd-row-hidden', !!normalized && haystack.indexOf(normalized) === -1);
    });
  }

  async function saveAllAssignments() {
    if (state.saving || state.loading) return;

    const button = document.getElementById('wsd-bulk-save');
    const selects = Array.from(document.querySelectorAll('#wsd-bulk-editor .wsd-bulk-step'));
    const assignments = [];

    selects.forEach(function(select) {
      const departmentId = select.getAttribute('data-department-id');
      const stepId = select.value;
      const existing = select.getAttribute('data-existing') === 'true';
      if (!stepId || existing) return;
      assignments.push({ DepartmentID: departmentId, WorkflowStepID: stepId });
    });

    if (!assignments.length) {
      setMessage('اتصال جدیدی برای ثبت انتخاب نشده است.', 'info');
      return;
    }

    state.saving = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'در حال ثبت همه اتصال‌ها...';
    }
    setMessage('', '');

    try {
      const response = await PMS.Api.post(
        '/workflows/' + encodeURIComponent(state.workflowId) + '/department-steps',
        { assignments: assignments }
      );
      const result = PMS.Api.extractData(response) || {};

      invalidateWorkflowAssignmentCaches(state.workflowId);
      setMessage(
        'ثبت گروهی انجام شد؛ اتصال جدید: ' + Number(result.created || 0) +
        '، از قبل ثبت‌شده: ' + Number(result.unchanged || 0) + '.',
        'success'
      );
      await loadWorkflowData();
    } catch (error) {
      console.error('Bulk workflow department assignment failed:', error);
      setMessage(getErrorMessage(error), 'danger');
    } finally {
      state.saving = false;
      const currentButton = document.getElementById('wsd-bulk-save');
      if (currentButton) {
        currentButton.textContent = 'ثبت اتصال‌های انتخاب‌شده';
      }
      updatePendingCount();
    }
  }

  async function assignDepartment() {
    if (state.saving || state.loading) return;

    const departmentSelect =
      document.getElementById('wsd-department');

    const stepSelect =
      document.getElementById('wsd-step');

    const button =
      document.getElementById('wsd-assign-button');

    const departmentId = departmentSelect.value;
    const stepId = stepSelect.value;
    const workflowId = state.workflowId;

    if (!workflowId || !departmentId || !stepId) {
      setMessage(
        'ابتدا Workflow، بخش و مرحله را انتخاب کن.',
        'warning'
      );
      return;
    }

    const existing = state.assignments.find(function (item) {
      return String(
        getValue(item, 'DepartmentID', 'departmentId')
      ) === String(departmentId);
    });

    if (existing) {
      const existingStepId = getValue(
        existing,
        'WorkflowStepID',
        'workflowStepId'
      );

      if (String(existingStepId) === String(stepId)) {
        setMessage(
          'این بخش قبلاً به همین مرحله متصل شده است.',
          'info'
        );
      } else {
        setMessage(
          'این بخش قبلاً به مرحله دیگری متصل شده است. ' +
          'ابتدا اتصال قبلی را حذف کن.',
          'warning'
        );
      }

      return;
    }

    state.saving = true;
    button.disabled = true;
    button.textContent = 'در حال ثبت...';
    setMessage('', '');

    try {
      await PMS.Api.post(
        '/workflows/' + encodeURIComponent(workflowId) +
        '/department-steps',
        {
          assignments: [{
            WorkflowStepID: stepId,
            DepartmentID: departmentId
          }]
        }
      );

      invalidateWorkflowAssignmentCaches(workflowId);

      setMessage(
        'اتصال بخش به مرحله با موفقیت ثبت شد.',
        'success'
      );

      departmentSelect.value = '';
      stepSelect.value = '';

      await loadWorkflowData();

    } catch (error) {
      console.error(
        'Assigning department to workflow step failed:',
        error
      );

      setMessage(getErrorMessage(error), 'danger');

    } finally {
      state.saving = false;
      button.disabled = false;
      button.textContent = 'اتصال بخش به مرحله';
    }
  }

  async function removeAssignment(id) {
    if (!id || state.saving || state.loading) return;

    const confirmed = window.confirm(
      'آیا از حذف اتصال این بخش به مرحله مطمئن هستی؟'
    );

    if (!confirmed) return;

    const workflowId = state.workflowId;

    state.saving = true;
    setMessage('', '');

    try {
      await PMS.Api.delete(
        '/workflows/' + encodeURIComponent(workflowId) +
        '/department-steps/' + encodeURIComponent(id)
      );

      invalidateWorkflowAssignmentCaches(workflowId);

      setMessage(
        'اتصال بخش با موفقیت حذف شد.',
        'success'
      );

      await loadWorkflowData();

    } catch (error) {
      console.error(
        'Removing department assignment failed:',
        error
      );

      setMessage(getErrorMessage(error), 'danger');

    } finally {
      state.saving = false;
    }
  }

  function renderAssignments() {
    const container =
      document.getElementById('wsd-table-container');

    const empty = document.getElementById('wsd-empty');

    if (!container || !empty) return;

    const rows = state.assignments.map(function (assignment) {
      const departmentId = getValue(
        assignment,
        'DepartmentID',
        'departmentId'
      );

      const stepId = getValue(
        assignment,
        'WorkflowStepID',
        'workflowStepId'
      );

      const department = state.departments.find(function (item) {
        return String(getId(item)) === String(departmentId);
      });

      const step = state.steps.find(function (item) {
        return String(getId(item)) === String(stepId);
      });

      const departmentName = department
        ? getValue(department, 'Name', 'name')
        : 'بخش حذف‌شده یا غیرفعال';

      const stepName = step
        ? getValue(step, 'Name', 'name')
        : 'مرحله پیدا نشد';

      const stepOrder = step
        ? getValue(step, 'StepOrder', 'stepOrder')
        : '';

      return {
        id: getId(assignment),
        departmentName: departmentName || '-',
        stepName: stepName || '-',
        stepOrder: stepOrder
      };
    });

    if (rows.length === 0) {
      container.innerHTML = '';
      container.hidden = true;
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    let html =
      '<table class="data-table">' +
      '<thead><tr>' +
      '<th>بخش کارخانه</th>' +
      '<th>مرحله Workflow</th>' +
      '<th>عملیات</th>' +
      '</tr></thead><tbody>';

    rows.forEach(function (row) {
      const stepLabel =
        row.stepOrder !== '' &&
        row.stepOrder !== undefined &&
        row.stepOrder !== null
          ? escapeHtml(String(row.stepOrder)) + '. '
          : '';

      html +=
        '<tr>' +
        '<td>' + escapeHtml(row.departmentName) + '</td>' +
        '<td>' + stepLabel + escapeHtml(row.stepName) + '</td>' +
        '<td>' +
        '<button type="button" class="btn btn-sm btn-secondary ' +
        'wsd-remove-button" data-id="' +
        escapeAttribute(row.id) + '">' +
        'حذف اتصال</button>' +
        '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';

    container.innerHTML = html;
    container.hidden = false;
  }

  function normalizeList(result, keys) {
    let value = result;

    if (value && value.data !== undefined) {
      value = value.data;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(value[keys[i]])) {
          return value[keys[i]];
        }
      }
    }

    return [];
  }

  function getId(item) {
    return getValue(item, 'ID', 'id') || '';
  }

  function getValue(item, upperKey, lowerKey) {
    if (!item) return '';

    if (item[upperKey] !== undefined) {
      return item[upperKey];
    }

    return item[lowerKey] !== undefined
      ? item[lowerKey]
      : '';
  }

  function setLoading(visible) {
    const element = document.getElementById('wsd-loading');

    if (element) {
      element.hidden = !visible;
    }
  }

  function setMessage(message, type) {
    const box = document.getElementById('wsd-message');

    if (!box) return;

    box.textContent = message || '';
    box.hidden = !message;
    box.className = 'alert' + (type ? ' alert-' + type : '');
  }

  function getErrorMessage(error) {
    return error && error.message
      ? error.message
      : 'عملیات انجام نشد. لطفاً دوباره تلاش کن.';
  }

  function escapeHtml(value) {
    return String(
      value === undefined || value === null ? '' : value
    )
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  // Initialize this section explicitly after the workflow page has loaded.
  // Auto-initializing a dynamically loaded page script can run before the
  // workflow module finishes rendering the page.
  PMS.Modules = PMS.Modules || {};
  PMS.Modules.WorkflowDepartmentAssignments = { init: init };
})();