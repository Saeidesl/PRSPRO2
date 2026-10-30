'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('the independent design-case page, route, menu item, and assets are removed', () => {
  const router = read('js/core/router.js');
  const layout = read('js/components/layout.js');
  const index = read('index.html');

  assert.doesNotMatch(router, /design-cases|DesignCases/);
  assert.doesNotMatch(layout, /design-cases|پرونده‌های طرح/);
  assert.doesNotMatch(index, /design-cases/);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'pages/design-cases.html')), false);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'js/modules/design-cases.js')), false);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'css/design-cases.css')), false);
});

test('project creation and event submission remain the only operational entry points', () => {
  assert.match(read('js/modules/projects.js'), /Api\.post\(['"]\/projects['"]/);
  assert.match(read('js/modules/events.js'), /Api\.post\(['"]\/events['"]/);
  assert.doesNotMatch(read('js/modules/event-types.js'), /DESIGN_CASE|پرونده طرح/);
});
