import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonShape from './CannonShape';

export default class CannonTrimesh extends CannonShape {
  shape: CANNON.Trimesh;
  @RE.Prop("Vector3") sizeOffset: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  worldScale = new THREE.Vector3();
  worldPos = new THREE.Vector3();

  tmpVec0 = new CANNON.Vec3();
  tmpVec1 = new CANNON.Vec3();
  tmpVec2 = new CANNON.Vec3();
  tmpQuat0 = new CANNON.Vec3();

  createShape() {
    if (!(this.object3d instanceof THREE.Mesh)) return;

    this.object3d.updateWorldMatrix(true, true);

    this.object3d.getWorldScale(this.worldScale);
    this.object3d.getWorldPosition(this.worldPos);
    this.object3d.getWorldQuaternion(this.worldQuaternion);

    const mesh = this.object3d;
    let geometry = (mesh.geometry as THREE.BufferGeometry);
    
    geometry.computeBoundingSphere();
    geometry.normalizeNormals();

    if (geometry.index !== null) {
      const nonIndexedGeo = geometry.toNonIndexed();
      geometry.copy(nonIndexedGeo);
    }

    const vertices = this.getVertices(geometry);

	  if (!vertices.length) return;

    const indices = Object.keys(vertices).map(Number);
    this.shape = new CANNON.Trimesh(vertices as unknown as number[], indices);
  }

  getVertices (geometry: THREE.BufferGeometry) {
    const position = geometry.attributes.position;
    const vertices = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      vertices[i * 3] = position.getX(i) * this.worldScale.x;
      vertices[i * 3 + 1] = position.getY(i) * this.worldScale.y;
      vertices[i * 3 + 2] = position.getZ(i) * this.worldScale.z;
    }
    return vertices;
  }
}

RE.registerComponent(CannonTrimesh);
