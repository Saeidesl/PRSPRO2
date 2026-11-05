'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('standalone print template library route uses its independent module',()=>{
  const page=read('pages/print-designer.html');
  const module=read('js/modules/print-designer.js');
  const router=read('js/core/router.js');
  assert.match(page,/pt-template-form/);
  assert.match(page,/pt-source-list/);
  assert.match(module,/initLibrary: async function/);
  assert.match(module,/PMS\.Api\.post\('\/print-templates'/);
  assert.match(router,/'print-design': 'PrintDesigner'/);
});

test('print designer supports adding project data, custom text, rules and reusable form snapshots',()=>{
  const module=read('js/modules/project-detail.js');
  assert.match(module,/data-ppd-add="project"/);
  assert.match(module,/data-ppd-add="project-fields"/);
  assert.match(module,/data-ppd-add="text"/);
  assert.match(module,/data-ppd-add="line"/);
  assert.match(module,/data-ppd-form/);
  assert.match(module,/Definition|definition/);
  assert.match(module,/renderPrintDesignerElement: function/);
});

test('print designer supports visual ordering, element styling, saved templates and A4 printing',()=>{
  const module=read('js/modules/project-detail.js');
  const css=read('css/project-print-designer.css');
  assert.match(module,/draggable="true"/);
  assert.match(module,/data-ppd-move="up"/);
  assert.match(module,/data-ppd-move="down"/);
  assert.match(module,/data-ppd-style="border"/);
  assert.match(module,/data-ppd-style="background"/);
  assert.match(module,/savePrintDesignerTemplate: function/);
  assert.match(module,/loadPrintDesignerTemplate: function/);
  assert.match(module,/window\.print\(\)/);
  assert.match(css,/@page\{size:A4 portrait/);
  assert.match(css,/@media print/);
  assert.match(css,/@media\(max-width:680px\)/);
});

test('print designer assets are cache-busted and loaded by the application',()=>{
  const index=read('index.html');
  assert.match(index,/print-template-library\.css\?v=/);
  assert.match(index,/project-detail\.js\?v=20261103-reference-sync-on-save-1/);
});


test('form image attachments are loaded as inline images for project forms and print designer',()=>{
 const module=read('js/modules/project-detail.js');
 assert.match(module,/prepareProjectFormImages: async function/);
 assert.ok(module.includes(`data:' + data.MimeType + ';base64,'`));
 assert.match(module,/project-form-inline-image/);
 assert.match(module,/renderPrintDesignerValue\(row && row\[String\(column\.Code \|\| column\.code\)\], column\.DataType \|\| column\.dataType\)/);
});

test('print designer renders image attachments as inline images on the A4 canvas',()=>{
 const module=read('js/modules/project-detail.js');
 const css=read('css/project-print-designer.css');
 assert.match(module,/renderPrintDesignerValue: function/);
 assert.match(module,/data-ppd-image/);
 assert.match(module,/loadPrintDesignerImages: async function/);
 assert.ok(module.includes("'/attachments/' + encodeURIComponent(id) + '/download'"));
 assert.match(module,/ppd-inline-image/);
 assert.match(css,/ppd-inline-image/);
});


test('print designer exposes independently selectable and adjustable form images',()=>{
 const module=read('js/modules/project-detail.js');
 const css=read('css/project-print-designer.css');
 assert.match(module,/data-ppd-inner-image/);
 assert.match(module,/draggable="false"/);
 assert.match(module,/image\.draggable = false/);
 assert.match(module,/innerImage = event\.target\.closest\('\[data-ppd-inner-image\]'\)/);
 assert.match(module,/printDesignerSelectedInner/);
 assert.match(css,/is-inner-selected/);
 assert.match(module,/data-ppd-inner-style="width"/);
 assert.match(module,/data-ppd-inner-style="x"/);
 assert.match(module,/data-ppd-inner-style="y"/);
 assert.match(module,/pointerdown/);
 assert.match(module,/parentForControls/);
 assert.match(module,/this\.printDesignerSelectedInner = \{ elementId: innerDrag\.elementId, imageId: innerDrag\.imageId \}/);
 assert.match(module,/pointermove/);
 assert.match(module,/innerLayout\[selection\.imageId\]/);
 assert.match(module,/image\.dataset\.ppdInnerImage/);
 assert.match(css,/ppd-inline-image\[data-ppd-inner-image\]/);
});


test('print designer supports selecting form tables and adjusting overall and individual column widths',()=>{
 const module=read('js/modules/project-detail.js');
 const css=read('css/project-print-designer.css');
 assert.match(module,/renderPrintDesignerTable: function/);
 assert.match(module,/data-ppd-inner-table/);
 assert.match(module,/data-ppd-inner-column/);
 assert.match(module,/printDesignerSelectedTable/);
 assert.match(module,/data-ppd-table-style="width"/);
 assert.match(module,/data-ppd-column-width/);
 assert.match(module,/tableLayout/);
 assert.match(module,/layout\.columns\[col\.dataset\.ppdColCode\]/);
 assert.match(module,/field-' \+ String\(item\.fieldKey\)/);
 assert.match(css,/\.ppd-inner-table/);
 assert.match(css,/@media print/);
});

test('print designer uses its selectable image renderer for full forms and individual fields',()=>{
 const module=read('js/modules/project-detail.js');
 const start=module.indexOf('renderPrintDesignerElement: function (item) {');
 const end=module.indexOf('renderProjectForms: function ()',start);
 const renderer=module.slice(start,end);
 assert.match(renderer,/renderPrintDesignerTable\('field-'/);
 assert.match(renderer,/renderPrintDesignerValue\(value, info\.DataType\)/);
 assert.doesNotMatch(renderer,/renderProjectFormValue\(/);
 const tableRenderer=module.slice(module.indexOf('renderPrintDesignerTable: function'),module.indexOf('renderPrintDesignerElement: function'));
 assert.match(tableRenderer,/renderPrintDesignerValue\(row && row\[String\(column\.Code \|\| column\.code\)\], column\.DataType \|\| column\.dataType\)/);
});

test('print designer image layout ids remain stable by attachment and preserve legacy positional layouts',()=>{
 const module=read('js/modules/project-detail.js');
 assert.match(module,/const attachmentKey = String\(id\)\.replace\(\/\[\^a-zA-Z0-9_-\]\/g, '_'\)/);
 assert.match(module,/const innerId = 'img-' \+ attachmentKey \+ '-' \+ occurrence/);
 assert.match(module,/layouts\[innerId\] \|\| layouts\[legacyInnerId\]/);
 assert.match(module,/printDesignerImageOccurrences = Object\.create\(null\)/);
});


test('template library and document data output are separate routes and modes',()=>{
 const layout=read('js/components/layout.js');
 const router=read('js/core/router.js');
 const design=read('pages/print-designer.html');
 const output=read('pages/print-output.html');
 const module=read('js/modules/print-designer.js');
 assert.match(layout,/label: 'طراحی قالب'/);
 assert.match(layout,/label: 'چاپ اسناد'/);
 assert.ok(router.includes("'print-design': 'pages/print-designer.html'"));
 assert.ok(router.includes("'print-output': 'pages/print-output.html'"));
 assert.match(design,/ذخیره قالب/);
 assert.match(output,/pt-output-template/);
 assert.match(output,/pt-output-project/);
 assert.match(module,/resolveOutput: async function/);
 assert.ok(module.includes("'/print-templates/' + encodeURIComponent(templateId) + '/resolve'"));
});

test('standalone print designer remains a full-screen layer above the application sidebar',()=>{
 const css=read('css/project-print-designer.css');
 assert.match(css,/\.ppd-standalone\{position:fixed;inset:0;z-index:12000/);
 assert.doesNotMatch(css,/\.ppd-standalone\{position:relative/);
 assert.match(css,/body\.ppd-printing\{overflow:hidden/);
});

test('print designer form library has distinct sections, clear empty state and responsive panel layout',()=>{
 const module=read('js/modules/project-detail.js');
 const css=read('css/project-print-designer.css');
 assert.match(module,/ppd-library-section ppd-library-forms/);
 assert.match(module,/ppd-library-empty/);
 assert.match(module,/data-ppd-form/);
 assert.match(module,/data-ppd-field/);
 assert.match(css,/\.ppd-library-actions\{display:grid/);
 assert.match(css,/\.ppd-form-library\{display:flex/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/\.ppd-standalone \.ppd-paper\{width:min\(210mm,calc\(100vw - 48px\)\)/);
});

test('print designer keeps A4 print dimensions and read-only output styles',()=>{
 const css=read('css/project-print-designer.css');
 assert.match(css,/@page\{size:A4 portrait/);
 assert.match(css,/\.ppd-standalone \.ppd-paper\{width:210mm!important/);
 assert.match(css,/\.ppd-output-mode \.ppd-properties\{display:none!important/);
});

test('central template designer imports DOCX into editable and printable rich text',()=>{
 const page=read('pages/print-designer.html');
 const module=read('js/modules/print-designer.js');
 const index=read('index.html');
 const css=read('css/print-template-library.css');
 assert.match(page,/pt-word-import-file/);
 assert.match(page,/واردسازی از Word/);
 assert.match(index,/mammoth@1\.8\.0\/mammoth\.browser\.min\.js/);
 assert.match(module,/importWordDocument: async function/);
 assert.match(module,/sanitizeImportedHtml: function/);
 assert.match(module,/data-pt-richtext/);
 assert.match(module,/pt-output-richtext/);
 assert.match(css,/pt-richtext-editor/);
});
