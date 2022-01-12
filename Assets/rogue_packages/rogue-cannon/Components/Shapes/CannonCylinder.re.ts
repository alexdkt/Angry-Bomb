import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonShape from './CannonShape';

export default class CannonCylinder extends CannonShape {
  shape: CANNON.Cylinder;

  @RE.Prop("Number") radiusTopOffset = 1;
  @RE.Prop("Number") radiusBottomOffset = 1;
  @RE.Prop("Number") heightOffset = 1;
  @RE.Prop("Number") segments = 100;

  worldScale = new THREE.Vector3();

  protected createShape() {
    this.object3d.getWorldScale(this.worldScale);

    this.shape = new CANNON.Cylinder(
      this.radiusTopOffset * this.worldScale.x,
      this.radiusBottomOffset * this.worldScale.x,
      this.heightOffset * this.worldScale.y,
      this.segments
    );
  }
}

RE.registerComponent(CannonCylinder);
