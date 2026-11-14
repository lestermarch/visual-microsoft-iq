import { chapters, DURATION, getTimeline, formatTime } from './timeline.js';
import { createOverviewScene } from './scene.js';
import { icon } from './symbols.js';
import { connectPresenter, notifyChapterChange } from '../../../src/presentation-bridge.js';

const $ = (selector) => document.querySelector(selector);
$('#chapters').innerHTML = chapters.map((chapter, index) => `
  <button class="chapter" data-index="${index}" data-color="${chapter.color}" aria-pressed="false" aria-label="${chapter.title}. ${chapter.text}">
    <span class="chapter-icon">${icon(chapter.id)}</span>
    <span class="chapter-body">
      <span class="chapter-title-row"><span class="chapter-title">${chapter.title}</span><span class="chapter-time">${formatTime(chapter.start)}</span></span>
      <span class="chapter-summary">${chapter.summary}</span>
      <span class="chapter-kicker">${chapter.kicker}</span>
      <span class="chapter-text">${chapter.text}</span>
    </span>
    <span class="chapter-state" aria-hidden="true"></span>
    <span class="chapter-progress" aria-hidden="true"></span>
  </button>`).join('');

const cards = [...document.querySelectorAll('.chapter')];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let elapsed = 0;
let playing = false;
let activeChapter = -1;
let reducedMotion = motionPreference.matches;
let lastFrame = performance.now();
let ambientTime = 0;
let scene;

function updateTimeline() {
  const state = getTimeline(elapsed);
  if (activeChapter !== state.chapter) {
    activeChapter = state.chapter;
    const chapter = chapters[activeChapter];
    document.documentElement.dataset.chapter = String(activeChapter);
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === activeChapter);
      card.classList.toggle('visited', index < activeChapter);
      card.setAttribute('aria-pressed', String(index === activeChapter));
      card.querySelector('.chapter-state').textContent = index < activeChapter ? '\u2713' : String(index + 1).padStart(2, '0');
    });
    $('#chapter-number').textContent = String(activeChapter + 1).padStart(2, '0');
    $('#visual-caption').textContent = chapter.caption;
    $('#visual-detail').textContent = chapter.detail;
    $('#overview-outcome').textContent = chapter.outcome;
    $('#announcement').textContent = `${chapter.title}. ${chapter.text}`;
    scene?.setChapter(activeChapter);
    notifyChapterChange(activeChapter);
  }
  cards.forEach((card, index) => {
    const progress = index < state.chapter ? 1 : index === state.chapter ? state.progress : 0;
    card.querySelector('.chapter-progress').style.transform = `scaleX(${progress})`;
  });
  $('#scrubber').value = String(elapsed);
  $('#scrubber').style.setProperty('--progress', `${elapsed / DURATION * 100}%`);
  $('#scrubber').setAttribute('aria-valuetext', `${formatTime(elapsed)} of 2:00`);
  $('#elapsed').textContent = formatTime(elapsed);
}

function setPlaying(value) {
  playing = value;
  $('#play').setAttribute('aria-label', value ? 'Pause presentation' : elapsed === DURATION ? 'Replay presentation' : 'Play presentation');
  $('#play-icon').innerHTML = value ? '<path d="M7 5h4v14H7zm6 0h4v14h-4Z"/>' : '<path d="m9 5 11 7-11 7Z"/>';
  $('#playback-label').textContent = value ? 'PRESENTATION IN MOTION' : elapsed === DURATION ? 'PRESENTATION COMPLETE' : 'PRESENTATION PAUSED';
}

function seek(time) {
  elapsed = getTimeline(time).elapsed;
  if (elapsed === DURATION) setPlaying(false);
  updateTimeline();
}

function togglePlay() {
  if (elapsed === DURATION) seek(0);
  setPlaying(!playing);
}

function setReducedMotion(value) {
  reducedMotion = value;
  document.documentElement.classList.toggle('reduced-motion', value);
  $('#motion').setAttribute('aria-pressed', String(value));
  $('#motion').setAttribute('aria-label', value ? 'Enable animation' : 'Reduce animation');
}

cards.forEach((card, index) => card.addEventListener('click', () => seek(chapters[index].start)));
$('#play').addEventListener('click', togglePlay);
$('#restart').addEventListener('click', () => { seek(0); setPlaying(true); });
$('#scrubber').addEventListener('input', () => seek(Number($('#scrubber').value)));
$('#motion').addEventListener('click', () => setReducedMotion(!reducedMotion));
$('.brand').addEventListener('click', (event) => { event.preventDefault(); setPlaying(false); seek(0); });
motionPreference.addEventListener('change', (event) => setReducedMotion(event.matches));
document.addEventListener('keydown', (event) => {
  if (document.documentElement.dataset.presenter === 'true' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button, input, a, textarea, select, [contenteditable]')) return;
  if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) setPlaying(false);
  lastFrame = performance.now();
});

try {
  scene = createOverviewScene($('#graph'), $('#overview-labels'));
  document.documentElement.dataset.graphReady = 'true';
} catch (error) {
  console.error('Unable to initialize the Microsoft IQ overview:', error);
  document.documentElement.dataset.graphReady = 'false';
  $('#render-error').hidden = false;
}
setReducedMotion(reducedMotion);
updateTimeline();
connectPresenter({
  id: 'iq-overview', chapters,
  getChapter: () => activeChapter,
  selectChapter: (index) => { setPlaying(false); seek(chapters[index].start); },
  setReducedMotion,
});

function animate(now) {
  const delta = Math.max(0, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!document.hidden) {
    if (playing) seek(Math.min(DURATION, elapsed + delta));
    if (!reducedMotion) ambientTime += Math.min(delta, .1);
    scene?.render(ambientTime, reducedMotion);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
