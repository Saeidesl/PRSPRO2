(function () {
  'use strict';

  const STORAGE_KEY = 'pms_default_project_workflow_v1';
  let observer = null;

  function getSavedWorkflowId() {
    try {
      return String(localStorage.getItem(STORAGE_KEY) || '');
    } catch (error) {
      return '';
    }
  }

  function configureWorkflowField(modal) {
    const select = modal.querySelector('#new-project-workflow');
    if (!select) return;

    const wrapper = select.closest('.project-form-field') || select.parentElement;
    const isEditable = !select.disabled;

    // New projects can select their workflow. Existing projects keep their assigned workflow.
    if (wrapper) wrapper.hidden = !isEditable;

    if (isEditable) {
      select.removeAttribute('aria-hidden');
      select.removeAttribute('tabindex');
      select.tabIndex = 0;
    } else {
      select.setAttribute('aria-hidden', 'true');
      select.tabIndex = -1;
      return;
    }

    if (select.dataset.workflowDefaultApplied === '1') return;

    const applyDefault = function () {
      if (!select.isConnected || select.disabled || select.dataset.workflowDefaultApplied === '1') return;

      const available = Array.from(select.options).filter(function (option) {
        return Boolean(option.value);
      });
      if (!available.length) return;

      const configured = getSavedWorkflowId();
      const preferred = available.find(function (option) {
        return option.value === configured;
      });

      select.value = (preferred || available[0]).value;
      select.dataset.workflowDefaultApplied = '1';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };

    if (select.options.length > 1) {
      applyDefault();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
