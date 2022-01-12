import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonConstraint from './CannonConstraint';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonPointToPointConstraint extends CannonConstraint {
  constraint: CANNON.PointToPointConstraint;

  @RE.Prop("Object3D") target: THREE.Object3D;
  @RE.Prop("Vector3") privotA: THREE.Vector3 = new THREE.Vector3();
  @RE.Prop("Vector3") privotB: THREE.Vector3 = new THREE.Vector3();
  @RE.Prop("Number") maxForce: number = 1e6;

  protected createConstraint() {
    if (!this.target) throw "CannonHinge requires a target";

    const bodyA = this.getCannonBodyComponent(this.object3d).body;
    const bodyB = this.getCannonBodyComponent(this.target).body;

    this.constraint = new CANNON.PointToPointConstraint(
      bodyA,
      new CANNON.Vec3(this.privotA.x, this.privotA.y, this.privotA.z),
      bodyB,
      new CANNON.Vec3(this.privotB.x, this.privotB.y, this.privotB.z),
      this.maxForce
    );

    RogueCannon.getWorld().addConstraint(this.constraint);
  }
}

RE.registerComponent(CannonPointToPointConstraint);
