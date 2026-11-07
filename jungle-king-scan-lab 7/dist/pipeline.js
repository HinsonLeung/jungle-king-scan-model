export function validateProfiles(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.profiles) || !data.profiles.length) throw new Error('species.json must contain schemaVersion 1 and profiles.');
  const ids = new Set(), labels = new Set();
  for (const profile of data.profiles) {
    if (!profile.pieceId || !profile.name || !Array.isArray(profile.labels) || !profile.labels.length || !profile.assets || !profile.conservation) throw new Error('Each profile needs an ID, name, labels, conservation, and assets.');
    if (ids.has(profile.pieceId)) throw new Error('Duplicate piece ID.');
    if (profile.reviewed && (!profile.conservation.category || !profile.conservation.scope || !profile.checkedOn || !Array.isArray(profile.sources) || !profile.sources.length)) throw new Error('Sourced profiles require a category, scope, research date, and sources.');
    ids.add(profile.pieceId);
    for (const label of profile.labels) {
      const key = label.trim().toLowerCase();
      if (!key || labels.has(key) || ['other', 'background', 'unknown'].includes(key)) throw new Error('Profile labels must be unique and must not use background labels.');
      labels.add(key);
    }
  }
  return data.profiles;
}

export function conservationSummary(profile) {
  if (!profile.reviewed || !profile.conservation.category) return 'Pending review · no status assigned';
  return `${profile.conservation.category} · ${profile.conservation.scope}`;
}

export function createLabelMap(profiles) {
  return new Map(profiles.flatMap(p => p.labels.map(label => [label.trim().toLowerCase(), p.pieceId])));
}

export function qrPayload(pieceId) {
  return `jungle-king:test:v1:${pieceId}`;
}

// Only our exact, versioned test-card payloads can reveal a profile.
export function resolveQrPayload(text, profiles) {
  return profiles.find(profile => qrPayload(profile.pieceId) === text)?.pieceId || null;
}

// Reject background/unknown winners before considering a known piece.
const BACKGROUND = new Set(['other', 'background', 'unknown', 'none', 'empty']);
export function choosePrediction(predictions, labelMap, threshold = 0.93, margin = 0.20) {
  const ranked = predictions.filter(p => typeof p.className === 'string' && Number.isFinite(p.probability) && p.probability >= 0 && p.probability <= 1).sort((a, b) => b.probability - a.probability);
  const winner = ranked[0];
  if (!winner) return null;
  const label = winner.className.trim().toLowerCase();
  // Explicitly reject background / other so nothing is shown until a real piece is confirmed.
  if (BACKGROUND.has(label)) return null;
  const pieceId = labelMap.get(label);
  if (!pieceId || winner.probability < threshold || winner.probability - (ranked[1]?.probability || 0) < margin) return null;
  return { pieceId, score: winner.probability };
}

export class StableResult {
  constructor(required = 4) { this.required = required; this.reset(); }
  reset() { this.id = null; this.count = 0; }
  update(candidate) {
    if (!candidate) { this.reset(); return null; }
    this.count = this.id === candidate.pieceId ? this.count + 1 : 1;
    this.id = candidate.pieceId;
    return this.count >= this.required ? candidate : null;
  }
}
