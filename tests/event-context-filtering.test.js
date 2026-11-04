'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'events.js'), 'utf8');

test('project event choices wait for the selected project workflow context', () => {
  assert.match(source, /refreshEventTypeOptions: function \(\)/);
  assert.match(source, /workflowProgressProjectId !== projectId \|\| self\.workflowProgressLoading/);
  assert.match(source, /ابتدا پروژه را انتخاب کنید/);
  assert.match(source, /GET|workflow-progress/);
  assert.match(source, /PMS\.Api\.get\('\/projects\/' \+ encodeURIComponent\(selectedProjectId\) \+ '\/workflow-progress'\)/);
});

test('workflow event choices follow the same eligibility and sequence rules as the backend', () => {
  assert.match(source, /requirementMode \|\| 'REQUIRED'\)\.toUpperCase\(\);[\s\S]*?mode === 'REFERENCE'/);
  assert.match(source, /mode === 'NOT_REQUIRED'/);
  assert.match(source, /rule\.satisfied/);
  assert.match(source, /sequenceMode === 'STRICT'/);
  assert.match(source, /sequenceMode === 'GROUPED'/);
  assert.match(source, /در مرحله فعلی تعریف نشده/);
  assert.match(source, /قابل ثبت در مرحله فعلی/);
});

test('draft restrictions, independent events, and stale workflow requests are handled', () => {
  assert.match(source, /غیرمجاز برای پیش‌نویس/);
  assert.match(source, /if \(!isProjectEvent\) return ''/);
  assert.match(source, /this\.loadWorkflowProgress\(''\)/);
  assert.match(source, /requestId !== this\.workflowProgressRequestId/);
  assert.match(source, /قواعد گردش‌کار دریافت نشد/);
  assert.match(source, /تلاش مجدد/);
});

test('event creation controls are hidden or blocked without EVENT_CREATE permission', () => {
  assert.match(source, /this\.canCreateEvents = isAdmin \|\| permissions\.indexOf\('EVENT_CREATE'\) !== -1/);
  assert.match(source, /if \(!this\.canCreateEvents \|\| this\.modalOpen \|\| this\.submitting\) return/);
  assert.match(source, /Events\.canCreateEvents \?/);
});

test('disabled event types cannot enable event submission', () => {
  assert.match(source, /selectedOption && !selectedOption\.disabled/);
});
