'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');

test('project dossier loads central information definitions and saved values', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'pages/project-detail.html'), 'utf8');
  assert.match(moduleSource, /loadProjectInformation: async function/);
  assert.match(moduleSource, /\/projects\/\' \+ encodeURIComponent\(this\.projectId\) \+ \'\/information/);
  assert.match(moduleSource, /InformationType/);
  assert.match(page, /project-information-list/);
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
  assert.match(index, /project-detail\.js\?v=20261031-cardinality-rows-1/);
});
