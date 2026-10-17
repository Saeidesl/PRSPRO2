(function () {
  'use strict';

  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};

  const STATE_KEY = 'pms_project_dashboard_state_v1';
  const SUMMARY_CACHE_KEY = 'project_dashboard_summary';
  const SEARCH_BATCH_SIZE = 100;
  const PROJECT_BATCH_SIZE = 25;

  const Dashboard = {
    projects: [],
    filterOptions: { users: [], eventTypes: [], departments: [], stages: [] },
    filteredProjects: [],
    projectDetails: Object.create(null),
    projectDetailsLoading: Object.create(null),
    projectDetailsErrors: Object.create(null),
    timelineVisibleCounts: Object.create(null),
    timelineObserver: null,
    attachments: Object.create(null),
    attachmentLoading: Object.create(null),
    searchIndex: [],
    searchIndexIds: Object.create(null),
    searchIndexLoaded: false,
    searchIndexLoading: false,
    searchIndexError: null,
    searchIndexPromise: null,
    searchIndexOffset: 0,
    searchIndexTotal: 0,
    expandedProjects: new Set(),
    openEventId: '',
    pendingTargetEventId: '',
    searchTimer: null,
    visibleCount: PROJECT_BATCH_SIZE,
    observer: null,
    timelineOrder: 'newest',
    sortOrder: 'created-desc',
    advancedOpen: false,
    scrollRestorePending: false,
    savedScrollY: 0,
    loadVersion: 0,

    init: function () {
      this.restoreState();
      this.bindEvents();
      this.observeListEnd();
      this.loadProjects(false);
      this.updateSearchClear();
    },

    bindEvents: function () {
      const search = this.el('dashboard-project-search');
      const clearSearch = this.el('dashboard-search-clear');
      const filterToggle = this.el('dashboard-filter-toggle');
      const refresh = this.el('dashboard-refresh-button');
      const clearFilters = this.el('dashboard-clear-filters');
      const sort = this.el('dashboard-project-sort');
      const list = this.el('dashboard-project-list');
      const results = this.el('dashboard-search-results');
      const filterIds = [
        'dashboard-filter-status',
        'dashboard-filter-stage',
        'dashboard-filter-department',
        'dashboard-filter-created-from',
        'dashboard-filter-created-to',
        'dashboard-filter-activity-from',
        'dashboard-filter-activity-to',
        'dashboard-filter-registrant',
        'dashboard-filter-event-type'
      ];

      if (search) {
        search.addEventListener('input', () => {
          this.updateSearchClear();
          if (this.searchTimer) window.clearTimeout(this.searchTimer);
          this.searchTimer = window.setTimeout(() => {
            this.visibleCount = PROJECT_BATCH_SIZE;
            this.applyFilters();
            this.saveState();
          }, 380);
        });
      }

      if (clearSearch) {
        clearSearch.addEventListener('click', () => {
          if (search) search.value = '';
          this.updateSearchClear();
          this.visibleCount = PROJECT_BATCH_SIZE;
          this.applyFilters();
          this.saveState();
        });
      }

      if (filterToggle) {
        filterToggle.addEventListener('click', () => {
          this.advancedOpen = !this.advancedOpen;
          const panel = this.el('dashboard-advanced-filters');
          filterToggle.setAttribute('aria-expanded', String(this.advancedOpen));
          if (panel) panel.hidden = !this.advancedOpen;
          this.saveState();
        });
      }

      filterIds.forEach((id) => {
        const input = this.el(id);
        if (!input) return;
        input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', () => {
          if (this.searchTimer) window.clearTimeout(this.searchTimer);
          this.searchTimer = window.setTimeout(() => {
            this.visibleCount = PROJECT_BATCH_SIZE;
            this.applyFilters();
            this.saveState();
          }, input.tagName === 'INPUT' ? 300 : 0);
        });
      });

      if (sort) {
        sort.addEventListener('change', () => {
          this.sortOrder = sort.value || 'created-desc';
          this.visibleCount = PROJECT_BATCH_SIZE;
          this.applyFilters();
          this.saveState();
        });
      }

      const order = this.el('dashboard-timeline-order');
      if (order) {
        order.addEventListener('change', () => {
          this.timelineOrder = order.value || 'newest';
          this.renderProjectCards();
          this.saveState();
        });
      }

      if (clearFilters) {
        clearFilters.addEventListener('click', () => this.clearAllFilters());
      }

      if (refresh) {
        refresh.addEventListener('click', () => this.refresh());
      }

      if (list) {
        list.addEventListener('click', (event) => this.handleListClick(event));
      }

      if (results) {
        results.addEventListener('click', (event) => this.handleSearchResultClick(event));
      }

      const chips = this.el('dashboard-active-filters');
      if (chips) {
        chips.addEventListener('click', (event) => {
          const button = event.target.closest('[data-clear-filter]');
          if (!button) return;
          this.clearOneFilter(button.getAttribute('data-clear-filter'));
        });
      }

      const errorBox = this.el('dashboard-error');
      if (errorBox) {
        errorBox.addEventListener('click', (event) => {
          if (event.target.closest('[data-dashboard-retry]')) this.refresh();
        });
      }

      const projectList = this.el('dashboard-project-list');
      if (projectList) {
        projectList.addEventListener('click', (event) => {
          const retry = event.target.closest('[data-retry-project]');
          if (retry) this.loadProjectDetails(retry.getAttribute('data-retry-project'), true);
          const retryAttachments = event.target.closest('[data-retry-attachments]');
          if (retryAttachments) this.loadAttachments(retryAttachments.getAttribute('data-retry-attachments'), true);
          const download = event.target.closest('[data-download-attachment]');
          if (download) this.openAttachment(download.getAttribute('data-download-attachment'));
        });
      }

      window.addEventListener('pagehide', () => this.saveState());
      window.addEventListener('beforeunload', () => this.saveState());
    },

    el: function (id) {
      return document.getElementById(id);
    },

    restoreState: function () {
      try {
        const raw = window.sessionStorage.getItem(STATE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        const values = state.filters || {};
        const search = this.el('dashboard-project-search');
        if (search) search.value = state.search || '';
        const mapping = {
          status: 'dashboard-filter-status',
          stage: 'dashboard-filter-stage',
          department: 'dashboard-filter-department',
          createdFrom: 'dashboard-filter-created-from',
          createdTo: 'dashboard-filter-created-to',
          activityFrom: 'dashboard-filter-activity-from',
          activityTo: 'dashboard-filter-activity-to',
          registrant: 'dashboard-filter-registrant',
          eventType: 'dashboard-filter-event-type'
        };
        this.pendingFilterValues = {};
        Object.keys(mapping).forEach((key) => {
          const input = this.el(mapping[key]);
          const value = values[key] || '';
          if (!input) return;
          if (input.tagName === 'SELECT' &&
              !Array.from(input.options).some((option) => option.value === String(value))) {
            this.pendingFilterValues[key] = value;
          } else {
            input.value = value;
          }
        });
        this.sortOrder = state.sortOrder || 'created-desc';
        this.timelineOrder = state.timelineOrder || 'newest';
        this.advancedOpen = state.advancedOpen === true;
        this.expandedProjects = new Set((state.expandedProjects || []).map(String));
        this.openEventId = String(state.openEventId || '');
        this.savedScrollY = Number(state.scrollY || 0);
        this.scrollRestorePending = this.savedScrollY > 0;
        const sort = this.el('dashboard-project-sort');
        const order = this.el('dashboard-timeline-order');
        const panel = this.el('dashboard-advanced-filters');
        const toggle = this.el('dashboard-filter-toggle');
        if (sort) sort.value = this.sortOrder;
        if (order) order.value = this.timelineOrder;
        if (panel) panel.hidden = !this.advancedOpen;
        if (toggle) toggle.setAttribute('aria-expanded', String(this.advancedOpen));
      } catch (error) {
        console.warn('بازیابی وضعیت داشبورد انجام نشد.', error);
      }
    },

    saveState: function () {
      try {
        const filters = {};
        const mapping = {
          status: 'dashboard-filter-status',
          stage: 'dashboard-filter-stage',
          department: 'dashboard-filter-department',
          createdFrom: 'dashboard-filter-created-from',
          createdTo: 'dashboard-filter-created-to',
          activityFrom: 'dashboard-filter-activity-from',
          activityTo: 'dashboard-filter-activity-to',
          registrant: 'dashboard-filter-registrant',
          eventType: 'dashboard-filter-event-type'
        };
        Object.keys(mapping).forEach((key) => {
          const input = this.el(mapping[key]);
          filters[key] = input ? input.value : '';
        });
        const search = this.el('dashboard-project-search');
        window.sessionStorage.setItem(STATE_KEY, JSON.stringify({
          search: search ? search.value : '',
          filters: filters,
          sortOrder: this.sortOrder,
          timelineOrder: this.timelineOrder,
          advancedOpen: this.advancedOpen,
          expandedProjects: Array.from(this.expandedProjects),
          openEventId: this.openEventId,
          scrollY: window.scrollY || 0
        }));
      } catch (error) {}
    },

    loadProjects: async function (force) {
      const loading = this.el('dashboard-loading');
      const cached = window.PMS.Cache.get(SUMMARY_CACHE_KEY);
      if (cached !== null) {
        this.acceptSummary(cached);
        if (loading) loading.hidden = true;
      } else if (loading) {
        loading.hidden = false;
      }

      try {
        let data;
        if (force) {
          data = await window.PMS.Api.getFresh('/project-dashboard', SUMMARY_CACHE_KEY);
        } else {
          const result = await window.PMS.Api.getCached('/project-dashboard', SUMMARY_CACHE_KEY, {
            onRefresh: (fresh) => this.acceptSummary(fresh)
          });
          data = result ? result.data : null;
        }

        if (data) this.acceptSummary(data);
        if (loading) loading.hidden = true;
      } catch (error) {
        if (loading) loading.hidden = true;
        if (!this.projects.length) this.showError(error);
        else this.showError(error, true);
      }
    },

    acceptSummary: function (response) {
      const data = this.unwrap(response) || {};
      this.projects = Array.isArray(data.projects) ? data.projects : [];
      this.filterOptions = data.filterOptions || this.filterOptions;
      this.populateFilterOptions();
      this.renderProjectCards();
      this.applyFilters();
      this.restoreExpandedProjects();
      this.restoreScroll();
    },

    restoreExpandedProjects: function () {
      this.expandedProjects.forEach((id) => {
        if (!this.projectDetails[id] && !this.projectDetailsLoading[id]) this.loadProjectDetails(id);
      });
    },

    restoreScroll: function () {
      if (!this.scrollRestorePending) return;
      this.scrollRestorePending = false;
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        window.scrollTo(0, this.savedScrollY);
      }));
    },

    refresh: async function () {
      const button = this.el('dashboard-refresh-button');
      if (button) {
        button.disabled = true;
        button.textContent = 'در حال بروزرسانی…';
      }
      const errorBox = this.el('dashboard-error');
      if (errorBox) errorBox.hidden = true;
      try {
        await this.loadProjects(true);
        const expanded = Array.from(this.expandedProjects);
        await Promise.all(expanded.map((id) => this.loadProjectDetails(id, true)));
        this.saveState();
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'بروزرسانی';
        }
      }
    },

    unwrap: function (response) {
      if (response && typeof response === 'object' && response.data !== undefined) return response.data;
      return response;
    },

    normalizeArray: function (response, keys) {
      const data = this.unwrap(response);
      if (Array.isArray(data)) return data;
      if (!data || typeof data !== 'object') return [];
      for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(data[keys[i]])) return data[keys[i]];
      }
      return [];
    },

    populateFilterOptions: function () {
      const options = this.filterOptions || {};
      this.fillSelect('dashboard-filter-stage', options.stages || [], 'همهٔ مراحل');
      this.fillSelect('dashboard-filter-department', options.departments || [], 'همهٔ واحدها');
      this.fillSelect('dashboard-filter-registrant', options.users || [], 'همهٔ ثبت‌کنندگان');
      this.fillSelect('dashboard-filter-event-type', options.eventTypes || [], 'همهٔ رویدادها');
      const pending = this.pendingFilterValues || {};
      const mapping = {
        stage: 'dashboard-filter-stage',
        department: 'dashboard-filter-department',
        registrant: 'dashboard-filter-registrant',
        eventType: 'dashboard-filter-event-type'
      };
      Object.keys(mapping).forEach((key) => {
        const input = this.el(mapping[key]);
        if (input && pending[key]) input.value = pending[key];
      });
      this.pendingFilterValues = null;
    },

    fillSelect: function (id, items, firstLabel) {
      const select = this.el(id);
      if (!select) return;
      const selected = select.value;
      const first = '<option value="">' + this.escape(firstLabel) + '</option>';
      const rest = (items || []).map((item) => {
        const value = item.ID || item.Id || item.id || '';
        const label = item.Name || item.Title || item.Code || value;
        return '<option value="' + this.escape(value) + '">' + this.escape(label) + '</option>';
      }).join('');
      select.innerHTML = first + rest;
      select.value = selected;
    },

    updateSearchClear: function () {
      const search = this.el('dashboard-project-search');
      const clear = this.el('dashboard-search-clear');
      if (clear) clear.hidden = !(search && search.value);
    },

    getSearchText: function () {
      const input = this.el('dashboard-project-search');
      return this.normalizeText(input ? input.value : '');
    },

    normalizeText: function (value) {
      return String(value === undefined || value === null ? '' : value)
        .toLocaleLowerCase('fa')
        .replace(/[يى]/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/\s+/g, ' ')
        .trim();
    },

    ensureSearchIndex: function () {
      if (this.searchIndexLoaded) return Promise.resolve();
      if (this.searchIndexPromise) return this.searchIndexPromise;
      if (this.searchIndexError) return Promise.resolve();

      this.searchIndexLoading = true;
      this.searchIndexError = null;
      this.updateSearchStatus();

      this.searchIndexPromise = (async () => {
        let hasMore = true;
        while (hasMore) {
          const response = await window.PMS.Api.post('/project-dashboard/search-index', {
            offset: this.searchIndexOffset,
            limit: SEARCH_BATCH_SIZE
          });
          const data = this.unwrap(response) || {};
          const items = Array.isArray(data.items) ? data.items : [];
          items.forEach((item) => {
            const id = String(item.ID || '');
            if (!id || this.searchIndexIds[id]) return;
            item._searchText = this.normalizeText(item.SearchText || '');
            this.searchIndexIds[id] = true;
            this.searchIndex.push(item);
          });
          this.searchIndexOffset = Number(data.nextOffset || (this.searchIndexOffset + items.length));
          this.searchIndexTotal = Number(data.total || this.searchIndexTotal || 0);
          hasMore = data.hasMore === true;
          this.applyFilters();
          this.updateSearchStatus();
          if (hasMore) await new Promise((resolve) => window.setTimeout(resolve, 20));
        }
        this.searchIndexLoaded = true;
      })().catch((error) => {
        this.searchIndexError = error;
        this.searchIndexLoaded = true;
      }).finally(() => {
        this.searchIndexLoading = false;
        this.searchIndexPromise = null;
        this.updateSearchStatus();
        this.applyFilters();
      });

      return this.searchIndexPromise;
    },

    updateSearchStatus: function () {
      const status = this.el('dashboard-search-status');
      if (!status) return;
      const needsIndex = !!this.getSearchText() || this.hasEventFilters();
      if (this.searchIndexLoading && needsIndex) {
        status.textContent = 'در حال بررسی تدریجی اطلاعات رویدادها… ' +
          this.searchIndex.length.toLocaleString('fa-IR') +
          (this.searchIndexTotal ? ' از ' + this.searchIndexTotal.toLocaleString('fa-IR') : '');
        status.hidden = false;
      } else if (this.searchIndexError && needsIndex) {
        status.textContent = 'جست‌وجوی جزئیات رویدادها انجام نشد. اطلاعات پروژه‌ها همچنان قابل مشاهده است.';
        status.hidden = false;
      } else {
        status.hidden = true;
        status.textContent = '';
      }
    },

    getFilterValue: function (key) {
      const map = {
        status: 'dashboard-filter-status',
        stage: 'dashboard-filter-stage',
        department: 'dashboard-filter-department',
        createdFrom: 'dashboard-filter-created-from',
        createdTo: 'dashboard-filter-created-to',
        activityFrom: 'dashboard-filter-activity-from',
        activityTo: 'dashboard-filter-activity-to',
        registrant: 'dashboard-filter-registrant',
        eventType: 'dashboard-filter-event-type'
      };
      const input = this.el(map[key]);
      return input ? input.value.trim() : '';
    },

    hasEventFilters: function () {
      return !!(this.getFilterValue('department') || this.getFilterValue('registrant') || this.getFilterValue('eventType'));
    },

    applyFilters: function () {
      const query = this.getSearchText();
      if ((query || this.hasEventFilters()) && !this.searchIndexLoaded && !this.searchIndexError) {
        this.ensureSearchIndex();
      }

      const matchingEvents = query
        ? this.searchIndex.filter((item) => (item._searchText || '').indexOf(query) !== -1)
        : [];
      const eventIds = Object.create(null);
      const projectIdsFromEvents = Object.create(null);
      matchingEvents.forEach((item) => {
        eventIds[String(item.ID)] = true;
        projectIdsFromEvents[String(item.ProjectID)] = true;
      });
      this.matchingEventIds = eventIds;
      this.matchingEvents = matchingEvents;

      const filtered = (this.projects || []).filter((project) => {
        if (!this.matchesProjectFilters(project)) return false;
        if (query) {
          const projectText = this.normalizeText(Object.keys(project).map((key) => {
            const value = project[key];
            return value && typeof value === 'object' ? '' : String(value === undefined || value === null ? '' : value);
          }).join(' '));
          if (projectText.indexOf(query) === -1 && !projectIdsFromEvents[String(this.projectId(project))]) return false;
        }
        if (this.hasEventFilters()) {
          if (!this.searchIndex.some((event) => {
            if (String(event.ProjectID) !== String(this.projectId(project))) return false;
            return this.matchesEventFilters(event);
          })) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        if (this.sortOrder === 'activity-desc') return this.timeValue(b.LastActivityAt || b.UpdatedAt) - this.timeValue(a.LastActivityAt || a.UpdatedAt);
        if (this.sortOrder === 'activity-asc') return this.timeValue(a.LastActivityAt || a.UpdatedAt) - this.timeValue(b.LastActivityAt || b.UpdatedAt);
        return this.timeValue(b.CreatedAt) - this.timeValue(a.CreatedAt);
      });

      this.filteredProjects = filtered;
      if (this.visibleCount < PROJECT_BATCH_SIZE) this.visibleCount = PROJECT_BATCH_SIZE;
      this.renderActiveFilters();
      this.renderSearchResults(matchingEvents);
      this.renderProjectCards();
      this.updateSearchClear();
      this.updateSearchStatus();

      const count = this.el('dashboard-results-count');
      if (count) {
        count.textContent = filtered.length.toLocaleString('fa-IR') + ' پروژه از ' +
          this.projects.length.toLocaleString('fa-IR') + ' پروژه' +
          (query ? '؛ ' + matchingEvents.length.toLocaleString('fa-IR') + ' رویداد منطبق' : '');
      }

      const empty = this.el('dashboard-project-empty');
      if (empty) empty.hidden = filtered.length !== 0;
      this.saveState();
    },

    matchesProjectFilters: function (project) {
      const status = this.getFilterValue('status');
      const stage = this.getFilterValue('stage');
      const department = this.getFilterValue('department');
      if (status && String(project.Status || '').toUpperCase() !== status.toUpperCase()) return false;
      if (stage && String(project.CurrentStepID || '') !== stage &&
          this.normalizeText(project.CurrentStepName) !== this.normalizeText(this.getOptionLabel('dashboard-filter-stage', stage))) return false;
      const created = this.timeValue(project.CreatedAt);
      const activity = this.timeValue(project.LastActivityAt || project.UpdatedAt || project.CreatedAt);
      const createdFrom = this.parseJalaliDate(this.getFilterValue('createdFrom'));
      const createdTo = this.parseJalaliDate(this.getFilterValue('createdTo'), true);
      const activityFrom = this.parseJalaliDate(this.getFilterValue('activityFrom'));
      const activityTo = this.parseJalaliDate(this.getFilterValue('activityTo'), true);
      if (createdFrom !== null && created < createdFrom) return false;
      if (createdTo !== null && created > createdTo) return false;
      if (activityFrom !== null && activity < activityFrom) return false;
      if (activityTo !== null && activity > activityTo) return false;
      return true;
    },

    matchesEventFilters: function (event) {
      const department = this.getFilterValue('department');
      const registrant = this.getFilterValue('registrant');
      const eventType = this.getFilterValue('eventType');
      if (department && String(event.DepartmentID || '') !== department) return false;
      if (registrant && String(event.CreatedBy || '') !== registrant) return false;
      if (eventType && String(event.EventTypeID || '') !== eventType) return false;
      return true;
    },

    getOptionLabel: function (selectId, value) {
      const select = this.el(selectId);
      if (!select) return '';
      const option = Array.from(select.options).find((item) => item.value === String(value));
      return option ? option.textContent : '';
    },

    renderActiveFilters: function () {
      const container = this.el('dashboard-active-filters');
      const countBadge = this.el('dashboard-filter-count');
      if (!container) return;
      const labels = [
        ['status', 'وضعیت', this.getFilterValue('status'), this.statusText(this.getFilterValue('status'))],
        ['stage', 'مرحله', this.getFilterValue('stage'), this.getOptionLabel('dashboard-filter-stage', this.getFilterValue('stage'))],
        ['department', 'واحد', this.getFilterValue('department'), this.getOptionLabel('dashboard-filter-department', this.getFilterValue('department'))],
        ['createdFrom', 'ایجاد از', this.getFilterValue('createdFrom'), this.getFilterValue('createdFrom')],
        ['createdTo', 'ایجاد تا', this.getFilterValue('createdTo'), this.getFilterValue('createdTo')],
        ['activityFrom', 'فعالیت از', this.getFilterValue('activityFrom'), this.getFilterValue('activityFrom')],
        ['activityTo', 'فعالیت تا', this.getFilterValue('activityTo'), this.getFilterValue('activityTo')],
        ['registrant', 'ثبت‌کننده', this.getFilterValue('registrant'), this.getOptionLabel('dashboard-filter-registrant', this.getFilterValue('registrant'))],
        ['eventType', 'نوع رویداد', this.getFilterValue('eventType'), this.getOptionLabel('dashboard-filter-event-type', this.getFilterValue('eventType'))]
      ].filter((item) => item[2]);

      const query = this.el('dashboard-project-search');
      if (query && query.value.trim()) labels.unshift(['search', 'جست‌وجو', query.value.trim(), query.value.trim()]);
      if (!labels.length) {
        container.hidden = true;
        container.innerHTML = '';
      } else {
        container.hidden = false;
        container.innerHTML = labels.map((item) =>
          '<button type="button" class="pd-filter-chip" data-clear-filter="' + this.escape(item[0]) + '">' +
            '<span>' + this.escape(item[1] + ': ' + item[3]) + '</span><span aria-hidden="true">×</span>' +
          '</button>'
        ).join('') + '<button type="button" class="pd-clear-all" data-clear-filter="all">پاک کردن همه</button>';
      }
      const filterCount = this.hasEventFilters() +
        !!this.getFilterValue('status') + !!this.getFilterValue('stage') +
        !!this.getFilterValue('department') + !!this.getFilterValue('createdFrom') +
        !!this.getFilterValue('createdTo') + !!this.getFilterValue('activityFrom') +
        !!this.getFilterValue('activityTo');
      if (countBadge) {
        countBadge.textContent = String(filterCount);
        countBadge.hidden = !filterCount;
      }
    },

    clearAllFilters: function () {
      const ids = [
        'dashboard-project-search', 'dashboard-filter-status', 'dashboard-filter-stage',
        'dashboard-filter-department', 'dashboard-filter-created-from', 'dashboard-filter-created-to',
        'dashboard-filter-activity-from', 'dashboard-filter-activity-to',
        'dashboard-filter-registrant', 'dashboard-filter-event-type'
      ];
      ids.forEach((id) => { const input = this.el(id); if (input) input.value = ''; });
      this.visibleCount = PROJECT_BATCH_SIZE;
      this.updateSearchClear();
      this.applyFilters();
    },

    clearOneFilter: function (key) {
      if (key === 'all') return this.clearAllFilters();
      const map = {
        search: 'dashboard-project-search',
        status: 'dashboard-filter-status',
        stage: 'dashboard-filter-stage',
        department: 'dashboard-filter-department',
        createdFrom: 'dashboard-filter-created-from',
        createdTo: 'dashboard-filter-created-to',
        activityFrom: 'dashboard-filter-activity-from',
        activityTo: 'dashboard-filter-activity-to',
        registrant: 'dashboard-filter-registrant',
        eventType: 'dashboard-filter-event-type'
      };
      const input = this.el(map[key]);
      if (input) input.value = '';
      this.visibleCount = PROJECT_BATCH_SIZE;
      this.updateSearchClear();
      this.applyFilters();
    },

    renderSearchResults: function (events) {
      const container = this.el('dashboard-search-results');
      if (!container) return;
      const query = this.getSearchText();
      if (!query || !events || !events.length) {
        container.hidden = true;
        container.innerHTML = '';
        return;
      }
      const sorted = events.slice().sort((a, b) => this.timeValue(b.OccurredAt || b.CreatedAt) - this.timeValue(a.OccurredAt || a.CreatedAt));
      container.hidden = false;
      container.innerHTML =
        '<div class="pd-search-results-heading"><strong>رویدادهای منطبق</strong><span>' +
          sorted.length.toLocaleString('fa-IR') + ' مورد</span></div>' +
        '<div class="pd-search-hit-list">' + sorted.map((item) =>
          '<button type="button" class="pd-search-hit" data-action="open-search-hit" data-project-id="' +
            this.escape(item.ProjectID) + '" data-event-id="' + this.escape(item.ID) + '">' +
            '<span class="pd-search-hit-main"><strong>' + this.escape(item.ProjectCode || item.ProjectTitle || 'پروژه') +
              '</strong><span>' + this.escape(item.EventTitle || item.EventTypeName || 'رویداد') +
              (item.QuantityText ? ' | ' + this.escape(item.QuantityText) : '') + '</span></span>' +
            '<span class="pd-search-hit-meta">' + this.escape(this.formatDateTime(item.OccurredAt || item.CreatedAt)) +
              '<small>' + this.escape(item.CreatorName || 'ثبت‌کننده نامشخص') + '</small></span>' +
          '</button>'
        ).join('') + '</div>';
    },

    handleSearchResultClick: function (event) {
      const button = event.target.closest('[data-action="open-search-hit"]');
      if (!button) return;
      const projectId = button.getAttribute('data-project-id');
      const eventId = button.getAttribute('data-event-id');
      if (!projectId || !eventId) return;
      this.expandedProjects.add(String(projectId));
      this.openEventId = String(eventId);
      const index = this.filteredProjects.findIndex((project) => String(this.projectId(project)) === String(projectId));
      if (index >= 0) this.visibleCount = Math.max(this.visibleCount, index + 1);
      this.pendingTargetEventId = String(eventId);
      this.renderProjectCards();
      this.loadProjectDetails(projectId);
      this.saveState();
    },

    renderProjectCards: function () {
      const container = this.el('dashboard-project-list');
      const sentinel = this.el('dashboard-list-sentinel');
      if (!container) return;
      const visible = this.filteredProjects.slice(0, this.visibleCount);
      container.innerHTML = visible.map((project) => this.renderProjectCard(project)).join('');
      if (sentinel) sentinel.hidden = this.visibleCount >= this.filteredProjects.length;
      this.observeTimelineSentinels();
      this.filteredProjects.slice(0, this.visibleCount).forEach((project) => {
        const id = String(this.projectId(project));
        if (this.expandedProjects.has(id) && !this.projectDetails[id] && !this.projectDetailsLoading[id] && !this.projectDetailsErrors[id]) {
          this.loadProjectDetails(id);
        }
      });
      if (this.pendingTargetEventId) this.scrollToPendingEvent();
    },

    renderProjectCard: function (project) {
      const id = String(this.projectId(project) || '');
      const expanded = this.expandedProjects.has(id);
      const status = String(project.Status || '').toUpperCase();
      const statusClass = this.statusClass(status);
      const activity = project.LastActivityAt || project.UpdatedAt || project.CreatedAt;
      const timeline = expanded ? this.renderTimelinePanel(project) : '';
      return '<article class="pd-project-card' + (expanded ? ' is-expanded' : '') + '" data-project-card="' + this.escape(id) + '">' +
        '<button type="button" class="pd-project-card-toggle" data-action="toggle-project" data-project-id="' + this.escape(id) + '" aria-expanded="' + String(expanded) + '">' +
          '<span class="pd-project-card-main">' +
            '<span class="pd-project-code">' + this.escape(project.ProjectCode || 'بدون کد') + '</span>' +
            '<span class="pd-project-title">' + this.escape(project.Title || project.Name || 'بدون عنوان') + '</span>' +
            '<span class="pd-project-badges">' +
              '<span class="pd-badge pd-stage-badge">' + this.escape(project.CurrentStepName || project.CurrentStepID || 'مرحله نامشخص') + '</span>' +
              '<span class="pd-badge pd-status-badge ' + statusClass + '"><span class="pd-status-dot"></span>' + this.escape(this.statusText(status)) + '</span>' +
            '</span>' +
            '<span class="pd-project-activity"><span>آخرین فعالیت:</span> ' + this.escape(this.formatDateTime(activity)) +
              (activity ? ' <span class="pd-relative-time">— ' + this.escape(this.relativeTime(activity)) + '</span>' : '') + '</span>' +
          '</span>' +
          '<span class="pd-card-chevron" aria-hidden="true">' + (expanded ? '⌃' : '⌄') + '</span>' +
        '</button>' + timeline +
      '</article>';
    },

    renderTimelinePanel: function (project) {
      const id = String(this.projectId(project));
      if (this.projectDetailsErrors[id]) {
        return '<div class="pd-timeline-panel"><div class="alert alert-danger">' +
          this.escape(this.projectDetailsErrors[id]) +
          ' <button type="button" class="btn btn-sm btn-light" data-retry-project="' + this.escape(id) + '">تلاش مجدد</button></div></div>';
      }
      if (!this.projectDetails[id]) {
        return '<div class="pd-timeline-panel"><div class="pd-timeline-skeleton">' +
          '<div class="pd-skeleton-row"></div><div class="pd-skeleton-row"></div><div class="pd-skeleton-row"></div>' +
          '</div></div>';
      }
      const detail = this.projectDetails[id];
      const events = (detail.events || []).slice();
      events.sort((a, b) => {
        const diff = this.timeValue(this.eventTime(b)) - this.timeValue(this.eventTime(a));
        return this.timelineOrder === 'oldest' ? -diff : diff;
      });
      if (!events.length) {
        return '<div class="pd-timeline-panel"><div class="pd-timeline-empty">هنوز رویداد تولیدی برای این پروژه ثبت نشده است</div></div>';
      }
      const visibleCount = Math.min(
        events.length,
        this.timelineVisibleCounts[id] || 40
      );
      const rows = events.slice(0, visibleCount).map((event) => this.renderTimelineEvent(event, detail, id)).join('');
      const more = visibleCount < events.length
        ? '<div class="pd-timeline-sentinel" data-timeline-sentinel="' + this.escape(id) + '">در حال آماده‌سازی ادامهٔ تاریخچه…</div>'
        : '';
      return '<div class="pd-timeline-panel">' +
        '<div class="pd-timeline-heading"><strong>خط زمانی تولید <span class="pd-event-total">(' + events.length.toLocaleString('fa-IR') + ' رویداد)</span></strong><label>ترتیب <select data-action="timeline-order">' +
          '<option value="newest"' + (this.timelineOrder === 'newest' ? ' selected' : '') + '>جدیدترین به قدیم</option>' +
          '<option value="oldest"' + (this.timelineOrder === 'oldest' ? ' selected' : '') + '>قدیمی‌ترین به جدید</option>' +
        '</select></label></div>' +
        '<div class="pd-timeline">' + rows + '</div>' + more +
      '</div>';
    },

    renderTimelineEvent: function (event, detail, projectId) {
      const id = String(event.ID || event.Id || event.id || '');
      const typeId = String(event.EventTypeID || event.EventTypeId || '');
      const fields = (detail.eventFields && detail.eventFields[typeId]) || [];
      const data = (detail.eventData && detail.eventData[id]) || {};
      const title = event.EventTypeName || event.EventTypeCode || 'رویداد';
      const department = event.DepartmentName || this.lookupName(this.filterOptions.departments, event.DepartmentID) || '';
      const eventTitle = title + (department ? ' — ' + department : '');
      const quantity = this.getQuantityText(fields, data);
      const date = this.eventTime(event);
      const open = this.openEventId === id;
      const matches = !!(this.matchingEventIds && this.matchingEventIds[id]);
      return '<div class="pd-timeline-item' + (matches ? ' is-search-match' : '') + (open ? ' is-event-open' : '') + '" id="pd-event-' + this.escape(id) + '">' +
        '<button type="button" class="pd-event-row" data-action="toggle-event" data-project-id="' + this.escape(projectId) +
          '" data-event-id="' + this.escape(id) + '" aria-expanded="' + String(open) + '">' +
          '<span class="pd-event-marker" aria-hidden="true"></span>' +
          '<span class="pd-event-row-content">' +
            '<strong>' + this.escape(eventTitle) + (quantity ? ' <span class="pd-event-quantity">| ' + this.escape(quantity) + '</span>' : '') + '</strong>' +
            '<span class="pd-event-row-meta"><span>' + this.escape(this.formatDateTime(date)) + '</span>' +
              '<span>ثبت‌کننده: ' + this.escape(event.CreatorName || event.CreatedByName || event.CreatedBy || 'نامشخص') + '</span></span>' +
          '</span><span class="pd-event-chevron" aria-hidden="true">' + (open ? '⌃' : '⌄') + '</span>' +
        '</button>' +
        (open ? this.renderEventDetails(event, detail) : '') +
      '</div>';
    },

    renderEventDetails: function (event, detail) {
      const id = String(event.ID || event.Id || event.id || '');
      const typeId = String(event.EventTypeID || event.EventTypeId || '');
      const fields = (detail.eventFields && detail.eventFields[typeId]) || [];
      const data = (detail.eventData && detail.eventData[id]) || {};
      const dynamic = [];
      const known = Object.create(null);
      fields.forEach((field) => {
        const code = String(field.Code || '');
        known[code] = true;
        const value = data[code];
        if (value === undefined || value === null || String(value).trim() === '') return;
        dynamic.push(this.detailItem(field.Name || code, this.displayValue(value)));
      });
      Object.keys(data).forEach((code) => {
        if (known[code] || data[code] === undefined || data[code] === null || String(data[code]).trim() === '') return;
        dynamic.push(this.detailItem(code, this.displayValue(data[code])));
      });

      const base = [
        this.detailItem('عنوان رویداد', event.EventTypeName || event.EventTypeCode || 'رویداد'),
        this.detailItem('واحد / مرحله', event.DepartmentName || this.lookupName(this.filterOptions.departments, event.DepartmentID) || '—'),
        this.detailItem('ثبت‌کننده', event.CreatorName || event.CreatedByName || event.CreatedBy || '—'),
        this.detailItem('اجراکننده', event.PerformedByName || event.PerformedBy || '—'),
        this.detailItem('تاریخ رویداد', this.formatDateTime(event.OccurredAt || event.CreatedAt)),
        this.detailItem('تاریخ ثبت', this.formatDateTime(event.CreatedAt)),
        this.detailItem('وضعیت رویداد', this.statusText(event.Status))
      ];
      if (event.Description) base.push(this.detailItem('توضیحات', event.Description, true));
      if (event.Reason) base.push(this.detailItem('علت / توضیح تکمیلی', event.Reason, true));

      return '<div class="pd-event-details"><div class="pd-event-details-grid">' +
        base.join('') + dynamic.join('') +
        '</div><div class="pd-attachments-area" data-attachments-for="' + this.escape(id) + '">' +
          this.renderAttachments(id) +
        '</div></div>';
    },

    detailItem: function (label, value, wide) {
      return '<div class="pd-detail-item' + (wide ? ' is-wide' : '') + '">' +
        '<span>' + this.escape(label) + '</span><strong>' + this.escape(value || '—') + '</strong></div>';
    },

    renderAttachments: function (eventId) {
      const id = String(eventId);
      const state = this.attachments[id];
      if (this.attachmentLoading[id] || (!state && this.openEventId === id)) {
        return '<div class="pd-attachments-loading"><span class="pd-skeleton-thumb"></span><span class="pd-skeleton-thumb"></span><span class="pd-skeleton-file"></span></div>';
      }
      if (state && state.error) {
        return '<div class="pd-attachments-error">' + this.escape(state.error) +
          ' <button type="button" class="btn btn-sm btn-light" data-retry-attachments="' + this.escape(id) + '">تلاش مجدد</button></div>';
      }
      const items = state && state.items ? state.items : [];
      if (!items.length) return '<div class="pd-no-attachments">پیوستی برای این رویداد ثبت نشده است.</div>';
      const images = items.filter((item) => /^image\//i.test(String(item.MimeType || '')));
      const files = items.filter((item) => !/^image\//i.test(String(item.MimeType || '')));
      let html = '<div class="pd-attachments-heading">پیوست‌ها</div>';
      if (images.length) {
        html += '<div class="pd-image-attachments">' + images.map((item) => {
          const id = String(item.ID || item.Id || '');
          const url = state.urls && state.urls[id] ? state.urls[id] : '';
          return '<button type="button" class="pd-image-attachment" data-download-attachment="' + this.escape(id) + '" title="' + this.escape(item.FileName || 'تصویر') + '">' +
            (url ? '<img src="' + this.escape(url) + '" alt="' + this.escape(item.FileName || 'پیوست تصویری') + '" loading="lazy">' :
              '<span class="pd-image-placeholder">در حال آماده‌سازی تصویر…</span>') +
            '<span>' + this.escape(item.FileName || 'تصویر') + '</span></button>';
        }).join('') + '</div>';
      }
      if (files.length) {
        html += '<div class="pd-file-attachments">' + files.map((item) => {
          const id = String(item.ID || item.Id || '');
          return '<button type="button" class="pd-file-attachment" data-download-attachment="' + this.escape(id) + '">' +
            '<span class="pd-file-icon" aria-hidden="true">▤</span><span class="pd-file-name">' + this.escape(item.FileName || 'فایل پیوست') +
            '<small>' + this.escape(item.MimeType || 'فایل') + '</small></span><span aria-hidden="true">↗</span></button>';
        }).join('') + '</div>';
      }
      return html;
    },

    loadProjectDetails: async function (projectId, force) {
      const id = String(projectId || '');
      if (!id || this.projectDetailsLoading[id]) return;
      if (this.projectDetails[id] && !force) return;
      this.projectDetailsLoading[id] = true;
      delete this.projectDetailsErrors[id];
      this.renderProjectCards();
      try {
        const path = '/projects/' + encodeURIComponent(id) + '/details';
        const response = force
          ? await window.PMS.Api.getFresh(path, 'project_dashboard_details_' + id)
          : await window.PMS.Api.getCached(path, 'project_dashboard_details_' + id, {
              onRefresh: (data) => {
                this.projectDetails[id] = this.normalizeProjectDetails(data);
                this.renderProjectCards();
              }
            });
        this.projectDetails[id] = this.normalizeProjectDetails(response ? response.data : null);
        delete this.projectDetailsErrors[id];
      } catch (error) {
        this.projectDetailsErrors[id] = this.errorMessage(error, 'دریافت تاریخچهٔ پروژه انجام نشد.');
      } finally {
        delete this.projectDetailsLoading[id];
        this.renderProjectCards();
        this.saveState();
      }
    },

    normalizeProjectDetails: function (response) {
      const data = this.unwrap(response) || {};
      if (Array.isArray(data)) return { events: data, eventData: {}, eventFields: {} };
      return {
        events: Array.isArray(data.events) ? data.events : [],
        eventData: data.eventData || {},
        eventFields: data.eventFields || {}
      };
    },

    loadAttachments: async function (eventId, force) {
      const id = String(eventId || '');
      if (!id || this.attachmentLoading[id]) return;
      if (this.attachments[id] && !force && !this.attachments[id].error) return;
      this.attachmentLoading[id] = true;
      this.attachments[id] = { items: [], urls: {} };
      this.renderProjectCards();
      try {
        const response = await window.PMS.Api.get('/events/' + encodeURIComponent(id) + '/attachments');
        const items = this.normalizeArray(response, ['attachments', 'items', 'Attachments', 'Items']);
        this.attachments[id] = { items: items, urls: {} };
        const imageItems = items.filter((item) => /^image\//i.test(String(item.MimeType || '')));
        await Promise.all(imageItems.map(async (item) => {
          const attachmentId = String(item.ID || item.Id || '');
          if (!attachmentId) return;
          try {
            const result = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download');
            const data = this.unwrap(result) || {};
            const url = data.url || data.downloadUrl || data.downloadURL || '';
            if (url) this.attachments[id].urls[attachmentId] = url;
          } catch (error) {}
        }));
      } catch (error) {
        this.attachments[id] = { items: [], urls: {}, error: this.errorMessage(error, 'دریافت پیوست‌ها انجام نشد.') };
      } finally {
        delete this.attachmentLoading[id];
        this.renderProjectCards();
      }
    },

    openAttachment: async function (attachmentId) {
      if (!attachmentId) return;
      try {
        const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download');
        const data = this.unwrap(response) || {};
        const url = data.url || data.downloadUrl || data.downloadURL || '';
        if (url) window.open(url, '_blank', 'noopener');
        else window.alert('نشانی فایل دریافت نشد.');
      } catch (error) {
        window.alert(this.errorMessage(error, 'باز کردن فایل انجام نشد.'));
      }
    },

    handleListClick: function (event) {
      const order = event.target.closest('[data-action="timeline-order"]');
      if (order) {
        this.timelineOrder = order.value || 'newest';
        this.renderProjectCards();
        this.saveState();
        return;
      }
      const projectButton = event.target.closest('[data-action="toggle-project"]');
      if (projectButton) {
        const id = String(projectButton.getAttribute('data-project-id') || '');
        const beforeTop = projectButton.getBoundingClientRect().top;
        if (this.expandedProjects.has(id)) {
          this.expandedProjects.delete(id);
        } else {
          this.expandedProjects.add(id);
          if (!this.projectDetails[id]) this.loadProjectDetails(id);
        }
        this.renderProjectCards();
        window.requestAnimationFrame(() => {
          const current = this.el('dashboard-project-list').querySelector('[data-action="toggle-project"][data-project-id="' + CSS.escape(id) + '"]');
          if (current) window.scrollTo(0, window.scrollY + current.getBoundingClientRect().top - beforeTop);
        });
        this.saveState();
        return;
      }
      const eventButton = event.target.closest('[data-action="toggle-event"]');
      if (eventButton) {
        const eventId = String(eventButton.getAttribute('data-event-id') || '');
        const beforeTop = eventButton.getBoundingClientRect().top;
        this.openEventId = this.openEventId === eventId ? '' : eventId;
        this.renderProjectCards();
        window.requestAnimationFrame(() => {
          const current = this.el('dashboard-project-list').querySelector('[data-action="toggle-event"][data-event-id="' + CSS.escape(eventId) + '"]');
          if (current) window.scrollTo(0, window.scrollY + current.getBoundingClientRect().top - beforeTop);
        });
        if (this.openEventId) this.loadAttachments(this.openEventId);
        this.saveState();
      }
    },

    renderTimelineEventFallback: function () {},

    getQuantityText: function (fields, data) {
      for (let i = 0; i < (fields || []).length; i++) {
        const field = fields[i];
        const code = String(field.Code || '');
        const value = data ? data[code] : undefined;
        if (value === undefined || value === null || String(value).trim() === '') continue;
        if (/(تعداد|مقدار|تیراژ|quantity|qty|pieces|units)/i.test(String(field.Name || '') + ' ' + code)) {
          const unit = field.Unit || field.UnitName || '';
          return String(value) + (unit ? ' ' + unit : '');
        }
      }
      return '';
    },

    lookupName: function (items, id) {
      const found = (items || []).find((item) => String(item.ID || item.Id || item.id || '') === String(id || ''));
      return found ? (found.Name || found.Title || found.Code || '') : '';
    },

    projectId: function (project) {
      return project && (project.ID || project.Id || project.id || '');
    },

    eventTime: function (event) {
      return event && (event.OccurredAt || event.occurredAt || event.CreatedAt || event.createdAt || '');
    },

    timeValue: function (value) {
      if (!value) return 0;
      const date = new Date(value);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    },

    formatDateTime: function (value) {
      if (!value) return '—';
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      try {
        const dateText = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(date);
        const timeText = new Intl.DateTimeFormat('fa-IR', {
          hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).format(date);
        return dateText + '، ساعت ' + timeText;
      } catch (error) {
        return date.toLocaleString('fa-IR');
      }
    },

    relativeTime: function (value) {
      const time = this.timeValue(value);
      if (!time) return '';
      const diff = Math.max(0, Date.now() - time);
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'همین الان';
      if (minutes < 60) return minutes.toLocaleString('fa-IR') + ' دقیقه پیش';
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return hours.toLocaleString('fa-IR') + ' ساعت پیش';
      const days = Math.floor(hours / 24);
      if (days < 30) return days.toLocaleString('fa-IR') + ' روز پیش';
      const months = Math.floor(days / 30);
      if (months < 12) return months.toLocaleString('fa-IR') + ' ماه پیش';
      return Math.floor(months / 12).toLocaleString('fa-IR') + ' سال پیش';
    },

    parseJalaliDate: function (value, endOfDay) {
      const raw = String(value || '').trim();
      if (!raw) return null;
      const normalized = raw
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/[-.]/g, '/');
      const parts = normalized.split('/');
      if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) return null;
      const jy = Number(parts[0]);
      const jm = Number(parts[1]);
      const jd = Number(parts[2]);
      if (jm < 1 || jm > 12 || jd < 1 || jd > 31 || jy < 1200 || jy > 1600) return null;
      const g = this.jalaliToGregorian(jy, jm, jd);
      const date = new Date(g.gy, g.gm - 1, g.gd);
      if (endOfDay) date.setHours(23, 59, 59, 999);
      else date.setHours(0, 0, 0, 0);
      return date.getTime();
    },

    jalaliToGregorian: function (jy, jm, jd) {
      let jy2 = jy - 979;
      const jm2 = jm - 1;
      const jd2 = jd - 1;
      let jDayNo = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4);
      for (let i = 0; i < jm2; i++) jDayNo += i < 6 ? 31 : 30;
      jDayNo += jd2;
      let gDayNo = jDayNo + 79;
      let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
      gDayNo %= 146097;
      let leap = true;
      if (gDayNo >= 36525) {
        gDayNo--;
        gy += 100 * Math.floor(gDayNo / 36524);
        gDayNo %= 36524;
        if (gDayNo >= 365) gDayNo++;
        else leap = false;
      }
      gy += 4 * Math.floor(gDayNo / 1461);
      gDayNo %= 1461;
      if (gDayNo >= 366) {
        leap = false;
        gDayNo--;
        gy += Math.floor(gDayNo / 365);
        gDayNo %= 365;
      }
      let gd = gDayNo + 1;
      const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let gm = 1;
      while (gm <= 12 && gd > monthDays[gm]) {
        gd -= monthDays[gm];
        gm++;
      }
      return { gy: gy, gm: gm, gd: gd };
    },

    statusText: function (status) {
      const map = {
        ACTIVE: 'فعال', INACTIVE: 'غیرفعال', ON_HOLD: 'متوقف',
        COMPLETED: 'تکمیل‌شده', CANCELLED: 'لغوشده', VOID: 'باطل‌شده',
        DELETED: 'حذف‌شده'
      };
      return map[String(status || '').toUpperCase()] || status || 'نامشخص';
    },

    statusClass: function (status) {
      if (status === 'COMPLETED') return 'is-completed';
      if (status === 'ON_HOLD' || status === 'INACTIVE') return 'is-stopped';
      if (status === 'CANCELLED' || status === 'VOID' || status === 'DELETED') return 'is-cancelled';
      return 'is-active';
    },

    displayValue: function (value) {
      if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
      if (Array.isArray(value)) return value.map((item) => this.displayValue(item)).join('، ');
      if (value && typeof value === 'object') return JSON.stringify(value);
      return String(value);
    },

    showError: function (error, keepContent) {
      const box = this.el('dashboard-error');
      if (!box) return;
      box.innerHTML = '<span>' + this.escape(this.errorMessage(error, 'خطا در دریافت اطلاعات داشبورد.')) + '</span>' +
        '<button type="button" class="btn btn-sm btn-light" data-dashboard-retry>تلاش مجدد</button>';
      box.hidden = false;
      if (!keepContent && !this.projects.length) {
        const loading = this.el('dashboard-loading');
        if (loading) loading.hidden = true;
      }
    },

    errorMessage: function (error, fallback) {
      return error && error.message ? error.message : fallback;
    },

    scrollToPendingEvent: function () {
      const eventId = this.pendingTargetEventId;
      if (!eventId) return;
      const target = this.el('pd-event-' + eventId);
      if (!target) return;
      this.pendingTargetEventId = '';
      window.requestAnimationFrame(() => {
        const current = this.el('pd-event-' + eventId);
        if (!current) return;
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        current.classList.add('pd-event-found');
        window.setTimeout(() => current.classList.remove('pd-event-found'), 2600);
      });
    },

    observeTimelineSentinels: function () {
      if (!('IntersectionObserver' in window)) return;
      if (!this.timelineObserver) {
        this.timelineObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = String(entry.target.getAttribute('data-timeline-sentinel') || '');
            const detail = this.projectDetails[id];
            if (!id || !detail || !Array.isArray(detail.events)) return;
            const current = this.timelineVisibleCounts[id] || 40;
            if (current >= detail.events.length) return;
            this.timelineVisibleCounts[id] = Math.min(current + 40, detail.events.length);
            this.renderProjectCards();
          });
        }, { rootMargin: '220px 0px' });
      }
      this.el('dashboard-project-list').querySelectorAll('[data-timeline-sentinel]').forEach((item) => {
        this.timelineObserver.observe(item);
      });
    },

    observeListEnd: function () {
      const sentinel = this.el('dashboard-list-sentinel');
      if (!sentinel) return;
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting) && this.visibleCount < this.filteredProjects.length) {
            this.visibleCount = Math.min(this.visibleCount + PROJECT_BATCH_SIZE, this.filteredProjects.length);
            this.renderProjectCards();
          }
        }, { rootMargin: '320px 0px' });
        this.observer.observe(sentinel);
      } else {
        window.addEventListener('scroll', () => {
          if (this.visibleCount >= this.filteredProjects.length) return;
          if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
            this.visibleCount = Math.min(this.visibleCount + PROJECT_BATCH_SIZE, this.filteredProjects.length);
            this.renderProjectCards();
          }
        }, { passive: true });
      }
    },

    escape: function (value) {
      return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  window.PMS.Modules.Dashboard = Dashboard;
  window.PMS.Modules.dashboard = Dashboard;
})();