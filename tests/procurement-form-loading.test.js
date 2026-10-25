'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'procurement.js'), 'utf8');
const start = source.indexOf('  async function openOrderForm(orderType) {');
const end = source.indexOf('  async function openReceiptForm(options)', start);
assert.ok(start >= 0 && end > start, 'openOrderForm source should be present');
const openOrderForm = source.slice(start, end);

test('project procurement form is rendered before waiting for the project lookup', () => {
  assert.ok(openOrderForm.indexOf('const root = modal(title,') >= 0, 'form should be rendered');
  assert.ok(openOrderForm.indexOf('const root = modal(title,') < openOrderForm.indexOf('loadProjectsForOrder().then('),
    'project lookup should start only after the form has been rendered');
  assert.doesNotMatch(openOrderForm, /await\s+loadProjectsForOrder\(\)/,
    'opening the form must not await the project lookup before rendering');
});

test('project selector and submit action stay disabled while projects are loading', () => {
  assert.match(openOrderForm, /select name="ProjectID" required disabled><option value="">در حال دریافت فهرست پروژه‌ها/);
  assert.match(openOrderForm, /if \(projectSelect && submitButton\) submitButton\.disabled = true/);
  assert.match(openOrderForm, /projectSelect\.innerHTML = projectOptions\(\);\s*projectSelect\.disabled = false;\s*if \(submitButton\) submitButton\.disabled = false/);
});

test('unavailable project lookup leaves project order submission disabled and shows feedback', () => {
  assert.match(openOrderForm, /فهرست پروژه‌ها در دسترس نیست/);
  assert.match(openOrderForm, /projectSelect\.disabled = true;\s*if \(submitButton\) submitButton\.disabled = true;\s*showMessage\('فهرست پروژه‌ها دریافت نشد/);
  assert.match(openOrderForm, /if \(!orderForm\.isConnected\) return;/);
});
