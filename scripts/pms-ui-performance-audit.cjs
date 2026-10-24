'use strict';

// Browser-based PMS inventory and performance audit.
// Safe by default: no form is submitted and destructive/data-changing actions are never invoked.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseURL = (process.env.PMS_BASE_URL || 'https://saeidesl.github.io/PRSPRO2/').replace(/\/?$/, '/');
const username = process.env.PMS_TEST_USERNAME || '';
const password = process.env.PMS_TEST_PASSWORD || '';
const routes = [
  'login', 'dashboard', 'projects', 'project-detail', 'events', 'workflows',
  'project-statuses', 'event-types', 'procurement', 'attachments', 'reports',
  'users', 'departments', 'roles', 'permissions', 'audit', 'settings', 'admin'
];
const dangerousAction = /ثبت|ذخیره|حذف|پاک.?کردن|ارسال|تحویل|تأیید|تایید|ایجاد|افزودن|ویرایش|آپلود|بارگذاری فایل|خروج|ورود|لغو سفارش|اعمال تغییر|انتشار|دریافت فایل|دانلود/i;
const results = {
  schemaVersion: 1,
  suite: 'PMS Comprehensive UI and Performance Audit',
  generatedAt: new Date().toISOString(),
  baseURL,
  mode: username && password ? 'authenticated-read-only' : 'public-login-and-shell-only',
  safety: {
    formSubmission: 'disabled',
    destructiveActions: 'never-clicked',
    sensitiveValuesRecorded: false,
    note: 'This suite inventories every reachable form/control and measures navigation/network timing. Data-changing workflows require explicit staging scenarios and are not submitted by this audit.'
  },
  summary: {},
  routes: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  coverageGaps: [],
  overallStatus: 'running'
};
const started = new Map();
let browser;

// These controls are intended to open an editor/dialog only. The audit inventories
// the resulting fields and closes the dialog; it never fills or submits a form.
const formOpenersByRoute = {
  projects: ['project-create-button'],
  // Project-detail dialogs require a selected project and are not tested context-free.
  events: ['event-create-button'],
  workflows: ['workflow-create-button'],
  'project-statuses': ['project-status-create'],
  'event-types': ['event-type-create-button'],
  procurement: ['procurement-create-project-order', 'procurement-create-general-order', 'procurement-create-receipt'],
  // File upload opens a native file chooser, so keep it out of automated dialog clicks.
  users: ['user-create-button'],
  departments: ['department-create-button'],
  roles: ['role-create-button']
};

async function inventoryDialogForms(page) {
  return page.evaluate(() => {
    const visible = el => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (node.hidden || node.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      }
      return true;
    };
    const labelFor = el => {
      if (el.labels && el.labels.length) return Array.from(el.labels).map(x => x.innerText.trim()).join(' ');
      return el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || el.name || el.id || '';
    };
    const dialogs = Array.from(document.querySelectorAll('.modal-overlay,.modal,[role="dialog"],dialog')).filter(visible);
    const activeDialogs = dialogs.filter(dialog => dialog.querySelector('form,input,select,textarea,[contenteditable="true"]'));
    const root = activeDialogs.length ? activeDialogs[activeDialogs.length - 1] : (document.querySelector('#page-content') || document.body);
    const forms = Array.from(root.querySelectorAll('form')).filter(visible).map((form, index) => ({
      index, id: form.id || '', name: form.getAttribute('name') || '',
      method: (form.getAttribute('method') || 'get').toUpperCase(),
      fieldCount: form.querySelectorAll('input,select,textarea,[contenteditable="true"]').length,
      requiredCount: form.querySelectorAll('[required]').length,
      submitCount: form.querySelectorAll('button[type="submit"],input[type="submit"],button:not([type])').length,
      fields: Array.from(form.querySelectorAll('input,select,textarea,[contenteditable="true"]')).map(el => ({
        id: el.id || '', name: el.name || '', type: el.type || el.tagName.toLowerCase(),
        label: labelFor(el).trim().slice(0, 120), required: !!el.required, disabled: !!el.disabled
      }))
    }));
    const visibleControls = Array.from(root.querySelectorAll('input,select,textarea,[contenteditable="true"]')).filter(visible).length;
    const dialog = activeDialogs.length > 0;
    return { forms, dialogVisible: dialog, visibleControls };
  });
}

