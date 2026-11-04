
(function () {
  'use strict';

  const PMS = window.PMS = window.PMS || {};

  const CACHE_KEY =
    PMS.Cache && PMS.Cache.keys
      ? PMS.Cache.keys.WORKFLOWS
      : 'workflows';

  const BOOTSTRAP_CACHE_KEY = 'workflowManagementBootstrap';

  const STEP_CACHE_PREFIX =
    PMS.Cache && PMS.Cache.keys
      ? PMS.Cache.keys.WORKFLOW_STEPS
      : 'workflow_steps';

  const state = {
    workflows: [],
    eventTypes: [],
    informationTypes: [],
    search: '',
    loading: false,
    saving: false,
    rulesSaving: false,
    loadRequestId: 0,
    stepRequestId: 0
  };

  function init() {
    bindEvents();
    loadWorkflows();

    // This module is loaded by pages/workflows.html. Initialize its section
    // only after the workflow page has been inserted into the document.
    if (PMS.Modules && PMS.Modules.WorkflowDepartmentAssignments &&
        typeof PMS.Modules.WorkflowDepartmentAssignments.init === 'function') {
      PMS.Modules.WorkflowDepartmentAssignments.init();
    } else {
      console.warn('بخش اتصال واحدها به مراحل گردش کار بارگذاری نشده است.');
    }
  }

  function bindEvents() {
    const search = document.getElementById('workflow-search');
    const createButton = document.getElementById('workflow-create-button');

    if (search && !search.dataset.workflowBound) {
      search.dataset.workflowBound = 'true';
      state.search = search.value.trim().toLowerCase();

      search.addEventListener('input', function () {
        state.search = this.value.trim().toLowerCase();
        render();
      });
    }

    if (createButton && !createButton.dataset.workflowBound) {
      createButton.dataset.workflowBound = 'true';
      createButton.addEventListener('click', showCreateWorkflowModal);
    }
  }

  // ------------------------------------------
  // بارگذاری فهرست با کش و به‌روزرسانی پس‌زمینه
  // ------------------------------------------

  async function loadWorkflows() {
    const requestId = ++state.loadRequestId;
    state.loading = true;
    setVisible('workflows-loading', true);
    setVisible('workflows-error', false);

    try {
      const result = await PMS.Api.getCached(
        '/workflow-management/bootstrap',
        BOOTSTRAP_CACHE_KEY,
        {
          onRefresh: function (data) {
            if (requestId !== state.loadRequestId) return;
            state.workflows = normalizeWorkflows(data && data.workflows);
            if (data && Array.isArray(data.eventTypes)) state.eventTypes = normalizeEventTypes(data.eventTypes);
      if (data && Array.isArray(data.informationTypes)) state.informationTypes = data.informationTypes;
            if (PMS.Cache) PMS.Cache.set(CACHE_KEY, state.workflows);
            render();
            setVisible('workflows-loading', false);
          },
          onError: function (error) {
            if (requestId !== state.loadRequestId) return;
            showError(error.message || 'به‌روزرسانی فهرست فرآیندها ناموفق بود.');
            setVisible('workflows-loading', false);
          }
        }
      );

      if (requestId !== state.loadRequestId) return;
      state.workflows = normalizeWorkflows(result.data && result.data.workflows);
      if (result.data && Array.isArray(result.data.eventTypes)) state.eventTypes = normalizeEventTypes(result.data.eventTypes);
      if (result.data && Array.isArray(result.data.informationTypes)) state.informationTypes = result.data.informationTypes;
      if (PMS.Cache) PMS.Cache.set(CACHE_KEY, state.workflows);
      render();
      if (!result.refreshing) setVisible('workflows-loading', false);
    } catch (error) {
      if (requestId !== state.loadRequestId) return;
      showError(error.message || 'دریافت فرآیندها ناموفق بود.');
      setVisible('workflows-loading', false);
    } finally {
      if (requestId === state.loadRequestId) state.loading = false;
    }
  }

  function normalizeWorkflows(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.workflows)) return data.workflows;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }

  function normalizeSteps(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.steps)) return data.steps;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }

  function normalizeEventTypes(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.eventTypes)) return data.eventTypes;
    return [];
  }

  async function loadEventTypes() {
    try {
      const response = await PMS.Api.get('/event-types');
      state.eventTypes = normalizeEventTypes(PMS.Api.extractData(response));
    } catch (error) {
      state.eventTypes = [];
      console.warn('دریافت انواع رویداد برای تنظیم گردش کار ناموفق بود:', error);
    }
  }

  function getValue(item, upper, lower) {
    return item && (item[upper] != null ? item[upper] : item[lower]);
  }

  function getId(item) {
    return String(getValue(item, 'ID', 'id') || '');
  }

  function getName(item) {
    return getValue(item, 'Name', 'name') || 'بدون نام';
  }

  function getCode(item) {
    return getValue(item, 'Code', 'code') || '-';
  }

  function getStatus(item) {
    return getValue(item, 'Status', 'status') || '';
  }

  // ------------------------------------------
  // نمایش صفحه
  // ------------------------------------------

  function render() {
    const container = document.getElementById(
      'workflows-table-container'
    );
    const empty = document.getElementById('workflows-empty');

    if (!container) return;

    const filtered = state.workflows.filter(function (workflow) {
      const text = [
        getId(workflow),
        getName(workflow),
        getCode(workflow),
        getStatus(workflow),
        getValue(workflow, 'Version', 'version')
      ].join(' ').toLowerCase();

      return text.includes(state.search);
    });

    if (!filtered.length) {
      container.innerHTML = '';
      container.hidden = true;

      if (empty) {
        empty.hidden = false;
        empty.textContent = state.search
          ? 'فرآیندی مطابق عبارت جستجو پیدا نشد.'
          : 'هنوز فرآیندی ثبت نشده است. برای شروع، یک فرآیند جدید بساز.';
      }

      return;
    }

    if (empty) empty.hidden = true;
    container.hidden = false;

    container.innerHTML = `
      <div class="workflow-list-heading"
           style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <h3 style="margin:0 0 5px">فرآیندهای تولید</h3>
          <div style="color:var(--color-text-muted);font-size:13px">
            هر فرآیند مسیر و ترتیب مراحل تولید را مشخص می‌کند.
          </div>
        </div>
        <span class="workflow-count"
              style="font-size:13px;color:var(--color-text-muted)">
          ${filtered.length} فرآیند
        </span>
      </div>

      <div class="workflow-card-list"
           style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:16px">
        ${filtered.map(renderWorkflowCard).join('')}
      </div>
    `;

    container.querySelectorAll('[data-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        const id = this.dataset.id;
        const workflow = state.workflows.find(function (item) {
          return getId(item) === String(id);
        });

        if (!workflow) {
          showMessage('فرآیند موردنظر پیدا نشد.', 'danger');
          return;
        }

        if (this.dataset.action === 'view-steps') {
          loadWorkflowSteps(workflow);
        } else if (this.dataset.action === 'add-step') {
          showCreateStepModal(workflow);
        } else if (this.dataset.action === 'publish-workflow') {
          publishWorkflow(workflow);
        } else if (this.dataset.action === 'edit-workflow') {
          showCreateWorkflowModal(workflow);
        }
      });
    });
  }

  function renderWorkflowCard(workflow) {
    const id = getId(workflow);
    const name = getName(workflow);
    const code = getCode(workflow);
    const version = getValue(workflow, 'PublishedVersion', 'publishedVersion') || getValue(workflow, 'Version', 'version') || '1';
    const workflowType = String(getValue(workflow, 'WorkflowType', 'workflowType') || 'INITIAL').toUpperCase();
    const lifecycle = String(getValue(workflow, 'LifecycleState', 'lifecycleState') || 'DRAFT').toUpperCase();
    const typeLabel = workflowType === 'REPEAT' ? 'تولید تکراری' : 'تولید اولیه';
    const lifecycleLabel = lifecycle === 'PUBLISHED' ? 'منتشرشده' : 'پیش‌نویس';

    return `
      <article class="workflow-card card"
               style="margin:0;min-width:0;overflow:hidden">
        <div class="card-body" style="padding:18px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
            <div style="min-width:0">
              <div style="font-size:11px;color:var(--color-text-muted);margin-bottom:6px">
                فرآیند تولید
              </div>
              <h4 style="margin:0 0 10px;overflow-wrap:anywhere;font-size:17px">
                ${escapeHtml(name)}
              </h4>
            </div>
            <div style="flex-shrink:0">
              ${renderStatus(getStatus(workflow))}
            </div>
          </div>

          <div style="border-top:1px solid var(--color-border);padding-top:12px;margin-top:12px">
            <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px">
              <div>
                <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">
                  کد فرآیند
                </div>
                <div style="font-size:13px;overflow-wrap:anywhere">
                  ${escapeHtml(code)}
                </div>
              </div>
              <div>
                <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">
                  مسیر
                </div>
                <div style="font-size:13px">${escapeHtml(typeLabel)}</div>
              </div>
              <div>
                <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">
                  وضعیت نسخه
                </div>
                <div style="font-size:13px">${escapeHtml(lifecycleLabel)} · ${escapeHtml(version)}</div>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px">
            <button type="button"
                    class="btn btn-primary btn-sm"
                    data-action="view-steps"
                    data-id="${escapeAttribute(id)}">
              مشاهده مراحل
            </button>
            <button type="button"
                    class="btn btn-light btn-sm"
                    data-action="add-step"
                    data-id="${escapeAttribute(id)}">
              + افزودن مرحله
            </button>
            <button type="button" class="btn btn-light btn-sm"
                    data-action="edit-workflow" data-id="${escapeAttribute(id)}">
              ویرایش
            </button>
            <button type="button" class="btn btn-light btn-sm"
                    data-action="publish-workflow" data-id="${escapeAttribute(id)}">
              انتشار نسخه
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // ------------------------------------------
  // ایجاد فرآیند
  // ------------------------------------------

  function showCreateWorkflowModal(existingWorkflow) {
    const isEdit = !!existingWorkflow;
    let existingPolicies = {};
    try {
      const raw = existingWorkflow && (existingWorkflow.PublishedRepeatReferencePolicyJSON || existingWorkflow.RepeatReferencePolicyJSON);
      existingPolicies = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {});
    } catch (error) { existingPolicies = {}; }
    openModal({
      title: isEdit ? 'ویرایش فرآیند' : 'ایجاد فرآیند جدید',
      content: `
        <div style="margin-bottom:18px;color:var(--color-text-muted);font-size:13px">
          ${isEdit ? 'مشخصات و سیاست انتقال اطلاعات مرجع این فرآیند را ویرایش کن.' : 'ابتدا مشخصات فرآیند را ثبت کن. سپس می‌توانی مراحل تولید را به ترتیب اضافه کنی.'}
        </div>

        <form id="workflow-create-form">
          <div class="form-group">
            <label for="workflow-name">نام فرآیند <span aria-hidden="true">*</span></label>
            <input class="form-control"
                   id="workflow-name"
                   name="Name"
                   type="text"
                   maxlength="150"
                   required
                   placeholder="مثلاً فرآیند تولید لباس">
          </div>

          <div class="form-group">
            <label for="workflow-code">کد فرآیند <span aria-hidden="true">*</span></label>
            <input class="form-control"
                   id="workflow-code"
                   name="Code"
                   type="text"
                   maxlength="80"
                   required
                   placeholder="مثلاً GARMENT_PRODUCTION">
            <small style="display:block;margin-top:5px;color:var(--color-text-muted)">
              کدی کوتاه و قابل‌شناسایی وارد کن.
            </small>
          </div>

          <div class="form-group">
            <label for="workflow-type">نوع مسیر تولید</label>
            <select class="form-control" id="workflow-type" name="WorkflowType">
              <option value="INITIAL">تولید اولیه</option>
              <option value="REPEAT">تولید تکراری</option>
            </select>
          </div>


          <div id="workflow-repeat-policy" class="form-group" hidden>
            <label>سیاست اطلاعات مرجع برای پروژه‌های تکراری</label>
            <small style="display:block;margin:4px 0 10px;color:var(--color-text-muted)">این تنظیم پیش‌فرض پروژه‌های جدیدی است که با این فرآیند ساخته می‌شوند.</small>
            <div id="workflow-repeat-policy-fields"></div>
          </div>

          <div id="workflow-form-message" class="alert" hidden></div>

          <div class="modal-footer"
               style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-start">
            <button type="submit" class="btn btn-primary">${isEdit ? 'ذخیره تغییرات' : 'ثبت فرآیند'}</button>
            <button type="button" class="btn btn-light" data-close-modal>انصراف</button>
          </div>
        </form>
      `,
      onReady: function (overlay) {
        const form = overlay.querySelector('#workflow-create-form');
        if (isEdit) {
          form.elements.Name.value = getName(existingWorkflow);
          form.elements.Code.value = getCode(existingWorkflow) === '-' ? '' : getCode(existingWorkflow);
          form.elements.WorkflowType.value = String(getValue(existingWorkflow, 'WorkflowType', 'workflowType') || 'INITIAL').toUpperCase();
        }
        const workflowTypeSelect = form.elements.WorkflowType;
        const policyWrap = overlay.querySelector('#workflow-repeat-policy');
        const policyFields = overlay.querySelector('#workflow-repeat-policy-fields');
        function renderRepeatPolicyFields() {
          const isRepeat = workflowTypeSelect.value === 'REPEAT';
          policyWrap.hidden = !isRepeat;
          if (!isRepeat || policyFields.dataset.rendered === 'true') return;
          const types = Array.isArray(state.informationTypes) ? state.informationTypes : [];
          if (!types.length) {
            policyFields.innerHTML = '<div class="alert alert-warning">فهرست اطلاعات مرکزی در دسترس نیست؛ تنظیم سیاست را بعداً از طریق ویرایش فرآیند انجام دهید.</div>';
            return;
          }
          policyFields.innerHTML = types.map(function(type) {
            return '<div class="form-group" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(150px,220px);gap:10px;align-items:center">' +
              '<label style="margin:0">' + escapeHtml(type.Name || type.Code || type.ID) + '</label>' +
              '<select class="form-control" data-reference-type="' + escapeAttribute(type.ID) + '">' +
              '<option value="LIVE_SYNC"' + (String(existingPolicies[String(type.ID)] || 'INDEPENDENT').toUpperCase() === 'LIVE_SYNC' ? ' selected' : '') + '>همگام‌سازی زنده</option>' +
              '<option value="INITIAL_COPY"' + (String(existingPolicies[String(type.ID)] || 'INDEPENDENT').toUpperCase() === 'INITIAL_COPY' ? ' selected' : '') + '>فقط کپی اولیه</option>' +
              '<option value="INDEPENDENT"' + (!existingPolicies[String(type.ID)] || String(existingPolicies[String(type.ID)]).toUpperCase() === 'INDEPENDENT' ? ' selected' : '') + '>مستقل</option></select></div>';
          }).join('');
          policyFields.dataset.rendered = 'true';
        }
        workflowTypeSelect.addEventListener('change', renderRepeatPolicyFields);
        renderRepeatPolicyFields();


        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          if (state.saving) return;

          const name = form.elements.Name.value.trim();
          const code = form.elements.Code.value.trim();
          const workflowType = form.elements.WorkflowType.value || 'INITIAL';

          if (!name || !code) {
            showFormMessage(
              overlay,
              '#workflow-form-message',
              'نام و کد فرآیند را وارد کن.',
              'danger'
            );
            return;
          }

          state.saving = true;
          const submit = form.querySelector('[type="submit"]');
          submit.disabled = true;
          submit.textContent = isEdit ? 'در حال ذخیره...' : 'در حال ثبت...';

          try {
            const payload = {
              Name: name,
              Code: code,
              WorkflowType: workflowType,
              RepeatReferencePolicyJSON: workflowType === 'REPEAT' ? Array.from(form.querySelectorAll('[data-reference-type]')).reduce(function(result, select) { result[select.dataset.referenceType] = select.value; return result; }, {}) : {}
            };
            if (isEdit) {
              await PMS.Api.put('/workflows/' + encodeURIComponent(getId(existingWorkflow)), payload);
            } else {
              await PMS.Api.post('/workflows', payload);
            }

            invalidateCache(CACHE_KEY);
            invalidateCache(BOOTSTRAP_CACHE_KEY);
            closeModal(overlay);
            showMessage(isEdit ? 'تنظیمات فرآیند به‌روزرسانی شد.' : 'فرآیند با موفقیت ثبت شد.', 'success');
            await loadWorkflows();
          } catch (error) {
            showFormMessage(
              overlay,
              '#workflow-form-message',
              error.message || 'ثبت فرآیند ناموفق بود.',
              'danger'
            );
          } finally {
            state.saving = false;

            if (submit.isConnected) {
              submit.disabled = false;
              submit.textContent = isEdit ? 'ذخیره تغییرات' : 'ثبت فرآیند';
            }
          }
        });
      }
    });
  }

  // ------------------------------------------
  // افزودن مرحله به فرآیند
  // ------------------------------------------

  function showCreateStepModal(workflow) {
    openModal({
      title: 'افزودن مرحله جدید',
      content: `
        <div class="card"
             style="margin-bottom:18px;background:var(--color-surface-alt)">
          <div class="card-body" style="padding:14px">
            <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:5px">
              فرآیند انتخاب‌شده
            </div>
            <div style="font-weight:600;overflow-wrap:anywhere">
              ${escapeHtml(getName(workflow))}
            </div>
            <div style="font-size:12px;color:var(--color-text-muted);margin-top:5px">
              کد: ${escapeHtml(getCode(workflow))}
            </div>
          </div>
        </div>

        <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:18px">
          نام و کد مرحله را وارد کن. ترتیب مراحل مطابق تنظیمات ثبت‌شده در سیستم نمایش داده می‌شود.
        </p>

        <form id="workflow-step-form">
          <div class="form-group">
            <label for="step-name">نام مرحله <span aria-hidden="true">*</span></label>
            <input class="form-control"
                   id="step-name"
                   name="Name"
                   type="text"
                   maxlength="150"
                   required
                   placeholder="مثلاً برش پارچه">
          </div>

          <div class="form-group">
            <label for="step-code">کد مرحله <span aria-hidden="true">*</span></label>
            <input class="form-control"
                   id="step-code"
                   name="Code"
                   type="text"
                   maxlength="80"
                   required
                   placeholder="مثلاً CUTTING">
          </div>

          <div id="step-form-message" class="alert" hidden></div>

          <div class="modal-footer"
               style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-start">
            <button type="submit" class="btn btn-primary">ثبت مرحله</button>
            <button type="button" class="btn btn-light" data-close-modal>انصراف</button>
          </div>
        </form>
      `,
      onReady: function (overlay) {
        const form = overlay.querySelector('#workflow-step-form');

        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          if (state.saving) return;

          const name = form.elements.Name.value.trim();
          const code = form.elements.Code.value.trim();

          if (!name || !code) {
            showFormMessage(
              overlay,
              '#step-form-message',
              'نام و کد مرحله را وارد کن.',
              'danger'
            );
            return;
          }

          state.saving = true;
          const submit = form.querySelector('[type="submit"]');
          submit.disabled = true;
          submit.textContent = 'در حال ثبت...';

          try {
            await PMS.Api.post(
              '/workflows/' + encodeURIComponent(getId(workflow)) + '/steps',
              {
                Name: name,
                Code: code
              }
            );

            invalidateCache(getStepCacheKey(getId(workflow)));
            invalidateCache('workflowManagementData_' + getId(workflow));
            closeModal(overlay);
            showMessage('مرحله با موفقیت اضافه شد.', 'success');
            await loadWorkflowSteps(workflow);
          } catch (error) {
            showFormMessage(
              overlay,
              '#step-form-message',
              error.message || 'افزودن مرحله ناموفق بود.',
              'danger'
            );
          } finally {
            state.saving = false;

            if (submit.isConnected) {
              submit.disabled = false;
              submit.textContent = 'ثبت مرحله';
            }
          }
        });
      }
    });
  }

  // ------------------------------------------
  // مشاهده مراحل؛ کش اول، سرور در پس‌زمینه
  // ------------------------------------------

  async function loadWorkflowSteps(workflow) {
    const requestId = ++state.stepRequestId;
    const workflowId = getId(workflow);
    const cacheKey = getStepCacheKey(workflowId);

    try {
      const result = await PMS.Api.getCached(
        '/workflows/' + encodeURIComponent(workflowId) + '/steps',
        cacheKey,
        {
          onRefresh: function (data) {
            if (requestId !== state.stepRequestId) return;
            showWorkflowSteps(workflow, normalizeSteps(data));
          },

          onError: function (error) {
            if (requestId !== state.stepRequestId) return;
            showMessage(
              error.message || 'به‌روزرسانی مراحل ناموفق بود.',
              'danger'
            );
          }
        }
      );

      if (requestId !== state.stepRequestId) return;

      showWorkflowSteps(workflow, normalizeSteps(result.data));
    } catch (error) {
      if (requestId !== state.stepRequestId) return;

      showMessage(
        error.message || 'دریافت مراحل فرآیند ناموفق بود.',
        'danger'
      );
    }
  }

  function showWorkflowSteps(workflow, steps) {
    const sortedSteps = steps.slice().sort(function (a, b) {
      return Number(
        getValue(a, 'StepOrder', 'stepOrder') || 0
      ) - Number(
        getValue(b, 'StepOrder', 'stepOrder') || 0
      );
    });

    const rows = sortedSteps.map(function (step, index) {
      const order = getValue(step, 'StepOrder', 'stepOrder') || index + 1;

      return `
        <tr>
          <td style="width:70px;text-align:center">
            <span style="display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;border-radius:50%;background:var(--color-surface-alt)">
              ${escapeHtml(order)}
            </span>
          </td>
          <td>${escapeHtml(getName(step))}</td>
          <td>${escapeHtml(getCode(step))}</td>
          <td>${renderStatus(getStatus(step))}</td>
          <td>
            <button type="button" class="btn btn-light btn-sm"
                    data-action="edit-step-rules" data-step-id="${escapeAttribute(getId(step))}">
              تنظیم رویدادها
            </button>
          </td>
        </tr>
      `;
    }).join('');

    openModal({
      title: 'مراحل فرآیند',
      content: `
        <div class="card"
             style="margin-bottom:18px;background:var(--color-surface-alt)">
          <div class="card-body" style="padding:14px">
            <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:5px">
              فرآیند انتخاب‌شده
            </div>
            <div style="font-weight:600;overflow-wrap:anywhere">
              ${escapeHtml(getName(workflow))}
            </div>
            <div style="font-size:12px;color:var(--color-text-muted);margin-top:5px">
              کد: ${escapeHtml(getCode(workflow))}
              <span style="margin-inline-start:10px">تعداد مراحل: ${sortedSteps.length}</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <h4 style="margin:0 0 5px">ترتیب مراحل تولید</h4>
          <p style="font-size:13px;color:var(--color-text-muted);margin:0">
            مراحل ثبت‌شده برای این فرآیند در جدول زیر نمایش داده می‌شوند.
          </p>
        </div>

        ${sortedSteps.length ? `
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ترتیب</th>
                  <th>نام مرحله</th>
                  <th>کد مرحله</th>
                  <th>وضعیت</th>
                  <th>قواعد رویداد</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        ` : `
          <div class="table-empty" style="padding:24px;text-align:center">
            <div style="font-size:15px;font-weight:600;margin-bottom:8px">
              هنوز مرحله‌ای ثبت نشده است
            </div>
            <div style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px">
              برای تعریف مسیر تولید، اولین مرحله را اضافه کن.
            </div>
          </div>
        `}

        <div class="modal-footer"
             style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-start">
          <button type="button" class="btn btn-primary" id="steps-add-button">
            + افزودن مرحله
          </button>
          <button type="button" class="btn btn-light" data-close-modal>
            بستن
          </button>
        </div>
      `,
      onReady: function (overlay) {
        overlay.querySelectorAll('[data-action="edit-step-rules"]').forEach(function(button) {
          button.addEventListener('click', function() {
            const step = sortedSteps.find(function(item) {
              return getId(item) === String(button.dataset.stepId || '');
            });
            if (step) showStepEventRules(workflow, step);
          });
        });
        overlay.querySelector('#steps-add-button').addEventListener(
          'click',
          function () {
            closeModal(overlay);
            showCreateStepModal(workflow);
          }
        );
      }
    });
  }

  // ------------------------------------------
  // پنجره‌های محاوره‌ای
  // ------------------------------------------


  function eventTypeOptions(selectedId) {
    return '<option value="">انتخاب نوع رویداد...</option>' + state.eventTypes.map(function(item) {
      const id = getId(item);
      const name = getName(item);
      const code = getCode(item);
      return '<option value="' + escapeAttribute(id) + '"' +
        (String(id) === String(selectedId || '') ? ' selected' : '') + '>' +
        escapeHtml(name + (code && code !== '-' ? ' · ' + code : '')) + '</option>';
    }).join('');
  }

  function appendRuleRow(container, rule, sequenceMode) {
    rule = rule || {};
    const requirement = String(getValue(rule, 'RequirementMode', 'requirementMode') || 'REQUIRED').toUpperCase();
    const row = document.createElement('div');
    row.className = 'workflow-event-rule-row';
    row.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:8px;align-items:end;padding:12px;border:1px solid var(--color-border);border-radius:10px;margin-bottom:10px';
    row.innerHTML = `
      <div class="form-group" style="margin:0">
        <label>نوع رویداد</label>
        <select class="form-control" data-field="event-type">${eventTypeOptions(getValue(rule, 'EventTypeID', 'eventTypeId'))}</select>
      </div>
      <div class="form-group" style="margin:0">
        <label>الزام</label>
        <select class="form-control" data-field="requirement">
          <option value="REQUIRED" ${requirement === 'REQUIRED' ? 'selected' : ''}>اجباری</option>
          <option value="OPTIONAL" ${requirement === 'OPTIONAL' ? 'selected' : ''}>اختیاری</option>
          <option value="REFERENCE" ${requirement === 'REFERENCE' ? 'selected' : ''}>از پروژه مرجع</option>
          <option value="NOT_REQUIRED" ${requirement === 'NOT_REQUIRED' ? 'selected' : ''}>غیرضروری</option>
        </select>
      </div>
      <div class="form-group workflow-rule-strict" style="margin:0">
        <label>ترتیب</label>
        <input class="form-control" data-field="event-order" type="number" min="1" step="1"
               value="${escapeAttribute(getValue(rule, 'EventOrder', 'eventOrder') || '')}" placeholder="۱">
      </div>
      <div class="form-group workflow-rule-grouped" style="margin:0">
        <label>گروه</label>
        <input class="form-control" data-field="group-key" type="text" maxlength="60"
               value="${escapeAttribute(getValue(rule, 'GroupKey', 'groupKey') || '')}" placeholder="مثلاً آماده‌سازی">
        <input class="form-control" data-field="group-order" type="number" min="1" step="1"
               value="${escapeAttribute(getValue(rule, 'GroupOrder', 'groupOrder') || '')}" placeholder="ترتیب گروه" style="margin-top:5px">
      </div>
      <button type="button" class="btn btn-light btn-sm" data-remove-rule aria-label="حذف رویداد">حذف</button>
    `;
    const remove = row.querySelector('[data-remove-rule]');
    remove.addEventListener('click', function() { row.remove(); });
    container.appendChild(row);
    updateRuleSequenceVisibility(container, sequenceMode);
  }

  function updateRuleSequenceVisibility(container, sequenceMode) {
    const strict = sequenceMode === 'STRICT';
    const grouped = sequenceMode === 'GROUPED';
    container.querySelectorAll('.workflow-rule-strict').forEach(function(el) { el.hidden = !strict; });
    container.querySelectorAll('.workflow-rule-grouped').forEach(function(el) { el.hidden = !grouped; });
  }

  async function showStepEventRules(workflow, step) {
    const workflowId = getId(workflow);
    const stepId = getId(step);
    let loadedRules = [];
    let sequenceMode = 'STRICT';

    // Open immediately so a slow API response never makes the button appear inert.
    const overlay = openModal({
      title: 'تنظیم رویدادهای مرحله',
      content: `
        <div class="card" style="margin-bottom:16px;background:var(--color-surface-alt)">
          <div class="card-body" style="padding:12px">
            <strong>${escapeHtml(getName(workflow))}</strong>
            <div style="font-size:13px;color:var(--color-text-muted);margin-top:4px">
              مرحله: ${escapeHtml(getName(step))} · ${escapeHtml(getCode(step))}
            </div>
          </div>
        </div>
        <div id="workflow-rule-loading" class="loading-state" role="status" aria-live="polite">
          در حال دریافت تنظیمات رویدادها...
        </div>
        <div id="workflow-rule-editor" hidden>
          <div class="form-group">
            <label for="workflow-rule-sequence">روش ترتیب رویدادها در این مرحله</label>
            <select id="workflow-rule-sequence" class="form-control">
              <option value="STRICT">ترتیب اجباری و دقیق</option>
              <option value="FREE">ترتیب آزاد</option>
              <option value="GROUPED">ترکیبی؛ گروه‌ها به‌ترتیب و رویدادهای هر گروه آزاد</option>
            </select>
            <small>در هر مرحله فقط یک روش ترتیب قابل استفاده است.</small>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:16px 0 10px">
            <h4 style="margin:0">رویدادهای این مرحله</h4>
            <button type="button" id="workflow-rule-add" class="btn btn-light btn-sm">+ افزودن رویداد</button>
          </div>
          <div id="workflow-rule-rows"></div>
          <div class="alert alert-info" style="margin-top:12px">
            «از پروژه مرجع» فقط اطلاعات مرجع را نمایش می‌دهد و رویداد اجرایی جدید ثبت نمی‌کند.
          </div>
        </div>
        <div id="workflow-rule-message" class="alert" hidden role="alert"></div>
        <div class="modal-footer" style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" id="workflow-rule-save" class="btn btn-primary" disabled>ذخیره قواعد</button>
          <button type="button" class="btn btn-light" data-close-modal>بستن</button>
        </div>
      `,
      onReady: function(modalOverlay) {
        modalOverlay.querySelector('#workflow-rule-save').addEventListener('click', async function() {
          if (state.rulesSaving || this.disabled) return;
          const rows = modalOverlay.querySelector('#workflow-rule-rows');
          const sequence = modalOverlay.querySelector('#workflow-rule-sequence');
          const payloadRules = [];
          rows.querySelectorAll('.workflow-event-rule-row').forEach(function(row) {
            const eventTypeId = row.querySelector('[data-field="event-type"]').value;
            if (!eventTypeId) return;
            const requirementMode = row.querySelector('[data-field="requirement"]').value;
            payloadRules.push({
              EventTypeID: eventTypeId,
              RequirementMode: requirementMode,
              DataSource: requirementMode === 'REFERENCE' ? 'SOURCE_PROJECT' :
                requirementMode === 'NOT_REQUIRED' ? 'NONE' : 'NEW_EVENT',
              SequenceMode: sequence.value,
              EventOrder: sequence.value === 'STRICT' ?
                Number(row.querySelector('[data-field="event-order"]').value || 0) : 0,
              GroupKey: sequence.value === 'GROUPED' ?
                row.querySelector('[data-field="group-key"]').value.trim() : '',
              GroupOrder: sequence.value === 'GROUPED' ?
                Number(row.querySelector('[data-field="group-order"]').value || 0) : 0
            });
          });

          const saveButton = this;
          state.rulesSaving = true;
          saveButton.disabled = true;
          saveButton.textContent = 'در حال ذخیره...';
          try {
            await PMS.Api.put('/workflows/' + encodeURIComponent(workflowId) +
              '/steps/' + encodeURIComponent(stepId) + '/event-rules', { rules: payloadRules });
            invalidateCache(BOOTSTRAP_CACHE_KEY);
            closeModal(modalOverlay);
            showMessage('قواعد رویداد مرحله ذخیره شد.', 'success');
            await loadWorkflows();
          } catch (error) {
            const message = modalOverlay.querySelector('#workflow-rule-message');
            message.textContent = error.message || 'ذخیره قواعد ناموفق بود.';
            message.className = 'alert alert-danger';
            message.hidden = false;
          } finally {
            state.rulesSaving = false;
            if (saveButton.isConnected) {
              saveButton.disabled = false;
              saveButton.textContent = 'ذخیره قواعد';
            }
          }
        });
      }
    });

    try {
      if (!state.eventTypes.length) await loadEventTypes();
      const response = await PMS.Api.get('/workflows/' + encodeURIComponent(workflowId) +
        '/steps/' + encodeURIComponent(stepId) + '/event-rules');
      const data = PMS.Api.extractData(response) || {};
      loadedRules = Array.isArray(data.items) ? data.items :
        Array.isArray(data.rules) ? data.rules : [];
      if (loadedRules.length) {
        sequenceMode = String(loadedRules[0].SequenceMode || loadedRules[0].sequenceMode || 'STRICT').toUpperCase();
      }

      if (!overlay.isConnected) return;
      const loading = overlay.querySelector('#workflow-rule-loading');
      const editor = overlay.querySelector('#workflow-rule-editor');
      const rows = overlay.querySelector('#workflow-rule-rows');
      const sequence = overlay.querySelector('#workflow-rule-sequence');
      const addButton = overlay.querySelector('#workflow-rule-add');
      const saveButton = overlay.querySelector('#workflow-rule-save');
      const message = overlay.querySelector('#workflow-rule-message');

      sequence.value = sequenceMode;
      loadedRules.forEach(function(rule) { appendRuleRow(rows, rule, sequence.value); });
      sequence.addEventListener('change', function() {
        updateRuleSequenceVisibility(rows, sequence.value);
      });
      addButton.addEventListener('click', function() {
        appendRuleRow(rows, {}, sequence.value);
      });

      loading.hidden = true;
      editor.hidden = false;
      saveButton.disabled = false;
      if (!state.eventTypes.length) {
        message.textContent = 'فهرست انواع رویداد دریافت نشد؛ دسترسی یا تنظیمات انواع رویداد را بررسی کنید.';
        message.className = 'alert alert-warning';
        message.hidden = false;
      }
    } catch (error) {
      if (!overlay.isConnected) return;
      const loading = overlay.querySelector('#workflow-rule-loading');
      const message = overlay.querySelector('#workflow-rule-message');
      if (loading) loading.hidden = true;
      message.textContent = error.message || 'دریافت تنظیمات رویداد این مرحله ناموفق بود.';
      message.className = 'alert alert-danger';
      message.hidden = false;
    }
  }

  async function publishWorkflow(workflow) {
    const name = getName(workflow);
    if (!window.confirm('نسخه فعلی گردش‌کار «' + name + '» منتشر شود؟')) return;
    try {
      await PMS.Api.post('/workflows/' + encodeURIComponent(getId(workflow)) + '/publish', {});
      invalidateCache(CACHE_KEY);
      invalidateCache(BOOTSTRAP_CACHE_KEY);
      showMessage('نسخه گردش‌کار با موفقیت منتشر شد.', 'success');
      await loadWorkflows();
    } catch (error) {
      showMessage(error.message || 'انتشار گردش‌کار ناموفق بود.', 'danger');
    }
  }

  function openModal(config) {
    const oldModal = document.querySelector('.workflow-modal-overlay');

    if (oldModal) closeModal(oldModal);

    const previousFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay workflow-modal-overlay';
    overlay._pmsFocusReturn = previousFocus;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'workflow-dialog-title');

    modal.style.maxWidth = '760px';
    modal.style.width = 'calc(100% - 24px)';
    modal.style.maxHeight = '90vh';
    modal.style.overflowY = 'auto';

    modal.innerHTML = `
      <div class="modal-header"
           style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <h3 id="workflow-dialog-title" style="margin:0;font-size:18px">
          ${escapeHtml(config.title)}
        </h3>
        <button type="button"
                class="btn btn-light btn-sm"
                data-close-modal
                aria-label="بستن پنجره">✕</button>
      </div>
      <div class="modal-body">${config.content}</div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');

    overlay._pmsEscapeHandler = function (event) {
      if (event.key === 'Escape') {
        closeModal(overlay);
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = overlay.querySelector('[role="dialog"]');
      const focusable = dialog ? Array.from(dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(function (element) { return !element.hidden && element.getAttribute('aria-hidden') !== 'true'; }) : [];
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', overlay._pmsEscapeHandler);

    overlay.addEventListener('click', function (event) {
      if (
        event.target === overlay ||
        (event.target.closest &&
          event.target.closest('[data-close-modal]'))
      ) {
        closeModal(overlay);
      }
    });

    if (typeof config.onReady === 'function') {
      config.onReady(overlay);
    }

    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();

    return overlay;
  }

  function closeModal(overlay) {
    if (overlay && overlay._pmsEscapeHandler) {
      document.removeEventListener('keydown', overlay._pmsEscapeHandler);
    }
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }

    if (!document.querySelector('.modal-overlay')) {
      document.body.classList.remove('modal-open');
    }
    if (overlay && overlay._pmsFocusReturn && overlay._pmsFocusReturn.isConnected &&
        typeof overlay._pmsFocusReturn.focus === 'function') {
      overlay._pmsFocusReturn.focus();
    }
  }

  // ------------------------------------------
  // پیام‌ها و ابزارهای کمکی
  // ------------------------------------------

  function showFormMessage(overlay, selector, message, type) {
    const element = overlay.querySelector(selector);
    if (!element) return;

    element.className = 'alert alert-' + type;
    element.textContent = message;
    element.hidden = false;
  }

  function showMessage(message, type) {
    const old = document.getElementById('workflow-global-message');
    if (old) old.remove();

    const element = document.createElement('div');
    element.id = 'workflow-global-message';
    element.className = 'alert alert-' + type;
    element.textContent = message;
    element.style.marginBottom = '16px';

    const page = document.querySelector('.page-section');

    if (page) {
      page.insertBefore(element, page.firstChild);
    } else {
      document.body.appendChild(element);
    }

    window.setTimeout(function () {
      if (element.isConnected) element.remove();
    }, 5000);
  }

  function showError(message) {
    const element = document.getElementById('workflows-error');

    if (element) {
      element.textContent = message;
      element.hidden = false;
    } else {
      showMessage(message, 'danger');
    }
  }

  function setVisible(id, visible) {
    const element = document.getElementById(id);
    if (element) element.hidden = !visible;
  }

  function invalidateCache(key) {
    if (PMS.Api && typeof PMS.Api.invalidate === 'function') {
      PMS.Api.invalidate(key);
    } else if (PMS.Cache && typeof PMS.Cache.remove === 'function') {
      PMS.Cache.remove(key);
    }
  }

  function getStepCacheKey(workflowId) {
    return STEP_CACHE_PREFIX + '_' + workflowId;
  }

  function renderStatus(status) {
    const value = String(status || '').toUpperCase();

    if (value === 'ACTIVE' || value === 'فعال') {
      return '<span class="alert alert-success" style="display:inline-block;padding:3px 8px;margin:0">فعال</span>';
    }

    if (value === 'INACTIVE' || value === 'غیرفعال') {
      return '<span class="alert alert-warning" style="display:inline-block;padding:3px 8px;margin:0">غیرفعال</span>';
    }

    if (!value) {
      return '<span style="color:var(--color-text-muted)">-</span>';
    }

    return escapeHtml(status);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  // ------------------------------------------
  // ماژول عمومی
  // ------------------------------------------

  PMS.Workflows = {
    init: init,
    loadWorkflows: loadWorkflows,
    render: render,
    loadWorkflowSteps: loadWorkflowSteps
  };

  PMS.Modules = PMS.Modules || {};
  PMS.Modules.Workflows = PMS.Workflows;

  // The router owns page-module initialization. Dynamically injected scripts run
  // after DOMContentLoaded, so auto-init here plus Router.initPageModule()
  // caused duplicate workflow bootstrap and authorization requests.
})();
