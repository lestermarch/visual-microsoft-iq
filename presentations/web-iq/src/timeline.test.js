import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, DURATION, getTimeline, isSourceActive } from './timeline.js';
import { sources } from './data.js';

test('narration changes at each 20-second boundary and stops at two minutes', () => {
  chapters.forEach((chapter, i) => {
    assert.equal(getTimeline(chapter.start).chapter, i);
    assert.equal(getTimeline(chapter.start).progress, 0);
    if (i) assert.equal(getTimeline(chapter.start - .001).chapter, i - 1);
  });
  assert.deepEqual(getTimeline(120), { elapsed: 120, chapter: 5, progress: 1, complete: true });
  assert.equal(getTimeline(-5).elapsed, 0);
  assert.equal(getTimeline(130).elapsed, DURATION);
  assert.throws(() => getTimeline(NaN), TypeError);
});

test('chapter selection highlights only the intended data, including reverse seeking', () => {
  const highlighted = (time) => sources.filter((source) => isSourceActive(source.id, getTimeline(time).chapter)).map((source) => source.id).sort();
  assert.deepEqual(highlighted(0), sources.map((source) => source.id).sort());
  assert.deepEqual(highlighted(20), ['news', 'web']);
  assert.deepEqual(highlighted(40), ['images', 'video']);
  assert.deepEqual(highlighted(60), ['licensed']);
  assert.deepEqual(highlighted(80), ['commerce', 'places', 'weather']);
  assert.deepEqual(highlighted(100), highlighted(0));
  assert.deepEqual(highlighted(20), ['news', 'web']);
});
