(function () {
  'use strict';
  window.PMS = window.PMS || {};
  window.PMS.Modules = window.PMS.Modules || {};
  const STORAGE_KEY = 'pms_default_project_workflow_v1';

  function unwrap(value) {
    let data = value;
    for (let i = 0; i < 4 && data && data.data !== undefined; i += 1) data = data.data;
    return data;
  }
  function getId(item) { return item && (item.ID || item.Id || item.id || item.WorkflowID || item.WorkflowId); }
  function getName(item) { return item && (item.Name || item.Title || item.WorkflowName || item.Code || getId(item)); }
  function getWorkflows(data) {
    data = unwrap(data);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.workflows)) return data.workflows;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.Workflows)) return data.Workflows;
    return [];
  }
  const Settings = {
    init: async function () {
      const message = document.getElementById('settings-message');
      const select = document.getElementById('settings-default-workflow');
      const saveButton = document.getElementById('settings-save-workflow');
      if (message) message.textContent = 'تنظیمات گردش کار را از این بخش مدیریت کنید.';
      if (!select || !saveButton) return;
      let workflows = [];
      try {
        const response = await window.PMS.Api.get('/workflows');
        workflows = getWorkflows(response).filter(function (item) {
          const status = String(item.Status || item.status || 'ACTIVE').toUpperCase();
          return status !== 'INACTIVE' && status !== 'ARCHIVED' && status !== 'DELETED';
        });
      } catch (error) {
        select.innerHTML = '<option value="">دریافت گردش کارها ناموفق بود</option>';
        if (message) message.textContent = 'دریافت گردش کارها ممکن نشد. دسترسی مشاهده گردش کارها را بررسی کنید.';
        saveButton.disabled = true;
        return;
      }
      const options = workflows.map(function (workflow) {
        return { id: String(getId(workflow) || ''), name: String(getName(workflow) || '') };
      }).filter(function (workflow) { return workflow.id; });
      let saved = '';
      try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch (error) {}
      select.innerHTML = '<option value="">انتخاب گردش کار پیش‌فرض</option>' + options.map(function (workflow) {
        const id = workflow.id.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const name = workflow.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<option value="' + id + '">' + name + '</option>';
      }).join('');
      select.value = options.some(function (workflow) { return workflow.id === saved; }) ? saved : '';
      saveButton.disabled = !options.length;
      saveButton.addEventListener('click', function () {
        const value = String(select.value || '');
        if (!value) {
          if (message) message.textContent = 'ابتدا یک گردش کار انتخاب کنید.';
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, value);
          if (message) message.textContent = 'گردش کار پیش‌فرض ذخیره شد.';
          window.dispatchEvent(new CustomEvent('pms:default-workflow-changed', { detail: { workflowId: value } }));
        } catch (error) {
          if (message) message.textContent = 'ذخیره تنظیمات در این مرورگر ممکن نشد.';
        }
      });
    }
  };
  window.PMS.Settings = Settings;
  window.PMS.Modules.Settings = Settings;
})();