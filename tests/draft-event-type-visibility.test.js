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

test('backend project listing permits PROJECT_CREATE and limits non-viewers to their own drafts', () => {
  const router = readBackend('Router.js');
  const projects = readBackend('ProjectService.js');
  assert.match(router, /requireAny\(params, \['PROJECT_VIEW', 'PROJECT_CREATE'\]\)/);
  assert.match(projects, /return String\(project\.RecordState \|\| 'ACTIVE'\)\.toUpperCase\(\) === 'DRAFT'[\\s\\S]*?String\(project\.CreatedBy \|\| ''\) === String\(user\.ID \|\| ''\)/);
});

function readBackend(name) {
  const backendRoot = process.env.PMS_BACKEND_ROOT;
  if (!backendRoot) return '';
  return fs.readFileSync(path.join(backendRoot, name), 'utf8');
}
