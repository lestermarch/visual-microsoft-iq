import * as THREE from 'three';
import { controls, icon } from './symbols.js';
import { createPointSphere } from '../../../src/point-sphere.js';

const FULL_CIRCLE = Math.PI * 2;

function ellipsePoints(radiusX, radiusY, count = 160) {
  return Array.from({ length: count + 1 }, (_, index) => {
    const angle = index / count * FULL_CIRCLE;
    return new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0);
  });
}

export function createFleetScene(container, labelLayer) {
  const styles = getComputedStyle(document.documentElement);
  const color = (token) => new THREE.Color(styles.getPropertyValue(`--cp-${token}`).trim());
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6.2, 6.2, 4.4, -4.4, .1, 40);
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
  const sphereGeometry = new THREE.SphereGeometry(1, 40, 24);
  function addBubble(radius, token, position, count) {
    const group = new THREE.Group();
    const points = createPointSphere(radius, count,
      new THREE.PointsMaterial({ color: color(token), size: .014, transparent: true, opacity: .2, depthWrite: false }),
    );
    const surface = new THREE.Mesh(sphereGeometry,
      new THREE.MeshBasicMaterial({ color: color(token), transparent: true, opacity: .025, depthWrite: false }),
    );
    surface.scale.setScalar(radius);
    group.add(points, surface);
    group.position.copy(position);
    scene.add(group);
    return { group, points, surface };
  }
  function addLabel(className, html, position) {
    const element = document.createElement('div');
    element.className = className;
    element.innerHTML = html;
    labelLayer.append(element);
    labels.push({ element, position });
    return element;
  }
  function addRing(radius, token, opacity, position) {
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ellipsePoints(radius, radius)),
      new THREE.LineBasicMaterial({ color: color(token), transparent: true, opacity }),
    );
    ring.position.copy(position);
    scene.add(ring);
    return ring;
  }

  const planeMaterial = new THREE.LineBasicMaterial({ color: color('violet'), transparent: true, opacity: .55 });
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ellipsePoints(5.75, 3.45)), planeMaterial));
  const backPlane = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(ellipsePoints(5.95, 3.6)),
    new THREE.LineBasicMaterial({ color: color('cyan'), transparent: true, opacity: .16 }),
  );
  backPlane.position.z = -.4;
  backPlane.rotation.x = .08;
  scene.add(backPlane);

  const envelope = createPointSphere(1, 2600,
    new THREE.PointsMaterial({ color: color('cyan'), size: .019, transparent: true, opacity: .11, depthWrite: false }),
  );
  envelope.scale.set(5.7, 3.4, .8);
  scene.add(envelope);
  const fleetSurface = new THREE.Mesh(sphereGeometry,
    new THREE.MeshBasicMaterial({ color: color('azure'), transparent: true, opacity: 0, depthWrite: false }),
  );
  fleetSurface.scale.setScalar(3.45);
  scene.add(fleetSurface);
  const fleetOrbits = [0, 1, 2].map((index) => {
    const ring = addRing(3.45, index === 1 ? 'violet' : 'cyan', 0, new THREE.Vector3());
    ring.rotation.set(.55 + index * .8, index * .6, index * .35);
    return ring;
  });
  addLabel('control-plane-title', '<strong>Microsoft Agent 365</strong><small>THE CONTROL PLANE FOR AGENTS</small>', new THREE.Vector3(0, 3.45, 1));

  const controlLabels = controls.map((control, index) => {
    const position = new THREE.Vector3((index - 1) * 2.75, 2.2, 1);
    const element = addLabel('fleet-control', `${icon(control.id)}<strong>${control.title}</strong>`, position);
    element.dataset.control = control.id;
    element.style.setProperty('--control-color', styles.getPropertyValue(`--cp-${control.color}`));
    return { element, position, control };
  });

  const agentPositions = [
    [0, -.15, .7],
    [-3.7, 1.05, .2], [-4.15, -1.15, -.1], [-2.4, -2.2, .35],
    [2.5, -2.2, -.1], [4.15, -.9, .25], [3.75, 1.05, -.1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const atomPositions = [
    [.2, .5, 1.65], [-1.7, 1.65, .45], [-2, -.4, 1.05], [-1, -1.65, -.65],
    [1.35, -1.65, 1.15], [2.05, .1, -.4], [1.45, 1.55, -1.2],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const livePositions = agentPositions.map((position) => position.clone());
  const iqRings = [];
  const securityRings = [];
  const bubbles = [];
  const atoms = [];
  const agentLabels = [];
  const orbitRings = [];
  scene.add(new THREE.AmbientLight(color('white'), 1.6));
  const light = new THREE.DirectionalLight(color('white'), 2.2);
  light.position.set(-3, 5, 8);
  scene.add(light);
  agentPositions.forEach((position, index) => {
    const hero = index === 0;
    const iqRadius = hero ? .94 : .33;
    const securityRadius = hero ? 1.45 : .54;
    iqRings.push(addRing(iqRadius, 'cyan', hero ? .65 : .4, position));
    securityRings.push(addRing(securityRadius, 'teal', hero ? .6 : .35, position));
    bubbles.push({
      iq: addBubble(iqRadius, 'cyan', position, hero ? 1100 : 320),
      security: addBubble(securityRadius, 'teal', position, hero ? 1400 : 420),
    });
    const atom = new THREE.Mesh(sphereGeometry,
      new THREE.MeshPhongMaterial({ color: color(index % 2 ? 'cyan' : 'azure'), shininess: 65, transparent: true, opacity: 0 }),
    );
    atom.scale.setScalar(index === 0 ? .19 : .15);
    scene.add(atom);
    const halo = addBubble(.27, 'cyan', position, 180);
    atoms.push({ atom, halo });
    const orbit = addRing(iqRadius, 'azure', .16, position);
    orbit.rotation.x = .45;
    orbit.rotation.y = .3;
    orbitRings.push(orbit);
    const element = addLabel(hero ? 'fleet-agent hero-agent' : 'fleet-agent',
      `<span class="fleet-agent-icon">${icon('agent')}</span><strong>${hero ? 'Agent' : `Agent ${String(index + 1).padStart(2, '0')}`}</strong>`, position.clone().add(new THREE.Vector3(0, 0, .5)),
    );
    element.dataset.agent = String(index);
    agentLabels.push(element);
  });
  addLabel('hero-iq-label', '<strong>Microsoft IQ</strong><small>Work &middot; Fabric &middot; Foundry &middot; Web</small>', new THREE.Vector3(0, 1.32, 1));
  addLabel('hero-security-label', `${icon('secure')}<strong>Security &amp; governance</strong>`, new THREE.Vector3(0, -1.83, 1));

  const links = [];
  const edges = [];
  for (let index = 1; index < agentPositions.length; index++) {
    edges.push([0, index], [index, index === 6 ? 1 : index + 1]);
  }
  const markerGeometry = new THREE.SphereGeometry(.026, 8, 8);
  edges.forEach(([from, to], index) => {
    const start = agentPositions[from].clone();
    const end = agentPositions[to].clone();
    const middle = start.clone().lerp(end, .5);
    middle.z -= .7;
    const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(45)),
      new THREE.LineBasicMaterial({ color: color('azure'), transparent: true, opacity: .2 }),
    );
    const marker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: color('cyan') }));
    scene.add(line, marker);
    links.push({ line, marker, curve, from, to, offset: index * .11 });
  });

  const telemetry = [];
  controlLabels.forEach(({ position, control }, controlIndex) => {
    agentPositions.forEach((start, agentIndex) => {
      const end = position.clone().add(new THREE.Vector3(0, -.25, -.2));
      const middle = start.clone().lerp(end, .5);
      middle.z -= .55;
      const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(45)),
        new THREE.LineBasicMaterial({ color: color(control.color), transparent: true, opacity: .4 }),
      );
      const marker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: color(control.color) }));
      scene.add(line, marker);
      telemetry.push({ line, marker, curve, controlIndex, offset: agentIndex * .13 });
    });
  });

  let activeChapter = 0;
  let finaleMix = 0;
  let lastRenderTime = 0;
  const rotation = new THREE.Quaternion();
  const drifted = new THREE.Vector3();
  const pathPoint = new THREE.Vector3();
  let width = 1;
  let height = 1;
  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const viewHeight = Math.max(8.8, 12.4 / aspect);
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
      labelLayer.classList.toggle('is-finale', index === 5);
      agentLabels.forEach((element, agentIndex) => { element.classList.toggle('highlighted', index !== 0 || agentIndex === 0); });
      controlLabels.forEach(({ element, control }) => { element.classList.toggle('highlighted', control.chapter === index || index === 5); });
    },
    render(time, reducedMotion) {
      if (contextLost) return;
      const delta = Math.max(0, time - lastRenderTime);
      lastRenderTime = time;
      const target = activeChapter === 5 ? 1 : 0;
      finaleMix = reducedMotion ? target : THREE.MathUtils.damp(finaleMix, target, 5, delta);
      if (Math.abs(finaleMix - target) < .001) finaleMix = target;
      const detailOpacity = 1 - finaleMix;
      rotation.setFromEuler(new THREE.Euler(Math.sin(time * .09) * .18, time * .07, .08));
      livePositions.forEach((position, index) => {
        drifted.copy(atomPositions[index]);
        drifted.y += Math.sin(time * .3 + index) * .12;
        drifted.applyQuaternion(rotation);
        position.copy(agentPositions[index]).lerp(drifted, finaleMix);
        atoms[index].atom.position.copy(position);
        atoms[index].atom.material.opacity = finaleMix;
        atoms[index].atom.visible = finaleMix > 0;
        atoms[index].halo.group.position.copy(position);
        atoms[index].halo.points.material.opacity = finaleMix * .24;
        atoms[index].halo.surface.material.opacity = finaleMix * .025;
        for (const bubble of Object.values(bubbles[index])) {
          bubble.group.position.copy(position);
          bubble.group.rotation.y = time * .045 + index;
          bubble.points.material.opacity = (index === 0 ? .26 : activeChapter === 0 ? .07 : .18) * (1 - finaleMix * .9);
          bubble.surface.material.opacity = .025 * (1 - finaleMix * .9);
        }
      });
      camera.updateMatrixWorld();
      const scale = Math.min(1, width / 620);
      // Rotate only the context orbits; the agent and control labels stay readable.
      labels.forEach(({ element, position }) => {
        projected.copy(position).project(camera);
        element.style.transform = `translate(${(projected.x * .5 + .5) * width}px, ${(-projected.y * .5 + .5) * height}px) translate(-50%, -50%) scale(${scale})`;
      });
      envelope.rotation.y = Math.sin(time * .045) * .12;
      envelope.rotation.x = Math.sin(time * .035) * .035;
      envelope.scale.set(THREE.MathUtils.lerp(5.7, 3.45, finaleMix), THREE.MathUtils.lerp(3.4, 3.45, finaleMix), THREE.MathUtils.lerp(.8, 3.45, finaleMix));
      envelope.material.opacity = THREE.MathUtils.lerp(.11, .34, finaleMix);
      fleetSurface.material.opacity = finaleMix * .04;
      fleetOrbits.forEach((ring, index) => {
        ring.material.opacity = finaleMix * .16;
        ring.rotation.y = time * .045 + index * .6;
      });
      planeMaterial.opacity = (activeChapter === 0 ? .3 : .65) * detailOpacity;
      backPlane.material.opacity = .16 * detailOpacity;
      iqRings.forEach((ring, index) => {
        ring.position.copy(livePositions[index]);
        ring.material.opacity = (index === 0 ? .35 : activeChapter === 0 ? .1 : .23) * detailOpacity;
      });
      securityRings.forEach((ring, index) => {
        ring.position.copy(livePositions[index]);
        ring.material.opacity = (activeChapter === 4 ? .4 : index === 0 ? .3 : activeChapter === 0 ? .1 : .2) * detailOpacity;
      });
      orbitRings.forEach((ring, index) => {
        ring.position.copy(livePositions[index]);
        ring.rotation.y = time * .06 + index * .4;
        ring.material.opacity = .12 * detailOpacity;
      });
      links.forEach(({ line, marker, curve, from, to, offset }) => {
        curve.v0.copy(livePositions[from]);
        curve.v2.copy(livePositions[to]);
        curve.v1.copy(curve.v0).lerp(curve.v2, .5);
        curve.v1.z -= .7 * detailOpacity;
        const positions = line.geometry.attributes.position;
        for (let index = 0; index < positions.count; index++) {
          curve.getPoint(index / (positions.count - 1), pathPoint);
          positions.setXYZ(index, pathPoint.x, pathPoint.y, pathPoint.z);
        }
        positions.needsUpdate = true;
        line.geometry.computeBoundingSphere();
        line.material.opacity = activeChapter === 0 ? .08 : activeChapter === 1 || activeChapter === 5 ? .4 : .2;
        marker.visible = !reducedMotion && activeChapter !== 0 && activeChapter !== 5;
        marker.position.copy(curve.getPoint((time * .15 + offset) % 1));
      });
      telemetry.forEach(({ line, marker, curve, controlIndex, offset }) => {
        const selected = activeChapter === controls[controlIndex].chapter;
        line.visible = selected;
        marker.visible = selected && !reducedMotion;
        marker.position.copy(curve.getPoint((time * .2 + offset) % 1));
      });
      renderer.render(scene, camera);
    },
  };
}
