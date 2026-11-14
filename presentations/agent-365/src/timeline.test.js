import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, DURATION, getTimeline } from './timeline.js';
import { controls } from './symbols.js';

test('the finale goes from a layered agent to fleet oversight and the complete picture', () => {
  assert.deepEqual(chapters.map(({ id }) => id), ['layers', 'scale', 'observe', 'govern', 'secure', 'complete']);
  chapters.forEach((chapter, index) => {
    assert.equal(getTimeline(chapter.start).chapter, index);
    assert.equal(getTimeline(chapter.start + 19.9).chapter, index);
  });
  controls.forEach((control) => assert.equal(chapters[control.chapter].id, control.id));
  assert.equal(getTimeline(80).chapter, 4);
  assert.equal(getTimeline(40).chapter, 2);
  assert.equal(getTimeline(-1).elapsed, 0);
  assert.equal(getTimeline(DURATION + 1).progress, 1);
  assert.equal(getTimeline(DURATION).complete, true);
  assert.throws(() => getTimeline(Infinity), TypeError);
});
