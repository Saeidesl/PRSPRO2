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
    formDefinitions: [],
    formsReady: true,
    formsRequestId: 0,
    modalOpen: false,
    submitting: false,
    escapeHandlerBound: false,
    pendingIdempotencyKey: '',
    pendingIdempotencyFingerprint: '',
    fieldsRequestId: 0,
    fieldsLoading: false,
    fieldsReady: false,
    fieldsError: false,
    fieldsLoadedForTypeId: '',
    searchTimer: null,
    preselectedProjectId: '',

    init: function () {
      this.bindEvents();

      const createButton = document.getElementById('event-create-button');
      if (createButton) {
        const canCreateEvents = !!(
          PMS.Router &&
          (
            (typeof PMS.Router.isAdmin === 'function' && PMS.Router.isAdmin()) ||
            (Array.isArray(PMS.Router.permissions) &&
              PMS.Router.permissions.indexOf('EVENT_CREATE') !== -1)
          )
        );
        createButton.hidden = !canCreateEvents;
      }

      this.load();
    },

    bindEvents: function () {
      if (!this.escapeHandlerBound) {
        this.escapeHandlerBound = true;
        document.addEventListener('keydown', function (event) {
          if (!Events.modalOpen) return;
          if (event.key === 'Escape') {
            if (!Events.submitting) Events.closeModal();
            return;
          }
          if (event.key !== 'Tab') return;
          const overlay = document.getElementById('event-create-modal') ||
            document.getElementById('event-details-modal');
          const dialog = overlay && overlay.querySelector('[role="dialog"]');
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
        });
      }

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
          filterButton.classList.toggle('is-expanded', !content.hidden);

          if (arrow) arrow.textContent = content.hidden ? '⌄' : '⌃';
          return;
        }

        const queueTab = target.closest('.event-queue-tab');
        if (queueTab) {
          event.preventDefault();
          Events.activateQueue(queueTab.dataset.queue);
          return;
        }

        if (target.closest('#event-create-button')) {
          event.preventDefault();
          Events.openForm();
          return;
        }

        const queueAction = target.closest('.event-queue-register-button');
        if (queueAction) {
          event.preventDefault();
          Events.preselectedProjectId = String(queueAction.dataset.projectId || '');
          Events.openForm();
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
      const router = PMS.Router;
      const isAdmin = !!(
        router &&
        typeof router.isAdmin === 'function' &&
        router.isAdmin()
      );
      const permissions = router && Array.isArray(router.permissions)
        ? router.permissions
        : [];
      const canViewEvents = isAdmin || permissions.indexOf('EVENT_VIEW') !== -1;
      const canViewProjects = isAdmin || permissions.indexOf('PROJECT_VIEW') !== -1;
      const canLoadEventTypes = isAdmin ||
        permissions.indexOf('EVENT_CREATE') !== -1 ||
        permissions.indexOf('EVENT_TYPE_MANAGE') !== -1;

      const cachedEvents = canViewEvents ? PMS.Cache.get(CACHE_KEY) : null;
      const cachedProjects = canViewProjects
        ? PMS.Cache.get(PROJECTS_CACHE_KEY)
        : null;
      const cachedTypes = canLoadEventTypes
        ? PMS.Cache.get(EVENT_TYPES_CACHE_KEY)
        : null;

      if (!canViewEvents) {
        this.events = [];
        PMS.Cache.remove(CACHE_KEY);
      }
      if (!canViewProjects) {
        this.projects = [];
        PMS.Cache.remove(PROJECTS_CACHE_KEY);
      }
      if (!canLoadEventTypes) {
        this.eventTypes = [];
        PMS.Cache.remove(EVENT_TYPES_CACHE_KEY);
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
        const resultKeys = [];

        if (canViewEvents) {
          resultKeys.push('events');
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

        if (canViewProjects) {
          resultKeys.push('projects');
          requests.push(
            PMS.Api.getCached('/projects', PROJECTS_CACHE_KEY, {
              onRefresh: function (data) {
                Events.projects = Events.normalize(data);
                Events.renderFilters();
                Events.applyFilters();
              }
            })
          );
        }

        if (canLoadEventTypes) {
          resultKeys.push('types');
          requests.push(
            PMS.Api.getCached('/event-types', EVENT_TYPES_CACHE_KEY, {
              onRefresh: function (data) {
                Events.eventTypes = Events.normalize(data);
                Events.renderFilters();
                Events.applyFilters();
              }
            })
          );
        }

        const results = await Promise.all(requests);
        results.forEach(function (result, index) {
          if (!result || result.cached !== false) return;

          const key = resultKeys[index];
          if (key === 'events') Events.events = Events.normalize(result.data);
          if (key === 'projects') Events.projects = Events.normalize(result.data);
          if (key === 'types') Events.eventTypes = Events.normalize(result.data);
        });

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

      this.renderProjectQueues();

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

    activateQueue: function (key) {
      const allowed = ['pending', 'progress', 'completed'];
      if (allowed.indexOf(key) === -1) return;

      allowed.forEach(function (name) {
        const tab = document.querySelector('.event-queue-tab[data-queue="' + name + '"]');
        const panel = document.getElementById('event-panel-' + name);
        const active = name === key;

        if (tab) {
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
        }

        if (panel) {
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        }
      });
    },

    renderProjectQueues: function () {
      const user = PMS.Router && typeof PMS.Router.getUser === 'function' ? PMS.Router.getUser() || {} : {};
      const userId = String(user.ID || user.Id || user.id || '');
      const departmentId = String(user.DepartmentID || user.departmentId || '');
      const activeEvents = this.events.filter(function (event) {
        return String(event.Status || 'ACTIVE').toUpperCase() !== 'VOID' && String(event.ProjectID || '').trim() !== '';
      });
      const typeMap = new Map();
      this.eventTypes.forEach(function (type) { typeMap.set(Events.idOf(type), type); });
      const queues = { pending: [], progress: [], completed: [] };
      this.projects.forEach(function (project) {
        const projectId = Events.idOf(project);
        if (!projectId) return;
        const related = activeEvents.filter(function (event) {
          if (String(event.ProjectID || '') !== projectId) return false;
          if (departmentId) return String(event.DepartmentID || '') === departmentId ||
            String(event.PerformedBy || '') === userId || String(event.CreatedBy || '') === userId;
          return !!userId && (String(event.PerformedBy || '') === userId || String(event.CreatedBy || '') === userId);
        });
        const completed = related.some(function (event) {
          const type = typeMap.get(String(event.EventTypeID || ''));
          return event.IsWorkCompletion === true ||
            String(event.IsWorkCompletion).toLowerCase() === 'true' || String(event.IsWorkCompletion) === '1' ||
            (!!type && (type.IsWorkCompletion === true ||
              String(type.IsWorkCompletion).toLowerCase() === 'true' || String(type.IsWorkCompletion) === '1'));
        });
        queues[completed ? 'completed' : related.length ? 'progress' : 'pending'].push(project);
      });
      const definitions = [
        { key: 'pending', id: 'event-queue-pending', countId: 'event-queue-pending-count', empty: 'پروژه‌ای در انتظار اقدام نیست.' },
        { key: 'progress', id: 'event-queue-progress', countId: 'event-queue-progress-count', empty: 'پروژه‌ای در حال انجام نیست.' },
        { key: 'completed', id: 'event-queue-completed', countId: 'event-queue-completed-count', empty: 'هنوز پروژه‌ای با رویداد پایان کار ثبت نشده است.' }
      ];
      definitions.forEach(function (definition) {
        const container = document.getElementById(definition.id);
        const count = document.getElementById(definition.countId);
        if (!container) return;
        const items = queues[definition.key];
        if (count) count.textContent = String(items.length).replace(/\d/g, function (digit) { return '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]; });
        if (!items.length) {
          container.innerHTML = '<p class="event-queue-empty">' + Events.escape(definition.empty) + '</p>';
          return;
        }
        container.innerHTML = items.map(function (project) {
          const id = Events.idOf(project);
          const code = project.ProjectCode || id;
          const title = project.Title || project.Name || project.ProjectName || 'بدون عنوان';
          const status = project.CurrentStepStatus || project.Status || '';
          return '<article class="event-queue-project"><strong>' + Events.escape(code) + ' — ' + Events.escape(title) + '</strong>' +
            (status ? '<p>' + Events.escape(status) + '</p>' : '') +
            '<button type="button" class="btn btn-secondary event-queue-register-button" data-project-id="' + Events.escape(id) + '">ثبت رویداد برای این پروژه</button></article>';
        }).join('');
      });
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

      const previousFocus = document.activeElement;
      const modal = document.createElement('div');
      modal.id = 'event-details-modal';
      modal._pmsFocusReturn = previousFocus;
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
      const detailsFirstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (detailsFirstFocusable) detailsFirstFocusable.focus();

      document.getElementById('event-details-close')
        .addEventListener('click', () => this.closeModal());

      modal.addEventListener('click', (event) => {
        if (event.target === modal) this.closeModal();
      });

      try {
        const responses = await Promise.all([
          PMS.Api.get('/events/' + encodeURIComponent(eventId)),
          PMS.Api.get('/events/' + encodeURIComponent(eventId) + '/data'),
          PMS.Api.get('/events/' + encodeURIComponent(eventId) + '/forms')
        ]);

        if (!document.getElementById('event-details-modal')) return;

        const event = this.extractObject(responses[0]);
        const dynamicData = this.extractDataObject(responses[1]);
        const formResponses = this.normalize(responses[2]);
        const project = this.findById(this.projects, event.ProjectID);
        const type = this.findById(this.eventTypes, event.EventTypeID);
        let variantDetails = [];
        try {
          const parsedVariants = JSON.parse(String(event.VariantDetailsJSON || '[]'));
          if (Array.isArray(parsedVariants)) variantDetails = parsedVariants;
        } catch (error) {}
        const variantSummary = variantDetails.map(function (variant) {
          const parts = [];
          if (variant.Color) parts.push('رنگ ' + variant.Color);
          if (variant.Size) parts.push('سایز ' + variant.Size);
          if (variant.VariantQuantity !== '' && variant.VariantQuantity !== undefined && variant.VariantQuantity !== null) {
            parts.push('تعداد ' + variant.VariantQuantity);
          }
          return parts.join('، ');
        }).filter(Boolean).join(' | ');

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
          ...(variantDetails.length > 1 && variantSummary ? [['ترکیب‌های رنگ/سایز', variantSummary]] : []),
          ...(variantDetails.length <= 1 && event.Color ? [['رنگ', event.Color]] : []),
          ...(variantDetails.length <= 1 && event.Size ? [['سایز', event.Size]] : []),
          ...(variantDetails.length <= 1 && event.VariantQuantity !== undefined && event.VariantQuantity !== null && String(event.VariantQuantity) !== '' ? [['مقدار رنگ/سایز', event.VariantQuantity]] : []),
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

        if (formResponses.length) {
          html += '<h4 class="event-section-title">فرم‌های اطلاعات ثبت‌شده</h4>';
          formResponses.forEach(function (response) {
            const definition = response.Definition || {};
            html += '<section class="event-form-response-card"><h5>' +
              Events.escape(definition.Name || definition.Code || 'فرم') + '</h5>';
            const fields = Array.isArray(definition.Fields) ? definition.Fields : [];
            fields.forEach(function (field) {
              const info = field.InformationType || {};
              const key = String(field.InformationTypeID || info.ID || '');
              const value = response.Values ? response.Values[key] : null;
              const label = field.LabelOverride || info.Name || info.Code || 'اطلاعات';
              html += '<div class="event-form-response-field"><strong>' + Events.escape(label) + '</strong>';
              if (String(info.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE' && Array.isArray(value)) {
                const columns = Array.isArray(info.Columns) ? info.Columns : [];
                if (value.length && columns.length) {
                  html += '<div class="event-modal-table-wrap"><table class="event-modal-table"><thead><tr>';
                  columns.forEach(function (column) { html += '<th>' + Events.escape(column.Name || column.Code) + '</th>'; });
                  html += '</tr></thead><tbody>';
                  value.forEach(function (row) {
                    html += '<tr>';
                    columns.forEach(function (column) { html += '<td>' + Events.escape(Events.displayValue(row[String(column.Code)])) + '</td>'; });
                    html += '</tr>';
                  });
                  html += '</tbody></table></div>';
                } else {
                  html += '<p class="event-muted">ردیفی ثبت نشده است.</p>';
                }
              } else {
                html += '<div>' + Events.escape(Events.displayValue(value)) + '</div>';
              }
              html += '</div>';
            });
            html += '</section>';
          });
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
      const form = document.getElementById('event-create-modal');
      const focusReturn = (form && !this.submitting && form._pmsFocusReturn) ||
        (details && details._pmsFocusReturn);

      if (details) details.remove();
      if (form && !this.submitting) form.remove();

      this.modalOpen = Boolean(
        document.getElementById('event-create-modal')
      );
      if (!this.modalOpen && focusReturn && focusReturn.isConnected &&
          typeof focusReturn.focus === 'function') {
        focusReturn.focus();
      }
    },

    openForm: async function () {
      if (this.modalOpen || this.submitting) return;

      this.modalOpen = true;
      this.eventFields = [];
      this.formDefinitions = [];
      this.formsReady = true;
      this.formsRequestId++;
      this.fieldsLoading = false;
      this.fieldsReady = false;
      this.fieldsError = false;
      this.fieldsLoadedForTypeId = '';
      this.fieldsRequestId++;

      const previousFocus = document.activeElement;
      const modal = document.createElement('div');
      modal.id = 'event-create-modal';
      modal._pmsFocusReturn = previousFocus;
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
        '<select id="event-form-project" name="ProjectID"><option value="">انتخاب پروژه</option></select></div>' +
        '<div class="event-field"><label for="event-form-type">نوع رویداد <span class="event-required">*</span></label>' +
        '<select id="event-form-type" name="EventTypeID" required><option value="">انتخاب نوع رویداد</option></select></div>' +
        '<div class="event-field"><label for="event-form-date">تاریخ و زمان وقوع <span class="event-required">*</span></label>' +
        '<input id="event-form-date" name="OccurredAt" type="datetime-local" required></div>' +
        '<div class="event-field event-field-wide"><label for="event-form-description">شرح رویداد</label>' +
        '<textarea id="event-form-description" name="Description" rows="3" placeholder="توضیحات تکمیلی، در صورت نیاز"></textarea></div>' +
        '</div></section>' +
        '<section class="event-form-section" id="event-variant-section" hidden><h4 class="event-section-title">رنگ‌بندی، سایزبندی و مقدار</h4>' +
        '<div id="event-variant-fields" class="event-dynamic-grid"></div></section>' +
        '<section class="event-form-section"><h4 class="event-section-title">اطلاعات اختصاصی رویداد</h4>' +
        '<div id="event-dynamic-fields" class="event-dynamic-grid" aria-live="polite">' +
        '<p class="event-muted">ابتدا نوع رویداد را انتخاب کنید.</p></div></section>' +
        '<section class="event-form-section" id="event-configured-forms-section" hidden><h4 class="event-section-title">فرم‌های اطلاعات تکمیلی</h4>' +
        '<div id="event-configured-forms" class="event-dynamic-grid" aria-live="polite"></div></section>' +
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

      // When arriving from a project detail page, preselect that project.
      if (this.preselectedProjectId) {
        const requestedProjectId = String(this.preselectedProjectId);
        if (Array.from(projectSelect.options).some(function (option) {
          return option.value === requestedProjectId;
        })) {
          projectSelect.value = requestedProjectId;
        }
        this.preselectedProjectId = '';
      }

      const router = PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const canViewProjects = !!(router && typeof router.isAdmin === 'function' && router.isAdmin()) ||
        permissions.indexOf('PROJECT_VIEW') !== -1;

      this.eventTypes.forEach(function (type) {
        const id = Events.idOf(type);
        const isProjectEvent = String(type.ConnectionType || 'PROJECT').toUpperCase() !== 'INDEPENDENT';

        if (!id ||
            String(type.Status || 'ACTIVE').toUpperCase() !== 'ACTIVE' ||
            (!canViewProjects && isProjectEvent)) {
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
        const selectedType = this.findById(this.eventTypes, typeSelect.value);
        const isIndependent = !!selectedType &&
          String(selectedType.ConnectionType || 'PROJECT').toUpperCase() === 'INDEPENDENT';
        const projectField = projectSelect.closest('.event-field');
        if (projectField) projectField.hidden = isIndependent;
        projectSelect.required = !isIndependent;
        if (isIndependent) projectSelect.value = '';
        this.updateSubmitAvailability();
        this.renderVariantFields();
        this.loadDynamicFields(typeSelect.value);
      });

      projectSelect.addEventListener('change', () => {
        this.updateSubmitAvailability();
        this.renderVariantFields();
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

    renderVariantFields: function () {
      const section = document.getElementById('event-variant-section');
      const container = document.getElementById('event-variant-fields');
      const typeInput = document.getElementById('event-form-type');
      const projectInput = document.getElementById('event-form-project');
      if (!section || !container || !typeInput || !projectInput) return;
      const type = this.findById(this.eventTypes, typeInput.value);
      const project = this.findById(this.projects, projectInput.value);
      const isProjectEvent = !!type && String(type.ConnectionType || 'PROJECT').toUpperCase() !== 'INDEPENDENT';
      const flag = (value) => value === true || String(value).toLowerCase() === 'true';
      const useColors = isProjectEvent && flag(type.UseProjectColors);
      const useSizes = isProjectEvent && flag(type.UseProjectSizes);
      const trackQuantity = isProjectEvent && flag(type.TrackVariantQuantity);
      if (!useColors && !useSizes && !trackQuantity) {
        section.hidden = true;
        container.replaceChildren();
        return;
      }
      let variants = { colors: [], sizes: [] };
      try {
        const parsed = JSON.parse(String(project && project.ColorSizeJSON || '{"colors":[],"sizes":[]}'));
        if (parsed && typeof parsed === 'object') variants = {
          colors: Array.isArray(parsed.colors) ? parsed.colors : [],
          sizes: Array.isArray(parsed.sizes) ? parsed.sizes : []
        };
      } catch (error) {}
      section.hidden = false;
      container.replaceChildren();

      const addRow = () => {
        const row = document.createElement('div');
        row.className = 'event-variant-row';
        row.style.display = 'grid';
        row.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
        row.style.gap = '10px';
        row.style.alignItems = 'end';
        row.style.marginBottom = '10px';
        row.dataset.variantRow = '1';

        const addSelect = (name, label, options) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'event-field';
          const inputId = 'event-variant-' + name + '-' + container.querySelectorAll('[data-variant-row]').length;
          const labelEl = document.createElement('label');
          labelEl.textContent = label + ' *';
          labelEl.htmlFor = inputId;
          const select = document.createElement('select');
          select.name = name;
          select.id = inputId;
          select.dataset.variantField = name;
          select.required = true;
          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = 'انتخاب کنید';
          select.appendChild(placeholder);
          options.forEach((value) => {
            const option = document.createElement('option');
            option.value = String(value);
            option.textContent = String(value);
            select.appendChild(option);
          });
          wrapper.appendChild(labelEl);
          wrapper.appendChild(select);
          row.appendChild(wrapper);
        };

        if (useColors) addSelect('Color', 'رنگ', variants.colors);
        if (useSizes) addSelect('Size', 'سایز', variants.sizes);
        if (trackQuantity) {
          const wrapper = document.createElement('div');
          wrapper.className = 'event-field';
          const label = document.createElement('label');
          label.textContent = 'مقدار این ترکیب *';
          const input = document.createElement('input');
          input.type = 'number';
          input.min = '1';
          input.step = '1';
          input.required = true;
          input.inputMode = 'numeric';
          input.dataset.variantField = 'VariantQuantity';
          wrapper.appendChild(label);
          wrapper.appendChild(input);
          row.appendChild(wrapper);
        }

        const removeWrap = document.createElement('div');
        removeWrap.className = 'event-field';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn btn-secondary';
        remove.textContent = 'حذف ردیف';
        remove.addEventListener('click', () => {
          row.remove();
          updateRemoveButtons();
        });
        removeWrap.appendChild(remove);
        row.appendChild(removeWrap);
        container.appendChild(row);
        updateRemoveButtons();
      };

      const updateRemoveButtons = () => {
        const rows = Array.from(container.querySelectorAll('[data-variant-row]'));
        rows.forEach((row) => {
          const button = row.querySelector('button');
          if (button) button.disabled = rows.length <= 1;
        });
      };

      addRow();
      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'btn btn-secondary';
      addButton.textContent = 'افزودن ترکیب رنگ/سایز';
      addButton.addEventListener('click', () => {
        if (container.querySelectorAll('[data-variant-row]').length >= 500) {
          this.showFormError('در هر رویداد حداکثر ۵۰۰ ردیف رنگ و سایز قابل ثبت است.');
          return;
        }
        addRow();
      });
      container.appendChild(addButton);

      if (!project && isProjectEvent) {
        const note = document.createElement('p');
        note.className = 'event-muted';
        note.textContent = 'ابتدا پروژه را انتخاب کنید تا رنگ‌ها و سایزهای آن نمایش داده شوند.';
        container.prepend(note);
      } else if ((useColors && variants.colors.length === 0) || (useSizes && variants.sizes.length === 0)) {
        const note = document.createElement('p');
        note.className = 'event-muted';
        note.textContent = 'برای این پروژه هنوز فهرست رنگ یا سایز تعریف نشده است. مشخصات پروژه را کامل کنید.';
        container.prepend(note);
      }
    },

    loadDynamicFields: async function (eventTypeId) {
      const container = document.getElementById('event-dynamic-fields');
      const modalError = document.getElementById('event-form-error');

      const requestId = ++this.fieldsRequestId;
      const selectedTypeId = String(eventTypeId || '');

      this.eventFields = [];
      this.formDefinitions = [];
      this.formsReady = !selectedTypeId;
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
        this.formDefinitions = [];
        this.formsReady = true;
        const formSection = document.getElementById('event-configured-forms-section');
        if (formSection) formSection.hidden = true;

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
        await this.loadConfiguredForms(selectedTypeId);

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

      const typeSelected = Boolean(
        typeInput && String(typeInput.value || '').trim()
      );
      const selectedType = typeInput
        ? this.findById(this.eventTypes, typeInput.value)
        : null;
      const isIndependent = !!selectedType &&
        String(selectedType.ConnectionType || 'PROJECT').toUpperCase() === 'INDEPENDENT';
      const projectSelected = isIndependent || Boolean(
        projectInput && String(projectInput.value || '').trim()
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
        this.formsReady &&
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

    loadConfiguredForms: async function (eventTypeId) {
      const requestId = ++this.formsRequestId;
      const section = document.getElementById('event-configured-forms-section');
      const container = document.getElementById('event-configured-forms');
      this.formsReady = false;
      this.updateSubmitAvailability();
      if (!section || !container) {
        this.formsReady = true;
        this.updateSubmitAvailability();
        return;
      }
      section.hidden = false;
      container.innerHTML = '<p class="event-muted">در حال دریافت فرم‌های متصل…</p>';
      try {
        const response = await PMS.Api.get('/event-types/' + encodeURIComponent(eventTypeId) + '/forms');
        if (requestId !== this.formsRequestId || !document.getElementById('event-create-modal')) return;
        const data = PMS.Api.extractData(response);
        this.formDefinitions = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
        this.renderConfiguredForms();
        this.formsReady = true;
      } catch (error) {
        if (requestId !== this.formsRequestId) return;
        this.formDefinitions = [];
        container.innerHTML = '';
        this.showFormError('دریافت فرم‌های متصل ناموفق بود: ' + this.errorMessage(error));
        this.formsReady = false;
      }
      this.updateSubmitAvailability();
    },

    renderConfiguredForms: function () {
      const section = document.getElementById('event-configured-forms-section');
      const container = document.getElementById('event-configured-forms');
      if (!section || !container) return;
      const definitions = this.formDefinitions || [];
      section.hidden = definitions.length === 0;
      container.replaceChildren();
      definitions.forEach((mapping) => {
        const form = mapping.Form || {};
        const fields = Array.isArray(form.Fields) ? form.Fields : [];
        const card = document.createElement('div');
        card.className = 'event-configured-form-card';
        card.dataset.formId = form.ID || mapping.FormID;
        card.dataset.formVersion = String(form.Version || 1);
        const heading = document.createElement('h5');
        heading.textContent = form.Name || form.Code || 'فرم اطلاعات';
        card.appendChild(heading);
        if (mapping.IsRequired === true || String(mapping.IsRequired).toLowerCase() === 'true') {
          const required = document.createElement('p');
          required.className = 'event-muted';
          required.textContent = 'تکمیل این فرم برای ثبت رویداد الزامی است.';
          card.appendChild(required);
        }
        fields.forEach((field, index) => {
          const info = field.InformationType || {};
          const typeId = String(field.InformationTypeID || info.ID || '');
          const label = field.LabelOverride || info.Name || info.Code || 'اطلاعات';
          const cardinality = String(info.Cardinality || 'SINGLE').toUpperCase();
          const required = field.IsRequired === true || String(field.IsRequired).toLowerCase() === 'true';
          const wrapper = document.createElement('div');
          wrapper.className = 'event-field event-form-value-field';
          wrapper.dataset.formId = String(form.ID || mapping.FormID);
          wrapper.dataset.infoTypeId = typeId;
          wrapper.dataset.cardinality = cardinality;
          if (cardinality === 'MULTIPLE') {
            const title = document.createElement('strong');
            title.textContent = label + (required ? ' *' : '');
            wrapper.appendChild(title);
            if (field.HelpText) {
              const help = document.createElement('small');
              help.className = 'event-muted';
              help.textContent = field.HelpText;
              wrapper.appendChild(help);
            }
            const columns = Array.isArray(info.Columns) ? info.Columns : [];
            const tableWrap = document.createElement('div');
            tableWrap.className = 'event-modal-table-wrap';
            const table = document.createElement('table');
            table.className = 'event-modal-table';
            table.dataset.formTable = 'true';
            table.dataset.formId = String(form.ID || mapping.FormID);
            table.dataset.infoTypeId = typeId;
            const head = document.createElement('thead');
            const headRow = document.createElement('tr');
            columns.forEach((column) => {
              const th = document.createElement('th');
              th.textContent = column.Name || column.Code;
              headRow.appendChild(th);
            });
            const actionHead = document.createElement('th');
            actionHead.textContent = 'عملیات';
            headRow.appendChild(actionHead);
            head.appendChild(headRow);
            table.appendChild(head);
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            tableWrap.appendChild(table);
            wrapper.appendChild(tableWrap);
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'event-modal-button';
            add.textContent = 'افزودن ردیف';
            add.addEventListener('click', () => this.addConfiguredFormRow(tbody, columns));
            wrapper.appendChild(add);
            this.addConfiguredFormRow(tbody, columns);
          } else {
            const labelElement = document.createElement('label');
            labelElement.textContent = label + (required ? ' *' : '');
            const inputField = {
              Code: typeId,
              FieldType: String(info.DataType || 'text').toLowerCase(),
              Options: info.OptionsJSON || '[]'
            };
            const input = this.createFieldInput(inputField, inputField.FieldType);
            input.dataset.formValue = 'true';
            input.dataset.formId = String(form.ID || mapping.FormID);
            input.dataset.infoTypeId = typeId;
            input.required = required;
            input.id = 'event-form-value-' + String(form.ID || mapping.FormID) + '-' + index;
            labelElement.htmlFor = input.id;
            wrapper.appendChild(labelElement);
            wrapper.appendChild(input);
            if (inputField.FieldType === 'boolean') {
              input.type = 'checkbox';
              input.required = false;
            }
            if (field.HelpText) {
              const help = document.createElement('small');
              help.className = 'event-muted';
              help.textContent = field.HelpText;
              wrapper.appendChild(help);
            }
          }
          card.appendChild(wrapper);
        });
        container.appendChild(card);
      });
    },

    addConfiguredFormRow: function (tbody, columns) {
      const row = document.createElement('tr');
      row.dataset.formRow = 'true';
      columns.forEach((column) => {
        const cell = document.createElement('td');
        const type = String(column.DataType || 'text').toLowerCase();
        const input = this.createFieldInput({
          Code: column.Code,
          FieldType: type,
          Options: column.OptionsJSON || '[]'
        }, type);
        input.dataset.columnCode = String(column.Code);
        input.required = column.IsRequired === true || String(column.IsRequired).toLowerCase() === 'true';
        input.setAttribute('aria-label', column.Name || column.Code);
        cell.appendChild(input);
        row.appendChild(cell);
      });
      const actionCell = document.createElement('td');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'event-modal-button';
      remove.textContent = 'حذف';
      remove.addEventListener('click', () => row.remove());
      actionCell.appendChild(remove);
      row.appendChild(actionCell);
      tbody.appendChild(row);
    },

    collectConfiguredFormResponses: function () {
      const responses = [];
      const container = document.getElementById('event-configured-forms');
      if (!container) return responses;
      for (const mapping of this.formDefinitions || []) {
        const form = mapping.Form || {};
        const formId = String(form.ID || mapping.FormID);
        const values = {};
        const fields = Array.isArray(form.Fields) ? form.Fields : [];
        for (const field of fields) {
          const info = field.InformationType || {};
          const typeId = String(field.InformationTypeID || info.ID || '');
          if (!typeId) continue;
          const required = field.IsRequired === true || String(field.IsRequired).toLowerCase() === 'true';
          if (String(info.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE') {
            const table = Array.from(container.querySelectorAll('[data-form-table]')).find((node) =>
              node.dataset.formId === formId && node.dataset.infoTypeId === typeId
            );
            const columns = Array.isArray(info.Columns) ? info.Columns : [];
            const rows = table ? Array.from(table.querySelectorAll('[data-form-row]')) : [];
            const valueRows = rows.map((row) => {
              const value = {};
              row.querySelectorAll('[data-column-code]').forEach((input) => {
                let item = input.type === 'checkbox' ? input.checked : input.value;
                if (input.type === 'number' && String(item).trim() !== '') item = Number(item);
                value[input.dataset.columnCode] = item;
              });
              return value;
            }).filter((row) => Object.keys(row).some((key) => row[key] !== '' && row[key] !== null && row[key] !== undefined && row[key] !== false));
            if (required && valueRows.length === 0) {
              this.showFormError('حداقل یک ردیف برای «' + (field.LabelOverride || info.Name) + '» وارد کنید.');
              return null;
            }
            values[typeId] = valueRows;
          } else {
            const input = Array.from(container.querySelectorAll('[data-form-value]')).find((node) =>
              node.dataset.formId === formId && node.dataset.infoTypeId === typeId
            );
            if (!input) continue;
            let value = input.type === 'checkbox' ? input.checked : input.value;
            if (input.type === 'number' && String(value).trim() !== '') value = Number(value);
            if (required && (value === '' || value === null || value === undefined)) {
              input.reportValidity();
              input.focus();
              return null;
            }
            values[typeId] = value;
          }
        }
        responses.push({ FormID: formId, FormVersion: Number(form.Version || 1), Values: values });
      }
      return responses;
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

      const formResponses = this.collectConfiguredFormResponses();
      if (formResponses === null) return;

      const type = this.findById(this.eventTypes, typeId);
      const date = new Date(occurredAt);

      if (isNaN(date.getTime())) {
        this.showFormError('تاریخ و زمان واردشده معتبر نیست.');
        return;
      }

      const isIndependent = !!type &&
        String(type.ConnectionType || 'PROJECT').toUpperCase() === 'INDEPENDENT';
      const payload = {
        ProjectID: isIndependent ? '' : projectId,
        EventTypeID: typeId,
        EventTypeVersion: type ? Number(type.Version || 1) : 1,
        OccurredAt: date.toISOString(),
        Description: description,
        DynamicData: dynamicData,
        FormResponses: formResponses,
        VariantDetails: Array.from(form.querySelectorAll('[data-variant-row]')).map((row) => {
          const value = (name) => {
            const input = row.querySelector('[data-variant-field="' + name + '"]');
            return input ? input.value : '';
          };
          return {
            Color: value('Color'),
            Size: value('Size'),
            VariantQuantity: value('VariantQuantity')
          };
        }).filter((row) => row.Color || row.Size || row.VariantQuantity !== '')
      };
      // Keep a key for retries of the same logical submission, but rotate it if
      // the user edits any field after a failed request.
      const requestFingerprint = JSON.stringify(payload);
      if (!this.pendingIdempotencyKey ||
          this.pendingIdempotencyFingerprint !== requestFingerprint) {
        this.pendingIdempotencyKey = 'EVREQ_' + (
          window.crypto && typeof window.crypto.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : (Date.now().toString(36) + '_' + Math.random().toString(36).slice(2) + '_' + Math.random().toString(36).slice(2))
        );
        this.pendingIdempotencyFingerprint = requestFingerprint;
      }
      payload.IdempotencyKey = this.pendingIdempotencyKey;

      this.submitting = true;
      this.setSubmitState(true);

      try {
        const eventResponse = await PMS.Api.post('/events', payload);
        const eventResult = PMS.Api.extractData(eventResponse) || {};
        const procurementIntegration = eventResult.procurementIntegration || {};

        PMS.Api.invalidateMany([
          CACHE_KEY,
          PROJECTS_CACHE_KEY,
          EVENT_TYPES_CACHE_KEY,
          'dashboard_projects_lookup',
          'dashboard_shared_lookups_v2',
          PMS.Cache.keys.DASHBOARD
        ]);

        // Keep project detail from serving stale project/event data.
        if (projectId) {
          PMS.Cache.remove(
            PMS.Cache.keys.PROJECT_EVENTS + '_' + String(projectId)
          );
          PMS.Cache.remove(
            PMS.Cache.keys.PROJECT_EVENTS + '_' + String(projectId) + '_DETAILS'
          );
          PMS.Cache.remove(
            PMS.Cache.keys.PROJECT + '_' + String(projectId)
          );
        }

        // موفقیت ثبت را از موفقیت تازه‌سازی فهرست جدا نگه می‌داریم.
        this.closeForm(true);

        try {
          await this.reloadEvents();
        } catch (refreshError) {
          // رویداد ثبت شده است؛ فقط تازه‌سازی فهرست ناموفق بوده.
          this.showRefreshNotice();
        }

        if (String(procurementIntegration.status || '').toUpperCase() === 'FAILED') {
          const savedEventId = eventResult.event && (eventResult.event.ID || eventResult.event.Id);
          this.showProcurementRetryNotice(savedEventId, 'رویداد ثبت شد، اما محاسبه نیاز ملزومات کامل نشد. می‌توانید اتصال را دوباره اجرا کنید. جزئیات: ' + String(procurementIntegration.message || 'خطای نامشخص'));
        } else {
          this.showSuccessNotice('رویداد با موفقیت ثبت شد.');
        }
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

    showProcurementRetryNotice: function (eventId, message) {
      const notice = document.createElement('div');
      notice.className = 'event-toast event-toast-warning';
      notice.setAttribute('role', 'status');
      const text = document.createElement('div');
      text.textContent = message;
      notice.appendChild(text);
      if (eventId) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-sm btn-secondary';
        button.textContent = 'تلاش مجدد برای محاسبه ملزومات';
        button.style.marginTop = '8px';
        button.addEventListener('click', async () => {
          button.disabled = true;
          button.textContent = 'در حال تلاش مجدد...';
          try {
            await PMS.Api.post('/events/' + encodeURIComponent(eventId) + '/procurement-retry', {});
            notice.remove();
            this.showNotice('محاسبه نیاز ملزومات با موفقیت مجدداً اجرا شد.', 'success');
            PMS.Api.invalidateMany([CACHE_KEY, PROJECTS_CACHE_KEY, PMS.Cache.keys.DASHBOARD]);
            if (typeof this.reloadEvents === 'function') await this.reloadEvents();
          } catch (error) {
            button.disabled = false;
            button.textContent = 'تلاش مجدد';
            text.textContent = 'تلاش مجدد ناموفق بود: ' + this.errorMessage(error);
          }
        });
        notice.appendChild(button);
      }
      document.body.appendChild(notice);
      requestAnimationFrame(() => notice.classList.add('is-visible'));
      setTimeout(() => {
        if (!notice.isConnected) return;
        notice.classList.remove('is-visible');
        setTimeout(() => notice.remove(), 250);
      }, 12000);
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
      this.pendingIdempotencyKey = '';
      this.pendingIdempotencyFingerprint = '';
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