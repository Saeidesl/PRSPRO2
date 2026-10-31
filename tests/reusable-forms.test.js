'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('forms page is registered behind system settings and loaded as a module',()=>{
  const router=read('js/core/router.js');
  const layout=read('js/components/layout.js');
  const index=read('index.html');
  assert.match(router,/forms:\s*'pages\/forms\.html'/);
  assert.match(router,/forms:\s*\['SYSTEM_SETTINGS'\]/);
  assert.match(router,/forms:\s*'Forms'/);
  assert.match(layout,/route:\s*'forms'.*permission:\s*'SYSTEM_SETTINGS'/);
  assert.match(index,/js\/modules\/forms\.js/);
  assert.ok(fs.existsSync(path.join(__dirname,'..','pages/forms.html')));
});

test('form builder uses central information types and event-type assignments',()=>{
  const module=read('js/modules/forms.js');
  assert.match(module,/PMS\.Api\.get\('\/information-types'\)/);
  assert.match(module,/PMS\.Api\.post\('\/forms'/);
  assert.match(module,/PMS\.Api\.post\('\/forms\/'\s*\+/);
  assert.match(module,/PMS\.Api\.post\('\/event-types\/'\s*\+/);
  assert.match(module,/PMS\.Api\.delete\('\/event-type-forms\/'\s*\+/);
});

test('event type management can attach and detach reusable forms',()=>{
  const module=read('js/modules/event-types.js');
  assert.match(module,/event-type-forms/);
  assert.match(module,/openEventTypeForms/);
  assert.match(module,/PMS\.Api\.post\('\/event-types\/'/);
  assert.match(module,/PMS\.Api\.delete\('\/event-type-forms\/'/);
});

test('event type create and edit form can assign reusable forms inline',()=>{
  const module=read('js/modules/event-types.js');
  assert.match(module,/id="et-form-settings"/);
  assert.match(module,/id="et-form-select"/);
  assert.match(module,/PMS\.Api\.get\('\/forms'\)/);
  assert.match(module,/pendingEventForms\.push/);
  assert.match(module,/for \(const mapping of pendingEventForms\)/);
  assert.match(module,/PMS\.Api\.post\('\/event-types\/'\s*\+/);
  assert.match(module,/PMS\.Api\.delete\('\/event-type-forms\/'\s*\+/);
  assert.match(module,/فرم‌های متصل به این رویداد/);
});

test('event entry loads assigned forms, submits FormResponses and displays saved snapshots',()=>{
  const events=read('js/modules/events.js');
  assert.match(events,/\/event-types\/'.*\/forms/);
  assert.match(events,/FormResponses:\s*formResponses/);
  assert.match(events,/collectConfiguredFormResponses/);
  assert.match(events,/\/events\/'.*\/forms/);
  assert.match(events,/DefinitionSnapshot|response\.Definition/);
  assert.match(events,/data-form-table/);
  assert.match(events,/applyConfiguredFormVisibility/);
  assert.match(events,/VisibilityRule/);
  assert.match(events,/event-form-group/);
});

test('assigned forms load independently from legacy event fields',()=>{
  const module=read('js/modules/events.js');
  const start=module.indexOf('loadDynamicFields: async function');
  const end=module.indexOf('updateSubmitAvailability: function',start);
  const loader=module.slice(start,end);
  assert.ok(loader.indexOf('this.loadConfiguredForms(selectedTypeId)') < loader.indexOf("'/event-types/' + encodeURIComponent(selectedTypeId) + '/fields'"));
  assert.match(loader,/await configuredFormsLoad/);
  assert.match(module,/Array\.isArray\(data\.forms\)/);
  assert.match(module,/Array\.isArray\(data\.data\)/);
});

test('form table rendering separates one-row and repeatable cardinality',()=>{
  const events=read('js/modules/events.js');
  const types=read('js/modules/information-types.js');
  const detail=read('js/modules/project-detail.js');
  assert.match(events,/if \(columns\.length\)/);
  assert.match(events,/cardinality === 'MULTIPLE' \? valueRows : \(valueRows\[0\] \|\| \{\}\)/);
  assert.match(events,/dataset\.columnRequired/);
  assert.match(events,/addConfiguredFormRow\(tbody, columns, cardinality === 'MULTIPLE'\)/);
  assert.match(events,/const hasColumns = Array\.isArray\(info\.Columns\)/);
  assert.match(detail,/const hasColumns = columns\.length > 0/);
  assert.match(detail,/value = multi \? dataRows : \(dataRows\[0\] \|\| \{\}\)/);
  assert.match(types,/تعدادپذیری/);
  assert.doesNotMatch(types,/form\.elements\.DataType\.disabled = true/);
});
