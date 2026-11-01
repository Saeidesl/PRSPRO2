'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('standalone print designer route exposes its page module',()=>{
  const page=read('pages/print-designer.html');
  const module=read('js/modules/project-detail.js');
  assert.match(page,/print-designer-project-select/);
  assert.match(module,/openPrintDesigner: function/);
  assert.match(module,/bindPrintDesigner: function/);
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
  assert.match(index,/project-print-designer\.css\?v=/);
  assert.match(index,/project-detail\.js\?v=20261101-standalone-print-designer-1/);
});


test('print designer is a standalone sidebar route with project selection',()=>{
 const layout=read('js/components/layout.js');
 const router=read('js/core/router.js');
 const page=read('pages/print-designer.html');
 const module=read('js/modules/project-detail.js');
 assert.match(layout,/route: 'print-designer', label: 'چاپ‌ساز'/);
 assert.match(router,/'print-designer': 'pages\/print-designer.html'/);
 assert.match(router,/'print-designer': \['PROJECT_VIEW'\]/);
 assert.match(page,/print-designer-project-select/);
 assert.match(module,/initPrintDesignerPage: async function/);
 assert.match(module,/loadStandalonePrintProject: async function/);
 assert.doesNotMatch(read('pages/project-detail.html'),/project-print-designer-open/);
});


test('form image attachments are loaded as inline images for project forms and print designer',()=>{
 const module=read('js/modules/project-detail.js');
 assert.match(module,/prepareProjectFormImages: async function/);
 assert.match(module,/data:image\//);
 assert.match(module,/project-form-inline-image/);
 assert.match(module,/renderProjectFormValue\(row && row\[String\(col\.Code\)\], col\.DataType\)/);
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
