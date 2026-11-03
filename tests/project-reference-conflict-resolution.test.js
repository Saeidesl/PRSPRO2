'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');

test('project detail offers explicit source or local resolution for reference conflicts', () => {
  const source = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.match(source, /data-project-reference-resolve="USE_SOURCE"/);
  assert.match(source, /data-project-reference-resolve="KEEP_LOCAL"/);
  assert.match(source, /ExpectedTargetRevision:\s*Number\(log\.TargetRevision/);
  assert.match(source, /\/resolve-reference/);
  assert.match(source, /await this\.loadProjectInformation\(true\)/);
});

test('reference conflict decisions require confirmation and prevent duplicate clicks', () => {
  const source = fs.readFileSync(path.join(root, 'js/modules/project-detail.js'), 'utf8');
  assert.match(source, /if \(!confirm\(promptText\)\) return/);
  assert.match(source, /action\.disabled = true/);
  assert.match(source, /action\.disabled = false/);
});
