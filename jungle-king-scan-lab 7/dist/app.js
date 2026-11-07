import './components.js';
import { validateProfiles, createLabelMap, choosePrediction, StableResult, conservationSummary, resolveQrPayload } from './pipeline.js';
import { localizedProfile, cardText, cardLabelIds, siteText, siteLabelIds } from './content.js';
import { recognitionModelFolder } from './site-config.js';

const $ = id => document.getElementById(id);
const prototypePage = document.body.dataset.page === 'prototype';
let profiles = [], labelMap = new Map(), selected = null, stream = null, model = null;
let mode = prototypePage ? 'qr' : 'trained', running = false, runVersion = 0, cameraVersion = 0, assetVersion = 0, modelBusy = false, profilesReady = false;
let qrReader = null;
let publicStatusKey = '', publicStatusError = false;
let language = 'en', resultOrigin = null, resultScore = null;
try { if (localStorage.getItem('jungle-king-card-language') === 'zh-Hant') language = 'zh-Hant'; } catch {}
const text = key => cardText(language, key);
const qrFrame = document.createElement('canvas');
const qrContext = qrFrame.getContext('2d', { willReadFrequently: true });
const stability = new StableResult(4);
const frame = document.createElement('canvas');
frame.width = frame.height = 224;
const context = frame.getContext('2d');
const scripts = new Map();
const scriptRetries = new Map();

function status(message, error = false) {
  $('scan-status').textContent = message;
  $('scan-status').classList.toggle('error', error);
}
function connectionStatus(message, error = false) {
  if (!$('model-connection-status')) return;
  $('model-connection-status').textContent = message;
  $('model-connection-status').classList.toggle('error', error);
}
function publicStatus(key, error = false) {
  publicStatusKey = key; publicStatusError = error;
  status(key ? siteText(language, key) : '', error);
}
function updateButtons() {
  $('scan-trained').disabled = !model || !stream || running || modelBusy;
  if ($('scan-qr')) $('scan-qr').disabled = !profilesReady || !stream || running;
  if ($('stop-qr')) $('stop-qr').disabled = !running || mode !== 'qr';
  $('stop-recognition').disabled = !running || mode !== 'trained';
  $('stop-camera').disabled = !stream;
  $('start-camera').disabled = !!stream;
  if ($('load-model-url')) $('load-model-url').disabled = modelBusy;
  if ($('model-files')) $('model-files').disabled = modelBusy;
  if (!prototypePage) {
    $('start-camera').hidden = !!stream;
    $('stop-camera').hidden = !stream;
    $('camera-tag').hidden = !stream;
    $('trained-controls').hidden = !model;
    $('preparation-note').hidden = !!model;
  }
}
function loadScript(url, module = false) {
  if (scripts.has(url)) return scripts.get(url);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    if (module) script.type = 'module';
    const retry = scriptRetries.get(url) || 0;
    const source = new URL(url, location.href);
    // Browsers remember failed ES-module fetches for the same URL until reload.
    if (module && retry) source.searchParams.set('retry', String(retry));
    script.src = source.href;
    script.onload = resolve;
    script.onerror = () => { script.remove(); scripts.delete(url); scriptRetries.set(url, retry + 1); reject(new Error('Could not load a library. Check your internet connection and try again.')); };
    document.head.append(script);
  });
  scripts.set(url, promise);
  return promise;
}
async function recognitionLibraries() {
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js');
  if (!window.tmImage) throw new Error('Recognition library unavailable.');
}

