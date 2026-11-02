(function () {
  'use strict';
  const PMS = window.PMS = window.PMS || {};
  const PrintDesigner = {
    templates: [],
    sources: { projectFields: [], informationTypes: [], forms: [] },
    definition: null,
    editingId: '',
    busy: false,
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
    initLibrary: async function () {
      const form = document.getElementById('pt-template-form');
      if (form) form.addEventListener('submit', (event) => { event.preventDefault(); this.saveTemplate(); });
      const reset = document.getElementById('pt-template-reset');
      if (reset) reset.addEventListener('click', () => this.resetForm());
      const resetSecondary = document.getElementById('pt-template-reset-secondary');
      if (resetSecondary) resetSecondary.addEventListener('click', () => this.resetForm());
      await this.loadLibrary();
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
      this.renderBindings();
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
        this.definition.bindings.splice(Number(button.dataset.ptRemoveBinding), 1);
        this.renderBindings();
      }));
    },
    resetForm: function () {
      const form = document.getElementById('pt-template-form');
      if (form) form.reset();
      this.editingId = '';
      this.definition = this.blankDefinition();
      const title = document.getElementById('pt-editor-title');
      if (title) title.textContent = 'ساخت قالب جدید';
      const code = document.getElementById('pt-template-code');
      if (code) code.disabled = false;
      this.renderBindings();
      this.setStatus('pt-form-status', '');
    },
    editTemplate: async function (id) {
      try {
        const response = await PMS.Api.get('/print-templates/' + encodeURIComponent(id));
        const item = this.extract(response);
        this.editingId = item.ID;
        this.definition = item.Definition || this.blankDefinition();
        document.getElementById('pt-template-code').value = item.Code || '';
        document.getElementById('pt-template-code').disabled = true;
        document.getElementById('pt-template-name').value = item.Name || '';
        document.getElementById('pt-template-description').value = item.Description || '';
        const title = document.getElementById('pt-editor-title');
        if (title) title.textContent = 'ویرایش قالب: ' + item.Name;
        this.renderBindings();
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