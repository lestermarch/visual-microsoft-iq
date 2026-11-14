import * as THREE from 'three';
import { chapters, DURATION, getTimeline, formatTime } from './timeline.js';
import { connectPresenter, notifyChapterChange } from '../../../src/presentation-bridge.js';

const $ = (selector) => document.querySelector(selector);
const sceneElement = $('.intelligence-scene');
const graphElement = $('#graph');
const playButton = $('#play');
const scrubber = $('#scrubber');
const announcement = $('#announcement');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
let elapsed = 0;
let playing = false;
let activeChapter = -1;
let lastFrame = performance.now();
let ambientTime = 0;
let graph;

const paths = {
  intelligence: '<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="1.5"/><circle cx="19" cy="6" r="1.5"/><circle cx="6" cy="19" r="1.5"/><circle cx="19" cy="18" r="1.5"/><path d="m6 6 4 4m4-1 4-2M8 17l2-3m4 0 4 3"/>',
  speed: '<path d="m14 2-9 12h7l-2 8 9-12h-7Z"/>',
  efficiency: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  scale: '<rect x="3" y="13" width="6" height="8" rx="1"/><rect x="15" y="3" width="6" height="8" rx="1"/><path d="M3 9V3h6m-6 0 7 7m11 5v6h-6m6 0-7-7"/>',
  security: '<path d="M12 2 4 5v6c0 5 8 10 8 10s8-5 8-10V5l-8-3Z"/><path d="m8 11 3 3 5-6"/>',
};
const summaries = [
  'High-quality context across your data estate',
  'Fewer round trips. Richer context. Lower latency.',
  'Retrieval, context, and reasoning - together',
  'High-volume reasoning and tool-calling',
  'Enterprise data and governance, preserved',
];

$('#chapters').innerHTML = chapters.map((chapter, i) => `
  <button class="chapter" data-index="${i}" data-color="${chapter.color}" aria-label="${chapter.title}: ${chapter.text} Jump to ${formatTime(chapter.start)}." aria-pressed="false">
    <span class="chapter-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${paths[chapter.icon]}</svg></span>
    <span class="chapter-body">
      <span class="chapter-title-row"><span class="chapter-title">${chapter.title}</span><span class="chapter-time">${formatTime(chapter.start)}</span></span>
      <span class="chapter-summary">${summaries[i]}</span>
      <span class="chapter-kicker">${chapter.kicker}</span>
      <span class="chapter-text">${chapter.text}</span>
    </span>
    <span class="chapter-state" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <span class="chapter-progress" aria-hidden="true"></span>
  </button>
`).join('');
const chapterElements = [...document.querySelectorAll('.chapter')];

function updateTimeline() {
  const state = getTimeline(elapsed);
  if (state.chapter !== activeChapter) {
    activeChapter = state.chapter;
    notifyChapterChange(activeChapter);
    chapterElements.forEach((element, index) => {
      element.classList.toggle('active', index === activeChapter);
      element.classList.toggle('visited', index < activeChapter);
      element.setAttribute('aria-pressed', String(index === activeChapter));
      element.querySelector('.chapter-state').textContent = index < activeChapter ? '\u2713' : index === activeChapter ? '\u2022' : String(index + 1).padStart(2, '0');
    });
    $('#chapter-number').textContent = String(activeChapter + 1).padStart(2, '0');
    announcement.textContent = `${chapters[activeChapter].title}. ${chapters[activeChapter].text}`;
    if (graph) graph.setChapter(activeChapter);
  }
  chapterElements.forEach((element, index) => {
    const progress = index < state.chapter ? 1 : index === state.chapter ? state.progress : 0;
    element.querySelector('.chapter-progress').style.transform = `scaleX(${progress})`;
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
  if (elapsed === DURATION) setPlaying(false);
  else setPlaying(playing);
  updateTimeline();
}

function togglePlay() {
  if (elapsed >= DURATION) seek(0);
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

function showControlError(message) {
  $('#control-error').textContent = message;
  $('#control-error').hidden = false;
}

async function toggleFullscreen() {
  $('#control-error').hidden = true;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('#presentation').requestFullscreen) await $('#presentation').requestFullscreen();
    else showControlError('Fullscreen is not supported here. Open this page in a browser and use its fullscreen control.');
  } catch (error) {
    console.error('Unable to change fullscreen mode:', error);
    showControlError('Fullscreen was blocked in this preview. Open the page in a browser to present fullscreen.');
  }
}

playButton.addEventListener('click', togglePlay);
$('#restart').addEventListener('click', restart);
scrubber.addEventListener('input', () => seek(Number(scrubber.value)));
$('#motion').addEventListener('click', () => setReducedMotion(!reducedMotion));
$('#fullscreen').addEventListener('click', toggleFullscreen);
$('.brand').addEventListener('click', (event) => {
  event.preventDefault();
  setPlaying(false);
  seek(0);
});
chapterElements.forEach((element, index) => element.addEventListener('click', () => seek(chapters[index].start)));
document.addEventListener('fullscreenchange', () => {
  $('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Leave fullscreen' : 'Enter fullscreen');
});
motionPreference.addEventListener('change', (event) => setReducedMotion(event.matches));
document.addEventListener('keydown', (event) => {
  if (document.documentElement.dataset.presenter === 'true') return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button, input, a, textarea, select, [contenteditable]')) return;
  if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
  else if (event.key.toLowerCase() === 'r') restart();
  else if (event.key.toLowerCase() === 'f') toggleFullscreen();
  else if (event.key === 'ArrowRight') { event.preventDefault(); seek(elapsed + 5); }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); seek(elapsed - 5); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) setPlaying(false);
  lastFrame = performance.now();
});

