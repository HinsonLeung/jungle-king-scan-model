import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateProfiles, createLabelMap, choosePrediction, StableResult, conservationSummary } from '../dist/pipeline.js';
const data = JSON.parse(await readFile(new URL('../dist/species.json', import.meta.url)));
const profiles = validateProfiles(data);
const map = createLabelMap(profiles);

test('all eight game profiles map labels to sourced stories and future asset slots', () => {
  assert.equal(profiles.length, 8);
  assert.deepEqual(new Set(profiles.map(p => p.pieceId)), new Set(['elephant_piece','lion_piece','tiger_piece','leopard_piece','bear_piece','dog_piece','cat_piece','rat_piece']));
  for (const profile of profiles) {
    for (const label of profile.labels) assert.equal(map.get(label), profile.pieceId);
    assert.ok('glb' in profile.assets && 'usdz' in profile.assets);
    assert.equal(profile.reviewed, true);
    assert.ok(profile.sources.length >= 2);
    assert.ok(profile.conservation.scope);
    assert.equal(profile.checkedOn, '2026-10-09');
    assert.equal(profile.conservation.assessmentDate, null);
    for (const source of profile.sources) assert.equal(new URL(source.url).protocol, 'https:');
    const [x,y,width,height] = profile.artwork.crop;
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0 && x+width <= profile.artwork.width && y+height <= profile.artwork.height);
    assert.ok(profile.scientificName);
  }
});
test('regional and subspecies categories always carry their assessment scope', () => {
  const lion = profiles.find(p => p.pieceId === 'lion_piece');
  assert.match(conservationSummary(lion), /Critically Endangered.*West African population/);
  assert.equal(lion.conservation.globalCategory, 'Vulnerable');
  const bear = profiles.find(p => p.pieceId === 'bear_piece');
  assert.match(conservationSummary(bear), /Vulnerable.*species globally/);
  assert.equal(bear.conservation.secondary[0].assessmentYear, '2024');
  const cat = profiles.find(p => p.pieceId === 'cat_piece');
  assert.match(conservationSummary(cat), /Least Concern.*globally/);
});
test('Aquatic Rat identity stays provisional and its endangered category is regional', () => {
  const rat = profiles.find(p => p.pieceId === 'rat_piece');
  assert.equal(rat.mappingStatus, 'provisional');
  assert.match(rat.scientificName, /provisional/);
  assert.match(conservationSummary(rat), /Great Britain/);
  assert.equal(rat.conservation.globalCategory, 'Least Concern');
});
test('a sourced profile cannot omit its assessment scope or sources', () => {
  const invalid = structuredClone(data); delete invalid.profiles[0].conservation.scope;
  assert.throws(() => validateProfiles(invalid), /scope/);
});
test('a high-confidence background winner never becomes a known piece', () => {
  assert.equal(choosePrediction([{ className: 'other', probability: .99 }, { className: 'tiger_piece', probability: .9 }], map), null);
  assert.equal(choosePrediction([{ className: 'new_label', probability: .99 }], map), null);
});
test('low or ambiguous predictions do not select an animal', () => {
  assert.equal(choosePrediction([{ className: 'tiger_piece', probability: .6 }], map), null);
  assert.equal(choosePrediction([{ className: 'tiger_piece', probability: .9 }, { className: 'elephant_piece', probability: .85 }], map), null);
  assert.equal(choosePrediction([{ className: 'tiger_piece', probability: NaN }], map), null);
});
test('label aliases and valid confidence resolve to the correct piece ID', () => {
  assert.deepEqual(choosePrediction([{ className: ' Tiger ', probability: .96 }, { className: 'other', probability: .04 }], map), { pieceId: 'tiger_piece', score: .96 });
});
test('stability requires consecutive matches and resets on unknown/change', () => {
  const stable = new StableResult(3);
  const tiger = { pieceId: 'tiger_piece', score: .95 }, elephant = { pieceId: 'elephant_piece', score: .96 };
  assert.equal(stable.update(tiger), null);
  assert.equal(stable.update(tiger), null);
  assert.deepEqual(stable.update(tiger), tiger);
  assert.equal(stable.update(null), null);
  assert.equal(stable.update(tiger), null);
  assert.equal(stable.update(elephant), null);
  assert.equal(stable.update(elephant), null);
  assert.deepEqual(stable.update(elephant), elephant);
});
test('duplicate labels cannot route a scan to two different animals', () => {
  const duplicate = structuredClone(data); duplicate.profiles[1].labels.push('tiger');
  assert.throws(() => validateProfiles(duplicate), /unique/);
});
