(function () {
  'use strict';

  const CACHE_KEY = PMS.Cache.keys.EVENT_TYPES;

  const state = {
    eventTypes: [],
    search: '',
    selectedEventTypeId: null,
    selectedEventTypeName: '',
    departments: [],
    users: [],
    projectStatuses: [],
    configurationListsAvailable: {
      departments: true,
      users: true,
      projectStatuses: true
    },
    modalBusy: false
  };

  const CATEGORY_OPTIONS = [
    { value: 'PROCESS', label: 'فرآیند' },
    { value: 'MATERIAL', label: 'مواد' },
    { value: 'QUALITY', label: 'کیفیت' },
    { value: 'WAREHOUSE', label: 'انبار' },
    { value: 'ADMIN', label: 'اداری' },
    { value: 'SYSTEM', label: 'سیستم' }
  ];

  function init() {
    bindEvents();

    const cached = PMS.Cache.get(CACHE_KEY);

    if (cached !== null) {
      state.eventTypes = normalizeEventTypes(cached);
      render();
    }

    loadEventTypes();
  }

  function canManageEventTypes() {
    const router = window.PMS && window.PMS.Router;
    if (!router) return false;
    if (typeof router.isAdmin === 'function' && router.isAdmin()) return true;
    return Array.isArray(router.permissions) &&
      router.permissions.indexOf('EVENT_TYPE_MANAGE') !== -1;
  }

  function bindEvents() {
    const searchInput = document.getElementById('event-type-search');

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';

      searchInput.addEventListener('input', function (event) {
        state.search = event.target.value.trim().toLowerCase();
        render();
      });
    }

    const createButton = document.getElementById('event-type-create-button');

    if (createButton) {
      createButton.hidden = !canManageEventTypes();
      if (canManageEventTypes() && !createButton.dataset.bound) {
        createButton.dataset.bound = 'true';

        createButton.addEventListener('click', function () {
          openEventTypeForm(null);
        });
      }
    }
  }

  async function loadEventTypes() {
    const loading = document.getElementById('event-types-loading');
    const errorBox = document.getElementById('event-types-error');

    if (loading && state.eventTypes.length === 0) {
      loading.hidden = false;
    }

    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = '';
    }

    try {
      const result = await PMS.Api.getCached(
        '/event-types',
        CACHE_KEY,
        {
          onRefresh: function (data) {
            state.eventTypes = normalizeEventTypes(data);
            render();
          },
          onError: function (error) {
            console.warn('Event Types refresh failed:', error);
            showError(error, state.eventTypes.length > 0);
          }
        }
      );

      state.eventTypes = normalizeEventTypes(
        result && result.data !== undefined ? result.data : result
      );

      render();
    } catch (error) {
      console.error('Event Types loading failed:', error);

      if (state.eventTypes.length === 0) {
        showError(error, false);
      }
    } finally {
      if (loading) loading.hidden = true;
    }
  }

  function normalizeEventTypes(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.eventTypes)) return data.eventTypes;
    if (data && data.data) return normalizeEventTypes(data.data);
    return [];
  }

  function normalizeList(data, preferredKey) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;

    if (data && preferredKey && Array.isArray(data[preferredKey])) {
      return data[preferredKey];
    }

    if (data && data.data) {
      return normalizeList(data.data, preferredKey);
    }

    return [];
  }

  function normalizeArray(value) {
    if (Array.isArray(value)) {
      return value.map(String);
    }

    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch (error) {
        return value.split(',')
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean);
      }
    }

    return [];
  }

  function getId(item) {
    return item && (item.ID || item.id || item.UserID || item.DepartmentID) || '';
  }

  function getName(item) {
    return item && (
      item.Name ||
      item.name ||
      item.FullName ||
      item.fullName ||
      item.Title ||
      item.title
    ) || '';
  }

  function isActive(item) {
    return String(item && item.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
  }

  function isChecked(value) {
    return value === true || String(value).toLowerCase() === 'true';
  }

  function fieldValue(form, name) {
    const field = form.elements.namedItem(name);
    return field ? String(field.value || '') : '';
  }

  function fieldChecked(form, name) {
    const field = form.elements.namedItem(name);
    return Boolean(field && field.checked);
  }

  function setFieldValue(form, name, value) {
    const field = form.elements.namedItem(name);

    if (field) {
      field.value = value === undefined || value === null ? '' : value;
    }
  }

  function setFieldChecked(form, name, value) {
    const field = form.elements.namedItem(name);

    if (field) {
      field.checked = isChecked(value);
    }
  }

  function selectedValues(form, name) {
    const container = form.querySelector(
      '[data-check-group="' + name + '"]'
    );

    if (!container) return [];

    return Array.from(
      container.querySelectorAll('input[type="checkbox"]:checked')
    ).map(function (input) {
      return input.value;
    }).filter(Boolean);
  }

  function setSelectedCheckboxes(form, name, value) {
    const container = form.querySelector(
      '[data-check-group="' + name + '"]'
    );

    if (!container) return;

    const values = normalizeArray(value);

    container.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.checked = values.indexOf(String(input.value)) !== -1;
    });
  }

  function getFilteredEventTypes() {
    let result = state.eventTypes.slice();

    if (state.search) {
      result = result.filter(function (item) {
        const searchable = [
          item.ID,
          item.Name,
          item.name,
          item.Code,
          item.code,
          item.Description,
          item.description,
          item.Category,
          item.category,
          item.Status,
          item.status
        ].filter(Boolean).join(' ').toLowerCase();

        return searchable.indexOf(state.search) !== -1;
      });
    }

    return result;
  }

  function render() {
    const container = document.getElementById('event-types-table-container');
    const empty = document.getElementById('event-types-empty');

    if (!container) return;

    const eventTypes = getFilteredEventTypes();

    if (eventTypes.length === 0) {
      container.innerHTML = '';
      container.hidden = true;

      if (empty) {
        empty.hidden = false;
        empty.textContent = state.search
          ? 'نوع رویداد موردنظر پیدا نشد.'
          : 'نوع رویدادی برای نمایش وجود ندارد.';
      }

      return;
    }

    if (empty) empty.hidden = true;

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>نام نوع رویداد</th>';
    html += '<th>کد</th>';
    html += '<th>دسته‌بندی</th>';
    html += '<th>نسخه</th>';
    html += '<th>وضعیت</th>';
    html += '<th>فایل پیوست</th>';
    html += '<th>عملیات</th>';
    html += '</tr></thead><tbody>';

    eventTypes.forEach(function (item) {
      const id = getId(item);
      const name = getName(item) || '-';
      const code = item.Code || item.code || '-';
      const category = item.Category || item.category || '-';
      const version = item.Version || item.version || '-';
      const status = item.Status || item.status || '-';

      html += '<tr>';
      html += '<td>' + escapeHtml(name) + '</td>';
      html += '<td>' + escapeHtml(code) + '</td>';
      html += '<td>' + escapeHtml(categoryLabel(category)) + '</td>';
      html += '<td>' + escapeHtml(String(version)) + '</td>';
      html += '<td>' + renderStatus(status) + '</td>';
      html += '<td>' + (isChecked(item.AllowAttachments) ? 'مجاز' : 'غیرمجاز') + '</td>';
      html += '<td class="event-type-actions">';

      if (canManageEventTypes()) {
        html += '<button type="button" class="btn btn-sm btn-secondary event-type-edit" data-id="' +
          escapeAttribute(id) + '">ویرایش</button> ';

        html += '<button type="button" class="btn btn-sm btn-secondary event-type-forms" data-id="' +
          escapeAttribute(id) + '" data-name="' + escapeAttribute(name) +
          '">فرم‌های متصل</button> ';
        html += '<button type="button" class="btn btn-sm btn-secondary event-type-procurement" data-id="' +
          escapeAttribute(id) + '" data-name="' + escapeAttribute(name) +
          '">تنظیمات تأمین</button>';
      } else {
        html += '<span class="et-muted">فقط مشاهده</span>';
      }

      html += '</td></tr>';
    });

    html += '</tbody></table>';

    container.innerHTML = html;
    container.hidden = false;

    container.querySelectorAll('.event-type-edit').forEach(function (button) {
      button.addEventListener('click', function () {
        openEventTypeForm(button.dataset.id);
      });
    });

    container.querySelectorAll('.event-type-forms').forEach(function (button) {
      button.addEventListener('click', function () {
        openEventTypeForms(button.dataset.id, button.dataset.name);
      });
    });

    container.querySelectorAll('.event-type-procurement').forEach(function (button) {
      button.addEventListener('click', function () {
        openProcurementSettings(button.dataset.id, button.dataset.name);
      });
    });
  }

  async function loadConfigurationLists() {
    // These lists use different permissions. One denied endpoint must not
    // prevent the event-type form from opening for users who can manage types.
    const results = await Promise.allSettled([
      PMS.Api.get('/departments'),
      PMS.Api.get('/users'),
      PMS.Api.get('/project-statuses')
    ]);

    state.configurationListsAvailable = {
      departments: results[0].status === 'fulfilled',
      users: results[1].status === 'fulfilled',
      projectStatuses: results[2].status === 'fulfilled'
    };

    if (results[0].status === 'fulfilled') {
      const response = results[0].value;
      state.departments = normalizeList(
        response && response.data !== undefined ? response.data : response,
        'departments'
      );
    } else {
      console.warn('Event type form: departments list unavailable:', results[0].reason);
      state.departments = [];
    }

    if (results[1].status === 'fulfilled') {
      const response = results[1].value;
      state.users = normalizeList(
        response && response.data !== undefined ? response.data : response,
        'users'
      );
    } else {
      console.warn('Event type form: users list unavailable:', results[1].reason);
      state.users = [];
    }

    if (results[2].status === 'fulfilled') {
      const response = results[2].value;
      state.projectStatuses = normalizeList(
        response && response.data !== undefined ? response.data : response,
        'statuses'
      ).filter(isActive);
    } else {
      console.warn('Event type form: project statuses list unavailable:', results[2].reason);
      state.projectStatuses = [];
    }
  }

  function makeCheckboxGroup(name, items, selectedValuesList, labelFunction) {
    const selected = normalizeArray(selectedValuesList);

    if (!items.length) {
      return '<div class="et-check-empty">مورد فعالی برای انتخاب وجود ندارد.</div>';
    }

    return '<div class="et-check-grid" data-check-group="' +
      escapeAttribute(name) + '">' +
      items.map(function (item, index) {
        const id = getId(item);
        const label = labelFunction
          ? labelFunction(item)
          : getName(item);

        const checked = selected.indexOf(String(id)) !== -1;
        const inputId = 'et-check-' + name + '-' + index;

        return '<label class="et-check-item" for="' + escapeAttribute(inputId) + '">' +
          '<input type="checkbox" id="' + escapeAttribute(inputId) +
          '" value="' + escapeAttribute(id) + '"' +
          (checked ? ' checked' : '') + '>' +
          '<span>' + escapeHtml(label || id) + '</span>' +
          '</label>';
      }).join('') +
      '</div>';
  }

  function renderFormStyles() {
    return '<style>' +
      '.et-section{border:1px solid var(--color-border);border-radius:8px;padding:14px;margin:0 0 16px}' +
      '.et-section h4{margin:0 0 12px;font-size:15px}' +
      '.et-section-description{display:block;margin:-5px 0 12px;color:var(--color-text-secondary);line-height:1.8}' +
      '.et-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
      '.et-form-grid .form-group{margin:0;min-width:0}' +
      '.et-form-grid .et-full{grid-column:1/-1}' +
      '.et-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
      '.et-check-item{display:flex;align-items:center;gap:8px;border:1px solid var(--color-border);border-radius:6px;padding:9px;cursor:pointer;min-width:0}' +
      '.et-check-item input{flex:0 0 auto}' +
      '.et-check-item span{overflow-wrap:anywhere}' +
      '.et-check-empty{padding:10px;color:var(--color-text-muted)}' +
      '.et-inline-field{border:1px solid var(--color-border);border-radius:7px;padding:12px;margin-top:10px}' +
      '.et-inline-field h5{margin:0 0 12px}' +
      '.et-field-list{margin-top:10px}' +
      '.et-field-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px;border-bottom:1px solid var(--color-border-light)}' +
      '.et-field-row:last-child{border-bottom:0}' +
      '.et-field-row small{display:block;color:var(--color-text-muted);margin-top:4px}' +
      '.et-field-row-actions{display:flex;gap:6px;flex-wrap:wrap}' +
      '.et-muted{color:var(--color-text-muted);font-size:12px;line-height:1.8}' +
      '.et-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}' +
      '.et-check-actions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}' +
      '@media(max-width:650px){.et-form-grid,.et-check-grid{grid-template-columns:1fr}.et-field-row{align-items:flex-start;flex-direction:column}}' +
      '</style>';
  }

  async function openEventTypeForm(eventTypeId) {
    const editing = Boolean(eventTypeId);

    const item = editing
      ? state.eventTypes.find(function (entry) {
          return String(getId(entry)) === String(eventTypeId);
        })
      : null;

    if (editing && !item) {
      showMessage('نوع رویداد انتخاب‌شده پیدا نشد.');
      return;
    }

    const modal = createModal(
      editing ? 'ویرایش نوع رویداد' : 'ثبت نوع رویداد',
      'event-type-form-modal'
    );
    modal.body.innerHTML =
      '<div class="table-empty" role="status" aria-live="polite" style="padding:24px;text-align:center">' +
      '<span class="et-spinner" aria-hidden="true"></span>' +
      'در حال دریافت فهرست واحدها، کاربران و وضعیت‌های پروژه…' +
      '</div>';

    try {
      await loadConfigurationLists();
    } catch (error) {
      // Keep this guard for unexpected client-side errors; individual endpoint
      // failures are handled inside loadConfigurationLists.
      console.error('Configuration lists loading failed:', error);
    }

    if (!modal.overlay.isConnected) return;

    const activeDepartments = state.departments.filter(isActive);
    const activeUsers = state.users.filter(isActive);

    const categoryOptions = CATEGORY_OPTIONS.map(function (option) {
      return '<option value="' + escapeAttribute(option.value) + '">' +
        escapeHtml(option.label) + '</option>';
    }).join('');

    const departmentOptions =
      '<option value="">بدون انتخاب</option>' +
      activeDepartments.map(function (department) {
        return '<option value="' + escapeAttribute(getId(department)) + '">' +
          escapeHtml(getName(department)) + '</option>';
      }).join('');

    const targetDepartmentOptions =
      '<option value="">بدون انتقال خودکار</option>' +
      activeDepartments.map(function (department) {
        return '<option value="' + escapeAttribute(getId(department)) + '">' +
          escapeHtml(getName(department)) + '</option>';
      }).join('');

    const projectStatusOptions =
      '<option value="">بدون تغییر وضعیت پروژه</option>' +
      state.projectStatuses.map(function (projectStatus) {
        const code = projectStatus.Code || projectStatus.code || '';
        const name = getName(projectStatus) || code;

        return '<option value="' + escapeAttribute(code) + '">' +
          escapeHtml(name) + '</option>';
      }).join('');

    const status = item && item.Status || 'ACTIVE';

    modal.body.innerHTML = renderFormStyles() +
      '<form id="event-type-form">' +

        '<section class="et-section">' +
          '<h4>۱. اطلاعات پایه</h4>' +
          '<div class="et-form-grid">' +

            '<div class="form-group">' +
              '<label for="et-name">نام نوع رویداد *</label>' +
              '<input id="et-name" name="Name" required maxlength="150">' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-code">کد نوع رویداد *</label>' +
              '<input id="et-code" name="Code" required maxlength="100">' +
            '</div>' +

            '<div class="form-group et-full">' +
              '<label for="et-description">توضیحات</label>' +
              '<textarea id="et-description" name="Description" rows="3"></textarea>' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-category">دسته‌بندی</label>' +
              '<select id="et-category" name="Category">' +
                '<option value="">انتخاب دسته‌بندی</option>' +
                categoryOptions +
              '</select>' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-connection-type">ارتباط با پروژه</label>' +
              '<select id="et-connection-type" name="ConnectionType">' +
                '<option value="PROJECT">مرتبط با پروژه</option>' +
                '<option value="INDEPENDENT">مستقل از پروژه</option>' +
              '</select>' +
              '<small class="et-muted">برای سفارش پارچه و رویدادهای انبار ملزومات، مستقل را انتخاب کن؛ برای مراحل طراحی و نمونه‌دوزی نیز پروژه را انتخاب کن.</small>' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-department">بخش مرتبط</label>' +
              '<select id="et-department" name="DepartmentID">' +
                departmentOptions +
              '</select>' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-version">نسخه</label>' +
              '<input id="et-version" name="Version" type="number" min="1" step="1">' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-status">وضعیت نوع رویداد</label>' +
              '<select id="et-status" name="Status">' +
                '<option value="ACTIVE">فعال</option>' +
                '<option value="INACTIVE">غیرفعال</option>' +
              '</select>' +
            '</div>' +

          '</div>' +
        '</section>' +

        '<section class="et-section" id="et-project-settings">' +
          '<h4>۲. تنظیمات گردش پروژه</h4>' +
          '<span class="et-section-description">مشخص کن پس از ثبت این رویداد، پروژه به کدام واحد منتقل شود و وضعیت آن تغییر کند یا نه.</span>' +
          '<div class="form-group et-full"><label style="display:block;padding:12px;border:1px solid var(--color-border);border-radius:8px"><input name="AllowOnDraft" type="checkbox"> اجازه ثبت این رویداد پیش از تکمیل مشخصات پایه پروژه</label><small class="et-muted">فقط برای رویدادهای مرتبط با پروژه. فعال‌سازی این گزینه پروژه را خودکار تکمیل نمی‌کند؛ مقدار پیش‌فرض خاموش است.</small></div>' +

          '<div class="et-form-grid">' +

            '<div class="form-group">' +
              '<label for="et-target-department">واحد مقصد پس از رویداد</label>' +
              '<select id="et-target-department" name="TargetDepartmentID">' +
                targetDepartmentOptions +
              '</select>' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="et-target-status">وضعیت کلی پروژه پس از رویداد</label>' +
              '<select id="et-target-status" name="TargetProjectStatus">' +
                projectStatusOptions +
              '</select>' +
            '</div>' +

            '<div class="form-group">' +
  '<label for="et-target-step-status">وضعیت کار در مرحله پس از رویداد</label>' +
  '<input id="et-target-step-status" name="TargetStepStatus" maxlength="100" placeholder="مثلاً فعال در الگوسازی">' +
  '<small class="et-muted">این وضعیت مستقل از وضعیت کلی پروژه ذخیره می‌شود.</small>' +
'</div>' +

'<div class="form-group et-full">' +
              '<label>' +
                '<input id="et-moves" name="MovesProjectToStep" type="checkbox">' +
                ' این رویداد پروژه را به مرحله دیگری منتقل می‌کند' +
              '</label>' +
              '<small class="et-muted">این گزینه قدیمی حفظ شده تا تنظیمات قبلی نوع رویداد از بین نرود.</small>' +
            '</div>' +
            '<div class="form-group et-full">' +
              '<label style="display:block;padding:12px;border:1px solid var(--border-color, #d0d7de);border-radius:8px"><input name="IsWorkCompletion" type="checkbox"> این رویداد پایان کار واحد/کاربر را مشخص می‌کند</label>' +
              '<small class="et-muted">با ثبت این نوع رویداد، پروژه برای واحد یا کاربر مربوطه در بخش «اتمام کار شده» قرار می‌گیرد؛ وضعیت واحدهای دیگر مستقل می‌ماند.</small>' +
            '</div>' +
            '<div class="form-group et-full">' +
              '<strong>مقدار تولید/تحویل</strong>' +
              '<label style="display:block;margin-top:8px"><input name="TrackVariantQuantity" type="checkbox"> مقدار تولید/تحویل در این رویداد ثبت شود</label>' +
              '<small class="et-muted">در صورت فعال‌سازی، هنگام ثبت رویداد فقط مقدار عددی دریافت می‌شود. این مقدار در خلاصه تجمعی برش محاسبه خواهد شد.</small>' +
            '</div>' +

          '</div>' +
        '</section>' +
        '<section class="et-section">' +
          '<h4>۳. دسترسی به ثبت رویداد</h4>' +

          '<div class="form-group">' +
            '<label>واحدهای مجاز به ثبت این رویداد</label>' +
            makeCheckboxGroup(
              'AllowedDepartmentIDs',
              activeDepartments,
              item && item.AllowedDepartmentIDs
            ) +
            '<small class="et-muted">اگر هیچ واحدی انتخاب نشود، محدودیت واحدی تعریف نشده است.</small>' +
            '<div class="et-check-actions">' +
              '<button type="button" class="btn btn-sm btn-secondary" data-check-all="AllowedDepartmentIDs">انتخاب همه واحدها</button>' +
              '<button type="button" class="btn btn-sm btn-secondary" data-check-none="AllowedDepartmentIDs">پاک کردن انتخاب</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>کاربران مجاز به ثبت این رویداد</label>' +
            makeCheckboxGroup(
              'AllowedUserIDs',
              activeUsers,
              item && item.AllowedUserIDs,
              function (user) {
                return getName(user) ||
                  user.Username ||
                  user.username ||
                  getId(user);
              }
            ) +
            '<small class="et-muted">اگر هیچ کاربری انتخاب نشود، محدودیت کاربری تعریف نشده است.</small>' +
            '<div class="et-check-actions">' +
              '<button type="button" class="btn btn-sm btn-secondary" data-check-all="AllowedUserIDs">انتخاب همه کاربران</button>' +
              '<button type="button" class="btn btn-sm btn-secondary" data-check-none="AllowedUserIDs">پاک کردن انتخاب</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>واحدهایی که پس از ثبت رویداد به پروژه دسترسی دارند</label>' +
            makeCheckboxGroup(
              'AvailableDepartmentIDs',
              activeDepartments,
              item && item.AvailableDepartmentIDs
            ) +
            '<small class="et-muted">این تنظیم مشخص می‌کند پروژه پس از ثبت رویداد برای کدام واحدها در دسترس باشد.</small>' +
            '<div class="et-check-actions">' +
              '<button type="button" class="btn btn-sm btn-secondary" data-check-all="AvailableDepartmentIDs">انتخاب همه واحدها</button>' +
              '<button type="button" class="btn btn-sm btn-secondary" data-check-none="AvailableDepartmentIDs">پاک کردن انتخاب</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<section class="et-section">' +
          '<h4>۴. فایل پیوست و ابطال</h4>' +

          '<div class="form-group">' +
            '<label>' +
              '<input id="et-attachments" name="AllowAttachments" type="checkbox">' +
              ' اجازه افزودن فایل پیوست' +
            '</label>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>' +
              '<input id="et-allow-void" name="AllowVoid" type="checkbox">' +
              ' اجازه ابطال این نوع رویداد' +
            '</label>' +
            '<small class="et-muted">مجوز نهایی ابطال باید در بک‌اند نیز بررسی شود؛ از جمله بررسی وجود رویدادهای بعدی.</small>' +
          '</div>' +
        '</section>' +

        '<section class="et-section" id="et-form-settings">' +
          '<h4>۵. فرم‌های متصل به این رویداد</h4>' +
          '<span class="et-section-description">فرم‌هایی را انتخاب کن که هنگام ثبت این نوع رویداد برای کاربر نمایش داده شوند. می‌توانی تکمیل هر فرم را اجباری یا اختیاری کنی.</span>' +
          '<div class="et-form-grid">' +
            '<div class="form-group">' +
              '<label for="et-form-select">انتخاب فرم</label>' +
              '<select id="et-form-select"><option value="">در حال دریافت فرم‌ها...</option></select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label><input id="et-form-required" type="checkbox" checked> تکمیل فرم اجباری باشد</label>' +
            '</div>' +
            '<div class="form-group et-full">' +
              '<button type="button" class="btn btn-secondary" id="et-form-attach">افزودن فرم به رویداد</button>' +
            '</div>' +
          '</div>' +
          '<div id="et-form-mappings" class="et-field-list"><p class="et-muted">در حال دریافت اتصال‌ها...</p></div>' +
        '</section>' +

        '<section class="et-section" id="et-amendment-settings">' +
          '<h4>۶. تنظیمات اصلاح فرم‌های ثبت‌شده</h4>' +
          '<div class="form-group"><label><input id="et-is-form-amendment" name="IsFormAmendment" type="checkbox"> این رویداد برای اصلاح فرم ثبت‌شده است</label>' +
          '<small class="et-muted">با فعال‌کردن این گزینه، فرم‌های مجاز را مشخص کن. نام و کد نوع رویداد دیگر نقشی در تشخیص اصلاحیه ندارند.</small></div>' +
          '<div id="et-amendable-form-list" class="et-check-grid" hidden><p class="et-muted">در حال دریافت فرم‌ها...</p></div>' +
        '</section>' +

        '<div class="modal-actions">' +
          '<button type="submit" class="btn btn-primary">' +
            (editing ? 'ذخیره تغییرات' : 'ثبت نوع رویداد') +
          '</button>' +
          '<button type="button" class="btn btn-secondary" id="et-cancel">انصراف</button>' +
        '</div>' +

      '</form>';

    const form = modal.body.querySelector('#event-type-form');

    if (item) {
      // Preserve saved selections even when the current user cannot read the
      // corresponding lookup list. Otherwise a save could silently clear them.
      [
        ['DepartmentID', item.DepartmentID, state.departments],
        ['TargetDepartmentID', item.TargetDepartmentID, state.departments]
      ].forEach(function (entry) {
        const field = form.elements.namedItem(entry[0]);
        const value = String(entry[1] || '');
        if (!field || !value) return;
        if (!Array.from(field.options).some(function (option) {
          return String(option.value) === value;
        })) {
          const option = document.createElement('option');
          option.value = value;
          const matched = entry[2].find(function (lookup) {
            return String(getId(lookup)) === value;
          });
          option.textContent = getName(matched) || value + ' (ذخیره‌شده)';
          field.appendChild(option);
        }
      });

      const statusField = form.elements.namedItem('TargetProjectStatus');
      const savedStatus = String(item.TargetProjectStatus || '');
      if (statusField && savedStatus && !Array.from(statusField.options).some(function (option) {
        return String(option.value) === savedStatus;
      })) {
        const option = document.createElement('option');
        option.value = savedStatus;
        option.textContent = savedStatus + ' (ذخیره‌شده)';
        statusField.appendChild(option);
      }

      setFieldValue(form, 'Name', item.Name);
      setFieldValue(form, 'Code', item.Code);
      setFieldValue(form, 'Description', item.Description);
      setFieldValue(form, 'Category', item.Category);
      setFieldValue(form, 'DepartmentID', item.DepartmentID);
      setFieldValue(form, 'ConnectionType', item.ConnectionType || 'PROJECT');
      setFieldValue(form, 'Version', item.Version || 1);
      setFieldValue(form, 'Status', status);
      setFieldValue(form, 'TargetDepartmentID', item.TargetDepartmentID);
      setFieldValue(form, 'TargetProjectStatus', item.TargetProjectStatus);
      setFieldValue(form, 'TargetStepStatus', item.TargetStepStatus);
      setFieldChecked(form, 'AllowAttachments', item.AllowAttachments);
      setFieldChecked(form, 'MovesProjectToStep', item.MovesProjectToStep);
      setFieldChecked(form, 'AllowVoid', item.AllowVoid);
      setFieldChecked(form, 'TrackVariantQuantity', item.TrackVariantQuantity);
      setFieldChecked(form, 'IsWorkCompletion', item.IsWorkCompletion);
      setFieldChecked(form, 'AllowOnDraft', item.AllowOnDraft);
      setFieldChecked(form, 'IsFormAmendment', item.IsFormAmendment);

      setSelectedCheckboxes(form, 'AllowedDepartmentIDs', item.AllowedDepartmentIDs);
      setSelectedCheckboxes(form, 'AllowedUserIDs', item.AllowedUserIDs);
      setSelectedCheckboxes(form, 'AvailableDepartmentIDs', item.AvailableDepartmentIDs);
    } else {
      setFieldValue(form, 'Version', 1);
    }

    form.querySelector('#et-cancel').addEventListener('click', modal.close);

    const eventFormSelect = form.querySelector('#et-form-select');
    const eventFormMappingsBox = form.querySelector('#et-form-mappings');
    const eventFormAttachButton = form.querySelector('#et-form-attach');
    const eventFormRequiredInput = form.querySelector('#et-form-required');
    let activeReusableForms = [];
    let savedEventFormMappings = [];
    const pendingEventForms = [];

    function unwrapEventFormResponse(value) {
      return value && value.data !== undefined ? value.data : value;
    }

    function renderEventFormMappings() {
      const rows = editing ? savedEventFormMappings : pendingEventForms;
      if (!rows.length) {
        eventFormMappingsBox.innerHTML = '<p class="et-muted">هنوز فرمی برای این رویداد انتخاب نشده است.</p>';
        return;
      }
      eventFormMappingsBox.innerHTML = rows.map(function (mapping, index) {
        const linkedForm = mapping.Form || {};
        const formName = linkedForm.Name || linkedForm.Code || mapping.FormName || mapping.FormID;
        const required = isChecked(mapping.IsRequired);
        const mappingId = mapping.ID || '';
        return '<div class="et-field-row"><span>' + escapeHtml(formName || 'فرم') +
          ' · ' + (required ? 'اجباری' : 'اختیاری') + '</span>' +
          '<button type="button" class="btn btn-sm btn-secondary" data-remove-event-form="' +
          escapeAttribute(editing ? mappingId : String(index)) + '">قطع اتصال</button></div>';
      }).join('');
      eventFormMappingsBox.querySelectorAll('[data-remove-event-form]').forEach(function (button) {
        button.addEventListener('click', async function () {
          if (editing) {
            if (!button.dataset.removeEventForm) return;
            button.disabled = true;
            try {
              await PMS.Api.delete('/event-type-forms/' + encodeURIComponent(button.dataset.removeEventForm));
              await refreshEventFormMappings();
            } catch (error) {
              button.disabled = false;
              showMessage(error.message || 'قطع اتصال فرم ناموفق بود.');
            }
          } else {
            pendingEventForms.splice(Number(button.dataset.removeEventForm), 1);
            renderEventFormMappings();
          }
        });
      });
    }

    async function refreshEventFormMappings() {
      if (!editing) {
        renderEventFormMappings();
        return;
      }
      const response = await PMS.Api.get('/event-types/' + encodeURIComponent(eventTypeId) + '/forms');
      savedEventFormMappings = normalizeList(unwrapEventFormResponse(response), 'eventTypes');
      renderEventFormMappings();
    }

    async function loadEventFormOptions() {
      try {
        const response = await PMS.Api.get('/forms');
        const formsData = unwrapEventFormResponse(response);
        activeReusableForms = normalizeList(formsData, 'forms').filter(function (reusableForm) {
          return String(reusableForm.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
        });
        eventFormSelect.innerHTML = '<option value="">انتخاب فرم</option>' +
          activeReusableForms.map(function (reusableForm) {
            return '<option value="' + escapeAttribute(getId(reusableForm)) + '">' +
              escapeHtml(getName(reusableForm) || reusableForm.Code || getId(reusableForm)) + '</option>';
          }).join('');
        renderAmendableForms();
        await refreshEventFormMappings();
        if (!activeReusableForms.length) {
          eventFormSelect.innerHTML = '<option value="">ابتدا از بخش مدیریت فرم‌ها یک فرم فعال بساز</option>';
          eventFormAttachButton.disabled = true;
        }
      } catch (error) {
        eventFormSelect.innerHTML = '<option value="">دریافت فهرست فرم‌ها ناموفق بود</option>';
        eventFormAttachButton.disabled = true;
        eventFormMappingsBox.innerHTML = '<p class="et-muted">دریافت فرم‌ها یا اتصال‌های قبلی ناموفق بود. فرم را ذخیره کن و دوباره وارد ویرایش شو.</p>';
        console.warn('Event type form mappings could not be loaded:', error);
      }
    }

    eventFormAttachButton.addEventListener('click', async function () {
      const formId = eventFormSelect.value;
      if (!formId) {
        showMessage('ابتدا یک فرم را انتخاب کن.');
        return;
      }
      const alreadyLinked = (editing ? savedEventFormMappings : pendingEventForms)
        .some(function (mapping) { return String(mapping.FormID) === String(formId); });
      if (alreadyLinked) {
        showMessage('این فرم قبلاً به رویداد متصل شده است.');
        return;
      }
      const reusableForm = activeReusableForms.find(function (entry) {
        return String(getId(entry)) === String(formId);
      });
      const required = eventFormRequiredInput.checked;
      if (!editing) {
        pendingEventForms.push({
          FormID: formId,
          FormName: getName(reusableForm) || (reusableForm && reusableForm.Code) || formId,
          IsRequired: required
        });
        renderEventFormMappings();
        eventFormSelect.value = '';
        return;
      }
      eventFormAttachButton.disabled = true;
      try {
        await PMS.Api.post('/event-types/' + encodeURIComponent(eventTypeId) + '/forms', {
          FormID: formId,
          IsRequired: required
        });
        eventFormSelect.value = '';
        await refreshEventFormMappings();
      } catch (error) {
        showMessage(error.message || 'اتصال فرم ناموفق بود.');
      } finally {
        eventFormAttachButton.disabled = false;
      }
    });

    loadEventFormOptions();

    const amendmentEnabledInput = form.querySelector('#et-is-form-amendment');
    const amendableFormList = form.querySelector('#et-amendable-form-list');
    function renderAmendableForms() {
      if (!amendableFormList) return;
      const selected = new Set(normalizeArray(item && item.AmendableFormIDs).map(String));
      const html = activeReusableForms.map(function(reusableForm) {
        const id = String(getId(reusableForm));
        const checked = selected.has(id) ? ' checked' : '';
        return '<label class="et-amendable-form-option"><input type="checkbox" name="AmendableFormIDs" value="' +
          escapeAttribute(id) + '"' + checked + '> ' +
          escapeHtml(getName(reusableForm) || reusableForm.Code || id) + '</label>';
      }).join('');
      amendableFormList.innerHTML = html || '<p class="et-muted">فرم فعال برای انتخاب وجود ندارد.</p>';
      amendableFormList.hidden = !amendmentEnabledInput.checked;
    }
    amendmentEnabledInput.addEventListener('change', function() {
      amendableFormList.hidden = !amendmentEnabledInput.checked;
      if (amendmentEnabledInput.checked && connectionTypeField.value !== 'PROJECT') {
        connectionTypeField.value = 'PROJECT';
        refreshConnectionTypeSettings();
      }
    });
    
        const connectionTypeField = form.elements.namedItem('ConnectionType');
    const projectSettingsSection = form.querySelector('#et-project-settings');
    const eventFormSettingsSection = form.querySelector('#et-form-settings');
    const refreshConnectionTypeSettings = function () {
      const isIndependent = connectionTypeField.value === 'INDEPENDENT';
      projectSettingsSection.hidden = isIndependent;
      eventFormSettingsSection.hidden = isIndependent;
      if (isIndependent) {
        setFieldChecked(form, 'AllowOnDraft', false);
        setFieldChecked(form, 'IsFormAmendment', false);
      }
      amendableFormList.hidden = isIndependent || !amendmentEnabledInput.checked;
    };
    connectionTypeField.addEventListener('change', refreshConnectionTypeSettings);
    refreshConnectionTypeSettings();

    form.querySelectorAll('[data-check-all]').forEach(function (button) {
      button.addEventListener('click', function () {
        const groupName = button.dataset.checkAll;
        const group = form.querySelector(
          '[data-check-group="' + groupName + '"]'
        );

        if (!group) return;

        group.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
          input.checked = true;
        });
      });
    });

    form.querySelectorAll('[data-check-none]').forEach(function (button) {
      button.addEventListener('click', function () {
        const groupName = button.dataset.checkNone;
        const group = form.querySelector(
          '[data-check-group="' + groupName + '"]'
        );

        if (!group) return;

        group.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
          input.checked = false;
        });
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (state.modalBusy) return;

      const saveButton = form.querySelector('[type="submit"]');

      const payload = {
        Name: fieldValue(form, 'Name').trim(),
        Code: fieldValue(form, 'Code').trim(),
        Description: fieldValue(form, 'Description').trim(),
        Category: fieldValue(form, 'Category'),
        ConnectionType: fieldValue(form, 'ConnectionType') || 'PROJECT',
        DepartmentID: fieldValue(form, 'DepartmentID'),
        Version: Number(fieldValue(form, 'Version') || 1),
        Status: fieldValue(form, 'Status'),
        TargetDepartmentID: fieldValue(form, 'TargetDepartmentID'),
        TargetProjectStatus: fieldValue(form, 'TargetProjectStatus'),
        TargetStepStatus: fieldValue(form, 'TargetStepStatus').trim(),
        AllowedDepartmentIDs: form.querySelector('[data-check-group="AllowedDepartmentIDs"]')
          ? selectedValues(form, 'AllowedDepartmentIDs')
          : (editing ? normalizeArray(item && item.AllowedDepartmentIDs) : []),
        AllowedUserIDs: form.querySelector('[data-check-group="AllowedUserIDs"]')
          ? selectedValues(form, 'AllowedUserIDs')
          : (editing ? normalizeArray(item && item.AllowedUserIDs) : []),
        AvailableDepartmentIDs: form.querySelector('[data-check-group="AvailableDepartmentIDs"]')
          ? selectedValues(form, 'AvailableDepartmentIDs')
          : (editing ? normalizeArray(item && item.AvailableDepartmentIDs) : []),
        AllowAttachments: fieldChecked(form, 'AllowAttachments'),
        MovesProjectToStep: fieldChecked(form, 'MovesProjectToStep'),
        AllowVoid: fieldChecked(form, 'AllowVoid'),
        TrackVariantQuantity: fieldChecked(form, 'TrackVariantQuantity'),
        IsWorkCompletion: fieldChecked(form, 'IsWorkCompletion'),
        AllowOnDraft: fieldChecked(form, 'AllowOnDraft'),
        IsFormAmendment: fieldChecked(form, 'IsFormAmendment'),
        AmendableFormIDs: fieldChecked(form, 'IsFormAmendment') ? Array.from(form.querySelectorAll('input[name="AmendableFormIDs"]:checked')).map(function(input) { return input.value; }) : []
      };

      if (!payload.Name || !payload.Code) {
        showMessage('نام و کد نوع رویداد الزامی است.');
        return;
      }
      if (payload.ConnectionType === 'INDEPENDENT' && pendingEventForms.length) {
        showMessage('فرم‌های متصل فقط برای رویدادهای مرتبط با پروژه قابل انتخاب هستند.');
        return;
      }

      if (payload.ConnectionType === 'INDEPENDENT' && payload.TrackVariantQuantity) {
        showMessage('ثبت مقدار تولید/تحویل فقط برای رویدادهای متصل به پروژه امکان‌پذیر است.');
        return;
      }

      if (!Number.isFinite(payload.Version) || payload.Version < 1) {
        showMessage('نسخه باید عددی برابر یا بزرگ‌تر از ۱ باشد.');
        return;
      }

      if (payload.TargetProjectStatus) {
        const statusExists = state.projectStatuses.some(function (projectStatus) {
          return String(projectStatus.Code || projectStatus.code || '') ===
            String(payload.TargetProjectStatus);
        });

        if (!statusExists) {
          showMessage('وضعیت انتخاب‌شده معتبر یا فعال نیست. فهرست وضعیت‌ها را دوباره بارگذاری کن.');
          return;
        }
      }

      state.modalBusy = true;
      setButtonBusy(saveButton, true, 'در حال ذخیره...');

      try {
        if (editing) {
          await PMS.Api.put(
            '/event-types/' + encodeURIComponent(eventTypeId),
            payload
          );

          invalidateEventTypeCaches();
          await loadEventTypes();

          showMessage('تنظیمات نوع رویداد ذخیره شد.');
        } else {
          await PMS.Api.post('/event-types', payload);

          invalidateEventTypeCaches();
          await loadEventTypes();

          const created = state.eventTypes.find(function (entry) {
            return String(entry.Code || entry.code || '') === String(payload.Code);
          });

          const createdId = created && getId(created);

          if (createdId) {
            try {
              for (const mapping of pendingEventForms) {
                await PMS.Api.post('/event-types/' + encodeURIComponent(createdId) + '/forms', {
                  FormID: mapping.FormID,
                  IsRequired: mapping.IsRequired
                });
              }
              showMessage(pendingEventForms.length
                ? 'نوع رویداد و فرم‌های انتخاب‌شده با موفقیت ثبت شدند.'
                : 'نوع رویداد ثبت شد.');
            } catch (mappingError) {
              showMessage('نوع رویداد ثبت شد، اما اتصال یکی از فرم‌ها انجام نشد. از ویرایش نوع رویداد دوباره تلاش کن. ' +
                (mappingError.message || ''));
            }
            modal.close();
            await openEventTypeForm(createdId);
          } else {
            modal.close();

            showMessage(
              'نوع رویداد ثبت شد.'
            );
          }
        }
      } catch (error) {
        console.error('Saving event type failed:', error, error && error.response);
        const details = error && error.response && error.response.error &&
          error.response.error.message;
        showMessage(details || error.message || 'ذخیره نوع رویداد ناموفق بود.');
      } finally {
        state.modalBusy = false;
        setButtonBusy(saveButton, false);
      }
    });
  }

  async function openEventTypeForms(eventTypeId, eventTypeName) {
    const modal = createModal('فرم‌های متصل: ' + (eventTypeName || ''), 'event-type-forms-modal');
    modal.body.innerHTML = '<div class="table-empty">در حال دریافت فرم‌ها...</div>';
    function unwrap(value) { return value && value.data !== undefined ? value.data : value; }
    async function refresh() {
      const results = await Promise.all([
        PMS.Api.get('/forms'),
        PMS.Api.get('/event-types/' + encodeURIComponent(eventTypeId) + '/forms')
      ]);
      const formsData = unwrap(results[0]);
      const mappingData = unwrap(results[1]);
      const forms = Array.isArray(formsData) ? formsData : [];
      const mappings = Array.isArray(mappingData) ? mappingData : [];
      const activeForms = forms.filter(function(form) { return String(form.Status || 'ACTIVE') === 'ACTIVE'; });
      const available = activeForms.filter(function(form) {
        return !mappings.some(function(mapping) { return String(mapping.FormID) === String(form.ID); });
      });
      modal.body.innerHTML =
        '<p class="form-help">فرم‌های متصل هنگام ثبت همین نوع رویداد در فرم اصلی ثبت رویداد نمایش داده می‌شوند.</p>' +
        '<form id="event-type-form-attach" class="form-grid">' +
        '<label class="form-group"><span>انتخاب فرم</span><select name="FormID" required><option value="">انتخاب کنید</option>' +
        available.map(function(form) { return '<option value="' + escapeAttribute(form.ID) + '">' + escapeHtml(form.Name || form.Code) + '</option>'; }).join('') +
        '</select></label><label class="form-group"><span><input type="checkbox" name="IsRequired" checked> تکمیل فرم اجباری باشد</span></label>' +
        '<div class="modal-actions"><button type="submit" class="btn btn-primary"' + (available.length ? '' : ' disabled') + '>اتصال فرم</button></div></form>' +
        '<h4>فرم‌های فعلی</h4><div id="event-type-form-mappings"></div>' +
        (!activeForms.length ? '<p class="form-help">هنوز فرمی تعریف نشده است. <a href="#forms">ایجاد فرم جدید</a></p>' : '');
      const list = modal.body.querySelector('#event-type-form-mappings');
      list.innerHTML = mappings.length ? mappings.map(function(mapping) {
        const form = mapping.Form || {};
        return '<div class="et-field-row"><span>' + escapeHtml(form.Name || form.Code || mapping.FormID) +
          ' · ' + ((mapping.IsRequired === true || String(mapping.IsRequired).toLowerCase() === 'true') ? 'اجباری' : 'اختیاری') +
          '</span><button type="button" class="btn btn-sm btn-secondary" data-unlink="' + escapeAttribute(mapping.ID) + '">قطع اتصال</button></div>';
      }).join('') : '<p class="form-help">هیچ فرمی به این نوع رویداد متصل نیست.</p>';
      list.querySelectorAll('[data-unlink]').forEach(function(button) {
        button.addEventListener('click', async function() {
          try {
            await PMS.Api.delete('/event-type-forms/' + encodeURIComponent(button.dataset.unlink));
            await refresh();
          } catch(error) { showMessage(error.message || 'قطع اتصال فرم ناموفق بود.'); }
        });
      });
      const attach = modal.body.querySelector('#event-type-form-attach');
      attach.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (!attach.elements.FormID.value) return;
        try {
          await PMS.Api.post('/event-types/' + encodeURIComponent(eventTypeId) + '/forms', {
            FormID: attach.elements.FormID.value,
            IsRequired: attach.elements.IsRequired.checked
          });
          await refresh();
        } catch(error) { showMessage(error.message || 'اتصال فرم ناموفق بود.'); }
      });
    }
    try { await refresh(); }
    catch(error) { modal.body.innerHTML = '<div class="alert alert-danger">' + escapeHtml(error.message || 'دریافت فرم‌های متصل ناموفق بود.') + '</div>'; }
  }

  async function openProcurementSettings(eventTypeId, eventTypeName) {
    const modal = createModal('تنظیمات تأمین: ' + (eventTypeName || ''), 'event-type-procurement-modal');
    modal.body.innerHTML = '<div class="table-empty">در حال دریافت تنظیمات...</div>';

    function unwrap(value) {
      return value && value.data !== undefined ? value.data : value;
    }

    try {
      const results = await Promise.all([
        PMS.Api.get('/event-types/' + encodeURIComponent(eventTypeId) + '/procurement'),
        PMS.Api.get('/information-types')
      ]);
      const settings = unwrap(results[0]) || {};
      const allTypes = normalizeList(unwrap(results[1]), 'informationTypes');
      const numericTypes = allTypes.filter(function (type) {
        return isActive(type) &&
          String(type.DataType || '').toLowerCase() === 'number' &&
          String(type.Cardinality || 'SINGLE').toUpperCase() === 'SINGLE';
      });
      const selectedTypeId = String(settings.ConfirmedQuantityInformationTypeID || '');
      const action = String(settings.Action || 'NONE').toUpperCase();

      modal.body.innerHTML =
        '<p class="form-help">برای محاسبه نیاز قطعی ملزومات، تعداد تأییدشده از اطلاعات مرکزی پروژه و فرم متصل به همین رویداد خوانده می‌شود. ثبت سفارش خرید و رسید از مسیر مستقل تأمین انجام می‌شود.</p>' +
        '<form id="event-type-procurement-form">' +
        '<label class="form-group"><span>عملیات تأمین</span><select class="form-control" name="Action">' +
        '<option value="NONE">بدون عملیات تأمین</option>' +
        '<option value="RECALCULATE_CONFIRMED_NEEDS">محاسبه نیاز قطعی از تعداد تأییدشده</option>' +
        '</select></label>' +
        '<label class="form-group" id="confirmed-quantity-type-group"><span>نوع اطلاعات مرکزی تعداد قطعی تأییدشده</span>' +
        '<select class="form-control" name="ConfirmedQuantityInformationTypeID">' +
        '<option value="">انتخاب نوع اطلاعات عددی</option>' +
        numericTypes.map(function (type) {
          const id = String(getId(type));
          return '<option value="' + escapeAttribute(id) + '"' +
            (id === selectedTypeId ? ' selected' : '') + '>' +
            escapeHtml((type.Name || type.Code || id) + ' (' + (type.Code || id) + ')') +
            '</option>';
        }).join('') +
        '</select><small class="et-muted">این نوع اطلاعات باید در فرم متصل به رویداد قرار گرفته باشد.</small></label>' +
        (numericTypes.length ? '' : '<p class="alert alert-warning">هیچ نوع اطلاعات مرکزی عددی و تک‌مقداری فعالی برای انتخاب وجود ندارد. ابتدا نوع اطلاعات را در بخش اطلاعات مرکزی تعریف کنید.</p>') +
        '<div class="modal-actions"><button type="submit" class="btn btn-primary">ذخیره تنظیمات</button></div></form>';

      const form = modal.body.querySelector('#event-type-procurement-form');
      const actionInput = form.elements.namedItem('Action');
      const typeInput = form.elements.namedItem('ConfirmedQuantityInformationTypeID');
      actionInput.value = action === 'RECALCULATE_CONFIRMED_NEEDS' ? action : 'NONE';
      const typeGroup = form.querySelector('#confirmed-quantity-type-group');
      function updateVisibility() {
        typeGroup.hidden = actionInput.value !== 'RECALCULATE_CONFIRMED_NEEDS';
      }
      actionInput.addEventListener('change', updateVisibility);
      updateVisibility();

      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const saveButton = form.querySelector('button[type="submit"]');
        if (saveButton.disabled) return;
        if (actionInput.value === 'RECALCULATE_CONFIRMED_NEEDS' && !typeInput.value) {
          showMessage('نوع اطلاعات مرکزی تعداد قطعی تأییدشده را انتخاب کن.');
          return;
        }
        setButtonBusy(saveButton, true, 'در حال ذخیره...');
        try {
          await PMS.Api.post('/event-types/' + encodeURIComponent(eventTypeId) + '/procurement', {
            Action: actionInput.value,
            ConfirmedQuantityInformationTypeID: actionInput.value === 'RECALCULATE_CONFIRMED_NEEDS' ? typeInput.value : ''
          });
          showMessage('تنظیمات تأمین ذخیره شد.');
          modal.close();
        } catch (error) {
          showMessage(error.message || 'ذخیره تنظیمات تأمین ناموفق بود.');
        } finally {
          setButtonBusy(saveButton, false);
        }
      });
    } catch (error) {
      modal.body.innerHTML = '<div class="alert alert-error">' +
        escapeHtml(error.message || 'دریافت تنظیمات تأمین ناموفق بود.') + '</div>';
    }
  }

  function createModal(title, id) {
    const previous = document.getElementById(id);
    if (previous) previous.remove();

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay';
    const titleId = id + '-dialog-title';
    const previousFocus = document.activeElement;

    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + escapeHtml(titleId) + '">' +
        '<div class="modal-header">' +
          '<h3 id="' + escapeHtml(titleId) + '">' + escapeHtml(title) + '</h3>' +
          '<button type="button" class="modal-close" aria-label="بستن">×</button>' +
        '</div>' +
        '<div class="modal-body"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    const onKeyDown = function (event) {
      if (event.key === 'Escape') {
        close();
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
    const close = function () {
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    overlay.querySelector('.modal-close').addEventListener('click', close);

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });

    const firstFocusable = overlay.querySelector('input, select, textarea, button');
    if (firstFocusable) firstFocusable.focus();

    return {
      overlay: overlay,
      body: overlay.querySelector('.modal-body'),
      close: close
    };
  }

  function invalidateEventTypeCaches() {
    if (PMS.Cache && typeof PMS.Cache.invalidate === 'function') {
      PMS.Cache.invalidate(CACHE_KEY);
    }

    if (PMS.Cache && typeof PMS.Cache.remove === 'function') {
      PMS.Cache.remove(CACHE_KEY);
    }
  }

  function setButtonBusy(button, busy, label) {
    if (!button) return;

    if (busy) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = label || 'در حال انجام...';
    } else {
      button.disabled = false;

      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }

  function categoryLabel(value) {
    const option = CATEGORY_OPTIONS.find(function (item) {
      return item.value === String(value || '').toUpperCase();
    });

    return option ? option.label : (value || '-');
  }

  function renderStatus(status) {
    const value = String(status || '').toUpperCase();

    const labels = {
      ACTIVE: 'فعال',
      INACTIVE: 'غیرفعال',
      DELETED: 'حذف‌شده',
      VOID: 'باطل'
    };

    return '<span class="status-badge status-' +
      escapeAttribute(value.toLowerCase()) + '">' +
      escapeHtml(labels[value] || status || '-') + '</span>';
  }

  function showError(error, cachedAvailable) {
    const errorBox = document.getElementById('event-types-error');
    if (!errorBox) return;

    errorBox.textContent = cachedAvailable
      ? 'اتصال به سرور برقرار نشد؛ اطلاعات ذخیره‌شده نمایش داده می‌شود.'
      : (
        error && error.message
          ? error.message
          : 'دریافت انواع رویداد با خطا مواجه شد.'
      );

    errorBox.hidden = false;
  }

  function showMessage(message) {
    if (window.PMS && PMS.Alert && typeof PMS.Alert.info === 'function') {
      PMS.Alert.info(message);
    } else {
      window.alert(message);
    }
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  window.PMS.EventTypes = {
    init: init,
    load: loadEventTypes,
    render: render
  };

  window.PMS.Modules.EventTypes = window.PMS.EventTypes;

  // Router.initPageModule() owns module initialization. This file is loaded
  // globally by index.html, so auto-initializing here triggers protected API
  // calls on the login page and duplicates work when the actual page opens.
})();