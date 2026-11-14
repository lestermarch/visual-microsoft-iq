import * as THREE from 'three';
import { sources, icons } from './data.js';
import { isSourceActive } from './timeline.js';

export function createWebScene(container, labelLayer) {
  const css = getComputedStyle(document.documentElement);
  const color = (name) => new THREE.Color(css.getPropertyValue(`--cp-${name}`).trim());
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 50);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

  const sphere = new THREE.Group();
  scene.add(sphere);
  const positions = [];
  const count = 3200;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - 2 * (i + .5) / count;
    const r = Math.sqrt(1 - y * y);
    positions.push(2.65 * Math.cos(i * golden) * r, 2.65 * y, 2.65 * Math.sin(i * golden) * r);
  }
  const globeGeometry = new THREE.BufferGeometry();
  globeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const globeMaterial = new THREE.PointsMaterial({ color: color('azure'), size: .017, transparent: true, opacity: .3, depthWrite: false });
  sphere.add(new THREE.Points(globeGeometry, globeMaterial));
  const globeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.63, 48, 32),
    new THREE.MeshBasicMaterial({ color: color('cyan'), transparent: true, opacity: .025, depthWrite: false }),
  );
  sphere.add(globeMesh);
  const graticule = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(2.66, 24, 12)),
    new THREE.LineBasicMaterial({ color: color('azure'), transparent: true, opacity: .035, depthWrite: false }),
  );
  sphere.add(graticule);

  const rings = [];
  for (let i = 0; i < 3; i++) {
    const points = [];
    for (let j = 0; j <= 160; j++) {
      const a = j / 160 * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * 2.52, Math.sin(a) * 1.83, 0));
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: color(['azure', 'cyan', 'violet'][i]), transparent: true, opacity: .25 }),
    );
    ring.rotation.set(.5 + i * .38, i * .5, -.8 + i * .8);
    scene.add(ring);
    rings.push(ring);
  }

  const crystalGeometry = new THREE.OctahedronGeometry(.075);
  const crystals = Array.from({ length: 16 }, (_, i) => {
    const mesh = new THREE.Mesh(crystalGeometry, new THREE.MeshBasicMaterial({ color: color(['azure', 'violet', 'teal'][i % 3]), transparent: true, opacity: .6 }));
    scene.add(mesh);
    return mesh;
  });

  const sprites = sources.map((source, i) => {
    const element = document.createElement('div');
    element.className = 'web-card';
    element.dataset.source = source.id;
    element.dataset.group = source.group;
    element.style.setProperty('--data-color', css.getPropertyValue(`--cp-${source.color}`));
    element.innerHTML = `<span class="data-title"><span class="data-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[source.icon]}</svg></span>${source.title}</span><div class="data-art">${source.art}</div><span class="data-example">${source.example}</span>`;
    labelLayer.append(element);
    return { element, source, angle: -Math.PI * .875 + i * Math.PI / 4 };
  });

  const routeMaterial = sources.map((source) => new THREE.LineBasicMaterial({
    color: color(source.color), transparent: true, opacity: .2, depthWrite: false,
  }));
  const routes = sprites.map((sprite, i) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(39), 3));
    const line = new THREE.Line(geometry, routeMaterial[i]);
    scene.add(line);
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(.034, 8, 8), new THREE.MeshBasicMaterial({ color: color(sprite.source.color), transparent: true, opacity: .85 }));
    scene.add(pulse);
    return { line, pulse };
  });

  let chapter = 0;
  let width = 1;
  let height = 1;
  const projected = new THREE.Vector3();
  function resize() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.position.z = Math.max(7.7, 7.3 / camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  return {
    setChapter(value) {
      chapter = value;
      sprites.forEach(({ element, source }) => element.classList.toggle('highlighted', isSourceActive(source.id, chapter)));
    },
    render(time, delta, reducedMotion) {
      if (contextLost) return;
      sphere.rotation.set(.1 + Math.sin(time * .08) * .06, time * .035, -.12);
      rings.forEach((ring, i) => { ring.rotation.y = i * .5 + Math.sin(time * .05 + i) * .12; });
      crystals.forEach((mesh, i) => {
        const a = i / crystals.length * Math.PI * 2 + time * .018;
        const r = 2.8 + (i % 3) * .15;
        mesh.position.set(Math.cos(a) * r, Math.sin(a) * r * .8, Math.sin(a * 2) * .6);
        mesh.rotation.set(time * .15 + i, time * .1, i);
      });
      camera.updateMatrixWorld();
      sprites.forEach(({ element, source, angle }, i) => {
        const a = angle + Math.sin(time * .04) * .015;
        const radiusX = width < 400 ? 2.7 : Math.max(2.7, Math.min(4, camera.aspect * 1.9));
        const p = new THREE.Vector3(Math.cos(a) * radiusX, Math.sin(a) * 2.1, .4);
        projected.copy(p).project(camera);
        const scale = width < 400 ? .68 : width < 540 ? .82 : height < 380 ? .9 : 1;
        element.style.transform = `translate(${(projected.x * .5 + .5) * width}px,${(-projected.y * .5 + .5) * height}px) translate(-50%,-50%) scale(${scale})`;
        const active = isSourceActive(source.id, chapter);
        element.style.zIndex = active ? '5' : '3';
        const route = routes[i];
        const points = route.line.geometry.attributes.position;
        for (let j = 0; j < points.count; j++) {
          const t = j / (points.count - 1);
          points.setXYZ(j, p.x * (1 - t), p.y * (1 - t), p.z * (1 - t) - Math.sin(t * Math.PI) * .5);
        }
        points.needsUpdate = true;
        // Dynamic curves need fresh bounds after the first all-zero geometry.
        route.line.geometry.computeBoundingSphere();
        route.line.material.opacity = active ? chapter === 5 ? .38 : .23 : .05;
        const t = (time * .17 + i * .123) % 1;
        route.pulse.position.set(p.x * (1 - t), p.y * (1 - t), p.z * (1 - t) - Math.sin(t * Math.PI) * .5);
        route.pulse.visible = active && !reducedMotion;
      });
      renderer.render(scene, camera);
    },
  };
}
