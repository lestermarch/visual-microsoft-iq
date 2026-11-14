import { presentations, steps } from './catalog.js';
import { documents } from './documents.js';
import { findStep, moveStep, getNavigationCommand } from './navigation.js';

const $ = (selector) => document.querySelector(selector);
const frame = $('#deck-frame');
const stage = $('#stage');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let currentIndex = 0;
let activeApi = null;
let loadingId = null;
let loadTimeout;
let pageFade = null;
let loadingIndicatorTimeout;
let pendingMount = null;
let reducedMotion = motionPreference.matches;
let theme = document.documentElement.dataset.theme;

$('#iq-menu').innerHTML = presentations.map((presentation) =>
  `<button data-presentation="${presentation.id}" data-color="${presentation.color}">${presentation.title}</button>`,
).join('');
const menuButtons = [...document.querySelectorAll('[data-presentation]')];
$('#step-total').textContent = String(steps.length);
$('#suite-progress').setAttribute('aria-valuemax', String(steps.length));

function renderNavigation() {
  const step = steps[currentIndex];
  const next = steps[currentIndex + 1];
  document.documentElement.dataset.step = String(currentIndex);
  document.documentElement.dataset.iq = step.presentation.id;
  menuButtons.forEach((button) => {
    if (button.dataset.presentation === step.presentation.id) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  $('#current-iq').textContent = step.presentation.title;
  $('#current-step').textContent = step.title;
  $('#local-position').textContent = `${String(step.chapterIndex + 1).padStart(2, '0')} / ${String(step.presentation.chapters.length).padStart(2, '0')}`;
  $('#step-number').textContent = String(currentIndex + 1).padStart(2, '0');
  $('#previous').disabled = currentIndex === 0;
  $('#next').disabled = !next;
  $('#next-label').textContent = !next ? 'End of presentation' : next.presentation.id !== step.presentation.id ? `Next: ${next.presentation.title}` : 'Next';
  $('#next').setAttribute('aria-label', next ? `Next: ${next.presentation.title}, ${next.title}` : 'End of presentation');
  $('#suite-progress').setAttribute('aria-valuenow', String(currentIndex + 1));
  $('#suite-progress').setAttribute('aria-valuetext', `${currentIndex + 1} of ${steps.length}: ${step.presentation.title}, ${step.title}`);
  $('#suite-progress').style.setProperty('--suite-progress', String((currentIndex + 1) / steps.length));
  $('#suite-announcement').textContent = `${step.presentation.title}. ${step.title}. Step ${currentIndex + 1} of ${steps.length}.`;
}

function showLoadError(error) {
  console.error('Unable to open the IQ presentation:', error);
  clearTimeout(loadingIndicatorTimeout);
  stage.setAttribute('aria-busy', 'false');
  $('#loading').hidden = true;
  $('#load-error-message').textContent = error.message;
  $('#load-error').hidden = false;
}

function cancelPageFade() {
  pageFade?.cancel();
  pageFade = null;
}

function loadPresentation(forceReload = false) {
  const step = steps[currentIndex];
  if (!forceReload && loadingId === step.presentation.id) return;
  if (!forceReload && activeApi?.id === step.presentation.id) {
    activeApi.selectChapter(step.chapterIndex);
    return;
  }
  clearTimeout(loadTimeout);
  clearTimeout(loadingIndicatorTimeout);
  const fadeOut = Boolean(frame.srcdoc) && !reducedMotion;
  const startOpacity = Number(getComputedStyle(frame).opacity);
  cancelPageFade();
  activeApi = null;
  loadingId = step.presentation.id;
  stage.setAttribute('aria-busy', 'true');
  stage.classList.add('is-switching');
  $('#load-error').hidden = true;
  $('#loading').textContent = `Opening ${step.presentation.title}...`;
  $('#loading').hidden = true;
  frame.title = `${step.presentation.title} presentation`;
  pendingMount = () => {
    pendingMount = null;
    // Apply the palette before scene construction; Three.js materials cache theme colours.
    frame.dataset.theme = theme;
    frame.srcdoc = documents[step.presentation.id];
    loadingIndicatorTimeout = setTimeout(() => { $('#loading').hidden = false; }, 300);
    loadTimeout = setTimeout(() => {
      showLoadError(new Error(`${steps[currentIndex].presentation.title} did not finish loading. Select Try again to reload it.`));
    }, 15000);
  };
  if (fadeOut) {
    const animation = frame.animate([{ opacity: startOpacity }, { opacity: 0 }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    pageFade = animation;
    animation.addEventListener('finish', () => {
      if (pageFade === animation && pendingMount) pendingMount();
    }, { once: true });
  } else pendingMount();
}

function goToStep(index) {
  currentIndex = index;
  renderNavigation();
  loadPresentation();
}

function runCommand(command) {
  if (command === 'next') goToStep(moveStep(currentIndex, 1));
  else if (command === 'previous') goToStep(moveStep(currentIndex, -1));
  else if (command === 'first') goToStep(0);
  else if (command === 'last') goToStep(steps.length - 1);
  else if (command === 'fullscreen') toggleFullscreen();
}

async function toggleFullscreen() {
  $('#suite-control-error').hidden = true;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('#suite').requestFullscreen) await $('#suite').requestFullscreen();
    else throw new Error('Fullscreen is not supported by this browser.');
  } catch (error) {
    console.error('Unable to enter fullscreen:', error);
    $('#suite-control-error').textContent = 'Fullscreen is unavailable in this preview. Open the app in your browser and use its fullscreen control.';
    $('#suite-control-error').hidden = false;
  }
}

function setReducedMotion(value) {
  reducedMotion = value;
  document.documentElement.classList.toggle('reduced-motion', value);
  $('#motion-suite').setAttribute('aria-pressed', String(value));
  $('#motion-suite').textContent = value ? 'Enable motion' : 'Reduce motion';
  activeApi?.setReducedMotion(value);
  if (value) {
    cancelPageFade();
    if (pendingMount) pendingMount();
  }
}

function renderTheme() {
  document.documentElement.dataset.theme = theme;
  $('#theme-suite').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  $('#theme-suite').setAttribute('aria-pressed', String(theme === 'dark'));
  $('#theme-suite').setAttribute('aria-label', theme === 'dark' ? 'Use light mode' : 'Use dark mode');
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--cp-bg').trim();
}

frame.addEventListener('load', () => {
  const api = frame.contentWindow.iqPresenter;
  if (pendingMount || !api || api.id !== loadingId || frame.contentDocument.documentElement.dataset.theme !== theme) return;
  clearTimeout(loadTimeout);
  clearTimeout(loadingIndicatorTimeout);
  loadingId = null;
  activeApi = api;
  api.selectChapter(steps[currentIndex].chapterIndex);
  api.setReducedMotion(reducedMotion);
  frame.contentWindow.addEventListener('iq:chapter-change', (event) => {
    if (loadingId || activeApi !== api) return;
    currentIndex = findStep(api.id, event.detail);
    renderNavigation();
  });
  frame.contentWindow.addEventListener('iq:navigate', (event) => runCommand(event.detail));
  stage.setAttribute('aria-busy', 'false');
  cancelPageFade();
  stage.classList.remove('is-switching');
  if (!reducedMotion) {
    pageFade = frame.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  }
  $('#loading').hidden = true;
  $('#load-error').hidden = true;
});

$('#next').addEventListener('click', () => runCommand('next'));
$('#previous').addEventListener('click', () => runCommand('previous'));
$('#restart-suite').addEventListener('click', () => runCommand('first'));
$('#home').addEventListener('click', (event) => {
  event.preventDefault();
  runCommand('first');
});
menuButtons.forEach((button) => button.addEventListener('click', () => goToStep(findStep(button.dataset.presentation))));
$('#motion-suite').addEventListener('click', () => setReducedMotion(!reducedMotion));
$('#theme-suite').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  renderTheme();
  loadPresentation(true);
});
$('#fullscreen-suite').addEventListener('click', toggleFullscreen);
$('#retry').addEventListener('click', () => loadPresentation(true));
motionPreference.addEventListener('change', (event) => setReducedMotion(event.matches));
document.addEventListener('keydown', (event) => {
  const command = getNavigationCommand(event);
  if (!command) return;
  event.preventDefault();
  runCommand(command);
}, { capture: true });
document.addEventListener('fullscreenchange', () => {
  $('#fullscreen-suite').setAttribute('aria-label', document.fullscreenElement ? 'Leave fullscreen' : 'Enter fullscreen');
});

setReducedMotion(reducedMotion);
renderTheme();
goToStep(0);
