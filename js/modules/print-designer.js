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
    previewMode: false,
    outputPageSpec: { width: 210, height: 297 },
    wordLibraryPromise: null,
    init: function () {
      // صفحه به‌صورت HTML پویا بارگذاری می‌شود؛ تشخیص بر اساس DOM از وابستگی
      // به نام/شکل hash جلوگیری می‌کند و مانع اجرای initializer اشتباه می‌شود.
      if (document.getElementById('pt-output-template') &&
          document.getElementById('pt-output-project')) {
        return this.initOutput();
      }
      if (document.getElementById('pt-template-reset') &&
          document.getElementById('pt-template-form')) {
        return this.initLibrary();
      }
      console.warn('PrintDesigner: عناصر صفحه قالب‌ساز یا چاپ اسناد پیدا نشدند.');
    },
    extract: function (response) {
      let value = PMS.Api && typeof PMS.Api.extractData === 'function'
        ? PMS.Api.extractData(response)
        : response;
      // بعضی نسخه‌های قدیمی پاسخ را دوبار داخل data قرار می‌دهند.
      for (let depth = 0; depth < 3; depth += 1) {
        if (!value || Array.isArray(value) || typeof value !== 'object') break;
        if (value.success === false) {
          const message = value.error && value.error.message ? value.error.message : 'دریافت اطلاعات ناموفق بود.';
          throw new Error(message);
        }
        if (Object.prototype.hasOwnProperty.call(value, 'data') &&
            (Object.keys(value).length === 1 || value.success === true || value.success === undefined)) {
          value = value.data;
          continue;
        }
        break;
      }
      return value;
    },
    list: function (value, keys) {
      const data = this.extract(value);
      if (Array.isArray(data)) return data;
      const candidates = (keys || ['items','Items','templates','Templates','projects','Projects','rows','Rows','records','Records']);
      for (const key of candidates) {
        if (data && Array.isArray(data[key])) return data[key];
      }
      if (data && typeof data === 'object') {
        const match = Object.keys(data).find(key =>
          /^(items|templates|projects|rows|records)$/i.test(key) && Array.isArray(data[key]));
        if (match) return data[match];
      }
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
        if (node) {
          if (event.target.closest('[contenteditable="true"]')) {
            this.selectElement(node.dataset.ptElement, false);
            return;
          }
          this.selectElement(node.dataset.ptElement);
        } else { this.selectedElementId = ''; this.renderEditor(); }
      });
      canvas.addEventListener('pointerdown', (event) => {
        if (event.target.closest('[contenteditable="true"]')) return;
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
      const shapeTypes = ['line','divider','rectangle','ellipse'];
      const defaults = {
        id: 'el_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7),
        type: type, text: type === 'text' ? 'متن جدید' : (type === 'table' ? 'جدول اطلاعات' : (type === 'image' ? 'جایگاه تصویر' : (shapeTypes.includes(type) ? '' : 'فیلد داده'))),
        x: 15, y: 18 + this.definition.elements.length * 8, width: type === 'table' ? 170 : (type === 'line' || type === 'divider' ? 100 : 65),
        height: type === 'line' || type === 'divider' ? 1 : (type === 'table' ? 48 : (type === 'rectangle' || type === 'ellipse' ? 35 : 18)), fontSize: 12, align: 'right', bindingId: '',
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
      if (action === 'add-line') return this.createElement('line', { text: '' });
      if (action === 'add-divider') return this.createElement('divider', { text: '' });
      if (action === 'add-rectangle') return this.createElement('rectangle', { text: '' });
      if (action === 'add-ellipse') return this.createElement('ellipse', { text: '' });
      if (action === 'undo') return this.undo();
      if (action === 'redo') return this.redo();
      if (action === 'preview') {
        this.previewMode = !this.previewMode;
        const workspace = document.getElementById('pt-editor-workspace');
        const button = document.querySelector('[data-pt-action="preview"]');
        if (workspace) workspace.classList.toggle('pt-preview-mode', this.previewMode);
        if (button) button.textContent = this.previewMode ? 'بازگشت به ویرایش' : 'پیش‌نمایش';
        this.setStatus('pt-editor-status', this.previewMode ? 'پیش‌نمایش چیدمان نمونه؛ داده‌های واقعی هنگام انتخاب پروژه در بخش چاپ بازیابی می‌شوند.' : 'به محیط ویرایش برگشتی.');
        return;
      }
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
      const wordDocument = elements.find(item => item.type === 'worddocument');
      if (wordDocument) {
        canvas.classList.add('pt-word-document-canvas');
        canvas.style.width = 'auto'; canvas.style.minHeight = '0'; canvas.style.aspectRatio = 'auto';
        canvas.innerHTML = '<style>' + (wordDocument.css || '') + '</style><div class="pt-word-document" data-pt-element="' + this.esc(wordDocument.id) + '" contenteditable="true" spellcheck="true">' + this.sanitizeImportedHtml(wordDocument.html || '') + '</div>';
        const editor = canvas.querySelector('.pt-word-document[contenteditable="true"]');
        if (editor && editor.dataset.bound !== '1') {
          editor.dataset.bound = '1';
          editor.addEventListener('input', () => { wordDocument.html = this.sanitizeImportedHtml(editor.innerHTML); });
          editor.addEventListener('blur', () => { wordDocument.html = this.sanitizeImportedHtml(editor.innerHTML); this.commitHistory(); });
        }
        return;
      }
      canvas.classList.remove('pt-word-document-canvas');
      canvas.innerHTML = elements.length ? elements.map(item => {
        const style = 'left:' + Number(item.x || 0) + 'mm;top:' + Number(item.y || 0) + 'mm;width:' + Number(item.width || 30) +
          'mm;height:' + Number(item.height || 15) + 'mm;font-size:' + Number(item.fontSize || 12) + 'pt;text-align:' + this.esc(item.align || 'right') + ';color:' + this.esc(item.color || 'black') + ';background:' + this.esc(item.background || 'transparent');
        const selected = String(item.id) === String(this.selectedElementId) ? ' is-selected' : '';
        const label = item.type === 'richtext'
          ? '<div class="pt-richtext-editor" contenteditable="true" spellcheck="true" data-pt-richtext="' + this.esc(item.id) + '">' + this.sanitizeImportedHtml(item.html || '') + '</div>'
          : (item.type === 'line' || item.type === 'divider' ? '<span class="pt-shape-line" aria-hidden="true"></span>' :
          (item.type === 'rectangle' || item.type === 'ellipse' ? '<span class="pt-shape-outline" aria-hidden="true"></span>' :
          (item.type === 'image' ? '<span class="pt-image-placeholder">▧ تصویر</span>' :
          (item.type === 'table' ? '<strong>' + this.esc(item.text) + '</strong><table><thead><tr>' +
            (item.columns || []).map(col => '<th>' + this.esc(col) + '</th>').join('') + '</tr></thead><tbody>' +
            (item.rows || []).map(row => '<tr>' + row.map(cell => '<td>' + this.esc(cell) + '</td>').join('') + '</tr>').join('') +
            '</tbody></table>' : this.esc(item.text || '')))));
        return '<div class="pt-canvas-element/ pt-element-' + this.esc(item.type) + selected + '" data-pt-element="' + this.esc(item.id) +
          '" style="' + style + '"><div class="pt-element-content">' + label + '</div>' +
          (selected ? '<button type="button" data-pt-resize aria-label="تغییر اندازه"></button>' : '') + '</div>';
      }).join('') : '<div class="pt-canvas-empty">برای شروع، از نوار ابزار یک المان اضافه کن.</div>';
      canvas.querySelectorAll('[data-pt-richtext]').forEach(editor => {
        if (editor.dataset.bound === '1') return;
        editor.dataset.bound = '1';
        editor.addEventListener('input', () => {
          const item = this.getSelectedOrById(editor.dataset.ptRichtext);
          if (item) item.html = this.sanitizeImportedHtml(editor.innerHTML);
        });
        editor.addEventListener('blur', () => {
          const item = this.getSelectedOrById(editor.dataset.ptRichtext);
          if (item) { item.html = this.sanitizeImportedHtml(editor.innerHTML); this.commitHistory(); }
        });
      });
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
    sanitizeImportedHtml: function (html) {
      const parser = new DOMParser();
      const documentNode = parser.parseFromString(String(html || ''), 'text/html');
      const allowed = new Set(['P','DIV','SECTION','ARTICLE','BR','STRONG','B','EM','I','U','S','SPAN','H1','H2','H3','H4','UL','OL','LI','TABLE','COLGROUP','COL','THEAD','TBODY','TFOOT','TR','TH','TD','IMG','BLOCKQUOTE']);
      const styleProperties = new Set(['color','background-color','font-family','font-size','font-weight','font-style','text-decoration','text-align','direction','width','height','min-width','max-width','min-height','border','border-top','border-right','border-bottom','border-left','border-color','border-style','border-width','border-collapse','padding','padding-left','padding-right','padding-top','padding-bottom','vertical-align','margin','margin-left','margin-right','margin-top','margin-bottom','line-height','text-indent','white-space','display','box-sizing','list-style-type','table-layout']);
      Array.from(documentNode.body.querySelectorAll('*')).forEach(node => {
        if (!allowed.has(node.tagName)) { node.replaceWith(...Array.from(node.childNodes)); return; }
        Array.from(node.attributes).forEach(attribute => {
          const name = attribute.name.toLowerCase();
          if (name === 'style') {
            const safe = [];
            attribute.value.split(';').forEach(rule => {
              const separator = rule.indexOf(':'); if (separator < 1) return;
              const property = rule.slice(0, separator).trim().toLowerCase();
              const value = rule.slice(separator + 1).trim();
              if (styleProperties.has(property) && value.length < 160 && !/(url\s*\(|expression\s*\(|javascript:|[{}])/i.test(value)) safe.push(property + ':' + value);
            });
            if (safe.length) node.setAttribute('style', safe.join(';')); else node.removeAttribute('style');
          } else if (name === 'class') {
            const classes = attribute.value.split(/\s+/).filter(token => /^[a-zA-Z_][a-zA-Z0-9_-]{0,60}$/.test(token));
            if (classes.length) node.setAttribute('class', classes.join(' ')); else node.removeAttribute('class');
          } else if (node.tagName === 'IMG' && name === 'src') {
            if (!/^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(attribute.value)) node.removeAttribute(name);
          } else if (!((node.tagName === 'IMG' && name === 'alt') || ((node.tagName === 'TH' || node.tagName === 'TD') && ['colspan','rowspan','width','span'].includes(name)))) node.removeAttribute(name);
        });
      });
      return documentNode.body.innerHTML;
    },
    sanitizeWordCss: function (css) {
      const allowed = new Set(['color','background-color','font-family','font-size','font-weight','font-style','text-decoration','text-align','direction','width','height','min-width','max-width','min-height','border','border-top','border-right','border-bottom','border-left','border-color','border-style','border-width','border-collapse','padding','padding-left','padding-right','padding-top','padding-bottom','vertical-align','margin','margin-left','margin-right','margin-top','margin-bottom','line-height','text-indent','white-space','display','box-sizing','list-style-type','table-layout']);
      return String(css || '').replace(/<\/?style[^>]*>/gi,'').split('}').map(rule => {
        const parts = rule.split('{');
        if (parts.length !== 2 || parts[0].length > 500 || /[@<>]|url\s*\(|expression|javascript:/i.test(parts[0])) return '';
        const selectors = parts[0].split(',').map(selector => selector.trim()).filter(selector => /^[.#a-zA-Z0-9_ >+~:-]+$/.test(selector));
        const declarations = parts[1].split(';').map(entry => {
          const pair = entry.split(':'); if (pair.length < 2) return '';
          const property = pair.shift().trim().toLowerCase(), value = pair.join(':').trim();
          return allowed.has(property) && value.length < 160 && !/[{}<>]|url\s*\(|expression|javascript:/i.test(value) ? property + ':' + value : '';
        }).filter(Boolean);
        return selectors.length && declarations.length ? '.pt-word-document ' + selectors.join(', .pt-word-document ') + '{' + declarations.join(';') + '}' : '';
      }).filter(Boolean).join('\n');
    },
    loadWordScript: function (url, globalName, validator) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
          const value = window[globalName];
          if (validator(value)) resolve(value);
          else reject(new Error('کتابخانه ' + globalName + ' بارگذاری شد اما API موردنیاز آن در دسترس نیست.'));
        };
        script.onerror = () => reject(new Error('دریافت کتابخانه ' + globalName + ' از سرور ناموفق بود.'));
        document.head.appendChild(script);
      });
    },
    ensureWordLibraries: function () {
      if (this.wordLibraryPromise) return this.wordLibraryPromise;
      this.wordLibraryPromise = (async () => {
        const validZip = value => !!value && typeof value.loadAsync === 'function';
        const validDocx = value => !!value && typeof value.renderAsync === 'function';
        if (!validZip(window.JSZip)) {
          try {
            await this.loadWordScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'JSZip', validZip);
          } catch (primaryError) {
            await this.loadWordScript('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js', 'JSZip', validZip);
          }
        }
        if (!validZip(window.JSZip)) throw new Error('کتابخانه بازکردن فایل DOCX (JSZip) در دسترس نیست.');
        if (!validDocx(window.docx)) {
          try {
            await this.loadWordScript('https://cdn.jsdelivr.net/npm/docx-preview@0.3.6/dist/docx-preview.min.js', 'docx', validDocx);
          } catch (primaryError) {
            await this.loadWordScript('https://unpkg.com/docx-preview@0.3.6/dist/docx-preview.min.js', 'docx', validDocx);
          }
        }
        if (!validDocx(window.docx)) throw new Error('موتور نمایش Word بارگذاری نشد.');
        return true;
      })().catch(error => {
        this.wordLibraryPromise = null;
        throw error;
      });
      return this.wordLibraryPromise;
    },
    importWordDocument: async function (file) {
      if (!file || !/\.docx$/i.test(file.name || '')) throw new Error('فقط فایل Word با پسوند DOCX قابل واردسازی است.');
      if (file.size > 5 * 1024 * 1024) throw new Error('حجم فایل Word نباید بیشتر از ۵ مگابایت باشد.');
      await this.ensureWordLibraries();
      const next = this.definition || this.blankDefinition();
      if (next.elements.length && !window.confirm('محتوای فعلی بوم با سند Word جایگزین شود؟')) return;
      this.setStatus('pt-editor-status', 'در حال بازسازی صفحات و جدول‌های فایل Word…');
      const host = document.createElement('div'), styleHost = document.createElement('div');
      await window.docx.renderAsync(await file.arrayBuffer(), host, styleHost, {
        className: 'docx', inWrapper: true, ignoreWidth: false, ignoreHeight: false,
        ignoreFonts: false, breakPages: true, ignoreLastRenderedPageBreak: false, renderHeaders: true, renderFooters: true,
        renderFootnotes: true, renderEndnotes: true, useBase64URL: true
      });
      const html = this.sanitizeImportedHtml(host.innerHTML);
      const css = this.sanitizeWordCss(styleHost.innerHTML);
      const pageNodes = host.querySelectorAll('.docx-wrapper > .docx, .docx-wrapper section.docx, section.docx, .docx');
      const pageCount = Math.max(1, pageNodes.length);
      if (!html || !html.replace(/<[^>]*>/g, '').trim()) throw new Error('محتوای قابل نمایش در فایل Word پیدا نشد.');
      const imported = { id: 'word_' + Date.now().toString(36), type: 'worddocument',
        text: file.name.replace(/\.docx$/i, ''), html: html, css: css, pageCount: pageCount, sourceName: file.name, bindingId: '' };
      const candidate = Object.assign({}, next, { elements: [imported] });
      if (JSON.stringify(candidate).length > 42000) throw new Error('حجم ساختار تبدیل‌شده از ظرفیت ذخیره قالب بیشتر است. لطفاً فایل Word را سبک‌تر و تصاویر آن را کم‌حجم کن.');
      this.definition = candidate; this.selectedElementId = imported.id;
      this.history = []; this.historyIndex = -1;
      this.renderEditor(); this.renderBindings(); this.commitHistory();
      this.setStatus('pt-editor-status', 'سند Word به ' + pageCount + ' صفحه تبدیل شد؛ متن‌ها در صفحات قابل ویرایش‌اند.');
    },
    initLibrary: async function () {
      const form = document.getElementById('pt-template-form');
      if (form) form.addEventListener('submit', (event) => { event.preventDefault(); this.saveTemplate(); });
      const reset = document.getElementById('pt-template-reset');
      if (reset && reset.dataset.ptBound !== '1') { reset.dataset.ptBound = '1'; reset.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); this.resetForm(); const formNode = document.getElementById('pt-template-form'); if (formNode) formNode.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); }
      const resetSecondary = document.getElementById('pt-template-reset-secondary');
      if (resetSecondary && resetSecondary.dataset.ptBound !== '1') {
        resetSecondary.dataset.ptBound = '1';
        resetSecondary.addEventListener('click', () => this.resetForm());
      }
      this.bindEditor();
      const wordInput = document.getElementById('pt-word-import-file');
      const wordButton = document.getElementById('pt-word-import');
      if (wordButton && wordInput && wordButton.dataset.ptBound !== '1') {
        wordButton.dataset.ptBound = '1';
        wordButton.addEventListener('click', (event) => {
        event.preventDefault();
        try {
          if (typeof wordInput.showPicker === 'function') wordInput.showPicker();
          else wordInput.click();
        } catch (pickerError) {
          wordInput.click();
        }
        });
      }
      if (wordInput && wordInput.dataset.ptBound !== '1') {
        wordInput.dataset.ptBound = '1';
        wordInput.addEventListener('change', async () => {
        const file = wordInput.files && wordInput.files[0];
        try { await this.importWordDocument(file); }
        catch (error) { this.setStatus('pt-editor-status', error.message || 'واردسازی Word ناموفق بود.', true); }
        finally { wordInput.value = ''; }
        });
      }
      this.syncPageControls();
      this.renderEditor();
      await this.loadLibrary();
    },
    loadLibrary: async function () {
      this.templates = Array.isArray(this.templates) ? this.templates : [];
      this.sources = this.sources || { projectFields: [], informationTypes: [], forms: [] };
      this.setStatus('pt-library-status', 'در حال دریافت کتابخانه قالب‌ها…');
      this.setStatus('pt-source-count', 'در حال دریافت منابع…');
      const results = await Promise.allSettled([
        PMS.Api.get('/print-templates'),
        PMS.Api.get('/print-templates/sources')
      ]);
      if (results[0].status === 'fulfilled') {
        try {
          this.templates = this.list(results[0].value, ['items','Items','templates','Templates','TemplatesList']);
          this.renderLibrary();
          this.setStatus('pt-library-status', this.templates.length ? this.templates.length + ' قالب در کتابخانه وجود دارد.' : 'هنوز قالبی ساخته نشده است.');
        } catch (error) {
          this.templates = [];
          this.renderLibrary();
          this.setStatus('pt-library-status', error.message || 'ساختار کتابخانه قالب‌ها معتبر نیست.', true);
        }
      } else {
        this.templates = [];
        try { this.renderLibrary(); } catch (renderError) { console.error('Print template library render failed:', renderError); }
        this.setStatus('pt-library-status', (results[0].reason && results[0].reason.message) || 'دریافت کتابخانه قالب‌ها ناموفق بود.', true);
      }
      if (results[1].status === 'fulfilled') {
        try {
          const sources = this.extract(results[1].value) || {};
          const pick = function (lower, upper) {
            const value = sources[lower] !== undefined ? sources[lower] : sources[upper];
            return Array.isArray(value) ? value : [];
          };
          this.sources = {
            projectFields: pick('projectFields', 'ProjectFields'),
            informationTypes: pick('informationTypes', 'InformationTypes'),
            forms: pick('forms', 'Forms')
          };
          this.sourceError = '';
          this.renderSources();
          const sourceTotal = this.sources.projectFields.length + this.sources.informationTypes.length +
            this.sources.forms.reduce((count, form) => count + (Array.isArray(form.Fields) ? form.Fields.length :
              (Array.isArray(form.fields) ? form.fields.length : 0)), 0);
          this.setStatus('pt-source-count', sourceTotal + ' منبع قابل اتصال');
        } catch (error) {
          this.sources = { projectFields: [], informationTypes: [], forms: [] };
          this.sourceError = error.message || 'ساختار منابع داده معتبر نیست.';
          try { this.renderSources(); } catch (renderError) { console.error('Print template sources render failed:', renderError); }
          this.setStatus('pt-source-count', this.sourceError, true);
        }
      } else {
        this.sources = { projectFields: [], informationTypes: [], forms: [] };
        this.sourceError = (results[1].reason && results[1].reason.message) || 'دریافت منابع داده ناموفق بود.';
        try { this.renderSources(); } catch (renderError) { console.error('Print template sources render failed:', renderError); }
        this.setStatus('pt-source-count', this.sourceError, true);
      }
      try { this.renderBindings(); } catch (error) { console.error('Print template bindings render failed:', error); }
      try { this.renderInspector(); } catch (error) { console.error('Print template inspector render failed:', error); }
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
      const roots = ['pt-source-list','pt-editor-source-list'].map(id => document.getElementById(id)).filter(Boolean);
      if (!roots.length) return;
      const groups = [];
      (this.sources.projectFields || []).forEach(source => {
        const field = source.field || source.Field || source.Code;
        if (!field) return;
        groups.push({
          key: 'project|' + field, label: source.label || source.Label || field, detail: 'اطلاعات پایه پروژه',
          binding: { id: 'project_' + field, sourceType: 'PROJECT_FIELD', field: field }
        });
      });
      (this.sources.informationTypes || []).forEach(source => {
        const id = source.ID || source.Id || source.id;
        if (!id) return;
        groups.push({
          key: 'info|' + id, label: source.Name || source.name || source.Code || id,
          detail: 'اطلاعات مرکزی · ' + (source.Code || source.code || ''),
          binding: { id: 'info_' + id, sourceType: 'PROJECT_INFORMATION', informationTypeId: id }
        });
      });
      (this.sources.forms || []).forEach(form => {
        const formId = form.ID || form.Id || form.id;
        (form.Fields || form.fields || []).forEach(field => {
          const fieldId = field.ID || field.Id || field.id;
          if (!formId || !fieldId) return;
          groups.push({
            key: 'form|' + formId + '|' + fieldId,
            label: field.Name || field.name || field.Label || field.Code || 'فیلد فرم',
            detail: 'فرم ' + (form.Name || form.name || '') + ' · ' + (field.Code || field.code || ''),
            binding: { id: 'form_' + formId + '_' + fieldId, sourceType: 'EVENT_FORM_FIELD',
              formId: formId, fieldId: fieldId,
              informationTypeId: field.InformationTypeID || field.informationTypeId, selection: 'LATEST' }
          });
        });
      });
      const markup = this.sourceError
        ? '<p class="pt-empty-state is-error">' + this.esc(this.sourceError) + '</p>'
        : (groups.length ? groups.map((item, index) =>
          '<div class="pt-source-row"><div><strong>' + this.esc(item.label) + '</strong><small>' + this.esc(item.detail) +
          '</small></div><button type="button" class="btn btn-secondary btn-sm" data-pt-add-source="' + index + '">اتصال</button></div>'
        ).join('') : '<p class="pt-empty-state">منبع داده فعالی پیدا نشد. اطلاعات مرکزی یا فرم فعال تعریف کن.</p>');
      roots.forEach(root => {
        root.innerHTML = markup;
        root.querySelectorAll('[data-pt-add-source]').forEach(button => button.addEventListener('click', () => {
          const item = groups[Number(button.dataset.ptAddSource)];
          if (item) this.addBinding(item.binding, item.label);
        }));
      });
      const count = document.getElementById('pt-source-count');
      if (count) count.textContent = this.sourceError ? 'خطا در دریافت منابع' : (groups.length + ' منبع قابل اتصال');
    },
    addBinding: function (binding, label) {
      if (!this.definition) this.definition = this.blankDefinition();
      if (this.definition.bindings.some(item => item.id === binding.id)) {
        this.setStatus('pt-form-status', 'این منبع قبلاً به قالب اضافه شده است.');
        return;
      }
      this.definition.bindings.push(Object.assign({}, binding, { label: label }));
      this.renderBindings(); this.renderInspector(); this.renderCanvas(); this.commitHistory();
      this.setStatus('pt-form-status', 'منبع داده متصل شد؛ اکنون از فهرست ویژگی‌های المان آن را انتخاب کن.');
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
        if (!item || !(item.ID || item.id)) throw new Error('اطلاعات قالب از سرور دریافت نشد یا ساختار پاسخ معتبر نیست.');
        this.editingId = item.ID || item.id;
        this.definition = item.Definition || item.definition || this.blankDefinition();
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
      const printButton = document.getElementById('pt-output-print');
      if (button && button.dataset.ptBound !== '1') {
        button.dataset.ptBound = '1';
        button.addEventListener('click', () => this.resolveOutput());
      }
      if (printButton && printButton.dataset.ptBound !== '1') {
        printButton.dataset.ptBound = '1';
        printButton.addEventListener('click', () => this.printOutput());
      }
      return this.loadOutputOptions();
    },
    loadOutputOptions: async function () {
      this.setStatus('pt-output-status', 'در حال دریافت قالب‌ها و پروژه‌ها…');
      const templateSelect = document.getElementById('pt-output-template');
      const projectSelect = document.getElementById('pt-output-project');
      if (templateSelect) templateSelect.innerHTML = '<option value="">در حال دریافت قالب‌ها…</option>';
      if (projectSelect) projectSelect.innerHTML = '<option value="">در حال دریافت پروژه‌ها…</option>';
      const results = await Promise.allSettled([
        PMS.Api.get('/print-templates'),
        PMS.Api.get('/projects')
      ]);
      const errors = [];
      if (results[0].status === 'fulfilled') {
        try {
          const templates = this.list(results[0].value, ['items','Items','templates','Templates','rows','Rows']);
          this.outputTemplates = templates;
          if (templateSelect) templateSelect.innerHTML = '<option value="">انتخاب قالب</option>' + templates.map(item =>
            '<option value="' + this.esc(item.ID || item.Id || item.id) + '">' +
            this.esc(item.Name || item.name || item.Title || item.ID) + ' · نسخه ' +
            this.esc(item.Version || item.version || 1) + '</option>'
          ).join('');
          if (!templates.length) errors.push('قالب فعالی ثبت نشده است.');
        } catch (error) {
          this.outputTemplates = [];
          if (templateSelect) templateSelect.innerHTML = '<option value="">دریافت قالب‌ها ناموفق بود</option>';
          errors.push('قالب‌ها: ' + (error.message || 'ساختار پاسخ نامعتبر است.'));
        }
      } else {
        this.outputTemplates = [];
        if (templateSelect) templateSelect.innerHTML = '<option value="">دریافت قالب‌ها ناموفق بود</option>';
        errors.push('قالب‌ها: ' + ((results[0].reason && results[0].reason.message) || 'خطای ارتباط با سرور'));
      }
      if (results[1].status === 'fulfilled') {
        try {
          const projects = this.list(results[1].value, ['items','Items','projects','Projects','rows','Rows']);
          if (projectSelect) projectSelect.innerHTML = '<option value="">انتخاب پروژه</option>' + projects.map(item =>
            '<option value="' + this.esc(item.ID || item.Id || item.id) + '">' +
            this.esc(item.ProjectCode || item.projectCode || item.Code || item.code || 'بدون کد') + ' — ' +
            this.esc(item.Title || item.title || item.Name || item.name || item.ID) + '</option>'
          ).join('');
          if (!projects.length) errors.push('پروژه فعالی برای نمایش دریافت نشد.');
        } catch (error) {
          if (projectSelect) projectSelect.innerHTML = '<option value="">دریافت پروژه‌ها ناموفق بود</option>';
          errors.push('پروژه‌ها: ' + (error.message || 'ساختار پاسخ نامعتبر است.'));
        }
      } else {
        if (projectSelect) projectSelect.innerHTML = '<option value="">دریافت پروژه‌ها ناموفق بود</option>';
        errors.push('پروژه‌ها: ' + ((results[1].reason && results[1].reason.message) || 'خطای ارتباط با سرور'));
      }
      this.setStatus('pt-output-status', errors.length
        ? errors.join(' | ')
        : 'قالب و پروژه را انتخاب کن؛ سپس پیش‌نمایش سند را بساز.', errors.some(message => /ناموفق|خطا/.test(message)));
    },
    formatOutputValue: function (value) {
      if (value === null || value === undefined || value === '') return '';
      if (Array.isArray(value)) return value.map(item => this.formatOutputValue(item)).join('، ');
      if (typeof value === 'object') return Object.keys(value).filter(key => !/attachment|mime|filesize/i.test(key))
        .map(key => this.formatOutputValue(value[key])).filter(Boolean).join(' — ');
      return String(value);
    },
    findImageAttachment: function (value) {
      if (!value) return null;
      if (Array.isArray(value)) {
        for (const item of value) { const found = this.findImageAttachment(item); if (found) return found; }
        return null;
      }
      if (typeof value !== 'object') return null;
      const mime = String(value.MimeType || value.mimeType || '').toLowerCase();
      const explicitAttachmentId = value.AttachmentID || value.attachmentId || value.attachmentID;
      const id = explicitAttachmentId || ((mime.indexOf('image/') === 0) ? (value.ID || value.Id) : '');
      if (id && (!mime || mime.indexOf('image/') === 0)) return { id: String(id), mime: mime || 'image/jpeg' };
      for (const key of Object.keys(value)) {
        const found = this.findImageAttachment(value[key]);
        if (found) return found;
      }
      return null;
    },
    loadOutputImage: async function (value) {
      const attachment = this.findImageAttachment(value);
      if (!attachment) return '';
      const response = await PMS.Api.get('/attachments/' + encodeURIComponent(attachment.id) + '/download', { trackSync: false });
      const file = this.extract(response) || {};
      const base64 = file.Base64 || file.base64;
      if (!base64) throw new Error('محتوای تصویر پیوست دریافت نشد.');
      const mime = String(file.MimeType || file.mimeType || attachment.mime || 'image/jpeg').toLowerCase();
      if (mime.indexOf('image/') !== 0) throw new Error('فایل متصل‌شده تصویر معتبر نیست.');
      return 'data:' + mime + ';base64,' + String(base64).replace(/^data:[^,]*;base64,/, '');
    },
    renderOutputDocument: async function (template, project, data) {
      const definition = template && template.Definition ? template.Definition : {};
      const page = definition.page || {};
      const sizes = {A4:[210,297],A5:[148,210],LETTER:[216,279]};
      const base = sizes[String(page.size || 'A4').toUpperCase()] || sizes.A4;
      const landscape = String(page.orientation || 'portrait').toLowerCase() === 'landscape';
      const width = landscape ? base[1] : base[0];
      const height = landscape ? base[0] : base[1];
      this.outputPageSpec = { width: width, height: height };
      const bindings = Object.create(null);
      (definition.bindings || []).forEach(binding => { bindings[binding.id] = binding; });
      const elements = await Promise.all((definition.elements || []).map(async item => {
        const binding = bindings[item.bindingId];
        const raw = binding ? data[item.bindingId] : null;
        const imageAttachment = this.findImageAttachment(raw);
        const isImage = item.type === 'image' || !!imageAttachment;
        const value = binding ? this.formatOutputValue(raw) : (item.text || '');
        const style = 'left:'+Number(item.x||0)+'mm;top:'+Number(item.y||0)+'mm;width:'+Number(item.width||30)+'mm;min-height:'+Number(item.height||15)+'mm;font-size:'+Number(item.fontSize||12)+'pt;text-align:'+this.esc(item.align||'right')+';color:'+this.esc(item.color||'#1f2937')+';background:'+this.esc(item.background||'transparent')+';';
        if (item.type === 'worddocument') {
          return '<style>' + (item.css || '') + '</style><div class="pt-word-document pt-output-word-document">' + this.sanitizeImportedHtml(item.html || '') + '</div>';
        }
        if (item.type === 'richtext') {
          return '<div class="pt-output-element pt-output-richtext" style="'+style+'">' + this.sanitizeImportedHtml(item.html || '') + '</div>';
        }
        if (isImage) {
          let image = '';
          if (imageAttachment) {
            try {
              const src = await this.loadOutputImage(raw);
              image = '<img class="pt-output-image-content" src="' + src + '" alt="' + this.esc(imageAttachment.id) + '">';
            } catch (error) {
              image = '<div class="pt-output-image pt-output-image-error">بارگذاری تصویر ناموفق بود</div>';
            }
          } else {
            image = '<div class="pt-output-image pt-output-image-empty" aria-hidden="true"></div>';
          }
          return '<div class="pt-output-element pt-output-image-frame" style="'+style+'">'+image+'</div>';
        }
        if (item.type === 'table') {
          const rows = Array.isArray(raw) ? raw : (item.rows || []);
          const columns = item.columns || [];
          const tableRows = rows.map(row => {
            const cells = Array.isArray(row) ? row : (row && typeof row === 'object' ? Object.values(row) : [row]);
            return '<tr>'+columns.map((_,i)=>'<td>'+this.esc(this.formatOutputValue(cells[i]))+'</td>').join('')+'</tr>';
          }).join('');
          return '<div class="pt-output-element pt-output-table" style="'+style+'"><strong>'+this.esc(item.text||'')+'</strong><table><thead><tr>'+columns.map(col=>'<th>'+this.esc(col)+'</th>').join('')+'</tr></thead><tbody>'+tableRows+'</tbody></table></div>';
        }
        if (item.type === 'line' || item.type === 'divider') return '<div class="pt-output-element pt-output-shape pt-output-'+item.type+'" style="'+style+'" aria-hidden="true"></div>';
        if (item.type === 'rectangle' || item.type === 'ellipse') return '<div class="pt-output-element pt-output-shape pt-output-'+item.type+'" style="'+style+'" aria-hidden="true"></div>';
        return '<div class="pt-output-element" style="'+style+'">'+this.esc(value)+'</div>';
      }));
      const importedWord = (definition.elements || []).find(item => item.type === 'worddocument');
      if (importedWord) return '<div class="pt-word-document pt-output-word-document"><style>' + (importedWord.css || '') + '</style>' + this.sanitizeImportedHtml(importedWord.html || '') + '</div>';
      return '<article class="pt-print-page" style="width:'+width+'mm;height:'+height+'mm" dir="rtl">'+elements.join('')+'</article>';
    },
    printOutput: function () {
      const spec = this.outputPageSpec || { width: 210, height: 297 };
      let printStyle = document.getElementById('pt-output-page-rule');
      if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'pt-output-page-rule';
        document.head.appendChild(printStyle);
      }
      printStyle.textContent = '@page{size:'+spec.width+'mm '+spec.height+'mm;margin:0}';
      document.body.classList.add('pt-printing');
      const images = Array.from(document.querySelectorAll('#pt-output-preview img'));
      Promise.all(images.map(image => image.decode ? image.decode().catch(() => {}) : Promise.resolve())).then(() => {
        window.print();
        window.setTimeout(() => document.body.classList.remove('pt-printing'), 1500);
      });
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
        const data = result.data || {};
        const template = (this.outputTemplates || []).find(item => String(item.ID) === String(templateId));
        const project = result.project || {};
        const preview = document.getElementById('pt-output-preview');
        const card = document.getElementById('pt-output-preview-card');
        if (!template || !template.Definition) throw new Error('ساختار قالب برای تولید سند در دسترس نیست.');
        if (preview) preview.innerHTML = await this.renderOutputDocument(template, project, data);
        if (card) card.hidden = false;
        const printButton = document.getElementById('pt-output-print');
        if (printButton) printButton.hidden = false;
        const root = document.getElementById('pt-output-data');
        const keys = Object.keys(data);
        if (root) root.innerHTML = keys.length ? '<div class="pt-resolved-list">' +
          keys.map(key => '<div class="pt-resolved-row"><strong>' + this.esc(key) + '</strong><pre>' +
            this.esc(typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key], null, 2)) +
            '</pre></div>').join('') + '</div>' : '<div class="pt-empty-state">این قالب منبع داده‌ای ندارد.</div>';
        this.setStatus('pt-output-status', 'پیش‌نمایش سند آماده است؛ برای چاپ یا ذخیره PDF از دکمه مربوط استفاده کن.');
      } catch (error) {
        this.setStatus('pt-output-status', error.message || 'ساخت پیش‌نمایش سند ناموفق بود.', true);
      } finally { if (button) button.disabled = false; }
    }
  };
  PMS.Modules = PMS.Modules || {};
  PMS.Modules.PrintDesigner = PrintDesigner;
})();