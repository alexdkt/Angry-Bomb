import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonConstraint from './CannonConstraint';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonHingeConstraint extends CannonConstraint {
  constraint: CANNON.HingeConstraint;

  @RE.Prop("Object3D") target: THREE.Object3D;
  @RE.Prop("Vector3") pivotA: THREE.Vector3 = new THREE.Vector3(0.1, 0, 0);
  @RE.Prop("Vector3") axisA: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  @RE.Prop("Vector3") pivotB: THREE.Vector3 = new THREE.Vector3(-1, 0, 0);
  @RE.Prop("Vector3") axisB: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  @RE.Prop("Boolean") collideConnected: boolean;
  @RE.Prop("Number") maxForce: number = 1e6;

  protected createConstraint() {
    if (!this.target) throw "CannonHinge requires a target";

    const bodyA = this.getCannonBodyComponent(this.object3d).body;
    const bodyB = this.getCannonBodyComponent(this.target).body;

    this.constraint = new CANNON.HingeConstraint(bodyA, bodyB, {
      pivotA: new CANNON.Vec3(this.pivotA.x, this.pivotA.y, this.pivotA.z),
      axisA: new CANNON.Vec3(this.axisA.x, this.axisA.y, this.axisA.z),
      pivotB: new CANNON.Vec3(this.pivotB.x, this.pivotB.y, this.pivotB.z),
      axisB: new CANNON.Vec3(this.axisB.x, this.axisB.y, this.axisB.z),
      collideConnected: this.collideConnected,
      maxForce: this.maxForce,
    });

    RogueCannon.getWorld().addConstraint(this.constraint);
  }
}

RE.registerComponent(CannonHingeConstraint);
