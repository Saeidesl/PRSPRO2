'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'modules', 'projects.js'), 'utf8');
  const start = source.indexOf('  function bindProjectModalKeyboard(overlay, onClose) {');
  const end = source.indexOf('\n  const CACHE_KEY', start);
  assert.ok(start >= 0 && end > start, 'could not find the production modal keyboard controller');
  const controller = source.slice(start, end) + '\nwindow.bindProjectModalKeyboard = bindProjectModalKeyboard;';

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html>
      <html lang="en">
      <head><meta charset="utf-8"><style>
        .overlay { position: fixed; inset: 0; display: block; }
        .overlay[hidden] { display: none; }
      </style></head>
      <body>
        <button id="opener" type="button">Open dialog</button>
        <div id="lower" class="overlay" hidden>
          <section role="dialog" aria-modal="true" aria-labelledby="lower-title">
            <h2 id="lower-title">Lower dialog</h2>
            <button id="lower-first" type="button">First lower</button>
            <button id="lower-last" type="button">Last lower</button>
          </section>
        </div>
        <div id="overlay" class="overlay">
          <section role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <h2 id="dialog-title">Project dialog</h2>
            <button id="first" type="button">First control</button>
            <button id="last" type="button">Last control</button>
          </section>
        </div>
      </body></html>`);
    await page.addScriptTag({ content: controller });

    const focusFirst = page.locator('#first');
    const focusLast = page.locator('#last');
    await page.locator('#opener').focus();
    await page.evaluate(() => {
      window.closeCount = 0;
      const overlay = document.querySelector('#overlay');
      window.projectKeyboard = window.bindProjectModalKeyboard(overlay, () => {
        window.closeCount += 1;
        overlay.remove();
      });
      window.projectKeyboard.focusFirst();
    });
    assert.equal(await page.evaluate(() => document.activeElement.id), 'first', 'initial focus should enter the dialog');

    await focusLast.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'first', 'Tab from the last control should wrap to the first');

    await focusFirst.focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'last', 'Shift+Tab from the first control should wrap to the last');

    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#overlay').count(), 0, 'Escape should close the active dialog');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'opener', 'closing should restore focus to the opener');
    assert.equal(await page.evaluate(() => window.closeCount), 1, 'close callback should run once');

    await page.evaluate(() => {
      const lower = document.querySelector('#lower');
      const upper = document.createElement('div');
      upper.id = 'upper';
      upper.className = 'overlay';
      upper.innerHTML = '<section role="dialog" aria-modal="true"><button id="upper-control">Upper</button></section>';
      lower.hidden = false;
      window.lowerCloseCount = 0;
      window.lowerKeyboard = window.bindProjectModalKeyboard(lower, () => {
        window.lowerCloseCount += 1;
        lower.remove();
      });
      document.body.appendChild(upper);
      window.upperKeyboard = window.bindProjectModalKeyboard(upper, () => upper.remove());
      window.upperKeyboard.focusFirst();
    });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#lower').count(), 1, 'Escape should not close a dialog behind the topmost dialog');
    assert.equal(await page.locator('#upper').count(), 0, 'Escape should close the topmost dialog');
    assert.equal(await page.evaluate(() => window.lowerCloseCount), 0, 'lower dialog close callback must not run');

    console.log('PASS: real Chromium DOM keyboard behavior (focus, Tab/Shift+Tab, Escape, focus restore, topmost dialog).');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
