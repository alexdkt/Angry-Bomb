import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import CannonConstraint from './CannonConstraint';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonLockConstraint extends CannonConstraint {
  constraint: CANNON.LockConstraint;

  @RE.Prop("Object3D") target: THREE.Object3D;
  @RE.Prop("Number") maxForce: number = 1e6;

  protected createConstraint() {
    if (!this.target) throw "CannonHinge requires a target";

    const bodyA = this.getCannonBodyComponent(this.object3d).body;
    const bodyB = this.getCannonBodyComponent(this.target).body;

    this.constraint = new CANNON.LockConstraint(bodyA, bodyB, {
      maxForce: this.maxForce
    });

    RogueCannon.getWorld().addConstraint(this.constraint);
  }
}

RE.registerComponent(CannonLockConstraint);
