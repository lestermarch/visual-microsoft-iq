import * as THREE from 'three';

const icon = (paths, className = '') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const icons = {
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  app: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  cloud: '<path d="M6 17a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11H6Z"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M7 6.5h.1M7 17.5h.1m5-11h5m-5 11h5"/>',
  stream: '<path d="M2 7c4-5 6 5 10 0s6 5 10 0M2 12c4-5 6 5 10 0s6 5 10 0M2 17c4-5 6 5 10 0s6 5 10 0"/>',
  file: '<path d="M6 2h8l5 5v15H6V2Zm8 0v6h5M9 12h7m-7 4h7"/>',
  supplier: '<path d="M3 9 12 3l9 6v12H3V9Zm5 12v-8h8v8M3 9h18"/>',
  factory: '<path d="M3 21V10l7-4v7l7-4v12H3Zm14 0V3h4v18M6 16h1m4 0h1m-6 3h1m4 0h1"/>',
  product: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm-9 5 9 5 9-5m-9 5v10M7 4.7l9 5"/>',
  order: '<path d="M6 3h12v19l-3-2-3 2-3-2-3 2V3Zm3 4h6m-6 4h6m-6 4h4"/>',
  customer: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  shipment: '<path d="M2 6h13v13H2V6Zm13 5h4l3 4v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  table: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20M9 9v12m6-12v12"/>',
  fabric: '<path d="m5 4 16-2-2 7L3 11l2-7Z" fill="currentColor" stroke="none"/><path d="m3 11 14-2-2 7-14 2 2-7Z" fill="currentColor" opacity=".7" stroke="none"/><path d="m1 18 12-2-2 6H5c-3 0-5-1-4-4Z" fill="currentColor" opacity=".4" stroke="none"/>',
};

