'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'projects.js'), 'utf8');

function makeNode(document, parentElement = document.documentElement) {
  return {
    isConnected: true,
    hidden: false,
    parentElement,
    dataset: {},
    attributes: {},
    children: [],
    focus() { document.activeElement = this; },
    hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name); },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] ?? null; },
    contains(node) {
      for (let current = node; current; current = current.parentElement) {
        if (current === this) return true;
      }
      return false;
    },
    querySelector(selector) {
      return selector === '[role="dialog"]' ? (this.dialog || null) : null;
    },
    querySelectorAll() { return this.children; }
  };
}

function createControllerFixture({ overlays = 1 } = {}) {
  const document = {
    listeners: {},
    documentElement: {},
    body: {},
    activeElement: null,
    addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); },
    removeEventListener(type, listener) {
      this.listeners[type] = (this.listeners[type] || []).filter((item) => item !== listener);
      if (!this.listeners[type].length) delete this.listeners[type];
    },
    querySelectorAll(selector) {
      return selector === '[data-pms-accessible-modal="true"]'
        ? this.overlays.filter((item) => item.dataset.pmsAccessibleModal === 'true')
        : [];
    },
    overlays: []
  };
  document.body.parentElement = document.documentElement;
  document.body.isConnected = true;
  const opener = makeNode(document);
  document.activeElement = opener;

  for (let i = 0; i < overlays; i += 1) {
    const overlay = makeNode(document);
    const dialog = makeNode(document, overlay);
    dialog.children = [];
    dialog.hasAttribute = function (name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name);
    };
    overlay.dialog = dialog;
    overlay.querySelector = (selector) => selector === '[role="dialog"]' ? dialog : null;
    const first = makeNode(document, dialog);
    const last = makeNode(document, dialog);
    dialog.children.push(first, last);
    overlay.controls = { first, last, dialog };
    document.overlays.push(overlay);
  }

  const start = source.indexOf('  function bindProjectModalKeyboard(overlay, onClose) {');
  const end = source.indexOf('\n  const CACHE_KEY', start);
  assert.ok(start >= 0 && end > start, 'keyboard controller source should be present');
  const controllerSource = source.slice(start, end);
  const bindProjectModalKeyboard = vm.runInNewContext(
    controllerSource + '\n bindProjectModalKeyboard;',
    {
      document,
      window: {
        getComputedStyle() {
          return { display: 'block', visibility: 'visible', opacity: '1' };
        }
      },
      Array,
      Number
    }
  );
  return { document, opener, bindProjectModalKeyboard };
}

function keyboardEvent(key, shiftKey = false) {
  return {
    key,
    shiftKey,
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this.propagationStopped = true; }
  };
}

test('keyboard controller moves focus into the dialog and traps Tab in both directions', () => {
  const { document, opener, bindProjectModalKeyboard } = createControllerFixture();
  const overlay = document.overlays[0];
  const { first, last } = overlay.controls;
  const controller = bindProjectModalKeyboard(overlay, () => {});
  
  controller.focusFirst();
  assert.equal(document.activeElement, first, 'initial focus should move to the first control');

  document.activeElement = last;
  const forward = keyboardEvent('Tab');
  document.listeners.keydown[0](forward);
  assert.equal(document.activeElement, first, 'Tab from the last control should wrap to the first');
  assert.equal(forward.defaultPrevented, true);

  document.activeElement = first;
  const backward = keyboardEvent('Tab', true);
  document.listeners.keydown[0](backward);
  assert.equal(document.activeElement, last, 'Shift+Tab from the first control should wrap to the last');
  assert.equal(backward.defaultPrevented, true);

  assert.ok(opener, 'fixture includes the opener for focus restoration');
});

test('Escape closes the active dialog, removes its listener, and restores focus', () => {
  const { document, opener, bindProjectModalKeyboard } = createControllerFixture();
  const overlay = document.overlays[0];
  let closeCount = 0;
  const controller = bindProjectModalKeyboard(overlay, () => { closeCount += 1; });
  controller.focusFirst();

  const escape = keyboardEvent('Escape');
  document.listeners.keydown[0](escape);

  assert.equal(closeCount, 1, 'Escape should invoke the close callback exactly once');
  assert.equal(escape.defaultPrevented, true);
  assert.equal(escape.propagationStopped, true);
  assert.equal(document.activeElement, opener, 'focus should return to the opener');
  assert.equal(document.listeners.keydown, undefined, 'closing should remove the keydown listener');
});

test('a non-topmost dialog ignores keyboard events', () => {
  const { document, bindProjectModalKeyboard } = createControllerFixture({ overlays: 2 });
  const lower = document.overlays[0];
  const top = document.overlays[1];
  let lowerCloseCount = 0;
  bindProjectModalKeyboard(lower, () => { lowerCloseCount += 1; });
  bindProjectModalKeyboard(top, () => {});
  
  const escape = keyboardEvent('Escape');
  document.listeners.keydown[0](escape);
  assert.equal(lowerCloseCount, 0, 'Escape must not close a dialog underneath another dialog');
  assert.equal(escape.defaultPrevented, false, 'the lower dialog handler must leave the event untouched');
});

test('project dialogs are wired to the shared keyboard controller', () => {
  assert.match(source, /project-draft-material-specs-modal/);
  assert.match(source, /project-color-size-modal/);
  assert.equal((source.match(/bindProjectModalKeyboard\(modal, \(\) => modal\.remove\(\)\)/g) || []).length, 2);
  assert.match(source, /let settingsModalKeyboard = null/);
  assert.match(source, /settingsModalKeyboard = bindProjectModalKeyboard\(settingsModal/);
  assert.match(source, /settingsModalKeyboard\.destroy\(\)/);
  assert.match(source, /requestProjectAttachmentDeleteReason: function/);
  assert.match(source, /openProjectImage: function/);
  assert.match(source, /let projectModalKeyboard = null/);
  assert.match(source, /projectModalKeyboard = bindProjectModalKeyboard\(modal/);
  assert.match(source, /projectModalKeyboard\.destroy\(\)/);
});

test('settings-only save sends only project settings through the API', () => {
  const saveHandler = source.slice(
    source.indexOf("const settingsSaveButton = settingsModal.querySelector('[data-settings-save]');"),
    source.indexOf("settingsContent.addEventListener('change', saveProjectSettings);")
  );
  assert.match(saveHandler, /AvailableDepartmentIDs:\s*settings\.departmentIds/);
  assert.match(saveHandler, /AllowedUserIDs:\s*settings\.userIds/);
  assert.match(saveHandler, /NotifyEnabled:\s*settings\.notifyEnabled/);
  assert.match(saveHandler, /Status:\s*settings\.status/);
  assert.match(saveHandler, /window\.PMS\.Api\.put\('\/projects\/' \+ encodeURIComponent\(projectId\), payload\)/);
  assert.match(saveHandler, /ذخیره تنظیمات ناموفق بود:/);
  assert.doesNotMatch(saveHandler, /this\.createProject\(modal\)|requestSubmit\(\)/);
});
