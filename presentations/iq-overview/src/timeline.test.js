import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, DURATION, getTimeline } from './timeline.js';

test('the overview introduces people, three foundations, then the IQ layer across two minutes', () => {
  assert.deepEqual(chapters.map(({ id }) => id), ['people', 'collaboration', 'business', 'knowledge', 'iq']);
  chapters.forEach((chapter, index) => {
    assert.equal(getTimeline(chapter.start).chapter, index);
    assert.equal(getTimeline(chapter.start + 23.9).chapter, index);
  });
  assert.equal(getTimeline(72).chapter, 3);
  assert.equal(getTimeline(24).chapter, 1);
  assert.equal(getTimeline(-1).elapsed, 0);
  assert.equal(getTimeline(DURATION + 1).progress, 1);
  assert.equal(getTimeline(DURATION).complete, true);
  assert.throws(() => getTimeline(NaN), TypeError);
});
