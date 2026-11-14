import test from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, retrieveNearest, exampleQuery, exampleChunks } from './retrieval.js';
import { chapters, DURATION, getTimeline, formatTime } from './timeline.js';

test('semantic example returns three related passages, excluding the restricted exact match', () => {
  const results = retrieveNearest(exampleQuery.vector, exampleChunks);
  assert.deepEqual(new Set(results.map((result) => result.id)), new Set(['remote', 'hybrid', 'flexible']));
  assert.ok(results.every((result) => result.allowed && result.citation));
  assert.ok(results.every((result, i) => i === 0 || results[i - 1].score >= result.score));
  assert.ok(cosineSimilarity(exampleQuery.vector, exampleChunks.find((chunk) => chunk.id === 'restricted').vector) > results[0].score);
});

test('retrieval handles empty permission-filtered results and limits the returned neighbours', () => {
  assert.equal(retrieveNearest(exampleQuery.vector, exampleChunks, 1).length, 1);
  assert.deepEqual(retrieveNearest(exampleQuery.vector, exampleChunks.map((chunk) => ({ ...chunk, allowed: false }))), []);
  assert.throws(() => retrieveNearest([1], [], 0), RangeError);
});

test('cosine ranking is magnitude-independent and rejects unusable vectors', () => {
  assert.equal(cosineSimilarity([2, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 3]), 0);
  assert.equal(cosineSimilarity([1], [-1]), -1);
  for (const [a, b] of [[[], []], [[1], [1, 2]], [[NaN], [1]], [[Infinity], [1]]]) {
    assert.throws(() => cosineSimilarity(a, b), TypeError);
  }
  assert.throws(() => cosineSimilarity([0, 0], [1, 0]), RangeError);
});

test('six twenty-second chapters fill the two-minute narrative and seek reversibly', () => {
  chapters.forEach((chapter, i) => {
    assert.equal(getTimeline(chapter.start).chapter, i);
    assert.equal(getTimeline(chapter.start + 19.999).chapter, i);
  });
  assert.deepEqual(getTimeline(DURATION), { elapsed: 120, chapter: 5, progress: 1, complete: true });
  assert.equal(getTimeline(90).progress, .5);
  assert.equal(getTimeline(21).chapter, 1);
  assert.equal(getTimeline(-1).elapsed, 0);
  assert.equal(getTimeline(125).elapsed, 120);
  assert.throws(() => getTimeline(NaN), TypeError);
  assert.equal(formatTime(100), '1:40');
});
