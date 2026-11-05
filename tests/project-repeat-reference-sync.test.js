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
  assert.match(source, /project-detail\.js\?v=20261104-central-project-information-2/);
});

test('GitHub Pages production deployment publishes the main branch root', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy-pages-staging.yml'), 'utf8');
  assert.match(workflow, /branches:[\s\S]*- main/);
  assert.match(workflow, /ref: main/);
  assert.match(workflow, /path: \./);
  assert.match(workflow, /Publish main branch to GitHub Pages/);
  assert.doesNotMatch(workflow, /feature\/design-case-preproduction/);
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
  assert.match(projects, /reference-copy/);
  assert.match(projects, /encodeURIComponent/);
  assert.match(projects, /renderReferenceCopyProgress/);
  assert.match(projects, /ادامه کپی اطلاعات/);
});


test('reference copy retries items previously marked SKIPPED_FILE', () => {
  const projects = fs.readFileSync(path.join(root, 'js/modules/projects.js'), 'utf8');
  assert.ok(projects.includes("['PENDING', 'FAILED', 'SKIPPED_FILE']"));
  assert.ok(projects.includes('موارد فایل غیرتصویری خارج از محدوده انتقال'));
  assert.ok(!projects.includes('انتقال امن فایل هنوز پشتیبانی نمی‌شود'));
});
