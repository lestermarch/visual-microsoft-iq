import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, DURATION, getTimeline, formatTime } from './timeline.js';

test('the narrative steps from sources to OneLake, semantic models, ontologies, and agent reasoning', () => {
  assert.deepEqual(chapters.map((chapter) => chapter.icon), ['sources', 'lake', 'semantic', 'ontology', 'agent']);
  for (let chapter = 0; chapter < chapters.length; chapter++) {
    const start = chapters[chapter].start;
    const end = chapters[chapter + 1]?.start ?? DURATION;
    assert.equal(getTimeline(start).chapter, chapter);
    assert.equal(getTimeline(start).progress, 0);
    assert.equal(getTimeline(end - .001).chapter, chapter);
  }
  assert.deepEqual(getTimeline(120), { elapsed: 120, chapter: 4, progress: 1, complete: true });
});

test('scrubbing is reversible, clamps to two minutes, and rejects invalid positions', () => {
  assert.equal(getTimeline(90).chapter, 3);
  assert.equal(getTimeline(36).chapter, 1);
  assert.equal(getTimeline(36).progress, .5);
  assert.equal(getTimeline(-1).elapsed, 0);
  assert.equal(getTimeline(121).elapsed, 120);
  assert.throws(() => getTimeline(NaN), TypeError);
  assert.throws(() => getTimeline(Infinity), TypeError);
  assert.equal(formatTime(72), '1:12');
});
