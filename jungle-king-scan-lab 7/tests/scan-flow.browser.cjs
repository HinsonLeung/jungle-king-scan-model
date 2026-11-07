// Optional browser QA. Stub inference checks wiring, not recognition accuracy.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, permissions: ['camera'] });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.SCAN_LAB_URL || 'http://localhost:5173/prototype.html');
    await page.waitForFunction(() => document.querySelector('#profile-state').textContent.includes('8 animal'));
    const card = page.locator('#profile-card');
    assert.equal(await card.isVisible(), false);
    assert.equal(await page.locator('.animal-tile, #animal-library, #manual-buttons').count(), 0);
    assert.equal(await page.locator('#profile-illustration img').count(), 0);
    assert.equal(await page.locator('#demo-controls').isVisible(), false);
    assert.equal(await page.locator('#setup').evaluate(e => e.open), false);
    assert.equal(await page.locator('input[value=qr]').isChecked(), true);
    await page.screenshot({ path: '/private/tmp/jungle-scan-default.png', fullPage: true });

    await page.locator('.demo-tools summary').click();
    await page.locator('input[value=demo]').check();
    const species = await page.evaluate(async () => (await (await fetch('./species.json')).json()).profiles);
    for (const profile of species) {
      await page.locator('#demo-piece').selectOption(profile.pieceId);
      assert.equal(await card.isVisible(), false);
      await page.locator('#demo-scan').click();
      assert.equal(await card.isVisible(), true);
      assert.equal(await page.locator('#animal-name').textContent(), profile.name);
      assert.match(await page.locator('#result-origin').textContent(), /DEMO EVENT/);
      assert.ok(await page.locator('#source-list li').count() >= 2);
      assert.equal(await page.locator('.profile-card:visible').count(), 1);
    }
    assert.equal(await page.locator('#mapping-note').isVisible(), true);
    await page.locator('#scan-another').click();
    assert.equal(await card.isVisible(), false);
    await page.locator('#demo-scan').click();
    await page.locator('#demo-piece').selectOption('other');
    assert.equal(await card.isVisible(), false);
    await page.locator('#demo-scan').click();
    assert.equal(await card.isVisible(), false);
    await page.locator('#demo-piece').selectOption('elephant_piece');
    await page.locator('#demo-scan').click();
    await page.locator('#animate').click();
    assert.equal(await page.locator('#profile-illustration').evaluate(e => e.classList.contains('moving')), true);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: '/private/tmp/jungle-scan-result-mobile.png', fullPage: true });
    await page.locator('input[value=trained]').check();
    assert.equal(await card.isVisible(), false);
    await page.locator('.demo-tools summary').click();
    await page.screenshot({ path: '/private/tmp/jungle-scan-default-mobile.png', fullPage: true });

    await page.route('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.tf={};' }));
    await page.route('https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js', route => route.fulfill({ contentType: 'text/javascript', body: `
      window.fakePrediction=[{className:'tiger_piece',probability:.97},{className:'other',probability:.03}];
      window.predictionCount=0; window.predictionLimit=3;
      window.tmImage={load:async()=>({getClassLabels:()=>['tiger_piece','elephant_piece','other'],predict:async()=>{
        while(window.predictionCount>=window.predictionLimit) await new Promise(r=>setTimeout(r,20));
        window.predictionCount++;return window.fakePrediction;
      },model:{dispose(){}}})};` }));
    await page.locator('#setup summary').click();
    await page.locator('#model-url').fill('/models/recognition/');
    await page.locator('#load-model-url').click();
    await page.waitForFunction(() => document.querySelector('#model-connection-status').textContent.startsWith('Model connected'));
    await page.locator('#start-camera').click();
    await page.waitForFunction(() => document.querySelector('#camera').readyState >= 2);
    await page.locator('#scan-trained').click();
    await page.waitForFunction(() => window.predictionCount === 3);
    assert.equal(await card.isVisible(), false, 'Three matching frames cannot reveal the card');
    await page.evaluate(() => window.predictionLimit = Infinity);
    await page.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    assert.equal(await page.locator('#animal-name').textContent(), 'Malayan Tiger');
    assert.match(await page.locator('#result-origin').textContent(), /MODEL RESULT.*tiger_piece/);
    await page.evaluate(() => window.fakePrediction = [{ className: 'elephant_piece', probability: .98 }, { className: 'other', probability: .02 }]);
    await page.waitForFunction(() => document.querySelector('#profile-card').hidden);
    await page.waitForFunction(() => !document.querySelector('#profile-card').hidden && document.querySelector('#animal-name').textContent === 'Asian Elephant');
    await page.evaluate(() => window.fakePrediction = [{ className: 'tiger_piece', probability: .7 }, { className: 'other', probability: .3 }]);
    await page.waitForFunction(() => document.querySelector('#profile-card').hidden);
    await page.evaluate(() => window.fakePrediction = [{ className: 'tiger_piece', probability: .99 }]);
    await page.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    await page.evaluate(() => window.fakePrediction = [{ className: 'other', probability: .99 }]);
    await page.waitForFunction(() => document.querySelector('#profile-card').hidden);
    await page.evaluate(() => window.fakePrediction = [{ className: 'elephant_piece', probability: .99 }]);
    await page.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    await page.locator('#scan-another').click();
    assert.equal(await card.isVisible(), false);
    assert.equal(await page.locator('#stop-recognition').isDisabled(), true);
    await page.locator('#scan-trained').click();
    await page.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    await page.locator('#stop-camera').click();
    assert.equal(await card.isVisible(), false);
    assert.equal(await page.locator('#camera').evaluate(e => e.srcObject), null);
    assert.deepEqual(errors, []);
    console.log('Passed: scanner-only default, all eight matching demo cards, reset, mobile layout, four-frame confirmation, changed animal, uncertain/unknown rejection, and camera cleanup. Stub inference does not establish ML accuracy.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