export function createFabricScene(container, labelLayer) {
  const styles = getComputedStyle(document.documentElement);
  const color = (token) => new THREE.Color(styles.getPropertyValue(token).trim());
  const teal = color('--cp-fabric');
  const mint = color('--cp-fabric-light');
  const blue = color('--cp-azure');
  const cyan = color('--cp-cyan');
  const violet = color('--cp-violet');
  const white = color('--cp-surface');
  const amber = color('--cp-amber');

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 3.45, -3.45, .1, 50);
  camera.position.set(0, 3.8, 11);
  camera.lookAt(0, .05, 0);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(white, 2.4));
  const keyLight = new THREE.DirectionalLight(white, 3);
  keyLight.position.set(-4, 7, 5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(mint, 2);
  rimLight.position.set(4, 2, -3);
  scene.add(rimLight);

  const architecture = new THREE.Group();
  scene.add(architecture);
  const labels = [];
  const materials = [];
  let chapter = 0;
  let width = 1;
  let height = 1;
  let contextLost = false;
  const weights = {
    sources: [1, 1, .6, .48, .48],
    lake: [.65, 1, .68, .58, .58],
    semantic: [.28, .36, 1, .7, .7],
    ontology: [.27, .33, .45, 1, 1],
    uplift: [.17, .4, .8, 1, 1],
  };
  const vector = (coordinates) => new THREE.Vector3(...coordinates);
  const world = new THREE.Vector3();
  const projected = new THREE.Vector3();

  function track(material, layer, opacity) {
    material.transparent = true;
    material.depthWrite = false;
    materials.push({ material, layer, opacity });
    material.opacity = weights[layer][0] * opacity;
    return material;
  }

  function line(points, tint, layer, opacity = .5, dashed = false) {
    const material = dashed
      ? new THREE.LineDashedMaterial({ color: tint, dashSize: .04, gapSize: .045 })
      : new THREE.LineBasicMaterial({ color: tint });
    track(material, layer, opacity);
    const mesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    if (dashed) mesh.computeLineDistances();
    architecture.add(mesh);
    return mesh;
  }

  function circle(radius, y, tint, layer, opacity = .4) {
    const points = [];
    for (let i = 0; i <= 160; i++) {
      const angle = i / 160 * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return line(points, tint, layer, opacity);
  }

  function label(html, className, position) {
    const element = document.createElement('div');
    element.className = `scene-label ${className}`;
    element.innerHTML = html;
    labelLayer.appendChild(element);
    const item = { element, position: vector(position) };
    labels.push(item);
    return element;
  }

  const lake = new THREE.Mesh(
    new THREE.CylinderGeometry(2.38, 2.38, .11, 100),
    track(new THREE.MeshPhysicalMaterial({ color: mint, roughness: .28, metalness: .12, side: THREE.DoubleSide }), 'lake', .3),
  );
  lake.position.y = -1.6;
  architecture.add(lake);
  for (const [radius, opacity] of [[2.38, .75], [2.47, .2], [2.6, .16], [1.92, .17], [1.4, .13]]) {
    circle(radius, -1.53, cyan, 'lake', opacity);
  }
  circle(2.38, -1.7, teal, 'lake', .3);
  for (let i = -4; i <= 4; i++) {
    const offset = i * .45;
    const bound = Math.sqrt(2.3 ** 2 - offset ** 2);
    line([new THREE.Vector3(-bound, -1.535, offset), new THREE.Vector3(bound, -1.535, offset)], cyan, 'lake', .11);
    line([new THREE.Vector3(offset, -1.535, -bound), new THREE.Vector3(offset, -1.535, bound)], cyan, 'lake', .11);
  }

  const waterPositions = [];
  let seed = 41;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (let i = 0; i < 700; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 2.3;
    waterPositions.push(Math.cos(angle) * radius, -1.49 + random() * .12, Math.sin(angle) * radius);
  }
  const waterGeometry = new THREE.BufferGeometry();
  waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
  const water = new THREE.Points(waterGeometry, track(new THREE.PointsMaterial({ color: cyan, size: .022 }), 'lake', .65));
  architecture.add(water);
  const lakeWaves = [1.2, 1.65, 2.05].map((radius) => circle(radius, -1.46, mint, 'lake', .3));

  const rectangle = new THREE.Shape();
  const w = 2.5;
  const d = 1.1;
  const r = .18;
  rectangle.moveTo(-w + r, -d);
  rectangle.lineTo(w - r, -d);
  rectangle.quadraticCurveTo(w, -d, w, -d + r);
  rectangle.lineTo(w, d - r);
  rectangle.quadraticCurveTo(w, d, w - r, d);
  rectangle.lineTo(-w + r, d);
  rectangle.quadraticCurveTo(-w, d, -w, d - r);
  rectangle.lineTo(-w, -d + r);
  rectangle.quadraticCurveTo(-w, -d, -w + r, -d);
  const semanticPlate = new THREE.Mesh(
    new THREE.ExtrudeGeometry(rectangle, { depth: .035, bevelEnabled: false, curveSegments: 12 }),
    track(new THREE.MeshPhysicalMaterial({ color: violet, roughness: .35, metalness: .1, side: THREE.DoubleSide }), 'semantic', .13),
  );
  semanticPlate.rotation.x = -Math.PI / 2;
  semanticPlate.position.y = .1;
  architecture.add(semanticPlate);
  const outlinePoints = rectangle.getPoints(80).map((point) => new THREE.Vector3(point.x, .14, -point.y));
  line(outlinePoints, violet, 'semantic', .6);
  const modelPositions = [
    [-1.6, .32, .15],
    [0, .32, -.3],
    [1.6, .32, .15],
  ];
  line([vector(modelPositions[0]), vector([-.7, .23, .15]), vector([-.7, .23, -.3]), vector(modelPositions[1])], violet, 'semantic', .65);
  line([vector(modelPositions[1]), vector([.7, .23, -.3]), vector([.7, .23, .15]), vector(modelPositions[2])], violet, 'semantic', .65);
  const models = [
    { name: 'Customer', rows: ['Customer ID', 'Region', 'Segment'] },
    { name: 'Sales', rows: ['Order ID', 'Net revenue', 'Margin %'], measures: true },
    { name: 'Product', rows: ['Product ID', 'Category', 'Unit price'] },
  ];
  models.forEach((model, index) => {
    label(`<strong>${icon(icons.table)}${model.name}</strong>${model.rows.map((row, i) => `<span${model.measures && i > 0 ? ' class="measure"' : ''}>${row}</span>`).join('')}`, 'model-table', modelPositions[index]);
  });
  label(`${icon(icons.table)}<b>Semantic models</b>`, 'layer-title semantic-title', [0, -.03, 1.43]);

  const lakeSymbol = '<path d="M3 8c3-4 6 4 9 0s6 4 9 0M3 13c3-4 6 4 9 0s6 4 9 0M3 18c3-4 6 4 9 0s6 4 9 0"/>';
  label(`${icon(lakeSymbol)}<div><b>OneLake</b><small>ONE LOGICAL DATA LAKE</small></div>`, 'layer-title lake-title', [0, -1.43, .6]);
  label(`${icon(icons.fabric)}<b>Ontology</b><span class="preview">PREVIEW</span>`, 'layer-title ontology-title', [.4, 3.08, -.1]);

  const sources = [
    { name: 'Business apps', sub: 'ERP / CRM / operations', icon: 'app', tint: '--cp-azure', position: [-3.02, -1.16, -.7] },
    { name: 'Databases', sub: 'SQL / data platforms', icon: 'database', tint: '--cp-violet', position: [3.02, -1.16, -.7] },
    { name: 'Cloud storage', sub: 'Across clouds', icon: 'cloud', tint: '--cp-cyan', position: [-3.1, -1.88, .6] },
    { name: 'On-premises', sub: 'Your existing estate', icon: 'server', tint: '--cp-text-muted', position: [3.1, -1.88, .6] },
    { name: 'Live streams', sub: 'Events / telemetry', icon: 'stream', tint: '--cp-fabric', position: [-1.5, -2.12, 1.65] },
    { name: 'Files & tables', sub: 'Structured / unstructured', icon: 'file', tint: '--cp-orange', position: [1.5, -2.12, 1.65] },
  ];
  const flows = [];
  function flow(start, mid, end, tint, layer, offset, speed = .16) {
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    line(curve.getPoints(60), tint, layer, .35, true);
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(.027, 8, 8),
      track(new THREE.MeshBasicMaterial({ color: tint }), layer, .85),
    );
    architecture.add(pulse);
    flows.push({ curve, pulse, offset, speed });
  }
  sources.forEach((source, i) => {
    const element = label(`<span class="source-icon">${icon(icons[source.icon])}</span><span><strong>${source.name}</strong><small>${source.sub}</small></span>`, 'source-label', source.position);
    element.style.setProperty('--source-color', `var(${source.tint})`);
    const start = vector(source.position);
    const end = new THREE.Vector3(start.x * .46, -1.5, start.z * .5);
    const mid = start.clone().lerp(end, .5);
    mid.y += .18;
    flow(start, mid, end, color(source.tint), 'sources', i * .19);
  });

  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * .75;
    flow(vector([x * 1.2, -1.45, -.25]), vector([x * 1.65, -.55, -.5]), vector([x, .1, -.2]), violet, 'uplift', i * .22, .13);
    flow(vector([x, .3, -.35]), vector([x * 1.5, 1, -.55]), vector([x * 1.3, 1.85, -.3]), teal, 'uplift', i * .27, .11);
  }

  const entities = [
    { name: 'Supplier', icon: 'supplier', position: [-2.35, 1.9, -.4] },
    { name: 'Factory', icon: 'factory', position: [-1.1, 2.27, -.65] },
    { name: 'Product', icon: 'product', position: [-.5, 1.5, .85] },
    { name: 'Order', icon: 'order', position: [1.15, 2.12, -.45] },
    { name: 'Customer', icon: 'customer', position: [2.4, 1.7, .4] },
    { name: 'Shipment', icon: 'shipment', position: [.9, 1.5, 1.25] },
  ];
  const nodeGeometry = new THREE.SphereGeometry(.1, 16, 12);
  const entityObjects = entities.map((entity) => {
    const material = track(new THREE.MeshStandardMaterial({ color: teal, roughness: .2, metalness: .15 }), 'ontology', .85);
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.copy(vector(entity.position));
    architecture.add(node);
    const element = label(`<span class="entity-badge">${icon(icons[entity.icon])}</span><strong>${entity.name}</strong>`, 'entity-label', [entity.position[0], entity.position[1] + .1, entity.position[2]]);
    element.dataset.entity = entity.name;
    return { node, element, material };
  });
  const relationships = [
    { from: 0, to: 1, text: 'supplies', offset: [0, .04, 0] },
    { from: 1, to: 2, text: 'produces', offset: [-.22, 0, 0] },
    { from: 3, to: 2, text: 'contains', offset: [0, .02, 0] },
    { from: 4, to: 3, text: 'places', offset: [.05, .02, 0] },
    { from: 5, to: 3, text: 'fulfils', offset: [.15, .02, 0] },
    { from: 5, to: 4, text: 'ships to', offset: [.12, 0, 0] },
  ];
  const relationshipObjects = relationships.map((relationship) => {
    const from = vector(entities[relationship.from].position);
    const to = vector(entities[relationship.to].position);
    const mesh = line([from, to], teal, 'ontology', .7);
    const midpoint = from.clone().lerp(to, .5).add(vector(relationship.offset));
    const element = label(relationship.text, 'relation-label', midpoint.toArray());
    return { mesh, element, material: mesh.material };
  });
  circle(2.55, 1.42, teal, 'ontology', .12);

  const impactCurves = [
    new THREE.LineCurve3(vector(entities[5].position), vector(entities[3].position)),
    new THREE.LineCurve3(vector(entities[3].position), vector(entities[4].position)),
  ];
  const impactPulses = impactCurves.map((curve) => {
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), new THREE.MeshBasicMaterial({ color: amber, transparent: true, depthWrite: false }));
    pulse.visible = false;
    architecture.add(pulse);
    return { pulse, curve };
  });

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const viewHeight = Math.max(6.9, 7.45 / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    architecture.position.x = aspect > 1.25 ? .22 : 0;
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
      entityObjects.forEach((entity, i) => entity.element.classList.toggle('impact', index === 4 && [3, 4, 5].includes(i)));
      relationshipObjects.forEach((relationship, i) => relationship.element.classList.toggle('impact', index === 4 && [3, 4].includes(i)));
    },
    render(time, delta, reducedMotion) {
      if (contextLost) return;
      const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.2);
      for (const entry of materials) {
        entry.material.opacity = THREE.MathUtils.lerp(entry.material.opacity, weights[entry.layer][chapter] * entry.opacity, blend);
      }
      architecture.rotation.y = Math.sin(time * .12) * .075 - .035;
      architecture.position.y = Math.sin(time * .35) * .012;
      water.rotation.y = time * .045;
      lakeWaves.forEach((wave, i) => wave.scale.set(1 + Math.sin(time * .7 + i * 2) * .012, 1, 1 + Math.sin(time * .7 + i * 2) * .012));
      flows.forEach(({ curve, pulse, offset, speed }) => {
        curve.getPoint((time * speed + offset) % 1, pulse.position);
      });
      entityObjects.forEach((entity, i) => entity.material.color.lerp(chapter === 4 && [3, 4, 5].includes(i) ? amber : teal, blend));
      relationshipObjects.forEach((relationship, i) => relationship.material.color.lerp(chapter === 4 && [3, 4].includes(i) ? amber : teal, blend));
      impactPulses.forEach(({ pulse, curve }, i) => {
        pulse.visible = chapter === 4;
        curve.getPoint((time * .3 + i * .5) % 1, pulse.position);
      });
      architecture.updateMatrixWorld(true);
      for (const { element, position } of labels) {
        world.copy(position).applyMatrix4(architecture.matrixWorld);
        projected.copy(world).project(camera);
        element.style.transform = `translate(${(projected.x * .5 + .5) * width}px, ${(-projected.y * .5 + .5) * height}px) translate(-50%, -50%)`;
      }
      renderer.render(scene, camera);
    },
  };
}