function createGraph() {
  const styles = getComputedStyle(document.documentElement);
  const color = (token) => new THREE.Color(styles.getPropertyValue(token).trim());
  const palette = ['--cp-azure', '--cp-cyan', '--cp-violet', '--cp-azure', '--cp-teal'].map(color);
  const teal = color('--cp-teal');
  const blue = color('--cp-azure');
  const violet = color('--cp-violet');
  let targetColor = palette[0];
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0, 0, 9.4);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  graphElement.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    $('#render-error').hidden = false;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => { $('#render-error').hidden = true; });

  const globe = new THREE.Group();
  scene.add(globe);
  const positions = [];
  const points = [];
  const pointColors = [];
  const count = 1150;
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    const point = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).multiplyScalar(2.12);
    points.push(point);
    positions.push(...point.toArray());
    const tint = i % 13 === 0 ? blue : i % 19 === 0 ? violet : teal;
    pointColors.push(tint.r, tint.g, tint.b);
  }
  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  dotGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));
  const dotMaterial = new THREE.PointsMaterial({ size: .023, vertexColors: true, transparent: true, opacity: .65, depthWrite: false });
  globe.add(new THREE.Points(dotGeometry, dotMaterial));

  const connectionPositions = [];
  for (let i = 0; i < count; i++) {
    // Fibonacci neighbors create a fine, coherent mesh without an all-pairs search.
    for (const offset of [21, 34, 55]) {
      const neighbor = points[i + offset];
      if (neighbor && points[i].distanceToSquared(neighbor) < .36) connectionPositions.push(...points[i].toArray(), ...neighbor.toArray());
    }
  }
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
  const edgeMaterial = new THREE.LineBasicMaterial({ color: teal, transparent: true, opacity: .12, depthWrite: false });
  globe.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

  const innerPositions = [];
  let seed = 12;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (let i = 0; i < 1450; i++) {
    const z = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const r = 2.08 * Math.cbrt(random());
    const s = Math.sqrt(1 - z * z);
    innerPositions.push(r * s * Math.cos(angle), r * z, r * s * Math.sin(angle));
  }
  const innerGeometry = new THREE.BufferGeometry();
  innerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(innerPositions, 3));
  globe.add(new THREE.Points(innerGeometry, new THREE.PointsMaterial({ color: teal, size: .012, transparent: true, opacity: .25, depthWrite: false })));

  const ringGroup = new THREE.Group();
  globe.add(ringGroup);
  const ringMaterials = [];
  for (let i = 0; i < 6; i++) {
    const ringPoints = [];
    for (let j = 0; j <= 180; j++) {
      const angle = j / 180 * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * 2.16, Math.sin(angle) * 2.16, 0));
    }
    const material = new THREE.LineBasicMaterial({ color: i % 3 === 0 ? violet : i % 2 ? blue : teal, transparent: true, opacity: .22, depthWrite: false });
    ringMaterials.push(material);
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints), material);
    ring.rotation.set(i * .49, i * .72, i * .21);
    ringGroup.add(ring);
  }

  const outerPoints = [];
  for (let i = 0; i <= 240; i++) {
    const angle = i / 240 * Math.PI * 2;
    outerPoints.push(new THREE.Vector3(Math.cos(angle) * 2.88, Math.sin(angle) * 2.88, 0));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outerPoints), new THREE.LineBasicMaterial({ color: blue, opacity: .13, transparent: true })));

  const pulseGeometry = new THREE.SphereGeometry(.025, 8, 8);
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: blue, transparent: true, opacity: .8 });
  const pulses = [];
  const rays = [];
  for (let i = 0; i < 10; i++) {
    const angle = i / 10 * Math.PI * 2;
    const start = new THREE.Vector3(Math.sin(angle) * .68, Math.cos(angle) * .68, 0);
    const end = new THREE.Vector3(Math.sin(angle) * 2.83, Math.cos(angle) * 2.83, 0);
    const mid = start.clone().lerp(end, .5);
    mid.z = Math.sin(i * 2) * .8;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    rays.push(curve);
    const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), new THREE.LineDashedMaterial({ color: teal, opacity: .22, transparent: true, dashSize: .035, gapSize: .045 }));
    ray.computeLineDistances();
    scene.add(ray);
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    scene.add(pulse);
    pulses.push(pulse);
  }

  const apps = [
    { name: 'Outlook', letter: 'O', color: '--cp-azure', angle: 0 },
    { name: 'Word', letter: 'W', color: '--cp-azure', angle: 36 },
    { name: 'Excel', letter: 'X', color: '--cp-green', angle: 72 },
    { name: 'PowerPoint', letter: 'P', color: '--cp-orange', angle: 108 },
    { name: 'OneNote', letter: 'N', color: '--cp-purple', angle: 144 },
    { name: 'SharePoint', letter: 'S', color: '--cp-teal', angle: 180 },
    { name: 'OneDrive', color: '--cp-azure', angle: 216, svg: '<path d="M9 10a6 6 0 0 1 11-2 5 5 0 1 1 1 10H7a4 4 0 1 1 2-8Z" fill="currentColor"/>' },
    { name: 'Loop', color: '--cp-violet', angle: 252, svg: '<path d="M9 4C3 4 2 9 3 13s4 7 9 6l6-3c4-3 3-9-1-10L9 4Z" stroke="currentColor" stroke-width="3"/><path d="m10 9 7 3-6 4" stroke="currentColor" stroke-width="2"/>' },
    { name: 'Copilot', color: '--cp-cyan', angle: 288, svg: '<path d="M7 5c1-3 5-3 7 0l6 10c2 4-2 7-5 4L5 9C3 6 5 3 8 5Zm10 0c-1-3-5-3-7 0L4 15c-2 4 2 7 5 4L19 9c2-3 0-6-3-4Z" stroke="currentColor" stroke-width="1.8"/>' },
    { name: 'Teams', letter: 'T', color: '--cp-violet', angle: 324 },
  ];
  const appLayer = $('#app-layer');
  const appObjects = apps.map((app) => {
    const element = document.createElement('div');
    element.className = 'app-tile';
    element.dataset.app = app.name;
    element.style.setProperty('--app-color', `var(${app.color})`);
    element.innerHTML = `<div class="app-icon">${app.letter ? `<b>${app.letter}</b>` : `<svg viewBox="0 0 28 24" fill="none">${app.svg}</svg>`}</div><span>${app.name}</span>`;
    appLayer.appendChild(element);
    const angle = app.angle * Math.PI / 180;
    return { element, position: new THREE.Vector3(Math.sin(angle) * 2.88, Math.cos(angle) * 2.88, 0) };
  });

  const dataObjects = [];
  for (let i = 0; i < 5; i++) {
    const element = document.createElement('div');
    element.className = 'data-tile';
    const content = i % 3 === 0
      ? '<div class="mini-bars"><i></i><i></i><i></i><i></i><i></i></div>'
      : i % 3 === 1
        ? '<svg class="mini-chart" viewBox="0 0 40 30" fill="none"><path d="M1 22 9 14l7 5 8-14 6 9 9-4" stroke="currentColor" stroke-width="1.5"/><path d="M1 28h38" stroke="currentColor" opacity=".3"/></svg>'
        : '<i class="mini-line"></i><i class="mini-line"></i><i class="mini-line"></i><i class="mini-line"></i>';
    element.innerHTML = content;
    appLayer.appendChild(element);
    const angle = i * Math.PI * 2 / 5 + .4;
    dataObjects.push({ element, position: new THREE.Vector3(Math.sin(angle) * 1.45, Math.cos(angle) * 1.45, .35), angle });
  }
  let width = 1;
  let height = 1;
  const projected = new THREE.Vector3();
  function positionElement(element, position, extraRotation = 0) {
    projected.copy(position).project(camera);
    const x = (projected.x * .5 + .5) * width;
    const y = (-projected.y * .5 + .5) * height;
    element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${extraRotation}deg)`;
  }
  function resize() {
    width = graphElement.clientWidth;
    height = graphElement.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    // Keep the entire application ring inside narrow as well as landscape canvases.
    camera.position.z = Math.max(9.4, 8.6 / camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    appObjects.forEach(({ element, position }) => positionElement(element, position));
  }
  const observer = new ResizeObserver(resize);
  observer.observe(graphElement);
  resize();
  let lostContext = false;
  renderer.domElement.addEventListener('webglcontextlost', () => { lostContext = true; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { lostContext = false; });
  return {
    setChapter(index) { targetColor = palette[index]; },
    render(time, delta) {
      if (lostContext) return;
      const blend = 1 - Math.exp(-delta * 1.8);
      globe.rotation.y = time * .055;
      globe.rotation.x = .18 + Math.sin(time * .07) * .08;
      globe.rotation.z = -.12;
      ringGroup.rotation.z = time * .018;
      edgeMaterial.color.lerp(targetColor, blend);
      pulseMaterial.color.lerp(targetColor, blend);
      ringMaterials[0].color.lerp(targetColor, blend);
      for (let i = 0; i < pulses.length; i++) {
        const progress = (time * .14 + i * .17) % 1;
        pulses[i].position.copy(rays[i].getPoint(progress));
        pulses[i].scale.setScalar(.7 + Math.sin(progress * Math.PI) * .7);
      }
      appObjects.forEach(({ element, position }, i) => {
        const shifted = position.clone();
        shifted.y += Math.sin(time * .5 + i) * .025;
        positionElement(element, shifted);
      });
      dataObjects.forEach(({ element, position, angle }, i) => {
        const shifted = position.clone();
        shifted.x += Math.sin(time * .12 + angle) * .08;
        shifted.y += Math.cos(time * .2 + i) * .045;
        positionElement(element, shifted, Math.sin(time * .12 + i * 2) * 5);
      });
      renderer.render(scene, camera);
    },
  };
}

try {
  graph = createGraph();
  document.documentElement.dataset.graphReady = 'true';
} catch (error) {
  console.error('Unable to initialize the intelligence graph:', error);
  $('#render-error').hidden = false;
  document.documentElement.dataset.graphReady = 'false';
}

setReducedMotion(reducedMotion);
updateTimeline();
setPlaying(false);

connectPresenter({
  id: 'work-iq', chapters,
  getChapter: () => activeChapter,
  selectChapter: (index) => { setPlaying(false); seek(chapters[index].start); },
  setReducedMotion,
});

function animate(now) {
  const actualDelta = Math.max(0, (now - lastFrame) / 1000);
  const delta = Math.min(actualDelta, .25);
  lastFrame = now;
  if (!document.hidden) {
    if (playing) {
      elapsed = Math.min(DURATION, elapsed + actualDelta);
      if (elapsed === DURATION) {
        setPlaying(false);
        announcement.textContent = 'Presentation complete. Select Replay to start again.';
      }
      updateTimeline();
    }
    if (!reducedMotion) ambientTime += delta;
    if (graph) graph.render(ambientTime, delta);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
