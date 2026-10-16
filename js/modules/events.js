(function () {
  'use strict';

  const PMS = window.PMS;
  const CACHE_KEY = PMS.Cache.keys.EVENTS;
  const PROJECTS_CACHE_KEY = PMS.Cache.keys.PROJECTS;
  const EVENT_TYPES_CACHE_KEY = PMS.Cache.keys.EVENT_TYPES;

  const Events = {
    events: [],
    projects: [],
    eventTypes: [],
    eventFields: [],
    modalOpen: false,
    submitting: false,
    fieldsRequestId: 0,
    fieldsLoading: false,
    fieldsReady: false,
    fieldsError: false,
    fieldsLoadedForTypeId: '',
    searchTimer: null,

    init: function () {
      this.bindEvents();

      const createButton = document.getElementById('event-create-button');
      if (createButton && PMS.Router &&
          typeof PMS.Router.hasPermission === 'function') {
        createButton.hidden = !PMS.Router.hasPermission('EVENT_CREATE');
      }

      this.load();
    },

    bindEvents: function () {
      document.addEventListener('click', function (event) {
        const target = event.target;

        const filterButton = target.closest('#events-filter-toggle');
        if (filterButton) {
          event.preventDefault();

          const content = document.getElementById('events-filter-content');
          const arrow = document.getElementById('events-filter-arrow');

          if (!content) return;

          content.hidden = !content.hidden;
          filterButton.setAttribute('aria-expanded', String(!content.hidden));

          if (arrow) arrow.textContent = content.hidden ? '▼' : '▲';
          return;
        }

        if (target.closest('#event-create-button')) {
          event.preventDefault();
          Events.openForm();
          return;
        }

        const voidButton = target.closest('.event-void-button');
        if (voidButton) {
          event.preventDefault();
          Events.voidEvent(voidButton.dataset.eventId);
          return;
        }

        const detailsButton = target.closest('.event-details-button');
        if (detailsButton) {
          event.preventDefault();
          Events.openDetails(detailsButton.dataset.eventId);
        }
      });

      [
        'event-project-filter',
        'event-type-filter',
        'event-status-filter',
        'event-creator-filter',
        'event-department-filter',
        'event-occurred-from',
        'event-occurred-to',
        'event-created-from',
        'event-created-to'
      ].forEach(function (id) {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('change', function () {
            Events.applyFilters();
          });
        }
      });

      const searchInput = document.getElementById('event-search');

      if (searchInput) {
        searchInput.addEventListener('input', function () {
          clearTimeout(Events.searchTimer);
          Events.searchTimer = setTimeout(function () {
            Events.applyFilters();
          }, 120);
        });
      }

      document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        if (Events.submitting) return;

        if (document.getElementById('event-create-modal')) {
          Events.closeForm();
        } else if (document.getElementById('event-details-modal')) {
          Events.closeModal();
        }
      });
    },

    load: async function () {
      const loading = document.getElementById('events-loading');
      const canViewEvents = !!(
        PMS.Router &&
        typeof PMS.Router.hasPermission === 'function' &&
        PMS.Router.hasPermission('EVENT_VIEW')
      );

      const cachedEvents = canViewEvents
        ? PMS.Cache.get(CACHE_KEY)
        : null;
      const cachedProjects = PMS.Cache.get(PROJECTS_CACHE_KEY);
      const cachedTypes = PMS.Cache.get(EVENT_TYPES_CACHE_KEY);

      if (!canViewEvents) {
        this.events = [];
        PMS.Cache.remove(CACHE_KEY);
      }

      if (cachedEvents !== null) this.events = this.normalize(cachedEvents);
      if (cachedProjects !== null) this.projects = this.normalize(cachedProjects);
      if (cachedTypes !== null) this.eventTypes = this.normalize(cachedTypes);

      const hasCache =
        cachedEvents !== null ||
        cachedProjects !== null ||
        cachedTypes !== null;

      if (hasCache) {
        this.renderFilters();
        this.applyFilters();
        if (loading) loading.hidden = true;
      }

      try {
        const requests = [];

        if (canViewEvents) {
          requests.push(
            PMS.Api.getCached('/events', CACHE_KEY, {
              onRefresh: function (data) {
                Events.events = Events.normalize(data);
                Events.renderFilters();
                Events.applyFilters();
              },
              onError: function (error, isBackground) {
                if (!isBackground && cachedEvents === null) {
                  Events.showError(error);
                }
              }
            })
          );
        }

        requests.push(
          PMS.Api.getCached('/projects', PROJECTS_CACHE_KEY, {
            onRefresh: function (data) {
              Events.projects = Events.normalize(data);
              Events.renderFilters();
              Events.applyFilters();
            }
          }),
          PMS.Api.getCached('/event-types', EVENT_TYPES_CACHE_KEY, {
            onRefresh: function (data) {
              Events.eventTypes = Events.normalize(data);
              Events.renderFilters();
              Events.applyFilters();
            }
          })
        );

        const results = await Promise.all(requests);
        let resultIndex = 0;

        if (canViewEvents) {
          const eventsResult = results[resultIndex++];
          if (eventsResult && eventsResult.cached === false) {
            this.events = this.normalize(eventsResult.data);
          }
        } else {
          this.events = [];
        }

        const projectsResult = results[resultIndex++];
        if (projectsResult && projectsResult.cached === false) {
          this.projects = this.normalize(projectsResult.data);
        }

        const typesResult = results[resultIndex++];
        if (typesResult && typesResult.cached === false) {
          this.eventTypes = this.normalize(typesResult.data);
        }

        this.renderFilters();
        this.applyFilters();
      } catch (error) {
        if (cachedEvents === null) this.showError(error);
      } finally {
        if (loading) loading.hidden = true;
      }
    },

    normalize: function (data) {
      if (Array.isArray(data)) return data;
      if (!data || typeof data !== 'object') return [];

      const keys = [
        'items',
        'events',
        'projects',
        'eventTypes',
        'fields',
        'data',
        'records',
        'values'
      ];

      for (const key of keys) {
        if (Array.isArray(data[key])) return data[key];
      }

      return [];
    },

    idOf: function (item) {
      return String(item && (item.ID || item.Id || item.id) || '');
    },

    findById: function (items, id) {
      const wanted = String(id || '');

      return items.find(function (item) {
        return Events.idOf(item) === wanted;
      }) || null;
    },

    renderFilters: function () {
      const projectFilter = document.getElementById('event-project-filter');
      const typeFilter = document.getElementById('event-type-filter');
      const creatorFilter = document.getElementById('event-creator-filter');
      const departmentFilter = document.getElementById('event-department-filter');

      function fillSelect(select, label, items) {
        if (!select) return;

        const previous = select.value;
        const fragment = document.createDocumentFragment();

        const first = document.createElement('option');
        first.value = '';
        first.textContent = label;
        fragment.appendChild(first);

        items.forEach(function (item) {
          const option = document.createElement('option');
          option.value = String(item.value);
          option.textContent = String(item.label);
          fragment.appendChild(option);
        });

        select.replaceChildren(fragment);

        if (Array.from(select.options).some(function (option) {
          return option.value === previous;
        })) {
          select.value = previous;
        }
      }

      const projects = this.uniqueValues(this.projects.map(function (project) {
        const id = Events.idOf(project);
        if (!id) return null;

        return {
          value: id,
          label: project.ProjectCode || project.Title || project.Name || id
        };
      }));

      const types = this.uniqueValues(this.eventTypes.map(function (type) {
        const id = Events.idOf(type);
        if (!id) return null;

        return {
          value: id,
          label: type.Name || type.Code || id
        };
      }));

      const creators = this.uniqueValues(this.events.map(function (event) {
        const value = Events.creatorValue(event);
        return value === '-' ? null : { value: value, label: value };
      }));

      const departments = this.uniqueValues(this.events.map(function (event) {
        const value = Events.departmentValue(event);
        return value === '-' ? null : { value: value, label: value };
      }));

      fillSelect(projectFilter, 'همه پروژه‌ها', projects);
      fillSelect(typeFilter, 'همه انواع', types);
      fillSelect(creatorFilter, 'همه ثبت‌کنندگان', creators);
      fillSelect(departmentFilter, 'همه واحدها', departments);
    },

    uniqueValues: function (items) {
      const seen = new Set();

      return items
        .filter(function (item) {
          if (!item || item.value === null || item.value === undefined) {
            return false;
          }

          const value = String(item.value).trim();
          if (!value || seen.has(value)) return false;

          seen.add(value);
          item.value = value;
          item.label = String(item.label || value);
          return true;
        })
        .sort(function (a, b) {
          return a.label.localeCompare(b.label, 'fa');
        });
    },

    applyFilters: function () {
      const get = function (id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
      };

      const filters = {
        project: get('event-project-filter'),
        type: get('event-type-filter'),
        creator: get('event-creator-filter'),
        department: get('event-department-filter'),
        status: get('event-status-filter').toUpperCase(),
        search: get('event-search').toLocaleLowerCase('fa'),
        occurredFrom: get('event-occurred-from'),
        occurredTo: get('event-occurred-to'),
        createdFrom: get('event-created-from'),
        createdTo: get('event-created-to')
      };

      const projectMap = new Map();

      this.projects.forEach(function (item) {
        projectMap.set(Events.idOf(item), item);
      });

      const typeMap = new Map();

      this.eventTypes.forEach(function (item) {
        typeMap.set(Events.idOf(item), item);
      });

      const dateKey = function (value) {
        if (!value) return '';

        const date = new Date(value);
        if (isNaN(date.getTime())) return '';

        return [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-');
      };

      const inRange = function (value, from, to) {
        if (!from && !to) return true;

        const date = dateKey(value);
        if (!date) return false;
        if (from && date < from) return false;
        if (to && date > to) return false;

        return true;
      };

      const filtered = this.events.filter(function (event) {
        if (filters.project && String(event.ProjectID || '') !== filters.project) {
          return false;
        }

        if (filters.type && String(event.EventTypeID || '') !== filters.type) {
          return false;
        }

        if (filters.status &&
            String(event.Status || '').toUpperCase() !== filters.status) {
          return false;
        }

        if (filters.creator && Events.creatorValue(event) !== filters.creator) {
          return false;
        }

        if (filters.department &&
            Events.departmentValue(event) !== filters.department) {
          return false;
        }

        if (!inRange(event.OccurredAt, filters.occurredFrom, filters.occurredTo)) {
          return false;
        }

        if (!inRange(event.CreatedAt, filters.createdFrom, filters.createdTo)) {
          return false;
        }

        if (filters.search) {
          const project = projectMap.get(String(event.ProjectID || ''));
          const type = typeMap.get(String(event.EventTypeID || ''));

          const text = [
            event.ProjectCode,
            event.ProjectTitle,
            event.ProjectName,
            project && project.ProjectCode,
            project && project.Title,
            project && project.Name,
            event.EventTypeName,
            type && type.Name,
            type && type.Code,
            event.Description,
            event.OccurredAt,
            Events.formatDate(event.OccurredAt),
            event.CreatedAt,
            Events.formatDate(event.CreatedAt),
            event.CreatorName,
            event.CreatedByName,
            event.CreatedBy,
            event.PerformedByName,
            event.PerformedBy,
            event.DepartmentName,
            event.DepartmentTitle,
            event.DepartmentID,
            Events.statusText(event.Status),
            event.Status,
            event.ID
          ].filter(function (value) {
            return value !== null && value !== undefined;
          }).join(' ').toLocaleLowerCase('fa');

          if (!text.includes(filters.search)) return false;
        }

        return true;
      });

      this.render(filtered);
    },

    render: function (events) {
      const container = document.getElementById('events-table-container');
      const empty = document.getElementById('events-empty');

      if (!container) return;

      if (!events || events.length === 0) {
        container.replaceChildren();
        container.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }

      if (empty) empty.hidden = true;

      let tableHtml =
        '<div class="events-desktop-view"><table class="data-table">' +
        '<thead><tr><th>پروژه</th><th>نوع رویداد</th><th>شرح فعالیت</th>' +
        '<th>تاریخ وقوع</th><th>تاریخ ثبت</th><th>ثبت‌کننده</th>' +
        '<th>واحد</th><th>وضعیت</th><th>جزئیات</th></tr></thead><tbody>';

      let mobileHtml = '<div class="events-mobile-view">';

      events.forEach(function (event) {
        const project = Events.findById(Events.projects, event.ProjectID);
        const type = Events.findById(Events.eventTypes, event.EventTypeID);

        const projectName =
          event.ProjectCode ||
          (project && (project.ProjectCode || project.Title || project.Name)) ||
          event.ProjectID ||
          '-';

        const typeName =
          event.EventTypeName ||
          (type && (type.Name || type.Code)) ||
          event.EventTypeID ||
          '-';

        const description = event.Description || 'بدون شرح';
        const creator = Events.creatorValue(event);
        const department = Events.departmentValue(event);
        const status = String(event.Status || '').toUpperCase();
        const statusClass = Events.statusClass(status);
        const eventId = Events.escape(event.ID || '');

        tableHtml +=
          '<tr>' +
          '<td>' + Events.escape(projectName) + '</td>' +
          '<td>' + Events.escape(typeName) + '</td>' +
          '<td>' + Events.escape(description) + '</td>' +
          '<td>' + Events.escape(Events.formatDate(event.OccurredAt)) + '</td>' +
          '<td>' + Events.escape(Events.formatDate(event.CreatedAt)) + '</td>' +
          '<td>' + Events.escape(creator) + '</td>' +
          '<td>' + Events.escape(department) + '</td>' +
          '<td><span class="status-badge ' + statusClass + '">' +
          Events.escape(Events.statusText(event.Status)) + '</span></td>' +
          '<td><button type="button" class="btn btn-secondary event-details-button" ' +
          'data-event-id="' + eventId + '">مشاهده</button></td>' +
          '</tr>';

        mobileHtml +=
          '<article class="event-mobile-card">' +
          '<div class="event-mobile-card-top">' +
          '<div class="event-mobile-title-group"><span class="event-mobile-eyebrow">پروژه</span>' +
          '<h3>' + Events.escape(projectName) + '</h3></div>' +
          '<span class="event-mobile-status ' + statusClass + '">' +
          Events.escape(Events.statusText(event.Status)) + '</span></div>' +
          '<div class="event-mobile-type"><span class="event-mobile-type-dot"></span>' +
          Events.escape(typeName) + '</div>' +
          '<div class="event-mobile-description"><span class="event-mobile-label">شرح فعالیت</span>' +
          '<p>' + Events.escape(description) + '</p></div>' +
          '<div class="event-mobile-meta">' +
          '<div class="event-mobile-meta-item"><span class="event-mobile-label">تاریخ وقوع</span>' +
          '<span>' + Events.escape(Events.formatDate(event.OccurredAt)) + '</span></div>' +
          '<div class="event-mobile-meta-item"><span class="event-mobile-label">تاریخ ثبت</span>' +
          '<span>' + Events.escape(Events.formatDate(event.CreatedAt)) + '</span></div>' +
          '<div class="event-mobile-meta-item"><span class="event-mobile-label">ثبت‌کننده</span>' +
          '<span>' + Events.escape(creator) + '</span></div>' +
          '<div class="event-mobile-meta-item"><span class="event-mobile-label">واحد</span>' +
          '<span>' + Events.escape(department) + '</span></div></div>' +
          '<div class="event-mobile-card-footer"><span class="event-mobile-id">شناسه: ' +
          Events.escape(event.ID || '-') + '</span>' +
          '<button type="button" class="btn btn-secondary event-details-button" ' +
          'data-event-id="' + eventId + '">مشاهده جزئیات <span aria-hidden="true">←</span></button>' +
          '</div></article>';
      });

      tableHtml += '</tbody></table></div>';
      mobileHtml += '</div>';

      container.innerHTML = tableHtml + mobileHtml;
      container.hidden = false;
    },

    statusClass: function (status) {
      if (status === 'ACTIVE') return 'events-status-active';
      if (status === 'VOID') return 'events-status-void';
      return 'events-status-other';
    },

    openDetails: async function (eventId) {
      if (!eventId) return;

      this.closeModal();

      const modal = document.createElement('div');
      modal.id = 'event-details-modal';
      modal.dir = 'rtl';
      modal.className = 'event-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'event-details-title');

      modal.innerHTML =
        '<div class="event-modal-panel event-details-panel">' +
        '<div class="event-modal-heading"><h3 id="event-details-title">جزئیات رویداد</h3>' +
        '<button type="button" id="event-details-close" class="event-modal-close" ' +
        'aria-label="بستن">×</button></div>' +
        '<div id="event-details-content" class="event-modal-content" aria-live="polite">' +
        '<div class="event-loading-state"><span class="event-spinner" aria-hidden="true"></span>' +
        '<p>در حال دریافت جزئیات رویداد...</p></div></div></div>';

      document.body.appendChild(modal);
      this.modalOpen = true;

      document.getElementById('event-details-close')
        .addEventListener('click', () => this.closeModal());

      modal.addEventListener('click', (event) => {
        if (event.target === modal) this.closeModal();
      });

      try {
        const responses = await Promise.all([
          PMS.Api.get('/events/' + encodeURIComponent(eventId)),
          PMS.Api.get('/events/' + encodeURIComponent(eventId) + '/data')
        ]);

        if (!document.getElementById('event-details-modal')) return;

        const event = this.extractObject(responses[0]);
        const dynamicData = this.extractDataObject(responses[1]);
        const project = this.findById(this.projects, event.ProjectID);
        const type = this.findById(this.eventTypes, event.EventTypeID);

        const rows = [
          ['شناسه رویداد', event.ID],
          [
            'پروژه',
            event.ProjectCode ||
              (project && (project.ProjectCode || project.Title || project.Name)) ||
              event.ProjectID
          ],
          [
            'نوع رویداد',
            event.EventTypeName ||
              (type && (type.Name || type.Code)) ||
              event.EventTypeID
          ],
          ['شرح', event.Description],
          ['ثبت‌کننده', this.creatorValue(event)],
          ['انجام‌دهنده', event.PerformedByName || event.PerformedBy],
          ['واحد', this.departmentValue(event)],
          ['تاریخ وقوع', this.formatDate(event.OccurredAt)],
          ['تاریخ ثبت', this.formatDate(event.CreatedAt)],
          ['وضعیت', this.statusText(event.Status)]
        ];

        let html = '<div class="event-detail-grid">';

        rows.forEach(function (row) {
          html +=
            '<div class="event-detail-card"><strong class="event-detail-label">' +
            Events.escape(row[0]) +
            '</strong><div class="event-detail-value">' +
            Events.escape(row[1] || '-') +
            '</div></div>';
        });

        html += '</div><h4 class="event-section-title">اطلاعات اختصاصی رویداد</h4>';

        const values = this.dynamicEntries(dynamicData);

        if (values.length) {
          html +=
            '<div class="event-modal-table-wrap"><table class="event-modal-table">' +
            '<thead><tr><th>فیلد</th><th>مقدار</th></tr></thead><tbody>';

          values.forEach(function (item) {
            html +=
              '<tr><td>' + Events.escape(item[0]) + '</td><td>' +
              Events.escape(item[1]) + '</td></tr>';
          });

          html += '</tbody></table></div>';
        } else {
          html += '<p class="event-muted">اطلاعات اختصاصی برای این رویداد ثبت نشده است.</p>';
        }

        const canEdit = Boolean(PMS.Router &&
          (PMS.Router.isAdmin() ||
            (Array.isArray(PMS.Router.permissions) &&
             PMS.Router.permissions.indexOf('EVENT_EDIT') !== -1)));
        if (canEdit && String(event.Status || '').toUpperCase() === 'ACTIVE') {
          html += '<div class="form-actions"><button type="button" class="btn btn-danger event-void-button" data-event-id="' +
            this.escape(eventId) + '">ابطال رویداد</button></div>';
        }
        const content = document.getElementById('event-details-content');
        if (content) content.innerHTML = html;
      } catch (error) {
        const content = document.getElementById('event-details-content');

        if (content) {
          content.innerHTML = '';

          const message = document.createElement('p');
          message.className = 'event-modal-error';
          message.setAttribute('role', 'alert');
          message.textContent =
            'دریافت جزئیات ناموفق بود: ' + this.errorMessage(error);

          content.appendChild(message);
        }
      }
    },

    voidEvent: async function (eventId) {
      if (!eventId) return;
      const router = PMS.Router;
      const allowed = Boolean(router &&
        (router.isAdmin() ||
          (Array.isArray(router.permissions) &&
           router.permissions.indexOf('EVENT_EDIT') !== -1)));
      if (!allowed) {
        alert('شما مجوز ابطال رویداد را ندارید.');
        return;
      }

      const reason = window.prompt('دلیل ابطال رویداد را وارد کنید:');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('وارد کردن دلیل ابطال الزامی است.');
        return;
      }
      if (!window.confirm('آیا از ابطال این رویداد مطمئن هستید؟')) return;

      try {
        await PMS.Api.put('/events/' + encodeURIComponent(eventId) + '/void', {
          reason: reason.trim()
        });
        PMS.Api.invalidateMany([CACHE_KEY]);
        await this.reloadEvents();
        this.showSuccessNotice('رویداد با موفقیت باطل شد.');
        this.openDetails(eventId);
      } catch (error) {
        alert('ابطال رویداد ناموفق بود: ' + this.errorMessage(error));
      }
    },

    extractObject: function (response) {
      const data = PMS.Api.extractData(response);

      if (Array.isArray(data)) return data[0] || {};
      if (data && data.event && typeof data.event === 'object') return data.event;

      return data && typeof data === 'object' ? data : {};
    },

    extractDataObject: function (response) {
      const data = PMS.Api.extractData(response);

      if (Array.isArray(data)) return data;

      if (data && typeof data === 'object') {
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.fields)) return data.fields;
        if (Array.isArray(data.values)) return data.values;
        if (data.data && typeof data.data === 'object') return data.data;

        return data;
      }

      return {};
    },

    dynamicEntries: function (data) {
      if (Array.isArray(data)) {
        return data.map(function (item) {
          if (item && typeof item === 'object') {
            return [
              item.Name || item.FieldName || item.Code || item.FieldCode || 'فیلد',
              Events.displayValue(
                item.Value !== undefined ? item.Value : item.FieldValue
              )
            ];
          }

          return ['', Events.displayValue(item)];
        });
      }

      if (!data || typeof data !== 'object') return [];

      return Object.keys(data).map(function (key) {
        const value = data[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const label = value.Name || value.FieldName || value.Label || key;

          const actual = value.Value !== undefined
            ? value.Value
            : value.FieldValue !== undefined
              ? value.FieldValue
              : JSON.stringify(value);

          return [label, Events.displayValue(actual)];
        }

        return [key, Events.displayValue(value)];
      });
    },

    displayValue: function (value) {
      if (value === null || value === undefined || value === '') return '-';
      if (typeof value === 'object') return JSON.stringify(value);
      if (value === true) return 'بله';
      if (value === false) return 'خیر';

      return String(value);
    },

    closeModal: function () {
      const details = document.getElementById('event-details-modal');
      if (details) details.remove();

      const form = document.getElementById('event-create-modal');
      if (form && !this.submitting) form.remove();

      this.modalOpen = Boolean(
        document.getElementById('event-create-modal')
      );
    },

    openForm: async function () {
      if (this.modalOpen || this.submitting) return;

      this.modalOpen = true;
      this.eventFields = [];
      this.fieldsLoading = false;
      this.fieldsReady = false;
      this.fieldsError = false;
      this.fieldsLoadedForTypeId = '';
      this.fieldsRequestId++;

      const modal = document.createElement('div');
      modal.id = 'event-create-modal';
      modal.dir = 'rtl';
      modal.className = 'event-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'event-form-title');

      modal.innerHTML =
        '<div class="event-modal-panel">' +
        '<div class="event-modal-heading"><div><span class="event-modal-kicker">مدیریت تولید</span>' +
        '<h3 id="event-form-title">ثبت رویداد جدید</h3>' +
        '<p class="event-modal-subtitle">اطلاعات فعالیت انجام‌شده را وارد کنید.</p></div>' +
        '<button type="button" id="event-form-close" class="event-modal-close" aria-label="بستن">×</button></div>' +
        '<div id="event-form-error" class="event-modal-error" role="alert" hidden></div>' +
        '<form id="event-create-form" novalidate>' +
        '<section class="event-form-section"><h4 class="event-section-title">اطلاعات اصلی</h4>' +
        '<div class="event-dynamic-grid">' +
        '<div class="event-field"><label for="event-form-project">پروژه <span class="event-required">*</span></label>' +
        '<select id="event-form-project" name="ProjectID" required><option value="">انتخاب پروژه</option></select></div>' +
        '<div class="event-field"><label for="event-form-type">نوع رویداد <span class="event-required">*</span></label>' +
        '<select id="event-form-type" name="EventTypeID" required><option value="">انتخاب نوع رویداد</option></select></div>' +
        '<div class="event-field"><label for="event-form-date">تاریخ و زمان وقوع <span class="event-required">*</span></label>' +
        '<input id="event-form-date" name="OccurredAt" type="datetime-local" required></div>' +
        '<div class="event-field event-field-wide"><label for="event-form-description">شرح رویداد</label>' +
        '<textarea id="event-form-description" name="Description" rows="3" placeholder="توضیحات تکمیلی، در صورت نیاز"></textarea></div>' +
        '</div></section>' +
        '<section class="event-form-section"><h4 class="event-section-title">اطلاعات اختصاصی رویداد</h4>' +
        '<div id="event-dynamic-fields" class="event-dynamic-grid" aria-live="polite">' +
        '<p class="event-muted">ابتدا نوع رویداد را انتخاب کنید.</p></div></section>' +
        '<div id="event-submit-progress" class="event-submit-progress" hidden role="status" aria-live="polite">' +
        '<span class="event-spinner" aria-hidden="true"></span><div><strong>در حال ثبت رویداد</strong>' +
        '<p>اطلاعات در حال ارسال و ذخیره‌سازی است؛ لطفاً این پنجره را نبندید.</p></div></div>' +
        '<div class="event-modal-actions">' +
        '<button type="submit" id="event-form-submit" class="event-modal-button event-modal-button-primary" disabled aria-disabled="true">' +
        '<span class="event-submit-button-text">ثبت رویداد</span><span class="event-button-spinner" aria-hidden="true" hidden></span></button>' +
        '<button type="button" id="event-form-cancel" class="event-modal-button">انصراف</button>' +
        '</div></form></div>';

      document.body.appendChild(modal);

      const projectSelect = document.getElementById('event-form-project');
      const typeSelect = document.getElementById('event-form-type');
      const dateInput = document.getElementById('event-form-date');

      this.projects.forEach(function (project) {
        const id = Events.idOf(project);
        if (!id) return;

        const option = document.createElement('option');
        option.value = id;
        option.textContent =
          project.ProjectCode || project.Title || project.Name || id;

        projectSelect.appendChild(option);
      });

      this.eventTypes.forEach(function (type) {
        const id = Events.idOf(type);

        if (!id ||
            String(type.Status || 'ACTIVE').toUpperCase() !== 'ACTIVE') {
          return;
        }

        const option = document.createElement('option');
        option.value = id;
        option.textContent = type.Name || type.Code || id;

        typeSelect.appendChild(option);
      });

      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.value = now.toISOString().slice(0, 16);

      document.getElementById('event-form-close')
        .addEventListener('click', () => this.closeForm());

      document.getElementById('event-form-cancel')
        .addEventListener('click', () => this.closeForm());

      typeSelect.addEventListener('change', () => {
        this.loadDynamicFields(typeSelect.value);
      });

      projectSelect.addEventListener('change', () => {
        this.updateSubmitAvailability();
      });

      dateInput.addEventListener('input', () => {
        this.updateSubmitAvailability();
      });

      dateInput.addEventListener('change', () => {
        this.updateSubmitAvailability();
      });

      document.getElementById('event-create-form')
        .addEventListener('submit', (event) => {
          event.preventDefault();
          this.submitForm();
        });

      modal.addEventListener('click', (event) => {
        if (event.target === modal && !this.submitting) {
          this.closeForm();
        }
      });

      this.updateSubmitAvailability();

      const firstInput = document.getElementById('event-form-project');
      if (firstInput) firstInput.focus();
    },

    loadDynamicFields: async function (eventTypeId) {
      const container = document.getElementById('event-dynamic-fields');
      const modalError = document.getElementById('event-form-error');

      const requestId = ++this.fieldsRequestId;
      const selectedTypeId = String(eventTypeId || '');

      this.eventFields = [];
      this.fieldsLoading = Boolean(selectedTypeId);
      this.fieldsReady = false;
      this.fieldsError = false;
      this.fieldsLoadedForTypeId = '';

      this.updateSubmitAvailability();

      if (modalError) {
        modalError.hidden = true;
        modalError.textContent = '';
      }

      if (!container) {
        this.fieldsLoading = false;
        this.fieldsReady = false;
        this.fieldsError = true;
        this.updateSubmitAvailability();
        return;
      }

      if (!selectedTypeId) {
        container.innerHTML =
          '<p class="event-muted">ابتدا نوع رویداد را انتخاب کنید.</p>';

        this.fieldsLoading = false;
        this.fieldsReady = false;
        this.fieldsError = false;
        this.fieldsLoadedForTypeId = '';

        this.updateSubmitAvailability();
        return;
      }

      container.innerHTML =
        '<div class="event-inline-loading"><span class="event-spinner" aria-hidden="true"></span>' +
        '<span>در حال آماده‌سازی فیلدهای این رویداد...</span></div>';

      try {
        const response = await PMS.Api.get(
          '/event-types/' + encodeURIComponent(selectedTypeId) + '/fields'
        );

        if (requestId !== this.fieldsRequestId ||
            !document.getElementById('event-create-modal')) {
          return;
        }

        const currentTypeSelect = document.getElementById('event-form-type');

        if (!currentTypeSelect ||
            String(currentTypeSelect.value || '') !== selectedTypeId) {
          return;
        }

        const fields = this.normalize(
          PMS.Api.extractData(response)
        ).filter(function (field) {
          return String(field.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
        });

        this.eventFields = fields;
        this.renderDynamicFields(fields);

        this.fieldsLoading = false;
        this.fieldsReady = true;
        this.fieldsError = false;
        this.fieldsLoadedForTypeId = selectedTypeId;

        this.updateSubmitAvailability();
      } catch (error) {
        if (requestId !== this.fieldsRequestId ||
            !document.getElementById('event-create-modal')) {
          return;
        }

        this.fieldsLoading = false;
        this.fieldsReady = false;
        this.fieldsError = true;
        this.fieldsLoadedForTypeId = '';
        this.eventFields = [];

        container.innerHTML = '';

        this.showFormError(
          'دریافت فیلدهای نوع رویداد ناموفق بود: ' +
          this.errorMessage(error)
        );

        this.updateSubmitAvailability();
      }
    },

    updateSubmitAvailability: function () {
      const button = document.getElementById('event-form-submit');

      if (!button) return;

      const projectInput = document.getElementById('event-form-project');
      const typeInput = document.getElementById('event-form-type');
      const dateInput = document.getElementById('event-form-date');

      const projectSelected = Boolean(
        projectInput && String(projectInput.value || '').trim()
      );

      const typeSelected = Boolean(
        typeInput && String(typeInput.value || '').trim()
      );

      const dateSelected = Boolean(
        dateInput && String(dateInput.value || '').trim()
      );

      const typeMatchesLoadedFields = Boolean(
        typeSelected &&
        this.fieldsLoadedForTypeId &&
        String(typeInput.value) === String(this.fieldsLoadedForTypeId)
      );

      const canSubmit =
        !this.submitting &&
        projectSelected &&
        typeSelected &&
        dateSelected &&
        this.fieldsReady &&
        !this.fieldsLoading &&
        !this.fieldsError &&
        typeMatchesLoadedFields;

      button.disabled = !canSubmit;
      button.setAttribute('aria-disabled', String(!canSubmit));
    },

    renderDynamicFields: function (fields) {
      const container = document.getElementById('event-dynamic-fields');
      if (!container) return;

      if (!fields.length) {
        container.innerHTML =
          '<p class="event-muted">برای این نوع رویداد فیلد اختصاصی تعریف نشده است.</p>';
        return;
      }

      container.replaceChildren();

      fields.sort(function (a, b) {
        return Number(a.FieldOrder || 0) - Number(b.FieldOrder || 0);
      });

      fields.forEach((field, index) => {
        const code = String(field.Code || '');
        const type = String(field.FieldType || 'text').toLowerCase();
        const required = Events.isRequired(field);
        const label = (field.Name || code) + (required ? ' *' : '');
        const wrapper = document.createElement('div');

        wrapper.className = 'event-field';

        if (type === 'boolean') {
          const labelElement = document.createElement('label');
          labelElement.className = 'event-checkbox-label';

          const input = document.createElement('input');
          input.type = 'checkbox';
          input.dataset.dynamicCode = code;
          input.id = 'event-dynamic-' + index;

          labelElement.htmlFor = input.id;
          labelElement.appendChild(input);
          labelElement.appendChild(document.createTextNode(label));

          wrapper.appendChild(labelElement);
        } else {
          const labelElement = document.createElement('label');
          labelElement.textContent = label;
          labelElement.htmlFor = 'event-dynamic-' + index;

          const input = Events.createFieldInput(field, type);
          input.dataset.dynamicCode = code;
          input.id = 'event-dynamic-' + index;
          input.required = required;

          if (field.DefaultValue !== null &&
              field.DefaultValue !== undefined &&
              String(field.DefaultValue) !== '') {
            input.value = String(field.DefaultValue);
          }

          wrapper.appendChild(labelElement);
          wrapper.appendChild(input);
        }

        container.appendChild(wrapper);
      });
    },

    createFieldInput: function (field, type) {
      let input;

      if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else if (type === 'select') {
        input = document.createElement('select');

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'انتخاب کنید';

        input.appendChild(placeholder);

        this.parseOptions(field.Options).forEach(function (item) {
          const option = document.createElement('option');
          option.value = item.value;
          option.textContent = item.label;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');

        const types = {
          text: 'text',
          number: 'number',
          date: 'date',
          datetime: 'datetime-local'
        };

        input.type = types[type] || 'text';

        if (type === 'number') input.step = 'any';
      }

      input.name = 'dynamic_' + (field.Code || '');

      return input;
    },

    parseOptions: function (value) {
      if (!value) return [];

      let options;

      try {
        options = JSON.parse(value);
      } catch (error) {
        options = String(value).split(',');
      }

      if (!Array.isArray(options)) return [];

      return options.map(function (item) {
        if (item && typeof item === 'object') {
          const optionValue =
            item.value !== undefined ? item.value : item.label;

          return {
            value: String(
              optionValue === undefined ? '' : optionValue
            ).trim(),
            label: String(
              item.label !== undefined ? item.label : optionValue
            ).trim()
          };
        }

        const text = String(item).trim();

        return {
          value: text,
          label: text
        };
      }).filter(function (item) {
        return item.value !== '';
      });
    },

    isRequired: function (field) {
      const value = field.IsRequired;

      return value === true ||
        String(value).toLowerCase() === 'true' ||
        String(value) === '1';
    },

    submitForm: async function () {
      if (this.submitting) return;

      const form = document.getElementById('event-create-form');
      if (!form) return;

      const projectInput = document.getElementById('event-form-project');
      const typeInput = document.getElementById('event-form-type');
      const dateInput = document.getElementById('event-form-date');
      const descriptionInput = document.getElementById('event-form-description');

      if (!projectInput || !typeInput || !dateInput || !descriptionInput) {
        this.showFormError('فرم ثبت رویداد کامل بارگذاری نشده است. پنجره را ببندید و دوباره باز کنید.');
        return;
      }

      const selectedTypeId = String(typeInput.value || '');

      if (!selectedTypeId) {
        this.showFormError('ابتدا نوع رویداد را انتخاب کنید.');
        typeInput.focus();
        return;
      }

      if (this.fieldsLoading) {
        this.showFormError('فیلدهای نوع رویداد هنوز در حال بارگذاری هستند. کمی صبر کنید.');
        return;
      }

      if (this.fieldsError || !this.fieldsReady) {
        this.showFormError('فیلدهای نوع رویداد آماده نیستند. نوع رویداد را دوباره انتخاب کنید.');
        return;
      }

      if (String(this.fieldsLoadedForTypeId) !== selectedTypeId) {
        this.showFormError('نوع رویداد تغییر کرده است. منتظر آماده‌شدن فیلدهای آن بمانید.');
        return;
      }

      if (!form.reportValidity()) return;

      const projectId = projectInput.value;
      const typeId = typeInput.value;
      const occurredAt = dateInput.value;
      const description = descriptionInput.value.trim();
      const dynamicData = {};

      for (const input of form.querySelectorAll('[data-dynamic-code]')) {
        const code = input.dataset.dynamicCode;
        if (!code) continue;

        if (input.type === 'checkbox') {
          dynamicData[code] = input.checked;
          continue;
        }

        const value = input.value;

        if (input.required && String(value).trim() === '') {
          input.reportValidity();
          input.focus();
          return;
        }

        if (String(value).trim() !== '') {
          dynamicData[code] =
            input.type === 'number' ? Number(value) : value;
        }
      }

      const type = this.findById(this.eventTypes, typeId);
      const date = new Date(occurredAt);

      if (isNaN(date.getTime())) {
        this.showFormError('تاریخ و زمان واردشده معتبر نیست.');
        return;
      }

      const payload = {
        ProjectID: projectId,
        EventTypeID: typeId,
        EventTypeVersion: type ? Number(type.Version || 1) : 1,
        OccurredAt: date.toISOString(),
        Description: description,
        DynamicData: dynamicData
      };

      this.submitting = true;
      this.setSubmitState(true);

      try {
        await PMS.Api.post('/events', payload);

        PMS.Api.invalidateMany([
          CACHE_KEY,
          PROJECTS_CACHE_KEY,
          EVENT_TYPES_CACHE_KEY
        ]);

        // موفقیت ثبت را از موفقیت تازه‌سازی فهرست جدا نگه می‌داریم.
        this.closeForm(true);

        try {
          await this.reloadEvents();
        } catch (refreshError) {
          // رویداد ثبت شده است؛ فقط تازه‌سازی فهرست ناموفق بوده.
          this.showRefreshNotice();
        }

        this.showSuccessNotice('رویداد با موفقیت ثبت شد.');
      } catch (error) {
        this.showFormError(
          'ثبت رویداد ناموفق بود: ' + this.errorMessage(error)
        );
      } finally {
        this.submitting = false;
        this.setSubmitState(false);
      }
    },

    reloadEvents: async function () {
      const response = await PMS.Api.getFresh('/events', CACHE_KEY);

      this.events = this.normalize(PMS.Api.extractData(response));
      this.renderFilters();
      this.applyFilters();
    },

    setSubmitState: function (busy) {
      const modal = document.getElementById('event-create-modal');
      const button = document.getElementById('event-form-submit');
      const cancel = document.getElementById('event-form-cancel');
      const close = document.getElementById('event-form-close');
      const progress = document.getElementById('event-submit-progress');
      const buttonText =
        button && button.querySelector('.event-submit-button-text');
      const spinner =
        button && button.querySelector('.event-button-spinner');

      if (modal) {
        modal.classList.toggle('is-submitting', busy);
        modal.setAttribute('aria-busy', String(busy));
      }

      if (button) {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
      }

      if (cancel) cancel.disabled = busy;
      if (close) close.disabled = busy;
      if (progress) progress.hidden = !busy;
      if (spinner) spinner.hidden = !busy;

      if (buttonText) {
        buttonText.textContent = busy ? 'در حال ثبت...' : 'ثبت رویداد';
      }

      const errorBox = document.getElementById('event-form-error');

      if (busy && errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }

      // پس از پایان ثبت، فقط در صورت آماده‌بودن واقعی فرم دکمه فعال می‌شود.
      if (!busy) {
        this.updateSubmitAvailability();
      }
    },

    showFormError: function (message) {
      const box = document.getElementById('event-form-error');

      if (!box) {
        alert(message);
        return;
      }

      box.textContent = message;
      box.hidden = false;
      box.focus();
    },

    showSuccessNotice: function (message) {
      this.showNotice(message, 'success');
    },

    showRefreshNotice: function () {
      this.showNotice(
        'ثبت رویداد انجام شد، اما به‌روزرسانی فهرست کامل نشد. صفحه را دوباره بارگذاری کنید.',
        'warning'
      );
    },

    showNotice: function (message, type) {
      const notice = document.createElement('div');
      notice.className = 'event-toast event-toast-' + type;
      notice.setAttribute('role', 'status');
      notice.textContent = message;

      document.body.appendChild(notice);

      requestAnimationFrame(function () {
        notice.classList.add('is-visible');
      });

      setTimeout(function () {
        notice.classList.remove('is-visible');

        setTimeout(function () {
          notice.remove();
        }, 250);
      }, 4000);
    },

    errorMessage: function (error) {
      return error && error.message ? error.message : 'خطای نامشخص';
    },

    closeForm: function (force) {
      if (this.submitting && !force) return;

      const modal = document.getElementById('event-create-modal');
      if (modal) modal.remove();

      this.modalOpen = false;
      this.eventFields = [];
      this.fieldsLoading = false;
      this.fieldsReady = false;
      this.fieldsError = false;
      this.fieldsLoadedForTypeId = '';

      // پاسخ درخواست قبلی دیگر نباید وضعیت فرم را تغییر دهد.
      this.fieldsRequestId++;
    },

    creatorValue: function (event) {
      return String(
        event.CreatorName ||
        event.CreatedByName ||
        event.CreatedBy ||
        ''
      ).trim() || '-';
    },

    departmentValue: function (event) {
      return String(
        event.DepartmentName ||
        event.DepartmentTitle ||
        event.DepartmentID ||
        ''
      ).trim() || '-';
    },

    statusText: function (status) {
      const map = {
        ACTIVE: 'فعال',
        VOID: 'باطل‌شده',
        INACTIVE: 'غیرفعال'
      };

      return map[String(status || '').toUpperCase()] || status || '-';
    },

    formatDate: function (value) {
      if (!value) return '-';

      try {
        const date = new Date(value);

        if (isNaN(date.getTime())) return String(value);

        return date.toLocaleString('fa-IR');
      } catch (error) {
        return String(value);
      }
    },

    showError: function (error) {
      const box = document.getElementById('events-error');
      if (!box) return;

      box.textContent = error && error.message
        ? error.message
        : 'خطا در دریافت رویدادها.';

      box.hidden = false;
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
  window.PMS.Events = Events;
  window.PMS.Modules.Events = Events;
})();