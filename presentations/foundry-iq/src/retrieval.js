export const exampleQuery = {
  text: 'Can I work away from the office?',
  vector: [.95, .76, .64, .32, .07, .04, .02, .08],
};

// Hand-authored teaching vectors, not embeddings from a language model.
export const exampleChunks = [
  { id: 'remote', title: 'Remote working policy', source: 'People policies', citation: '[1]', allowed: true, vector: [.94, .8, .58, .35, .04, .03, .02, .1], position: [-1.03, .63, .58] },
  { id: 'hybrid', title: 'Hybrid working guide', source: 'Team handbook', citation: '[2]', allowed: true, vector: [.8, .85, .67, .23, .05, .05, .08, .08], position: [-.58, .9, .18] },
  { id: 'flexible', title: 'Flexible work FAQ', source: 'People policies', citation: '[3]', allowed: true, vector: [.87, .63, .77, .25, .08, .08, .03, .09], position: [-.83, .23, .86] },
  { id: 'restricted', title: 'Restricted policy supplement', source: 'People policies', allowed: false, vector: [.95, .76, .64, .32, .07, .04, .02, .08], position: [-1.4, 1.05, -.15] },
  { id: 'product', title: 'Product specifications', source: 'Product docs', allowed: true, vector: [.03, .02, .05, .08, .97, .87, .23, .1], position: [1, .6, -.35] },
  { id: 'release', title: 'Release notes', source: 'Product docs', allowed: true, vector: [.05, .08, .03, .12, .91, .79, .37, .1], position: [1.3, .15, .12] },
  { id: 'operations', title: 'Warehouse operations', source: 'Operations', allowed: true, vector: [.04, .07, .03, .17, .08, .1, .94, .89], position: [.2, -1.05, .4] },
  { id: 'stock', title: 'Inventory handling', source: 'Operations', allowed: true, vector: [.03, .12, .02, .13, .11, .13, .87, .96], position: [.55, -.85, -.2] },
];

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
    throw new TypeError('Vectors must be nonempty arrays with the same dimensions.');
  }
  let dot = 0;
  let lengthA = 0;
  let lengthB = 0;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) throw new TypeError('Vector coordinates must be finite numbers.');
    dot += a[i] * b[i];
    lengthA += a[i] ** 2;
    lengthB += b[i] ** 2;
  }
  if (lengthA === 0 || lengthB === 0) throw new RangeError('A zero vector has no cosine similarity.');
  return Math.max(-1, Math.min(1, dot / Math.sqrt(lengthA * lengthB)));
}

export function retrieveNearest(query, chunks, count = 3) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('Result count must be a positive integer.');
  return chunks
    .filter((chunk) => chunk.allowed === true)
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(query, chunk.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
