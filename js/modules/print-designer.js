(function () {
  'use strict';
  const PMS = window.PMS = window.PMS || {};
  const PrintDesigner = {
    templates: [],
    sources: { projectFields: [], informationTypes: [], forms: [] },
    definition: null,
    editingId: '',
    busy: false,
    selectedElementId: '',
    history: [],
    historyIndex: -1,
    dragState: null,
    init: function () {
      const route = String(window.location.hash || '').replace(/^#/, '').split('/')[0];
      if (route === 'print-output') this.initOutput();
      else this.initLibrary();
    },
    extract: function (response) {
      return PMS.Api && typeof PMS.Api.extractData === 'function'
        ? PMS.Api.extractData(response)
        : (response && response.data !== undefined ? response.data : response);
    },
    list: function (value, keys) {
      const data = this.extract(value);
      if (Array.isArray(data)) return data;
      for (const key of (keys || ['items','Items'])) if (data && Array.isArray(data[key])) return data[key];
      return [];
    },
    esc: function (value) {
      return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);
      });
    },
    setStatus: function (id, message, error) {
      const node = document.getElementById(id);
      if (!node) return;
      node.textContent = message || '';
      node.classList.toggle('is-error', !!error);
    },
    blankDefinition: function () {
      return { schemaVersion: 1, page: { size: 'A4', orientation: 'portrait' }, elements: [], bindings: [] };
    },
    pageDimensions: function () {
      const size = document.getElementById('pt-page-size');
      const orientation = document.getElementById('pt-page-orientation');
      const key = size ? size.value : ((this.definition && this.definition.page && this.definition.page.size) || 'A4');
      const dimensions = { A4: [210,297], A5: [148,210], LETTER: [216,279] }[key] || [210,297];
      return orientation && orientation.value === 'landscape'
        ? { width: dimensions[1], height: dimensions[0] }
        : { width: dimensions[0], height: dimensions[1] };
    },
    syncPageControls: function () {
      const page = this.definition && this.definition.page ? this.definition.page : {};
      const size = document.getElementById('pt-page-size');
      const orientation = document.getElementById('pt-page-orientation');
      if (size) size.value = page.size || 'A4';
      if (orientation) orientation.value = page.orientation || 'portrait';
    },
    bindEditor: function () {
      const canvas = document.getElementById('pt-design-canvas');
      if (!canvas || canvas.dataset.bound === '1') return;
      canvas.dataset.bound = '1';
      canvas.addEventListener('click', (event) => {
        const node = event.target.closest('[data-pt-element]');
        if (node) this.selectElement(node.dataset.ptElement);
        else { this.selectedElementId = ''; this.renderEditor(); }
      });
      canvas.addEventListener('pointerdown', (event) => {
        const node = event.target.closest('[data-pt-element]');
        if (!node || event.target.closest('[data-pt-resize]')) return;
        const item = this.getSelectedOrById(node.dataset.ptElement);
        if (!item || item.locked) return;
        const rect = canvas.getBoundingClientRect();
        const dimensions = this.pageDimensions();
        this.dragState = { id: item.id, startX: event.clientX, startY: event.clientY,
          x: Number(item.x || 0), y: Number(item.y || 0),
          scaleX: dimensions.width / rect.width, scaleY: dimensions.width / rect.width };
        this.selectElement(item.id, false);
        event.preventDefault();
      });
      canvas.addEventListener('pointerdown', (event) => {
        const handle = event.target.closest('[data-pt-resize]');
        if (!handle) return;
        const node = handle.closest('[data-pt-element]');
        const item = node && this.getSelectedOrById(node.dataset.ptElement);
        if (!item) return;
        const rect = canvas.getBoundingClientRect();
        const dimensions = this.pageDimensions();
        this.dragState = { id: item.id, resize: true, startX: event.clientX, startY: event.clientY,
          width: Number(item.width || 40), height: Number(item.height || 18),
          scaleX: dimensions.width / rect.width, scaleY: dimensions.width / rect.width };
        this.selectElement(item.id, false);
        event.preventDefault();
      });
      document.addEventListener('pointermove', (event) => {
        if (!this.dragState) return;
        const drag = this.dragState;
        const item = this.getSelectedOrById(drag.id);
        if (!item) return;
        const dx = (event.clientX - drag.startX) * drag.scaleX;
        const dy = (event.clientY - drag.startY) * drag.scaleY;
        if (drag.resize) {
          item.width = Math.max(8, Math.round(drag.width + dx));
          item.height = Math.max(8, Math.round(drag.height + dy));
        } else {
          const dimensions = this.pageDimensions();
          item.x = Math.max(0, Math.min(dimensions.width - Number(item.width || 30), Math.round(drag.x + dx)));
          item.y = Math.max(0, Math.min(dimensions.height - Number(item.height || 15), Math.round(drag.y + dy)));
        }
        this.renderCanvas();
        this.renderInspector();
      });
      document.addEventListener('pointerup', () => {
        if (this.dragState) { this.dragState = null; this.commitHistory(); }
      });
      document.addEventListener('keydown', (event) => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
        const tag = event.target && event.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? this.redo() : this.undo(); }
        if (event.key.toLowerCase() === 'y') { event.preventDefault(); this.redo(); }
      });
      document.querySelectorAll('[data-pt-action]').forEach(button => {
        if (button.dataset.ptBound === '1') return;
        button.dataset.ptBound = '1';
        button.addEventListener('click', () => this.handleEditorAction(button.dataset.ptAction));
      });
      ['pt-prop-text','pt-prop-binding','pt-prop-selection','pt-prop-x','pt-prop-y','pt-prop-width','pt-prop-height','pt-prop-font','pt-prop-align','pt-prop-columns','pt-prop-rows','pt-prop-color','pt-prop-background'].forEach(id => {
        const input = document.getElementById(id);
        if (!input || input.dataset.bound === '1') return;
        input.dataset.bound = '1';
        input.addEventListener('change', () => this.applyInspectorChange(id, input.value));
      });
      ['pt-page-size','pt-page-orientation'].forEach(id => {
        const input = document.getElementById(id);
        if (!input || input.dataset.bound === '1') return;
        input.dataset.bound = '1';
        input.addEventListener('change', () => {
          if (!this.definition) this.definition = this.blankDefinition();
          this.definition.page.size = document.getElementById('pt-page-size').value;
          this.definition.page.orientation = document.getElementById('pt-page-orientation').value;
          this.renderCanvas(); this.commitHistory();
        });
      });
    },
    getSelectedOrById: function (id) {
      const elements = this.definition && Array.isArray(this.definition.elements) ? this.definition.elements : [];
      return elements.find(item => String(item.id) === String(id)) || null;
    },
    createElement: function (type, overrides) {
      if (!this.definition) this.definition = this.blankDefinition();
      const defaults = {
        id: 'el_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7),
        type: type, text: type === 'text' ? 'متن جدید' : (type === 'table' ? 'جدول اطلاعات' : (type === 'image' ? 'جایگاه تصویر' : 'فیلد داده')),
        x: 15, y: 18 + this.definition.elements.length * 8, width: type === 'table' ? 170 : 65,
        height: type === 'table' ? 48 : 18, fontSize: 12, align: 'right', bindingId: '',
        columns: type === 'table' ? ['عنوان','مقدار','توضیحات'] : [], rows: type === 'table' ? [['نمونه ۱','مقدار',''],['نمونه ۲','مقدار','']] : []
      };
      const item = Object.assign(defaults, overrides || {});
      this.definition.elements.push(item);
      this.selectedElementId = item.id;
      this.renderEditor();
      this.commitHistory();
      return item;
    },
    handleEditorAction: function (action) {
      const selected = this.getSelectedOrById(this.selectedElementId);
      if (action === 'add-text') return this.createElement('text');
      if (action === 'add-field') {
        const binding = this.definition && this.definition.bindings && this.definition.bindings[0];
        return this.createElement('field', { text: binding ? (binding.label || binding.id) : 'فیلد داده', bindingId: binding ? binding.id : '' });
      }
      if (action === 'add-table') {
        const binding = this.definition && this.definition.bindings && this.definition.bindings.find(item => item.sourceType === 'EVENT_FORM_RESPONSE' || item.selection === 'ALL');
        return this.createElement('table', { bindingId: binding ? binding.id : '' });
      }
      if (action === 'add-image') return this.createElement('image');
      if (action === 'undo') return this.undo();
      if (action === 'redo') return this.redo();
      if (action === 'remove' && selected) {
        this.definition.elements = this.definition.elements.filter(item => item.id !== selected.id);
        this.selectedElementId = ''; this.renderEditor(); return this.commitHistory();
      }
      if ((action === 'layer-up' || action === 'layer-down') && selected) {
        const list = this.definition.elements;
        const index = list.findIndex(item => item.id === selected.id);
        const target = action === 'layer-up' ? index + 1 : index - 1;
        if (target >= 0 && target < list.length) {
          const swap = list[target]; list[target] = list[index]; list[index] = swap;
          this.renderEditor(); this.commitHistory();
        }
        return;
      }
      if (action === 'duplicate' && selected) {
        const copy = JSON.parse(JSON.stringify(selected));
        copy.id = 'el_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7);
        copy.x = Number(copy.x || 0) + 6; copy.y = Number(copy.y || 0) + 6;
        this.definition.elements.push(copy); this.selectedElementId = copy.id;
        this.renderEditor(); return this.commitHistory();
      }
    },
    selectElement: function (id, render) {
      this.selectedElementId = id || '';
      if (render !== false) this.renderEditor();
      else this.renderInspector();
      this.renderLayers();
    },
    applyInspectorChange: function (id, value) {
      const item = this.getSelectedOrById(this.selectedElementId);
      if (!item) return;
      const map = { 'pt-prop-text':'text','pt-prop-binding':'bindingId','pt-prop-x':'x','pt-prop-y':'y',
        'pt-prop-width':'width','pt-prop-height':'height','pt-prop-font':'fontSize','pt-prop-align':'align','pt-prop-color':'color','pt-prop-background':'background' };
      if (id === 'pt-prop-selection') {
        const source = (this.definition.bindings || []).find(binding => binding.id === item.bindingId);
        if (source && ['EVENT_FORM_FIELD','EVENT_FORM_RESPONSE'].includes(source.sourceType)) source.selection = value;
      } else if (id === 'pt-prop-columns') item.columns = String(value).split('|').map(part => part.trim()).filter(Boolean);
      else if (id === 'pt-prop-rows') item.rows = String(value).split(/\r?\n/).filter(line => line.trim()).map(line => line.split('|').map(part => part.trim()));
      else {
        const key = map[id];
        if (!key) return;
        item[key] = ['x','y','width','height','fontSize'].includes(key) ? Number(value) : value;
      }
      this.renderCanvas(); this.renderLayers(); this.commitHistory();
    },
    renderInspector: function () {
      const item = this.getSelectedOrById(this.selectedElementId);
      const empty = document.getElementById('pt-inspector-empty');
      const fields = document.getElementById('pt-inspector-fields');
      if (empty) empty.hidden = !!item;
      if (fields) fields.hidden = !item;
      if (!item) return;
      const values = { 'pt-prop-text':item.text || '', 'pt-prop-binding':item.bindingId || '',
        'pt-prop-x':item.x || 0, 'pt-prop-y':item.y || 0, 'pt-prop-width':item.width || 30,
        'pt-prop-height':item.height || 15, 'pt-prop-font':item.fontSize || 12, 'pt-prop-align':item.align || 'right', 'pt-prop-color':item.color || '#1f2937', 'pt-prop-background':item.background || '#ffffff' };
      Object.keys(values).forEach(id => { const node = document.getElementById(id); if (node && document.activeElement !== node) node.value = values[id]; });
      const binding = document.getElementById('pt-prop-binding');
      if (binding) {
        binding.innerHTML = '<option value="">بدون اتصال</option>' + ((this.definition && this.definition.bindings) || []).map(source =>
          '<option value="' + this.esc(source.id) + '">' + this.esc(source.label || source.id) + '</option>').join('');
        binding.value = item.bindingId || '';
      }
      const tableProperties = document.getElementById('pt-table-properties');
      if (tableProperties) tableProperties.hidden = item.type !== 'table';
      const selectionWrap = document.getElementById('pt-selection-wrap');
      const selectedBinding = (this.definition.bindings || []).find(source => source.id === item.bindingId);
      const supportsSelection = selectedBinding && ['EVENT_FORM_FIELD','EVENT_FORM_RESPONSE'].includes(selectedBinding.sourceType);
      if (selectionWrap) selectionWrap.hidden = !supportsSelection;
      const selectionInput = document.getElementById('pt-prop-selection');
      if (selectionInput && supportsSelection) selectionInput.value = selectedBinding.selection || 'LATEST';
      const columns = document.getElementById('pt-prop-columns');
      const rows = document.getElementById('pt-prop-rows');
      if (columns) columns.value = (item.columns || []).join(' | ');
      if (rows) rows.value = (item.rows || []).map(row => row.join(' | ')).join('\n');
    },
    renderCanvas: function () {
      const canvas = document.getElementById('pt-design-canvas');
      if (!canvas) return;
      if (!this.definition) this.definition = this.blankDefinition();
      const dimensions = this.pageDimensions();
      canvas.style.width = dimensions.width + 'mm';
      canvas.style.minHeight = dimensions.height + 'mm';
      canvas.style.aspectRatio = dimensions.width + ' / ' + dimensions.height;
      const elements = this.definition.elements || [];
      canvas.innerHTML = elements.length ? elements.map(item => {
        const style = 'left:' + Number(item.x || 0) + 'mm;top:' + Number(item.y || 0) + 'mm;width:' + Number(item.width || 30) +
          'mm;height:' + Number(item.height || 15) + 'mm;font-size:' + Number(item.fontSize || 12) + 'pt;text-align:' + this.esc(item.align || 'right');
        const selected = String(item.id) === String(this.selectedElementId) ? ' is-selected' : '';
        const label = item.type === 'image' ? '<span class="pt-image-placeholder">▧ تصویر</span>' :
          (item.type === 'table' ? '<strong>' + this.esc(item.text) + '</strong><table><thead><tr>' +
            (item.columns || []).map(col => '<th>' + this.esc(col) + '</th>').join('') + '</tr></thead><tbody>' +
            (item.rows || []).map(row => '<tr>' + row.map(cell => '<td>' + this.esc(cell) + '</td>').join('') + '</tr>').join('') +
            '</tbody></table>' : this.esc(item.text || ''));
        return '<div class="pt-canvas-element pt-element-' + this.esc(item.type) + selected + '" data-pt-element="' + this.esc(item.id) +
          '" style="' + style + '"><div class="pt-element-content">' + label + '</div>' +
          (selected ? '<button type="button" data-pt-resize aria-label="تغییر اندازه"></button>' : '') + '</div>';
      }).join('') : '<div class="pt-canvas-empty">برای شروع، از نوار ابزار یک المان اضافه کن.</div>';
    },
    renderLayers: function () {
      const root = document.getElementById('pt-layer-list');
      if (!root) return;
      const elements = (this.definition && this.definition.elements) || [];
      root.innerHTML = elements.length ? elements.map(item => '<button type="button" class="pt-layer-item ' +
        (String(item.id) === String(this.selectedElementId) ? 'is-active' : '') + '" data-pt-layer="' + this.esc(item.id) + '">' +
        this.esc(item.text || item.type) + '</button>').join('') : '<p class="text-muted">هنوز المانی وجود ندارد.</p>';
      root.querySelectorAll('[data-pt-layer]').forEach(button => button.addEventListener('click', () => this.selectElement(button.dataset.ptLayer)));
    },
    renderEditor: function () {
      this.syncPageControls();
      this.renderCanvas(); this.renderInspector(); this.renderLayers();
    },
    commitHistory: function () {
      if (!this.definition) return;
      const snapshot = JSON.stringify(this.definition);
      if (this.history[this.historyIndex] === snapshot) return;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(snapshot);
      if (this.history.length > 60) this.history.shift();
      this.historyIndex = this.history.length - 1;
      this.setStatus('pt-editor-status', 'تغییرات طراحی ثبت شد؛ برای ماندگاری، قالب را ذخیره کن.');
    },
    restoreHistory: function (index) {
      if (index < 0 || index >= this.history.length) return;
      this.historyIndex = index;
      this.definition = JSON.parse(this.history[index]);
      this.renderEditor();
    },
    undo: function () { this.restoreHistory(this.historyIndex - 1); },
    redo: function () { this.restoreHistory(this.historyIndex + 1); },
    initLibrary: async function () {
      const form = document.getElementById('pt-template-form');
      if (form) form.addEventListener('submit', (event) => { event.preventDefault(); this.saveTemplate(); });
      const reset = document.getElementById('pt-template-reset');
      if (reset) reset.addEventListener('click', () => this.resetForm());
      const resetSecondary = document.getElementById('pt-template-reset-secondary');
      if (resetSecondary) resetSecondary.addEventListener('click', () => this.resetForm());
      this.bindEditor();
      await this.loadLibrary();
      this.syncPageControls();
      this.renderEditor();
    },
    loadLibrary: async function () {
      this.setStatus('pt-library-status', 'در حال دریافت کتابخانه قالب‌ها و منابع داده…');
      try {
        const results = await Promise.all([
          PMS.Api.get('/print-templates'),
          PMS.Api.get('/print-templates/sources')
        ]);
        this.templates = this.list(results[0]);
        this.sources = this.extract(results[1]) || { projectFields: [], informationTypes: [], forms: [] };
        this.renderLibrary();
        this.setStatus('pt-library-status', this.templates.length ? this.templates.length + ' قالب در کتابخانه وجود دارد.' : 'هنوز قالبی ساخته نشده است.');
      } catch (error) {
        this.setStatus('pt-library-status', error.message || 'دریافت کتابخانه قالب‌ها ناموفق بود.', true);
      }
    },
    renderLibrary: function () {
      const list = document.getElementById('pt-template-list');
      if (list) {
        list.innerHTML = this.templates.length ? this.templates.map((item) =>
          '<article class="pt-template-card"><div class="pt-template-card-main"><strong>' + this.esc(item.Name) +
          '</strong><span class="pt-template-code">' + this.esc(item.Code) + '</span><p>' +
          this.esc(item.Description || 'بدون توضیحات') + '</p><small>نسخه ' + this.esc(item.Version || 1) +
          ' · ' + ((item.Definition && item.Definition.bindings) || []).length + ' منبع داده</small></div>' +
          '<div class="pt-template-actions"><button type="button" class="btn btn-secondary" data-pt-edit="' + this.esc(item.ID) + '">ویرایش مشخصات</button>' +
          '<button type="button" class="btn btn-danger" data-pt-delete="' + this.esc(item.ID) + '">غیرفعال‌سازی</button></div></article>'
        ).join('') : '<div class="pt-empty-state">قالبی ثبت نشده است. اولین قالب را از فرم زیر ایجاد کن.</div>';
        list.querySelectorAll('[data-pt-edit]').forEach(button => button.addEventListener('click', () => this.editTemplate(button.dataset.ptEdit)));
        list.querySelectorAll('[data-pt-delete]').forEach(button => button.addEventListener('click', () => this.deleteTemplate(button.dataset.ptDelete)));
      }
      this.renderSources();
      this.renderBindings();
    },
    renderSources: function () {
      const root = document.getElementById('pt-source-list');
      if (!root) return;
      const groups = [];
      (this.sources.projectFields || []).forEach(source => groups.push({
        key: 'project|' + source.field, label: source.label, detail: 'اطلاعات پایه پروژه',
        binding: { id: 'project_' + source.field, sourceType: 'PROJECT_FIELD', field: source.field }
      }));
      (this.sources.informationTypes || []).forEach(source => groups.push({
        key: 'info|' + source.ID, label: source.Name, detail: 'اطلاعات مرکزی · ' + source.Code,
        binding: { id: 'info_' + source.ID, sourceType: 'PROJECT_INFORMATION', informationTypeId: source.ID }
      }));
      (this.sources.forms || []).forEach(form => (form.Fields || []).forEach(field => groups.push({
        key: 'form|' + form.ID + '|' + field.ID, label: field.Name,
        detail: 'فرم ' + form.Name + ' · ' + field.Code,
        binding: { id: 'form_' + form.ID + '_' + field.ID, sourceType: 'EVENT_FORM_FIELD',
          formId: form.ID, fieldId: field.ID, informationTypeId: field.InformationTypeID, selection: 'LATEST' }
      })));
      root.innerHTML = groups.length ? groups.map((item, index) =>
        '<div class="pt-source-row"><div><strong>' + this.esc(item.label) + '</strong><small>' + this.esc(item.detail) +
        '</small></div><button type="button" class="btn btn-secondary btn-sm" data-pt-add-source="' + index + '">افزودن</button></div>'
      ).join('') : '<p class="pt-empty-state">منبع داده فعالی پیدا نشد.</p>';
      root.querySelectorAll('[data-pt-add-source]').forEach(button => button.addEventListener('click', () => {
        const index = Number(button.dataset.ptAddSource);
        const item = groups[index];
        if (item) this.addBinding(item.binding, item.label);
      }));
    },
    addBinding: function (binding, label) {
      if (!this.definition) this.definition = this.blankDefinition();
      if (this.definition.bindings.some(item => item.id === binding.id)) {
        this.setStatus('pt-form-status', 'این منبع قبلاً به قالب اضافه شده است.');
        return;
      }
      this.definition.bindings.push(Object.assign({}, binding, { label: label }));
      this.renderBindings(); this.renderInspector(); this.commitHistory();
      this.setStatus('pt-form-status', 'منبع داده به قالب اضافه شد؛ پس از ذخیره در قالب باقی می‌ماند.');
    },
    renderBindings: function () {
      const root = document.getElementById('pt-binding-list');
      if (!root) return;
      const bindings = this.definition && Array.isArray(this.definition.bindings) ? this.definition.bindings : [];
      root.innerHTML = bindings.length ? bindings.map((item, index) =>
        '<div class="pt-binding-row"><div><strong>' + this.esc(item.label || item.id) +
        '</strong><small>' + this.esc(item.sourceType) + '</small></div><button type="button" class="btn btn-quiet btn-sm" data-pt-remove-binding="' +
        index + '" aria-label="حذف منبع">حذف</button></div>'
      ).join('') : '<p class="pt-empty-state">هنوز منبع داده‌ای انتخاب نشده است.</p>';
      root.querySelectorAll('[data-pt-remove-binding]').forEach(button => button.addEventListener('click', () => {
        const removed = this.definition.bindings.splice(Number(button.dataset.ptRemoveBinding), 1)[0];
        if (removed) this.definition.elements.forEach(element => {
          if (element.bindingId === removed.id) element.bindingId = '';
        });
        this.renderBindings(); this.renderEditor(); this.commitHistory();
      }));
    },
    resetForm: function () {
      const form = document.getElementById('pt-template-form');
      if (form) form.reset();
      this.editingId = '';
      this.definition = this.blankDefinition();
      this.history = []; this.historyIndex = -1; this.selectedElementId = '';
      const code = document.getElementById('pt-template-code');
      if (code) code.disabled = false;
      const title = document.getElementById('pt-editor-title');
      if (title) title.textContent = 'ساخت قالب جدید';
      this.renderBindings(); this.renderEditor(); this.commitHistory();
      this.setStatus('pt-form-status', '');
    },
    editTemplate: async function (id) {
      try {
        const response = await PMS.Api.get('/print-templates/' + encodeURIComponent(id));
        const item = this.extract(response);
        this.editingId = item.ID;
        this.definition = item.Definition || this.blankDefinition();
        this.history = []; this.historyIndex = -1; this.selectedElementId = '';
        document.getElementById('pt-template-code').value = item.Code || '';
        document.getElementById('pt-template-code').disabled = true;
        document.getElementById('pt-template-name').value = item.Name || '';
        document.getElementById('pt-template-description').value = item.Description || '';
        const title = document.getElementById('pt-editor-title');
        if (title) title.textContent = 'ویرایش قالب: ' + item.Name;
        this.renderBindings();
        this.renderEditor();
        this.commitHistory();
        document.getElementById('pt-template-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        this.setStatus('pt-library-status', error.message || 'دریافت قالب ناموفق بود.', true);
      }
    },
    saveTemplate: async function () {
      if (this.busy) return;
      const form = document.getElementById('pt-template-form');
      if (!form) return;
      const body = {
        Code: document.getElementById('pt-template-code').value.trim(),
        Name: document.getElementById('pt-template-name').value.trim(),
        Description: document.getElementById('pt-template-description').value.trim(),
        Definition: this.definition || this.blankDefinition()
      };
      this.busy = true;
      this.setStatus('pt-form-status', 'در حال ذخیره قالب…');
      try {
        if (this.editingId) await PMS.Api.put('/print-templates/' + encodeURIComponent(this.editingId), body);
        else await PMS.Api.post('/print-templates', body);
        this.resetForm();
        await this.loadLibrary();
        this.setStatus('pt-library-status', 'قالب با موفقیت ذخیره شد.');
      } catch (error) {
        this.setStatus('pt-form-status', error.message || 'ذخیره قالب ناموفق بود.', true);
      } finally { this.busy = false; }
    },
    deleteTemplate: async function (id) {
      const item = this.templates.find(row => String(row.ID) === String(id));
      if (!item || !window.confirm('قالب «' + item.Name + '» غیرفعال شود؟')) return;
      try {
        await PMS.Api.delete('/print-templates/' + encodeURIComponent(id));
        await this.loadLibrary();
        this.setStatus('pt-library-status', 'قالب غیرفعال شد.');
      } catch (error) {
        this.setStatus('pt-library-status', error.message || 'غیرفعال‌سازی قالب ناموفق بود.', true);
      }
    },
    initOutput: async function () {
      const button = document.getElementById('pt-output-resolve');
      if (button) button.addEventListener('click', () => this.resolveOutput());
      await this.loadOutputOptions();
    },
    loadOutputOptions: async function () {
      this.setStatus('pt-output-status', 'در حال دریافت قالب‌ها و پروژه‌ها…');
      try {
        const results = await Promise.all([PMS.Api.get('/print-templates'), PMS.Api.get('/projects')]);
        const templates = this.list(results[0]);
        const projects = this.list(results[1], ['items','Items','projects','Projects']);
        const templateSelect = document.getElementById('pt-output-template');
        const projectSelect = document.getElementById('pt-output-project');
        if (templateSelect) templateSelect.innerHTML = '<option value="">انتخاب قالب</option>' + templates.map(item =>
          '<option value="' + this.esc(item.ID) + '">' + this.esc(item.Name) + ' · نسخه ' + this.esc(item.Version || 1) + '</option>'
        ).join('');
        if (projectSelect) projectSelect.innerHTML = '<option value="">انتخاب پروژه</option>' + projects.map(item =>
          '<option value="' + this.esc(item.ID) + '">' + this.esc(item.ProjectCode || item.Code || 'بدون کد') + ' — ' +
          this.esc(item.Title || item.Name || item.ID) + '</option>'
        ).join('');
        this.setStatus('pt-output-status', 'قالب و پروژه را انتخاب کن تا داده‌های همان پروژه برای قالب آماده شود.');
      } catch (error) {
        this.setStatus('pt-output-status', error.message || 'دریافت فهرست‌ها ناموفق بود.', true);
      }
    },
    resolveOutput: async function () {
      const templateId = document.getElementById('pt-output-template').value;
      const projectId = document.getElementById('pt-output-project').value;
      if (!templateId || !projectId) {
        this.setStatus('pt-output-status', 'انتخاب قالب و پروژه الزامی است.', true);
        return;
      }
      const button = document.getElementById('pt-output-resolve');
      if (button) button.disabled = true;
      this.setStatus('pt-output-status', 'در حال دریافت اطلاعات پروژه و پاسخ فرم‌ها…');
      try {
        const response = await PMS.Api.post('/print-templates/' + encodeURIComponent(templateId) + '/resolve', { ProjectID: projectId });
        const result = this.extract(response) || {};
        const root = document.getElementById('pt-output-data');
        const data = result.data || {};
        const keys = Object.keys(data);
        if (root) root.innerHTML = keys.length ? '<div class="pt-resolved-summary"><strong>' +
          this.esc(result.template && result.template.Name) + '</strong><span>' +
          this.esc(result.project && result.project.Title) + '</span></div><div class="pt-resolved-list">' +
          keys.map(key => '<div class="pt-resolved-row"><strong>' + this.esc(key) + '</strong><pre>' +
            this.esc(typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key], null, 2)) +
            '</pre></div>').join('') + '</div>' : '<div class="pt-empty-state">این قالب هنوز منبع داده‌ای ندارد. ابتدا از بخش طراحی قالب منابع را به آن اضافه کن.</div>';
        this.setStatus('pt-output-status', 'داده‌های قالب با موفقیت از پروژه انتخاب‌شده بازیابی شدند.');
      } catch (error) {
        this.setStatus('pt-output-status', error.message || 'آماده‌سازی داده سند ناموفق بود.', true);
      } finally { if (button) button.disabled = false; }
    }
  };
  PMS.Modules = PMS.Modules || {};
  PMS.Modules.PrintDesigner = PrintDesigner;
})();