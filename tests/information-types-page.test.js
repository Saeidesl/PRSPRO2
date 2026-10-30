'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');

test('central information settings are registered behind system settings access', () => {
  const router = fs.readFileSync(path.join(root, 'js/core/router.js'), 'utf8');
  const layout = fs.readFileSync(path.join(root, 'js/components/layout.js'), 'utf8');
  assert.match(router, /information-types: 'pages\/information-types\.html'/);
  assert.match(router, /information-types: \['SYSTEM_SETTINGS'\]/);
  assert.match(router, /information-types: 'InformationTypes'/);
  assert.match(layout, /route: 'information-types'.*permission: 'SYSTEM_SETTINGS'/);
});

test('central information UI uses the existing PMS API and supports reusable scalar and table definitions', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/information-types.js'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'pages/information-types.html'), 'utf8');
  assert.match(moduleSource, /PMS\.Api\.get\('\/information-types'\)/);
  assert.match(moduleSource, /PMS\.Api\.post\('\/information-types'/);
  assert.match(moduleSource, /PMS\.Api\.post\('\/information-types\/'\+id\+'\/columns'/);
  assert.match(moduleSource, /Cardinality/);
  assert.match(page, /information-type-create/);
});

test('central information types and dynamic columns expose active/inactive lifecycle controls', () => {
  const moduleSource = fs.readFileSync(path.join(root, 'js/modules/information-types.js'), 'utf8');
  assert.match(moduleSource, /form\.elements\.Status\.value=item&&item\.Status\|\|'ACTIVE'/);
  assert.match(moduleSource, /Status:form\.elements\.Status\.value/);
  assert.match(moduleSource, /<option value="INACTIVE">غیرفعال<\/option>/);
});
