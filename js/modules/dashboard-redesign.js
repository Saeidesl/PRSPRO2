(function () {
  'use strict';

  var STORAGE_KEY = 'pms-dashboard-project-explorer-v2';
  var PAGE_SIZE = 20;
  var SEARCH_DELAY = 350;

  var Dashboard = {
    projects: [],
    users: [],
    departments: [],
    eventTypes: [],
    workflowStepsByWorkflow: {},
    workflowLookupPromise: null,
    attachments: [],
    attachmentContent: {},
    histories: {},
    expanded: {},
    filters: {},
    query: '',
    sortBy: 'created',
    eventOrder: 'newest',
    visibleCount: PAGE_SIZE,
    openEventId: '',
    targetEventId: '',
    searchTimer: null,
    searchGeneration: 0,
    indexing: false,
    indexingDone: false,
    loadingProjects: false,
    attachmentLoadAttempted: false,
    listObserver: null,
    scrollRestorePending: true,

    init: function () {
      this.restoreState();
      this.ensureStyles();
      this.renderShell();
      this.bindEvents();
      this.loadLookups();
      this.loadProjects();
      this.restoreScroll();
    },

    restoreState: function () {
      try {
        var saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
        this.query = String(saved.query || '');
        this.sortBy = saved.sortBy === 'activity' ? 'activity' : 'created';
        this.eventOrder = saved.eventOrder === 'oldest' ? 'oldest' : 'newest';
        this.filters = saved.filters && typeof saved.filters === 'object' ? saved.filters : {};
        this.expanded = {};
        (Array.isArray(saved.expanded) ? saved.expanded : []).forEach(function (id) {
          Dashboard.expanded[String(id)] = true;
        });
        this.openEventId = String(saved.openEventId || '');
        this.savedScrollY = Number(saved.scrollY || 0);
      } catch (error) {
        this.filters = {};
        this.expanded = {};
      }
    },

    saveState: function () {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          query: this.query,
          sortBy: this.sortBy,
          eventOrder: this.eventOrder,
          filters: this.filters,
          expanded: Object.keys(this.expanded).filter(function (id) {
            return Dashboard.expanded[id];
          }),
          openEventId: this.openEventId,
          scrollY: window.scrollY || 0
        }));
      } catch (error) {}
    },

    restoreScroll: function () {
      var self = this;
      window.requestAnimationFrame(function () {
        if (self.scrollRestorePending && self.savedScrollY > 0) {
          window.scrollTo(0, self.savedScrollY);
        }
        self.scrollRestorePending = false;
      });
    },

    renderShell: function () {
      var section = document.querySelector('.page-section');
      if (!section) return;

      var root = document.getElementById('dashboard-project-explorer');
      if (!root) {
        root = document.createElement('section');
        root.id = 'dashboard-project-explorer';
        root.setAttribute('aria-label', 'فهرست و تاریخچه پروژه‌ها');
        var header = section.querySelector('.page-header');
        if (header && header.nextSibling) {
          section.insertBefore(root, header.nextSibling);
        } else {
          section.appendChild(root);
        }
      }

      root.innerHTML =
        '<div class="dash-toolbar">' +
          '<div class="dash-search-wrap">' +
            '<span class="dash-search-icon" aria-hidden="true">⌕</span>' +
            '<input id="dash-search" type="search" class="form-control" autocomplete="off" ' +
              'placeholder="جست‌وجوی کد، عنوان، رویداد، توضیحات، فیلدها و نام فایل‌ها..." ' +
              'aria-label="جست‌وجو در اطلاعات پروژه‌ها و رویدادها">' +
            '<button type="button" id="dash-clear-search" class="dash-icon-button" aria-label="پاک کردن جست‌وجو" title="پاک کردن جست‌وجو">×</button>' +
          '</div>' +
          '<button type="button" id="dash-filter-toggle" class="btn btn-secondary" aria-expanded="false" aria-controls="dash-advanced-filters">فیلترهای پیشرفته <span aria-hidden="true">⌄</span></button>' +
        '</div>' +
        '<div id="dash-search-progress" class="dash-search-progress" hidden></div>' +
        '<div id="dash-event-search-results" class="dash-event-search-results" hidden></div>' +
        '<div id="dash-advanced-filters" class="dash-filters" hidden>' +
          '<div class="dash-filter-grid">' +
            '<label class="dash-filter-field"><span>مرحله فعلی</span><select id="dash-filter-stage"><option value="">همه مراحل</option></select></label>' +
            '<label class="dash-filter-field"><span>وضعیت پروژه</span><select id="dash-filter-status"><option value="">همه وضعیت‌ها</option><option value="ACTIVE">فعال</option><option value="ON_HOLD">متوقف</option><option value="COMPLETED">تکمیل‌شده</option><option value="CANCELLED">لغوشده</option></select></label>' +
            '<label class="dash-filter-field"><span>واحد یا بخش تولید</span><select id="dash-filter-unit"><option value="">همه واحدها</option></select></label>' +
            '<label class="dash-filter-field"><span>ثبت‌کننده رویداد</span><select id="dash-filter-registrant"><option value="">همه ثبت‌کنندگان</option></select></label>' +
            '<label class="dash-filter-field"><span>نوع رویداد</span><select id="dash-filter-type"><option value="">همه رویدادها</option></select></label>' +
            '<label class="dash-filter-field"><span>ایجاد پروژه از تاریخ شمسی</span><input id="dash-filter-created-from" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۱/۰۱"></label>' +
            '<label class="dash-filter-field"><span>ایجاد پروژه تا تاریخ شمسی</span><input id="dash-filter-created-to" type="text" inputmode="numeric" placeholder="۱۴۰۵/۱۲/۲۹"></label>' +
            '<label class="dash-filter-field"><span>آخرین فعالیت از تاریخ شمسی</span><input id="dash-filter-activity-from" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۱/۰۱"></label>' +
            '<label class="dash-filter-field"><span>آخرین فعالیت تا تاریخ شمسی</span><input id="dash-filter-activity-to" type="text" inputmode="numeric" placeholder="۱۴۰۵/۱۲/۲۹"></label>' +
          '</div>' +
          '<div id="dash-active-filters" class="dash-active-filters"></div>' +
          '<div class="dash-filter-actions"><button type="button" id="dash-clear-filters" class="btn btn-light">پاک کردن همه</button></div>' +
        '</div>' +
        '<div class="dash-results-bar">' +
          '<div id="dash-results-count" aria-live="polite">در حال دریافت پروژه‌ها...</div>' +
          '<div class="dash-sort-controls">' +
            '<label for="dash-sort-by">مرتب‌سازی</label>' +
            '<select id="dash-sort-by"><option value="created">تاریخ ایجاد: جدید به قدیم</option><option value="activity">آخرین فعالیت: جدید به قدیم</option></select>' +
            '<button type="button" id="dash-event-order" class="btn btn-light" title="تغییر ترتیب خط زمانی">رویدادها: جدید به قدیم</button>' +
          '</div>' +
        '</div>' +
        '<div id="dash-error" class="dash-error" role="alert" hidden></div>' +
        '<div id="dash-project-list" class="dash-project-list">' +
          '<div class="dash-skeleton-card"><span></span><span></span><span></span></div>' +
          '<div class="dash-skeleton-card"><span></span><span></span><span></span></div>' +
          '<div class="dash-skeleton-card"><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div id="dash-list-sentinel" class="dash-list-sentinel" aria-hidden="true"></div>' +
        '<div id="dash-list-loading" class="dash-list-loading" hidden>در حال بارگذاری پروژه‌های بیشتر...</div>';

      var search = document.getElementById('dash-search');
      if (search) search.value = this.query;
      var sort = document.getElementById('dash-sort-by');
      if (sort) sort.value = this.sortBy;
      this.populateFilterControls();
      this.syncFilterControls();
    },

    ensureStyles: function () {
      var style = document.getElementById('dashboard-project-explorer-v2-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'dashboard-project-explorer-v2-styles';
        document.head.appendChild(style);
      }

      style.textContent = [
        '#dashboard-project-explorer{direction:rtl;min-width:0;color:var(--color-text);margin-top:8px}',
        '#dashboard-project-explorer *{box-sizing:border-box}',
        '#dashboard-project-explorer .dash-toolbar{display:flex;align-items:center;gap:10px;margin:0 0 12px}',
        '#dashboard-project-explorer .dash-search-wrap{display:flex;align-items:center;gap:8px;position:relative;flex:1;min-width:0}',
        '#dashboard-project-explorer .dash-search-icon{position:absolute;right:12px;color:var(--color-text-secondary);font-size:23px;pointer-events:none}',
        '#dashboard-project-explorer #dash-search{width:100%;min-height:46px;padding:10px 42px 10px 40px;border-radius:12px;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);font:inherit;font-size:13px}',
        '#dashboard-project-explorer #dash-search:focus{outline:2px solid color-mix(in srgb,var(--color-primary) 35%,transparent);border-color:var(--color-primary)}',
        '#dashboard-project-explorer .dash-icon-button{position:absolute;left:7px;width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:var(--color-text-secondary);font-size:22px;cursor:pointer}',
        '#dashboard-project-explorer .dash-icon-button:hover{background:var(--color-surface-hover);color:var(--color-text)}',
        '#dashboard-project-explorer .dash-toolbar .btn{white-space:nowrap;min-height:42px}',
        '#dashboard-project-explorer .dash-filters{padding:15px;margin:0 0 14px;border:1px solid var(--color-border);border-radius:13px;background:var(--color-surface)}',
        '#dashboard-project-explorer .dash-filter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
        '#dashboard-project-explorer .dash-filter-field{display:flex;flex-direction:column;gap:6px;min-width:0;font-size:12px;color:var(--color-text-secondary)}',
        '#dashboard-project-explorer .dash-filter-field select,#dashboard-project-explorer .dash-filter-field input{width:100%;min-width:0;min-height:38px;padding:7px 9px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-background);color:var(--color-text);font:inherit}',
        '#dashboard-project-explorer .dash-active-filters{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}',
        '#dashboard-project-explorer .dash-filter-chip{display:inline-flex;align-items:center;gap:7px;padding:5px 8px;border-radius:18px;background:var(--color-surface-hover);border:1px solid var(--color-border);font-size:11px;color:var(--color-text)}',
        '#dashboard-project-explorer .dash-filter-chip button{border:0;background:transparent;color:var(--color-text-secondary);font-size:16px;cursor:pointer;padding:0 2px}',
        '#dashboard-project-explorer .dash-filter-actions{display:flex;justify-content:flex-start;margin-top:12px}',
        '#dashboard-project-explorer .dash-results-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:12px 0;color:var(--color-text-secondary);font-size:12px}',
        '#dashboard-project-explorer .dash-sort-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
        '#dashboard-project-explorer .dash-sort-controls select{max-width:220px;min-height:34px;border:1px solid var(--color-border);border-radius:8px;padding:5px 8px;background:var(--color-surface);color:var(--color-text);font:inherit}',
        '#dashboard-project-explorer .dash-sort-controls .btn{font-size:11px;padding:6px 9px}',
        '#dashboard-project-explorer .dash-search-progress{padding:9px 12px;margin:0 0 10px;border-radius:8px;background:var(--color-surface-hover);color:var(--color-text-secondary);font-size:12px}',
        '#dashboard-project-explorer .dash-event-search-results{display:flex;flex-direction:column;gap:6px;padding:10px;margin:0 0 12px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-surface)}',
        '#dashboard-project-explorer .dash-event-hit{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:right;width:100%;padding:9px 11px;border:1px solid var(--color-border);border-radius:9px;background:var(--color-background);color:var(--color-text);cursor:pointer;font:inherit}',
        '#dashboard-project-explorer .dash-event-hit:hover{border-color:var(--color-primary);background:var(--color-surface-hover)}',
        '#dashboard-project-explorer .dash-event-hit small{display:block;color:var(--color-text-secondary);margin-top:3px;font-size:11px}',
        '#dashboard-project-explorer .dash-project-list{display:flex;flex-direction:column;gap:9px;min-width:0}',
        '#dashboard-project-explorer .dash-project-card{min-width:0;border:1px solid var(--color-border);border-radius:13px;background:var(--color-surface);overflow:hidden;transition:border-color .16s ease,box-shadow .16s ease}',
        '#dashboard-project-explorer .dash-project-card:hover{border-color:color-mix(in srgb,var(--color-primary) 35%,var(--color-border))}',
        '#dashboard-project-explorer .dash-project-card.is-expanded{border-color:color-mix(in srgb,var(--color-primary) 42%,var(--color-border));box-shadow:var(--shadow-sm,0 3px 12px rgba(0,0,0,.08))}',
        '#dashboard-project-explorer .dash-project-card-head{width:100%;display:flex;align-items:center;gap:12px;text-align:right;padding:13px 15px;border:0;background:transparent;color:var(--color-text);cursor:pointer;font:inherit}',
        '#dashboard-project-explorer .dash-project-card-head:focus-visible,#dashboard-project-explorer .dash-event-toggle:focus-visible{outline:2px solid var(--color-primary);outline-offset:-2px}',
        '#dashboard-project-explorer .dash-project-main{flex:1;min-width:0}',
        '#dashboard-project-explorer .dash-project-code{font-size:14px;font-weight:850;line-height:1.8;overflow-wrap:anywhere;color:var(--color-text)}',
        '#dashboard-project-explorer .dash-project-title{font-size:12px;color:var(--color-text-secondary);line-height:1.8;overflow-wrap:anywhere;margin-top:1px}',
        '#dashboard-project-explorer .dash-project-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}',
        '#dashboard-project-explorer .dash-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:18px;font-size:10px;line-height:1.7;font-weight:700;border:1px solid transparent;white-space:nowrap}',
        '#dashboard-project-explorer .dash-badge-stage{background:color-mix(in srgb,#3b82f6 12%,var(--color-surface));border-color:color-mix(in srgb,#3b82f6 25%,transparent);color:var(--color-text)}',
        '#dashboard-project-explorer .dash-badge-status{background:var(--color-surface-hover);border-color:var(--color-border);color:var(--color-text-secondary)}',
        '#dashboard-project-explorer .dash-status-active{color:#16824a;background:color-mix(in srgb,#16a34a 12%,var(--color-surface));border-color:color-mix(in srgb,#16a34a 25%,transparent)}',
        '#dashboard-project-explorer .dash-status-hold{color:#a16207;background:color-mix(in srgb,#eab308 13%,var(--color-surface));border-color:color-mix(in srgb,#eab308 28%,transparent)}',
        '#dashboard-project-explorer .dash-status-completed{color:#2563eb;background:color-mix(in srgb,#3b82f6 12%,var(--color-surface));border-color:color-mix(in srgb,#3b82f6 25%,transparent)}',
        '#dashboard-project-explorer .dash-status-cancelled{color:#b91c1c;background:color-mix(in srgb,#ef4444 12%,var(--color-surface));border-color:color-mix(in srgb,#ef4444 25%,transparent)}',
        '#dashboard-project-explorer .dash-project-activity{font-size:11px;color:var(--color-text-secondary);line-height:1.8;margin-top:6px}',
        '#dashboard-project-explorer .dash-project-chevron{color:var(--color-text-secondary);font-size:17px;flex:0 0 auto;transition:transform .16s ease}',
        '#dashboard-project-explorer .is-expanded .dash-project-chevron{transform:rotate(180deg)}',
        '#dashboard-project-explorer .dash-project-history{padding:0 15px 15px;border-top:1px solid var(--color-border);background:color-mix(in srgb,var(--color-background) 35%,var(--color-surface))}',
        '#dashboard-project-explorer .dash-history-tools{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:12px 0}',
        '#dashboard-project-explorer .dash-history-tools strong{font-size:12px}',
        '#dashboard-project-explorer .dash-history-tools a{font-size:11px;color:var(--color-primary);text-decoration:none}',
        '#dashboard-project-explorer .dash-timeline{position:relative;padding-right:15px;display:flex;flex-direction:column;gap:7px}',
        '#dashboard-project-explorer .dash-timeline:before{content:"";position:absolute;right:4px;top:8px;bottom:8px;width:2px;background:var(--color-border)}',
        '#dashboard-project-explorer .dash-event{position:relative;min-width:0;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);overflow:hidden}',
        '#dashboard-project-explorer .dash-event:before{content:"";position:absolute;right:-15px;top:17px;width:8px;height:8px;border-radius:50%;background:var(--color-primary);border:2px solid var(--color-surface);z-index:1}',
        '#dashboard-project-explorer .dash-event.is-match{background:color-mix(in srgb,#eab308 8%,var(--color-surface));border-color:color-mix(in srgb,#eab308 30%,var(--color-border))}',
        '#dashboard-project-explorer .dash-event.is-target{animation:dash-event-target 2.8s ease-out 1}',
        '@keyframes dash-event-target{0%,30%{box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 25%,transparent)}100%{box-shadow:0 0 0 0 transparent}}',
        '#dashboard-project-explorer .dash-event-toggle{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;text-align:right;padding:10px 12px;border:0;background:transparent;color:var(--color-text);cursor:pointer;font:inherit}',
        '#dashboard-project-explorer .dash-event-title{font-size:12px;font-weight:800;line-height:1.9;overflow-wrap:anywhere}',
        '#dashboard-project-explorer .dash-event-date{font-size:10px;color:var(--color-text-secondary);line-height:1.9;white-space:nowrap}',
        '#dashboard-project-explorer .dash-event-meta{display:flex;flex-wrap:wrap;gap:4px 13px;padding:0 12px 10px;color:var(--color-text-secondary);font-size:10px;line-height:1.8}',
        '#dashboard-project-explorer .dash-event-details{padding:12px;border-top:1px solid var(--color-border);background:color-mix(in srgb,var(--color-background) 30%,var(--color-surface))}',
        '#dashboard-project-explorer .dash-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
        '#dashboard-project-explorer .dash-detail-item{min-width:0;padding:9px 10px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-surface);overflow-wrap:anywhere}',
        '#dashboard-project-explorer .dash-detail-item small{display:block;color:var(--color-text-secondary);font-size:10px;margin-bottom:3px}',
        '#dashboard-project-explorer .dash-detail-item strong{display:block;color:var(--color-text);font-size:11px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;font-weight:650}',
        '#dashboard-project-explorer .dash-description{margin-top:9px;padding:10px;border-radius:8px;background:var(--color-surface);border:1px solid var(--color-border);font-size:11px;line-height:2;white-space:pre-wrap;overflow-wrap:anywhere}',
        '#dashboard-project-explorer .dash-attachments{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
        '#dashboard-project-explorer .dash-attachment{display:flex;align-items:center;gap:8px;max-width:100%;padding:6px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-surface);color:var(--color-text);cursor:pointer;text-align:right;font:inherit;font-size:10px}',
        '#dashboard-project-explorer .dash-attachment img{width:64px;height:52px;object-fit:cover;border-radius:5px;background:var(--color-surface-hover)}',
        '#dashboard-project-explorer .dash-attachment span{overflow-wrap:anywhere}',
        '#dashboard-project-explorer .dash-skeleton-card{padding:15px;border:1px solid var(--color-border);border-radius:13px;background:var(--color-surface);display:flex;flex-direction:column;gap:10px}',
        '#dashboard-project-explorer .dash-skeleton-card span{display:block;height:11px;border-radius:7px;background:var(--color-surface-hover);animation:dash-skeleton-pulse 1.3s ease-in-out infinite}',
        '#dashboard-project-explorer .dash-skeleton-card span:nth-child(1){width:35%;height:15px}',
        '#dashboard-project-explorer .dash-skeleton-card span:nth-child(2){width:62%}',
        '#dashboard-project-explorer .dash-skeleton-card span:nth-child(3){width:80%}',
        '@keyframes dash-skeleton-pulse{0%,100%{opacity:.55}50%{opacity:1}}',
        '#dashboard-project-explorer .dash-list-sentinel{height:1px}',
        '#dashboard-project-explorer .dash-list-loading{text-align:center;padding:12px;color:var(--color-text-secondary);font-size:11px}',
        '#dashboard-project-explorer .dash-error{padding:12px;margin:10px 0;border:1px solid var(--color-danger);border-radius:9px;color:var(--color-danger);font-size:12px;background:var(--color-surface)}',
        '#dashboard-project-explorer .dash-error button{margin-right:8px}',
        '#dashboard-project-explorer .dash-empty{text-align:center;padding:24px 12px;border:1px dashed var(--color-border);border-radius:12px;color:var(--color-text-secondary);font-size:12px;line-height:2}',
        '#dashboard-project-explorer [hidden]{display:none!important}',
        '@media(max-width:760px){#dashboard-project-explorer .dash-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#dashboard-project-explorer .dash-project-card-head{padding:11px;gap:8px}#dashboard-project-explorer .dash-project-history{padding:0 10px 10px}#dashboard-project-explorer .dash-detail-grid{grid-template-columns:minmax(0,1fr)}#dashboard-project-explorer .dash-project-activity{font-size:10px}}',
        '@media(max-width:480px){#dashboard-project-explorer .dash-toolbar{align-items:stretch;flex-direction:column}#dashboard-project-explorer .dash-toolbar .btn{width:100%}#dashboard-project-explorer .dash-filter-grid{grid-template-columns:minmax(0,1fr)}#dashboard-project-explorer .dash-project-code{font-size:12px}#dashboard-project-explorer .dash-project-title{font-size:11px}#dashboard-project-explorer .dash-project-card-head{padding:10px}#dashboard-project-explorer .dash-event-toggle{flex-direction:column;gap:3px}#dashboard-project-explorer .dash-event-date{white-space:normal}}',
        '@media(prefers-reduced-motion:reduce){#dashboard-project-explorer *,#dashboard-project-explorer *:before,#dashboard-project-explorer *:after{animation:none!important;transition:none!important}}'
      ].join('\n');
    },

    bindEvents: function () {
      var root = document.getElementById('dashboard-project-explorer');
      if (!root || root.dataset.bound === '1') return;
      root.dataset.bound = '1';
      var self = this;

      root.addEventListener('input', function (event) {
        if (event.target.id === 'dash-search') {
          self.query = event.target.value || '';
          self.visibleCount = PAGE_SIZE;
          self.saveState();
          if (self.searchTimer) clearTimeout(self.searchTimer);
          self.searchTimer = setTimeout(function () {
            self.applyFilters(true);
          }, SEARCH_DELAY);
        }
      });

      root.addEventListener('change', function (event) {
        var id = event.target.id || '';
        var filterMap = {
          'dash-filter-stage': 'stage',
          'dash-filter-status': 'status',
          'dash-filter-unit': 'unit',
          'dash-filter-registrant': 'registrant',
          'dash-filter-type': 'type',
          'dash-filter-created-from': 'createdFrom',
          'dash-filter-created-to': 'createdTo',
          'dash-filter-activity-from': 'activityFrom',
          'dash-filter-activity-to': 'activityTo'
        };
        if (filterMap[id]) {
          self.filters[filterMap[id]] = event.target.value || '';
          self.visibleCount = PAGE_SIZE;
          self.saveState();
          self.applyFilters(false);
        }
        if (id === 'dash-sort-by') {
          self.sortBy = event.target.value === 'activity' ? 'activity' : 'created';
          self.visibleCount = PAGE_SIZE;
          self.saveState();
          self.renderProjectList();
        }
      });

      root.addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button) return;
        if (button.id === 'dash-filter-toggle') {
          var filters = document.getElementById('dash-advanced-filters');
          var open = filters && filters.hidden;
          if (filters) filters.hidden = !open;
          button.setAttribute('aria-expanded', String(!!open));
          return;
        }
        if (button.id === 'dash-clear-search') {
          var input = document.getElementById('dash-search');
          if (input) input.value = '';
          self.query = '';
          self.visibleCount = PAGE_SIZE;
          if (self.searchTimer) clearTimeout(self.searchTimer);
          self.saveState();
          self.applyFilters(false);
          return;
        }
        if (button.id === 'dash-clear-filters') {
          self.filters = {};
          self.syncFilterControls();
          self.visibleCount = PAGE_SIZE;
          self.saveState();
          self.applyFilters(false);
          return;
        }
        if (button.id === 'dash-event-order') {
          self.eventOrder = self.eventOrder === 'newest' ? 'oldest' : 'newest';
          self.saveState();
          self.renderProjectList();
          return;
        }
        if (button.classList.contains('dash-filter-chip-remove')) {
          var key = button.getAttribute('data-filter-key');
          if (key) delete self.filters[key];
          self.syncFilterControls();
          self.saveState();
          self.applyFilters(false);
          return;
        }
        if (button.classList.contains('dash-project-card-head')) {
          var projectId = button.getAttribute('data-project-id');
          self.toggleProject(projectId);
          return;
        }
        if (button.classList.contains('dash-event-toggle')) {
          var eventId = button.getAttribute('data-event-id');
          self.toggleEventDetails(eventId);
          return;
        }
        if (button.classList.contains('dash-event-hit')) {
          self.openSearchEvent(button.getAttribute('data-project-id'), button.getAttribute('data-event-id'));
          return;
        }
        if (button.classList.contains('dash-retry-history')) {
          self.loadProjectHistory(button.getAttribute('data-project-id'), true);
          return;
        }
        if (button.classList.contains('dash-attachment')) {
          self.openAttachment(button.getAttribute('data-attachment-id'));
        }
      });

      window.addEventListener('scroll', function () {
        self.saveState();
      }, { passive: true });

      window.addEventListener('beforeunload', function () {
        self.saveState();
      });

      var refresh = document.getElementById('dashboard-refresh-button');
      if (refresh) {
        refresh.addEventListener('click', function () {
          self.refresh();
        });
      }
    },

    loadLookups: async function () {
      var self = this;
      var tasks = [
        { path: '/users', key: 'dashboard_users_lookup', prop: 'users', keys: ['users', 'items', 'Users', 'Items'] },
        { path: '/departments', key: 'dashboard_departments_lookup', prop: 'departments', keys: ['departments', 'items', 'Departments', 'Items'] },
        { path: '/event-types', key: 'dashboard_event_types_lookup', prop: 'eventTypes', keys: ['eventTypes', 'items', 'EventTypes', 'Items'] }
      ];
      await Promise.all(tasks.map(async function (task) {
        try {
          var result = await window.PMS.Api.getCached(task.path, task.key);
          self[task.prop] = self.normalizeArray(result ? result.data : null, task.keys);
          if (task.prop === 'eventTypes') self.populateFilterControls();
        } catch (error) {}
      }));
      this.populateFilterControls();
      if (this.projects.length) this.renderProjectList();
    },

    loadProjects: async function () {
      if (this.loadingProjects) return;
      this.loadingProjects = true;
      var loading = document.getElementById('dashboard-loading');
      var self = this;
      try {
        var result = await window.PMS.Api.getCached('/projects', 'dashboard_projects_lookup', {
          onRefresh: function (data) {
            self.projects = self.normalizeArray(data, ['projects', 'items', 'Projects', 'Items']);
            self.loadingProjects = false;
            self.populateFilterControls();
            self.applyFilters(false);
            self.loadWorkflowLookup();
            self.startSearchIndexingIfNeeded();
          },
          onError: function (error, isBackground) {
            if (!isBackground) self.showError(error);
          }
        });
        this.projects = this.normalizeArray(result ? result.data : null, ['projects', 'items', 'Projects', 'Items']);
        this.loadingProjects = false;
        if (loading) loading.hidden = true;
        this.populateFilterControls();
        this.applyFilters(false);
        this.loadWorkflowLookup();
        this.startSearchIndexingIfNeeded();
      } catch (error) {
        this.loadingProjects = false;
        if (loading) loading.hidden = true;
        if (!this.projects.length) this.showError(error);
        else this.showError(error, true);
      }
    },

    refresh: async function () {
      var button = document.getElementById('dashboard-refresh-button');
      if (button) {
        button.disabled = true;
        button.textContent = 'در حال بروزرسانی...';
      }
      try {
        var result = await window.PMS.Api.getFresh('/projects', 'dashboard_projects_lookup');
        this.projects = this.normalizeArray(result, ['projects', 'items', 'Projects', 'Items']);
        this.histories = {};
        this.indexingDone = false;
        this.populateFilterControls();
        this.applyFilters(false);
        this.startSearchIndexingIfNeeded();
      } catch (error) {
        this.showError(error, true);
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'بروزرسانی';
        }
      }
    },

    loadWorkflowLookup: async function () {
      var router = window.PMS.Router;
      var canReadSteps = !!(router && (
        (typeof router.isAdmin === 'function' && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('WORKFLOW_MANAGE') !== -1)
      ));
      if (!canReadSteps || !this.projects.length) return;
      if (this.workflowLookupPromise) return this.workflowLookupPromise;
      var self = this;
      this.workflowLookupPromise = (async function () {
        try {
          var ids = [];
          self.projects.forEach(function (project) {
            var id = String(project.WorkflowID || project.WorkflowId || '');
            if (id && ids.indexOf(id) === -1) ids.push(id);
          });
          await Promise.all(ids.map(async function (workflowId) {
            try {
              var key = window.PMS.Cache.keys.WORKFLOW_STEPS + '_' + workflowId;
              var result = await window.PMS.Api.getCached('/workflows/' + encodeURIComponent(workflowId) + '/steps', key);
              self.workflowStepsByWorkflow[workflowId] = self.normalizeArray(result ? result.data : null, ['steps', 'items', 'Steps', 'Items']);
            } catch (error) {}
          }));
          self.populateFilterControls();
          self.renderProjectList();
        } catch (error) {
          // نام مرحله در صورت نبود مجوز با شناسهٔ مرحله جایگزین می‌شود.
        }
      })();
      try {
        await this.workflowLookupPromise;
      } finally {
        this.workflowLookupPromise = null;
      }
    },

    normalizeArray: function (data, keys) {
      data = this.unwrap(data);
      if (Array.isArray(data)) return data;
      if (!data || typeof data !== 'object') return [];
      for (var i = 0; i < keys.length; i++) {
        if (Array.isArray(data[keys[i]])) return data[keys[i]];
      }
      return [];
    },

    unwrap: function (data) {
      if (data && typeof data === 'object' && !Array.isArray(data) && data.data !== undefined) return data.data;
      return data;
    },

    getId: function (item) {
      return item && (item.ID || item.Id || item.id || item.EventID || item.EventId) || '';
    },

    getProject: function (id) {
      return this.projects.find(function (project) {
        return String(Dashboard.getId(project)) === String(id);
      }) || null;
    },

    getHistory: function (id) {
      return this.histories[String(id)] || null;
    },

    loadProjectHistory: async function (projectId, force) {
      projectId = String(projectId || '');
      if (!projectId) return null;
      var existing = this.getHistory(projectId);
      if (existing && !force && existing.loaded) return existing;
      if (existing && existing.promise && !force) return existing.promise;

      var self = this;
      var history = existing || { events: [], eventData: {}, eventFields: {}, loaded: false, loading: false, error: '' };
      history.loading = true;
      history.error = '';
      this.histories[projectId] = history;
      this.renderProjectList();

      history.promise = (async function () {
        try {
          var response = force
            ? await window.PMS.Api.getFresh('/projects/' + encodeURIComponent(projectId) + '/details', 'dashboard_project_details_' + projectId)
            : await window.PMS.Api.getCached('/projects/' + encodeURIComponent(projectId) + '/details', 'dashboard_project_details_' + projectId);
          var data = self.unwrap(response ? response.data : null) || {};
          history.events = self.normalizeArray(data.events || data.items || [], ['events', 'items', 'Events', 'Items']);
          history.eventData = data.eventData && typeof data.eventData === 'object' ? data.eventData : {};
          history.eventFields = data.eventFields && typeof data.eventFields === 'object' ? data.eventFields : {};
          history.loaded = true;
          history.loading = false;
          history.error = '';
          await self.loadAttachmentIndex();
          self.populateFilterControls();
          self.renderProjectList();
          self.startSearchIndexingIfNeeded();
          return history;
        } catch (error) {
          history.loading = false;
          history.error = error && error.message ? error.message : 'دریافت تاریخچه ناموفق بود.';
          self.renderProjectList();
          if (!self.projects.length) self.showError(error);
          return history;
        } finally {
          history.promise = null;
        }
      })();
      return history.promise;
    },

    loadAttachmentIndex: async function () {
      if (this.attachmentLoadAttempted) return this.attachments;
      this.attachmentLoadAttempted = true;
      try {
        var result = await window.PMS.Api.getCached('/attachments', 'dashboard_attachments_lookup');
        this.attachments = this.normalizeArray(result ? result.data : null, ['attachments', 'items', 'Attachments', 'Items']);
      } catch (error) {
        this.attachments = [];
      }
      return this.attachments;
    },

    startSearchIndexingIfNeeded: function () {
      if (!this.query.trim() || this.indexing || this.indexingDone || !this.projects.length) return;
      this.indexing = true;
      var generation = ++this.searchGeneration;
      var self = this;
      var queue = this.projects.map(function (project) { return String(self.getId(project)); }).filter(Boolean);
      var cursor = 0;
      var completed = 0;
      var workers = [0, 1];
      this.updateSearchProgress('در حال بررسی اطلاعات رویدادها برای جست‌وجوی کامل...');
      Promise.all(workers.map(async function () {
        while (cursor < queue.length && generation === self.searchGeneration) {
          var id = queue[cursor++];
          if (!id || self.getHistory(id) && self.getHistory(id).loaded) {
            completed++;
            continue;
          }
          await self.loadProjectHistory(id, false);
          completed++;
          self.updateSearchProgress('در حال جست‌وجو در تاریخچه‌ها: ' + self.toPersianDigits(completed) + ' از ' + self.toPersianDigits(queue.length));
          self.applyFilters(false);
        }
      })).then(function () {
        if (generation !== self.searchGeneration) return;
        self.indexing = false;
        self.indexingDone = true;
        self.updateSearchProgress('');
        self.applyFilters(false);
      });
    },

    updateSearchProgress: function (message) {
      var el = document.getElementById('dash-search-progress');
      if (!el) return;
      el.textContent = message || '';
      el.hidden = !message;
    },

    applyFilters: function (startIndexing) {
      if (startIndexing) this.startSearchIndexingIfNeeded();
      this.renderProjectList();
      this.renderActiveFilterChips();
      this.renderEventSearchResults();
      this.saveState();
    },

    projectStage: function (project) {
      var explicit = project.CurrentStepName || project.CurrentStepTitle || project.CurrentStage || project.StageName;
      if (explicit) return String(explicit).trim();
      var workflowId = String(project.WorkflowID || project.WorkflowId || '');
      var steps = this.workflowStepsByWorkflow[workflowId] || [];
      var step = this.findById(steps, project.CurrentStepID || project.CurrentStageID);
      return String((step && (step.Name || step.Title || step.Code)) || project.CurrentStepID || project.CurrentStageID || '').trim();
    },

    projectUnit: function (project) {
      return String(project.CurrentDepartmentName || project.DepartmentName || project.CurrentUnitName || project.UnitName || project.CurrentDepartmentID || project.DepartmentID || '').trim();
    },

    projectStatus: function (project) {
      return String(project.Status || 'ACTIVE').toUpperCase();
    },

    projectLastActivity: function (project) {
      var best = this.dateValue(project.UpdatedAt || project.CreatedAt);
      var history = this.getHistory(this.getId(project));
      if (history && history.events) {
        history.events.forEach(function (event) {
          var time = Dashboard.eventTime(event);
          if (time !== null && (best === null || time > best)) best = time;
        });
      }
      return best;
    },

    filteredProjects: function () {
      var self = this;
      var query = this.query.trim().toLocaleLowerCase();
      var filtered = this.projects.filter(function (project) {
        var id = String(self.getId(project));
        var history = self.getHistory(id);
        var stage = self.projectStage(project).toLocaleLowerCase();
        var unit = self.projectUnit(project).toLocaleLowerCase();
        var status = self.projectStatus(project);
        var created = self.dateValue(project.CreatedAt);
        var activity = self.projectLastActivity(project);
        var matches = true;

        if (self.filters.stage && stage !== String(self.filters.stage).toLocaleLowerCase()) matches = false;
        if (self.filters.status && status !== String(self.filters.status).toUpperCase()) matches = false;
        if (self.filters.unit) {
          var unitMatch = unit === String(self.filters.unit).toLocaleLowerCase();
          if (!unitMatch && history) unitMatch = history.events.some(function (event) {
            return String(event.DepartmentName || event.DepartmentTitle || event.DepartmentID || '').toLocaleLowerCase() === String(self.filters.unit).toLocaleLowerCase();
          });
          if (!unitMatch) matches = false;
        }
        if (self.filters.registrant) {
          var registrantMatch = !!history && history.events.some(function (event) {
            var selected = String(self.filters.registrant);
            var creatorId = String(event.CreatedBy || event.CreatedByID || event.CreatedById || '');
            var creatorName = String(event.CreatedByName || event.CreatorName || '');
            var lookupName = String(self.lookupName(self.users, selected) || '');
            return creatorId === selected || creatorName === selected ||
              (!!lookupName && creatorName === lookupName);
          });
          if (!registrantMatch) matches = false;
        }
        if (self.filters.type) {
          var typeMatch = !!history && history.events.some(function (event) {
            return String(event.EventTypeID || event.EventTypeId || '') === String(self.filters.type);
          });
          if (!typeMatch) matches = false;
        }
        if (self.filters.createdFrom && !self.inDateRange(created, self.filters.createdFrom, 'from')) matches = false;
        if (self.filters.createdTo && !self.inDateRange(created, self.filters.createdTo, 'to')) matches = false;
        if (self.filters.activityFrom && !self.inDateRange(activity, self.filters.activityFrom, 'from')) matches = false;
        if (self.filters.activityTo && !self.inDateRange(activity, self.filters.activityTo, 'to')) matches = false;

        if (matches && query) {
          var projectText = self.searchableProjectText(project).toLocaleLowerCase();
          var projectMatches = projectText.indexOf(query) !== -1;
          var eventMatches = !!history && history.events.some(function (event) {
            return self.searchableEventText(event, history).toLocaleLowerCase().indexOf(query) !== -1;
          });
          if (!projectMatches && !eventMatches && !history) {
            // Until this project's history is indexed, keep the list provisional.
            matches = true;
          } else {
            matches = projectMatches || eventMatches;
          }
        }
        return matches;
      });

      filtered.sort(function (a, b) {
        var aTime = self.sortBy === 'activity' ? self.projectLastActivity(a) : self.dateValue(a.CreatedAt);
        var bTime = self.sortBy === 'activity' ? self.projectLastActivity(b) : self.dateValue(b.CreatedAt);
        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;
        return bTime - aTime;
      });
      return filtered;
    },

    searchableProjectText: function (project) {
      return Object.keys(project || {}).map(function (key) {
        return Dashboard.stringifyValue(project[key]);
      }).join(' ');
    },

    searchableEventText: function (event, history) {
      var id = String(this.getId(event));
      var typeId = String(event.EventTypeID || event.EventTypeId || '');
      var fields = history.eventFields[typeId] || [];
      var data = history.eventData[id] || {};
      var pieces = Object.keys(event || {}).map(function (key) {
        return Dashboard.stringifyValue(event[key]);
      });
      Object.keys(data).forEach(function (key) {
        var field = fields.find(function (item) { return String(item.Code || '') === String(key); });
        pieces.push(field ? field.Name : key);
        pieces.push(Dashboard.stringifyValue(data[key]));
      });
      this.getEventAttachments(id).forEach(function (attachment) {
        pieces.push(attachment.FileName || attachment.fileName || '');
      });
      return pieces.join(' ');
    },

    stringifyValue: function (value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        try { return JSON.stringify(value); } catch (error) { return String(value); }
      }
      return String(value);
    },

    renderProjectList: function () {
      var container = document.getElementById('dash-project-list');
      if (!container) return;
      var all = this.filteredProjects();
      var visible = all.slice(0, this.visibleCount);
      var oldScroll = window.scrollY || 0;
      var html = '';

      if (!all.length) {
        container.innerHTML = '<div class="dash-empty">پروژه‌ای مطابق جست‌وجو و فیلترها پیدا نشد.</div>';
      } else {
        visible.forEach(function (project) {
          html += Dashboard.renderProjectCard(project);
        });
        container.innerHTML = html;
      }

      var count = document.getElementById('dash-results-count');
      if (count) {
        var eventCount = this.countMatchingEvents(all);
        count.textContent = this.toPersianDigits(all.length) + ' پروژه از ' + this.toPersianDigits(this.projects.length) +
          (this.query.trim() ? ' — ' + this.toPersianDigits(eventCount) + ' رویداد منطبق' : '');
      }

      var sentinel = document.getElementById('dash-list-sentinel');
      if (this.listObserver) this.listObserver.disconnect();
      if (sentinel && 'IntersectionObserver' in window) {
        this.listObserver = new IntersectionObserver(function (entries) {
          if (entries.some(function (entry) { return entry.isIntersecting; })) {
            if (Dashboard.visibleCount < Dashboard.filteredProjects().length) {
              var loading = document.getElementById('dash-list-loading');
              if (loading) loading.hidden = false;
              Dashboard.visibleCount += PAGE_SIZE;
              Dashboard.renderProjectList();
            }
          }
        }, { rootMargin: '300px 0px' });
        this.listObserver.observe(sentinel);
      }

      var loading = document.getElementById('dash-list-loading');
      if (loading) loading.hidden = this.visibleCount >= all.length;
      this.scheduleTimelineContinuation();
      if (oldScroll > 0) window.requestAnimationFrame(function () { window.scrollTo(0, oldScroll); });
      this.saveState();
    },

    renderProjectCard: function (project) {
      var id = String(this.getId(project));
      var expanded = !!this.expanded[id];
      var stage = this.projectStage(project) || 'مرحله نامشخص';
      var status = this.projectStatus(project);
      var statusClass = status === 'ACTIVE' ? 'dash-status-active' :
        (status === 'ON_HOLD' || status === 'INACTIVE' ? 'dash-status-hold' :
        (status === 'COMPLETED' ? 'dash-status-completed' : (status === 'CANCELLED' || status === 'VOID' ? 'dash-status-cancelled' : '')));
      var history = this.getHistory(id);
      var last = this.projectLastActivity(project);
      var matching = this.matchingEventIds(history);
      var html = '<article class="dash-project-card' + (expanded ? ' is-expanded' : '') + '" data-project-card="' + this.escape(id) + '">' +
        '<button type="button" class="dash-project-card-head" data-project-id="' + this.escape(id) + '" aria-expanded="' + String(expanded) + '">' +
          '<div class="dash-project-main">' +
            '<div class="dash-project-code">' + this.escape(project.ProjectCode || 'بدون کد') + '</div>' +
            '<div class="dash-project-title">' + this.escape(project.Title || project.Name || 'بدون عنوان') + '</div>' +
            '<div class="dash-project-badges"><span class="dash-badge dash-badge-stage">' + this.escape(stage) + '</span>' +
              '<span class="dash-badge dash-badge-status ' + statusClass + '"><span aria-hidden="true">●</span> ' + this.escape(this.statusText(status)) + '</span></div>' +
            '<div class="dash-project-activity">آخرین فعالیت: ' + this.escape(this.formatExactDate(last)) + ' — ' + this.escape(this.relativeTime(last)) + '</div>' +
          '</div><span class="dash-project-chevron" aria-hidden="true">⌄</span>' +
        '</button>';

      if (expanded) {
        html += '<div class="dash-project-history" id="dash-history-' + this.escape(id) + '">';
        html += '<div class="dash-history-tools"><strong>خط زمانی تولید</strong><a href="#project-detail/' + encodeURIComponent(id) + '">صفحه جزئیات پروژه ←</a></div>';
        if (!history || history.loading) {
          html += '<div class="dash-skeleton-card"><span></span><span></span><span></span><span></span></div>';
        } else if (history.error) {
          html += '<div class="dash-error">دریافت تاریخچه ناموفق بود. <button type="button" class="btn btn-secondary dash-retry-history" data-project-id="' + this.escape(id) + '">تلاش مجدد</button></div>';
        } else if (!history.events.length) {
          html += '<div class="dash-empty">هنوز رویداد تولیدی برای این پروژه ثبت نشده است</div>';
        } else {
          html += this.renderTimeline(id, history, matching);
        }
        html += '</div>';
      }
      html += '</article>';
      return html;
    },

    getTimelineEvents: function (history) {
      var self = this;
      var events = history.events.slice().filter(function (event) {
        var status = String(event.Status || '').toUpperCase();
        return status !== 'VOID' && status !== 'CANCELLED';
      });
      events.sort(function (a, b) {
        var first = self.eventTime(a), second = self.eventTime(b);
        if (first === null && second === null) return 0;
        if (first === null) return 1;
        if (second === null) return -1;
        return self.eventOrder === 'oldest' ? first - second : second - first;
      });
      return events;
    },

    renderTimeline: function (projectId, history, matching) {
      var events = this.getTimelineEvents(history);
      var html = '<div class="dash-timeline" data-project-id="' + this.escape(projectId) + '">';
      html += this.renderTimelineBatch(projectId, history, matching, 0, 30, events);
      if (events.length > 30) {
        html += '<div class="dash-timeline-more dash-skeleton-card" data-project-id="' + this.escape(projectId) + '" data-next-offset="30" aria-label="در حال بارگذاری رویدادهای بیشتر"><span></span><span></span><span></span></div>';
      }
      html += '</div>';
      return html;
    },

    renderTimelineBatch: function (projectId, history, matching, start, limit, events) {
      var self = this;
      events = events || this.getTimelineEvents(history);
      var html = '';
      events.slice(start, start + limit).forEach(function (event) {
        var id = String(self.getId(event));
        var typeId = String(event.EventTypeID || event.EventTypeId || '');
        var type = self.findById(self.eventTypes, typeId);
        var title = event.EventTypeName || (type && (type.Name || type.Title || type.Code)) || event.EventTypeCode || 'رویداد';
        var stage = event.DepartmentName || event.DepartmentTitle || self.projectUnit(self.getProject(projectId) || {}) || 'مرحله';
        var data = history.eventData[id] || {};
        var fields = history.eventFields[typeId] || [];
        var qty = self.quantityValue(data, fields);
        var date = self.eventTime(event);
        var matched = matching.indexOf(id) !== -1;
        var open = self.openEventId === id;
        html += '<article class="dash-event' + (matched ? ' is-match' : '') + (self.targetEventId === id ? ' is-target' : '') + '" id="dash-event-' + self.escape(id) + '">' +
          '<button type="button" class="dash-event-toggle" data-event-id="' + self.escape(id) + '" aria-expanded="' + String(open) + '">' +
            '<span><span class="dash-event-title">' + self.escape(title + ' — ' + stage + (qty ? ' | ' + qty : '')) + '</span>' +
              '<span class="dash-event-meta"><span>ثبت‌کننده: ' + self.escape(event.CreatedByName || event.CreatorName || self.lookupName(self.users, event.CreatedBy || event.CreatedByID) || '-') + '</span></span></span>' +
            '<span class="dash-event-date">' + self.escape(self.formatExactDate(date)) + '</span>' +
          '</button>';
        if (open) html += self.renderEventDetails(event, history);
        html += '</article>';
      });
      return html;
    },

    scheduleTimelineContinuation: function () {
      if (this.timelineContinuationScheduled) return;
      var first = document.querySelector('#dash-project-list .dash-timeline-more');
      if (!first) return;
      this.timelineContinuationScheduled = true;
      window.requestAnimationFrame(function () {
        Dashboard.timelineContinuationScheduled = false;
        var sentinels = Array.prototype.slice.call(document.querySelectorAll('#dash-project-list .dash-timeline-more'));
        sentinels.forEach(function (sentinel) {
          if (!sentinel.isConnected) return;
          var projectId = sentinel.getAttribute('data-project-id');
          var history = Dashboard.getHistory(projectId);
          if (!history || !history.loaded) {
            sentinel.remove();
            return;
          }
          var matching = Dashboard.matchingEventIds(history);
          var events = Dashboard.getTimelineEvents(history);
          var offset = Number(sentinel.getAttribute('data-next-offset') || 0);
          var batch = Dashboard.renderTimelineBatch(projectId, history, matching, offset, 30, events);
          sentinel.insertAdjacentHTML('beforebegin', batch);
          offset += 30;
          if (offset >= events.length) {
            sentinel.remove();
          } else {
            sentinel.setAttribute('data-next-offset', String(offset));
          }
          if (Dashboard.targetEventId) {
            var target = document.getElementById('dash-event-' + Dashboard.cssEscape(Dashboard.targetEventId));
            if (target) Dashboard.focusTargetEvent(Dashboard.targetEventId);
          }
        });
        if (document.querySelector('#dash-project-list .dash-timeline-more')) {
          Dashboard.scheduleTimelineContinuation();
        }
      });
    },

    renderEventDetails: function (event, history) {
      var id = String(this.getId(event));
      var typeId = String(event.EventTypeID || event.EventTypeId || '');
      var data = history.eventData[id] || {};
      var fields = history.eventFields[typeId] || [];
      var fieldByCode = {};
      fields.forEach(function (field) { fieldByCode[String(field.Code || '')] = field; });
      var html = '<div class="dash-event-details"><div class="dash-detail-grid">';
      var base = [
        ['عنوان رویداد', event.EventTypeName || (this.findById(this.eventTypes, typeId) || {}).Name || event.EventTypeCode || 'رویداد'],
        ['مرحله / واحد', event.DepartmentName || event.DepartmentTitle || event.DepartmentID || '-'],
        ['ثبت‌کننده', event.CreatedByName || event.CreatorName || this.lookupName(this.users, event.CreatedBy || event.CreatedByID) || '-'],
        ['اجراکننده', event.PerformedByName || this.lookupName(this.users, event.PerformedBy || event.PerformedByID) || '-'],
        ['تاریخ و ساعت رویداد', this.formatExactDate(this.eventTime(event))],
        ['تاریخ ثبت', this.formatExactDate(this.dateValue(event.CreatedAt))],
        ['وضعیت رویداد', this.statusText(event.Status)],
        ['شناسه رویداد', id]
      ];
      base.forEach(function (pair) {
        html += '<div class="dash-detail-item"><small>' + Dashboard.escape(pair[0]) + '</small><strong>' + Dashboard.escape(pair[1]) + '</strong></div>';
      });
      Object.keys(data).forEach(function (key) {
        var field = fieldByCode[key];
        html += '<div class="dash-detail-item"><small>' + Dashboard.escape(field ? field.Name || key : key) + '</small><strong>' + Dashboard.escape(Dashboard.stringifyValue(data[key])) + '</strong></div>';
      });
      html += '</div>';
      if (event.Description) html += '<div class="dash-description">' + this.escape(event.Description) + '</div>';
      var attachments = this.getEventAttachments(id);
      if (attachments.length) {
        html += '<div class="dash-attachments">';
        attachments.forEach(function (attachment) {
          var aid = attachment.ID || attachment.Id || attachment.id;
          var name = attachment.FileName || attachment.fileName || attachment.Name || 'فایل پیوست';
          var mime = String(attachment.MimeType || attachment.mimeType || '');
          var image = mime.indexOf('image/') === 0;
          if (image) {
            html += '<button type="button" class="dash-attachment" data-attachment-id="' + Dashboard.escape(aid) + '">' +
              '<img alt="' + Dashboard.escape(name) + '" data-preview-id="' + Dashboard.escape(aid) + '" src="" loading="lazy"><span>' + Dashboard.escape(name) + '</span></button>';
          } else {
            html += '<button type="button" class="dash-attachment" data-attachment-id="' + Dashboard.escape(aid) + '"><span aria-hidden="true">📎</span><span>' + Dashboard.escape(name) + ' (' + Dashboard.escape(mime || 'فایل') + ')</span></button>';
          }
        });
        html += '</div>';
      }
      html += '</div>';
      return html;
    },

    toggleProject: function (projectId) {
      projectId = String(projectId || '');
      if (!projectId) return;
      if (this.expanded[projectId]) {
        delete this.expanded[projectId];
      } else {
        this.expanded[projectId] = true;
        this.loadProjectHistory(projectId, false);
      }
      this.saveState();
      this.renderProjectList();
    },

    toggleEventDetails: function (eventId) {
      eventId = String(eventId || '');
      this.openEventId = this.openEventId === eventId ? '' : eventId;
      this.targetEventId = this.openEventId ? eventId : '';
      this.saveState();
      this.renderProjectList();
      var self = this;
      window.setTimeout(function () {
        var event = document.getElementById('dash-event-' + eventId);
        if (event) {
          var rect = event.getBoundingClientRect();
          if (rect.top < 80 || rect.bottom > window.innerHeight) event.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var images = event.querySelectorAll('img[data-preview-id]');
          for (var i = 0; i < images.length; i++) self.loadAttachmentPreview(images[i].getAttribute('data-preview-id'));
        }
      }, 60);
    },

    openSearchEvent: async function (projectId, eventId) {
      this.expanded[String(projectId)] = true;
      this.targetEventId = String(eventId);
      this.openEventId = String(eventId);
      var history = this.getHistory(projectId);
      if (!history || !history.loaded) {
        await this.loadProjectHistory(projectId, false);
      }
      var visible = this.filteredProjects();
      var index = visible.findIndex(function (project) {
        return String(Dashboard.getId(project)) === String(projectId);
      });
      if (index >= 0) this.visibleCount = Math.max(this.visibleCount, index + 1);
      this.renderProjectList();
      this.focusTargetEvent(eventId);
    },

    focusTargetEvent: function (eventId) {
      var self = this;
      window.setTimeout(function () {
        var target = document.getElementById('dash-event-' + String(eventId || self.targetEventId));
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('is-target');
        window.setTimeout(function () {
          target.classList.remove('is-target');
          if (String(self.targetEventId) === String(eventId)) self.targetEventId = '';
        }, 2800);
      }, 80);
    },

    renderEventSearchResults: function () {
      var container = document.getElementById('dash-event-search-results');
      if (!container) return;
      var query = this.query.trim().toLocaleLowerCase();
      if (!query) {
        container.hidden = true;
        container.innerHTML = '';
        return;
      }
      var hits = [];
      var self = this;
      this.projects.forEach(function (project) {
        var projectId = String(self.getId(project));
        var history = self.getHistory(projectId);
        if (!history || !history.loaded) return;
        history.events.forEach(function (event) {
          var status = String(event.Status || '').toUpperCase();
          if (status === 'VOID' || status === 'CANCELLED') return;
          if (self.searchableEventText(event, history).toLocaleLowerCase().indexOf(query) === -1) return;
          hits.push({ project: project, event: event });
        });
      });
      hits.sort(function (a, b) { return (self.eventTime(b.event) || 0) - (self.eventTime(a.event) || 0); });
      if (!hits.length) {
        var emptyText = self.indexingDone
          ? 'رویدادی مطابق جست‌وجو پیدا نشد.'
          : 'هنوز رویداد منطبقی پیدا نشده است؛ جست‌وجوی پس‌زمینه در حال تکمیل است.';
        container.innerHTML = '<div class="dash-empty">' + self.escape(emptyText) + '</div>';
      } else {
        container.innerHTML = hits.slice(0, 12).map(function (hit) {
          var projectId = String(self.getId(hit.project));
          var eventId = String(self.getId(hit.event));
          return '<button type="button" class="dash-event-hit" data-project-id="' + self.escape(projectId) + '" data-event-id="' + self.escape(eventId) + '">' +
            '<span><strong>' + self.escape(hit.project.ProjectCode || hit.project.Title || 'پروژه') + ' — ' + self.escape(hit.event.EventTypeName || 'رویداد') + '</strong>' +
            '<small>' + self.escape(hit.event.Description || hit.project.Title || '') + '</small></span><small>' + self.escape(self.formatExactDate(self.eventTime(hit.event))) + '</small></button>';
        }).join('');
      }
      container.hidden = false;
    },

    matchingEventIds: function (history) {
      if (!this.query.trim() || !history || !history.loaded) return [];
      var query = this.query.trim().toLocaleLowerCase();
      return history.events.filter(function (event) {
        return String(event.Status || '').toUpperCase() !== 'VOID' &&
          Dashboard.searchableEventText(event, history).toLocaleLowerCase().indexOf(query) !== -1;
      }).map(function (event) { return String(Dashboard.getId(event)); });
    },

    countMatchingEvents: function (projects) {
      if (!this.query.trim()) return 0;
      var self = this;
      var count = 0;
      projects.forEach(function (project) {
        var history = self.getHistory(self.getId(project));
        count += self.matchingEventIds(history).length;
      });
      return count;
    },

    getEventAttachments: function (eventId) {
      return this.attachments.filter(function (attachment) {
        return String(attachment.EntityType || attachment.entityType || '').toUpperCase() === 'EVENT' &&
          String(attachment.EntityID || attachment.entityID || '') === String(eventId);
      });
    },

    loadAttachmentPreview: async function (attachmentId) {
      attachmentId = String(attachmentId || '');
      if (!attachmentId) return;
      var image = document.querySelector('img[data-preview-id="' + this.cssEscape(attachmentId) + '"]');
      if (!image || image.src) return;
      try {
        var data = await this.loadAttachmentContent(attachmentId);
        if (!data || !data.Base64) return;
        var current = document.querySelector('img[data-preview-id="' + this.cssEscape(attachmentId) + '"]');
        if (current) current.src = 'data:' + (data.MimeType || 'image/jpeg') + ';base64,' + data.Base64;
      } catch (error) {}
    },

    loadAttachmentContent: async function (attachmentId) {
      if (this.attachmentContent[attachmentId]) return this.attachmentContent[attachmentId];
      var response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId));
      var data = window.PMS.Api.extractData(response);
      if (data && data.data && !data.Base64) data = data.data;
      if (data && data.Base64) this.attachmentContent[attachmentId] = data;
      return data || {};
    },

    openAttachment: async function (attachmentId) {
      try {
        var data = await this.loadAttachmentContent(String(attachmentId));
        if (!data || !data.Base64) {
          this.showError(new Error('محتوای فایل دریافت نشد.'), true);
          return;
        }
        var mime = data.MimeType || 'application/octet-stream';
        var url = 'data:' + mime + ';base64,' + data.Base64;
        if (String(mime).indexOf('image/') === 0) {
          var modal = document.createElement('div');
          modal.className = 'dash-file-modal';
          modal.innerHTML = '<div class="dash-file-modal-inner"><button type="button" class="dash-file-modal-close" aria-label="بستن">×</button><img alt="' + this.escape(data.FileName || 'پیوست') + '" src="' + url + '"><div>' + this.escape(data.FileName || 'پیوست') + '</div></div>';
          modal.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl';
          var inner = modal.querySelector('.dash-file-modal-inner');
          inner.style.cssText = 'max-width:95vw;max-height:92vh;background:var(--color-surface);padding:12px;border-radius:12px;color:var(--color-text);text-align:center;overflow:auto';
          var img = modal.querySelector('img');
          img.style.cssText = 'display:block;max-width:88vw;max-height:75vh;object-fit:contain;margin:8px auto';
          var close = modal.querySelector('button');
          close.style.cssText = 'float:left;border:0;background:transparent;color:inherit;font-size:25px;cursor:pointer';
          close.addEventListener('click', function () { modal.remove(); });
          modal.addEventListener('click', function (event) { if (event.target === modal) modal.remove(); });
          document.body.appendChild(modal);
        } else {
          var link = document.createElement('a');
          link.href = url;
          link.download = data.FileName || 'attachment';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      } catch (error) {
        this.showError(error, true);
      }
    },

    populateFilterControls: function () {
      var self = this;
      var stageValues = [];
      var unitValues = [];
      this.projects.forEach(function (project) {
        var stage = self.projectStage(project);
        var unit = self.projectUnit(project);
        if (stage && stageValues.indexOf(stage) === -1) stageValues.push(stage);
        if (unit && unitValues.indexOf(unit) === -1) unitValues.push(unit);
      });
      this.histories && Object.keys(this.histories).forEach(function (id) {
        var history = self.histories[id];
        (history.events || []).forEach(function (event) {
          var unit = event.DepartmentName || event.DepartmentTitle || event.DepartmentID || '';
          if (unit && unitValues.indexOf(String(unit)) === -1) unitValues.push(String(unit));
        });
      });
      this.fillSelect('dash-filter-stage', stageValues, this.filters.stage);
      this.fillSelect('dash-filter-unit', unitValues, this.filters.unit);
      this.fillSelect('dash-filter-registrant', this.users.map(function (user) {
        return { value: self.getId(user), label: user.Name || user.FullName || user.Username || self.getId(user) };
      }), this.filters.registrant, 'همه ثبت‌کنندگان');
      this.fillSelect('dash-filter-type', this.eventTypes.map(function (type) {
        return { value: self.getId(type), label: type.Name || type.Title || type.Code || self.getId(type) };
      }), this.filters.type, 'همه رویدادها');
    },

    fillSelect: function (id, values, selected, placeholder) {
      var select = document.getElementById(id);
      if (!select) return;
      var first = select.options[0] ? select.options[0].outerHTML : '<option value="">' + this.escape(placeholder || 'همه') + '</option>';
      var normalized = values.map(function (item) {
        if (item && typeof item === 'object') return { value: String(item.value || ''), label: String(item.label || item.value || '') };
        return { value: String(item), label: String(item) };
      }).filter(function (item) { return item.value && item.label; });
      normalized.sort(function (a, b) { return a.label.localeCompare(b.label, 'fa'); });
      select.innerHTML = first + normalized.map(function (item) {
        return '<option value="' + Dashboard.escape(item.value) + '">' + Dashboard.escape(item.label) + '</option>';
      }).join('');
      select.value = selected || '';
    },

    syncFilterControls: function () {
      var map = {
        stage: 'dash-filter-stage', status: 'dash-filter-status', unit: 'dash-filter-unit',
        registrant: 'dash-filter-registrant', type: 'dash-filter-type',
        createdFrom: 'dash-filter-created-from', createdTo: 'dash-filter-created-to',
        activityFrom: 'dash-filter-activity-from', activityTo: 'dash-filter-activity-to'
      };
      Object.keys(map).forEach(function (key) {
        var element = document.getElementById(map[key]);
        if (element) element.value = Dashboard.filters[key] || '';
      });
    },

    renderActiveFilterChips: function () {
      var container = document.getElementById('dash-active-filters');
      if (!container) return;
      var labels = {
        stage: 'مرحله', status: 'وضعیت', unit: 'واحد', registrant: 'ثبت‌کننده', type: 'نوع رویداد',
        createdFrom: 'ایجاد از', createdTo: 'ایجاد تا', activityFrom: 'فعالیت از', activityTo: 'فعالیت تا'
      };
      var html = '';
      Object.keys(this.filters).forEach(function (key) {
        var value = selfValue(Dashboard.filters[key]);
        if (!value) return;
        html += '<span class="dash-filter-chip">' + Dashboard.escape(labels[key] || key) + ': ' + Dashboard.escape(value) +
          '<button type="button" class="dash-filter-chip-remove" data-filter-key="' + Dashboard.escape(key) + '" aria-label="حذف فیلتر ' + Dashboard.escape(labels[key] || key) + '">×</button></span>';
      });
      container.innerHTML = html;
    },

    inDateRange: function (timestamp, value, direction) {
      if (timestamp === null || timestamp === undefined) return false;
      var bound = this.parseJalaliInput(value);
      if (bound === null) return true;
      var date = new Date(timestamp);
      if (direction === 'from') return date.getTime() >= bound;
      return date.getTime() < bound + 86400000;
    },

    parseJalaliInput: function (value) {
      var digits = this.toEnglishDigits(String(value || '')).trim();
      if (!digits) return null;
      var match = digits.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
      if (!match) return null;
      var jy = Number(match[1]), jm = Number(match[2]), jd = Number(match[3]);
      if (jm < 1 || jm > 12 || jd < 1 || jd > (jm <= 6 ? 31 : (jm <= 11 ? 30 : 30))) return null;
      var date = this.jalaliToGregorian(jy, jm, jd);
      if (date === null) return null;
      try {
        var parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
          year: 'numeric', month: 'numeric', day: 'numeric'
        }).formatToParts(new Date(date));
        var parsed = {};
        parts.forEach(function (part) {
          if (part.type === 'year' || part.type === 'month' || part.type === 'day') parsed[part.type] = Number(part.value);
        });
        if (parsed.year !== jy || parsed.month !== jm || parsed.day !== jd) return null;
      } catch (error) {
        // If Intl calendar parts are unavailable, keep the converted date.
      }
      var converted = new Date(date);
      return new Date(converted.getFullYear(), converted.getMonth(), converted.getDate()).getTime();
    },

    jalaliToGregorian: function (jy, jm, jd) {
      jy += 1595;
      var days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 +
        Math.floor(((jy % 33) + 3) / 4) + jd;
      days += jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30) + 186;
      var gy = 400 * Math.floor(days / 146097);
      days %= 146097;
      if (days > 36524) {
        gy += 100 * Math.floor(--days / 36524);
        days %= 36524;
        if (days >= 365) days++;
      }
      gy += 4 * Math.floor(days / 1461);
      days %= 1461;
      if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
      }
      var gd = days + 1;
      var leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
      var monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var gm = 1;
      while (gm <= 12 && gd > monthDays[gm]) {
        gd -= monthDays[gm];
        gm++;
      }
      if (gm > 12) return null;
      return new Date(gy, gm - 1, gd).getTime();
    },

    eventTime: function (event) {
      return this.dateValue(event && (event.OccurredAt || event.occurredAt || event.CreatedAt || event.createdAt));
    },

    dateValue: function (value) {
      if (value === null || value === undefined || value === '') return null;
      var time = new Date(value).getTime();
      return isNaN(time) ? null : time;
    },

    quantityValue: function (data, fields) {
      if (!data || typeof data !== 'object') return '';
      var quantityKeys = ['quantity', 'qty', 'count', 'amount', 'total', 'تعداد', 'مقدار', 'تعدادتولید', 'مقدارتحویل'];
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var field = fields.find(function (item) { return String(item.Code || '') === String(key); });
        var label = String((field && (field.Name || field.Code)) || key).toLocaleLowerCase().replace(/[\s_\-]/g, '');
        if (quantityKeys.indexOf(label) !== -1 || /quantity|qty|count|تعداد|مقدار/.test(label)) {
          return this.stringifyValue(data[key]) + ' ' + (field && field.Unit ? field.Unit : 'عدد');
        }
      }
      return '';
    },

    findById: function (items, id) {
      if (!Array.isArray(items) || id === null || id === undefined || id === '') return null;
      return items.find(function (item) {
        return item && [item.ID, item.Id, item.id].some(function (value) {
          return value !== null && value !== undefined && String(value) === String(id);
        });
      }) || null;
    },

    lookupName: function (items, id) {
      var item = this.findById(items, id);
      return item && (item.Name || item.FullName || item.Username || item.Title) || '';
    },

    statusText: function (status) {
      var labels = {
        ACTIVE: 'فعال', INACTIVE: 'غیرفعال', ON_HOLD: 'متوقف',
        COMPLETED: 'تکمیل‌شده', CANCELLED: 'لغوشده', VOID: 'باطل‌شده',
        DELETED: 'حذف‌شده', PENDING: 'در انتظار', DRAFT: 'پیش‌نویس',
        SUBMITTED: 'ثبت‌شده', APPROVED: 'تأییدشده', REJECTED: 'ردشده'
      };
      return labels[String(status || '').toUpperCase()] || status || 'نامشخص';
    },

    formatExactDate: function (timestamp) {
      if (timestamp === null || timestamp === undefined || timestamp === '') return 'تاریخ نامشخص';
      var date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
      if (isNaN(date.getTime())) return String(timestamp);
      try {
        return date.toLocaleString('fa-IR-u-ca-persian', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: false
        });
      } catch (error) {
        return date.toLocaleString('fa-IR');
      }
    },

    relativeTime: function (timestamp) {
      if (timestamp === null || timestamp === undefined) return 'نامشخص';
      var seconds = Math.round((timestamp - Date.now()) / 1000);
      var abs = Math.abs(seconds);
      var value, unit;
      if (abs < 60) { value = seconds; unit = 'second'; }
      else if (abs < 3600) { value = Math.round(seconds / 60); unit = 'minute'; }
      else if (abs < 86400) { value = Math.round(seconds / 3600); unit = 'hour'; }
      else if (abs < 2592000) { value = Math.round(seconds / 86400); unit = 'day'; }
      else if (abs < 31536000) { value = Math.round(seconds / 2592000); unit = 'month'; }
      else { value = Math.round(seconds / 31536000); unit = 'year'; }
      try {
        return new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' }).format(value, unit);
      } catch (error) {
        return this.toPersianDigits(Math.abs(value)) + ' ' + unit;
      }
    },

    toPersianDigits: function (value) {
      return String(value).replace(/\d/g, function (digit) { return '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]; });
    },

    toEnglishDigits: function (value) {
      return String(value).replace(/[۰-۹]/g, function (digit) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)); });
    },

    cssEscape: function (value) {
      if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
      return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
    },

    showError: function (error, retainData) {
      var box = document.getElementById('dash-error');
      if (!box) return;
      var message = error && error.message ? error.message : String(error || 'خطای نامشخص');
      box.innerHTML = '<span>' + this.escape(message) + '</span> <button type="button" id="dash-retry-all" class="btn btn-secondary">تلاش مجدد</button>';
      box.hidden = false;
      var retry = box.querySelector('#dash-retry-all');
      if (retry) {
        retry.addEventListener('click', function () {
          box.hidden = true;
          Dashboard.loadProjects();
          if (Dashboard.query.trim()) {
            Dashboard.indexingDone = false;
            Dashboard.startSearchIndexingIfNeeded();
          }
        });
      }
      if (!retainData && !this.projects.length) {
        var list = document.getElementById('dash-project-list');
        if (list) list.innerHTML = '<div class="dash-empty">اطلاعاتی برای نمایش در دسترس نیست.</div>';
      }
    },

    escape: function (value) {
      return String(value === null || value === undefined ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
  };

  function selfValue(value) { return String(value === null || value === undefined ? '' : value); }

  window.PMS = window.PMS || {};
  window.PMS.Dashboard = Dashboard;
  window.PMS.Modules = window.PMS.Modules || {};
  window.PMS.Modules.Dashboard = Dashboard;
})();