function safeLabel(el) {
  return String(el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.value || el.name || el.id || '').trim().replace(/\s+/g, ' ').slice(0, 160);
}
function classifyButton(button) {
  const label = safeLabel(button);
  const type = String(button.getAttribute('type') || '').toLowerCase();
  if (type === 'submit' || button.closest('form')) return 'form-or-submit-not-invoked';
  if (dangerousAction.test(label)) return 'potentially-mutating-not-invoked';
  if (button.disabled || button.getAttribute('aria-disabled') === 'true') return 'disabled-not-invoked';
  return 'safe-candidate';
}

// GAS places the actual API route in a query parameter. Log only the route,
// never the full query string, which may contain IDs, filters, or tokens.
function safeRequestPath(url) {
  const rawApiPath = url.searchParams.get('path') || url.searchParams.get('route') || '';
  if (/\/macros\/s\/.*\/exec/i.test(url.pathname) && rawApiPath) {
    const segments = rawApiPath.split('?')[0].split('/').filter(Boolean).map((segment, index) => {
      if (/^[0-9]+$/.test(segment) && index > 0) return ':id';
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) || /^[0-9a-f]{20,}$/i.test(segment) || /^[A-Z]{2,}_[A-Za-z0-9]{20,}$/i.test(segment)) return ':id';
      return segment.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80) || ':segment';
    });
    return '/api/' + segments.join('/');
  }
  return url.pathname.split('/').map(segment => /^[A-Za-z0-9_-]{20,}$/.test(segment) ? ':id' : segment).join('/');
}
async function main() {
  fs.mkdirSync(path.join(process.cwd(), 'test-results'), { recursive: true });
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const normalizedRoute = () => (page.url().split('#')[1] || 'unknown').split('/')[0];
  page.on('console', msg => {
    if (msg.type() === 'error') results.consoleErrors.push({ type: 'console', message: msg.text().replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[id]').replace(/[0-9a-f]{20,}/gi, '[id]').slice(0, 300), route: normalizedRoute() });
  });
  page.on('pageerror', error => results.pageErrors.push({ message: String(error.message || error).replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[id]').replace(/[0-9a-f]{20,}/gi, '[id]').slice(0, 300), stack: String(error.stack || '').replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[id]').replace(/[0-9a-f]{20,}/gi, '[id]').slice(0, 700), route: normalizedRoute() }));
  page.on('request', request => {
    started.set(request, Date.now());
  });
  page.on('requestfailed', request => {
    const url = new URL(request.url());
    results.network.push({ path: safeRequestPath(url), method: request.method(), status: 'failed', durationMs: started.has(request) ? Date.now() - started.get(request) : null, failure: String(request.failure()?.errorText || 'request failed').slice(0, 160) });
  });
  page.on('response', response => {
    const request = response.request();
    const url = new URL(response.url());
    const durationMs = started.has(request) ? Date.now() - started.get(request) : null;
    if (url.origin !== new URL(baseURL).origin || /\/exec|googleusercontent|script\.google/i.test(url.hostname + url.pathname) || request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
      results.network.push({ path: safeRequestPath(url), method: request.method(), status: response.status(), durationMs });
    }
  });

  const initialStart = Date.now();
  await page.goto(baseURL + '#login', { waitUntil: 'domcontentloaded' });
  try { await page.locator('#login-form').waitFor({ state: 'visible', timeout: 10000 }); } catch (_) {}
  const loginReadyMs = Date.now() - initialStart;
  const loginForm = page.locator('#login-form');
  let authenticated = false;
  if (username && password && await loginForm.count()) {
    await page.locator('#login-username').fill(username);
    await page.locator('#login-password').fill(password);
    const loginStart = Date.now();
    await page.locator('#login-button').click();
    try {
      await page.waitForFunction(() => !location.hash.includes('login'), null, { timeout: 15000 });
      authenticated = true;
    } catch (_) {
      results.coverageGaps.push('Login did not reach an authenticated route; protected-page audit was not completed.');
    }
    results.login = { loginFormReadyMs: loginReadyMs, loginAttemptMs: Date.now() - loginStart, authenticated };
  } else {
    results.login = { loginFormReadyMs: loginReadyMs, authenticated: false, note: 'Set repository secrets PMS_TEST_USERNAME and PMS_TEST_PASSWORD to audit permission-protected pages.' };
  }

  const routeList = authenticated ? routes.filter(route => route !== 'login') : ['login'];
  for (const route of routeList) {
    const start = Date.now();
    // Load each route in a fresh document so dialogs from previous routes cannot leak.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(routeName => {
      if (window.PMS && window.PMS.Router && typeof window.PMS.Router.navigate === 'function') window.PMS.Router.navigate(routeName, false);
      else location.hash = routeName;
    }, route);
    const previousUrl = page.url();
    try {
      await page.waitForFunction(routeName => {
        const hash = location.hash.replace(/^#/, '').split('/')[0];
        return hash === routeName || (routeName === 'login' && !!document.querySelector('#login-form'));
      }, route, { timeout: 10000 });
    } catch (_) {}
    try { await page.locator('#page-content, #login-form, .login-page').first().waitFor({ state: 'visible', timeout: 8000 }); } catch (_) {}
    try { await page.waitForLoadState('networkidle', { timeout: 2500 }); } catch (_) {}
    await page.waitForTimeout(150);

    const snapshot = await page.evaluate(({ routeName, startUrl }) => {
      const root = document.querySelector('#page-content') || document.querySelector('.login-page') || document.body;
const visible = el => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (node.hidden || node.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
        }
        return true;
      };
      const labelFor = el => {
        if (el.labels && el.labels.length) return Array.from(el.labels).map(x => x.innerText.trim()).join(' ');
        return el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || el.name || el.id || '';
      };
      const forms = Array.from(root.querySelectorAll('form')).filter(visible).map((form, index) => ({
        index, id: form.id || '', name: form.getAttribute('name') || '', action: form.getAttribute('action') || '',
        method: (form.getAttribute('method') || 'get').toUpperCase(),
        fieldCount: form.querySelectorAll('input,select,textarea,[contenteditable="true"]').length,
        requiredCount: form.querySelectorAll('[required]').length,
        submitCount: form.querySelectorAll('button[type="submit"],input[type="submit"],button:not([type])').length,
        nativeValidity: form.checkValidity(),
        fields: Array.from(form.querySelectorAll('input,select,textarea,[contenteditable="true"]')).map(el => ({
          id: el.id || '', name: el.name || '', type: el.type || el.tagName.toLowerCase(),
          label: labelFor(el).trim().slice(0, 120), required: !!el.required, disabled: !!el.disabled
        }))
      }));
      const buttons = Array.from(root.querySelectorAll('button,input[type="button"],input[type="submit"],[role="button"]')).filter(visible).map((el, index) => {
        const rawId = el.id || '';
        const dynamicId = /[0-9a-f]{8}-[0-9a-f-]{27,}|[0-9a-f]{20,}|[A-Z]{2,}_[A-Za-z0-9]{20,}/i.test(rawId);
        const id = dynamicId ? '' : rawId;
        // Never persist visible labels or opaque IDs from data-backed project/item rows.
        const rawLabel = (el.innerText || el.getAttribute('aria-label') || el.title || el.value || '').trim().replace(/\\s+/g, ' ');
        return { index, id, label: id ? rawLabel.slice(0, 100) : 'dynamic-button', type: el.getAttribute('type') || '', disabled: !!el.disabled, inForm: !!el.closest('form') };
      });
      const linkCount = Array.from(root.querySelectorAll('a[href]')).filter(visible).length;
      const controls = Array.from(root.querySelectorAll('input,select,textarea,[contenteditable="true"]')).filter(visible);
      const nav = Array.from(document.querySelectorAll('a[href^="#"],button[data-route], [data-route]')).filter(visible).map(el => {
        const rawRoute = el.getAttribute('data-route') || (el.getAttribute('href') || '').replace(/^#/, '');
        return { label: 'navigation-link', route: rawRoute.split('/')[0] };
      }).filter(item => item.route);
      const bodyText = (root.innerText || '').replace(/\s+/g, ' ').slice(0, 500);
      return {
        requestedRoute: routeName, currentHash: location.hash.replace(/^#/, '').split('/')[0],
        urlChanged: location.href !== startUrl, title: document.title,
        contentVisible: !!root && visible(root), denied: /اجازه مشاهده این صفحه را ندارید|دسترسی ندارید|عدم دسترسی/.test(bodyText),
        errorVisible: /خطا در بارگذاری صفحه|سامانه به‌درستی راه‌اندازی نشد/.test(bodyText),
        forms, buttons, linkCount, navigation: nav, visibleControlCount: controls.length,
        visibleTextLength: bodyText.length
      };
    }, { routeName: route, startUrl: previousUrl });
    snapshot.navigationMs = Date.now() - start;
    snapshot.status = snapshot.errorVisible ? 'error' : snapshot.denied ? 'permission-denied' : snapshot.contentVisible ? 'loaded' : 'not-confirmed';

    // Re-check each reachable route at a common mobile viewport and record overflow
    // without storing page text or any user/project values.
    await page.setViewportSize({ width: 390, height: 844 });
    snapshot.mobileLayout = await page.evaluate(() => {
      const root = document.querySelector('#page-content') || document.querySelector('.login-page') || document.body;
const visible = el => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (node.hidden || node.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
        }
        return true;
      };
      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > window.innerWidth + 1,
        visibleForms: Array.from(root.querySelectorAll('form')).filter(visible).length,
        visibleButtons: Array.from(root.querySelectorAll('button,input[type="button"],input[type="submit"],[role="button"]')).filter(visible).length,
        visibleControls: Array.from(root.querySelectorAll('input,select,textarea,[contenteditable="true"]')).filter(visible).length
      };
    });
    await page.setViewportSize({ width: 1365, height: 900 });

    snapshot.dynamicFormInventory = [];
    if (authenticated) {
      for (const openerId of (formOpenersByRoute[route] || [])) {
        try {
          // Use a fresh document for each launcher; do not remove app DOM by force.
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.evaluate(routeName => {
            if (window.PMS && window.PMS.Router && typeof window.PMS.Router.navigate === 'function') window.PMS.Router.navigate(routeName, false);
            else location.hash = routeName;
          }, route);
          try { await page.waitForFunction(routeName => location.hash.replace(/^#/, '').split('/')[0] === routeName, route, { timeout: 10000 }); } catch (_) {}
          try { await page.locator('#page-content').waitFor({ state: 'visible', timeout: 8000 }); } catch (_) {}
          try { await page.waitForLoadState('networkidle', { timeout: 2500 }); } catch (_) {}
          await page.waitForTimeout(250);
          const opener = page.locator('[id="' + openerId + '"]').first();
          if (!(await opener.count()) || !(await opener.isVisible()) || !(await opener.isEnabled())) {
            snapshot.dynamicFormInventory.push({ openerId, opened: false, reason: 'opener-not-visible-or-enabled', forms: [] });
            continue;
          }
          const before = await inventoryDialogForms(page);
          await opener.evaluate(el => el.click());
          await page.waitForFunction((baselineCount) => {
            const visible = el => { const rect = el.getBoundingClientRect(); if (rect.width <= 0 || rect.height <= 0) return false; for (let node = el; node && node !== document.documentElement; node = node.parentElement) { const style = getComputedStyle(node); if (node.hidden || node.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false; } return true; };
            const formCount = Array.from(document.querySelectorAll('form')).filter(visible).length;
            const dialogVisible = Array.from(document.querySelectorAll('.modal-overlay,.modal,[role="dialog"],dialog')).filter(visible).some(dialog => dialog.querySelector('form,input,select,textarea,[contenteditable="true"]'));
            return formCount > baselineCount || dialogVisible;
          }, before.forms.length, { timeout: 2500 }).catch(() => {});
          const inventory = await inventoryDialogForms(page);
          // Include every form visible after the opener click, including templates that
          // are already present in the DOM but only become relevant within this dialog.
          snapshot.dynamicFormInventory.push({ openerId, opened: inventory.dialogVisible || inventory.forms.length > 0 || inventory.visibleControls > before.visibleControls, baselineFormCount: before.forms.length, baselineVisibleControls: before.visibleControls, visibleControls: inventory.visibleControls, forms: inventory.forms });
        } catch (error) {
          snapshot.dynamicFormInventory.push({ openerId, opened: false, error: String(error.message || error).slice(0, 180), forms: [] });
        }
      }
    }
    snapshot.forms.forEach(form => {
      if (form.fieldCount === 0) results.coverageGaps.push(route + ': visible form ' + (form.id || form.index) + ' has no fields; review manually.');
    });
    const knownSubmitCount = snapshot.forms.reduce((sum, form) => sum + form.submitCount, 0);
    if (knownSubmitCount) results.coverageGaps.push(route + ': ' + knownSubmitCount + ' submit control(s) inventoried but not submitted by the safe audit.');
    results.routes.push(snapshot);
  }

  // Safe interaction smoke test: click only obvious non-submit utility buttons, one at a time.
  // Never click buttons inside forms or labels that imply data changes.
  if (authenticated) {
    for (const routeResult of results.routes.filter(item => item.requestedRoute !== 'login' && item.status === 'loaded')) {
      await page.evaluate(routeName => window.PMS.Router.navigate(routeName, false), routeResult.requestedRoute).catch(() => {});
      try { await page.waitForTimeout(250); } catch (_) {}
      const safeButtons = routeResult.buttons.filter(button => !button.inForm && !button.disabled && !dangerousAction.test(button.label) && button.type.toLowerCase() !== 'submit' && button.id);
      for (const button of safeButtons) {
        try {
          const locator = page.locator('#page-content').locator('[id="' + button.id.replace(/"/g, '\\"') + '"]').first();
          if (await locator.count() && await locator.isVisible() && await locator.isEnabled()) {
            const before = await page.locator('#page-content').innerText().catch(() => '');
            await locator.click({ timeout: 1200 });
            await page.waitForTimeout(100);
            const after = await page.locator('#page-content').innerText().catch(() => '');
            routeResult.safeButtonChecks = routeResult.safeButtonChecks || [];
            routeResult.safeButtonChecks.push({ id: button.id, label: button.label, clickCompleted: true, visibleContentChanged: before !== after });
          }
        } catch (error) {
          routeResult.safeButtonChecks = routeResult.safeButtonChecks || [];
          routeResult.safeButtonChecks.push({ id: button.id, label: button.label, clickCompleted: false, error: String(error.message || error).slice(0, 180) });
        }
      }
    }
  }

  const allForms = results.routes.reduce((n, route) => n + route.forms.length + (route.dynamicFormInventory || []).reduce((m, item) => m + (item.forms || []).length, 0), 0);
  const dynamicForms = results.routes.reduce((n, route) => n + (route.dynamicFormInventory || []).reduce((m, item) => m + (item.forms || []).length, 0), 0);
  const formOpenersChecked = results.routes.reduce((n, route) => n + (route.dynamicFormInventory || []).length, 0);
  const allButtons = results.routes.reduce((n, route) => n + route.buttons.length, 0);
  const allInputs = results.routes.reduce((n, route) => n + route.visibleControlCount, 0);
  const failedRoutes = results.routes.filter(route => route.status === 'error' || route.status === 'not-confirmed').length;
  results.summary = {
    requestedRoutes: routeList.length,
    loadedRoutes: results.routes.filter(route => route.status === 'loaded').length,
    permissionDeniedRoutes: results.routes.filter(route => route.status === 'permission-denied').length,
    failedRoutes,
    mobileRoutesWithHorizontalOverflow: results.routes.filter(route => route.mobileLayout && route.mobileLayout.horizontalOverflow).length,
    visibleFormsInventoried: allForms,
    dynamicFormsInventoried: dynamicForms,
    formOpenersChecked,
    visibleButtonsInventoried: allButtons,
    visibleInputsAndControlsInventoried: allInputs,
    networkRequestsMeasured: results.network.length,
    failedNetworkRequests: results.network.filter(item => item.status === 'failed' || (typeof item.status === 'number' && item.status >= 400)).length,
    consoleErrors: results.consoleErrors.length,
    pageErrors: results.pageErrors.length,
    safeButtonChecks: results.routes.reduce((n, route) => n + (route.safeButtonChecks || []).length, 0),
    formSubmissionsExecuted: 0
  };
  results.overallStatus = failedRoutes || results.pageErrors.length ? 'needs-attention' : (authenticated ? 'authenticated-audit-complete' : 'limited-no-test-credentials');
  results.coverageGaps = [...new Set(results.coverageGaps)];
  fs.writeFileSync(path.join(process.cwd(), 'test-results', 'latest-performance-report.json'), JSON.stringify(results, null, 2) + '\n');
  fs.writeFileSync(path.join(process.cwd(), 'test-results', 'latest-performance-report.md'), renderMarkdown(results));
  console.log(JSON.stringify({ summary: results.summary, overallStatus: results.overallStatus, report: 'test-results/latest-performance-report.json' }, null, 2));
  await browser.close();
  if (failedRoutes || results.pageErrors.length) process.exitCode = 1;
}
function renderMarkdown(report) {
  const lines = [
    '# PMS UI and Performance Audit',
    '',
    '- Generated: ' + report.generatedAt,
    '- Base URL: ' + report.baseURL,
    '- Mode: ' + report.mode,
    '- Overall: **' + report.overallStatus + '**',
    '',
    '## Summary',
    '',
    '| Metric | Result |',
    '|---|---:|',
    ...Object.entries(report.summary).map(([key, value]) => '| ' + key + ' | ' + value + ' |'),
    '',
    '## Routes',
    '',
    '| Route | Status | Navigation ms | Forms | Buttons | Controls | Mobile overflow |',
    '|---|---|---:|---:|---:|---:|---|',
    ...report.routes.map(route => '| ' + route.requestedRoute + ' | ' + route.status + ' | ' + route.navigationMs + ' | ' + route.forms.length + ' | ' + route.buttons.length + ' | ' + route.visibleControlCount + ' | ' + (route.mobileLayout && route.mobileLayout.horizontalOverflow ? 'YES' : 'no') + ' |'),
    '',
    '## Coverage gaps',
    '',
    ...(report.coverageGaps.length ? report.coverageGaps.map(item => '- ' + item) : ['- None detected by automated inventory.']),
    '',
    '## Safety',
    '',
    '- No form was submitted.',
    '- Potentially destructive or data-changing buttons were not clicked.',
    '- This report is an inventory/performance smoke test, not proof that every business workflow is functionally correct.',
    ''
  ];
  return lines.join('\n');
}
main().catch(async error => {
  results.overallStatus = 'runner-error';
  results.runnerError = String(error.stack || error).slice(0, 1500);
  try {
    fs.mkdirSync(path.join(process.cwd(), 'test-results'), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), 'test-results', 'latest-performance-report.json'), JSON.stringify(results, null, 2) + '\n');
  } catch (_) {}
  console.error(error);
  if (browser) await browser.close().catch(() => {});
  process.exitCode = 1;
});
