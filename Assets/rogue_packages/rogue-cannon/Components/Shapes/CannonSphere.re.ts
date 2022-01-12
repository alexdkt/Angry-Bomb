import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonShape from './CannonShape';

export default class CannonSphere extends CannonShape {
  @RE.Prop("Number") radiusOffset: number = 1;
  shape: CANNON.Sphere;
  bbox: THREE.Box3;

  protected createShape() {
    const scale = this.object3d.scale;
    const maxSide = Math.max(scale.x, scale.y, scale.z);

    this.shape = new CANNON.Sphere(
      this.radiusOffset * (maxSide)
    );
  }
}

RE.registerComponent(CannonSphere);
