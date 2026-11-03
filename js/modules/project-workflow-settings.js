(function () {
  'use strict';

  const STORAGE_KEY = 'pms_default_project_workflow_v1';
  let observer = null;

  function getSavedWorkflowId() {
    try { return String(localStorage.getItem(STORAGE_KEY) || ''); } catch (error) { return ''; }
  }

  function configureWorkflowField(modal) {
    const select = modal.querySelector('#new-project-workflow');
    if (!select) return;

    const wrapper = select.closest('.project-form-field') || select.parentElement;
    const isEditable = !select.disabled;

    // New projects must be able to choose INITIAL or REPEAT workflows.
    // Existing projects keep their assigned workflow locked and out of the way.
    if (wrapper) {
      wrapper.hidden = !isEditable;
      if (isEditable) wrapper.removeAttribute('hidden');
    }
    if (isEditable) {
      select.removeAttribute('aria-hidden');
      select.removeAttribute('tabindex');
      select.tabIndex = 0;
    } else {
      select.setAttribute('aria-hidden', 'true');
      select.tabIndex = -1;
    }

    if (!isEditable) return;

    const configured = getSavedWorkflowId();
    const applyDefault = function () {
      if (!select.isConnected || select.disabled) return;
      const available = Array.from(select.options).filter(function (option) { return option.value; });
      if (!available.length) return;
      const preferred = available.find(function (option) { return option.value === configured; });
      select.value = preferred ? preferred.value : available[0].value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };
    if (select.options.length > 1 && select.options[select.selectedIndex] && select.options[select.selectedIndex].value) {
      if (configured && Array.from(select.options).some(function (option) { return option.value === configured; })) {
        select.value = configured;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    if (select.dataset.workflowSettingsObserver === '1') return;
    select.dataset.workflowSettingsObserver = '1';
    const optionsObserver = new MutationObserver(function () {
      if (select.options.length > 1) {
        optionsObserver.disconnect();
        delete select.dataset.workflowSettingsObserver;
        applyDefault();
      }
    });
    optionsObserver.observe(select, { childList: true });
  }

  function scan() {
    document.querySelectorAll('#project-create-form').forEach(function (form) {
      const modal = form.closest('[role="dialog"]') || form.closest('.modal') || form.parentElement;
      if (modal) configureWorkflowField(modal);
    });
  }

  function init() {
    scan();
    if (observer) observer.disconnect();
    observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();