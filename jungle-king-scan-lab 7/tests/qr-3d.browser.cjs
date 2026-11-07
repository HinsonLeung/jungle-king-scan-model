// Real decoder and real 3D viewer. Camera frames come from a generated-card stream.
// These checks do not establish hardware camera permissions or mobile AR support.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const QRCode = require('qrcode');
const base = process.env.SCAN_LAB_URL || 'http://localhost:5173/prototype.html';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    await context.addInitScript(() => {
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0,0,640,480);
      window.showQr = async source => {
        const image = new Image(); image.src = source; await image.decode();
        ctx.fillStyle = 'white'; ctx.fillRect(0,0,640,480); ctx.drawImage(image,160,80,320,320);
      };
      navigator.mediaDevices.getUserMedia = async constraints => {
        window.requestedCamera = constraints;
        window.testCameraStream = canvas.captureStream(15);
        const timer = setInterval(() => ctx.drawImage(canvas,0,0), 60);
        window.testCameraStream.getTracks()[0].addEventListener('ended', () => clearInterval(timer));
        return window.testCameraStream;
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('#profile-state').textContent.includes('8 animal'));
    const profiles = await page.evaluate(async () => (await (await fetch('./species.json')).json()).profiles);
    const card = page.locator('#profile-card');
    assert.equal(await card.isVisible(), false);
    await page.locator('#start-camera').click();
    await page.waitForFunction(() => document.querySelector('#camera').readyState >= 2);
    assert.equal(await page.evaluate(() => requestedCamera.video.facingMode.ideal), 'environment');
    await page.locator('#scan-qr').click();
    await page.waitForTimeout(400);
    assert.equal(await card.isVisible(), false, 'Empty frame cannot reveal an animal');
    const foreign = await QRCode.toDataURL('https://example.com/?piece=tiger_piece');
    await page.evaluate(source => window.showQr(source), foreign);
    await page.waitForFunction(() => document.querySelector('#scan-status').textContent.includes('not a Jungle King'));
    assert.equal(await card.isVisible(), false, 'Foreign QR cannot reveal an animal');
    await page.locator('#stop-qr').click();
    for (const profile of profiles) {
      await page.evaluate(source => window.showQr(source), new URL(`assets/qr/${profile.pieceId}.png`, base).href);
      // Let the video consume the replacement frame before resuming the scanner.
      await page.waitForTimeout(200);
      await page.locator('#scan-qr').click();
      try {
        await page.waitForFunction(name => !document.querySelector('#profile-card').hidden && document.querySelector('#animal-name').textContent === name, profile.name, { timeout: 10000 });
      } catch (error) {
        console.error(profile.pieceId, await page.evaluate(() => ({ status: document.querySelector('#scan-status').textContent, name: document.querySelector('#animal-name').textContent, hidden: document.querySelector('#profile-card').hidden, camera: document.querySelector('#camera').readyState })), errors);
        throw error;
      }
      assert.match(await page.locator('#result-origin').textContent(), new RegExp(`QR TEST CARD.*${profile.pieceId}`));
      assert.equal(await page.locator('.profile-card:visible').count(), 1);
      assert.equal(await page.locator('#stop-qr').isDisabled(), true, 'Confirmed QR pauses scanning');
      await page.locator('#language-zh').click();
      assert.match(await page.locator('#animal-name').textContent(), /[\u3400-\u9fff]/);
      assert.match(await page.locator('#result-origin').textContent(), /QR 測試卡/);
      if (profile.pieceId === 'rat_piece') {
        assert.match(await page.locator('#mapping-note').textContent(), /仍需確認/);
        assert.match(await page.locator('#conservation-status').textContent(), /大不列顛/);
      }
      await page.locator('#language-en').click();
      if (profile.pieceId === 'tiger_piece') {
        await page.locator('#model-viewer').scrollIntoViewIfNeeded();
        try {
          await page.waitForFunction(() => document.querySelector('#model-viewer').loaded);
        } catch (error) {
          console.error(await page.locator('#model-panel').textContent(), errors);
          throw error;
        }
        assert.deepEqual(await page.locator('#model-viewer').evaluate(v => v.availableAnimations), ['Head nod and tail sway']);
        assert.match(await page.locator('#model-placeholder-note').textContent(), /TEST PLACEHOLDER/);
        await page.locator('#animate').click();
        await page.waitForFunction(() => document.querySelector('#model-viewer').currentTime > .15);
        await page.locator('#language-zh').click();
        assert.equal(await page.locator('#model-viewer').evaluate(v => v.paused), false, 'Language switch preserves playback');
        assert.match(await page.locator('#animate').textContent(), /暫停/);
        await page.locator('#animate').click();
        assert.equal(await page.locator('#model-viewer').evaluate(v => v.paused), true);
        await page.locator('#language-en').click();
        await page.locator('#model-viewer').scrollIntoViewIfNeeded();
        const orbit = await page.locator('#model-viewer').evaluate(v => v.getCameraOrbit().theta);
        const bounds = await page.locator('#model-viewer').boundingBox();
        await page.mouse.move(bounds.x + bounds.width*.5, bounds.y + 100);
        await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width*.75, bounds.y + 120, { steps: 10 }); await page.mouse.up();
        await page.waitForFunction(before => Math.abs(document.querySelector('#model-viewer').getCameraOrbit().theta - before) > .05, orbit);
        assert.equal(await page.locator('#model-viewer').getAttribute('ar-modes'), 'webxr scene-viewer quick-look');
        for (const [width,height] of [[390,844],[320,640],[844,390]]) {
          await page.setViewportSize({ width,height });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('#language-zh').click();
        await page.locator('#model-viewer').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await page.screenshot({ path: '/private/tmp/jungle-qr-tiger-mobile.png', fullPage: true });
        await page.locator('#language-en').click();
        await page.setViewportSize({ width:1280,height:1000 });
        await page.locator('#model-viewer').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await page.locator('#model-viewer').screenshot({ path: '/private/tmp/jungle-tiger-viewer.png' });
        await page.screenshot({ path: '/private/tmp/jungle-qr-tiger-desktop.png', fullPage: true });
      }
      await page.locator('#scan-another').click();
      assert.equal(await card.isVisible(), false);
      assert.equal(await page.locator('#model-viewer').getAttribute('src'), null);
    }
    // Scan the same card again after reset.
    await page.locator('#scan-qr').click();
    await page.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    await page.locator('#stop-camera').click();
    assert.equal(await card.isVisible(), false);
    assert.equal(await page.evaluate(() => testCameraStream.getTracks()[0].readyState), 'ended');
    await page.locator('#language-zh').click(); await page.reload();
    assert.equal(await page.locator('#language-zh').getAttribute('aria-pressed'), 'true');
    assert.equal(await card.isVisible(), false);
    await page.goto(new URL('qr-cards.html', base).href);
    assert.equal(await page.locator('article').count(), 8);
    await page.setViewportSize({ width:390,height:844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.setViewportSize({ width:794,height:1123 });
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path:'/private/tmp/jungle-qr-cards-print.png', fullPage:true });
    assert.deepEqual(errors, []);
    const retryPage = await context.newPage(), retryErrors = [];
    retryPage.on('pageerror', error => retryErrors.push(error.message));
    await retryPage.route('**/vendor/zxing-browser.min.js', route => route.abort());
    await retryPage.route('**/vendor/model-viewer.min.js', route => route.abort());
    await retryPage.goto(base);
    await retryPage.locator('#language-en').click();
    await retryPage.locator('#start-camera').click();
    await retryPage.waitForFunction(() => document.querySelector('#camera').readyState >= 2);
    await retryPage.evaluate(source => window.showQr(source), new URL('assets/qr/tiger_piece.png', base).href);
    await retryPage.waitForTimeout(200);
    await retryPage.locator('#scan-qr').click();
    await retryPage.waitForFunction(() => document.querySelector('#scan-status').textContent.includes('QR scanning stopped'));
    assert.equal(await retryPage.locator('#scan-qr').isEnabled(), true);
    assert.equal(await retryPage.locator('#profile-card').isVisible(), false);
    await retryPage.unroute('**/vendor/zxing-browser.min.js');
    await retryPage.locator('#scan-qr').click();
    await retryPage.waitForFunction(() => !document.querySelector('#profile-card').hidden);
    await retryPage.waitForFunction(() => document.querySelector('#model-status').textContent.includes('viewer unavailable'));
    assert.equal(await retryPage.locator('#animate').isEnabled(), true);
    await retryPage.unroute('**/vendor/model-viewer.min.js');
    await retryPage.locator('#scan-another').click();
    await retryPage.locator('#scan-qr').click();
    await retryPage.waitForFunction(() => !document.querySelector('#model-panel').hidden);
    await retryPage.locator('#model-viewer').scrollIntoViewIfNeeded();
    await retryPage.waitForFunction(() => document.querySelector('#model-viewer').loaded);
    await retryPage.waitForFunction(() => !document.querySelector('#animate').disabled);
    assert.equal(await retryPage.locator('#animate').isEnabled(), true);
    assert.deepEqual(retryErrors, []);
    const denied = await browser.newContext();
    await denied.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied','NotAllowedError'); }; });
    const deniedPage = await denied.newPage(); await deniedPage.goto(base);
    await deniedPage.locator('#start-camera').click();
    await deniedPage.waitForFunction(() => document.querySelector('#scan-status').textContent.includes('permission was denied'));
    assert.equal(await deniedPage.locator('#profile-card').isVisible(), false);
    assert.equal(await deniedPage.locator('#start-camera').isEnabled(), true);
    console.log('Passed: real QR decoder on all eight camera-stream cards, foreign/empty rejection, repeat/reset, camera cleanup, bilingual cards/persistence, real GLB load/play/pause/rotation, mobile layouts, printable cards, library failure/retry and denied-permission recovery. Mobile AR remains unverified.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
