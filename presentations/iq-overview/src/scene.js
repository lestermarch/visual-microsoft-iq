import * as THREE from 'three';
import { foundations, icon } from './symbols.js';

function roundedRectangle(width, height, radius) {
  const left = -width / 2;
  const bottom = -height / 2;
  return new THREE.Shape()
    .moveTo(left + radius, bottom)
    .lineTo(-left - radius, bottom).quadraticCurveTo(-left, bottom, -left, bottom + radius)
    .lineTo(-left, -bottom - radius).quadraticCurveTo(-left, -bottom, -left - radius, -bottom)
    .lineTo(left + radius, -bottom).quadraticCurveTo(left, -bottom, left, -bottom - radius)
    .lineTo(left, bottom + radius).quadraticCurveTo(left, bottom, left + radius, bottom);
}

export function createOverviewScene(container, labelLayer) {
  const styles = getComputedStyle(document.documentElement);
  const color = (token) => new THREE.Color(styles.getPropertyValue(`--cp-${token}`).trim());
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6.2, 6.2, 4.3, -4.3, .1, 40);
  camera.position.z = 18;
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

  const labels = [];
  const projected = new THREE.Vector3();
  function addLabel(className, html, x, y, z = 1) {
    const element = document.createElement('div');
    element.className = className;
    element.innerHTML = html;
    labelLayer.append(element);
    const position = new THREE.Vector3(x, y, z);
    labels.push({ element, position });
    return element;
  }

  const iqGeometry = new THREE.ExtrudeGeometry(roundedRectangle(11.1, .95, .46), { depth: .22, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3, steps: 1, curveSegments: 24 });
  const colors = [];
  const positions = iqGeometry.getAttribute('position');
  const blended = new THREE.Color();
  const azure = color('azure');
  const teal = color('teal');
  for (let index = 0; index < positions.count; index++) {
    blended.copy(azure).lerp(teal, THREE.MathUtils.clamp((positions.getX(index) + 5.55) / 11.1, 0, 1));
    if (positions.getZ(index) < .05) blended.multiplyScalar(.82);
    colors.push(blended.r, blended.g, blended.b);
  }
  iqGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const iq = new THREE.Mesh(iqGeometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
  iq.position.y = .05;
  iq.rotation.x = .16;
  scene.add(iq);
  const iqLabel = addLabel('iq-layer-label', '<strong>Your IQ</strong><small>CONNECTED CONTEXT FOR PEOPLE AND AGENTS</small>', 0, .08);
  const iqNames = addLabel('iq-names', 'Work IQ <span>&middot;</span> Fabric IQ <span>&middot;</span> Foundry IQ <span>&middot;</span> Web IQ', 0, -.95);

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5, 2.75, 0), new THREE.Vector3(5, 2.75, 0)]),
    new THREE.LineBasicMaterial({ color: color('border-strong'), transparent: true, opacity: .85 }),
  ));
  addLabel('continuum-label', '&#8592; Interactive', -4.15, 3.05);
  addLabel('continuum-label', 'Autonomous &#8594;', 4.15, 3.05);
  const people = addLabel('recipient people-recipient', `<span>${icon('people')}</span><strong>People</strong>`, -.95, 2.65);
  const agents = addLabel('recipient agent-recipient', `<span>${icon('agent')}</span><strong>Agents</strong>`, .95, 2.65);
  const streams = [];
  const platforms = [];
  const foundationLabels = [];
  const markerGeometry = new THREE.SphereGeometry(.036, 8, 8);

  function addStream(curve, token, foundationIndex, offset, upper) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(70)),
      new THREE.LineBasicMaterial({ color: color(token), transparent: true, opacity: .26 }),
    );
    const marker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: color(token) }));
    scene.add(line, marker);
    streams.push({ curve, line, marker, foundationIndex, offset, upper });
  }

  foundations.forEach((foundation, index) => {
    const x = (index - 1) * 3.65;
    const material = new THREE.MeshBasicMaterial({ color: color('surface').lerp(color(foundation.color), .12), vertexColors: true, transparent: true, opacity: .95 });
    const geometry = new THREE.ExtrudeGeometry(roundedRectangle(3.25, 1.55, .25), { depth: .26, bevelEnabled: true, bevelSize: .08, bevelThickness: .06, bevelSegments: 3, curveSegments: 12 });
    const normals = geometry.getAttribute('normal');
    const shading = [];
    for (let vertex = 0; vertex < normals.count; vertex++) {
      const brightness = .78 + .22 * Math.max(0, normals.getZ(vertex));
      shading.push(brightness, brightness, brightness);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(shading, 3));
    const slab = new THREE.Mesh(geometry, material);
    slab.rotation.x = -.9;
    slab.rotation.z = -.045;
    slab.position.set(x, -2.2, -.1);
    scene.add(slab);
    platforms.push({ slab, material, token: foundation.color });
    const glyphs = addLabel('foundation-icons', foundation.symbols.map((symbol) => icon(symbol)).join(''), x, -2.15);
    const label = addLabel('foundation-label', `<strong>${foundation.title}</strong><small>${foundation.detail}</small>`, x, -3.05);
    glyphs.style.setProperty('--foundation-color', styles.getPropertyValue(`--cp-${foundation.color}`));
    label.style.setProperty('--foundation-color', styles.getPropertyValue(`--cp-${foundation.color}`));
    label.dataset.foundation = foundation.id;
    foundationLabels.push({ label, glyphs });

    for (let lane = 0; lane < 5; lane++) {
      const startX = x + (lane - 2) * .32;
      const lower = new THREE.CubicBezierCurve3(
        new THREE.Vector3(startX, -1.65, .1), new THREE.Vector3(startX, -1.1, .1),
        new THREE.Vector3(startX, -.9, .1), new THREE.Vector3(startX, -.42, .1),
      );
      addStream(lower, foundation.color, index, lane * .17, false);
      const upper = new THREE.CubicBezierCurve3(
        new THREE.Vector3(startX, .57, 0), new THREE.Vector3(startX * .9, 1.3, 0),
        new THREE.Vector3(lane % 2 ? .95 : -.95, 1.35, 0), new THREE.Vector3(lane % 2 ? .95 : -.95, 2.08, 0),
      );
      addStream(upper, foundation.color, index, lane * .17 + .35, true);
    }
  });

  let activeChapter = 0;
  let width = 1;
  let height = 1;
  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const viewHeight = Math.max(8.1, 12.4 / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  new ResizeObserver(resize).observe(container);
  resize();

  return {
    setChapter(index) {
      activeChapter = index;
      labelLayer.dataset.focus = String(index);
      foundationLabels.forEach(({ label, glyphs }, foundationIndex) => {
        const highlighted = index === 0 || index === 4 || index === foundationIndex + 1;
        label.classList.toggle('highlighted', highlighted);
        glyphs.classList.toggle('highlighted', highlighted);
      });
      people.classList.toggle('highlighted', index === 0 || index === 4);
      agents.classList.toggle('highlighted', index === 0 || index === 4);
      iqLabel.classList.toggle('highlighted', index === 4);
      iqNames.classList.toggle('revealed', index === 4);
    },
    render(time, reducedMotion) {
      if (contextLost) return;
      camera.updateMatrixWorld();
      const scale = Math.min(1, width / 620);
      // Project readable HTML labels onto the scene instead of rotating the text.
      labels.forEach(({ element, position }) => {
        projected.copy(position).project(camera);
        element.style.transform = `translate(${(projected.x * .5 + .5) * width}px, ${(-projected.y * .5 + .5) * height}px) translate(-50%, -50%) scale(${scale})`;
      });
      platforms.forEach(({ slab, material, token }, index) => {
        const highlighted = activeChapter === 0 || activeChapter === 4 || activeChapter === index + 1;
        slab.position.y = -2.2 + Math.sin(time * .45 + index * .6) * .035;
        material.color.copy(color('surface')).lerp(color(token), highlighted ? .19 : .07);
      });
      streams.forEach(({ curve, marker, line, foundationIndex, offset, upper }) => {
        const highlighted = activeChapter === 0 || activeChapter === 4 || activeChapter === foundationIndex + 1;
        line.material.opacity = highlighted ? upper ? .35 : .5 : .1;
        marker.visible = highlighted && !reducedMotion;
        marker.position.copy(curve.getPoint((time * .18 + offset) % 1));
      });
      renderer.render(scene, camera);
    },
  };
}
