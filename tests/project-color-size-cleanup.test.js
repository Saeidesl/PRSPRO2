'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('project color and size are no longer managed through a project-owned editor', () => {
  const projects = read('js/modules/projects.js');
  const detail = read('js/modules/project-detail.js');

  assert.doesNotMatch(projects, /ColorSizeJSON|openColorSizeForm|openProjectColorSizeForm|color-size-modal|data-project-menu-action="color-size"/);
  assert.doesNotMatch(detail, /ColorSizeJSON|colorNames|sizeNames/);
});

test('event entry has no legacy project color or size selectors', () => {
  const events = read('js/modules/events.js');
  const eventTypes = read('js/modules/event-types.js');

  assert.doesNotMatch(events, /ColorSizeJSON|UseProjectColors|UseProjectSizes|renderVariantFields|data-variant-row|data-variant-field|event-variant-section|event-variant-fields/);
  assert.doesNotMatch(eventTypes, /UseProjectColors|UseProjectSizes/);
});

test('quantity-only production and delivery tracking remains available', () => {
  const events = read('js/modules/events.js');
  const eventTypes = read('js/modules/event-types.js');
  const detail = read('js/modules/project-detail.js');

  assert.match(events, /renderEventQuantityField/);
  assert.match(events, /data-event-quantity/);
  assert.match(eventTypes, /TrackVariantQuantity/);
  assert.match(detail, /TrackVariantQuantity/);
  assert.match(detail, /VariantDetailsJSON/);
});

test('central project information forms remain connected to event submission', () => {
  const events = read('js/modules/events.js');
  assert.match(events, /FormResponses/);
  assert.match(events, /loadConfiguredForms/);
  assert.match(events, /event-configured-forms-section/);
});
