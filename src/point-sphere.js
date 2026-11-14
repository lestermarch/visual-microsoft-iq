import * as THREE from 'three';

export function createPointSphere(radius, count, material) {
  const positions = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index++) {
    const y = 1 - 2 * (index + .5) / count;
    const ringRadius = Math.sqrt(1 - y * y);
    positions.push(
      radius * Math.cos(index * goldenAngle) * ringRadius,
      radius * y,
      radius * Math.sin(index * goldenAngle) * ringRadius,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(geometry, material);
}
