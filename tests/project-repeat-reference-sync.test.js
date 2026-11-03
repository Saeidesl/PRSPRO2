'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');

test('project information no longer asks users to manually approve reference data', () => {
  const source = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.doesNotMatch(source, /data-project-info-approve/);
  assert.doesNotMatch(source, /تأیید نسخه مرجع/);
});

test('project detail explains conflict resolution using current reference information', () => {
  const source = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.match(source, /اطلاعات فعلی پروژه مرجع/);
  assert.match(source, /data-project-reference-resolve="USE_SOURCE"/);
  assert.match(source, /data-project-reference-resolve="KEEP_LOCAL"/);
  assert.match(source, /ExpectedTargetRevision:\s*Number\(log\.TargetRevision/);
});

test('project detail module cache is refreshed for automatic reference synchronization', () => {
  const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(source, /project-detail\.js\?v=20261103-reference-sync-on-save-1/);
});
