import { chapters, DURATION, getTimeline, formatTime } from './timeline.js';
import { createFabricScene } from './scene.js';
import { connectPresenter, notifyChapterChange } from '../../../src/presentation-bridge.js';

const $ = (selector) => document.querySelector(selector);
const paths = {
  sources: '<ellipse cx="7" cy="5" rx="4" ry="2"/><path d="M3 5v8c0 3 8 3 8 0V5m4 3h6m-3-3v6M5 19h14m-7-4v4"/><rect x="15" y="13" width="6" height="5" rx="1"/>',
  lake: '<path d="M3 8c3-4 6 4 9 0s6 4 9 0M3 13c3-4 6 4 9 0s6 4 9 0M3 18c3-4 6 4 9 0s6 4 9 0"/>',
  semantic: '<rect x="2" y="3" width="8" height="7" rx="1"/><rect x="14" y="14" width="8" height="7" rx="1"/><path d="M6 10v7h8M2 6h8m4 11h8m-4-7V3h-4"/>',
  ontology: '<circle cx="12" cy="4" r="2"/><circle cx="4" cy="13" r="2"/><circle cx="20" cy="13" r="2"/><circle cx="12" cy="21" r="2"/><path d="m11 6-6 5m8-5 6 5M6 15l4 4m8-4-4 4M6 13h12"/>',
  agent: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m20 2 .7 1.3L22 4l-1.3.7L20 6l-.7-1.3L18 4l1.3-.7Z"/>',
};

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
    $('#visual-eyebrow').textContent = chapter.eyebrow;
    $('#visual-caption').textContent = chapter.caption;
    $('#visual-detail').textContent = chapter.detail;
    $('#announcement').textContent = `${chapter.title}. ${chapter.text}`;
    const layer = activeChapter < 2 ? 'onelake' : activeChapter === 2 ? 'semantic' : 'ontology';
    document.querySelectorAll('.layer-step').forEach((element) => element.classList.toggle('active', element.dataset.layer === layer));
    $('#question-card').classList.toggle('visible', activeChapter === 4);
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
  scene = createFabricScene($('#graph'), $('#scene-labels'));
  document.documentElement.dataset.graphReady = 'true';
} catch (error) {
  console.error('Unable to initialize the Fabric IQ illustration:', error);
  $('#render-error').hidden = false;
  document.documentElement.dataset.graphReady = 'false';
}
setReducedMotion(reducedMotion);
updateTimeline();
setPlaying(false);

connectPresenter({
  id: 'fabric-iq', chapters,
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
