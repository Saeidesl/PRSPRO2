'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseURL = (process.env.PMS_BASE_URL || 'http://127.0.0.1:4173/PRSPRO2/').replace(/\/?$/, '/');
const weights = [200, 300, 400, 500, 700, 900];
const expectedFiles = [
  'IRANSansWeb_UltraLight.woff2',
  'IRANSansWeb_Light.woff2',
  'IRANSansWeb.woff2',
  'IRANSansWeb_Medium.woff2',
  'IRANSansWeb_Bold.woff2',
  'IRANSansWeb_Black.woff2'
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const fontResponses = new Map();
    page.on('response', response => {
      const url = new URL(response.url());
      const filename = url.pathname.split('/').pop();
      if (expectedFiles.includes(filename)) fontResponses.set(filename, response.status());
    });

    const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    assert.ok(response && response.ok(), 'PMS page should load successfully at ' + baseURL);
    await page.waitForFunction(() => document.fonts && document.fonts.status !== 'loading');

    const result = await page.evaluate(async weightsToLoad => {
      const sample = 'سامانه مدیریت تولید؛ آزمون نمایش ایران‌سنس';
      const loaded = [];
      for (const weight of weightsToLoad) {
        const faces = await document.fonts.load(weight + ' 16px "IRANSansWeb"', sample);
        loaded.push({ weight, faceCount: faces.length, available: document.fonts.check(weight + ' 16px "IRANSansWeb"', sample) });
      }
      const selectors = ['body', 'button', 'input', 'select', 'textarea'];
      const computed = Object.fromEntries(selectors.map(selector => {
        const element = document.querySelector(selector) || document.createElement(selector);
        return [selector, getComputedStyle(element).fontFamily];
      }));
      return { loaded, computed };
    }, weights);

    for (const item of result.loaded) {
      assert.ok(item.faceCount > 0 && item.available, 'Font weight ' + item.weight + ' did not load in Chromium');
    }
    for (const selector of ['body', 'button', 'input', 'select', 'textarea']) {
      assert.match(result.computed[selector], /IRANSansWeb/, selector + ' should use IRANSansWeb');
    }
    for (const file of expectedFiles) {
      assert.equal(fontResponses.get(file), 200, file + ' should be served successfully');
    }

    console.log('PASS: Chromium loaded all six IRANSansWeb weights and verified global/control typography.');
    console.log(JSON.stringify({ baseURL, loadedWeights: result.loaded.map(item => item.weight), fontFiles: Object.fromEntries(fontResponses), computedFamilies: result.computed }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
