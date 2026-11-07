import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import * as THREE from 'three';
import { qrPayload } from '../dist/pipeline.js';
import { traditionalChinese } from '../dist/content.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const profiles = JSON.parse(await readFile(`${root}dist/species.json`)).profiles;
for (const directory of ['dist/assets/qr', 'dist/models', 'dist/vendor']) await mkdir(`${root}${directory}`, { recursive: true });
for (const profile of profiles) {
  // Raster codes avoid SVG stroke rounding that can alter individual modules.
  await QRCode.toFile(`${root}dist/assets/qr/${profile.pieceId}.png`, qrPayload(profile.pieceId), { errorCorrectionLevel: 'M', margin: 4, width: 320 });
}
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
await writeFile(`${root}dist/qr-cards.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Jungle King · QR test cards</title><link rel="stylesheet" href="qr-cards.css"><script type="module" src="qr-cards.js"></script></head>
<body><header><a href="prototype.html">← Back to prototype / 返回原型頁面</a><h1>QR test cards <span lang="zh-Hant">／QR 測試卡</span></h1><p>Print these cards or show one on another screen. On the prototype page, choose <strong>QR test cards</strong>, enable the camera and start QR scanning.</p><p lang="zh-Hant">列印卡片或在另一個螢幕上顯示。於原型頁面選擇 QR test cards，啟用相機並開始掃描。</p><p>These codes work inside this test scanner; they identify codes rather than product appearance. The tiger card includes an animated 3D placeholder.</p><p lang="zh-Hant">這些代碼適用於本網站的測試掃描器，辨識的是代碼而非產品外觀。老虎卡片附有 3D 動畫測試模型。</p><button id="print-cards">Print all eight cards / 列印全部八張卡片</button></header><main>${profiles.map(profile => `<article><h2>${escape(profile.name)}<span lang="zh-Hant">${traditionalChinese[profile.pieceId].name}</span></h2><img src="assets/qr/${profile.pieceId}.png" width="320" height="320" alt="QR test code for ${escape(profile.name)}"><code>${profile.pieceId}</code><p>TEST CARD · 測試卡${profile.pieceId === 'tiger_piece' ? ' · 3D animation / 3D 動畫' : ''}</p>${profile.mappingStatus === 'provisional' ? '<p>Species identity provisional / 物種身分暫定</p>' : ''}</article>`).join('')}</main></body></html>`);

