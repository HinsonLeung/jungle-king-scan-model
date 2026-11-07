// Public/prototype separation and future-model wiring; camera and inference are simulated.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.PUBLIC_SITE_URL || new URL('/', process.env.SCAN_LAB_URL || 'http://localhost:5173/').href;

async function cameraContext(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async constraints => {
      window.requestedCamera = constraints;
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
      const ctx = canvas.getContext('2d');
      const timer = setInterval(() => { ctx.fillStyle = '#ddd'; ctx.fillRect(0, 0, 640, 480); }, 60);
      const stream = canvas.captureStream(15);
      const track = stream.getTracks()[0], stop = track.stop.bind(track);
      track.stop = () => { clearInterval(timer); stop(); };
      window.testCameraStream = stream;
      return stream;
    };
  });
  return context;
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    const context = await cameraContext(browser), page = await context.newPage(), errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('#profile-state')?.textContent.includes('8 animal'));
    assert.equal(await page.locator('body').getAttribute('data-page'), 'website');
    assert.equal(await page.locator('#scan-qr, #demo-scan, #setup, input[name=mode]').count(), 0);
    assert.equal(await page.locator('#trained-controls').isVisible(), false);
    assert.equal(await page.locator('#profile-card').isVisible(), false);
    for (const [width, height] of [[1280,900],[390,844],[320,640],[844,390]]) {
      await page.setViewportSize({ width, height });
      for (const language of ['zh', 'en']) {
        await page.locator(`#language-${language}`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const bounds = await page.locator('.language-controls').boundingBox();
        assert.ok(bounds.x > width / 2 && bounds.y < 45 && bounds.x + bounds.width <= width, 'Language control is at the top right');
      }
    }
    await page.setViewportSize({ width:1280, height:900 });
    await page.screenshot({ path:'/private/tmp/jungle-website-desktop.png', fullPage:true });
    await page.locator('#language-zh').click();
    assert.equal(await page.locator('#scan-title').textContent(), '掃描棋子。');
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hant');
    await page.reload();
    assert.equal(await page.locator('#language-zh').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#start-camera').textContent(), '啟用相機');
    await page.setViewportSize({ width:390, height:844 });
    await page.screenshot({ path:'/private/tmp/jungle-website-mobile-zh.png', fullPage:true });
    await page.locator('#start-camera').click();
    await page.waitForFunction(() => document.querySelector('#camera').readyState >= 2);
    assert.equal(await page.locator('#scan-status').textContent(), '相機預覽已就緒。');
    assert.equal(await page.evaluate(() => requestedCamera.video.facingMode.ideal), 'environment');
    assert.equal(await page.locator('#profile-card').isVisible(), false);
    assert.equal(await page.locator('#trained-controls').isVisible(), false);
    await page.locator('#language-en').click();
    assert.equal(await page.locator('#scan-status').textContent(), 'Camera preview is ready.');
    await page.locator('#stop-camera').click();
    assert.equal(await page.evaluate(() => testCameraStream.getTracks()[0].readyState), 'ended');
    assert.equal(await page.locator('#camera').evaluate(el => el.srcObject), null);
    assert.equal(await page.locator('#start-camera').isVisible(), true);
    assert.equal(requests.some(url => /zxing|model-viewer|tiger-test\.glb|tensorflow/.test(url)), false, 'Main does not load test or unconfigured recognition libraries');
    await page.locator('#language-zh').click();
    await page.locator('#prototype-link').click();
    await page.waitForFunction(() => document.querySelector('#profile-state')?.textContent.includes('8 animal'));
    assert.equal(await page.locator('body').getAttribute('data-page'), 'prototype');
    assert.equal(await page.locator('#language-zh').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#scan-qr').isVisible(), true);
    assert.equal(await page.locator('#setup').count(), 1);
    await page.locator('.back-link').click();
    await page.locator('#scan-title').waitFor();
    assert.equal(await page.locator('#scan-title').textContent(), '掃描棋子。');
    assert.deepEqual(errors, []);
    await context.close();

    // Simulate a configured future model without editing production config or claiming accuracy.
    const modelContext = await cameraContext(browser), modelPage = await modelContext.newPage(), modelErrors = [], modelRequests = [];
    modelPage.on('pageerror', error => modelErrors.push(error.message));
    modelPage.on('request', request => modelRequests.push(request.url()));
    await modelPage.route('**/site-config.js', route => route.fulfill({ contentType:'text/javascript', body:"export const recognitionModelFolder='/models/recognition/';" }));
    await modelPage.route('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js', route => route.fulfill({ contentType:'text/javascript', body:'window.tf={};' }));
    await modelPage.route('https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js', route => route.fulfill({ contentType:'text/javascript', body:`
      window.fakePrediction=[{className:'tiger_piece',probability:.97},{className:'other',probability:.03}];
      window.predictionCount=0; window.predictionLimit=3;
      window.tmImage={load:async()=>({getClassLabels:()=>['tiger_piece','other'],predict:async()=>{
        while(window.predictionCount>=window.predictionLimit) await new Promise(r=>setTimeout(r,20));
        window.predictionCount++;return window.fakePrediction;
      },model:{dispose(){}}})};` }));
    await modelPage.goto(base);
    await modelPage.waitForFunction(() => !document.querySelector('#trained-controls').hidden);
    assert.equal(await modelPage.locator('#preparation-note').isVisible(), false);
    await modelPage.locator('#start-camera').click();
    await modelPage.waitForFunction(() => document.querySelector('#camera').readyState >= 2);
    await modelPage.locator('#scan-trained').click();
    await modelPage.waitForFunction(() => window.predictionCount === 3);
    assert.equal(await modelPage.locator('#profile-card').isVisible(), false);
    await modelPage.evaluate(() => window.predictionLimit = Infinity);
    await modelPage.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    assert.equal(await modelPage.locator('#animal-name').textContent(), 'Malayan Tiger');
    assert.equal(await modelPage.locator('#model-panel').isVisible(), false, 'Test GLB is excluded from main');
    assert.equal(await modelPage.locator('#animation-panel').isVisible(), false);
    assert.equal(await modelPage.locator('#result-origin').isVisible(), false);
    await modelPage.locator('#language-zh').click();
    assert.equal(await modelPage.locator('#animal-name').textContent(), '馬來亞虎');
    await modelPage.evaluate(() => window.fakePrediction = [{className:'other',probability:.99}]);
    await modelPage.waitForFunction(() => document.querySelector('#profile-card').hidden);
    assert.equal(modelRequests.some(url => /model-viewer|tiger-test\.glb/.test(url)), false);
    await modelPage.locator('#stop-camera').click();
    assert.deepEqual(modelErrors, []);
    await modelContext.close();
    console.log('Passed: main/prototype separation, top-right language control at four sizes, bilingual persistence, camera lifecycle, future model confirmation/rejection and test-placeholder exclusion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
