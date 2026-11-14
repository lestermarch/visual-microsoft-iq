import * as THREE from 'three';
import { exampleChunks, exampleQuery, retrieveNearest } from './retrieval.js';

export function createVectorScene(container, labelLayer) {
  const styles = getComputedStyle(document.documentElement);
  const color = (token) => new THREE.Color(styles.getPropertyValue(token).trim());
  const violet = color('--cp-foundry');
  const blue = color('--cp-azure');
  const teal = color('--cp-teal');
  const amber = color('--cp-query');
  const muted = color('--cp-border-strong');
  const white = color('--cp-white');
  const results = retrieveNearest(exampleQuery.vector, exampleChunks);
  document.querySelector('#demo-query').setAttribute('aria-label', `Run an illustrative semantic search for: ${exampleQuery.text}`);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
  camera.position.set(0, .18, 5.9);
  camera.lookAt(0, .18, 0);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  container.appendChild(renderer.domElement);
  const space = new THREE.Group();
  scene.add(space);
  const labels = [];
  let chapter = 0;
  let queryAge = 0;
  let width = 1;
  let height = 1;
  let contextLost = false;
  const projected = new THREE.Vector3();
  const world = new THREE.Vector3();
  const queryPosition = new THREE.Vector3();

  function label(html, className, position) {
    const element = document.createElement('span');
    element.className = `space-label ${className}`;
    element.innerHTML = html;
    labelLayer.appendChild(element);
    const result = { element, position: new THREE.Vector3(...position) };
    labels.push(result);
    return result;
  }

  const circleCanvas = document.createElement('canvas');
  circleCanvas.width = 32;
  circleCanvas.height = 32;
  const context = circleCanvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for point sprites.');
  context.fillStyle = styles.getPropertyValue('--cp-white').trim();
  context.beginPath();
  context.arc(16, 16, 13, 0, Math.PI * 2);
  context.fill();
  const pointTexture = new THREE.CanvasTexture(circleCanvas);
  let seed = 193;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function gaussian() {
    return Math.max(-2.2, Math.min(2.2, Math.sqrt(-2 * Math.log(Math.max(random(), .0001))) * Math.cos(random() * 2 * Math.PI)));
  }
  const clusters = [
    { center: [-.85, .55, .35], spread: [.35, .36, .34], color: violet },
    { center: [.95, .4, -.35], spread: [.37, .37, .38], color: blue },
    { center: [.2, -.8, .15], spread: [.42, .28, .4], color: teal },
  ];
  const positions = [];
  const colors = [];
  for (const cluster of clusters) {
    for (let i = 0; i < 390; i++) {
      positions.push(...cluster.center.map((coordinate, axis) => coordinate + gaussian() * cluster.spread[axis]));
      const tint = cluster.color.clone().lerp(white, random() * .28);
      colors.push(tint.r, tint.g, tint.b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const pointMaterial = new THREE.PointsMaterial({ size: .035, vertexColors: true, map: pointTexture, alphaTest: .1, transparent: true, opacity: .8, depthWrite: false });
  space.add(new THREE.Points(geometry, pointMaterial));

  const cageMaterial = new THREE.LineBasicMaterial({ color: muted, transparent: true, opacity: .18, depthWrite: false });
  const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.8, 3.2, 2.8)), cageMaterial);
  space.add(cage);
  const gridPositions = [];
  for (let i = -3; i <= 3; i++) {
    const value = i * .5;
    gridPositions.push(-1.9, -1.6, value, 1.9, -1.6, value);
    gridPositions.push(value, -1.6, -1.4, value, -1.6, 1.4);
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  space.add(new THREE.LineSegments(gridGeometry, new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: .12, depthWrite: false })));
  for (let i = 0; i < 3; i++) {
    const ringPoints = [];
    for (let j = 0; j <= 160; j++) {
      const angle = j / 160 * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * 1.9, Math.sin(angle) * 1.65, 0));
    }
    const material = new THREE.LineDashedMaterial({ color: i === 0 ? violet : blue, transparent: true, opacity: .11, dashSize: .025, gapSize: .065, depthWrite: false });
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints), material);
    ring.computeLineDistances();
    ring.rotation.set(i * .6 + .3, i * .8, .2);
    space.add(ring);
  }
  label('People policies<small>RELATED MEANING</small>', 'cluster-tag', [-1.12, 1.42, -.1]);
  label('Product docs', 'cluster-tag', [1.32, 1.08, -.4]);
  label('Operations', 'cluster-tag', [.8, -1.25, .6]);
  const permissionLabel = label('Access filtered', 'permission-label', [-1.7, 1.0, .1]);
  const queryLabel = label('Query', 'query-marker', [-1.6, .05, 1.1]);
  const nodeGeometry = new THREE.SphereGeometry(.055, 14, 10);
  const matchIds = new Set(results.map((result) => result.id));
  const chunkNodes = exampleChunks.map((chunk) => {
    const material = new THREE.MeshBasicMaterial({ color: chunk.allowed ? violet : muted, transparent: true, opacity: .65 });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.set(...chunk.position);
    space.add(node);
    return { chunk, node, material };
  });

  const queryStart = new THREE.Vector3(-2, -.32, 1);
  const queryTarget = new THREE.Vector3(-1.17, .47, .87);
  const queryCurve = new THREE.CubicBezierCurve3(
    queryStart, new THREE.Vector3(-2, .5, 1.1), new THREE.Vector3(-1.6, .65, .95), queryTarget,
  );
  const queryMaterial = new THREE.MeshBasicMaterial({ color: amber, transparent: true });
  const queryPoint = new THREE.Mesh(new THREE.OctahedronGeometry(.09), queryMaterial);
  space.add(queryPoint);
  const queryHalo = new THREE.Mesh(new THREE.SphereGeometry(.18, 20, 14), new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: .08, depthWrite: false }));
  space.add(queryHalo);
  const nearestObjects = results.map((result, index) => {
    const endpoint = new THREE.Vector3(...result.position);
    const points = [queryTarget, endpoint];
    const material = new THREE.LineBasicMaterial({ color: amber, transparent: true, opacity: 0, depthWrite: false });
    const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    space.add(link);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), new THREE.MeshBasicMaterial({ color: violet, transparent: true, opacity: 0, depthWrite: false }));
    glow.position.copy(endpoint);
    space.add(glow);
    const offsets = { remote: [-.06, .2, 0], hybrid: [.12, .17, 0], flexible: [.08, -.17, 0] };
    const labelPosition = endpoint.clone().add(new THREE.Vector3(...offsets[result.id]));
    const badge = label(result.citation, 'nearest-label', labelPosition.toArray());
    badge.element.dataset.result = result.id;
    return { result, index, material, glow, badge };
  });
  const retrievalDescription = document.createElement('span');
  retrievalDescription.className = 'sr-only';
  retrievalDescription.id = 'retrieval-description';
  retrievalDescription.textContent = `Illustrative results: ${results.map((result) => `${result.citation} ${result.title}, from ${result.source}`).join('; ')}. Restricted content is excluded in this demonstration.`;
  document.querySelector('#demo-query').insertAdjacentElement('afterend', retrievalDescription);
  document.querySelector('#demo-query').setAttribute('aria-describedby', retrievalDescription.id);

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    camera.aspect = aspect;
    camera.position.z = Math.max(5.9, 6.4 / aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    document.querySelector('#render-error').hidden = false;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    document.querySelector('#render-error').hidden = true;
  });

  return {
    setChapter(index) {
      chapter = index;
      queryAge = index === 5 ? 10 : 0;
    },
    replayQuery() {
      queryAge = 0;
      document.documentElement.dataset.queryReady = 'false';
    },
    render(time, delta, reducedMotion) {
      if (contextLost) return;
      const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.5);
      const targetOpacity = [.5, .6, .95, .8, .95, .95][chapter];
      pointMaterial.opacity = THREE.MathUtils.lerp(pointMaterial.opacity, targetOpacity, blend);
      space.rotation.y = Math.sin(time * .13) * .19 - .12;
      space.rotation.x = Math.sin(time * .09) * .06;
      if (chapter >= 4) queryAge = reducedMotion ? 10 : queryAge + delta;
      const queryVisible = chapter >= 4;
      queryPoint.visible = queryVisible;
      queryHalo.visible = queryVisible;
      queryCurve.getPoint(THREE.MathUtils.smoothstep(queryAge, 0, 2.4), queryPosition);
      queryPoint.position.copy(queryPosition);
      queryPoint.rotation.y = time * .3;
      queryHalo.position.copy(queryPosition);
      queryHalo.scale.setScalar(1 + Math.sin(time * 1.2) * .12);
      queryLabel.position.copy(queryPosition).add(new THREE.Vector3(-.2, -.28, .05));
      queryLabel.element.style.opacity = queryVisible ? '1' : '0';
      const ready = queryVisible && queryAge >= 3.7;
      const readyText = String(ready);
      if (document.documentElement.dataset.queryReady !== readyText) document.documentElement.dataset.queryReady = readyText;
      permissionLabel.element.style.opacity = ready ? '1' : '0';
      nearestObjects.forEach(({ index, material, glow, badge }) => {
        const reveal = queryVisible ? THREE.MathUtils.smoothstep(queryAge, 2.4 + index * .35, 3 + index * .35) : 0;
        material.opacity = reveal * .8;
        glow.material.opacity = reveal * .15;
        badge.element.style.opacity = String(reveal);
      });
      chunkNodes.forEach(({ chunk, node, material }) => {
        const highlighted = queryVisible && queryAge >= 2.4 && matchIds.has(chunk.id);
        node.scale.setScalar(highlighted ? 1.45 : 1);
        material.opacity = chunk.allowed ? highlighted ? 1 : .6 : ready ? .18 : .45;
      });
      space.updateMatrixWorld(true);
      labels.forEach(({ element, position }) => {
        world.copy(position).applyMatrix4(space.matrixWorld);
        projected.copy(world).project(camera);
        element.style.transform = `translate(${(projected.x * .5 + .5) * width}px, ${(-projected.y * .5 + .5) * height}px) translate(-50%, -50%)`;
      });
      renderer.render(scene, camera);
    },
  };
}
