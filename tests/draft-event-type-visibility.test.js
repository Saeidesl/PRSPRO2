'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('project creators can load their own draft projects without PROJECT_VIEW', () => {
  const source = read('js/modules/events.js');
  assert.match(source, /const canLoadProjectOptions = isAdmin \|\|[\\s\\S]*?permissions\.indexOf\('PROJECT_VIEW'\) !== -1 \|\|[\\s\\S]*?permissions\.indexOf\('PROJECT_CREATE'\) !== -1/);
  assert.match(source, /if \(canLoadProjectOptions\) \{[\\s\\S]*?PMS\.Api\.getCached\('\/projects'/);
});

test('project event types remain selectable for users who can create projects', () => {
  const source = read('js/modules/events.js');
  assert.match(source, /const canAccessProjectOptions = [\\s\\S]*?permissions\.indexOf\('PROJECT_CREATE'\) !== -1/);
  assert.match(source, /\(!canAccessProjectOptions && isProjectEvent\)/);
  assert.match(source, /option\.dataset\.allowOnDraft = String\(type\.AllowOnDraft/);
});
