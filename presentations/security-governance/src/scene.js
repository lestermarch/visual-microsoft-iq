import * as THREE from 'three';
import { chapters } from './timeline.js';
import { intelligenceLayers, icon } from './symbols.js';
import { createPointSphere } from '../../../src/point-sphere.js';

const INTELLIGENCE_RADIUS = 2.02;
const SECURITY_RADIUS = 3.22;
const FULL_CIRCLE = Math.PI * 2;

function circlePoints(radius, start = 0, length = FULL_CIRCLE) {
  return Array.from({ length: 181 }, (_, index) => {
    const angle = start + length * index / 180;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });
}

export function createSecurityScene(container, labelLayer) {
  const styles = getComputedStyle(document.documentElement);
  const color = (token) => new THREE.Color(styles.getPropertyValue(`--cp-${token}`).trim());
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 40);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  container.append(renderer.domElement);

  let contextLost = false;
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    document.documentElement.dataset.graphReady = 'false';
    document.querySelector('#render-error').hidden = false;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    document.documentElement.dataset.graphReady = 'true';
    document.querySelector('#render-error').hidden = true;
  });

  const intelligence = new THREE.Group();
  intelligence.add(createPointSphere(INTELLIGENCE_RADIUS, 1800,
    new THREE.PointsMaterial({ color: color('cyan'), size: .016, transparent: true, opacity: .38, depthWrite: false }),
  ));
  intelligence.add(new THREE.Mesh(
    new THREE.SphereGeometry(INTELLIGENCE_RADIUS, 40, 24),
    new THREE.MeshBasicMaterial({ color: color('azure'), transparent: true, opacity: .035, depthWrite: false }),
  ));
  scene.add(intelligence);

  const envelope = new THREE.Group();
  envelope.add(createPointSphere(SECURITY_RADIUS, 1400,
    new THREE.PointsMaterial({ color: color('azure'), size: .012, transparent: true, opacity: .13, depthWrite: false }),
  ));
  scene.add(envelope);

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circlePoints(SECURITY_RADIUS)),
    new THREE.LineBasicMaterial({ color: color('azure'), transparent: true, opacity: .38 }),
  ));
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circlePoints(INTELLIGENCE_RADIUS)),
    new THREE.LineBasicMaterial({ color: color('cyan'), transparent: true, opacity: .45 }),
  ));

  const orbitRings = ['azure', 'teal', 'violet'].map((token, index) => {
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(circlePoints(INTELLIGENCE_RADIUS * .99)),
      new THREE.LineBasicMaterial({ color: color(token), transparent: true, opacity: .18 }),
    );
    ring.rotation.set(.35 + index * .48, index * .6, -.4 + index * .7);
    intelligence.add(ring);
    return ring;
  });

  const toolPalette = ['azure', 'cyan', 'azure', 'violet', 'teal'];
  const labels = [];
  const toolSegments = [];
  const signalMarkers = [];
  const projected = new THREE.Vector3();

  intelligenceLayers.forEach((layer, index) => {
    const element = document.createElement('div');
    element.className = 'iq-node';
    element.dataset.iq = layer.id;
    element.style.setProperty('--node-color', styles.getPropertyValue(`--cp-${layer.color}`));
    element.innerHTML = `<strong>${layer.title}</strong><small>${layer.detail}</small>`;
    labelLayer.append(element);
    const angle = Math.PI * (.75 - index * .5);
    labels.push({ element, position: new THREE.Vector3(Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, .35) });
  });

  chapters.forEach((chapter, index) => {
    const angle = Math.PI / 2 - index * FULL_CIRCLE / chapters.length;
    const position = new THREE.Vector3(Math.cos(angle) * SECURITY_RADIUS, Math.sin(angle) * SECURITY_RADIUS, .15);
    const element = document.createElement('div');
    element.className = 'security-node';
    element.dataset.product = chapter.id;
    element.style.setProperty('--node-color', styles.getPropertyValue(`--cp-${toolPalette[index]}`));
    element.innerHTML = `<span class="security-node-icon">${icon(chapter.id)}</span><strong>${chapter.title.replace('Microsoft ', '')}</strong>`;
    labelLayer.append(element);
    labels.push({ element, position });

    const segment = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(circlePoints(SECURITY_RADIUS, angle - .31, .62)),
      new THREE.LineBasicMaterial({ color: color(toolPalette[index]), transparent: true, opacity: .9 }),
    );
    scene.add(segment);
    toolSegments.push(segment);

    const start = position.clone().multiplyScalar(.96);
    const end = position.clone().multiplyScalar(INTELLIGENCE_RADIUS / SECURITY_RADIUS);
    const link = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([start, end]),
      new THREE.LineDashedMaterial({ color: color(toolPalette[index]), dashSize: .05, gapSize: .07, transparent: true, opacity: .22 }),
    );
    link.computeLineDistances();
    scene.add(link);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(.029, 8, 8),
      new THREE.MeshBasicMaterial({ color: color(toolPalette[index]) }),
    );
    scene.add(marker);
    signalMarkers.push({ marker, start, end });
  });

  const iqHeading = document.createElement('div');
  iqHeading.className = 'intelligence-heading';
  iqHeading.innerHTML = '<strong>Microsoft IQ</strong><small>FOUR IQs. CONNECTED CONTEXT.</small>';
  labelLayer.append(iqHeading);
  labels.push({ element: iqHeading, position: new THREE.Vector3(0, 2.15, .15) });

  let width = 1;
  let height = 1;
  let activeChapter = 0;
  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.position.z = Math.max(10.3, 10.3 / camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  return {
    setChapter(index) {
      activeChapter = index;
      labelLayer.querySelectorAll('.security-node').forEach((element, toolIndex) => {
        element.classList.toggle('highlighted', toolIndex === index);
      });
      toolSegments.forEach((segment, toolIndex) => { segment.visible = toolIndex === index; });
    },
    render(time, delta, reducedMotion) {
      if (contextLost) return;
      intelligence.rotation.set(.12 + Math.sin(time * .06) * .08, time * .035, -.08);
      envelope.rotation.set(-.06, -time * .018, .05);
      orbitRings.forEach((ring, index) => { ring.rotation.y = index * .6 + Math.sin(time * .04 + index) * .12; });
      camera.updateMatrixWorld();
      // Keep product names stationary while the context and security shells rotate.
      const scale = Math.max(.7, Math.min(1, Math.min(width, height) / 440));
      labels.forEach(({ element, position }) => {
        projected.copy(position).project(camera);
        element.style.transform = `translate(${(projected.x * .5 + .5) * width}px, ${(-projected.y * .5 + .5) * height}px) translate(-50%, -50%) scale(${scale})`;
      });
      signalMarkers.forEach(({ marker, start, end }, index) => {
        marker.visible = index === activeChapter && !reducedMotion;
        marker.position.lerpVectors(start, end, (time * .23) % 1);
      });
      renderer.render(scene, camera);
    },
  };
}
