'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('information type and table-column editors expose image and file data types',()=>{
  const module=read('js/modules/information-types.js');
  assert.equal((module.match(/<option value="image">تصویر<\/option>/g)||[]).length,3);
  assert.equal((module.match(/<option value="file">فایل<\/option>/g)||[]).length,3);
});

test('project information supports upload, preview, download and attachment references',()=>{
  const module=read('js/modules/project-detail.js');
  assert.match(module,/data-information-file-input/);
  assert.match(module,/uploadInformationFile: async function/);
  assert.match(module,/AttachmentType: 'INFORMATION'/);
  assert.match(module,/openInformationAttachment: async function/);
  assert.match(module,/\/attachments\/' \+ encodeURIComponent\(attachmentId\) \+ '\/download/);
  assert.match(module,/renderInformationValue: function/);
});

test('reusable event forms upload image and file values to the selected project before event submission',()=>{
  const module=read('js/modules/events.js');
  assert.match(module,/collectConfiguredFormResponses: async function \(projectId\)/);
  assert.match(module,/uploadConfiguredFormFile: async function/);
  assert.match(module,/await this\.collectConfiguredFormResponses\(projectId\)/);
  assert.match(module,/AttachmentType:attachmentType/);
  assert.match(module,/: 'INFORMATION'/);
  assert.match(module,/بارگذاری فایل در رویداد مستقل امکان‌پذیر نیست/);
});
