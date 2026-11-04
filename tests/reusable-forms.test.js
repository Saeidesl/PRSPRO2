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


test('forms workspace separates form design from event assignment',()=>{
  const page=read('pages/forms.html');
  const module=read('js/modules/forms.js');
  const css=read('css/reusable-forms.css');
  assert.match(page,/data-forms-tab="design"/);
  assert.match(page,/data-forms-tab="connect"/);
  assert.match(page,/id="forms-design-panel"/);
  assert.match(page,/id="forms-connect-panel"/);
  assert.match(page,/id="forms-connect-event-type"/);
  assert.match(page,/id="forms-connect-form"/);
  assert.match(page,/id="forms-connect-required"/);
  assert.match(module,/switchTab: function/);
  assert.match(module,/loadMappings: async function/);
  assert.match(module,/connectForm: async function/);
  const start=module.indexOf('openDesigner: async function');
  const end=module.indexOf('notice: function',start);
  const designer=module.slice(start,end);
  assert.doesNotMatch(designer,/form-event-type|form-event-attach|form-event-mappings|event-type-forms/);
  assert.match(designer,/طراحی فرم/);
  assert.match(css,/forms-workspace-tabs/);
  assert.match(css,/@media\(max-width:600px\)/);
});

test('event assignment view uses existing event form APIs and prevents duplicate links',()=>{
  const module=read('js/modules/forms.js');
  assert.match(module,/PMS\.Api\.get\('\/event-types\/'\s*\+/);
  assert.match(module,/PMS\.Api\.post\('\/event-types\/'\s*\+/);
  assert.match(module,/PMS\.Api\.delete\('\/event-type-forms\/'\s*\+/);
  assert.match(module,/mapping\.FormID/);
  assert.match(module,/mappingRequest/);
});

test('event type procurement settings select a numeric central information type and never map dynamic fields',()=>{
  const module=read('js/modules/event-types.js');
  const start=module.indexOf('async function openProcurementSettings');
  const end=module.indexOf('function createModal',start);
  const settings=module.slice(start,end);
  assert.ok(start>=0 && end>start);
  assert.match(settings,/PMS\.Api\.get\('\/information-types'\)/);
  assert.match(settings,/DataType \|\| ''\)\.toLowerCase\(\) === 'number'/);
  assert.match(settings,/ConfirmedQuantityInformationTypeID/);
  assert.doesNotMatch(settings,/RECORD_RECEIPT|FieldMap|\/event-types\/.*\/fields/);
  assert.doesNotMatch(module,/event-type-fields|loadInlineFields|openFieldForm|showFieldsModal/);
});

test('test data seeder does not create dynamic event data',()=>{
  const seeder=read('tools/test-data-seeder.html');
  assert.doesNotMatch(seeder,/\/event-types\/.*\/fields/);
  assert.doesNotMatch(seeder,/DynamicData|dynamicData|fieldMap/);
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
  assert.match(events,/FormResponses:\s*this\.amendmentMode \? \[\] : formResponses/);
  assert.match(events,/collectConfiguredFormResponses/);
  assert.match(events,/\/events\/'.*\/forms/);
  assert.match(events,/DefinitionSnapshot|response\.Definition/);
  assert.match(events,/data-form-table/);
  assert.match(events,/applyConfiguredFormVisibility/);
  assert.match(events,/VisibilityRule/);
  assert.match(events,/event-form-group/);
});

test('event entry loads reusable forms without requesting or submitting legacy dynamic fields',()=>{
  const module=read('js/modules/events.js');
  const start=module.indexOf('loadEventForms: async function');
  const end=module.indexOf('updateSubmitAvailability: function',start);
  const loader=module.slice(start,end);
  assert.ok(start>=0 && end>start);
  assert.match(loader,/this\.loadConfiguredForms\(selectedTypeId\)/);
  assert.doesNotMatch(loader,/\/event-types\/.*\/fields/);
  assert.doesNotMatch(module,/loadDynamicFields|renderDynamicFields|data-dynamic-code|DynamicData:/);
  assert.match(module,/FormResponses:\s*this\.amendmentMode \? \[\] : formResponses/);
  assert.match(module,/this\.loadConfiguredForms\(selectedTypeId\)/);
  assert.match(module,/Array\.isArray\(data\.forms\)/);
  assert.match(module,/Array\.isArray\(data\.data\)/);
});

test('event details retain read-only legacy dynamic data for historical records',()=>{
  const module=read('js/modules/events.js');
  assert.match(module,/PMS\.Api\.get\('\/events\/' \+ encodeURIComponent\(eventId\) \+ '\/data'\)/);
  assert.match(module,/const legacyDynamicData = this\.extractDataObject\(responses\[1\]\)/);
  assert.match(module,/this\.legacyDynamicEntries\(legacyDynamicData\)/);
  assert.doesNotMatch(module,/DynamicData:\s*dynamicData/);
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


test('amendment retry reuses the created correction event and updates the source response only once',()=>{
  const events=read('js/modules/events.js');
  assert.match(events,/this\.amendmentPendingValues = this\.amendmentMode \? formResponses : null/);
  assert.match(events,/this\.amendmentMode && this\.amendmentEventId/);
  assert.match(events,/تلاش مجدد باید فقط PUT را اجرا کند و رویداد تکراری نسازد/);
  assert.match(events,/const amendmentValues = this\.amendmentPendingValues \|\| formResponses/);
  assert.match(events,/PMS\.Api\.put\('\/events\/' \+ encodeURIComponent\(this\.amendmentSourceEventId\)/);
});

test('amendment submission fingerprints source identity and edited values for safe POST retries',()=>{
  const events=read('js/modules/events.js');
  assert.match(events,/amendmentSourceEventId: this\.amendmentMode \? this\.amendmentSourceEventId/);
  assert.match(events,/amendmentSourceFormId: this\.amendmentMode \? this\.amendmentSourceFormId/);
  assert.match(events,/amendmentValues: this\.amendmentMode \? formResponses/);
});


test('amendment form sends the source response timestamp for stale edit protection',()=>{
  const events=read('js/modules/events.js');
  assert.match(events,/formOption\.dataset\.updatedAt = String\(item\.UpdatedAt \|\| ''\)/);
  assert.match(events,/this\.amendmentSourceUpdatedAt = String\(option\.dataset\.updatedAt \|\| ''\)/);
  assert.match(events,/ExpectedUpdatedAt: this\.amendmentSourceUpdatedAt/);
});

test('amending a saved attachment uploads a replacement even when name and size match',()=>{
  const events=read('js/modules/events.js');
  const start=events.indexOf('uploadConfiguredFormFile: async function');
  const end=events.indexOf('createFieldInput: function',start);
  const upload=events.slice(start,end);
  assert.match(upload,/input\._pmsUploadedFile === file && input\._pmsUploadedAttachment/);
  assert.match(upload,/input\._pmsUploadedFile = file/);
  assert.match(upload,/input\._pmsUploadedAttachment = value/);
  assert.doesNotMatch(upload,/cached\.FileName === file\.name/);
});


test('event type settings expose explicit amendment flag and selectable reusable form allow-list',()=>{
  const types=read('js/modules/event-types.js');
  assert.match(types,/id="et-is-form-amendment"/);
  assert.match(types,/id="et-amendable-form-list"/);
  assert.match(types,/name="AmendableFormIDs"/);
  assert.match(types,/IsFormAmendment: fieldChecked/);
  assert.match(types,/AmendableFormIDs: fieldChecked/);
});

test('amendment registration automatically finds the latest saved allow-listed form without manual source selectors',()=>{
  const events=read('js/modules/events.js');
  const start=events.indexOf('loadAmendmentSourceEvents: async function');
  const end=events.indexOf('hydrateAmendmentForm: function',start);
  const loader=events.slice(start,end);
  assert.match(events,/id="event-amendment-status"/);
  assert.match(events,/id="event-amendment-source-event"><\/select>/);
  assert.match(events,/id="event-amendment-source-form"><\/select>/);
  assert.match(loader,/PMS\.Api\.get\('\/projects\/' \+ encodeURIComponent\(projectId\) \+ '\/events'\)/);
  assert.match(loader,/events\.sort/);
  assert.match(loader,/PMS\.Api\.get\('\/events\/' \+ encodeURIComponent\(eventId\) \+ '\/forms'\)/);
  assert.match(loader,/allowedFormIds\.indexOf\(formId\) !== -1/);
  assert.match(loader,/this\.hydrateAmendmentForm\(formId\)/);
  assert.doesNotMatch(events,/amendmentEventSelect\.addEventListener/);
  assert.doesNotMatch(events,/amendmentFormSelect\.addEventListener/);
});

test('project detail replaces scattered information panel with event-backed reusable form records',()=>{
  const detail=read('js/modules/project-detail.js');
  const page=read('pages/project-detail.html');
  assert.match(page,/id="project-forms-list"/);
  assert.match(page,/id="project-information-list"/);
  assert.match(page,/اطلاعات مرکزی پروژه/);
  assert.match(detail,/this\.loadProjectInformation\(false\)/);
  assert.match(detail,/renderProjectInformation: function/);
  assert.match(detail,/loadProjectForms: async function/);
  assert.match(detail,/\/events\/' \+ encodeURIComponent\(eventId\) \+ '\/forms/);
  assert.match(detail,/DefinitionSnapshot|record\.Definition/);
  assert.match(detail,/renderProjectForms: function/);
  assert.match(detail,/project-form-table/);
  assert.match(detail,/projectFormsLoadVersion/);
});
