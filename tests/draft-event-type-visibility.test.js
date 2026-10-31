'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('project creators can load their own draft projects without PROJECT_VIEW', () => {
  const source = read('js/modules/events.js');
  assert.ok(source.includes("const canLoadProjectOptions = isAdmin ||"));
  assert.ok(source.includes("permissions.indexOf('PROJECT_VIEW') !== -1 ||"));
  assert.ok(source.includes("permissions.indexOf('PROJECT_CREATE') !== -1;"));
  assert.ok(source.includes("if (canLoadProjectOptions) {"));
  assert.ok(source.includes("PMS.Api.getCached('/projects'"));
});

test('project event types remain selectable for users who can create projects', () => {
  const source = read('js/modules/events.js');
  assert.ok(source.includes("const canAccessProjectOptions ="));
  assert.ok(source.includes("permissions.indexOf('PROJECT_CREATE') !== -1;"));
  assert.ok(source.includes("(!canAccessProjectOptions && isProjectEvent)"));
  assert.ok(source.includes("option.dataset.allowOnDraft = String(type.AllowOnDraft"));
});
