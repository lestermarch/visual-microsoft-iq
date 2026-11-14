import { chapters, DURATION, getTimeline, formatTime } from './timeline.js';
import { createWebScene } from './scene.js';
import { icons as paths } from './data.js';
import { connectPresenter, notifyChapterChange } from '../../../src/presentation-bridge.js';

const $ = (selector) => document.querySelector(selector);

$('#chapters').innerHTML = chapters.map((chapter, index) => `
  <button class="chapter" data-index="${index}" data-color="${chapter.color}" aria-pressed="false" aria-label="${chapter.title}. ${chapter.text} Jump to ${formatTime(chapter.start)}.">
    <span class="chapter-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${paths[chapter.icon]}</svg></span>
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
const scrubber = $('#scrubber');
const playButton = $('#play');
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
    notifyChapterChange(activeChapter);
    const chapter = chapters[activeChapter];
    document.documentElement.dataset.chapter = String(activeChapter);
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === activeChapter);
      card.classList.toggle('visited', index < activeChapter);
      card.setAttribute('aria-pressed', String(index === activeChapter));
      card.querySelector('.chapter-state').textContent = index < activeChapter ? '\u2713' : index === activeChapter ? '\u2022' : String(index + 1).padStart(2, '0');
    });
    $('#chapter-number').textContent = String(activeChapter + 1).padStart(2, '0');
    $('#visual-caption').textContent = chapter.caption;
    $('#visual-detail').textContent = chapter.detail;
    $('#announcement').textContent = `${chapter.title}. ${chapter.text}`;
    $('#context-title').textContent = activeChapter === 5 ? 'Agent-ready context, with source references' : 'One connected world of information';
    scene?.setChapter(activeChapter);
  }
  cards.forEach((card, index) => {
    const progress = index < state.chapter ? 1 : index === state.chapter ? state.progress : 0;
    card.querySelector('.chapter-progress').style.transform = `scaleX(${progress})`;
  });
  scrubber.value = String(elapsed);
  scrubber.style.setProperty('--progress', `${elapsed / DURATION * 100}%`);
  scrubber.setAttribute('aria-valuetext', `${Math.floor(elapsed / 60)} minutes, ${Math.floor(elapsed % 60)} seconds`);
  $('#elapsed').textContent = formatTime(elapsed);
}

function setPlaying(value) {
  playing = value;
  playButton.setAttribute('aria-label', playing ? 'Pause presentation' : elapsed >= DURATION ? 'Replay presentation' : 'Play presentation');
  $('#play-icon').innerHTML = playing ? '<path d="M7 5h4v14H7zm6 0h4v14h-4Z"/>' : '<path d="m9 5 11 7-11 7Z"/>';
  $('#playback-label').textContent = playing ? 'PRESENTATION IN MOTION' : elapsed >= DURATION ? 'PRESENTATION COMPLETE' : elapsed > 0 ? 'PRESENTATION PAUSED' : 'PRESENTATION READY';
}

function seek(time) {
  elapsed = getTimeline(time).elapsed;
  setPlaying(playing && elapsed < DURATION);
  updateTimeline();
}

function togglePlay() {
  if (elapsed === DURATION) seek(0);
  setPlaying(!playing);
}

function restart() {
  seek(0);
  setPlaying(true);
}

function setReducedMotion(value) {
  reducedMotion = value;
  document.documentElement.classList.toggle('reduced-motion', value);
  $('#motion').setAttribute('aria-pressed', String(value));
  $('#motion').setAttribute('aria-label', value ? 'Enable animation' : 'Reduce animation');
  $('#motion').title = value ? 'Enable animation' : 'Reduce animation';
}

async function fullscreen() {
  $('#control-error').hidden = true;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('#presentation').requestFullscreen) await $('#presentation').requestFullscreen();
    else throw new Error('Fullscreen is not supported by this browser.');
  } catch (error) {
    console.error('Fullscreen unavailable:', error);
    $('#control-error').textContent = 'Fullscreen is unavailable in this preview. Open the HTML in your browser and use its fullscreen control.';
    $('#control-error').hidden = false;
  }
}

playButton.addEventListener('click', togglePlay);
$('#restart').addEventListener('click', restart);
scrubber.addEventListener('input', () => seek(Number(scrubber.value)));
$('#motion').addEventListener('click', () => setReducedMotion(!reducedMotion));
$('#fullscreen').addEventListener('click', fullscreen);
cards.forEach((card, index) => card.addEventListener('click', () => seek(chapters[index].start)));
$('#demo-grounding').addEventListener('click', () => seek(100));
$('.brand').addEventListener('click', (event) => {
  event.preventDefault();
  setPlaying(false);
  seek(0);
});
motionPreference.addEventListener('change', (event) => setReducedMotion(event.matches));
document.addEventListener('fullscreenchange', () => {
  $('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Leave fullscreen' : 'Enter fullscreen');
});
document.addEventListener('keydown', (event) => {
  if (document.documentElement.dataset.presenter === 'true') return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button, input, a, textarea, select, [contenteditable]')) return;
  if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
  else if (event.key.toLowerCase() === 'r') restart();
  else if (event.key.toLowerCase() === 'f') fullscreen();
  else if (event.key === 'ArrowRight') { event.preventDefault(); seek(elapsed + 5); }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); seek(elapsed - 5); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) setPlaying(false);
  lastFrame = performance.now();
});

try {
  scene = createWebScene($('#graph'), $('#data-layer'));
  document.documentElement.dataset.graphReady = 'true';
} catch (error) {
  console.error('Unable to initialize the Web IQ information sphere:', error);
  $('#render-error').hidden = false;
  document.documentElement.dataset.graphReady = 'false';
}
setReducedMotion(reducedMotion);
updateTimeline();
setPlaying(false);

connectPresenter({
  id: 'web-iq', chapters,
  getChapter: () => activeChapter,
  selectChapter: (index) => { setPlaying(false); seek(chapters[index].start); },
  setReducedMotion,
});

function animate(now) {
  const actualDelta = Math.max(0, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!document.hidden) {
    if (playing) {
      elapsed = Math.min(DURATION, elapsed + actualDelta);
      updateTimeline();
      if (elapsed === DURATION) {
        setPlaying(false);
        $('#announcement').textContent = 'Presentation complete. Select Replay to start again.';
      }
    }
    const delta = Math.min(actualDelta, .1);
    if (!reducedMotion) ambientTime += delta;
    scene?.render(ambientTime, delta, reducedMotion);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
