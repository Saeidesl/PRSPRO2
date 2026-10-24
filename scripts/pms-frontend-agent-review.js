'use strict';

// Read-only frontend review agent. It checks the frontend/backend integration
// contract and reviews added diff lines for high-risk browser APIs.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const findings = [];
const warnings = [];
function check(id, description, ok) {
  checks.push({ id, description, passed: Boolean(ok) });
  if (!ok) findings.push({ id, description });
}
function hasAll(source, patterns) {
  return patterns.every((pattern) => pattern.test(source));
}

const events = read('js/modules/events.js');
const eventTypes = read('js/modules/event-types.js');
const materialPlanning = read('js/modules/material-planning.js');
const appHtml = read('index.html');

check('EVENT-INTEGRATION-FAILURE-SURFACING',
  'The event form surfaces a failed procurement integration rather than implying that all work completed.',
  hasAll(events, [
    /procurementIntegration\.status[\s\S]{0,100}FAILED/,
    /showProcurementRetryNotice/,
    /محاسبه نیاز ملزومات کامل نشد/
  ]));
check('EVENT-INTEGRATION-RETRY',
  'The frontend has a recovery path for retrying a failed event-to-procurement integration.',
  /showProcurementRetryNotice/.test(events) && /PROCUREMENT_INTEGRATION_RETRY|retryProcurementIntegration|procurement-retry/i.test(events));
check('MATERIAL-PLANNING-UI',
  'The material-planning screen exposes specification and calculation history information.',
  hasAll(materialPlanning, [
    /ConsumptionPerUnit/,
    /WastagePercent/,
    /BasisQuantity/,
    /CalculatedQuantity/
  ]));
check('FRONTEND-ENTRYPOINT',
  'The frontend entry point and its primary event/material-planning modules exist.',
  appHtml.length > 0 && fs.existsSync(path.join(root, 'js/modules/events.js')) &&
    fs.existsSync(path.join(root, 'js/modules/material-planning.js')));

check('EVENT-TYPES-ROUTE-OWNED-INIT',
  'Event-type data is not fetched globally on the login page; the router initializes the module only when its route opens.',
  !/document\\.addEventListener\\(['"]DOMContentLoaded['"],\\s*init\\)/.test(eventTypes) &&
    !/else\\s*\\{\\s*init\\(\\);\\s*\\}/.test(eventTypes.slice(-500)));

let diff = '';
try {
  diff = execFileSync('git', ['diff', '--unified=0', 'origin/main...HEAD'], {
    cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024
  });
} catch (error) {
  console.error('Unable to inspect the PR diff. Ensure origin/main is fetched.', error.message);
  process.exit(2);
}
const added = diff.split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++'));
const risky = [
  { id: 'DYNAMIC-CODE', pattern: /\beval\s*\(|\bnew\s+Function\s*\(/, description: 'Added dynamic code execution (eval/new Function).' },
  { id: 'DOCUMENT-WRITE', pattern: /\bdocument\.write\s*\(/, description: 'Added document.write, which can replace the document and create injection risks.' }
];
for (const rule of risky) {
  const hits = added.filter((line) => rule.pattern.test(line));
  if (hits.length) findings.push({ id: rule.id, description: rule.description, examples: hits.slice(0, 5).map((line) => line.slice(1, 220)) });
  checks.push({ id: rule.id, description: rule.description, passed: hits.length === 0 });
}
const htmlHits = added.filter((line) => /\.innerHTML\s*=/.test(line) && /(\$\{|\+\s*[A-Za-z_$]|\+\s*\w+\.)/.test(line));
if (htmlHits.length) warnings.push({
  id: 'DYNAMIC-INNERHTML-REVIEW',
  description: 'Review new dynamic innerHTML assignments to ensure all user/API values are escaped.',
  examples: htmlHits.slice(0, 8).map((line) => line.slice(1, 220))
});

const report = {
  agent: 'PMS Frontend Contract and Diff Review Agent',
  mode: 'read-only deterministic review',
  passed: checks.filter((item) => item.passed).length,
  total: checks.length,
  checks,
  findings,
  warnings
};
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exitCode = 1;
