'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('one project submit automatically creates a draft when no project code is entered', () => {
  const source = read('js/modules/projects.js');
  assert.doesNotMatch(source, /project-create-draft/);
  assert.ok(source.includes("draftOnly = modal.dataset.editMode !== 'true' && !project.ProjectCode"));
  assert.ok(source.includes('${isDraftMode ? "required" : ""}'));
  assert.ok(!source.includes('${isDraftMode || !isEditMode ? "required" : ""}'));
  assert.match(source, /RecordState: 'DRAFT'/);
  assert.ok(source.includes("const selectedAttachmentType = draftOnly ? 'PROFILE'"));
  assert.match(source, /برای ثبت اولیه، انتخاب تصویر طرح الزامی است/);
  assert.match(source, /پیش‌نویس پروژه ثبت شد/);
});
test('draft projects can be reopened and completed through the existing project edit API', () => {
  const source = read('js/modules/projects.js');
  assert.match(source, /modal\.dataset\.draftMode = 'true'/);
  assert.match(source, /isDraftEditing\) \{\s*project\.RecordState = 'ACTIVE'/);
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
  assert.match(source, /projects\.js\?v=20261031-unified-project-entry-1/);
  assert.match(source, /project-detail\.js\?v=20261031-draft-events-1/);
});


test('draft event controls and card projection are wired in the frontend', () => {
  const types = read('js/modules/event-types.js');
  const events = read('js/modules/events.js');
  const projects = read('js/modules/projects.js');
  const info = read('js/modules/information-types.js');
  assert.match(types, /AllowOnDraft/);
  assert.match(events, /refreshDraftEventOptions/);
  assert.match(events, /data-profile-image-toggle/);
  assert.match(projects, /CardInformation/);
  assert.match(info, /ShowOnCard/);
});
