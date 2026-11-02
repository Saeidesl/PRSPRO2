'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const projectsSource = fs.readFileSync(path.join(root, 'js/modules/projects.js'), 'utf8');
const materialPlanningSource = fs.readFileSync(path.join(root, 'js/modules/material-planning.js'), 'utf8');
const projectFormCss = fs.readFileSync(path.join(root, 'css/project-form.css'), 'utf8');

test('project creation no longer contains a draft material-specification workflow', () => {
  assert.doesNotMatch(projectsSource, /new-project-material-specs-button|new-project-material-specs-summary/);
  assert.doesNotMatch(projectsSource, /openDraftMaterialSpecsForm|project-draft-material-specs-modal|projectMaterialSpecs|draftMaterialSpecs/);
  assert.doesNotMatch(projectsSource, /Api\.post\(['"]\/projects\/['"] \+ encodeURIComponent\(createdId\) \+ ['"]\/material-specifications/);
  assert.doesNotMatch(projectFormCss, /draft-material-specs|new-project-material-specs/);
});

test('the independent project-card material planning route remains available', () => {
  assert.match(projectsSource, /data-project-menu-action="material-specs"/);
  assert.match(projectsSource, /detail\.action === 'material-specs'/);
  assert.match(projectsSource, /window\.PMS\.MaterialPlanning/);
  assert.match(materialPlanningSource, /window\.PMS\.MaterialPlanning\.open = open/);
  assert.match(materialPlanningSource, /\/material-specifications/);
  assert.match(materialPlanningSource, /\/material-calculations/);
});

test('material planning retains revision and calculation history UI', () => {
  assert.match(materialPlanningSource, /ویرایش \/ نسخه جدید/);
  assert.match(materialPlanningSource, /تاریخچه محاسبات نیاز قطعی/);
  assert.match(materialPlanningSource, /Revision/);
});
