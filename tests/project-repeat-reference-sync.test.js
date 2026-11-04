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

test('staging deployment publishes the current feature frontend without changing production root', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy-pages-staging.yml'), 'utf8');
  assert.match(workflow, /ref: feature\/design-case-preproduction[\s\S]{0,100}path: _site\/staging/);
  assert.match(workflow, /path: _site$/m);
  assert.match(workflow, /AKfycbw-o15vVNFbnfqhVYV6PtpDOTt4jURF5QKEahvnENkZp2hOPlek1Hj55T2tBnypfPCb/);
});


test('repeat project form does not expose or submit project-level reference policy overrides', () => {
  const projects = fs.readFileSync(path.join(root, 'js/modules/projects.js'), 'utf8');
  assert.doesNotMatch(projects, /data-reference-override/);
  assert.doesNotMatch(projects, /ReferencePolicyJSON:\s*Array\.from/);
  assert.match(projects, /انتقال اطلاعات فقط طبق سیاست تعریف‌شده در Workflow انجام می‌شود/);
});

test('workflow management supports editing reference-copy policy on existing workflows', () => {
  const workflows = fs.readFileSync(path.join(root, 'js/modules/workflows.js'), 'utf8');
  assert.match(workflows, /data-action="edit-workflow"/);
  assert.match(workflows, /showCreateWorkflowModal\(workflow\)/);
  assert.match(workflows, /PMS\.Api\.put\('\/workflows\/'/);
  assert.match(workflows, /RepeatReferencePolicyJSON:/);
});

test('repeat project copy progress is real, per information type, and resumable', () => {
  const projects = fs.readFileSync(path.join(root, 'js/modules/projects.js'), 'utf8');
  assert.match(projects, /ReferenceCopyOperationID/);
  assert.match(projects, /referenceCopyProjectId/);
  assert.match(projects, /referenceCopyPlan/);
  assert.match(projects, /reference-copy\\/['"] \+ encodeURIComponent\(item\.informationTypeId\)/);
  assert.match(projects, /renderReferenceCopyProgress/);
  assert.match(projects, /ادامه کپی اطلاعات/);
});
