import './embedded.css';
import { getNavigationCommand } from './navigation.js';

let connected = false;

export function notifyChapterChange(chapterIndex) {
  if (connected) window.dispatchEvent(new CustomEvent('iq:chapter-change', { detail: chapterIndex }));
}

export function connectPresenter({ id, chapters, getChapter, selectChapter, setReducedMotion }) {
  if (window.parent === window) return;
  document.documentElement.dataset.presenter = 'true';
  document.querySelectorAll('.chapter').forEach((button, index) => {
    button.setAttribute('aria-label', `${chapters[index].title}. ${chapters[index].text}`);
  });

  // An explicit same-origin API keeps the shell independent of presentation markup.
  window.iqPresenter = Object.freeze({
    id,
    getChapter,
    selectChapter(index) {
      if (!Number.isInteger(index) || index < 0 || index >= chapters.length) {
        throw new RangeError(`Invalid ${id} chapter: ${index}`);
      }
      selectChapter(index);
    },
    setReducedMotion,
  });
  connected = true;

  window.addEventListener('keydown', (event) => {
    const command = getNavigationCommand(event);
    if (!command) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.dispatchEvent(new CustomEvent('iq:navigate', { detail: command }));
  }, { capture: true });
}