// Original geometry, in metres. No imported artwork or third-party model.
const gltf = {
  asset: { version: '2.0', generator: 'Jungle King original test-asset generator', copyright: 'llab design ltd · CC0-1.0 test placeholder' },
  scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], buffers: [], bufferViews: [], accessors: [], animations: [],
};
const chunks = []; let byteLength = 0;
function accessor(array, type, componentType, target) {
  const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  const padding = (4 - byteLength % 4) % 4;
  if (padding) { chunks.push(Buffer.alloc(padding)); byteLength += padding; }
  const view = gltf.bufferViews.length;
  gltf.bufferViews.push({ buffer: 0, byteOffset: byteLength, byteLength: bytes.length, ...(target ? { target } : {}) });
  chunks.push(bytes); byteLength += bytes.length;
  const size = { SCALAR: 1, VEC3: 3, VEC4: 4 }[type];
  const min = Array(size).fill(Infinity), max = Array(size).fill(-Infinity);
  for (let i = 0; i < array.length; i++) { min[i % size] = Math.min(min[i % size], array[i]); max[i % size] = Math.max(max[i % size], array[i]); }
  const index = gltf.accessors.length;
  gltf.accessors.push({ bufferView: view, componentType, count: array.length / size, type, min, max });
  return index;
}
function geometry(source) {
  return {
    attributes: { POSITION: accessor(source.attributes.position.array, 'VEC3', 5126, 34962), NORMAL: accessor(source.attributes.normal.array, 'VEC3', 5126, 34962) },
    indices: accessor(new Uint16Array(source.index.array), 'SCALAR', 5123, 34963),
  };
}
const sphere = geometry(new THREE.SphereGeometry(1, 20, 12));
const box = geometry(new THREE.BoxGeometry(1, 1, 1));
const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 32));
const colours = { orange: [0.93,0.39,0.08,1], black: [0.055,0.065,0.055,1], cream: [1,0.88,0.67,1], pink: [0.75,0.36,0.28,1], green: [0.16,0.28,0.22,1] };
for (const [name, colour] of Object.entries(colours)) gltf.materials.push({ name, pbrMetallicRoughness: { baseColorFactor: colour, metallicFactor: 0, roughnessFactor: .8 } });
const meshes = new Map();
function mesh(shape, colour) {
  const key = `${shape}:${colour}`;
  if (!meshes.has(key)) {
    meshes.set(key, gltf.meshes.length);
    gltf.meshes.push({ name: key, primitives: [{ ...{ sphere, box, cylinder }[shape], material: Object.keys(colours).indexOf(colour) }] });
  }
  return meshes.get(key);
}
function node(name, translation, scale, shape, colour, parent) {
  const id = gltf.nodes.length;
  gltf.nodes.push({ name, translation, ...(scale ? { scale } : {}), ...(shape ? { mesh: mesh(shape, colour) } : {}) });
  if (parent === undefined) gltf.scenes[0].nodes.push(id);
  else (gltf.nodes[parent].children ||= []).push(id);
  return id;
}
node('Tabletop test base', [0,.0015,0], [.045,.003,.045], 'cylinder', 'green');
const body = node('Tiger breathing pivot', [0,0,0]);
node('Body', [0,.039,0], [.023,.022,.036], 'sphere', 'orange', body);
for (const x of [-.015,.015]) for (const z of [-.025,.025]) {
  node('Leg', [x,.023,z], [.008,.018,.009], 'sphere', 'orange', body);
  node('Paw', [x,.009,z+.004], [.01,.006,.012], 'sphere', 'cream', body);
}
for (const x of [-.022,.022]) for (const z of [-.02,-.006,.008,.021]) node('Body stripe', [x,.041,z], [.002,.025,.004], 'box', 'black', body);
for (const z of [-.025,-.012,.001]) node('Back stripe', [0,.06,z], [.025,.002,.004], 'box', 'black', body);
const head = node('Head nod pivot', [0,.058,.032], null, null, null, body);
node('Head', [0,0,0], [.023,.022,.022], 'sphere', 'orange', head);
for (const x of [-.016,.016]) {
  node('Ear', [x,.02,-.003], [.009,.01,.006], 'sphere', 'black', head);
  node('Inner ear', [x,.021,.001], [.005,.006,.003], 'sphere', 'pink', head);
  node('Eye', [x*.62,.007,.02], [.0035,.004,.0025], 'sphere', 'black', head);
  node('Cheek stripe', [x,-.001,.016], [.007,.003,.003], 'box', 'black', head);
}
for (const x of [-.007,.007]) node('Muzzle', [x,-.006,.019], [.009,.008,.006], 'sphere', 'cream', head);
node('Nose', [0,-.002,.025], [.004,.003,.002], 'sphere', 'black', head);
for (const x of [-.009,0,.009]) node('Forehead stripe', [x,.016,.011], [.003,.009,.003], 'box', 'black', head);
const tail = node('Tail sway pivot', [0,.046,-.033], null, null, null, body);
node('Tail', [0,.005,-.014], [.005,.005,.019], 'sphere', 'orange', tail);
node('Tail tip', [0,.005,-.03], [.0055,.0055,.006], 'sphere', 'black', tail);
for (const z of [-.008,-.017]) node('Tail stripe', [0,.005,z], [.0052,.0052,.002], 'sphere', 'black', tail);
const times = [0,.5,1,1.5,2];
const input = accessor(new Float32Array(times), 'SCALAR', 5126);
const animation = { name: 'Head nod and tail sway', samplers: [], channels: [] };
function channel(target, path, values, type) {
  const sampler = animation.samplers.length;
  animation.samplers.push({ input, output: accessor(new Float32Array(values.flat()), type, 5126), interpolation: 'LINEAR' });
  animation.channels.push({ sampler, target: { node: target, path } });
}
const rotation = (axis, angle) => { const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), angle); return q.toArray(); };
channel(body, 'translation', times.map((_, i) => [0, i % 2 ? .002 : 0, 0]), 'VEC3');
channel(head, 'rotation', [0,.13,0,-.1,0].map(angle => rotation([1,0,0], angle)), 'VEC4');
channel(tail, 'rotation', [0,.45,0,-.45,0].map(angle => rotation([0,1,0], angle)), 'VEC4');
gltf.animations.push(animation);
const binPad = (4 - byteLength % 4) % 4;
chunks.push(Buffer.alloc(binPad)); byteLength += binPad;
gltf.buffers.push({ byteLength });
const json = Buffer.from(JSON.stringify(gltf));
const jsonPad = Buffer.alloc((4 - json.length % 4) % 4, 0x20);
const jsonChunk = Buffer.concat([json, jsonPad]), bin = Buffer.concat(chunks);
const header = Buffer.alloc(12), jsonHeader = Buffer.alloc(8), binHeader = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2,4); header.writeUInt32LE(12+8+jsonChunk.length+8+bin.length,8);
jsonHeader.writeUInt32LE(jsonChunk.length); jsonHeader.writeUInt32LE(0x4e4f534a,4);
binHeader.writeUInt32LE(bin.length); binHeader.writeUInt32LE(0x004e4942,4);
await writeFile(`${root}dist/models/tiger-test.glb`, Buffer.concat([header,jsonHeader,jsonChunk,binHeader,bin]));
for (const [source, target] of [
  ['@zxing/browser/umd/zxing-browser.min.js','zxing-browser.min.js'],
  ['@zxing/browser/LICENSE','ZXING-BROWSER-LICENSE'], ['@zxing/library/LICENSE','ZXING-LIBRARY-LICENSE'],
  ['@google/model-viewer/dist/model-viewer.min.js','model-viewer.min.js'], ['@google/model-viewer/LICENSE','MODEL-VIEWER-LICENSE'],
  ['three/LICENSE','THREE-LICENSE'], ['ts-custom-error/LICENSE','TS-CUSTOM-ERROR-LICENSE'],
  ['@zxing/text-encoding/LICENSE.md','ZXING-TEXT-ENCODING-LICENSE'],
  ['lit/LICENSE','LIT-LICENSE'], ['@lit/reactive-element/LICENSE','LIT-REACTIVE-ELEMENT-LICENSE'],
  ['lit-element/LICENSE','LIT-ELEMENT-LICENSE'], ['lit-html/LICENSE','LIT-HTML-LICENSE'],
  ['@monogrid/gainmap-js/LICENSE','GAINMAP-LICENSE'],
]) await copyFile(`${root}node_modules/${source}`, `${root}dist/vendor/${target}`);
console.log('Generated eight QR cards, printable page, original animated tiger GLB, and local viewer/scanner libraries.');
