'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('workflow editor supports initial and repeat production workflows', () => {
  const source = read('js/modules/workflows.js');
  assert.match(source, /name="WorkflowType"/);
  assert.match(source, /value="INITIAL">تولید اولیه/);
  assert.match(source, /value="REPEAT">تولید تکراری/);
  assert.match(source, /WorkflowType: workflowType/);
});

test('workflow steps expose a reusable event rule editor', () => {
  const source = read('js/modules/workflows.js');
  assert.match(source, /data-action="edit-step-rules"/);
  assert.match(source, /تنظیم رویدادها/);
  assert.match(source, /\/steps\/.*\/event-rules/);
  assert.match(source, /RequirementMode: requirementMode/);
  assert.match(source, /DataSource:\s*requirementMode\s*===\s*'REFERENCE'/);
  assert.match(source, /SequenceMode: sequence\.value/);
});

test('workflow editor supports strict, free, grouped order and publication', () => {
  const source = read('js/modules/workflows.js');
  assert.match(source, /value="STRICT"/);
  assert.match(source, /value="FREE"/);
  assert.match(source, /value="GROUPED"/);
  assert.match(source, /\/publish/);
  assert.match(source, /PMS\.Api\.post/);
});

test('workflow module cache version is refreshed', () => {
  const html = read('index.html');
  assert.match(html, /js\/modules\/workflows\.js\?v=20261104-workflow-policy-editor-1/);
});

test('event registration displays current workflow step requirements', () => {
  const source = read('js/modules/events.js');
  assert.match(source, /event-workflow-progress-section/);
  assert.match(source, /loadWorkflowProgress: async function/);
  assert.match(source, /\/workflow-progress/);
  assert.match(source, /پیشرفت مرحله گردش‌کار/);
});

test('event module cache version is refreshed for workflow progress', () => {
  const html = read('index.html');
  assert.match(html, /js\/modules\/events\.js\?v=20261104-event-context-2/);
});
