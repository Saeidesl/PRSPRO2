(function () {
  'use strict';

  const ProjectDetail = {
    projectId: null,
    project: null,
    projectInformation: [],
    projectForms: [],
    projectFormImageUrls: {},
    projectFormsLoading: false,
    projectFormsError: '',
    projectFormsLoadVersion: 0,
    events: [],
    auditRecords: [],
    auditLoadError: '',
    users: [],
    departments: [],
    eventTypes: [],
    projectStatuses: [],
    workflowSteps: [],
    eventData: {},
    eventFields: {},
    loadVersion: 0,

    init: function () {
      if (window.location.hash.replace(/^#/, '').split('/')[0] === 'print-designer') {
        this.initPrintDesignerPage();
        return;
      }
      this.projectId = this.getProjectId();

      if (!this.projectId) {
        this.showError('شناسه پروژه مشخص نیست.');
        return;
      }

      this.bindEvents();
      this.bindProjectPassportImageEvents();
      this.ensureProjectPassportStyles();
      this.load();
      this.loadProjectPassportImages(false);
      this.loadAuditHistory(false);
    },

    getProjectId: function () {
      const hash = window.location.hash || '';
      const parts = hash.split('/');

      if (
        parts.length < 2 ||
        parts[0] !== '#project-detail'
      ) {
        return null;
      }

      try {
        return decodeURIComponent(parts[1]);
      } catch (error) {
        return parts[1];
      }
    },

    getProjectCacheKey: function () {
      return window.PMS.Cache.keys.PROJECT + '_' + this.projectId;
    },

    getEventsCacheKey: function () {
      return window.PMS.Cache.keys.PROJECT_EVENTS + '_' + this.projectId;
    },

    getEventDetailsCacheKey: function () {
      return this.getEventsCacheKey() + '_DETAILS';
    },

    getCacheKey: function (base, id) {
      return base + '_' + String(id);
    },

    bindEvents: function () {
      const backButton = document.getElementById(
        'project-back-button'
      );

      const addEventButton = document.getElementById(
        'project-add-event-button'
      );

      if (backButton && !backButton.dataset.projectDetailBound) {
        backButton.dataset.projectDetailBound = '1';

        backButton.addEventListener('click', function () {
          window.location.hash = '#projects';
        });
      }

      const router = window.PMS.Router;
      const canCreateEvents = !!(
        router &&
        ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
          (Array.isArray(router.permissions) &&
            router.permissions.indexOf('EVENT_CREATE') !== -1))
      );

      if (addEventButton) {
        addEventButton.hidden = !canCreateEvents;
      }

      if (addEventButton && !addEventButton.dataset.projectDetailBound) {
        addEventButton.dataset.projectDetailBound = '1';

        addEventButton.addEventListener('click', function () {
          if (!ProjectDetail.projectId || !canCreateEvents) return;

          if (window.PMS.Events) {
            window.PMS.Events.preselectedProjectId = ProjectDetail.projectId;
          }

          window.location.hash = '#events';
        });
      }

      const formsRetry = document.getElementById('project-forms-retry');
      if (formsRetry && !formsRetry.dataset.bound) {
        formsRetry.dataset.bound = '1';
        formsRetry.addEventListener('click', function () {
          ProjectDetail.loadProjectForms(ProjectDetail.events, ProjectDetail.loadVersion, true);
        });
      }

      const auditRetry = document.getElementById('project-management-history-retry');
      if (auditRetry && !auditRetry.dataset.bound) {
        auditRetry.dataset.bound = '1';
        auditRetry.addEventListener('click', function () {
          ProjectDetail.loadAuditHistory(true);
        });
      }
    },

    canEditProjectInformation: function () {
      const router = window.PMS && window.PMS.Router;
      return !!(router && ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('PROJECT_EDIT') !== -1)));
    },

    loadProjectForms: async function (events, version, forceRefresh) {
      const container = document.getElementById('project-forms-list');
      const loading = document.getElementById('project-forms-loading');
      const error = document.getElementById('project-forms-error');
      const retry = document.getElementById('project-forms-retry');
      if (!container || !this.projectId) return;
      const requestVersion = ++this.projectFormsLoadVersion;
      const activeEvents = (Array.isArray(events) ? events : []).filter(function (event) {
        const status = String(event.Status || '').toUpperCase();
        return event && (event.ID || event.Id) && !event.IsProcurementTimeline &&
          status !== 'VOID' && status !== 'CANCELLED' && status !== 'CANCELED';
      });
      this.projectFormsLoading = true;
      this.projectFormsError = '';
      if (loading) loading.hidden = false;
      if (error) error.hidden = true;
      if (retry) retry.hidden = true;
      if (!activeEvents.length) {
        this.projectForms = [];
        this.renderProjectForms();
        if (loading) loading.hidden = true;
        this.projectFormsLoading = false;
        return;
      }
      try {
        const collected = [];
        // محدودسازی هم‌زمانی از ایجاد موج درخواست برای پروژه‌های دارای timeline طولانی جلوگیری می‌کند.
        for (let start = 0; start < activeEvents.length; start += 5) {
          if (requestVersion !== this.projectFormsLoadVersion || version !== this.loadVersion) return;
          const batch = activeEvents.slice(start, start + 5);
          const results = await Promise.all(batch.map(async (event) => {
            const eventId = String(event.ID || event.Id);
            const response = forceRefresh
              ? await window.PMS.Api.get('/events/' + encodeURIComponent(eventId) + '/forms', { trackSync: false })
              : await window.PMS.Api.getCached('/events/' + encodeURIComponent(eventId) + '/forms',
                  'project_event_forms_' + eventId, { trackSync: false });
            return { event: event, responses: this.normalizeArray(response, ['items', 'Items', 'responses', 'Responses']) };
          }));
          results.forEach((result) => {
            result.responses.forEach((record) => {
              const definition = record.Definition || record.definition || {};
              const fields = Array.isArray(definition.Fields) ? definition.Fields :
                (Array.isArray(definition.fields) ? definition.fields : []);
              if (!fields.length) return;
              collected.push({
                event: result.event,
                eventId: String(result.event.ID || result.event.Id),
                formId: String(record.FormID || record.formId || definition.ID || definition.Id || ''),
                definition: definition,
                values: record.Values || record.values || {},
                updatedAt: record.UpdatedAt || record.updatedAt || '',
                createdAt: record.CreatedAt || record.createdAt || result.event.OccurredAt || result.event.CreatedAt || ''
              });
            });
          });
        }
        if (requestVersion !== this.projectFormsLoadVersion || version !== this.loadVersion) return;
        collected.sort((a, b) => {
          const at = new Date(a.createdAt || 0).getTime() || 0;
          const bt = new Date(b.createdAt || 0).getTime() || 0;
          return at - bt;
        });
        this.projectForms = collected;
        await this.prepareProjectFormImages(collected);
        if (requestVersion !== this.projectFormsLoadVersion || version !== this.loadVersion) return;
        this.renderProjectForms();
      } catch (err) {
        if (requestVersion !== this.projectFormsLoadVersion || version !== this.loadVersion) return;
        this.projectFormsError = err && err.message ? err.message : 'دریافت فرم‌های پروژه ناموفق بود.';
        if (error) {
          error.textContent = this.projectFormsError;
          error.hidden = false;
        }
        if (retry) retry.hidden = false;
      } finally {
        if (requestVersion === this.projectFormsLoadVersion) {
          this.projectFormsLoading = false;
          if (loading) loading.hidden = true;
        }
      }
    },



    initPrintDesignerPage: async function () {
      const select = document.getElementById('print-designer-project-select');
      const status = document.getElementById('print-designer-project-status');
      const launch = document.getElementById('print-designer-launch');
      if (!select) return;
      select.addEventListener('change', () => {
        launch.disabled = !select.value;
        if (status) status.textContent = select.value ? 'پروژه انتخاب شد؛ برای بارگذاری فرم‌ها ادامه بده.' : '';
      });
      launch.addEventListener('click', async () => {
        if (!select.value) return;
        launch.disabled = true;
        if (status) status.textContent = 'در حال دریافت مشخصات و فرم‌های پروژه...';
        try {
          await this.loadStandalonePrintProject(select.value);
          if (status) status.textContent = this.projectForms.length
            ? 'اطلاعات آماده است؛ می‌توانی طراحی سند را شروع کنی.'
            : 'پروژه بارگذاری شد؛ هنوز فرمی برای چاپ ثبت نشده است. می‌توانی مشخصات پروژه یا متن دلخواه اضافه کنی.';
          this.openPrintDesigner(true);
        } catch (error) {
          if (status) status.textContent = error.message || 'دریافت اطلاعات پروژه ناموفق بود.';
        } finally {
          launch.disabled = !select.value;
        }
      });
      try {
        const response = await window.PMS.Api.getCached('/projects', 'PMS_PRINT_DESIGNER_PROJECTS');
        const projects = this.normalizeArray(response, ['items','Items','projects','Projects']);
        select.innerHTML = '<option value="">انتخاب پروژه...</option>' + projects.map(project => {
          const id = project.ID || project.Id || project.ProjectID;
          const code = project.ProjectCode || project.Code || '';
          const title = project.Title || project.Name || project.ProjectName || 'بدون عنوان';
          return '<option value="' + this.escape(id) + '">' + this.escape((code ? code + ' — ' : '') + title) + '</option>';
        }).join('');
        const requested = this.getPrintDesignerProjectId();
        if (requested && projects.some(p => String(p.ID || p.Id || p.ProjectID) === requested)) {
          select.value = requested;
          launch.disabled = false;
        }
      } catch (error) {
        if (status) status.textContent = 'فهرست پروژه‌ها دریافت نشد؛ لطفاً صفحه را تازه‌سازی کن.';
      }
    },

    getPrintDesignerProjectId: function () {
      const parts = (window.location.hash || '').split('/');
      if (parts.length < 2 || parts[0] !== '#print-designer') return '';
      try { return decodeURIComponent(parts[1]); } catch (error) { return parts[1]; }
    },

    loadStandalonePrintProject: async function (projectId) {
      this.projectId = String(projectId);
      const version = ++this.loadVersion;
      this.projectForms = [];
      this.events = [];
      const results = await Promise.all([
        window.PMS.Api.getFresh('/projects/' + encodeURIComponent(this.projectId), 'print_designer_project_' + this.projectId, {trackSync:false}),
        window.PMS.Api.getFresh('/projects/' + encodeURIComponent(this.projectId) + '/details', 'print_designer_project_details_' + this.projectId, {trackSync:false})
      ]);
      if (version !== this.loadVersion) return;
      this.project = this.unwrap(results[0]);
      if (!this.project || typeof this.project !== 'object') throw new Error('مشخصات پروژه دریافت نشد.');
      this.applyEventDetailsBundle(results[1], version);
      await this.waitForProjectForms(version);
    },

    waitForProjectForms: async function (version) {
      while (version === this.loadVersion && this.projectFormsLoading) {
        await new Promise(resolve => setTimeout(resolve, 60));
      }
      if (version !== this.loadVersion) throw new Error('بارگذاری پروژه لغو شد.');
      if (this.projectFormsError) throw new Error(this.projectFormsError);
    },

    openPrintDesigner: function (standalone) {
      const existing = document.getElementById('project-print-designer');
      if (existing) existing.remove();
      const overlay = document.createElement('section');
      overlay.id = 'project-print-designer';
      overlay.className = 'project-print-designer' + (standalone ? ' ppd-standalone' : '');
      overlay.innerHTML = '<div class="ppd-toolbar"><div><strong>طراحی سند چاپی</strong><small>محتوا را اضافه کن، روی صفحه مرتب کن و ظاهرش را تغییر بده.</small></div><div class="ppd-toolbar-actions"><button type="button" data-ppd-save>ذخیره قالب</button><button type="button" data-ppd-print class="primary">چاپ / PDF</button><button type="button" data-ppd-close aria-label="بستن">×</button></div></div><div class="ppd-workspace"><aside class="ppd-library"><h3>افزودن محتوا</h3><button type="button" data-ppd-add="project">مشخصات اصلی پروژه</button><button type="button" data-ppd-add="project-fields">همه مشخصات پروژه</button><button type="button" data-ppd-add="text">متن دلخواه</button><button type="button" data-ppd-add="line">خط جداکننده</button><h4>فرم‌های ثبت‌شده</h4><div class="ppd-form-library">' + this.projectForms.map((item,index) => '<div class="ppd-form-group"><button type="button" data-ppd-form="' + index + '">' + this.escape((item.definition && (item.definition.Name || item.definition.Title)) || 'فرم کامل') + '<small>' + this.escape((item.event && (item.event.EventTypeName || item.event.EventTypeTitle)) || 'رویداد') + ' · ' + this.escape(this.formatDate(item.createdAt)) + '</small></button>' + ((item.definition && Array.isArray(item.definition.Fields)) ? item.definition.Fields.map((field,fieldIndex) => '<button type="button" class="ppd-field-add" data-ppd-field="' + index + '" data-ppd-field-key="' + this.escape(String(field.ID || field.InformationTypeID || fieldIndex)) + '">+ ' + this.escape((field.InformationType && field.InformationType.Name) || field.LabelOverride || 'فیلد') + '</button>').join('') : '') + '</div>').join('') + '</div></aside><main class="ppd-stage-wrap"><div class="ppd-stage-meta">پیش‌نمایش A4 · ' + this.escape(this.project && (this.project.Code || this.project.ProjectCode) || '') + '</div><div class="ppd-paper" data-ppd-paper><div class="ppd-paper-empty">از پنل «افزودن محتوا» موارد موردنیاز را به این صفحه اضافه کن.</div></div></main><aside class="ppd-properties"><h3>تنظیمات المان</h3><div data-ppd-properties class="ppd-properties-empty">برای تنظیم ظاهر، یک المان را انتخاب کن.</div><p class="ppd-help">برای تغییر ترتیب، المان‌ها را با ماوس یا لمس جابه‌جا کن.</p></aside></div>';
      document.body.classList.add('ppd-printing');
      document.body.appendChild(overlay);
      this.printDesignerElements = this.loadPrintDesignerTemplate();
      this.printDesignerSelectedId = null;
      this.bindPrintDesigner(overlay);
      this.renderPrintDesigner(overlay);
    },

    bindPrintDesigner: function (overlay) {
      let innerDrag = null;
      overlay.addEventListener('pointerdown', event => {
        const image = event.target.closest('[data-ppd-inner-image]');
        if (!image || event.button !== 0) return;
        const article = image.closest('[data-ppd-element]');
        if (!article) return;
        innerDrag = { imageId: image.dataset.ppdInnerImage, elementId: article.dataset.ppdElement, startX: event.clientX, startY: event.clientY, x: 0, y: 0, moved: false };
        this.printDesignerSelectedInner = { elementId: innerDrag.elementId, imageId: innerDrag.imageId };
        this.printDesignerSelectedId = null;
        overlay.querySelectorAll('[data-ppd-inner-image].is-inner-selected').forEach(node => node.classList.remove('is-inner-selected'));
        image.classList.add('is-inner-selected');
        const properties = overlay.querySelector('[data-ppd-properties]');
        const parentForControls = this.printDesignerElements.find(x => x.id === innerDrag.elementId);
        const selectedLayout = parentForControls && parentForControls.innerLayout && parentForControls.innerLayout[innerDrag.imageId] || {};
        if (properties) properties.innerHTML = '<h4>تنظیم تصویر داخل فرم</h4><label>عرض تصویر (پیکسل)<input type="range" min="40" max="700" step="5" value="' + Number(selectedLayout.width || 280) + '" data-ppd-inner-style="width"></label><label>جابه‌جایی افقی<input type="range" min="-300" max="300" value="' + Number(selectedLayout.x || 0) + '" data-ppd-inner-style="x"></label><label>جابه‌جایی عمودی<input type="range" min="-300" max="300" value="' + Number(selectedLayout.y || 0) + '" data-ppd-inner-style="y"></label><p class="ppd-help">نسبت تصویر حفظ می‌شود؛ تغییرات فقط روی قالب چاپ اثر دارد.</p>';
        const parent = this.printDesignerElements.find(x => x.id === innerDrag.elementId);
        const layout = parent && parent.innerLayout && parent.innerLayout[innerDrag.imageId] || {};
        innerDrag.x = Number(layout.x || 0); innerDrag.y = Number(layout.y || 0);
        image.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      overlay.addEventListener('pointermove', event => {
        if (!innerDrag) return;
        const dx = event.clientX - innerDrag.startX, dy = event.clientY - innerDrag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 2) innerDrag.moved = true;
        const x = Math.max(-300, Math.min(300, innerDrag.x + dx));
        const y = Math.max(-300, Math.min(300, innerDrag.y + dy));
        const image = overlay.querySelector('[data-ppd-element="' + this.escape(innerDrag.elementId) + '"] [data-ppd-inner-image="' + this.escape(innerDrag.imageId) + '"]');
        if (image) image.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        const parent = this.printDesignerElements.find(item => item.id === innerDrag.elementId);
        if (parent) { parent.innerLayout = parent.innerLayout || {}; parent.innerLayout[innerDrag.imageId] = Object.assign({}, parent.innerLayout[innerDrag.imageId] || {}, {x:x,y:y}); }
      });
      overlay.addEventListener('pointerup', () => { innerDrag = null; });
      overlay.addEventListener('pointercancel', () => { innerDrag = null; });
      overlay.addEventListener('click', (event) => {
        const add = event.target.closest('[data-ppd-add]');
        const form = event.target.closest('[data-ppd-form]');
        const fieldButton = event.target.closest('[data-ppd-field]');
        const close = event.target.closest('[data-ppd-close]');
        const save = event.target.closest('[data-ppd-save]');
        const print = event.target.closest('[data-ppd-print]');
        const innerImage = event.target.closest('[data-ppd-inner-image]');
        const element = event.target.closest('[data-ppd-element]');
        const remove = event.target.closest('[data-ppd-remove]');
        const move = event.target.closest('[data-ppd-move]');
        if (close) { overlay.remove(); document.body.classList.remove('ppd-printing'); return; }
        if (innerImage) { event.preventDefault(); event.stopPropagation(); return; }
        const innerTable = event.target.closest('[data-ppd-inner-table]');
        if (innerTable) {
          const article = innerTable.closest('[data-ppd-element]');
          const column = event.target.closest('[data-ppd-inner-column]');
          if (article) {
            this.printDesignerSelectedTable = {
              elementId: article.dataset.ppdElement,
              tableId: innerTable.dataset.ppdInnerTable,
              columnCode: column ? column.dataset.ppdInnerColumn : null
            };
            this.printDesignerSelectedInner = null;
            this.printDesignerSelectedId = null;
            this.renderPrintDesigner(overlay);
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (save) { this.savePrintDesignerTemplate(); save.textContent = 'ذخیره شد'; return; }
        if (print) { window.print(); return; }
        if (move) {
          const index = this.printDesignerElements.findIndex(item => item.id === this.printDesignerSelectedId);
          const next = move.dataset.ppdMove === 'up' ? index - 1 : index + 1;
          if (index >= 0 && next >= 0 && next < this.printDesignerElements.length) {
            const swap = this.printDesignerElements[index];
            this.printDesignerElements[index] = this.printDesignerElements[next];
            this.printDesignerElements[next] = swap;
            this.renderPrintDesigner(overlay);
          }
          return;
        }
        if (remove) {
          this.printDesignerElements = this.printDesignerElements.filter(item => item.id !== remove.dataset.ppdRemove);
          this.printDesignerSelectedId = null; this.renderPrintDesigner(overlay); return;
        }
        if (add) {
          const type = add.dataset.ppdAdd;
          let text = '';
          if (type === 'text') { text = window.prompt('متن موردنظر را وارد کن:') || ''; if (!text.trim()) return; }
          this.printDesignerElements.push({id:'ppd-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),type:type,text:text,style:{border:'1px solid #d1d5db',padding:12,background:'#ffffff',fontSize:13,align:'right'}});
          this.printDesignerSelectedInner = null;
          this.printDesignerSelectedId = this.printDesignerElements[this.printDesignerElements.length-1].id;
          this.renderPrintDesigner(overlay); return;
        }
        if (fieldButton) {
          const index = Number(fieldButton.dataset.ppdField);
          const fieldKey = fieldButton.dataset.ppdFieldKey;
          const item = this.projectForms[index];
          const field = item && (item.definition.Fields || []).find((entry, i) => String(entry.ID || entry.InformationTypeID || i) === fieldKey);
          if (!item || !field) return;
          this.printDesignerElements.push({id:'ppd-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),type:'form-field',sourceIndex:index,fieldKey:fieldKey,title:(field.InformationType && field.InformationType.Name) || 'فیلد',style:{border:'1px solid #d1d5db',padding:10,background:'#ffffff',fontSize:12,align:'right'}});
          this.printDesignerSelectedId = this.printDesignerElements[this.printDesignerElements.length-1].id;
          this.renderPrintDesigner(overlay); return;
        }
        if (form) {
          const index = Number(form.dataset.ppdForm);
          const item = this.projectForms[index];
          if (!item) return;
          this.printDesignerElements.push({id:'ppd-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),type:'form',sourceIndex:index,title:(item.definition && (item.definition.Name || item.definition.Title)) || 'فرم ثبت‌شده',style:{border:'1px solid #d1d5db',padding:12,background:'#ffffff',fontSize:12,align:'right'}});
          this.printDesignerSelectedId = this.printDesignerElements[this.printDesignerElements.length-1].id;
          this.renderPrintDesigner(overlay); return;
        }
        if (element) { this.printDesignerSelectedInner = null; this.printDesignerSelectedId = element.dataset.ppdElement; this.renderPrintDesigner(overlay); }
      });
      overlay.addEventListener('input', (event) => {
        const tableKey = event.target.dataset.ppdTableStyle;
        const columnKey = event.target.dataset.ppdColumnWidth;
        if (tableKey || columnKey) {
          const selection = this.printDesignerSelectedTable;
          const parent = (this.printDesignerElements || []).find(item => item.id === (selection && selection.elementId));
          if (!parent || !selection) return;
          parent.tableLayout = parent.tableLayout || {};
          const layout = parent.tableLayout[selection.tableId] || (parent.tableLayout[selection.tableId] = {});
          const tableNode = overlay.querySelector('[data-ppd-element="' + this.escape(parent.id) + '"] [data-ppd-inner-table="' + this.escape(selection.tableId) + '"]');
          if (!tableNode) return;
          if (tableKey === 'width') {
            layout.width = Math.max(25, Math.min(100, Number(event.target.value) || 100));
            tableNode.style.width = layout.width + '%';
          }
          if (columnKey) {
            const cols = Array.from(tableNode.querySelectorAll('col[data-ppd-col-code]'));
            const target = cols.find(col => col.dataset.ppdColCode === columnKey);
            if (!target) return;
            const current = cols.map(col => Number(col.dataset.width) || 100 / cols.length);
            const targetIndex = cols.indexOf(target);
            const minimum = 5;
            const desired = Math.max(minimum, Math.min(100 - minimum * (cols.length - 1), Number(event.target.value) || minimum));
            const remaining = current.reduce((sum, value, index) => sum + (index === targetIndex ? 0 : value), 0);
            const next = current.map((value, index) => index === targetIndex ? desired :
              (remaining > 0 ? (value / remaining) * (100 - desired) : (100 - desired) / Math.max(1, cols.length - 1)));
            layout.columns = layout.columns || {};
            cols.forEach((col, index) => {
              layout.columns[col.dataset.ppdColCode] = next[index];
              col.dataset.width = String(next[index]);
              col.style.width = next[index] + '%';
            });
          }
          return;
        }
        const innerKey = event.target.dataset.ppdInnerStyle;
        if (innerKey) {
          const selection = this.printDesignerSelectedInner;
          const parent = (this.printDesignerElements || []).find(x => x.id === (selection && selection.elementId));
          if (!parent || !selection) return;
          parent.innerLayout = parent.innerLayout || {};
          const layout = parent.innerLayout[selection.imageId] || (parent.innerLayout[selection.imageId] = {});
          layout[innerKey] = Number(event.target.value);
          const image = overlay.querySelector('[data-ppd-element="' + this.escape(parent.id) + '"] [data-ppd-inner-image="' + this.escape(selection.imageId) + '"]');
          if (image) {
            if (innerKey === 'width') { image.style.width = layout.width + 'px'; image.style.maxWidth = '100%'; }
            if (innerKey === 'x' || innerKey === 'y') image.style.transform = 'translate(' + Number(layout.x || 0) + 'px,' + Number(layout.y || 0) + 'px)';
          }
          return;
        }
        const key = event.target.dataset.ppdStyle;
        if (!key) return;
        const item = this.printDesignerElements.find(x => x.id === this.printDesignerSelectedId);
        const node = overlay.querySelector('[data-ppd-element="' + this.escape(item && item.id) + '"]');
        if (!item || !node) return;
        item.style[key] = key === 'padding' || key === 'fontSize' ? Number(event.target.value) : event.target.value;
        if (key === 'padding') node.style.padding = item.style[key] + 'px';
        if (key === 'fontSize') node.style.fontSize = item.style[key] + 'px';
        if (key === 'background') node.style.background = item.style[key];
      });
      overlay.addEventListener('change', (event) => {
        const key = event.target.dataset.ppdStyle;
        if (!key) return;
        const item = this.printDesignerElements.find(x => x.id === this.printDesignerSelectedId);
        if (!item) return;
        item.style[key] = key === 'padding' || key === 'fontSize' ? Number(event.target.value) : event.target.value;
        this.renderPrintDesigner(overlay);
      });
      overlay.addEventListener('dragstart', event => {
        const innerImage = event.target.closest('[data-ppd-inner-image]');
        if (innerImage) { event.preventDefault(); return; }
        const el = event.target.closest('[data-ppd-element]');
        if (!el) return;
        event.dataTransfer.setData('text/plain', el.dataset.ppdElement);
        event.dataTransfer.effectAllowed = 'move';
      });
      overlay.addEventListener('dragover', event => { if (event.target.closest('[data-ppd-element]') || event.target.closest('[data-ppd-paper]')) event.preventDefault(); });
      overlay.addEventListener('drop', event => {
        const target = event.target.closest('[data-ppd-element]');
        const sourceId = event.dataTransfer.getData('text/plain');
        if (!sourceId) return;
        event.preventDefault();
        const from = this.printDesignerElements.findIndex(x => x.id === sourceId);
        const to = target ? this.printDesignerElements.findIndex(x => x.id === target.dataset.ppdElement) : this.printDesignerElements.length - 1;
        if (from < 0 || to < 0 || from === to) return;
        const moved = this.printDesignerElements.splice(from,1)[0];
        this.printDesignerElements.splice(to,0,moved);
        this.printDesignerSelectedId = sourceId;
        this.renderPrintDesigner(overlay);
      });
    },

    loadPrintDesignerTemplate: function () {
      try {
        const raw = window.localStorage.getItem('pms-print-template-' + String(this.projectId));
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && parsed.version === 1 && Array.isArray(parsed.elements) ? parsed.elements : [];
      } catch (error) { return []; }
    },

    savePrintDesignerTemplate: function () {
      const key = 'pms-print-template-' + String(this.projectId);
      const payload = {version:1,orientation:'portrait',elements:this.printDesignerElements};
      try { window.localStorage.setItem(key, JSON.stringify(payload)); } catch (error) { console.warn('ذخیره قالب چاپ ممکن نشد:', error); }
    },

    renderPrintDesigner: function (overlay) {
      const paper = overlay.querySelector('[data-ppd-paper]');
      const properties = overlay.querySelector('[data-ppd-properties]');
      const elements = this.printDesignerElements || [];
      paper.innerHTML = elements.length ? elements.map(item => {
        const style = item.style || {};
        this.printDesignerImageIndex = 0;
        this.printDesignerCurrentItem = item;
        const content = this.renderPrintDesignerElement(item);
        this.printDesignerCurrentItem = null;
        return '<article draggable="true" data-ppd-element="' + this.escape(item.id) + '" class="ppd-element ' + (item.id === this.printDesignerSelectedId ? 'is-selected' : '') + '" style="border:' + this.escape(style.border || '0') + ';padding:' + Number(style.padding || 0) + 'px;background:' + this.escape(style.background || '#fff') + ';font-size:' + Number(style.fontSize || 13) + 'px;text-align:' + this.escape(style.align || 'right') + '">' + content + (item.id === this.printDesignerSelectedId ? '<button type="button" class="ppd-element-remove" data-ppd-remove="' + this.escape(item.id) + '" aria-label="حذف">×</button>' : '') + '</article>';
      }).join('') : '<div class="ppd-paper-empty">از پنل «افزودن محتوا» موارد موردنیاز را به این صفحه اضافه کن.</div>';
      this.loadPrintDesignerImages(paper);
      const tableSelection = this.printDesignerSelectedTable;
      if (tableSelection) {
        const parent = elements.find(item => item.id === tableSelection.elementId);
        const table = parent && parent.tableLayout && parent.tableLayout[tableSelection.tableId] || {};
        const tableNode = paper.querySelector('[data-ppd-element="' + this.escape(tableSelection.elementId) + '"] [data-ppd-inner-table="' + this.escape(tableSelection.tableId) + '"]');
        const columns = tableNode ? Array.from(tableNode.querySelectorAll('thead th[data-ppd-inner-column]')) : [];
        if (parent && columns.length) {
          const saved = table.columns || {};
          properties.innerHTML = '<h4>تنظیم جدول فرم</h4><label>عرض کل جدول (%)<input type="range" min="25" max="100" step="1" value="' + Math.max(25, Math.min(100, Number(table.width) || 100)) + '" data-ppd-table-style="width"></label>' +
            '<p class="ppd-help">عرض جدول از عرض قابل چاپ صفحه بیشتر نمی‌شود.</p>' +
            columns.map((column) => {
              const code = column.dataset.ppdInnerColumn;
              const value = Number(saved[code]) > 0 ? Number(saved[code]) : 100 / columns.length;
              const max = 100 - 5 * (columns.length - 1);
              return '<label>عرض ستون «' + this.escape(column.textContent || code) + '» (%)<input type="range" min="5" max="' + max + '" step="1" value="' + Math.round(value) + '" data-ppd-column-width="' + this.escape(code) + '"></label>';
            }).join('');
          return;
        }
      }
      const innerSelection = this.printDesignerSelectedInner;
      if (innerSelection) {
        const parent = elements.find(x => x.id === innerSelection.elementId);
        const layout = parent && parent.innerLayout && parent.innerLayout[innerSelection.imageId] || {};
        properties.innerHTML = '<h4>تنظیم تصویر داخل فرم</h4><label>عرض تصویر (پیکسل)<input type="range" min="40" max="700" step="5" value="' + Number(layout.width || 280) + '" data-ppd-inner-style="width"></label><label>جابه‌جایی افقی<input type="range" min="-300" max="300" value="' + Number(layout.x || 0) + '" data-ppd-inner-style="x"></label><label>جابه‌جایی عمودی<input type="range" min="-300" max="300" value="' + Number(layout.y || 0) + '" data-ppd-inner-style="y"></label><p class="ppd-help">نسبت تصویر حفظ می‌شود؛ تغییرات فقط روی قالب چاپ اثر دارد.</p>';
        return;
      }
      const selected = elements.find(x => x.id === this.printDesignerSelectedId);
      if (!selected) { properties.innerHTML = '<div class="ppd-properties-empty">برای تنظیم ظاهر، یک المان یا تصویر داخل فرم را انتخاب کن.</div>'; return; }
      const s = selected.style || {};
      properties.innerHTML = '<div class="ppd-order-controls"><button type="button" data-ppd-move="up">انتقال به بالا</button><button type="button" data-ppd-move="down">انتقال به پایین</button></div><label>حاشیه<select data-ppd-style="border"><option value="0" ' + (!s.border || s.border === '0' ? 'selected' : '') + '>بدون کادر</option><option value="1px solid #d1d5db" ' + (s.border === '1px solid #d1d5db' ? 'selected' : '') + '>نازک</option><option value="2px solid #374151" ' + (s.border === '2px solid #374151' ? 'selected' : '') + '>ضخیم</option><option value="1px dashed #9ca3af" ' + (s.border === '1px dashed #9ca3af' ? 'selected' : '') + '>خط‌چین</option></select></label><label>پس‌زمینه<input type="color" data-ppd-style="background" value="' + this.escape(s.background || '#ffffff') + '"></label><label>فاصله داخلی <input type="range" min="0" max="32" value="' + Number(s.padding || 0) + '" data-ppd-style="padding"></label><label>اندازه نوشته <input type="range" min="9" max="24" value="' + Number(s.fontSize || 13) + '" data-ppd-style="fontSize"></label><label>تراز<select data-ppd-style="align"><option value="right" ' + (s.align === 'right' ? 'selected' : '') + '>راست</option><option value="center" ' + (s.align === 'center' ? 'selected' : '') + '>وسط</option><option value="left" ' + (s.align === 'left' ? 'selected' : '') + '>چپ</option></select></label>';
    },

    renderPrintDesignerValue: function (value, dataType) {
      if (value === null || value === undefined || value === '') return '-';
      const type = String(dataType || '').toLowerCase();
      const innerId = String(this.printDesignerImageIndex = (this.printDesignerImageIndex || 0) + 1);
      const id = value && typeof value === 'object' && (value.AttachmentID || value.attachmentId || value.ID || value.Id || value.id);
      const mime = String(value && typeof value === 'object' ? (value.MimeType || value.mimeType || '') : '').toLowerCase();
      if ((type === 'image' || type.indexOf('image/') === 0 || mime.indexOf('image/') === 0) && id) {
        const name = value.FileName || value.fileName || value.Name || 'تصویر فرم';
        const cached = this.projectFormImageUrls && this.projectFormImageUrls[String(id)];
        const layout = this.printDesignerCurrentItem && this.printDesignerCurrentItem.innerLayout && this.printDesignerCurrentItem.innerLayout[innerId] || {};
        const style = 'width:' + (Number(layout.width) > 0 ? Number(layout.width) + 'px' : 'auto') + ';max-width:100%;transform:translate(' + Number(layout.x || 0) + 'px,' + Number(layout.y || 0) + 'px)';
        if (cached) return '<img draggable="false" class="ppd-inline-image" data-ppd-inner-image="' + innerId + '" style="' + style + '" src="' + this.escape(cached) + '" alt="' + this.escape(name) + '">';
        return '<span data-ppd-image="' + this.escape(id) + '" data-ppd-inner-image="' + innerId + '" data-ppd-image-name="' + this.escape(name) + '" style="' + style + '">در حال بارگذاری تصویر…</span>';
      }
      if (Array.isArray(value)) return value.map(entry => '<div>' + this.renderPrintDesignerValue(entry, dataType) + '</div>').join('');
      if (typeof value === 'object') return this.escape(value.FileName || value.Name || value.Value || JSON.stringify(value));
      return this.escape(this.informationValue(value));
    },

    loadPrintDesignerImages: async function (paper) {
      if (!paper) return;
      const nodes = Array.from(paper.querySelectorAll('[data-ppd-image]'));
      await Promise.all(nodes.map(async node => {
        const id = node.getAttribute('data-ppd-image');
        try {
          const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(id) + '/download', {trackSync:false});
          const data = this.unwrap(response);
          const base64 = data && (data.Base64 || data.base64);
          const mime = String(data && (data.MimeType || data.mimeType) || 'image/jpeg').toLowerCase();
          if (!base64 || mime.indexOf('image/') !== 0) throw new Error('invalid image');
          const image = document.createElement('img');
          image.className = 'ppd-inline-image';
          image.draggable = false;
          image.alt = node.getAttribute('data-ppd-image-name') || 'تصویر فرم';
          image.dataset.ppdInnerImage = node.dataset.ppdInnerImage || '';
          image.style.cssText = node.style.cssText;
          image.src = 'data:' + mime + ';base64,' + base64;
          node.replaceWith(image);
        } catch (error) { node.textContent = 'بارگذاری تصویر ناموفق بود'; }
      }));
    },
    renderPrintDesignerTable: function (tableId, columns, rows) {
      const item = this.printDesignerCurrentItem || {};
      const layouts = item.tableLayout || {};
      const layout = layouts[tableId] || {};
      const width = Math.max(25, Math.min(100, Number(layout.width) || 100));
      const savedWidths = layout.columns || {};
      const count = Math.max(1, columns.length);
      const widths = columns.map((column) => {
        const code = String(column.Code || column.code || '');
        const value = Number(savedWidths[code]);
        return Number.isFinite(value) && value > 0 ? value : 100 / count;
      });
      const total = widths.reduce((sum, value) => sum + value, 0) || 100;
      const normalized = widths.map(value => value * 100 / total);
      const selected = this.printDesignerSelectedTable;
      const isSelected = selected && selected.elementId === item.id && selected.tableId === tableId;
      const colgroup = '<colgroup>' + columns.map((column, index) =>
        '<col data-ppd-col-code="' + this.escape(String(column.Code || column.code || '')) + '" data-width="' + normalized[index] + '" style="width:' + normalized[index] + '%">'
      ).join('') + '</colgroup>';
      const head = '<thead><tr>' + columns.map(column => {
        const code = String(column.Code || column.code || '');
        return '<th data-ppd-inner-column="' + this.escape(code) + '">' + this.escape(column.Name || column.name || code) + '</th>';
      }).join('') + '</tr></thead>';
      const body = '<tbody>' + rows.map(row => '<tr>' + columns.map(column =>
        '<td>' + this.renderProjectFormValue(row && row[String(column.Code || column.code)], column.DataType || column.dataType) + '</td>'
      ).join('') + '</tr>').join('') + '</tbody>';
      return '<table class="ppd-inner-table' + (isSelected ? ' is-inner-table-selected' : '') + '" data-ppd-inner-table="' + this.escape(tableId) + '" data-ppd-columns="' + count + '" style="width:' + width + '%;max-width:100%;table-layout:fixed">' + colgroup + head + body + '</table>';
    },

    renderPrintDesignerElement: function (item) {
      if (item.type === 'line') return '<hr>';
      if (item.type === 'text') return '<div>' + this.escape(item.text) + '</div>';
      if (item.type === 'project') {
        const p = this.project || {};
        return '<h2>' + this.escape(p.Name || p.ProjectName || 'مشخصات پروژه') + '</h2><p>کد پروژه: ' + this.escape(p.Code || p.ProjectCode || this.projectId) + '</p><p>وضعیت: ' + this.escape(p.StatusName || p.Status || '-') + '</p>';
      }
      if (item.type === 'project-fields') {
        const p = this.project || {};
        const rows = Object.keys(p).filter(k => !/^(ID|TenantID|CreatedBy|UpdatedBy|DeletedAt)$/i.test(k) && ['string','number','boolean'].includes(typeof p[k]) && p[k] !== '').slice(0,24);
        return '<h3>مشخصات پروژه</h3><dl>' + rows.map(k => '<div><dt>' + this.escape(k) + '</dt><dd>' + this.escape(this.informationValue(p[k])) + '</dd></div>').join('') + '</dl>';
      }
      const record = this.projectForms[Number(item.sourceIndex)];
      if (!record) return '';
      const definition = record.definition || {};
      const fields = Array.isArray(definition.Fields) ? definition.Fields : [];
      const values = record.values || {};
      if (item.type === 'form-field') {
        const field = fields.find((entry, index) => String(entry.ID || entry.InformationTypeID || index) === String(item.fieldKey));
        if (!field) return '';
        const info = field.InformationType || {};
        const id = String(field.InformationTypeID || info.ID || info.Id || '');
        const value = values[id];
        const cols = Array.isArray(info.Columns) ? info.Columns.filter(col => String(col.Status || 'ACTIVE').toUpperCase() === 'ACTIVE') : [];
        if (cols.length) {
          const rows = String(info.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE' ? (Array.isArray(value) ? value : []) : (value && typeof value === 'object' ? [value] : []);
          return '<h3>' + this.escape(info.Name || info.Title || 'فیلد') + '</h3>' + this.renderPrintDesignerTable('field-' + String(item.fieldKey), cols, rows);
        }
        return '<strong>' + this.escape(info.Name || info.Title || 'فیلد') + '</strong><div>' + this.renderProjectFormValue(value, info.DataType) + '</div>';
      }
      const content = fields.slice().sort((a,b) => Number(a.FieldOrder||0)-Number(b.FieldOrder||0)).map(field => {
        const info = field.InformationType || {};
        const id = String(field.InformationTypeID || info.ID || info.Id || '');
        const value = values[id];
        const columns = Array.isArray(info.Columns) ? info.Columns.filter(col => String(col.Status || 'ACTIVE').toUpperCase() === 'ACTIVE') : [];
        let output = '<span>-</span>';
        if (columns.length) {
          const rows = String(info.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE' ? (Array.isArray(value) ? value : []) : (value && typeof value === 'object' ? [value] : []);
          output = rows.length ? this.renderPrintDesignerTable('field-' + String(field.ID || field.InformationTypeID || info.Code || id), columns, rows) : '<span>-</span>';
        } else if (value !== undefined && value !== null && value !== '') output = this.renderProjectFormValue(value, info.DataType);
        return '<section><strong>' + this.escape(info.Name || info.Title || info.Code || 'فیلد') + '</strong><div>' + output + '</div></section>';
      }).join('');
      return '<h3>' + this.escape(item.title || definition.Name || 'فرم') + '</h3><small>' + this.escape((record.event && (record.event.EventTypeName || record.event.EventTypeTitle)) || 'رویداد') + ' · ' + this.escape(this.formatDate(record.createdAt)) + '</small>' + content;
    },

    renderProjectForms: function () {
      const container = document.getElementById('project-forms-list');
      const count = document.getElementById('project-forms-count');
      if (!container) return;
      const forms = Array.isArray(this.projectForms) ? this.projectForms : [];
      if (count) count.textContent = String(forms.length);
      if (!forms.length) {
        container.innerHTML = '<div class="table-empty">هنوز پاسخی برای فرم‌های این پروژه ثبت نشده است.</div>';
        return;
      }
      container.innerHTML = forms.map((item, index) => {
        const definition = item.definition || {};
        const event = item.event || {};
        const formTitle = definition.Name || definition.Title || definition.Code || 'فرم ثبت‌شده';
        const eventTitle = event.EventTypeName || event.EventTypeTitle || 'رویداد';
        const fields = Array.isArray(definition.Fields) ? definition.Fields : [];
        const values = item.values && typeof item.values === 'object' ? item.values : {};
        const fieldHtml = fields.slice().sort((a, b) => Number(a.FieldOrder || 0) - Number(b.FieldOrder || 0)).map((field) => {
          const info = field.InformationType || {};
          const infoId = String(field.InformationTypeID || info.ID || info.Id || '');
          const value = values[infoId];
          const columns = Array.isArray(info.Columns) ? info.Columns.filter(col => String(col.Status || 'ACTIVE').toUpperCase() === 'ACTIVE') : [];
          const hasValue = value !== undefined && value !== null && value !== '' &&
            !(Array.isArray(value) && value.length === 0);
          let content = '<span class="project-form-empty">ثبت نشده</span>';
          if (hasValue && columns.length) {
            const rows = String(info.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE'
              ? (Array.isArray(value) ? value : [])
              : (value && typeof value === 'object' ? [value] : []);
            content = rows.length
              ? '<div class="table-wrapper"><table class="data-table project-form-table"><thead><tr>' +
                columns.map(col => '<th>' + this.escape(col.Name || col.Code) + '</th>').join('') +
                '</tr></thead><tbody>' + rows.map(row => '<tr>' + columns.map(col => {
                  const cell = row && row[String(col.Code)];
                  return '<td>' + this.renderProjectFormValue(cell, col.DataType) + '</td>';
                }).join('') + '</tr>').join('') + '</tbody></table></div>'
              : '<span class="project-form-empty">ردیفی ثبت نشده است.</span>';
          } else if (hasValue) {
            content = this.renderProjectFormValue(value, info.DataType);
          }
          return '<section class="project-form-field"><h4>' + this.escape(info.Name || info.Title || info.Code || 'فیلد') +
            '</h4><div class="project-form-field-value">' + content + '</div></section>';
        }).join('');
        return '<article class="project-form-card" data-project-form-index="' + index + '">' +
          '<header class="project-form-card-header"><div><h4>' + this.escape(formTitle) + '</h4>' +
          '<p>' + this.escape(eventTitle) + ' · ' + this.escape(this.formatDate(item.createdAt)) + '</p></div>' +
          '<span class="project-form-event-ref">رویداد ' + this.escape(item.eventId) + '</span></header>' +
          '<div class="project-form-card-body">' + fieldHtml + '</div></article>';
      }).join('');
      container.querySelectorAll('[data-project-form-attachment]').forEach((button) => {
        button.addEventListener('click', () => {
          this.openInformationAttachment(button.dataset.projectFormAttachment,
            button.dataset.projectFormPreview === 'true');
        });
      });
    },

    prepareProjectFormImages: async function (forms) {
      if (!this.projectFormImageUrls) this.projectFormImageUrls = {};
      if (!this.canViewInformationFiles()) return;
      const ids = new Set();
      (Array.isArray(forms) ? forms : []).forEach(record => {
        const fields = Array.isArray(record.definition && record.definition.Fields) ? record.definition.Fields : [];
        fields.forEach(field => {
          const info = field.InformationType || {};
          const infoId = String(field.InformationTypeID || info.ID || info.Id || '');
          const value = (record.values || {})[infoId];
          const values = Array.isArray(value) ? value : [value];
          values.forEach(entry => {
            if (String(info.DataType || '').toLowerCase() === 'image' && entry && typeof entry === 'object') {
              const id = entry.AttachmentID || entry.ID;
              if (id && !this.projectFormImageUrls[String(id)]) ids.add(String(id));
            }
            if (Array.isArray(info.Columns) && entry && typeof entry === 'object') info.Columns.forEach(col => {
              if (String(col.DataType || '').toLowerCase() !== 'image') return;
              const cell = entry[String(col.Code)];
              const id = cell && typeof cell === 'object' && (cell.AttachmentID || cell.ID);
              if (id && !this.projectFormImageUrls[String(id)]) ids.add(String(id));
            });
          });
        });
      });
      await Promise.all(Array.from(ids).map(async id => {
        try {
          const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(id) + '/download', {trackSync:false});
          const data = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : (response && response.data) || response;
          if (data && data.Base64 && String(data.MimeType || '').toLowerCase().indexOf('image/') === 0) {
            this.projectFormImageUrls[id] = 'data:' + data.MimeType + ';base64,' + data.Base64;
          }
        } catch (error) { console.warn('دریافت تصویر فرم ناموفق بود:', id, error); }
      }));
    },

    renderProjectFormValue: function (value, dataType) {
      if (value === null || value === undefined || value === '') return '<span>-</span>';
      const type = String(dataType || '').toLowerCase();
      if (type === 'image') {
        const attachmentId = value && typeof value === 'object' ? (value.AttachmentID || value.ID) : '';
        const url = attachmentId && this.projectFormImageUrls ? this.projectFormImageUrls[String(attachmentId)] :
          (typeof value === 'string' && /^https?:\/\//i.test(value) ? value : (value && (value.Url || value.URL || value.DownloadUrl)));
        if (url && /^(https?:\/\/|data:image\/)/i.test(String(url))) {
          return '<img class="project-form-inline-image" src="' + this.escape(url) + '" alt="' + this.escape((value && value.FileName) || 'تصویر فرم') + '" loading="lazy">';
        }
      }
      if ((type === 'file' || type === 'image') && typeof value === 'object') {
        const fileName = value.FileName || value.Name || 'پیوست ثبت‌شده';
        const canView = this.canViewInformationFiles();
        const attachmentId = value.AttachmentID || value.ID || '';
        return '<span class="project-form-attachment">' + this.escape(fileName) +
          (canView && attachmentId
            ? ' <button type="button" class="btn btn-sm btn-light" data-project-form-attachment="' + this.escape(attachmentId) +
              '" data-project-form-preview="' + (type === 'image' ? 'true' : 'false') + '">' +
              (type === 'image' ? 'پیش‌نمایش' : 'دریافت') + '</button>'
            : '') + '</span>';
      }
      if (typeof value === 'boolean' || String(type) === 'boolean') {
        return '<span>' + (value === true || String(value).toLowerCase() === 'true' ? 'بله' : 'خیر') + '</span>';
      }
      if (Array.isArray(value)) {
        return '<ul class="project-form-value-list">' + value.map(item => '<li>' +
          this.escape(typeof item === 'object' ? JSON.stringify(item) : item) + '</li>').join('') + '</ul>';
      }
      if (typeof value === 'object') {
        const label = value.Name || value.Title || value.Value || value.FileName;
        return '<span>' + this.escape(label !== undefined ? label : JSON.stringify(value)) + '</span>';
      }
      return '<span>' + this.escape(value) + '</span>';
    },

    loadProjectInformation: async function (forceRefresh) {
      const container = document.getElementById('project-information-list');
      const loading = document.getElementById('project-information-loading');
      const error = document.getElementById('project-information-error');
      const retry = document.getElementById('project-information-retry');
      if (!container || !this.projectId) return;
      if (loading) loading.hidden = false;
      if (error) error.hidden = true;
      if (retry) retry.hidden = true;
      try {
        const key = 'project_information_' + String(this.projectId);
        const response = forceRefresh
          ? await window.PMS.Api.getFresh('/projects/' + encodeURIComponent(this.projectId) + '/information', key)
          : await window.PMS.Api.getCached('/projects/' + encodeURIComponent(this.projectId) + '/information', key);
        const payload = response && response.data !== undefined ? response.data : response;
        this.projectInformation = this.normalizeArray(payload, ['items', 'Items']);
        this.renderProjectInformation();
      } catch (err) {
        if (error) {
          error.textContent = err && err.message ? err.message : 'دریافت اطلاعات پرونده ناموفق بود.';
          error.hidden = false;
        }
        if (retry) retry.hidden = false;
      } finally {
        if (loading) loading.hidden = true;
      }
    },

    renderProjectInformation: function () {
      const container = document.getElementById('project-information-list');
      if (!container) return;
      const canEdit = this.canEditProjectInformation();
      const rows = this.projectInformation || [];
      if (!rows.length) {
        container.innerHTML = '<div class="table-empty">هنوز نوع اطلاعات فعالی برای این پرونده تعریف نشده است.</div>';
        return;
      }
      container.innerHTML = rows.map((record) => {
        const type = record.InformationType || {};
        const name = type.Name || type.Code || 'اطلاعات';
        const multi = String(type.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE';
        const columns = Array.isArray(record.Columns) ? record.Columns.filter(col => String(col.Status || 'ACTIVE') === 'ACTIVE') : [];
        const hasColumns = columns.length > 0;
        const value = record.Value !== undefined ? record.Value : this.parseAuditData(record.ValueJSON);
        const isMeaningful = item => {
          if (item === null || item === undefined || item === '') return false;
          if (Array.isArray(item)) return item.some(isMeaningful);
          if (item && typeof item === 'object') return Object.keys(item).some(key => isMeaningful(item[key]));
          return true;
        };
        const hasValue = record.Status !== 'EMPTY' && isMeaningful(value);
        let content = '<div class="project-information-empty">هنوز مقداری ثبت نشده است.</div>';
        if (hasValue && hasColumns) {
          const dataRows = multi ? (Array.isArray(value) ? value : []) : (value && typeof value === 'object' ? [value] : []);
          content = dataRows.length
            ? '<div class="table-wrapper"><table class="data-table"><thead><tr>' + columns.map(col => '<th>' + this.escape(col.Name) + '</th>').join('') + '</tr></thead><tbody>' +
              dataRows.map(row => '<tr>' + columns.map(col => '<td>' + this.renderInformationValue(row[String(col.Code)], col.DataType) + '</td>').join('') + '</tr>').join('') +
              '</tbody></table></div>'
            : '<div class="project-information-empty">جدولی ثبت نشده است.</div>';
        } else if (hasValue) {
          content = '<div class="project-information-value">' + this.renderInformationValue(value, type.DataType) + '</div>';
        }
        return '<article class="project-information-item">' +
          '<div class="project-information-item-head"><div><strong>' + this.escape(name) + '</strong><small>' +
          (multi ? 'جدولی' : 'تک‌مقداری') + (record.Revision ? ' · نسخه ' + this.escape(record.Revision) : '') +
          '</small></div><div class="project-information-actions">' +
          (canEdit ? '<button type="button" class="btn btn-sm btn-light" data-project-info-edit="' + this.escape(type.ID || record.InformationTypeID) + '">' + (hasValue ? 'ویرایش' : 'ثبت اطلاعات') + '</button>' : '') +
          '<button type="button" class="btn btn-sm btn-light" data-project-info-history="' + this.escape(type.ID || record.InformationTypeID) + '">تاریخچه</button>' +
          (canEdit && hasValue ? '<button type="button" class="btn btn-sm btn-danger" data-project-info-delete="' + this.escape(type.ID || record.InformationTypeID) + '">حذف</button>' : '') +
          '</div></div><div class="project-information-item-content">' + content + '</div></article>';
      }).join('');
      container.querySelectorAll('[data-project-info-edit]').forEach(btn => btn.addEventListener('click', () => {
        const record = this.projectInformation.find(item => String(item.InformationTypeID) === String(btn.dataset.projectInfoEdit));
        if (record) this.openProjectInformationForm(record);
      }));
      container.querySelectorAll('[data-project-info-history]').forEach(btn => btn.addEventListener('click', () => {
        const record = this.projectInformation.find(item => String(item.InformationTypeID) === String(btn.dataset.projectInfoHistory));
        if (record) this.openProjectInformationHistory(record);
      }));
      container.querySelectorAll('[data-project-info-delete]').forEach(btn => btn.addEventListener('click', async () => {
        const record = this.projectInformation.find(item => String(item.InformationTypeID) === String(btn.dataset.projectInfoDelete));
        if (!record || !confirm('اطلاعات «' + ((record.InformationType || {}).Name || 'این بخش') + '» از اطلاعات جاری حذف شود؟ تاریخچه حفظ خواهد شد.')) return;
        try {
          await window.PMS.Api.delete('/projects/' + encodeURIComponent(this.projectId) + '/information/' + encodeURIComponent(record.InformationTypeID));
          await this.loadProjectInformation(true);
        } catch (err) {
          alert(err.message || 'حذف اطلاعات انجام نشد.');
        }
      }));
      container.querySelectorAll('[data-information-attachment]').forEach(btn => btn.addEventListener('click', () => {
        this.openInformationAttachment(btn.dataset.informationAttachment, btn.dataset.informationPreview === 'true');
      }));
      this.ensureProjectInformationStyles();
    },

    renderInformationValue: function (value, dataType) {
      const type = String(dataType || '').toLowerCase();
      if ((type === 'image' || type === 'file') && value && typeof value === 'object') {
        const id = value.AttachmentID || value.ID;
        if (!id) return '<span>-</span>';
        if (!this.canViewInformationFiles()) return '<span>' + this.escape(value.FileName || 'فایل ثبت‌شده') + '</span>';
        return '<span class="information-file-value">' + this.escape(value.FileName || 'فایل ثبت‌شده') +
          ' <button type="button" class="btn btn-sm btn-light" data-information-attachment="' + this.escape(id) +
          '" data-information-preview="' + (type === 'image' ? 'true' : 'false') + '">' +
          (type === 'image' ? 'پیش‌نمایش' : 'دریافت') + '</button></span>';
      }
      return this.renderPrintDesignerValue(value, info.DataType || info.Type || field.DataType);
    },

    openInformationAttachment: async function (attachmentId, preview) {
      if (!this.canViewInformationFiles()) return;
      try {
        const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download', { trackSync: false });
        const data = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : (response && response.data) || response;
        if (!data || !data.Base64) throw new Error('محتوای فایل دریافت نشد.');
        const binary = window.atob(data.Base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: data.MimeType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        if (preview && String(data.MimeType || '').toLowerCase().indexOf('image/') === 0) {
          const box = this.openProjectInformationModal(data.FileName || 'پیش‌نمایش تصویر',
            '<div class="information-image-preview"><img alt="' + this.escape(data.FileName || 'تصویر') + '" src="' + url + '"></div>');
          const oldClose = box.close;
          box.close = function () { URL.revokeObjectURL(url); oldClose(); };
        } else {
          const link = document.createElement('a');
          link.href = url;
          link.download = data.FileName || 'download';
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 30000);
        }
      } catch (error) {
        alert(error.message || 'دریافت فایل ناموفق بود.');
      }
    },

    uploadInformationFile: async function (file, dataType) {
      if (!file) return '';
      if (!this.canUploadInformationFiles()) throw new Error('مجوز بارگذاری پیوست را ندارید.');
      const maxBytes = 10 * 1024 * 1024;
      const extension = String(file.name || '').split('.').pop().toLowerCase();
      const mimeByExtension = {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
      const mime = String(file.type || mimeByExtension[extension] || '').toLowerCase();
      const allowed = Object.keys(mimeByExtension).indexOf(extension) !== -1 && mimeByExtension[extension] === mime;
      if (!allowed || file.size < 1 || file.size > maxBytes || (dataType === 'image' && mime.indexOf('image/') !== 0)) {
        throw new Error(dataType === 'image' ? 'فقط تصویر JPEG، PNG، WebP یا GIF تا ۱۰ مگابایت مجاز است.' : 'فقط تصویر، PDF، Word یا Excel تا ۱۰ مگابایت مجاز است.');
      }
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
        reader.readAsDataURL(file);
      });
      const response = await window.PMS.Api.post('/projects/' + encodeURIComponent(this.projectId) + '/attachments', {
        FileName: file.name, MimeType: mime, Base64: dataUrl.split(',')[1] || '', AttachmentType: 'INFORMATION'
      }, { trackSync: false });
      const result = window.PMS.Api.extractData ? window.PMS.Api.extractData(response) : (response && response.data) || response;
      const attachment = result && (result.attachment || result.Attachment);
      if (!attachment || !(attachment.ID || attachment.Id)) throw new Error('اطلاعات فایل بارگذاری‌شده دریافت نشد.');
      return {AttachmentID: attachment.ID || attachment.Id, FileName: attachment.FileName || file.name,
        MimeType: attachment.MimeType || mime, FileSize: Number(attachment.FileSize || file.size), AttachmentType: 'INFORMATION'};
    },

    informationValue: function (value) {
      if (value === null || value === undefined || value === '') return '-';
      if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
      if (typeof value === 'object') {
        try { return JSON.stringify(value); } catch (err) { return String(value); }
      }
      return String(value);
    },

    ensureProjectInformationStyles: function () {
      if (document.getElementById('project-information-styles')) return;
      const style = document.createElement('style');
      style.id = 'project-information-styles';
      style.textContent = '.project-form-card{border:1px solid var(--color-border);border-radius:10px;margin:14px 0;overflow:hidden}.project-form-card-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px;background:var(--color-background)}.project-form-card-header h4{margin:0;color:var(--color-text);font-size:14px}.project-form-card-header p{margin:5px 0 0;color:var(--color-text-secondary);font-size:11px}.project-form-event-ref{font-size:11px;color:var(--color-text-secondary);white-space:nowrap}.project-form-card-body{padding:4px 14px}.project-form-field{padding:12px 0;border-bottom:1px solid var(--color-border)}.project-form-field:last-child{border-bottom:0}.project-form-field h4{margin:0 0 8px;font-size:12px;color:var(--color-text-secondary)}.project-form-field-value{font-size:13px;color:var(--color-text);white-space:pre-wrap;overflow-wrap:anywhere}.project-form-empty{color:var(--color-text-secondary);font-size:12px}.project-form-table{min-width:0}.project-form-value-list{margin:0;padding-right:20px}.project-forms-count{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:12px;background:var(--color-background);font-size:11px}.project-information-item{padding:14px 0;border-bottom:1px solid var(--color-border)}.project-information-item:last-child{border-bottom:0}.project-information-item-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.project-information-item-head strong{display:block;color:var(--color-text);font-size:13px}.project-information-item-head small{display:block;color:var(--color-text-secondary);font-size:11px;margin-top:4px}.project-information-actions{display:flex;gap:6px;flex-wrap:wrap}.project-information-item-content{margin-top:10px}.information-file-field input{display:block;width:100%;margin-top:6px}.information-file-current{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:12px}.information-file-preview img{display:block;max-width:180px;max-height:140px;object-fit:contain;margin-top:8px;border-radius:8px}.information-image-preview img{display:block;max-width:100%;max-height:70vh;object-fit:contain;margin:auto}.project-information-value{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--color-text);font-size:13px}.project-information-empty{font-size:12px;color:var(--color-text-secondary)}.project-information-modal .modal{max-width:760px;max-height:90vh;overflow:auto}.project-information-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;padding:12px;margin:10px 0;border:1px solid var(--color-border);border-radius:8px}.project-information-row-actions{display:flex;justify-content:flex-end}.project-information-history-row{padding:12px 0;border-bottom:1px solid var(--color-border);font-size:12px;line-height:1.9}.project-information-history-row strong{color:var(--color-text)}.project-information-history-row pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--color-background);padding:8px;border-radius:6px;direction:ltr;text-align:left}@media(max-width:600px){.project-form-card-header{flex-direction:column}.project-information-item-head{align-items:flex-start;flex-direction:column}.project-information-actions{width:100%}.project-information-actions button{flex:1}}';
      document.head.appendChild(style);
    },

    openProjectInformationModal: function (title, body) {
      const old = document.getElementById('project-information-modal');
      if (old) old.remove();
      const overlay = document.createElement('div');
      overlay.id = 'project-information-modal';
      overlay.className = 'modal-overlay project-information-modal';
      overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h3>' + this.escape(title) + '</h3><button type="button" class="modal-close" aria-label="بستن">×</button></div><div class="modal-body">' + body + '</div></div>';
      document.body.appendChild(overlay);
      const close = function () { overlay.remove(); };
      overlay.querySelector('.modal-close').addEventListener('click', close);
      overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
      return { overlay: overlay, body: overlay.querySelector('.modal-body'), close: close };
    },

    canUploadInformationFiles: function () {
      const router = window.PMS && window.PMS.Router;
      return !!(router && ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_UPLOAD') !== -1)));
    },

    canViewInformationFiles: function () {
      const router = window.PMS && window.PMS.Router;
      return !!(router && ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_VIEW') !== -1)));
    },

    informationInput: function (column, value, fieldName) {
      const type = String(column.DataType || 'text').toLowerCase();
      const label = this.escape(column.Name || fieldName);
      const required = column.IsRequired === true || String(column.IsRequired).toLowerCase() === 'true';
      const raw = value === null || value === undefined ? '' : value;
      if (type === 'image' || type === 'file') {
        const current = raw && typeof raw === 'object' ? raw : null;
        const currentId = current && (current.AttachmentID || current.ID);
        const accept = type === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' :
          '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        return '<div class="form-group information-file-field"><label>' + label + (required ? ' *' : '') +
          '<input type="file" name="' + this.escape(fieldName) + '" data-information-file-input data-file-data-type="' + type +
          '" data-current-attachment="' + this.escape(current ? JSON.stringify(current) : '') + '" accept="' + accept + '"' +
          (required && !currentId ? ' required' : '') + (this.canUploadInformationFiles() ? '' : ' disabled') + '></label>' +
          (currentId ? '<div class="information-file-current"><span>' + this.escape(current.FileName || 'فایل ثبت‌شده') + '</span>' +
            (this.canViewInformationFiles() ? '<button type="button" class="btn btn-sm btn-light" data-information-attachment="' + this.escape(currentId) +
              '" data-information-preview="' + (type === 'image' ? 'true' : 'false') + '">' + (type === 'image' ? 'پیش‌نمایش تصویر' : 'دریافت فایل') + '</button>' : '') +
            '</div>' : '') +
          '<div data-information-file-preview class="information-file-preview"></div>' +
          (!this.canUploadInformationFiles() ? '<small>برای بارگذاری فایل، مجوز پیوست لازم است.</small>' : '') + '</div>';
      }
      if (type === 'boolean') {
        return '<div class="form-group"><label>' + label + '</label><select name="' + this.escape(fieldName) + '"' + (required ? ' required' : '') + '><option value="">انتخاب کنید</option><option value="true"' + (raw === true || String(raw) === 'true' ? ' selected' : '') + '>بله</option><option value="false"' + (raw === false || String(raw) === 'false' ? ' selected' : '') + '>خیر</option></select></div>';
      }
      if (type === 'select') {
        let options = [];
        try { options = JSON.parse(column.OptionsJSON || '[]'); } catch (err) {}
        return '<div class="form-group"><label>' + label + '</label><select name="' + this.escape(fieldName) + '"' + (required ? ' required' : '') + '><option value="">انتخاب کنید</option>' + options.map(option => { const v = typeof option === 'object' ? (option.value !== undefined ? option.value : option.Value) : option; return '<option value="' + this.escape(v) + '"' + (String(v) === String(raw) ? ' selected' : '') + '>' + this.escape(typeof option === 'object' ? (option.label || option.Name || v) : option) + '</option>'; }).join('') + '</select></div>';
      }
      const inputType = type === 'number' ? 'number' : (type === 'date' ? 'date' : (type === 'datetime' ? 'datetime-local' : 'text'));
      if (type === 'textarea') return '<div class="form-group"><label>' + label + '</label><textarea name="' + this.escape(fieldName) + '"' + (required ? ' required' : '') + ' rows="3">' + this.escape(raw) + '</textarea></div>';
      return '<div class="form-group"><label>' + label + '</label><input type="' + inputType + '" name="' + this.escape(fieldName) + '" value="' + this.escape(raw) + '"' + (required ? ' required' : '') + '></div>';
    },

    openProjectInformationForm: function (record) {
      if (!this.canEditProjectInformation()) return;
      const type = record.InformationType || {};
      const multi = String(type.Cardinality || 'SINGLE').toUpperCase() === 'MULTIPLE';
      const columns = Array.isArray(record.Columns) ? record.Columns.filter(col => String(col.Status || 'ACTIVE') === 'ACTIVE') : [];
      const hasColumns = columns.length > 0;
      const current = record.Value !== undefined ? record.Value : this.parseAuditData(record.ValueJSON);
      let body = '<form id="project-information-edit-form">';
      if (!hasColumns) {
        body += this.informationInput({ Name: type.Name, DataType: type.DataType, OptionsJSON: type.OptionsJSON }, current, 'Value');
      } else {
        const rows = multi ? (Array.isArray(current) && current.length ? current : [{}]) : [current && typeof current === 'object' ? current : {}];
        body += '<div id="project-information-rows">' + rows.map((row) => '<div class="project-information-row" data-information-row>' +
          columns.map(col => this.informationInput(col, row[String(col.Code)], 'column_' + col.Code)).join('') +
          (multi ? '<div class="project-information-row-actions"><button type="button" class="btn btn-sm btn-danger" data-remove-information-row>حذف ردیف</button></div>' : '') + '</div>').join('') + '</div>' +
          (multi ? '<button type="button" class="btn btn-light" id="project-information-add-row">+ افزودن ردیف</button>' : '');
      }
      body += '<div class="form-group" style="margin-top:14px"><label>توضیح تغییر (اختیاری)</label><textarea name="Reason" rows="2" placeholder="علت ثبت یا اصلاح اطلاعات"></textarea></div>' +
        '<div class="modal-actions"><button type="submit" class="btn btn-primary">ذخیره اطلاعات</button><button type="button" class="btn btn-light" data-information-cancel>انصراف</button></div></form>';
      const box = this.openProjectInformationModal((type.Name || 'اطلاعات') + (multi ? ' · جدول اطلاعات' : ''), body);
      const form = box.body.querySelector('form');
      const rowsHost = box.body.querySelector('#project-information-rows');
      const rowTemplate = () => '<div class="project-information-row" data-information-row>' +
        columns.map(col => this.informationInput(col, '', 'column_' + col.Code)).join('') +
        '<div class="project-information-row-actions"><button type="button" class="btn btn-sm btn-danger" data-remove-information-row>حذف ردیف</button></div></div>';
      if (multi && hasColumns) {
        box.body.querySelector('#project-information-add-row').addEventListener('click', () => rowsHost.insertAdjacentHTML('beforeend', rowTemplate()));
        rowsHost.addEventListener('click', event => {
          const remove = event.target.closest('[data-remove-information-row]');
          if (remove) {
            const all = rowsHost.querySelectorAll('[data-information-row]');
            if (all.length > 1) remove.closest('[data-information-row]').remove();
            else alert('حداقل یک ردیف در فرم باقی بماند؛ برای خالی‌کردن اطلاعات از حذف منطقی استفاده کنید.');
          }
        });
      }
      form.querySelector('[data-information-cancel]').addEventListener('click', box.close);
      form.querySelectorAll('[data-information-file-input]').forEach(input => input.addEventListener('change', () => {
        const preview = input.parentElement.parentElement.querySelector('[data-information-file-preview]');
        const file = input.files && input.files[0];
        if (!preview) return;
        preview.replaceChildren();
        if (!file) return;
        if (input.dataset.fileDataType === 'image') {
          const reader = new FileReader();
          reader.onload = () => {
            const img = document.createElement('img');
            img.alt = file.name;
            img.src = String(reader.result || '');
            preview.appendChild(img);
          };
          reader.readAsDataURL(file);
        } else {
          preview.textContent = file.name;
        }
      }));
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        let value;
        if (hasColumns) {
          const dataRows = Array.from(rowsHost.querySelectorAll('[data-information-row]')).map(row => {
            const item = {};
            columns.forEach(col => {
              const control = row.querySelector('[name="column_' + CSS.escape(String(col.Code)) + '"]');
              let v = control ? control.value : '';
              const dataType = String(col.DataType || '').toLowerCase();
              if (control && control.type === 'file') {
                const selected = control.files && control.files[0];
                if (selected) {
                  item[String(col.Code)] = this.uploadInformationFile(selected, dataType);
                } else {
                  try { item[String(col.Code)] = JSON.parse(control.dataset.currentAttachment || 'null') || ''; }
                  catch (error) { item[String(col.Code)] = ''; }
                }
              } else {
                if (v !== '' && dataType === 'number') v = Number(v);
                if (v !== '' && dataType === 'boolean') v = v === 'true';
                item[String(col.Code)] = v;
              }
            });
            return item;
          });
          value = multi ? dataRows : (dataRows[0] || {});
        } else {
          const control = form.elements.Value;
          const dataType = String(type.DataType || '').toLowerCase();
          if (control && control.type === 'file') {
            const selected = control.files && control.files[0];
            if (selected) value = this.uploadInformationFile(selected, dataType);
            else {
              try { value = JSON.parse(control.dataset.currentAttachment || 'null') || ''; }
              catch (error) { value = ''; }
            }
          } else {
            value = control ? control.value : '';
            if (value !== '' && dataType === 'number') value = Number(value);
            if (value !== '' && dataType === 'boolean') value = value === 'true';
          }
        }
        try {
          if (value && typeof value.then === 'function') value = await value;
          if (Array.isArray(value)) value = await Promise.all(value.map(async row => { const clean = {}; for (const key of Object.keys(row)) clean[key] = row[key] && typeof row[key].then === 'function' ? await row[key] : row[key]; return clean; }));
          else if (value && typeof value === 'object' && !value.AttachmentID) { const clean = {}; for (const key of Object.keys(value)) clean[key] = value[key] && typeof value[key].then === 'function' ? await value[key] : value[key]; value = clean; }
          await window.PMS.Api.post('/projects/' + encodeURIComponent(this.projectId) + '/information/' + encodeURIComponent(record.InformationTypeID), { Value: value, Reason: form.elements.Reason.value });
          window.PMS.Api.invalidate('project_information_' + String(this.projectId));
          box.close();
          await this.loadProjectInformation(true);
        } catch (err) {
          alert(err.message || 'ذخیره اطلاعات انجام نشد.');
          submit.disabled = false;
        }
      });
    },

    openProjectInformationHistory: async function (record) {
      const type = record.InformationType || {};
      const box = this.openProjectInformationModal('تاریخچه «' + (type.Name || 'اطلاعات') + '»', '<div class="loading-state">در حال دریافت سوابق…</div>');
      try {
        const response = await window.PMS.Api.get('/projects/' + encodeURIComponent(this.projectId) + '/information/' + encodeURIComponent(record.InformationTypeID) + '/history');
        const history = this.normalizeArray(response ? response.data : null, ['items', 'Items']);
        box.body.innerHTML = history.length ? history.slice().reverse().map(item => {
          const oldValue = item.OldValue !== undefined ? item.OldValue : this.parseAuditData(item.OldValueJSON);
          const newValue = item.NewValue !== undefined ? item.NewValue : this.parseAuditData(item.NewValueJSON);
          return '<article class="project-information-history-row"><strong>نسخه ' + this.escape(item.Revision) + ' · ' + this.escape(item.Action) + '</strong><div>زمان: ' + this.escape(this.formatDate(item.CreatedAt)) + ' · ثبت‌کننده: ' + this.escape(item.ActorUserID || '-') + '</div>' +
            (item.Reason ? '<div>دلیل: ' + this.escape(item.Reason) + '</div>' : '') +
            '<details><summary>مشاهده مقدار قبلی و جدید</summary><div>مقدار قبلی:</div><pre>' + this.escape(this.informationValue(oldValue)) + '</pre><div>مقدار جدید:</div><pre>' + this.escape(this.informationValue(newValue)) + '</pre></details></article>';
        }).join('') : '<div class="table-empty">هنوز تاریخچه‌ای ثبت نشده است.</div>';
      } catch (err) {
        box.body.innerHTML = '<div class="alert alert-danger">' + this.escape(err.message || 'دریافت تاریخچه ناموفق بود.') + '</div>';
      }
    },

    loadAuditHistory: async function (forceRefresh) {
      const container = document.getElementById('project-management-history');
      const loading = document.getElementById('project-management-history-loading');
      const error = document.getElementById('project-management-history-error');
      const router = window.PMS.Router;
      const canViewAudit = !!(router &&
        ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
          (Array.isArray(router.permissions) && router.permissions.indexOf('REPORT_VIEW') !== -1)));

      const retry = document.getElementById('project-management-history-retry');
      if (!container) return;
      if (retry) retry.hidden = true;
      if (!canViewAudit) {
        if (loading) loading.hidden = true;
        if (error) {
          error.textContent = 'برای مشاهده تغییرات مدیریتی، دسترسی گزارش‌گیری لازم است.';
          error.hidden = false;
        }
        return;
      }

      if (loading) loading.hidden = false;
      if (error) error.hidden = true;

      try {
        const key = 'project_audit_' + String(this.projectId);
        const response = forceRefresh
          ? await window.PMS.Api.getFresh('/audit/entity/PROJECT/' + encodeURIComponent(this.projectId), key)
          : await window.PMS.Api.getCached('/audit/entity/PROJECT/' + encodeURIComponent(this.projectId), key);
        this.auditRecords = this.normalizeArray(response ? response.data : null, ['audits', 'items', 'Audits', 'Items']);
        this.auditLoadError = '';
        this.renderAuditHistory();
        await this.loadVoidedEventAuditHistory();
      } catch (auditError) {
        this.auditLoadError = auditError && auditError.message ? auditError.message : 'دریافت تغییرات مدیریتی ناموفق بود.';
        if (error) {
          error.textContent = this.auditLoadError;
          error.hidden = false;
        }
        if (container && !this.auditRecords.length) {
          container.innerHTML = '<div class="table-empty">دریافت تغییرات مدیریتی ناموفق بود.</div>';
        }
        if (retry) retry.hidden = false;
      } finally {
        if (loading) loading.hidden = true;
      }
    },

    loadVoidedEventAuditHistory: async function () {
      const router = window.PMS && window.PMS.Router;
      const permissions = router && Array.isArray(router.permissions) ? router.permissions : [];
      const canViewAudit = !!(router && (
        (typeof router.isAdmin === 'function' && router.isAdmin()) ||
        permissions.indexOf('REPORT_VIEW') !== -1
      ));
      if (!canViewAudit) return;

      const self = this;
      const voided = (this.events || []).filter(function (event) {
        const status = String(event.Status || '').toUpperCase();
        return status === 'VOID' || status === 'CANCELLED';
      });
      await Promise.all(voided.map(async function (event) {
        const id = event.ID || event.Id || event.id;
        if (!id) return;
        try {
          const key = 'event_audit_' + String(id);
          const response = await window.PMS.Api.getCached('/audit/entity/EVENT/' + encodeURIComponent(id), key);
          const records = self.normalizeArray(response ? response.data : null, ['audits', 'items', 'Audits', 'Items']);
          records.forEach(function (record) {
            if (!self.auditRecords.some(function (existing) { return String(existing.ID || existing.Id) === String(record.ID || record.Id); })) {
              self.auditRecords.push(record);
            }
          });
        } catch (error) {}
      }));
      this.renderAuditHistory();
    },

    renderAuditHistory: function () {
      const container = document.getElementById('project-management-history');
      if (!container) return;
      this.ensureManagementHistoryStyles();
      const records = (this.auditRecords || []).slice().sort(function (a, b) {
        return new Date(b.CreatedAt || 0).getTime() - new Date(a.CreatedAt || 0).getTime();
      });
      if (!records.length) {
        container.innerHTML = '<div class="table-empty">تغییر مدیریتی برای این پروژه ثبت نشده است.</div>';
        return;
      }

      const actionLabels = {
        CREATE: 'ایجاد رکورد',
        UPDATE: 'ویرایش اطلاعات',
        DELETE: 'حذف رکورد',
        VOID: 'ابطال رویداد',
        PROJECT_CREATED: 'ایجاد پروژه',
        PROJECT_UPDATED: 'ویرایش اطلاعات پروژه',
        PROJECT_DELETED: 'حذف پروژه',
        EVENT_VOIDED: 'ابطال رویداد',
        EVENT_CANCELLED: 'لغو رویداد',
        EVENT_UPDATED: 'ویرایش رویداد'
      };

      container.innerHTML = records.map((record) => {
        const action = String(record.Action || 'تغییر مدیریتی');
        const entityType = String(record.EntityType || '').toUpperCase();
        const actionLabel = action === 'CREATE' && entityType === 'PROJECT'
          ? 'ایجاد پروژه'
          : (action === 'UPDATE' && entityType === 'PROJECT'
            ? 'ویرایش اطلاعات پروژه'
            : (action === 'VOID' && entityType === 'EVENT'
              ? 'ابطال رویداد'
              : (actionLabels[action] || action)));
        const user = this.findById(this.users, record.UserID || record.UserId);
        const userName = user ? (user.Name || user.FullName || user.Username) : (record.UserID || record.UserId || '-');
        const oldData = this.parseAuditData(record.OldData);
        const newData = this.parseAuditData(record.NewData);
        const changes = this.renderAuditDiff(oldData, newData);
        return '<article class="project-management-record">' +
          '<div class="project-management-record-head"><strong>' + this.escape(actionLabel) + '</strong><span>' + this.escape(this.formatDate(record.CreatedAt)) + '</span></div>' +
          '<div class="project-management-record-meta"><span>کاربر: ' + this.escape(userName) + '</span>' +
          (record.Reason ? '<span>دلیل: ' + this.escape(record.Reason) + '</span>' : '') + '</div>' +
          (changes ? '<details class="project-management-record-details"><summary>مشاهده جزئیات تغییر</summary>' + changes + '</details>' : '') +
          '</article>';
      }).join('');
    },

    ensureManagementHistoryStyles: function () {
      let style = document.getElementById('project-management-history-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'project-management-history-styles';
        document.head.appendChild(style);
      }
      style.textContent = [
        '.project-management-history-intro{font-size:12px;line-height:2;color:var(--color-text-secondary);margin:0 0 14px}',
        '.project-management-record{padding:12px 0;border-bottom:1px solid var(--color-border)}',
        '.project-management-record:last-child{border-bottom:0}',
        '.project-management-record-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
        '.project-management-record-head strong{font-size:13px;color:var(--color-text)}',
        '.project-management-record-head span,.project-management-record-meta{font-size:11px;color:var(--color-text-secondary);line-height:1.9}',
        '.project-management-record-meta{display:flex;gap:6px 16px;flex-wrap:wrap;margin-top:5px}',
        '.project-management-record-details{margin-top:8px;border:1px solid var(--color-border);border-radius:8px;padding:8px 10px;background:var(--color-surface)}',
        '.project-management-record-details summary{font-size:11px;cursor:pointer;color:var(--color-primary);font-weight:700}',
        '.project-management-diff{display:flex;flex-direction:column;gap:7px;margin-top:10px}',
        '.project-management-diff-row{display:grid;grid-template-columns:minmax(100px,.6fr) repeat(2,minmax(0,1fr));gap:8px;padding:8px;border-radius:7px;background:var(--color-background);font-size:11px;overflow-wrap:anywhere}',
        '.project-management-diff-row>strong{color:var(--color-text)}',
        '.project-management-diff-row>span{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--color-text-secondary)}',
        '.project-management-diff-row small{display:block;color:var(--color-text-muted);margin-bottom:3px}',
        '@media(max-width:600px){.project-management-diff-row{grid-template-columns:minmax(0,1fr)}.project-management-record-head{flex-direction:column;gap:2px}}'
      ].join('\n');
    },

    parseAuditData: function (value) {
      if (!value) return {};
      if (typeof value === 'object') return value;
      try {
        const parsed = JSON.parse(String(value));
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (error) {
        return {};
      }
    },

    renderAuditDiff: function (oldData, newData) {
      const keys = Array.from(new Set(Object.keys(oldData || {}).concat(Object.keys(newData || {}))));
      const labels = {
        ProjectCode: 'کد پروژه', Title: 'عنوان پروژه', Description: 'توضیحات',
        Status: 'وضعیت', CurrentStepID: 'مرحله فعلی', WorkflowID: 'گردش کار',
        EventTypeID: 'نوع رویداد', OccurredAt: 'تاریخ رویداد', Reason: 'دلیل'
      };
      const changes = keys.filter(function (key) {
        return JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
      });
      if (!changes.length) return '';
      return '<div class="project-management-diff">' + changes.map((key) => {
        return '<div class="project-management-diff-row"><strong>' + this.escape(labels[key] || key) + '</strong>' +
          '<span><small>قبل:</small> ' + this.escape(this.auditValue(oldData[key])) + '</span>' +
          '<span><small>بعد:</small> ' + this.escape(this.auditValue(newData[key])) + '</span></div>';
      }).join('') + '</div>';
    },

    auditValue: function (value) {
      if (value === null || value === undefined || value === '') return '-';
      if (typeof value === 'object') {
        try { return JSON.stringify(value); } catch (error) { return String(value); }
      }
      return String(value);
    },

    load: async function () {
      const version = ++this.loadVersion;
      const loading = document.getElementById('project-detail-loading');
      const cachedProject = window.PMS.Cache.get(this.getProjectCacheKey());
      const cachedEvents = window.PMS.Cache.get(this.getEventsCacheKey());
      const cachedDetails = window.PMS.Cache.get(this.getEventDetailsCacheKey());

      if (cachedProject !== null) {
        this.project = cachedProject;
        this.renderProject(cachedProject);
      }

      if (cachedDetails !== null) {
        this.applyEventDetailsBundle(cachedDetails, version);
      } else if (cachedEvents !== null) {
        this.events = this.normalizeEvents(cachedEvents);
        this.renderEvents(this.events);
      }

      if (cachedProject !== null || cachedEvents !== null || cachedDetails !== null) {
        if (loading) loading.hidden = true;
        this.showContent();
      }

      const projectPromise = window.PMS.Api.getCached(
        '/projects/' + encodeURIComponent(this.projectId),
        this.getProjectCacheKey(),
        {
          onRefresh: function (data) {
            if (version !== ProjectDetail.loadVersion) return;
            const project = ProjectDetail.unwrap(data);
            if (!project || typeof project !== 'object') return;
            ProjectDetail.project = project;
            ProjectDetail.renderProject(project);
            ProjectDetail.loadWorkflowSteps(project, version);
            ProjectDetail.showContent();
          }
        }
      );

      const eventsPromise = window.PMS.Api.getCached(
        '/projects/' + encodeURIComponent(this.projectId) + '/details',
        this.getEventDetailsCacheKey(),
        {
          onRefresh: function (data) {
            if (version !== ProjectDetail.loadVersion) return;
            ProjectDetail.applyEventDetailsBundle(data, version);
            ProjectDetail.showContent();
          }
        }
      );

      const results = await Promise.allSettled([projectPromise, eventsPromise]);
      if (version !== this.loadVersion) return;

      let projectLoaded = cachedProject !== null;
      let projectError = null;
      const projectResult = results[0];
      if (projectResult.status === 'fulfilled') {
        const project = this.unwrap(projectResult.value && projectResult.value.data);
        if (project && typeof project === 'object') {
          this.project = project;
          this.renderProject(project);
          this.loadWorkflowSteps(project, version);
          projectLoaded = true;
        } else if (!projectLoaded) {
          projectError = new Error('اطلاعات پروژه از سرور دریافت نشد.');
        }
      } else {
        projectError = projectResult.reason;
      }

      let eventsLoaded = cachedDetails !== null || cachedEvents !== null;
      const eventsResult = results[1];
      if (eventsResult.status === 'fulfilled') {
        const result = eventsResult.value;
        if (result && result.data !== undefined) {
          this.applyEventDetailsBundle(result.data, version);
          this.loadVoidedEventAuditHistory();
          eventsLoaded = true;
        }
      } else {
        console.warn('دریافت رویدادهای پروژه ناموفق بود:', eventsResult.reason);
        if (!eventsLoaded) {
          const eventsContainer = document.getElementById('project-detail-events');
          if (eventsContainer) {
            eventsContainer.textContent = 'رویدادهای پروژه دریافت نشدند؛ ممکن است دسترسی مشاهده رویدادها را نداشته باشید.';
          }
        }
      }

      if (projectLoaded) {
        this.showContent();
      } else {
        this.showError(projectError || new Error('خطا در دریافت اطلاعات پروژه.'));
      }

      if (loading) loading.hidden = true;
    },

    unwrap: function (data) {
      if (
        data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        data.data !== undefined
      ) {
        return data.data;
      }

      return data;
    },

    normalizeArray: function (data, possibleKeys) {
      data = this.unwrap(data);

      if (Array.isArray(data)) return data;
      if (!data || typeof data !== 'object') return [];

      for (let i = 0; i < possibleKeys.length; i++) {
        if (Array.isArray(data[possibleKeys[i]])) {
          return data[possibleKeys[i]];
        }
      }

      return [];
    },

    normalizeEvents: function (data) {
      return this.normalizeArray(data, [
        'events',
        'items',
        'Events',
        'Items'
      ]);
    },

    renderProject: function (project) {
      if (!project) return;

      const title = document.getElementById('project-detail-title');
      const code = document.getElementById('project-detail-code');
      const status = document.getElementById('project-detail-status');
      const step = document.getElementById('project-detail-step');
      const created = document.getElementById('project-detail-created');
      const updated = document.getElementById('project-detail-updated');
      const info = document.getElementById('project-detail-info');

      if (title) {
        title.textContent = project.Title || '-';
      }

      if (code) {
        code.textContent = project.ProjectCode || '-';
      }

      const isDraft = String(project.RecordState || '').toUpperCase() === 'DRAFT';
      if (status) {
        status.textContent = isDraft ? 'پیش‌نویس — نیازمند تکمیل' : this.statusText(project.Status);
      }
      const addEventButton = document.getElementById('project-add-event-button');
      const router = window.PMS && window.PMS.Router;
      const canCreateEvents = !!(router && ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
        (Array.isArray(router.permissions) && router.permissions.indexOf('EVENT_CREATE') !== -1)));
      const hasDraftEventTypes = (Array.isArray(this.eventTypes) ? this.eventTypes : []).some(function(type) {
        return String(type.ConnectionType || 'PROJECT').toUpperCase() !== 'INDEPENDENT' &&
          (type.AllowOnDraft === true || String(type.AllowOnDraft).toLowerCase() === 'true') &&
          String(type.Status || 'ACTIVE').toUpperCase() === 'ACTIVE';
      });
      if (addEventButton) addEventButton.hidden = !canCreateEvents || (isDraft && !hasDraftEventTypes);


      if (step) {
        step.textContent = isDraft ? 'پس از تکمیل گردش‌کار تعیین می‌شود' : this.getStepName(project.CurrentStepID);
      }

      if (created) {
        created.textContent = this.formatDate(project.CreatedAt);
      }

      if (updated) {
        updated.textContent = this.formatDate(project.UpdatedAt);
      }

      let colorSize = { colors: [], sizes: [] };
      const rawColorSize = project.ColorSizeJSON || project.colorSizeJSON || project.color_size_json;
      if (rawColorSize) {
        try {
          const parsed = typeof rawColorSize === 'string' ? JSON.parse(rawColorSize) : rawColorSize;
          if (parsed && typeof parsed === 'object') {
            colorSize.colors = Array.isArray(parsed.colors) ? parsed.colors : [];
            colorSize.sizes = Array.isArray(parsed.sizes) ? parsed.sizes : [];
          }
        } catch (error) {
          console.warn('خواندن رنگ‌بندی و سایزبندی پروژه انجام نشد.', error);
        }
      }

      const colorNames = colorSize.colors.map(function (value) { return String(value || '').trim(); }).filter(Boolean);
      const sizeNames = colorSize.sizes.map(function (value) { return String(value || '').trim(); }).filter(Boolean);

      if (info) {
        info.innerHTML =
          '<div class="detail-list">' +
            this.detailRow('شناسه پروژه', project.ID) +
            this.detailRow('وضعیت تکمیل پرونده', isDraft ? 'پیش‌نویس؛ رویدادهای مجاز می‌توانند پیش از تکمیل ثبت شوند.' : 'تکمیل‌شده') +
            this.detailRow('کد پروژه', project.ProjectCode) +
            this.detailRow('عنوان پروژه', project.Title) +
            this.detailRow('تعداد اولیه', project.Quantity) +
            this.detailRow('رنگ‌بندی', colorNames.length ? colorNames.join('، ') : 'تعریف نشده') +
            this.detailRow('سایزبندی', sizeNames.length ? sizeNames.join('، ') : 'تعریف نشده') +
            this.detailRow('توضیحات', project.Description) +
            this.detailRow('شناسه فرایند', project.WorkflowID) +
            this.detailRow(
              'مرحله فعلی',
              this.getStepName(project.CurrentStepID)
            ) +
            this.detailRow('وضعیت کار در مرحله', project.CurrentStepStatus) +
          '</div>';
      }
    },

    loadProjectPassportImages: async function (forceRefresh) {
      const projectId = this.projectId;
      const types = [
        { type: 'SEWING_PASSPORT', containerId: 'project-detail-sewing-passport', label: 'شناسنامه دوخت' },
        { type: 'CUTTING_PASSPORT', containerId: 'project-detail-cutting-passport', label: 'شناسنامه برش' }
      ];
      const router = window.PMS && window.PMS.Router;
      const canViewAttachments = !!(router &&
        ((typeof router.isAdmin === 'function' && router.isAdmin()) ||
          (Array.isArray(router.permissions) && router.permissions.indexOf('ATTACHMENT_VIEW') !== -1)));

      types.forEach(function (entry) {
        const container = document.getElementById(entry.containerId);
        if (!container) return;
        container.innerHTML = canViewAttachments
          ? '<div class="loading-state">در حال دریافت تصاویر...</div>'
          : '<div class="table-empty">دسترسی مشاهده پیوست‌ها را ندارید.</div>';
      });
      if (!canViewAttachments || !projectId) return;

      try {
        const cacheKey = 'project_attachments_' + String(projectId);
        const response = forceRefresh
          ? await window.PMS.Api.getFresh('/projects/' + encodeURIComponent(projectId) + '/attachments', cacheKey)
          : await window.PMS.Api.getCached('/projects/' + encodeURIComponent(projectId) + '/attachments', cacheKey);
        const attachments = this.normalizeArray(response, ['attachments', 'items', 'Attachments', 'Items']);
        types.forEach((entry) => {
          const container = document.getElementById(entry.containerId);
          if (!container) return;
          const items = attachments.filter(function (item) {
            const mime = String(item.MimeType || item.mimeType || '').toLowerCase();
            const type = String(item.AttachmentType || item.attachmentType || '').toUpperCase();
            const status = String(item.Status || 'ACTIVE').toUpperCase();
            return mime.indexOf('image/') === 0 && type === entry.type &&
              status !== 'DELETED' && status !== 'VOID';
          });
          if (!items.length) {
            container.innerHTML = '<div class="table-empty">هنوز تصویری برای ' + entry.label + ' ثبت نشده است.</div>';
            return;
          }
          container.innerHTML = '<div class="project-passport-grid">' + items.map((item) => {
            const id = item.ID || item.Id || item.id || '';
            const name = item.FileName || item.fileName || entry.label;
            return '<article class="project-passport-item">' +
              '<div class="project-passport-file-name">' + this.escape(name) + '</div>' +
              '<button type="button" class="btn btn-light" data-project-passport-preview="' + this.escape(id) + '" data-project-passport-type="' + entry.type + '">مشاهده تصویر</button>' +
              '</article>';
          }).join('') + '</div>';
        });
      } catch (error) {
        types.forEach(function (entry) {
          const container = document.getElementById(entry.containerId);
          if (container) {
            container.innerHTML = '<div class="alert alert-danger">' +
              ProjectDetail.escape(error && error.message ? error.message : 'دریافت تصاویر شناسنامه ناموفق بود.') +
              ' <button type="button" class="btn btn-light" data-project-passport-retry>تلاش مجدد</button></div>';
          }
        });
      }
    },

    previewProjectPassportImage: async function (attachmentId, label) {
      if (!attachmentId) return;
      try {
        const response = await window.PMS.Api.get('/attachments/' + encodeURIComponent(attachmentId) + '/download', { trackSync: false });
        const data = this.unwrap(response);
        const base64 = data && (data.Base64 || data.base64);
        if (!base64) throw new Error('داده تصویر در پاسخ موجود نیست.');
        const modal = document.createElement('div');
        modal.className = 'project-passport-preview-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', label || 'پیش‌نمایش تصویر شناسنامه');
        modal.innerHTML = '<button type="button" class="project-passport-preview-close">بستن ×</button><img alt="' + this.escape(label || 'تصویر شناسنامه پروژه') + '">';
        const image = modal.querySelector('img');
        image.src = 'data:' + String(data.MimeType || data.mimeType || 'image/jpeg') + ';base64,' + base64;
        const close = function () { modal.remove(); document.removeEventListener('keydown', onKey); };
        const onKey = function (event) { if (event.key === 'Escape') close(); };
        modal.addEventListener('click', function (event) {
          if (event.target === modal || event.target.closest('.project-passport-preview-close')) close();
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(modal);
        modal.querySelector('.project-passport-preview-close').focus();
      } catch (error) {
        window.alert(error && error.message ? error.message : 'نمایش تصویر ناموفق بود.');
      }
    },

    bindProjectPassportImageEvents: function () {
      const content = document.getElementById('project-detail-content');
      if (!content || content.dataset.passportEventsBound) return;
      content.dataset.passportEventsBound = '1';
      content.addEventListener('click', function (event) {
        const preview = event.target.closest('[data-project-passport-preview]');
        if (preview) {
          const type = preview.getAttribute('data-project-passport-type');
          ProjectDetail.previewProjectPassportImage(
            preview.getAttribute('data-project-passport-preview'),
            type === 'SEWING_PASSPORT' ? 'شناسنامه دوخت' : 'شناسنامه برش'
          );
          return;
        }
        if (event.target.closest('[data-project-passport-retry]')) {
          ProjectDetail.loadProjectPassportImages(true);
        }
      });
    },

    ensureProjectPassportStyles: function () {
      if (document.getElementById('project-passport-styles')) return;
      const style = document.createElement('style');
      style.id = 'project-passport-styles';
      style.textContent = [
        '.project-passport-intro{margin:0 0 12px;color:var(--color-text-secondary);font-size:12px}',
        '.project-passport-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}',
        '.project-passport-item{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border:1px solid var(--color-border);border-radius:8px;padding:12px;min-width:0}',
        '.project-passport-file-name{font-size:12px;overflow-wrap:anywhere;min-width:0}',
        '.project-passport-preview-overlay{position:fixed;inset:0;z-index:30000;background:#000d;display:flex;align-items:center;justify-content:center;padding:18px}',
        '.project-passport-preview-overlay img{display:block;max-width:100%;max-height:88vh;object-fit:contain}',
        '.project-passport-preview-close{position:absolute;top:12px;right:12px;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}',
        '@media(max-width:600px){.project-passport-item{align-items:flex-start;flex-direction:column}.project-passport-item button{width:100%}}'
      ].join('\n');
      document.head.appendChild(style);
    },

    detailRow: function (label, value) {
      return (
        '<div class="detail-row">' +
          '<strong>' + this.escape(label) + ':</strong>' +
          '<span>' + this.escape(
            value === null || value === undefined || value === ''
              ? '-'
              : value
          ) + '</span>' +
        '</div>'
      );
    },

    loadSharedData: async function (version) {
      const api = window.PMS.Api;
      const cache = window.PMS.Cache;
      const applyLookups = function (data) {
        const lookups = ProjectDetail.unwrap(data) || {};
        ProjectDetail.users = ProjectDetail.normalizeArray(
          lookups.users,
          ['users', 'items', 'Users', 'Items']
        );
        ProjectDetail.departments = ProjectDetail.normalizeArray(
          lookups.departments,
          ['departments', 'items', 'Departments', 'Items']
        );
        ProjectDetail.eventTypes = ProjectDetail.normalizeArray(
          lookups.eventTypes,
          ['eventTypes', 'items', 'EventTypes', 'Items']
        );
        ProjectDetail.projectStatuses = ProjectDetail.normalizeArray(
          lookups.projectStatuses,
          ['projectStatuses', 'statuses', 'items', 'ProjectStatuses']
        );
      };

      try {
        // One PROJECT_VIEW-authorized request supplies all read-only labels.
        // This avoids several requests that may be forbidden to ordinary project viewers.
        const result = await api.getCached(
          '/project-dashboard/lookups',
          'dashboard_project_lookups_v1',
          {
            onRefresh: function (data) {
              if (version !== ProjectDetail.loadVersion) return;
              applyLookups(data);
              ProjectDetail.renderEvents(ProjectDetail.events);
            }
          }
        );

        if (version !== ProjectDetail.loadVersion) return;
        applyLookups(result.data);
      } catch (error) {
        console.warn('دریافت اطلاعات تکمیلی پروژه انجام نشد.', error);
      }
    },

    loadWorkflowSteps: async function (project, version) {
      if (!project || !project.WorkflowID) return;

      const cacheKey = this.getCacheKey(
        window.PMS.Cache.keys.WORKFLOW_STEPS,
        project.WorkflowID
      );

      try {
        const result = await window.PMS.Api.getCached(
          '/workflows/' +
            encodeURIComponent(project.WorkflowID) +
            '/steps',
          cacheKey,
          {
            onRefresh: function (data) {
              if (version !== ProjectDetail.loadVersion) return;

              ProjectDetail.workflowSteps =
                ProjectDetail.normalizeArray(
                  data,
                  ['steps', 'items', 'Steps', 'Items']
                );

              ProjectDetail.renderProject(ProjectDetail.project);
            }
          }
        );

        if (version !== this.loadVersion) return;

        this.workflowSteps = this.normalizeArray(
          result.data,
          ['steps', 'items', 'Steps', 'Items']
        );

        this.renderProject(this.project);
      } catch (error) {
        console.warn('دریافت مراحل فرایند انجام نشد.', error);
      }
    },

    applyEventDetailsBundle: function (data, version) {
      const bundle = this.unwrap(data);
      if (!bundle || typeof bundle !== 'object') return;

      this.events = this.normalizeEvents(bundle.events || []);
      this.eventData = {};

      const eventData = bundle.eventData && typeof bundle.eventData === 'object'
        ? bundle.eventData
        : {};

      Object.keys(eventData).forEach(function (eventId) {
        ProjectDetail.eventData[String(eventId)] =
          ProjectDetail.normalizeEventData(eventData[eventId]);
      });

      this.eventFields = {};
      const eventFields = bundle.eventFields && typeof bundle.eventFields === 'object'
        ? bundle.eventFields
        : {};

      Object.keys(eventFields).forEach(function (typeId) {
        ProjectDetail.eventFields[String(typeId)] =
          ProjectDetail.normalizeArray(eventFields[typeId]).filter(function (field) {
            return !field.Status ||
              String(field.Status).toUpperCase() === 'ACTIVE';
          });
      });

      this.renderEvents(this.events);
      this.loadProjectForms(this.events, version, false);

      this.loadSharedData(version).then(function () {
        if (version === ProjectDetail.loadVersion) {
          ProjectDetail.renderEvents(ProjectDetail.events);
          ProjectDetail.renderAuditHistory();
        }
      });
    },

    normalizeEventData: function (data) {
      data = this.unwrap(data);

      if (!data || typeof data !== 'object') {
        return {};
      }

      if (Array.isArray(data)) {
        return {};
      }

      if (
        data.DataJSON &&
        typeof data.DataJSON === 'string'
      ) {
        try {
          return JSON.parse(data.DataJSON);
        } catch (error) {
          return {};
        }
      }

      if (
        data.dataJSON &&
        typeof data.dataJSON === 'string'
      ) {
        try {
          return JSON.parse(data.dataJSON);
        } catch (error) {
          return {};
        }
      }

      if (
        data.Data &&
        typeof data.Data === 'object' &&
        !Array.isArray(data.Data)
      ) {
        return data.Data;
      }

      if (
        data.data &&
        typeof data.data === 'object' &&
        !Array.isArray(data.data)
      ) {
        return data.data;
      }

      return data;
    },

    isCuttingEventType: function (eventType) {
      if (!eventType) return false;
      const typeName = String(eventType.Name || eventType.Title || '').toLocaleLowerCase('fa');
      const typeCode = String(eventType.Code || '').toUpperCase();
      const department = this.findById(this.departments, eventType.DepartmentID);
      const departmentName = String(department && (department.Name || department.Title || department.Code) || '').toLocaleLowerCase('fa');
      const departmentCode = String(department && department.Code || '').toUpperCase();
      return /برش|cutting/.test(typeName) ||
        /CUTTING|CUT/.test(typeCode) ||
        /برش|cutting/.test(departmentName) ||
        /CUTTING|CUT/.test(departmentCode);
    },

    renderCuttingSummary: function (events) {
      const eventTypes = Array.isArray(this.eventTypes) ? this.eventTypes : [];
      const cuttingTypes = eventTypes.filter(function (type) {
        const track = type.TrackVariantQuantity === true ||
          String(type.TrackVariantQuantity).toLowerCase() === 'true';
        return ProjectDetail.isCuttingEventType(type) && (track || /برش|cutting/i.test(String(type.Name || type.Code || '')));
      });
      const cuttingTypeIds = new Set(cuttingTypes.map(function (type) {
        return String(type.ID || type.Id || type.id || '');
      }).filter(Boolean));
      const totals = new Map();
      let batches = 0;
      let totalQuantity = 0;
      let finalized = false;

      (Array.isArray(events) ? events : []).forEach(function (event) {
        const status = String(event.Status || '').toUpperCase();
        if (status === 'VOID' || status === 'CANCELLED' || status === 'CANCELED') return;
        const typeId = String(event.EventTypeID || event.EventTypeId || '');
        const type = ProjectDetail.findById(eventTypes, typeId);
        if (!type || !ProjectDetail.isCuttingEventType(type)) return;

        const typeName = String(type.Name || type.Title || type.Code || event.EventTypeName || '').toLocaleLowerCase('fa');
        if (/پایان برش|اتمام برش|تکمیل برش|برش نهایی|final cutting|cutting complete/.test(typeName)) {
          finalized = true;
        }

        const tracksQuantity = type.TrackVariantQuantity === true ||
          String(type.TrackVariantQuantity).toLowerCase() === 'true';
        if (!tracksQuantity || !cuttingTypeIds.has(typeId)) return;

        let variants = [];
        try {
          const raw = event.VariantDetailsJSON || event.variantDetailsJSON || '[]';
          variants = Array.isArray(raw) ? raw : JSON.parse(String(raw));
        } catch (error) {
          variants = [];
        }
        if (!Array.isArray(variants) || !variants.length) return;

        let eventHasQuantity = false;
        variants.forEach(function (variant) {
          variant = variant || {};
          const quantity = Number(variant.VariantQuantity);
          if (!isFinite(quantity) || quantity <= 0 || Math.floor(quantity) !== quantity) return;
          const color = String(variant.Color || '').trim();
          const size = String(variant.Size || '').trim();
          const key = JSON.stringify([color, size]);
          const previous = totals.get(key) || { color: color, size: size, quantity: 0 };
          previous.quantity += quantity;
          totals.set(key, previous);
          totalQuantity += quantity;
          eventHasQuantity = true;
        });
        if (eventHasQuantity) batches += 1;
      });

      if (!cuttingTypes.length && !batches) return '';
      const rows = Array.from(totals.values()).sort(function (a, b) {
        return a.color.localeCompare(b.color, 'fa') || a.size.localeCompare(b.size, 'fa');
      });
      const rowsHtml = rows.length ? rows.map(function (row) {
        const label = [row.color, row.size].filter(Boolean).join(' / ') || 'بدون تفکیک رنگ و سایز';
        return '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 11px;border:1px solid var(--color-border);border-radius:9px;min-width:0">' +
          '<span style="overflow-wrap:anywhere">' + ProjectDetail.escape(label) + '</span>' +
          '<strong style="white-space:nowrap">' + ProjectDetail.escape(row.quantity.toLocaleString('fa-IR')) + ' عدد</strong></div>';
      }).join('') : '<div class="table-empty">هنوز مرحله برشی با تعداد ثبت‌شده برای این پروژه وجود ندارد.</div>';

      return '<section class="cutting-summary-panel" aria-label="خلاصه تجمعی برش" style="margin:0 0 18px;padding:15px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px">' +
          '<div><h3 style="margin:0 0 4px;font-size:15px">خلاصه تجمعی برش</h3><p style="margin:0;color:var(--color-text-secondary);font-size:12px">مجموع مراحل برش ثبت‌شده؛ رویدادهای باطل‌شده محاسبه نمی‌شوند.</p></div>' +
          '<span style="display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:' + (finalized ? 'color-mix(in srgb,#16a34a 13%,var(--color-surface))' : 'var(--color-surface-hover)') + ';color:' + (finalized ? '#16824a' : 'var(--color-text-secondary)') + ';font-size:12px;font-weight:700">' +
            (finalized ? 'برش تکمیل‌شده' : 'در حال برش') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">' +
          '<div style="flex:1;min-width:120px;padding:12px;border-radius:10px;background:var(--color-surface-hover)"><div style="font-size:12px;color:var(--color-text-secondary)">تعداد تجمعی برش</div><strong style="display:block;font-size:24px;margin-top:3px">' + ProjectDetail.escape(totalQuantity.toLocaleString('fa-IR')) + '</strong></div>' +
          '<div style="flex:1;min-width:120px;padding:12px;border-radius:10px;background:var(--color-surface-hover)"><div style="font-size:12px;color:var(--color-text-secondary)">مراحل دارای تعداد</div><strong style="display:block;font-size:24px;margin-top:3px">' + ProjectDetail.escape(batches.toLocaleString('fa-IR')) + '</strong></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">' + rowsHtml + '</div>' +
        '<p style="margin:10px 0 0;color:var(--color-text-secondary);font-size:11px">برای محاسبه، نوع رویداد باید به واحد برش مرتبط باشد و گزینه «مقدار تولید/تحویل برای ترکیب انتخاب‌شده ثبت شود» فعال باشد. تکمیل نهایی از نام رویداد پایان/اتمام برش تشخیص داده می‌شود.</p>' +
      '</section>';
    },

    renderEvents: function (events) {
      const container = document.getElementById(
        'project-detail-events'
      );

      const count = document.getElementById(
        'project-detail-events-count'
      );

      events = Array.isArray(events) ? events : [];

      if (count) {
        count.textContent = String(events.length);
      }

      if (!container) return;

      this.ensureTimelineStyles();

      if (events.length === 0) {
        container.innerHTML =
          '<div class="table-empty">رویدادی برای این پروژه ثبت نشده است.</div>';
        return;
      }

      const sortedEvents = events.slice().sort(function (a, b) {
        const aDate = ProjectDetail.getEventTimestamp(a);
        const bDate = ProjectDetail.getEventTimestamp(b);

        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;

        // نمایش آخرین فعالیت در ابتدای خط زمانی
        return bDate - aDate;
      });

      let html = this.renderCuttingSummary(events) + '<div class="pms-timeline">';

      sortedEvents.forEach(function (event) {
        const eventTypeId = event.EventTypeID || event.EventTypeId;

        const eventType = ProjectDetail.findById(
          ProjectDetail.eventTypes,
          eventTypeId
        );

        const performer = ProjectDetail.findById(
          ProjectDetail.users,
          event.PerformedBy || event.PerformedByID
        );

        const creator = ProjectDetail.findById(
          ProjectDetail.users,
          event.CreatedBy || event.CreatedByID
        );

        const department = ProjectDetail.findById(
          ProjectDetail.departments,
          event.DepartmentID || event.DepartmentId
        );

        const eventTitle = eventType
          ? (
              eventType.Name ||
              eventType.Title ||
              eventType.Code ||
              'رویداد'
            )
          : (
              event.EventTypeName ||
              event.EventTypeTitle ||
              event.EventTypeCode ||
              'رویداد'
            );

        const eventId = String(event.ID || event.Id || '');
        const dynamicData = ProjectDetail.eventData[eventId];
        const fields = ProjectDetail.eventFields[
          String(eventTypeId || '')
        ] || [];

        const occurredAt =
          event.OccurredAt ||
          event.occurredAt ||
          event.CreatedAt ||
          event.createdAt;

        const createdAt = event.CreatedAt || event.createdAt;

        const departmentName = department
          ? department.Name || department.Title || department.Code
          : event.DepartmentName || '';

        const performerName = performer
          ? performer.Name || performer.Username
          : event.PerformedByName || '';

        const creatorName = creator
          ? creator.Name || creator.Username
          : event.CreatedByName || '';

        html +=
          '<article class="pms-timeline-item">' +
            '<div class="pms-timeline-marker"></div>' +
            '<div class="pms-timeline-card">' +

              '<div class="pms-timeline-header">' +
                '<div>' +
                  '<div class="pms-timeline-title">' +
                    ProjectDetail.escape(eventTitle) +
                  '</div>' +
                  '<div class="pms-timeline-date">' +
                    '<span>تاریخ وقوع: </span>' +
                    ProjectDetail.escape(
                      ProjectDetail.formatDate(occurredAt)
                    ) +
                  '</div>' +
                '</div>' +
                '<span class="pms-timeline-status">' +
                  ProjectDetail.escape(
                    ProjectDetail.statusText(event.Status)
                  ) +
                '</span>' +
              '</div>' +

              '<div class="pms-timeline-meta">' +
                ProjectDetail.metaItem('واحد', departmentName) +
                ProjectDetail.metaItem('اجراکننده', performerName) +
                ProjectDetail.metaItem('ثبت‌کننده', creatorName) +
              '</div>' +

              '<div class="pms-timeline-description">' +
                ProjectDetail.escape(
                  event.Description ||
                  event.description ||
                  'توضیحی ثبت نشده است.'
                ) +
              '</div>' +

              ProjectDetail.renderDynamicData(dynamicData, fields) +

              '<div class="pms-timeline-footer">' +
                '<span>تاریخ ثبت: ' +
                  ProjectDetail.escape(
                    ProjectDetail.formatDate(createdAt)
                  ) +
                '</span>' +
                '<span>شناسه رویداد: ' +
                  ProjectDetail.escape(eventId || '-') +
                '</span>' +
              '</div>' +

            '</div>' +
          '</article>';
      });

      html += '</div>';
      container.innerHTML = html;
    },

    getEventTimestamp: function (event) {
      if (!event) return null;

      const value =
        event.OccurredAt ||
        event.occurredAt ||
        event.CreatedAt ||
        event.createdAt;

      if (!value) return null;

      const timestamp = new Date(value).getTime();

      return Number.isNaN(timestamp) ? null : timestamp;
    },

    metaItem: function (label, value) {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        return '';
      }

      return (
        '<div class="pms-timeline-meta-item">' +
          '<span>' + this.escape(label) + '</span>' +
          '<strong>' + this.escape(value) + '</strong>' +
        '</div>'
      );
    },

    renderDynamicData: function (data, fields) {
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return '';
      }

      const keys = Object.keys(data).filter(function (key) {
        return data[key] !== null &&
          data[key] !== undefined &&
          String(data[key]) !== '';
      });

      if (!keys.length) return '';

      const orderedFields = (Array.isArray(fields) ? fields : [])
        .slice()
        .sort(function (a, b) {
          return Number(a.FieldOrder || 0) -
            Number(b.FieldOrder || 0);
        });

      let html =
        '<div class="pms-timeline-dynamic">' +
          '<strong>اطلاعات تکمیلی</strong>' +
          '<div class="pms-timeline-dynamic-grid">';

      keys.forEach(function (key) {
        const field = orderedFields.find(function (item) {
          return String(item.Code) === String(key);
        });

        const label = field
          ? field.Name || field.Code
          : key;

        const value = data[key];

        let displayValue = value;

        if (typeof value === 'object') {
          try {
            displayValue = JSON.stringify(value);
          } catch (error) {
            displayValue = String(value);
          }
        }

        html +=
          '<div class="pms-timeline-dynamic-item">' +
            '<span>' + ProjectDetail.escape(label) + '</span>' +
            '<strong>' + ProjectDetail.escape(displayValue) + '</strong>' +
          '</div>';
      });

      html += '</div></div>';

      return html;
    },

    findById: function (items, id) {
      if (
        !Array.isArray(items) ||
        id === null ||
        id === undefined ||
        id === ''
      ) {
        return null;
      }

      const targetId = String(id);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!item) continue;

        const possibleIds = [
          item.ID,
          item.Id,
          item.id
        ];

        for (let j = 0; j < possibleIds.length; j++) {
          if (
            possibleIds[j] !== null &&
            possibleIds[j] !== undefined &&
            String(possibleIds[j]) === targetId
          ) {
            return item;
          }
        }
      }

      return null;
    },

    getStepName: function (stepId) {
      if (!stepId) return '-';

      const step = this.findById(this.workflowSteps, stepId);

      return step
        ? step.Name || step.Title || step.Code || String(stepId)
        : String(stepId);
    },

    ensureTimelineStyles: function () {
      if (document.getElementById('pms-timeline-styles')) return;

      const style = document.createElement('style');
      style.id = 'pms-timeline-styles';

      style.textContent = `
        .pms-timeline {
          position: relative;
          padding: 8px 18px 8px 0;
        }

        .pms-timeline:before {
          content: "";
          position: absolute;
          right: 7px;
          top: 14px;
          bottom: 18px;
          width: 2px;
          background: var(--color-border);
        }

        .pms-timeline-item {
          position: relative;
          padding: 0 24px 22px 0;
        }

        .pms-timeline-marker {
          position: absolute;
          right: 0;
          top: 14px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          border: 3px solid var(--color-surface);
          box-shadow: 0 0 0 1px var(--color-border);
          z-index: 1;
        }

        .pms-timeline-card {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 16px;
          background: var(--color-surface);
          box-shadow: var(--shadow-sm);
          min-width: 0;
        }

        .pms-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .pms-timeline-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text);
        }

        .pms-timeline-date {
          margin-top: 5px;
          font-size: 12px;
          color: var(--color-text-muted);
        }

        .pms-timeline-status {
          display: inline-block;
          border-radius: 20px;
          padding: 4px 9px;
          background: var(--color-surface-alt);
          color: var(--color-text);
          font-size: 11px;
        }

        .pms-timeline-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          padding: 12px 0;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }

        .pms-timeline-meta-item,
        .pms-timeline-dynamic-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 100px;
          overflow-wrap: anywhere;
        }

        .pms-timeline-meta-item span,
        .pms-timeline-dynamic-item span {
          color: var(--color-text-muted);
          font-size: 11px;
        }

        .pms-timeline-meta-item strong,
        .pms-timeline-dynamic-item strong {
          color: var(--color-text);
          font-size: 13px;
          font-weight: 600;
        }

        .pms-timeline-description {
          margin-top: 13px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.9;
          color: var(--color-text);
          font-size: 13px;
        }

        .pms-timeline-dynamic {
          margin-top: 15px;
          padding: 12px;
          border-radius: 8px;
          background: var(--color-surface-alt);
        }

        .pms-timeline-dynamic > strong {
          display: block;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .pms-timeline-dynamic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .pms-timeline-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin-top: 14px;
          color: var(--color-text-muted);
          font-size: 11px;
        }

        @media (max-width: 600px) {
          .pms-timeline-card {
            padding: 12px;
          }

          .pms-timeline-header {
            flex-direction: column;
          }

          .pms-timeline-meta {
            gap: 12px;
          }
        }
      `;

      document.head.appendChild(style);
    },

    showContent: function () {
      const content = document.getElementById(
        'project-detail-content'
      );

      const errorBox = document.getElementById(
        'project-detail-error'
      );

      if (content) content.hidden = false;
      if (errorBox) errorBox.hidden = true;
    },

    showError: function (error) {
      const loading = document.getElementById(
        'project-detail-loading'
      );

      const errorBox = document.getElementById(
        'project-detail-error'
      );

      if (loading) loading.hidden = true;
      if (!errorBox) return;

      errorBox.textContent =
        error && error.message
          ? error.message
          : 'خطا در دریافت اطلاعات پروژه.';

      errorBox.hidden = false;
    },

    statusText: function (status) {
      const map = {
        ACTIVE: 'فعال',
        INACTIVE: 'غیرفعال',
        ON_HOLD: 'متوقف',
        COMPLETED: 'تکمیل‌شده',
        CANCELLED: 'لغوشده',
        VOID: 'باطل‌شده',
        DELETED: 'حذف‌شده',
        PENDING: 'در انتظار',
        DRAFT: 'پیش‌نویس',
        SUBMITTED: 'ثبت‌شده',
        APPROVED: 'تأییدشده',
        REJECTED: 'ردشده'
      };

      const custom = this.projectStatuses.find(function (item) {
        return String(item.Code || item.ID || '').toLowerCase() === String(status || '').toLowerCase();
      });
      return (custom && (custom.Name || custom.Code)) || map[String(status || '').toUpperCase()] || status || '-';
    },

    formatDate: function (value) {
      if (!value) return '-';

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
  window.PMS.ProjectDetail = ProjectDetail;
  window.PMS.Modules.ProjectDetail = ProjectDetail;
})();