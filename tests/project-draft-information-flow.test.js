'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('new project creation requires a project code and does not create an implicit draft', () => {
  const source = read('js/modules/projects.js');
  assert.doesNotMatch(source, /project-create-draft/);
  assert.match(source, /if \(!project\.ProjectCode\) \{/);
  assert.match(source, /کد پروژه را وارد کن/);
  assert.match(source, /New projects always receive a user-entered temporary or final code/);
  assert.doesNotMatch(source, /RecordState:\s*'DRAFT'/);
});
test('draft projects can be reopened and completed through the existing project edit API', () => {
  const source = read('js/modules/projects.js');
  assert.match(source, /modal\.dataset\.draftMode = 'true'/);
  assert.match(source, /if \(isDraftEditing\) project\.RecordState = 'ACTIVE'/);
  assert.match(source, /Api\.put\('\/projects\/' \+ encodeURIComponent\(projectId\), project\)/);
  assert.match(source, /تکمیل و فعال‌سازی پروژه/);
});

test('project creators can see and reopen their own drafts without project-view permission', () => {
  const source = read('js/modules/projects.js');
  assert.match(source, /permissions\.indexOf\('PROJECT_CREATE'\) !== -1/);
  assert.match(source, /canEditThisProject = this\.canEditProjects\(\) \|\| \(isDraft && this\.canCreateOrEditProjects\(\)\)/);
  assert.match(source, /localDraft && this\.canCreateOrEditProjects\(\)/);
  assert.match(source, /canReadWorkflowStages/);
});

test('project list and detail distinguish drafts from production projects', () => {
  const list = read('js/modules/projects.js');
  const detail = read('js/modules/project-detail.js');
  assert.match(list, /isDraft \? 'پیش‌نویس'/);
  assert.match(list, /در انتظار تکمیل اطلاعات/);
  assert.match(detail, /پیش‌نویس — نیازمند تکمیل/);
  assert.match(detail, /پس از تکمیل گردش‌کار تعیین می‌شود/);
  assert.match(detail, /hasDraftEventTypes/);
});

test('project assets use cache-busting for the unified project entry', () => {
  const source = read('index.html');
  assert.match(source, /projects\.js\?v=20261104-reference-copy-progress-3/);
  assert.match(source, /project-detail\.js\?v=20261104-central-project-information-2/);
});


test('draft event controls and card projection are wired in the frontend', () => {
  const types = read('js/modules/event-types.js');
  const events = read('js/modules/events.js');
  const projects = read('js/modules/projects.js');
  const info = read('js/modules/information-types.js');
  assert.match(types, /AllowOnDraft/);
  assert.match(events, /refreshEventTypeOptions/);
  assert.match(events, /dataset\.profileImageToggle/);
  assert.match(projects, /CardInformation/);
  assert.match(info, /ShowOnCard/);
});

test('each central information type has an independent card-visibility setting', () => {
  const ui = read('js/modules/information-types.js');
  const cards = read('js/modules/projects.js');
  assert.match(ui, /name="ShowOnCard"/);
  assert.match(ui, /ShowOnCard:form\.elements\.ShowOnCard\.checked/);
  assert.match(ui, /این تنظیم برای هر نوع اطلاعات جداگانه است/);
  assert.match(cards, /\(Array\.isArray\(project\.CardInformation\) \? project\.CardInformation : \[\]\)\.map/);
  assert.match(cards, /info\.Name/);
});