function fillArtwork(element, profile, lazy = false) {
  element.replaceChildren();
  const art = profile?.artwork;
  if (!art) return;
  const [x, y, width, height] = art.crop;
  element.style.aspectRatio = `${width} / ${height}`;
  const img = document.createElement('img');
  img.src = art.file; img.alt = `${profile.name} game piece, from the supplied campaign screenshot`;
  img.width = art.width; img.height = art.height;
  img.loading = lazy ? 'lazy' : 'eager';
  img.style.width = `${art.width / width * 100}%`;
  img.style.left = `${-x / width * 100}%`;
  img.style.top = `${-y / height * 100}%`;
  element.append(img);
}
function setIllustration(id) {
  const profile = profiles.find(p => p.pieceId === id);
  if (!profile) return;
  fillArtwork($('profile-illustration'), profile);
}
function addSources(element, profile) {
  element.replaceChildren();
  for (const source of profile.sources || []) {
    const href = safeAsset(source.url);
    if (!href) continue;
    const li = document.createElement('li'), link = document.createElement('a');
    link.href = href; link.textContent = source.name; link.target = '_blank'; link.rel = 'noopener';
    li.append(link); element.append(li);
  }
}
function researchDate(profile) {
  const date = profile.checkedOn || '';
  return date ? `Sources checked: ${date}. ${profile.conservation.assessmentDate ? `Assessment: ${profile.conservation.assessmentDate}.` : 'Primary assessment date not verified in the linked summary; not inferred from the check date.'}` : 'Research date pending.';
}
function secondaryStatus(profile) {
  return (profile.conservation.secondary || []).map(s => `${s.category} · ${s.scope}${s.assessmentYear ? ` (${s.assessmentYear})` : ''}`).join('; ');
}
function safeAsset(value) {
  if (!value) return null;
  try {
    const url = new URL(value, location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function hideProfile() {
  assetVersion++;
  selected = null;
  $('profile-content').hidden = true;
  $('profile-card').hidden = true;
  $('scan-workspace').classList.remove('has-result');
  $('review-status').textContent = 'SOURCED STORIES';
  $('animate').textContent = text('play');
  $('animate').disabled = false;
  $('profile-illustration').classList.remove('moving');
  $('model-panel').hidden = true;
  const viewer = $('model-viewer');
  if (viewer.pause) viewer.pause();
  viewer.removeAttribute('src'); viewer.removeAttribute('ios-src');
  $('flow-profile').classList.remove('active');
  $('flow-animation').classList.remove('active');
  $('profile-state').textContent = `${profiles.length} animal profiles connected`;
  $('animation-state').textContent = 'Artwork ready · 3D optional';
}
async function connect3D(profile) {
  const version = ++assetVersion;
  const glb = !prototypePage && profile.assets.placeholder ? null : safeAsset(profile.assets.glb), usdz = safeAsset(profile.assets.usdz);
  const viewer = $('model-viewer');
  viewer.removeAttribute('src'); viewer.removeAttribute('ios-src');
  $('model-panel').hidden = true;
  $('animation-panel').hidden = !prototypePage && !glb;
  $('model-placeholder-note').hidden = !profile.assets.placeholder;
  $('model-placeholder-note').textContent = profile.assets.placeholder ? text('placeholder') : '';
  $('animation-description').textContent = text('artwork');
  $('animation-state').textContent = 'Artwork connected · add a GLB for 3D';
  if (!glb) return;
  $('animate').disabled = true;
  $('animation-description').textContent = text('loading');
  try {
    await loadScript('./vendor/model-viewer.min.js', true);
    await customElements.whenDefined('model-viewer');
    if (selected !== profile || version !== assetVersion) return;
    viewer.alt = `${profile.name} ${profile.assets.placeholder ? 'test placeholder' : '3D model'}`;
    viewer.setAttribute('src', glb);
    if (usdz) viewer.setAttribute('ios-src', usdz);
    $('model-panel').hidden = false;
    $('model-status').textContent = 'Loading 3D model…';
    $('animation-description').textContent = text('loading');
    $('animation-state').textContent = '3D model loading';
  } catch (error) {
    if (selected === profile && version === assetVersion) {
      $('model-panel').hidden = false;
      $('animate').disabled = false;
      $('animation-description').textContent = 'Artwork motion preview · 3D viewer unavailable';
      $('model-status').textContent = `3D viewer unavailable: ${error.message}`;
      $('animation-state').textContent = '3D viewer could not load';
    }
  }
}
function renderCard(original, origin, score) {
  const profile = localizedProfile(original, language), pieceId = profile.pieceId;
  $('profile-card').lang = language;
  for (const id of cardLabelIds) $(id).textContent = text(id);
  $('animal-name').textContent = profile.name;
  $('pin-id').textContent = `PIN · ${pieceId}`;
  $('scientific-name').textContent = profile.scientificName || '學名待補充';
  $('animal-intro').textContent = profile.intro || '動物簡介待補充。';
  $('habitat').textContent = profile.habitat || '棲息地資料待補充。';
  $('threats').textContent = profile.threats || '主要威脅待補充。';
  $('protection').textContent = profile.protection || '保育措施待補充。';
  $('animal-fact').textContent = profile.fact || '補充資料待補充。';
  $('review-status').textContent = text(profile.mappingStatus === 'provisional' ? 'provisional' : profile.reviewed ? 'sourced' : 'draft');
  $('mapping-note').hidden = profile.mappingStatus !== 'provisional';
  $('mapping-note').textContent = text('mapping');
  $('conservation-status').textContent = conservationSummary(profile);
  $('secondary-status').textContent = secondaryStatus(profile);
  $('conservation-note').textContent = profile.conservation.note || '';
  addSources($('source-list'), profile);
  $('source').textContent = language === 'zh-Hant' ? `來源查核日期：${profile.checkedOn}。${profile.conservation.assessmentDate ? `評估日期：${profile.conservation.assessmentDate}。` : '連結摘要中的主要評估日期尚未核實；不會以查核日期代替。'}` : researchDate(profile);
  $('result-origin').textContent = language === 'zh-Hant'
    ? origin === 'demo' ? `模擬示範 · ${pieceId} · 未辨識相機影像` : origin === 'qr' ? `QR 測試卡 · ${pieceId} · 代碼辨識` : `模型結果 · ${pieceId} · ${(score * 100).toFixed(0)}% 模型分數`
    : origin === 'demo' ? `DEMO EVENT · ${pieceId} · no camera recognition` : origin === 'qr' ? `QR TEST CARD · ${pieceId} · code identification` : `MODEL RESULT · ${pieceId} · ${(score * 100).toFixed(0)}% model score`;
  $('model-placeholder-note').textContent = original.assets.placeholder ? text('placeholder') : '';
}
function showProfile(pieceId, origin, score = null) {
  const profile = profiles.find(p => p.pieceId === pieceId);
  if (!profile) { hideProfile(); status('No profile is mapped to this result. Try scanning again.', true); return; }
  selected = profile; resultOrigin = origin; resultScore = score;
  $('animate').textContent = text('play');
  $('profile-card').hidden = false;
  $('scan-workspace').classList.add('has-result');
  $('profile-content').hidden = false;
  renderCard(profile, origin, score);
  $('flow-origin').textContent = origin === 'demo' ? 'Demo event connected' : origin === 'qr' ? 'QR test card connected' : 'Camera result connected';
  $('flow-camera').classList.add('active');
  $('flow-recognition').classList.add('active');
  $('flow-profile').classList.add('active');
  $('flow-animation').classList.add('active');
  $('input-state').textContent = origin === 'demo' ? 'Simulated scan event' : 'Live camera frame';
  $('recognition-state').textContent = origin === 'demo' ? 'Chosen example · no AI inference' : origin === 'qr' ? 'Decoded test-card ID' : 'Stable model prediction';
  $('profile-state').textContent = `${pieceId} → ${profile.name}`;
  setIllustration(pieceId);
  $('profile-illustration').classList.remove('moving');
  connect3D(profile);
}
function setLanguage(value) {
  language = value;
  try { localStorage.setItem('jungle-king-card-language', value); } catch {}
  $('language-en').setAttribute('aria-pressed', String(value === 'en'));
  $('language-zh').setAttribute('aria-pressed', String(value === 'zh-Hant'));
  if (!prototypePage) {
    document.documentElement.lang = value;
    for (const id of siteLabelIds) $(id).textContent = siteText(value, id);
    $('camera').setAttribute('aria-label', siteText(value, 'cameraLabel'));
    publicStatus(publicStatusKey, publicStatusError);
    if (stream) updateCameraTag();
  }
  if (selected) {
    renderCard(selected, resultOrigin, resultScore);
    const viewer = $('model-viewer');
    $('animate').textContent = text(selected.assets.glb && viewer.loaded && !viewer.paused ? 'pause' : 'play');
    $('animation-description').textContent = text(selected.assets.glb && viewer.loaded ? selected.assets.placeholder ? 'animation' : 'embedded' : 'artwork');
    if (selected.assets.glb && viewer.loaded) $('model-status').textContent = text('modelLoaded');
  }
}
$('language-en').addEventListener('click', () => setLanguage('en'));
$('language-zh').addEventListener('click', () => setLanguage('zh-Hant'));
setLanguage(language);

function stopRecognition(announce = true) {
  running = false; runVersion++; stability.reset(); updateButtons();
  if (announce) {
    if (!prototypePage) publicStatus('paused');
    else status(mode === 'qr' ? 'QR scanning paused. Start QR scanning to try again.' : 'Recognition paused. Start recognition to try again.');
  }
}
function stopCamera(announce = true) {
  cameraVersion++;
  stopRecognition(false); hideProfile();
  stream?.getTracks().forEach(track => track.stop()); stream = null;
  $('camera').srcObject = null; $('camera').hidden = true; $('stage-art').hidden = false;
  $('camera-tag').textContent = 'Camera off';
  updateButtons();
  if (announce) { if (!prototypePage) publicStatus('stopped'); else status('Camera stopped. Demo scans still work.'); }
}
async function startCamera() {
  const version = ++cameraVersion;
  $('start-camera').disabled = true;
  if (!prototypePage) publicStatus('requesting'); else status('Requesting camera permission…');
  try {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Camera access needs HTTPS or localhost and a supported browser. Demo scans still work.');
    const next = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
    if (version !== cameraVersion) { next.getTracks().forEach(t => t.stop()); return; }
    stream = next;
    $('camera').srcObject = stream;
    $('camera').hidden = false;
    await $('camera').play();
    if (version !== cameraVersion) return;
    $('stage-art').hidden = true;
    updateCameraTag();
    stream.getVideoTracks()[0]?.addEventListener('ended', () => { if (stream === next) stopCamera(); });
    if (!prototypePage) publicStatus(model ? 'ready' : 'previewReady');
    else status(mode === 'demo' ? 'Camera preview connected. Demo scans still use your chosen example.' : mode === 'qr' ? 'Camera ready. Start QR scanning and centre one test card.' : model ? 'Camera ready. Start live recognition.' : 'Camera ready. Connect a trained model below to recognise a piece.');
  } catch (error) {
    if (version !== cameraVersion) return;
    stopCamera(false);
    const message = error.name === 'NotAllowedError' ? 'Camera permission was denied or blocked. Open this page in your browser, allow camera access, or use a demo scan.' : error.name === 'NotFoundError' ? 'No camera found. Use a demo scan on this device.' : error.message;
    if (!prototypePage) publicStatus(error.name === 'NotAllowedError' ? 'denied' : error.name === 'NotFoundError' ? 'noCamera' : !window.isSecureContext || !navigator.mediaDevices?.getUserMedia ? 'secureCamera' : 'cameraError', true);
    else status(message, true);
  } finally { if (version === cameraVersion || !stream) updateButtons(); }
}
function updateCameraTag() {
  if (!prototypePage) { $('camera-tag').textContent = siteText(language, 'livePreview'); return; }
  $('camera-tag').textContent = mode === 'demo' ? 'Live preview · demo ignores camera' : mode === 'qr' ? 'Live preview · centre one QR card' : 'Live preview · centre one piece';
}
function setMode(value) {
  stopRecognition(false); hideProfile();
  mode = value;
  $('demo-controls').hidden = mode !== 'demo'; $('trained-controls').hidden = mode !== 'trained'; $('qr-controls').hidden = mode !== 'qr';
  $('mode-label').textContent = mode === 'demo' ? 'DEMO MODE' : mode === 'qr' ? 'QR TEST MODE' : 'PRODUCT SCAN';
  $('mode-help').textContent = mode === 'demo' ? 'Demo scans use a chosen example, not the camera image. No product or trained model needed.' : mode === 'qr' ? 'Test the journey with QR cards while product recognition is being prepared.' : 'Product recognition requires a model trained on your pieces. Use QR test cards while training is on hold.';
  $('stage-caption').innerHTML = mode === 'qr' ? 'Centre one QR test card<br>to discover its animal story.' : 'Centre one Jungle King piece<br>to discover its animal story.';
  if (stream) updateCameraTag();
  document.querySelectorAll('.flow li').forEach(li => li.classList.remove('active'));
  $('flow-origin').textContent = 'Waiting for a scan';
  $('input-state').textContent = stream ? 'Camera preview connected' : 'Demo or camera';
  $('recognition-state').textContent = model ? 'Trained model connected' : 'Demo ready · model optional';
  status(mode === 'demo' ? 'Ready for a demo scan.' : mode === 'qr' ? 'Ready for a QR test card. Enable the camera, then start QR scanning.' : model ? 'Model connected. Enable the camera, then start recognition.' : 'Connect your exported model in Scan setup, then enable the camera.');
}

async function runQrScan() {
  if (!profilesReady || !stream || running || mode !== 'qr') return;
  running = true; const version = ++runVersion;
  hideProfile(); updateButtons(); status('Preparing QR scanner…');
  try {
    await loadScript('./vendor/zxing-browser.min.js');
    if (!running || version !== runVersion || !stream) return;
    qrReader ||= new window.ZXingBrowser.BrowserQRCodeReader();
    status('Looking for a Jungle King QR test card. Keep the whole code visible.');
    const decode = () => {
      if (!running || version !== runVersion || !stream || document.hidden) return;
      const video = $('camera');
      if (video.readyState >= 2) {
        // Decode the live camera frame with the same stream and lifecycle as ML.
        qrFrame.width = Math.min(video.videoWidth, 1280);
        qrFrame.height = Math.round(video.videoHeight * qrFrame.width / video.videoWidth);
        qrContext.drawImage(video, 0, 0, qrFrame.width, qrFrame.height);
        try {
          const result = qrReader.decodeFromCanvas(qrFrame);
          const id = resolveQrPayload(result.getText(), profiles);
          if (id) {
            stopRecognition(false); showProfile(id, 'qr');
            status(`QR test card scanned: ${selected.name}. Scan another piece to continue.`);
            $('animal-name').focus({ preventScroll: true });
            if (matchMedia('(max-width: 700px)').matches) $('profile-card').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
            return;
          }
          status('This QR code is not a Jungle King test card. Use one of the eight supplied cards.');
        } catch (error) {
          if (!['NotFoundException', 'ChecksumException', 'FormatException'].includes(error.getKind?.() || error.name)) {
            stopRecognition(false); hideProfile(); status(`QR scanning stopped: ${error.message || 'Could not decode the camera frame.'}. Try again.`, true);
            return;
          }
        }
      }
      if (running && version === runVersion) setTimeout(decode, 200);
    };
    decode();
  } catch (error) {
    if (version !== runVersion) return;
    stopRecognition(false); hideProfile(); status(`QR scanning stopped: ${error.message}. Try again.`, true);
  }
}

async function connectModel(loader) {
  if (modelBusy) return;
  modelBusy = true; stopRecognition(false); hideProfile(); updateButtons();
  const previous = model; model = null;
  connectionStatus('Loading recognition libraries and model…');
  try {
    await recognitionLibraries();
    const candidate = await loader();
    const labels = candidate.getClassLabels();
    if (!labels.some(label => labelMap.has(label.trim().toLowerCase()))) {
      candidate.model?.dispose?.();
      throw new Error('No model labels match species.json. Match the eight piece IDs or update the profile labels.');
    }
    previous?.model?.dispose?.();
    model = candidate;
    connectionStatus(`Model connected · labels: ${labels.join(', ')}. Unmapped labels are treated as unrecognised.`);
    $('recognition-state').textContent = 'Trained model connected';
    if (!prototypePage) publicStatus(stream ? 'ready' : 'scanReady');
    else status('Model connected. Select Product scan, enable the camera, and start recognition.');
  } catch (error) {
    model = previous;
    connectionStatus(`Could not connect: ${error.message}${previous ? ' The previous model is still available.' : ''}`, true);
    if (!prototypePage) publicStatus('scanUnavailable', true);
    else status('Model connection failed. Prototype testing can still simulate a scan.', true);
  } finally { modelBusy = false; updateButtons(); }
}

async function runRecognition() {
  if (!model || !stream || running || mode !== 'trained') return;
  running = true; const version = ++runVersion; stability.reset(); hideProfile(); updateButtons();
  if (!prototypePage) publicStatus('scanning'); else status('Looking for a stable result. Hold one piece in the square.');
  const predict = async () => {
    if (!running || version !== runVersion || !stream || document.hidden) return;
    try {
      const video = $('camera');
      if (video.readyState >= 2) {
        // Match the visible square, including object-fit:cover cropping.
        const bounds = $('camera-stage').getBoundingClientRect();
        const scale = Math.max(bounds.width / video.videoWidth, bounds.height / video.videoHeight);
        const crop = bounds.width * 0.7 / scale;
        context.drawImage(video, (video.videoWidth - crop) / 2, (video.videoHeight - crop) / 2, crop, crop, 0, 0, 224, 224);
        const predictions = await model.predict(frame);
        if (!running || version !== runVersion) return;
        const candidate = choosePrediction(predictions, labelMap);
        const stable = stability.update(candidate);
        if (stable) {
          if (selected?.pieceId !== stable.pieceId) showProfile(stable.pieceId, 'model', stable.score);
          // Keep the card on screen after a confirmed result; stop scanning so removing the piece does not hide it.
          stopRecognition(false);
          if (!prototypePage) publicStatus('matched'); else status(`${profiles.find(p => p.pieceId === stable.pieceId).name} recognised. The card stays until you scan another piece.`);
          return;
        } else if (!candidate) {
          if (!selected) {
            $('flow-origin').textContent = 'Waiting for a recognised piece';
            $('recognition-state').textContent = 'No confident mapped result';
            if (!prototypePage) publicStatus('tryAgain'); else status('Piece not recognised confidently. Centre one piece and try another angle.');
          }
        } else {
          if (!prototypePage) publicStatus('confirming'); else status(`Confirming result · ${stability.count}/4 consecutive frames.`);
        }
      }
      if (running && version === runVersion) setTimeout(predict, 250);
    } catch (error) {
      if (version !== runVersion) return;
      stopRecognition(false); hideProfile();
      if (!prototypePage) publicStatus('scanError', true); else status(`Recognition stopped: ${error.message}. Try scanning again.`, true);
    }
  };
  predict();
}

$('scan-another').addEventListener('click', () => {
  stopRecognition(false); hideProfile();
  if (!prototypePage) publicStatus('another');
  else status(mode === 'demo' ? 'Ready for another demo scan.' : mode === 'qr' ? 'Ready for another QR card. Start QR scanning when it is in the square.' : 'Ready for another piece. Start recognition when it is in the square.');
  const target = mode === 'demo' ? $('demo-scan') : stream ? mode === 'qr' ? $('scan-qr') : $('scan-trained') : $('start-camera');
  target.focus({ preventScroll: true });
  $('scan-workspace').scrollIntoView({ behavior: 'instant', block: 'start' });
});
$('start-camera').addEventListener('click', startCamera);
$('stop-camera').addEventListener('click', () => stopCamera());
$('scan-trained').addEventListener('click', runRecognition);
$('scan-qr')?.addEventListener('click', runQrScan);
$('stop-qr')?.addEventListener('click', () => stopRecognition());
$('stop-recognition').addEventListener('click', () => stopRecognition());
document.querySelectorAll('input[name=mode]').forEach(input => input.addEventListener('change', () => setMode(input.value)));
$('demo-piece')?.addEventListener('change', () => { hideProfile(); status('Example changed. Run a demo scan to reveal its card.'); });
$('demo-scan')?.addEventListener('click', () => {
  const id = $('demo-piece').value;
  if (id === 'other') {
    hideProfile(); $('flow-camera').classList.add('active'); $('flow-recognition').classList.add('active');
    $('flow-origin').textContent = 'Unrecognised demo event';
    $('input-state').textContent = 'Simulated unknown object';
    $('recognition-state').textContent = 'No mapped result';
    status('Demo: object not recognised. Try a different example.'); return;
  }
  showProfile(id, 'demo'); status(`Demo scan connected: ${selected.name}.`);
});
$('load-model-url')?.addEventListener('click', () => {
  const raw = $('model-url').value.trim();
  if (!raw) { connectionStatus('Enter a model folder URL or select the exported files.', true); return; }
  try {
    const url = new URL(raw, location.href);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && (url.origin === location.origin || ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('Use an HTTPS model URL or a local project folder.');
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    url.search = ''; url.hash = '';
    connectModel(() => window.tmImage.load(new URL('model.json', url).href, new URL('metadata.json', url).href));
  } catch (error) { connectionStatus(error.message, true); }
});
$('model-files')?.addEventListener('change', () => {
  const files = [...$('model-files').files];
  const topology = files.find(f => f.name === 'model.json');
  const metadata = files.find(f => f.name === 'metadata.json');
  const weights = files.filter(f => f.name.endsWith('.bin'));
  if (!topology || !metadata || weights.length !== 1) { connectionStatus('Select model.json, metadata.json, and one exported .bin weights file together.', true); return; }
  connectModel(() => window.tmImage.loadFromFiles(topology, weights[0], metadata));
});
$('animate').addEventListener('click', async () => {
  const viewer = $('model-viewer');
  if (selected?.assets.glb && !$('model-panel').hidden && viewer.loaded) {
    if (!viewer.availableAnimations?.length) { $('model-status').textContent = 'This model has no embedded animation. You can rotate it or use AR on a supported device.'; return; }
    if (viewer.paused) { viewer.play(); $('animate').textContent = text('pause'); } else { viewer.pause(); $('animate').textContent = text('play'); }
    return;
  }
  const illustration = $('profile-illustration');
  illustration.classList.remove('moving'); void illustration.getBoundingClientRect(); illustration.classList.add('moving');
  $('animation-description').textContent = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Animation paused by your reduced-motion preference.' : 'Playing artwork motion preview · add a GLB for animated 3D.';
});
$('profile-illustration').addEventListener('animationend', () => $('profile-illustration').classList.remove('moving'));
$('model-viewer').addEventListener('load', () => {
  if (!selected?.assets.glb || !$('model-viewer').getAttribute('src')) return;
  $('animate').disabled = !$('model-viewer').availableAnimations?.length;
  $('animation-description').textContent = text(selected.assets.placeholder ? 'animation' : 'embedded');
  $('model-status').textContent = text('modelLoaded');
  $('animation-state').textContent = '3D model connected';
});
$('model-viewer').addEventListener('error', () => {
  if (!selected?.assets.glb) return;
  $('animate').disabled = false;
  $('animation-description').textContent = 'Artwork motion preview · 3D asset unavailable';
  $('model-status').textContent = 'Could not load the 3D model. Check the GLB path in species.json.';
  $('animation-state').textContent = '3D asset unavailable';
});
$('model-viewer').addEventListener('ar-status', event => {
  if (event.detail.status === 'failed') $('model-status').textContent = 'AR could not start on this device. The on-page 3D viewer is still available.';
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running) stopRecognition();
  if (document.hidden) { $('model-viewer').pause?.(); $('animate').textContent = text('play'); }
});
window.addEventListener('pagehide', () => stopCamera(false));

try {
  const response = await fetch('./species.json');
  if (!response.ok) throw new Error(`Profile file returned HTTP ${response.status}.`);
  profiles = validateProfiles(await response.json()); labelMap = createLabelMap(profiles);
  profilesReady = true; updateButtons();
  $('profile-state').textContent = `${profiles.length} animal profiles connected`;
  // Build selectors from the data, keeping profile IDs as the single source of truth.
  if (prototypePage) {
    $('demo-piece').replaceChildren();
    for (const profile of profiles) {
      const option = document.createElement('option'); option.value = profile.pieceId; option.textContent = `${profile.name} piece`; $('demo-piece').append(option);
    }
    const other = document.createElement('option'); other.value = 'other'; other.textContent = 'Unrecognised object'; $('demo-piece').append(other);
  } else if (recognitionModelFolder) {
    const folder = new URL(recognitionModelFolder, location.href);
    if (!folder.pathname.endsWith('/')) folder.pathname += '/';
    await connectModel(() => window.tmImage.load(new URL('model.json', folder).href, new URL('metadata.json', folder).href));
  }
} catch (error) {
  profilesReady = false;
  if (!prototypePage) { publicStatus('contentError', true); $('start-camera').disabled = true; }
  else {
    status(`Animal profiles could not load: ${error.message}`, true);
    for (const id of ['demo-scan','demo-piece','load-model-url','model-files','scan-qr']) $(id).disabled = true;
  }
  $('profile-state').textContent = 'Profile connection failed';
}
