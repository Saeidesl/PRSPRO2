'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

function loadReports() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'reports.js'), 'utf8');
  const storage = new Map();
  const sections = ['project', 'events', 'needs', 'calculations', 'orders'].map((name) => ({
    checked: true,
    getAttribute: (key) => key === 'data-report-section' ? name : null
  }));
  const status = { hidden: true, textContent: '', className: '' };
  const controls = {
    'project-report-event-search': { value: '' },
    'project-report-event-from': { value: '' },
    'project-report-event-to': { value: '' },
    'project-report-event-sort': { value: 'newest' },
    'project-report-template-name': { value: '' },
    'project-report-template-list': { value: '', innerHTML: '' },
    'project-report-status': status
  };
  const createdUrls = [];
  const fakeUrl = {
    createObjectURL: (blob) => { createdUrls.push(blob); return 'blob:test-report'; },
    revokeObjectURL: () => {}
  };
  class FakeBlob {
    constructor(parts, options) { this.parts = parts; this.options = options; }
    text() { return Promise.resolve(this.parts.join('')); }
  }
  const link = { href: '', download: '', clicked: false, click() { this.clicked = true; }, remove() {} };
  const document = {
    body: { appendChild() {} },
    getElementById: (id) => controls[id] || null,
    querySelectorAll: (selector) => selector === '[data-report-section]' ? sections : [],
    createElement: (tag) => tag === 'a' ? link : {}
  };
  const window = {
    PMS: { Modules: {} },
    localStorage: {
      getItem: (key) => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value))
    }
  };
  const context = { window, document, URL: fakeUrl, Blob: FakeBlob, console, Intl, Date, isFinite };
  vm.runInNewContext(source, context, { filename: 'reports.js' });
  return { Reports: window.PMS.Modules.Reports, controls, sections, storage, createdUrls, link, status };
}

test('report event filters search across event fields, constrain dates, and sort by date', () => {
  const { Reports, controls } = loadReports();
  const events = [
    { ID: 'E1', EventTypeName: 'Sewing started', DepartmentName: 'Sewing', OccurredAt: '2026-10-01T12:00:00Z' },
    { ID: 'E2', EventTypeName: 'Cutting completed', DepartmentName: 'Cutting', OccurredAt: '2026-10-02T12:00:00Z' },
    { ID: 'E3', EventTypeName: 'Packing', DepartmentName: 'Packaging', OccurredAt: '2026-10-03T12:00:00Z' }
  ];

  controls['project-report-event-search'].value = 'cutting';
  assert.deepEqual(Array.from(Reports.filterEvents(events), (event) => event.ID), ['E2']);

  controls['project-report-event-search'].value = '';
  controls['project-report-event-from'].value = '2026-10-01';
  controls['project-report-event-to'].value = '2026-10-02';
  assert.deepEqual(Array.from(Reports.filterEvents(events), (event) => event.ID), ['E2', 'E1']);

  controls['project-report-event-from'].value = '';
  controls['project-report-event-to'].value = '';
  controls['project-report-event-sort'].value = 'oldest';
  assert.deepEqual(Array.from(Reports.filterEvents(events), (event) => event.ID), ['E1', 'E2', 'E3']);
});

test('report templates save and restore section, search, date, and sort settings', () => {
  const { Reports, controls, sections, storage, status } = loadReports();
  sections[1].checked = false;
  controls['project-report-event-search'].value = 'دوخت';
  controls['project-report-event-from'].value = '2026-10-01';
  controls['project-report-event-to'].value = '2026-10-20';
  controls['project-report-event-sort'].value = 'oldest';
  controls['project-report-template-name'].value = 'گزارش مدیر تولید';

  Reports.saveTemplate();
  assert.ok(storage.has('pms_project_report_templates_v1'));
  const saved = JSON.parse(storage.get('pms_project_report_templates_v1'));
  assert.equal(saved['گزارش مدیر تولید'].sections.events, false);
  assert.equal(saved['گزارش مدیر تولید'].search, 'دوخت');
  assert.equal(saved['گزارش مدیر تولید'].sort, 'oldest');

  sections[1].checked = true;
  controls['project-report-event-search'].value = '';
  controls['project-report-template-list'].value = 'گزارش مدیر تولید';
  Reports.applyTemplate();
  assert.equal(sections[1].checked, false);
  assert.equal(controls['project-report-event-search'].value, 'دوخت');
  assert.equal(controls['project-report-event-sort'].value, 'oldest');
  assert.equal(status.hidden, false);
});

test('CSV export includes selected project, event, procurement, and calculation data', async () => {
  const { Reports, controls, sections, createdUrls, link } = loadReports();
  Reports.currentReport = {
    project: { ID: 'P1', ProjectCode: 'PR-1', Title: 'پروژه آزمایشی', Quantity: 20, Status: 'ACTIVE' },
    events: [{ ID: 'E1', EventTypeName: 'برش', DepartmentName: 'برش', Quantity: 20, OccurredAt: '2026-10-01T12:00:00Z' }],
    procurement: {
      needs: [{ ItemName: 'پارچه', RequiredQuantity: 50 }],
      calculations: [{ MaterialSpecName: 'پارچه', CalculatedQuantity: 50 }],
      orders: [{ ID: 'O1', Status: 'ORDERED', Items: [{ ItemName: 'پارچه', Status: 'ORDERED' }] }]
    }
  };
  Reports.selectedEventIds = ['E1'];
  Reports.exportCsv();
  assert.equal(link.clicked, true);
  assert.equal(link.download, 'project-report-PR-1.csv');
  assert.equal(createdUrls.length, 1);
  const csv = await createdUrls[0].text();
  assert.match(csv, /PR-1/);
  assert.match(csv, /برش/);
  assert.match(csv, /پارچه/);
  assert.match(csv, /مقدار محاسبه‌شده/);
  assert.equal(controls['project-report-event-search'].value, '');
  assert.equal(sections.every((section) => section.checked), true);
});
