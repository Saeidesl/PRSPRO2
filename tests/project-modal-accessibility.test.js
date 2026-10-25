'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'projects.js'), 'utf8');

test('project dialogs share a keyboard accessibility controller', () => {
  assert.match(source, /function bindProjectModalKeyboard\(overlay, onClose\)/);
  assert.match(source, /event\.key === 'Escape'[\s\S]{0,100}close\(\)/);
  assert.match(source, /event\.key !== 'Tab'/);
  assert.match(source, /event\.shiftKey[\s\S]{0,180}last\.focus\(\)/);
  assert.match(source, /returnFocusTarget\.focus\(\)/);
});

test('color-size and material-specification dialogs use keyboard accessibility', () => {
  assert.match(source, /project-draft-material-specs-modal/);
  assert.match(source, /project-color-size-modal/);
  assert.equal((source.match(/bindProjectModalKeyboard\(modal, \(\) => modal\.remove\(\)\)/g) || []).length, 2);
  assert.match(source, /modalKeyboard\.focusFirst\(\)/);
});

test('project dialog controller ignores hidden and non-topmost dialogs', () => {
  assert.match(source, /getTopmostOverlay/);
  assert.match(source, /getTopmostOverlay\(\) !== overlay/);
  assert.match(source, /style\.display === 'none'/);
});

test('project settings subdialog uses shared keyboard focus management', () => {
  assert.match(source, /let settingsModalKeyboard = null/);
  assert.match(source, /settingsModalKeyboard = bindProjectModalKeyboard\(settingsModal/);
  assert.match(source, /settingsModalKeyboard\.focusFirst\(\)/);
  assert.match(source, /settingsModalKeyboard\.destroy\(\)/);
  assert.match(source, /const closeSettings = \(\) => \{/);
});

test('attachment deletion reason dialog uses shared keyboard accessibility', () => {
  assert.match(source, /requestProjectAttachmentDeleteReason: function/);
  assert.match(source, /keyboard = bindProjectModalKeyboard\(overlay/);
  assert.match(source, /keyboard\.focusFirst\(\)/);
});

test('project image lightbox uses shared keyboard accessibility', () => {
  assert.match(source, /openProjectImage: function/);
  assert.match(source, /keyboard = bindProjectModalKeyboard\(overlay, \(\) => overlay\.remove\(\)\)/);
});

test('main project create/edit dialog uses shared keyboard accessibility', () => {
  assert.match(source, /let projectModalKeyboard = null/);
  assert.match(source, /projectModalKeyboard = bindProjectModalKeyboard\(modal/);
  assert.match(source, /projectModalKeyboard\.focusFirst\(\)/);
  assert.match(source, /if \(projectModalKeyboard\)[\s\S]{0,100}projectModalKeyboard\.destroy\(\)/);
});
