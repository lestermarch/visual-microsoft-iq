import test from 'node:test';
import assert from 'node:assert/strict';
import { getTimeline, formatTime } from './timeline.js';

test('all five callouts receive exactly 24 seconds of a two-minute presentation', () => {
  for (let chapter = 0; chapter < 5; chapter++) {
    assert.equal(getTimeline(chapter * 24).chapter, chapter);
    assert.equal(getTimeline(chapter * 24).progress, 0);
    assert.equal(getTimeline(chapter * 24 + 23.999).chapter, chapter);
  }
  assert.deepEqual(getTimeline(120), { elapsed: 120, chapter: 4, progress: 1, complete: true });
});

test('seeking clamps to the presentation while rejecting invalid times', () => {
  assert.equal(getTimeline(-10).elapsed, 0);
  assert.equal(getTimeline(150).elapsed, 120);
  assert.throws(() => getTimeline(NaN), TypeError);
  assert.throws(() => getTimeline(Infinity), TypeError);
  assert.equal(getTimeline(52).chapter, 2);
  assert.equal(getTimeline(12).progress, 0.5);
});

test('time labels remain stable at minute boundaries', () => {
  assert.equal(formatTime(59.99), '0:59');
  assert.equal(formatTime(60), '1:00');
  assert.equal(formatTime(120), '2:00');
});
