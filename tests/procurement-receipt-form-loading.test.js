'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'procurement.js'), 'utf8');
const start = source.indexOf('  async function openReceiptForm(options)');
const end = source.indexOf('  function bind(id, callback)', start);
assert.ok(start >= 0 && end > start, 'openReceiptForm source should be present');
const openReceiptForm = source.slice(start, end);

test('receipt form is shown before the project lookup completes', () => {
  assert.ok(openReceiptForm.indexOf("const root = modal('ثبت دریافت واقعی انبار'") >= 0, 'receipt modal should be created');
  assert.doesNotMatch(openReceiptForm, /await\s+loadProjectsForOrder\(\)/,
    'receipt form must not await the project lookup before rendering');
  assert.match(openReceiptForm, /const root = modal\('ثبت دریافت واقعی انبار'[\s\S]*?loadProjectsForOrder\(\)\.then\(/,
    'project lookup should start after the modal is created');
});

test('receipt project selector and submit remain disabled until lookup succeeds', () => {
  assert.match(openReceiptForm, /select name="ProjectID" required disabled><option value="">در حال دریافت فهرست پروژه‌ها/);
  assert.match(openReceiptForm, /if \(submitButton\) submitButton\.disabled = true/);
  assert.match(openReceiptForm, /projectSelect\.innerHTML = receiptProjectOptions\(\);[\s\S]*?projectSelect\.disabled = false;[\s\S]*?if \(submitButton\) submitButton\.disabled = false/);
});

test('receipt lookup failure keeps submission disabled and shows a visible error', () => {
  assert.match(openReceiptForm, /فهرست پروژه‌ها در دسترس نیست/);
  assert.match(openReceiptForm, /projectSelect\.disabled = true;\s*if \(submitButton\) submitButton\.disabled = true;[\s\S]*?showMessage\('فهرست پروژه‌ها دریافت نشد/);
  assert.match(openReceiptForm, /if \(!form\.isConnected\) return;/);
});
