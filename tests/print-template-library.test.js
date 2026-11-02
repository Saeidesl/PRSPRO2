'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('template library uses central CRUD and source catalog APIs',()=>{
 const module=read('js/modules/print-designer.js');
 const page=read('pages/print-designer.html');
 assert.ok(module.includes("PMS.Api.get('/print-templates')"));
 assert.ok(module.includes("PMS.Api.get('/print-templates/sources')"));
 assert.ok(module.includes("PMS.Api.post('/print-templates'"));
 assert.ok(module.includes("PMS.Api.put('/print-templates/'"));
 assert.ok(module.includes("PMS.Api.delete('/print-templates/'"));
 assert.match(page,/pt-source-list/);
 assert.match(page,/pt-binding-list/);
});

test('template bindings use stable project, central-information and form field identifiers',()=>{
 const module=read('js/modules/print-designer.js');
 assert.match(module,/sourceType: 'PROJECT_FIELD'/);
 assert.match(module,/sourceType: 'PROJECT_INFORMATION'/);
 assert.match(module,/sourceType: 'EVENT_FORM_FIELD'/);
 assert.match(module,/informationTypeId: field\.InformationTypeID/);
 assert.match(module,/selection: 'LATEST'/);
});

test('document output resolves a shared template against the selected project',()=>{
 const module=read('js/modules/print-designer.js');
 const page=read('pages/print-output.html');
 assert.match(page,/pt-output-template/);
 assert.match(page,/pt-output-project/);
 assert.ok(module.includes("PMS.Api.post('/print-templates/' + encodeURIComponent(templateId) + '/resolve'"));
 assert.match(module,/resolveOutput: async function/);
});

test('print routes no longer initialize the project detail module',()=>{
 const router=read('js/core/router.js');
 const index=read('index.html');
 assert.ok(router.includes("'print-design': 'PrintDesigner'"));
 assert.ok(router.includes("'print-output': 'PrintDesigner'"));
 assert.match(index,/js\/modules\/print-designer\.js\?v=/);
 assert.match(index,/css\/print-template-library\.css\?v=/);
 assert.doesNotMatch(router,/'print-output': 'ProjectDetail'/);
});

test('template library stylesheet is responsive and uses application theme variables',()=>{
 const css=read('css/print-template-library.css');
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(css,/var\(--text-secondary/);
 assert.match(css,/var\(--border-color/);
});

test('print designer module parses and is loaded exactly once',()=>{
 const module=read('js/modules/print-designer.js');
 assert.doesNotThrow(()=>new vm.Script(module,{filename:'print-designer.js'}));
 const index=read('index.html');
 assert.equal(index.split('js/modules/print-designer.js').length - 1,1);
});


test('visual editor module parses and exposes canvas interactions',()=>{
 const module=read('js/modules/print-designer.js');
 const page=read('pages/print-designer.html');
 const css=read('css/print-template-library.css');
 assert.doesNotThrow(()=>new vm.Script(module,{filename:'print-designer.js'}));
 for(const token of ['bindEditor: function','createElement: function','renderCanvas: function','renderInspector: function','commitHistory: function','undo: function','redo: function','pointermove','pointerup','data-pt-resize']) assert.ok(module.includes(token),token);
 for(const id of ['pt-design-canvas','pt-inspector-fields','pt-page-size','pt-page-orientation','pt-prop-columns','pt-prop-rows','pt-prop-color','pt-prop-background','pt-prop-selection','pt-layer-list','pt-editor-source-list','pt-source-count']) assert.ok(page.includes(id),id);
 assert.match(css,/\.pt-design-canvas\{position:relative/);
 assert.match(css,/\.pt-canvas-element\.is-selected/);
 assert.match(css,/\.pt-editor-layout/);
});

test('visual editor persists page layout and supports editable table rows and layer order',()=>{
 const module=read('js/modules/print-designer.js');
 assert.match(module,/definition\.elements\.push\(item\)/);
 assert.match(module,/definition\.page\.size/);
 assert.match(module,/pt-prop-rows/);
 assert.match(module,/pt-prop-columns/);
 assert.match(module,/layer-up/);
 assert.match(module,/layer-down/);
 assert.match(module,/previewMode/);
 assert.match(module,/Promise\.allSettled/);
 assert.match(module,/pt-editor-source-list/);
 assert.match(module,/sourceError/);
 assert.match(module,/اتصال/);
 assert.match(module,/pt-prop-selection/);
 assert.match(module,/color:' \+ this\.esc\(item\.color/);
 assert.match(module,/background:' \+ this\.esc\(item\.background/);
 assert.match(module,/Definition: this\.definition/);
});

test('mobile template editor presents a guided workflow with collapsible tool panels',()=>{
 const page=read('pages/print-designer.html');
 const css=read('css/print-template-library.css');
 assert.match(page,/مرحله ۱: طراحی صفحه/);
 assert.match(page,/مرحله ۲: تنظیم المان انتخاب‌شده/);
 assert.match(page,/مرحله ۳: اتصال اطلاعات/);
 assert.match(page,/مرحله ۴: نام‌گذاری و ذخیره قالب/);
 assert.match(page,/<details class="[^"]*pt-saved-templates"/);
 assert.match(page,/<details class="pt-mobile-tools"/);
 assert.match(page,/<details class="pt-editor-source-picker"/);
 assert.match(page,/<details class="pt-layer-details"/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/\.pt-toolbar-actions\{display:grid/);
 assert.match(css,/\.pt-mobile-tools-body/);
});


test('print output page exposes a real document preview and print action',()=>{
  const root=path.join(__dirname,'..');
  const page=fs.readFileSync(path.join(root,'pages/print-output.html'),'utf8');
  const module=fs.readFileSync(path.join(root,'js/modules/print-designer.js'),'utf8');
  const styles=fs.readFileSync(path.join(root,'css/print-template-library.css'),'utf8');
  assert.match(page,/id="pt-output-preview"/);
  assert.match(page,/id="pt-output-print"/);
  assert.match(module,/renderOutputDocument/);
  assert.match(module,/window\.print\(\)/);
  assert.match(styles,/body\.pt-printing/);
});


test('drawing toolbar supports editable line, divider, rectangle and ellipse elements in editor and print output',()=>{
 const module=read('js/modules/print-designer.js');
 const page=read('pages/print-designer.html');
 const css=read('css/print-template-library.css');
 for(const action of ['add-line','add-divider','add-rectangle','add-ellipse']) assert.ok(page.includes('data-pt-action="'+action+'"'),action);
 for(const type of ['line','divider','rectangle','ellipse']) { assert.ok(module.includes("createElement('"+type+"'"),type); assert.ok(module.includes('pt-output-'+type),type+' output'); }
 assert.match(module,/pt-shape-outline/);
 assert.match(module,/pt-shape-line/);
 assert.match(css,/\.pt-output-rectangle/);
 assert.match(css,/\.pt-output-divider/);
});


test('print output resolves secure image attachments and waits for images before printing',()=>{
 const module=read('js/modules/print-designer.js');
 const css=read('css/print-template-library.css');
 assert.match(module,/findImageAttachment: function/);
 assert.match(module,/loadOutputImage: async function/);
 assert.match(module,/\/attachments\/.*\/download/);
 assert.match(module,/await this\.renderOutputDocument/);
 assert.match(module,/image\.decode/);
 assert.match(module,/pt-output-image-content/);
 assert.match(css,/\.pt-output-image-content/);
});
