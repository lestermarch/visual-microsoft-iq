import test from 'node:test';
import assert from 'node:assert/strict';
import { steps } from '../src/catalog.js';
import { moveStep, findStep, getNavigationCommand } from '../src/navigation.js';

test('one continuous sequence visits every subsection in presentation order', () => {
  const visited = [];
  let index = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[index];
    visited.push(`${step.presentation.id}/${step.chapterIndex}`);
    index = moveStep(index, 1);
  }
  const expected = [
    ...Array.from({ length: 5 }, (_, i) => `iq-overview/${i}`),
    ...Array.from({ length: 5 }, (_, i) => `work-iq/${i}`),
    ...Array.from({ length: 5 }, (_, i) => `fabric-iq/${i}`),
    ...Array.from({ length: 6 }, (_, i) => `foundry-iq/${i}`),
    ...Array.from({ length: 6 }, (_, i) => `web-iq/${i}`),
    ...Array.from({ length: 5 }, (_, i) => `security-governance/${i}`),
  ];
  assert.deepEqual(visited, expected);
  assert.equal(moveStep(0, -1), 0);
  assert.equal(moveStep(31, 1), 31);
  assert.equal(moveStep(findStep('iq-overview', 4), 1), findStep('work-iq'));
  assert.equal(moveStep(findStep('work-iq'), -1), findStep('iq-overview', 4));
  assert.equal(moveStep(findStep('fabric-iq'), -1), findStep('work-iq', 4));
  assert.equal(moveStep(findStep('foundry-iq'), -1), findStep('fabric-iq', 4));
  assert.equal(moveStep(findStep('web-iq'), -1), findStep('foundry-iq', 5));
  assert.equal(moveStep(findStep('security-governance'), -1), findStep('web-iq', 5));
  assert.equal(moveStep(findStep('web-iq', 5), 1), findStep('security-governance'));
});

test('manual jumps locate the intended presentation and subsection', () => {
  assert.equal(findStep('iq-overview'), 0);
  assert.equal(findStep('iq-overview', 4), 4);
  assert.equal(findStep('work-iq'), 5);
  assert.equal(findStep('fabric-iq'), 10);
  assert.equal(findStep('foundry-iq'), 15);
  assert.equal(findStep('web-iq'), 21);
  assert.equal(findStep('web-iq', 5), 26);
  assert.equal(findStep('security-governance'), 27);
  assert.equal(findStep('security-governance', 4), 31);
  assert.throws(() => findStep('unknown'), RangeError);
  assert.throws(() => findStep('work-iq', 5), RangeError);
  assert.throws(() => findStep('iq-overview', 5), RangeError);
});

test('presenter keys work without stealing text input or modified browser keys', () => {
  const key = (key, extras = {}) => ({ key, code: key === ' ' ? 'Space' : key, ...extras });
  assert.equal(getNavigationCommand(key('ArrowRight')), 'next');
  assert.equal(getNavigationCommand(key('PageDown')), 'next');
  assert.equal(getNavigationCommand(key(' ')), 'next');
  assert.equal(getNavigationCommand(key(' ', { shiftKey: true })), 'previous');
  assert.equal(getNavigationCommand(key('ArrowLeft')), 'previous');
  assert.equal(getNavigationCommand(key('PageUp')), 'previous');
  assert.equal(getNavigationCommand(key('Home')), 'first');
  assert.equal(getNavigationCommand(key('End')), 'last');
  assert.equal(getNavigationCommand(key('F')), 'fullscreen');
  assert.equal(getNavigationCommand(key('ArrowRight', { ctrlKey: true })), null);
  assert.equal(getNavigationCommand(key('ArrowRight', { repeat: true })), null);
  assert.equal(getNavigationCommand(key('ArrowRight', { target: { closest: () => true } })), null);
});
