import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, getTimeline } from './timeline.js';

test('security products receive five distinct chapters and reverse seeking restores their focus', () => {
  const expected = ['entra', 'purview', 'defender', 'sentinel', 'intune'];
  const productAt = (seconds) => chapters[getTimeline(seconds).chapter].id;
  expected.forEach((product, index) => {
    assert.equal(productAt(index * 24), product);
    assert.equal(productAt(index * 24 + 23.99), product);
  });
  assert.equal(productAt(96), 'intune');
  assert.equal(productAt(24), 'purview');
  assert.equal(productAt(0), 'entra');
  assert.deepEqual(getTimeline(120), { elapsed: 120, chapter: 4, progress: 1, complete: true });
  assert.equal(getTimeline(-1).elapsed, 0);
  assert.equal(getTimeline(121).elapsed, 120);
  assert.throws(() => getTimeline(NaN), TypeError);
});
