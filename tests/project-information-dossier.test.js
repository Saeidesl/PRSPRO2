'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');

test('project detail displays event-backed reusable form responses instead of the scattered information panel', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'pages/project-detail.html'), 'utf8');
  assert.match(moduleSource, /loadProjectForms: async function/);
  assert.match(moduleSource, /renderProjectForms: function/);
  assert.match(moduleSource, /events/);
  assert.match(moduleSource, /Definition/);
  assert.match(page, /project-forms-list/);
  assert.match(page, /project-information-list/);
  assert.match(page, /project-information-loading/);
  assert.match(page, /project-information-error/);
  assert.match(page, /project-information-retry/);
  assert.match(page, /project-forms-list/);
  assert.match(moduleSource, /this\.loadProjectInformation\(false\)/);
  assert.match(moduleSource, /getCached\('\/projects\/'[\s\S]*\/information/);
  assert.match(moduleSource, /getFresh\('\/projects\/'[\s\S]*\/information/);
});

test('project dossier supports editing scalar and dynamic table values through the existing API', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.match(moduleSource, /openProjectInformationForm: function/);
  assert.match(moduleSource, /project-information-add-row/);
  assert.match(moduleSource, /PMS\.Api\.post\('\/projects\/'/);
  assert.match(moduleSource, /PMS\.Api\.delete\('\/projects\/'/);
  assert.match(moduleSource, /canEditProjectInformation/);
});

test('project dossier exposes revision history with before and after values', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.match(moduleSource, /openProjectInformationHistory: async function/);
  assert.match(moduleSource, /\/history/);
  assert.match(moduleSource, /OldValue/);
  assert.match(moduleSource, /NewValue/);
  assert.match(moduleSource, /Revision/);
});

test('project detail script cache version is refreshed for the dossier UI', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(index, /project-detail\.js\?v=20261103-reference-sync-on-save-1/);
});


test('central information and event-backed forms remain separate independent panels', () => {
  const page = fs.readFileSync(path.join(root, 'pages/project-detail.html'), 'utf8');
  const centralIndex = page.indexOf('id="project-information-list"');
  const formsIndex = page.indexOf('id="project-forms-list"');
  assert.ok(centralIndex >= 0 && formsIndex >= 0 && centralIndex < formsIndex);
  assert.match(page, /اطلاعات مرکزی پروژه/);
  assert.match(page, /فرم‌های ثبت‌شده پروژه/);
});

test('central information loading supports retry and ignores stale responses', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.match(moduleSource, /projectInformationLoadVersion/);
  assert.match(moduleSource, /informationRetry\.addEventListener/);
  assert.match(moduleSource, /requestVersion !== this\.projectInformationLoadVersion/);
  assert.match(moduleSource, /project-information-count/);
});
