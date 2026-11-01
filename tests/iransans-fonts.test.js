const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const fontCss = fs.readFileSync(path.join(root, 'css', 'fonts.css'), 'utf8');
const variables = fs.readFileSync(path.join(root, 'css', 'variables.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fontDirectory = path.join(root, 'fonts');

const weights = [200, 300, 400, 500, 700, 900];
for (const weight of weights) {
  assert.match(fontCss, new RegExp('font-weight:\\s*' + weight + ';'));
}
for (const file of [
  'IRANSansWeb_UltraLight.woff2',
  'IRANSansWeb_Light.woff2',
  'IRANSansWeb.woff2',
  'IRANSansWeb_Medium.woff2',
  'IRANSansWeb_Bold.woff2',
  'IRANSansWeb_Black.woff2'
]) {
  assert.ok(fontCss.includes('../fonts/' + file), 'Missing font-face reference: ' + file);
  assert.ok(fs.existsSync(path.join(fontDirectory, file)), 'Missing font asset: fonts/' + file);
}
assert.match(variables, /--font-family:\s*["']?IRANSansWeb/);
assert.match(index, /css\/fonts\.css/);
assert.match(fontCss, /font-display:\s*swap/);
console.log('IRANSans font configuration checks passed.');
