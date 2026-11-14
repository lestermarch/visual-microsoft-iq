import { steps } from './catalog.js';

export function moveStep(currentIndex, direction) {
  return Math.max(0, Math.min(steps.length - 1, currentIndex + direction));
}

export function findStep(presentationId, chapterIndex = 0) {
  const index = steps.findIndex((step) =>
    step.presentation.id === presentationId && step.chapterIndex === chapterIndex,
  );
  if (index < 0) throw new RangeError(`Unknown presentation step: ${presentationId}/${chapterIndex}`);
  return index;
}

export function getNavigationCommand(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return null;
  if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return null;
  if (['ArrowRight', 'PageDown'].includes(event.key)) return 'next';
  if (['ArrowLeft', 'PageUp'].includes(event.key)) return 'previous';
  if (event.code === 'Space') return event.shiftKey ? 'previous' : 'next';
  if (event.key === 'Home') return 'first';
  if (event.key === 'End') return 'last';
  if (event.key.toLowerCase() === 'f') return 'fullscreen';
  return null;
}
