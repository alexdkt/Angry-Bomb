import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonShape from './CannonShape';

export default class CannonBox extends CannonShape {
  shape: CANNON.Box;
  @RE.Prop("Vector3") sizeOffset: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  worldScale = new THREE.Vector3();

  protected createShape() {
    this.object3d.getWorldScale(this.worldScale);

    this.shape = new CANNON.Box(
      new CANNON.Vec3(
        this.sizeOffset.x * (this.worldScale.x/2),
        this.sizeOffset.y * (this.worldScale.y/2),
        this.sizeOffset.z * (this.worldScale.z/2)
      )
    );
  }
}

RE.registerComponent(CannonBox);
