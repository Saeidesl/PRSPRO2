(function () {
  'use strict';

  const CACHE_KEY = PMS.Cache.keys.EVENT_TYPES;

  const state = {
    eventTypes: [],
    search: '',
    selectedEventTypeId: null,
    selectedEventTypeName: '',
    fields: [],
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

  const FIELD_TYPE_OPTIONS = [
    { value: 'text', label: 'متن' },
    { value: 'number', label: 'عدد' },
    { value: 'date', label: 'تاریخ' },
    { value: 'datetime', label: 'تاریخ و زمان' },
    { value: 'select', label: 'فهرست انتخابی' },
    { value: 'textarea', label: 'متن چندخطی' },
    { value: 'boolean', label: 'بله/خیر' }
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

  function normalizeFields(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.fields)) return data.fields;
    if (data && data.data) return normalizeFields(data.data);
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

        html += '<button type="button" class="btn btn-sm btn-secondary event-type-fields" data-id="' +
          escapeAttribute(id) + '" data-name="' + escapeAttribute(name) +
          '">فیلدهای پویا</button> ';

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

    container.querySelectorAll('.event-type-fields').forEach(function (button) {
      button.addEventListener('click', function () {
        loadFields(button.dataset.id, button.dataset.name);
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

    try {
      await loadConfigurationLists();
    } catch (error) {
      // Keep this guard for unexpected client-side errors; individual endpoint
      // failures are handled inside loadConfigurationLists.
      console.error('Configuration lists loading failed:', error);
    }

    const modal = createModal(
      editing ? 'ویرایش نوع رویداد' : 'ثبت نوع رویداد',
      'event-type-form-modal'
    );

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
              '<small class="et-muted">برای سفارش پارچه و رویدادهای انبار ملزومات، مستقل را انتخاب کن.</small>' +
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

        '<section class="et-section">' +
          '<h4>۲. تنظیمات گردش پروژه</h4>' +
          '<span class="et-section-description">مشخص کن پس از ثبت این رویداد، پروژه به کدام واحد منتقل شود و وضعیت آن تغییر کند یا نه.</span>' +

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
              '<strong>رنگ‌بندی و سایزبندی پروژه</strong>' +
              '<label style="display:block;margin-top:8px"><input name="UseProjectColors" type="checkbox"> هنگام ثبت این رویداد، رنگ پروژه انتخاب شود</label>' +
              '<label style="display:block;margin-top:8px"><input name="UseProjectSizes" type="checkbox"> هنگام ثبت این رویداد، سایز پروژه انتخاب شود</label>' +
              '<label style="display:block;margin-top:8px"><input name="TrackVariantQuantity" type="checkbox"> مقدار تولید/تحویل برای ترکیب انتخاب‌شده ثبت شود</label>' +
              '<small class="et-muted">فهرست رنگ و سایز از مشخصات همان پروژه خوانده می‌شود. برای ثبت چندمرحله‌ای برش، نوع رویداد را به واحد برش مرتبط کن و گزینه مقدار تولید/تحویل را فعال کن؛ برای نمایش مجموع تجمعی، نام رویدادهای تکمیل را شامل «پایان برش» یا «اتمام برش» بگذار.</small>' +
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

        '<section class="et-section">' +
          '<h4>۵. فیلدهای اختصاصی این نوع رویداد</h4>' +
          '<span class="et-section-description">می‌توانی هنگام تعریف نوع رویداد، فیلدهای مخصوص همان رویداد را هم اضافه کنی. این فیلدها به‌صورت سراسری تعریف نمی‌شوند.</span>' +
          '<div id="et-inline-fields">' +
            '<p class="et-muted">' +
              (editing
                ? 'در حال دریافت فیلدهای اختصاصی...'
                : 'پس از ذخیره نوع رویداد، فیلدهای اختصاصی به همین نوع رویداد متصل خواهند شد.') +
            '</p>' +
          '</div>' +
          '<div class="et-toolbar">' +
            '<button type="button" class="btn btn-secondary" id="et-add-field" ' +
              (editing ? '' : 'disabled') +
              '>+ افزودن فیلد اختصاصی</button>' +
          '</div>' +
          '<small class="et-muted" id="et-new-fields-help">' +
            (editing
              ? 'فیلد جدید پس از ذخیره فرم به همین نوع رویداد متصل می‌شود.'
              : 'ابتدا نوع رویداد را ذخیره کن؛ سپس می‌توانی فیلدهای اختصاصی را اضافه کنی.') +
          '</small>' +
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
      setFieldChecked(form, 'UseProjectColors', item.UseProjectColors);
      setFieldChecked(form, 'UseProjectSizes', item.UseProjectSizes);
      setFieldChecked(form, 'TrackVariantQuantity', item.TrackVariantQuantity);

      setSelectedCheckboxes(form, 'AllowedDepartmentIDs', item.AllowedDepartmentIDs);
      setSelectedCheckboxes(form, 'AllowedUserIDs', item.AllowedUserIDs);
      setSelectedCheckboxes(form, 'AvailableDepartmentIDs', item.AvailableDepartmentIDs);
    } else {
      setFieldValue(form, 'Version', 1);
    }

    form.querySelector('#et-cancel').addEventListener('click', modal.close);

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

    form.querySelector('#et-add-field').addEventListener('click', function () {
      if (!eventTypeId) return;
      openInlineFieldEditor(form, eventTypeId, null);
    });

    if (editing) {
      loadInlineFields(eventTypeId, form);
    }

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
        UseProjectColors: fieldChecked(form, 'UseProjectColors'),
        UseProjectSizes: fieldChecked(form, 'UseProjectSizes'),
        TrackVariantQuantity: fieldChecked(form, 'TrackVariantQuantity')
      };

      if (!payload.Name || !payload.Code) {
        showMessage('نام و کد نوع رویداد الزامی است.');
        return;
      }

      if (payload.ConnectionType === 'INDEPENDENT' &&
          (payload.UseProjectColors || payload.UseProjectSizes || payload.TrackVariantQuantity)) {
        showMessage('برای رویداد مستقل از پروژه، رنگ‌بندی، سایزبندی و ثبت مقدار ترکیب باید غیرفعال باشند.');
        return;
      }

      if (payload.TrackVariantQuantity &&
          !payload.UseProjectColors && !payload.UseProjectSizes) {
        showMessage('برای ثبت مقدار، انتخاب رنگ یا سایز را هم فعال کن.');
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
            showMessage('نوع رویداد ثبت شد. اکنون می‌توانی فیلد اختصاصی اضافه کنی.');
            modal.close();
            await openEventTypeForm(createdId);
          } else {
            modal.close();

            showMessage(
              'نوع رویداد ثبت شد. برای افزودن فیلد اختصاصی، آن را از فهرست ویرایش کن.'
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

  async function loadInlineFields(eventTypeId, form) {
    const container = form.querySelector('#et-inline-fields');
    if (!container) return;

    const cacheKey = PMS.Cache.keys.EVENT_FIELDS + '_' + eventTypeId;
    const cached = PMS.Cache.get(cacheKey);

    if (cached !== null) {
      state.fields = normalizeFields(cached);
      renderInlineFields(container, eventTypeId, form);
    }

    try {
      const result = await PMS.Api.getCached(
        '/event-types/' + encodeURIComponent(eventTypeId) + '/fields',
        cacheKey,
        {
          onRefresh: function (data) {
            state.fields = normalizeFields(data);
            renderInlineFields(container, eventTypeId, form);
          },
          onError: function (error) {
            console.warn('Inline event fields refresh failed:', error);
          }
        }
      );

      state.fields = normalizeFields(
        result && result.data !== undefined ? result.data : result
      );

      renderInlineFields(container, eventTypeId, form);
    } catch (error) {
      console.error('Inline event fields loading failed:', error);

      if (cached === null) {
        container.innerHTML =
          '<p class="et-muted">دریافت فیلدها ناموفق بود. می‌توانی از دکمه «فیلدهای پویا» در فهرست استفاده کنی.</p>';
      }
    }
  }

  function renderInlineFields(container, eventTypeId, form) {
    const fields = state.fields.slice().sort(function (a, b) {
      return Number(a.FieldOrder || 0) - Number(b.FieldOrder || 0);
    });

    if (!fields.length) {
      container.innerHTML =
        '<p class="et-muted">هنوز فیلد اختصاصی برای این نوع رویداد تعریف نشده است.</p>';
      return;
    }

    container.innerHTML = '<div class="et-field-list">' +
      fields.map(function (field) {
        const active = isActive(field);

        return '<div class="et-field-row">' +
          '<div>' +
            '<strong>' + escapeHtml(field.Name || '-') + '</strong>' +
            '<small>' +
              escapeHtml(field.Code || '-') + ' | ' +
              escapeHtml(fieldTypeLabel(field.FieldType)) + ' | ' +
              (isChecked(field.IsRequired) ? 'اجباری' : 'اختیاری') + ' | ' +
              (active ? 'فعال' : 'غیرفعال') +
            '</small>' +
          '</div>' +
          '<div class="et-field-row-actions">' +
            '<button type="button" class="btn btn-sm btn-secondary et-inline-edit" data-id="' +
              escapeAttribute(getId(field)) + '">ویرایش</button>' +
            (active
              ? '<button type="button" class="btn btn-sm btn-secondary et-inline-disable" data-id="' +
                escapeAttribute(getId(field)) + '">غیرفعال‌سازی</button>'
              : '') +
          '</div>' +
        '</div>';
      }).join('') +
      '</div>';

    container.querySelectorAll('.et-inline-edit').forEach(function (button) {
      button.addEventListener('click', function () {
        const field = state.fields.find(function (entry) {
          return String(getId(entry)) === String(button.dataset.id);
        });

        if (field) openInlineFieldEditor(form, eventTypeId, field);
      });
    });

    container.querySelectorAll('.et-inline-disable').forEach(function (button) {
      button.addEventListener('click', function () {
        disableInlineField(button.dataset.id, eventTypeId, form);
      });
    });
  }

  function openInlineFieldEditor(parentForm, eventTypeId, field) {
    if (parentForm.querySelector('#et-inline-field-editor')) {
      showMessage('ابتدا فرم فیلد باز را ذخیره کن یا ببند.');
      return;
    }

    const editing = Boolean(field);
    const container = parentForm.querySelector('#et-inline-fields');

    const editor = document.createElement('div');
    editor.id = 'et-inline-field-editor';
    editor.className = 'et-inline-field';

    const typeOptions = FIELD_TYPE_OPTIONS.map(function (option) {
      return '<option value="' + escapeAttribute(option.value) + '">' +
        escapeHtml(option.label) + '</option>';
    }).join('');

    editor.innerHTML =
      '<h5>' + (editing ? 'ویرایش فیلد اختصاصی' : 'افزودن فیلد اختصاصی') + '</h5>' +
      '<form id="et-inline-field-form">' +

        '<div class="et-form-grid">' +

          '<div class="form-group">' +
            '<label for="eif-name">نام فیلد *</label>' +
            '<input id="eif-name" name="Name" required maxlength="150">' +
          '</div>' +

          '<div class="form-group">' +
            '<label for="eif-code">کد فیلد *</label>' +
            '<input id="eif-code" name="Code" required maxlength="100">' +
          '</div>' +

          '<div class="form-group">' +
            '<label for="eif-type">نوع فیلد *</label>' +
            '<select id="eif-type" name="FieldType" required>' +
              typeOptions +
            '</select>' +
          '</div>' +

          '<div class="form-group">' +
            '<label for="eif-order">ترتیب نمایش</label>' +
            '<input id="eif-order" name="FieldOrder" type="number" min="0" step="1">' +
          '</div>' +

          '<div class="form-group et-full">' +
            '<label for="eif-options">گزینه‌ها (برای فهرست انتخابی، هر گزینه در یک خط)</label>' +
            '<textarea id="eif-options" name="Options" rows="3"></textarea>' +
          '</div>' +

          '<div class="form-group et-full">' +
            '<label for="eif-default">مقدار پیش‌فرض</label>' +
            '<input id="eif-default" name="DefaultValue">' +
          '</div>' +

          '<div class="form-group et-full">' +
            '<label for="eif-validation">قاعده اعتبارسنجی (اختیاری)</label>' +
            '<input id="eif-validation" name="ValidationRule">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>' +
              '<input type="checkbox" name="IsRequired" id="eif-required">' +
              ' فیلد اجباری است' +
            '</label>' +
          '</div>' +

          '<div class="form-group">' +
            '<label for="eif-status">وضعیت</label>' +
            '<select id="eif-status" name="Status">' +
              '<option value="ACTIVE">فعال</option>' +
              '<option value="INACTIVE">غیرفعال</option>' +
            '</select>' +
          '</div>' +

        '</div>' +

        '<div class="et-toolbar">' +
          '<button type="submit" class="btn btn-primary">' +
            (editing ? 'ذخیره فیلد' : 'افزودن فیلد') +
          '</button>' +
          '<button type="button" class="btn btn-secondary" id="eif-cancel">بستن فرم فیلد</button>' +
        '</div>' +

      '</form>';

    container.appendChild(editor);

    const form = editor.querySelector('#et-inline-field-form');

    if (field) {
      setFieldValue(form, 'Name', field.Name);
      setFieldValue(form, 'Code', field.Code);
      setFieldValue(form, 'FieldType', field.FieldType || 'text');
      setFieldValue(form, 'FieldOrder', field.FieldOrder || 0);
      setFieldValue(form, 'Options', field.Options);
      setFieldValue(form, 'DefaultValue', field.DefaultValue);
      setFieldValue(form, 'ValidationRule', field.ValidationRule);
      setFieldValue(form, 'Status', field.Status || 'ACTIVE');
      setFieldChecked(form, 'IsRequired', field.IsRequired);
    } else {
      setFieldValue(form, 'FieldOrder', state.fields.length + 1);
      setFieldValue(form, 'FieldType', 'text');
      setFieldValue(form, 'Status', 'ACTIVE');
    }

    const typeInput = form.elements.namedItem('FieldType');
    const optionsInput = form.elements.namedItem('Options');

    function updateOptionsAvailability() {
      const isSelect = typeInput.value === 'select';
      optionsInput.disabled = !isSelect;

      if (!isSelect) {
        optionsInput.value = '';
      }
    }

    typeInput.addEventListener('change', updateOptionsAvailability);
    updateOptionsAvailability();

    form.querySelector('#eif-cancel').addEventListener('click', function () {
      editor.remove();
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const saveButton = form.querySelector('[type="submit"]');

      const payload = {
        Name: fieldValue(form, 'Name').trim(),
        Code: fieldValue(form, 'Code').trim(),
        FieldType: fieldValue(form, 'FieldType'),
        IsRequired: fieldChecked(form, 'IsRequired'),
        DefaultValue: fieldValue(form, 'DefaultValue'),
        Options: fieldValue(form, 'Options'),
        ValidationRule: fieldValue(form, 'ValidationRule'),
        FieldOrder: Number(fieldValue(form, 'FieldOrder') || 0),
        Status: fieldValue(form, 'Status')
      };

      if (!payload.Name || !payload.Code) {
        showMessage('نام و کد فیلد الزامی است.');
        return;
      }

      if (!Number.isFinite(payload.FieldOrder) || payload.FieldOrder < 0) {
        showMessage('ترتیب نمایش باید صفر یا عددی مثبت باشد.');
        return;
      }

      if (payload.FieldType === 'select' && !payload.Options.trim()) {
        showMessage('برای فیلد انتخابی، گزینه‌ها را وارد کن.');
        return;
      }

      setButtonBusy(saveButton, true, 'در حال ذخیره...');

      try {
        if (editing) {
          await PMS.Api.put(
            '/event-fields/' + encodeURIComponent(getId(field)),
            payload
          );
        } else {
          payload.EventTypeID = eventTypeId;

          await PMS.Api.post(
            '/event-types/' + encodeURIComponent(eventTypeId) + '/fields',
            payload
          );
        }

        invalidateFieldCache(eventTypeId);

        showMessage(editing ? 'فیلد اختصاصی ویرایش شد.' : 'فیلد اختصاصی اضافه شد.');

        await loadInlineFields(eventTypeId, parentForm);
      } catch (error) {
        console.error('Saving inline event field failed:', error);
        showMessage(error.message || 'ذخیره فیلد اختصاصی ناموفق بود.');
      } finally {
        setButtonBusy(saveButton, false);
      }
    });
  }

  async function disableInlineField(fieldId, eventTypeId, form) {
    const confirmed = window.confirm(
      'این فیلد غیرفعال می‌شود و اطلاعات رویدادهای قبلی حذف نخواهد شد. ادامه می‌دهی؟'
    );

    if (!confirmed) return;

    try {
      await PMS.Api.delete('/event-fields/' + encodeURIComponent(fieldId));

      invalidateFieldCache(eventTypeId);

      showMessage('فیلد اختصاصی غیرفعال شد.');

      await loadInlineFields(eventTypeId, form);
    } catch (error) {
      console.error('Disabling inline event field failed:', error);
      showMessage(error.message || 'غیرفعال‌سازی فیلد ناموفق بود.');
    }
  }

  async function loadFields(eventTypeId, eventTypeName) {
    state.selectedEventTypeId = eventTypeId;
    state.selectedEventTypeName = eventTypeName || '';

    const cacheKey = PMS.Cache.keys.EVENT_FIELDS + '_' + eventTypeId;
    const cached = PMS.Cache.get(cacheKey);

    if (cached !== null) {
      state.fields = normalizeFields(cached);
      showFieldsModal();
    }

    try {
      const result = await PMS.Api.getCached(
        '/event-types/' + encodeURIComponent(eventTypeId) + '/fields',
        cacheKey,
        {
          onRefresh: function (data) {
            state.fields = normalizeFields(data);
            showFieldsModal();
          },
          onError: function (error) {
            console.warn('Event fields refresh failed:', error);
          }
        }
      );

      state.fields = normalizeFields(
        result && result.data !== undefined ? result.data : result
      );

      showFieldsModal();
    } catch (error) {
      console.error('Event fields loading failed:', error);

      if (cached === null) {
        showMessage(error.message || 'دریافت فیلدهای پویا ناموفق بود.');
      }
    }
  }

  async function openProcurementSettings(eventTypeId, eventTypeName) {
    const modal = createModal('تنظیمات تأمین: ' + (eventTypeName || ''), 'event-type-procurement-modal');
    modal.body.innerHTML = '<div class="table-empty">در حال دریافت تنظیمات...</div>';

    function unwrap(value) {
      return value && value.data !== undefined ? value.data : value;
    }

    function activeFields(value) {
      const data = unwrap(value);
      const list = normalizeFields(data);
      return list.filter(function (field) {
        return String(field.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
      });
    }

    function mappingSelect(key, label, fields, selected, required) {
      const options = ['<option value="">-- انتخاب فیلد --</option>'].concat(fields.map(function (field) {
        const code = String(field.Code || '');
        const isSelected = code === String(selected || '') ? ' selected' : '';
        return '<option value="' + escapeAttribute(code) + '"' + isSelected + '>' +
          escapeHtml((field.Name || code) + ' (' + code + ')') + '</option>';
      })).join('');
      return '<label class="form-group"><span>' + escapeHtml(label) +
        (required ? ' *' : '') + '</span><select class="form-control" name="' + escapeAttribute(key) +
        '" data-map-key="' + escapeAttribute(key) + '">' + options + '</select></label>';
    }

    try {
      const results = await Promise.all([
        PMS.Api.get('/event-types/' + encodeURIComponent(eventTypeId) + '/procurement'),
        PMS.Api.get('/event-types/' + encodeURIComponent(eventTypeId) + '/fields')
      ]);
      const settings = unwrap(results[0]) || {};
      const fields = activeFields(results[1]);
      const fieldMap = settings.FieldMap && typeof settings.FieldMap === 'object'
        ? settings.FieldMap : {};
      const action = String(settings.Action || 'NONE').toUpperCase();

      let html = '<p class="form-help">این تنظیم مشخص می‌کند ثبت این نوع رویداد، نیاز ملزومات ایجاد کند یا رسید واقعی انبار را ثبت کند. خرید و دریافت انبار دو وضعیت جدا هستند.</p>' +
        '<form id="event-type-procurement-form">' +
        '<label class="form-group"><span>عملیات تأمین</span><select class="form-control" name="Action">' +
        '<option value="NONE">بدون عملیات تأمین</option>' +
        '<option value="CREATE_NEED">ایجاد نیاز ملزومات</option>' +
        '<option value="RECORD_RECEIPT">ثبت دریافت واقعی از سفارش</option>' +
        '</select></label>' +
        '<div id="event-type-procurement-mappings"></div>' +
        '<div class="modal-actions"><button type="submit" class="btn btn-primary">ذخیره تنظیمات</button></div></form>';

      modal.body.innerHTML = html;
      const form = modal.body.querySelector('#event-type-procurement-form');
      const actionInput = form.elements.namedItem('Action');
      actionInput.value = ['NONE', 'CREATE_NEED', 'RECORD_RECEIPT'].indexOf(action) >= 0 ? action : 'NONE';

      function renderMappings() {
        const selectedAction = actionInput.value;
        const definitions = selectedAction === 'CREATE_NEED'
          ? [
              ['ItemName', 'نام ملزوم', true],
              ['Unit', 'واحد اندازه‌گیری', true],
              ['RequestedQuantity', 'مقدار موردنیاز', true],
              ['ItemCode', 'کد ملزوم', false],
              ['ProjectID', 'شناسه پروژه (اختیاری)', false],
              ['NeededBy', 'تاریخ نیاز (اختیاری)', false],
              ['Notes', 'توضیحات (اختیاری)', false]
            ]
          : (selectedAction === 'RECORD_RECEIPT'
            ? [
                ['PurchaseOrderItemID', 'شناسه ردیف سفارش خرید', true],
                ['QuantityReceived', 'مقدار دریافت‌شده', true],
                ['ProjectID', 'شناسه پروژه (اختیاری)', false],
                ['Notes', 'توضیحات (اختیاری)', false]
              ] : []);
        const container = form.querySelector('#event-type-procurement-mappings');
        if (!definitions.length) {
          container.innerHTML = '<p class="form-help">با این گزینه، رویداد هیچ رکورد تأمینی ایجاد نمی‌کند.</p>';
          return;
        }
        container.innerHTML = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>فیلد تأمین</th><th>فیلد پویای رویداد</th></tr></thead><tbody>' +
          definitions.map(function (def) {
            return '<tr><td>' + escapeHtml(def[1]) + '</td><td>' +
              mappingSelect(def[0], def[1], fields, fieldMap[def[0]], def[2]) +
              '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }

      actionInput.addEventListener('change', renderMappings);
      renderMappings();

      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const saveButton = form.querySelector('button[type="submit"]');
        if (saveButton.disabled) return;
        const selectedAction = actionInput.value;
        const fieldMapPayload = {};
        form.querySelectorAll('[data-map-key]').forEach(function (select) {
          if (select.value) fieldMapPayload[select.dataset.mapKey] = select.value;
        });
        const requiredKeys = selectedAction === 'CREATE_NEED'
          ? ['ItemName', 'Unit', 'RequestedQuantity']
          : (selectedAction === 'RECORD_RECEIPT' ? ['PurchaseOrderItemID', 'QuantityReceived'] : []);
        const missing = requiredKeys.filter(function (key) { return !fieldMapPayload[key]; });
        if (missing.length) {
          showMessage('فیلدهای الزامی را انتخاب کن: ' + missing.join('، '));
          return;
        }
        saveButton.disabled = true;
        saveButton.textContent = 'در حال ذخیره...';
        try {
          await PMS.Api.post('/event-types/' + encodeURIComponent(eventTypeId) + '/procurement', {
            Action: selectedAction,
            FieldMap: fieldMapPayload
          });
          showMessage('تنظیمات تأمین ذخیره شد.');
          modal.close();
        } catch (error) {
          showMessage(error.message || 'ذخیره تنظیمات تأمین ناموفق بود.');
          saveButton.disabled = false;
          saveButton.textContent = 'ذخیره تنظیمات';
        }
      });
    } catch (error) {
      modal.body.innerHTML = '<div class="alert alert-error">' +
        escapeHtml(error.message || 'دریافت تنظیمات تأمین ناموفق بود.') + '</div>';
    }
  }

  function showFieldsModal() {
    const eventTypeId = state.selectedEventTypeId;
    const eventTypeName = state.selectedEventTypeName;

    const modal = createModal(
      'فیلدهای پویا: ' + (eventTypeName || ''),
      'event-type-fields-modal'
    );

    let html =
      '<div class="modal-actions" style="margin-bottom:12px">' +
        '<button type="button" class="btn btn-primary" id="field-create-button">+ افزودن فیلد</button>' +
      '</div>';

    const fields = state.fields.slice().sort(function (a, b) {
      return Number(a.FieldOrder || 0) - Number(b.FieldOrder || 0);
    });

    if (fields.length === 0) {
      html += '<div class="table-empty">فیلد پویایی برای این نوع رویداد ثبت نشده است.</div>';
    } else {
      html += '<div class="table-wrapper"><table class="data-table"><thead><tr>' +
        '<th>ترتیب</th><th>نام فیلد</th><th>کد</th><th>نوع</th>' +
        '<th>اجباری</th><th>مقدار پیش‌فرض</th><th>وضعیت</th><th>عملیات</th>' +
        '</tr></thead><tbody>';

      fields.forEach(function (field) {
        const id = getId(field);
        const active = isActive(field);

        html += '<tr>';
        html += '<td>' + escapeHtml(String(field.FieldOrder || 0)) + '</td>';
        html += '<td>' + escapeHtml(field.Name || '-') + '</td>';
        html += '<td>' + escapeHtml(field.Code || '-') + '</td>';
        html += '<td>' + escapeHtml(fieldTypeLabel(field.FieldType)) + '</td>';
        html += '<td>' + (isChecked(field.IsRequired) ? 'بله' : 'خیر') + '</td>';
        html += '<td>' + escapeHtml(field.DefaultValue || '-') + '</td>';
        html += '<td>' + renderStatus(field.Status || 'ACTIVE') + '</td>';
        html += '<td>';

        html += '<button type="button" class="btn btn-sm btn-secondary field-edit" data-id="' +
          escapeAttribute(id) + '">ویرایش</button> ';

        if (active) {
          html += '<button type="button" class="btn btn-sm btn-secondary field-disable" data-id="' +
            escapeAttribute(id) + '">غیرفعال‌سازی</button>';
        }

        html += '</td></tr>';
      });

      html += '</tbody></table></div>';
    }

    modal.body.innerHTML = html;

    modal.body.querySelector('#field-create-button').addEventListener('click', function () {
      openFieldForm(null);
    });

    modal.body.querySelectorAll('.field-edit').forEach(function (button) {
      button.addEventListener('click', function () {
        const field = state.fields.find(function (entry) {
          return String(getId(entry)) === String(button.dataset.id);
        });

        if (field) openFieldForm(field);
      });
    });

    modal.body.querySelectorAll('.field-disable').forEach(function (button) {
      button.addEventListener('click', function () {
        disableField(button.dataset.id);
      });
    });
  }

  function openFieldForm(field) {
    const eventTypeId = state.selectedEventTypeId;
    const editing = Boolean(field);

    const modal = createModal(
      editing ? 'ویرایش فیلد پویا' : 'افزودن فیلد پویا',
      'event-field-form-modal'
    );

    const typeOptions = FIELD_TYPE_OPTIONS.map(function (option) {
      return '<option value="' + escapeAttribute(option.value) + '">' +
        escapeHtml(option.label) + '</option>';
    }).join('');

    modal.body.innerHTML =
      '<form id="event-field-form">' +

        '<div class="form-group">' +
          '<label for="ef-name">نام فیلد *</label>' +
          '<input id="ef-name" name="Name" required maxlength="150">' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-code">کد فیلد *</label>' +
          '<input id="ef-code" name="Code" required maxlength="100">' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-type">نوع فیلد *</label>' +
          '<select id="ef-type" name="FieldType" required>' +
            typeOptions +
          '</select>' +
        '</div>' +

        '<div class="form-group">' +
          '<label><input type="checkbox" name="IsRequired" id="ef-required"> فیلد اجباری است</label>' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-default">مقدار پیش‌فرض</label>' +
          '<input id="ef-default" name="DefaultValue">' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-options">گزینه‌ها (برای فهرست انتخابی، هر گزینه در یک خط)</label>' +
          '<textarea id="ef-options" name="Options" rows="3"></textarea>' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-validation">قاعده اعتبارسنجی (اختیاری)</label>' +
          '<input id="ef-validation" name="ValidationRule">' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-order">ترتیب نمایش</label>' +
          '<input id="ef-order" name="FieldOrder" type="number" min="0" step="1">' +
        '</div>' +

        '<div class="form-group">' +
          '<label for="ef-status">وضعیت</label>' +
          '<select id="ef-status" name="Status">' +
            '<option value="ACTIVE">فعال</option>' +
            '<option value="INACTIVE">غیرفعال</option>' +
          '</select>' +
        '</div>' +

        '<div class="modal-actions">' +
          '<button type="submit" class="btn btn-primary">' +
            (editing ? 'ذخیره تغییرات' : 'افزودن فیلد') +
          '</button>' +
          '<button type="button" class="btn btn-secondary" id="ef-cancel">انصراف</button>' +
        '</div>' +

      '</form>';

    const form = modal.body.querySelector('#event-field-form');

    if (field) {
      setFieldValue(form, 'Name', field.Name);
      setFieldValue(form, 'Code', field.Code);
      setFieldValue(form, 'FieldType', field.FieldType || 'text');
      setFieldChecked(form, 'IsRequired', field.IsRequired);
      setFieldValue(form, 'DefaultValue', field.DefaultValue);
      setFieldValue(form, 'Options', field.Options);
      setFieldValue(form, 'ValidationRule', field.ValidationRule);
      setFieldValue(form, 'FieldOrder', field.FieldOrder || 0);
      setFieldValue(form, 'Status', field.Status || 'ACTIVE');
    } else {
      setFieldValue(form, 'FieldOrder', state.fields.length + 1);
    }

    form.querySelector('#ef-cancel').addEventListener('click', modal.close);

    form.querySelector('#ef-type').addEventListener('change', function () {
      const options = form.elements.namedItem('Options');
      options.disabled = form.elements.namedItem('FieldType').value !== 'select';

      if (options.disabled) {
        options.value = '';
      }
    });

    form.querySelector('#ef-type').dispatchEvent(new Event('change'));

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const saveButton = form.querySelector('[type="submit"]');

      const payload = {
        Name: fieldValue(form, 'Name').trim(),
        Code: fieldValue(form, 'Code').trim(),
        FieldType: fieldValue(form, 'FieldType'),
        IsRequired: fieldChecked(form, 'IsRequired'),
        DefaultValue: fieldValue(form, 'DefaultValue'),
        Options: fieldValue(form, 'Options'),
        ValidationRule: fieldValue(form, 'ValidationRule'),
        FieldOrder: Number(fieldValue(form, 'FieldOrder') || 0),
        Status: fieldValue(form, 'Status')
      };

      if (!payload.Name || !payload.Code) {
        showMessage('نام و کد فیلد الزامی است.');
        return;
      }

      if (!Number.isFinite(payload.FieldOrder) || payload.FieldOrder < 0) {
        showMessage('ترتیب نمایش باید صفر یا عددی مثبت باشد.');
        return;
      }

      if (payload.FieldType === 'select' && !payload.Options.trim()) {
        showMessage('برای فیلد انتخابی، گزینه‌ها را وارد کن.');
        return;
      }

      setButtonBusy(saveButton, true, 'در حال ذخیره...');

      try {
        if (editing) {
          await PMS.Api.put(
            '/event-fields/' + encodeURIComponent(getId(field)),
            payload
          );
        } else {
          payload.EventTypeID = eventTypeId;

          await PMS.Api.post(
            '/event-types/' + encodeURIComponent(eventTypeId) + '/fields',
            payload
          );
        }

        modal.close();
        invalidateFieldCache(eventTypeId);

        showMessage(editing ? 'فیلد پویا ویرایش شد.' : 'فیلد پویا اضافه شد.');

        await loadFields(eventTypeId, state.selectedEventTypeName);
      } catch (error) {
        console.error('Saving event field failed:', error);
        showMessage(error.message || 'ذخیره فیلد ناموفق بود.');
      } finally {
        setButtonBusy(saveButton, false);
      }
    });
  }

  async function disableField(fieldId) {
    const confirmed = window.confirm(
      'این فیلد غیرفعال می‌شود و اطلاعات رویدادهای قبلی حذف نخواهد شد. ادامه می‌دهی؟'
    );

    if (!confirmed) return;

    try {
      await PMS.Api.delete('/event-fields/' + encodeURIComponent(fieldId));

      invalidateFieldCache(state.selectedEventTypeId);
      showMessage('فیلد غیرفعال شد.');

      await loadFields(
        state.selectedEventTypeId,
        state.selectedEventTypeName
      );
    } catch (error) {
      console.error('Disabling event field failed:', error);
      showMessage(error.message || 'غیرفعال‌سازی فیلد ناموفق بود.');
    }
  }

  function createModal(title, id) {
    const previous = document.getElementById(id);
    if (previous) previous.remove();

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay';

    overlay.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<h3>' + escapeHtml(title) + '</h3>' +
          '<button type="button" class="modal-close" aria-label="بستن">×</button>' +
        '</div>' +
        '<div class="modal-body"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    const close = function () {
      overlay.remove();
    };

    overlay.querySelector('.modal-close').addEventListener('click', close);

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });

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

  function invalidateFieldCache(eventTypeId) {
    const cacheKey = PMS.Cache.keys.EVENT_FIELDS + '_' + eventTypeId;

    if (PMS.Cache && typeof PMS.Cache.invalidate === 'function') {
      PMS.Cache.invalidate(cacheKey);
    }

    if (PMS.Cache && typeof PMS.Cache.remove === 'function') {
      PMS.Cache.remove(cacheKey);
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

  function fieldTypeLabel(value) {
    const option = FIELD_TYPE_OPTIONS.find(function (item) {
      return item.value === String(value || '').toLowerCase();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();