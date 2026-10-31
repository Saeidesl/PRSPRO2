'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('current project form offers initial draft registration with name and profile image', () => {
  const source = read('js/modules/projects.js');
  assert.match(source, /project-create-draft/);
  assert.match(source, /ثبت اولیه طرح \(نام و تصویر\)/);
  assert.match(source, /RecordState: 'DRAFT'/);
  assert.match(source, /draftOnly \? 'PROFILE'/);
  assert.match(source, /برای ثبت اولیه، انتخاب تصویر طرح الزامی است/);
});

test('draft projects can be reopened and completed through the existing project edit API', () => {
  const source = read('js/modules/projects.js');
  assert.match(source, /modal\.dataset\.draftMode = 'true'/);
  assert.match(source, /isDraftEditing\) \{\s*project\.RecordState = 'ACTIVE'/);
  assert.match(source, /Api\.put\('\/projects\/' \+ encodeURIComponent\(projectId\), project\)/);
  assert.match(source, /تکمیل و فعال‌سازی پروژه/);
});

test('project list and detail distinguish drafts from production projects', () => {
  const list = read('js/modules/projects.js');
  const detail = read('js/modules/project-detail.js');
  assert.match(list, /isDraft \? 'پیش‌نویس'/);
  assert.match(list, /در انتظار تکمیل اطلاعات/);
  assert.match(detail, /پیش‌نویس — نیازمند تکمیل/);
  assert.match(detail, /addEventButton\.hidden = isDraft/);
});

test('project assets use cache-busting for the draft lifecycle changes', () => {
  const source = read('index.html');
  assert.match(source, /projects\.js\?v=20261031-project-draft-flow-1/);
  assert.match(source, /project-detail\.js\?v=20261031-project-draft-flow-1/);
});
