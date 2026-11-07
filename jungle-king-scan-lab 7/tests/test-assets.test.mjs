import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import validator from 'gltf-validator';
import { qrPayload, resolveQrPayload } from '../dist/pipeline.js';
import { localizedProfile, traditionalChinese } from '../dist/content.js';
const profiles = JSON.parse(await readFile(new URL('../dist/species.json', import.meta.url))).profiles;

test('only exact, versioned test QR payloads map to one animal', () => {
  for (const profile of profiles) assert.equal(resolveQrPayload(qrPayload(profile.pieceId), profiles), profile.pieceId);
  for (const value of ['tiger_piece', 'jungle-king:test:v2:tiger_piece', 'jungle-king:test:v1:other', 'https://example.com/?piece=tiger_piece', `${qrPayload('tiger_piece')} `]) assert.equal(resolveQrPayload(value, profiles), null);
});
test('every test card exists and Chinese content preserves assessment scopes and caveats', async () => {
  for (const profile of profiles) {
    assert.ok((await stat(new URL(`../dist/assets/qr/${profile.pieceId}.png`, import.meta.url))).size > 1000);
    const translated = localizedProfile(profile, 'zh-Hant');
    assert.ok(traditionalChinese[profile.pieceId]);
    for (const key of ['name','scientificName','intro','habitat','threats','protection','fact']) assert.ok(translated[key]);
    assert.equal(translated.pieceId, profile.pieceId);
    assert.equal(translated.conservation.secondary.length, profile.conservation.secondary.length);
    assert.equal(translated.conservation.assessmentDate, null);
    assert.equal(translated.checkedOn, profile.checkedOn);
    assert.equal(translated.sources, profile.sources);
  }
  const rat = localizedProfile(profiles.find(p => p.pieceId === 'rat_piece'), 'zh-Hant');
  assert.equal(rat.mappingStatus, 'provisional');
  assert.match(rat.conservation.scope, /大不列顛/);
  assert.match(rat.intro, /確認/);
});
test('tiger placeholder is a valid self-contained animated glTF 2.0 binary', async () => {
  const tiger = profiles.find(p => p.pieceId === 'tiger_piece');
  assert.equal(tiger.assets.placeholder, true);
  const bytes = await readFile(new URL(`../dist${tiger.assets.glb}`, import.meta.url));
  const result = await validator.validateBytes(new Uint8Array(bytes), { uri: 'tiger-test.glb' });
  assert.equal(result.issues.numErrors, 0, JSON.stringify(result.issues.messages));
  assert.equal(result.issues.numWarnings, 0, JSON.stringify(result.issues.messages));
  const jsonLength = bytes.readUInt32LE(12);
  const model = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  assert.equal(model.animations[0].channels.length, 3);
  assert.ok(model.nodes.find(n => n.name === 'Head nod pivot'));
  assert.equal(model.buffers[0].uri, undefined);
});
