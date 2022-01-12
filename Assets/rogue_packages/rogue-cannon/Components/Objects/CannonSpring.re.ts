import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonBody from '../CannonBody.re';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonSpring extends RE.Component {
  spring: CANNON.Spring;
  targetBody: CANNON.Body;
  
  @RE.Prop("Object3D") target: THREE.Object3D;
  @RE.Prop("Vector3") anchorA: THREE.Vector3 = new THREE.Vector3();
  @RE.Prop("Vector3") anchorB: THREE.Vector3 = new THREE.Vector3();
  @RE.Prop("Number") restLength: number = 0;
  @RE.Prop("Number") stiffness: number = 50;
  @RE.Prop("Number") damping: number = 1;

  start() {
    this.createSpring();
  }

  private getCannonBodyComponent(object3d: THREE.Object3D): CannonBody {
    const cannonBody = RE.getComponent(CannonBody, object3d);

    if (!cannonBody) {
      throw "CannonSpring targets must have a Cannon Body Component"
    }

    return cannonBody;
  }

  applyForce = () => {
    this.spring.applyForce();
  }

  private createSpring() {
    if (!this.target) throw "CannonSpring requires a target";

    const bodyA = this.getCannonBodyComponent(this.object3d).body;
    const bodyB = this.getCannonBodyComponent(this.target).body;

    this.spring = new CANNON.Spring(bodyA, bodyB, {
      localAnchorA: new CANNON.Vec3(this.anchorA.x, this.anchorA.y, this.anchorA.z),
      localAnchorB: new CANNON.Vec3(this.anchorB.x, this.anchorB.y, this.anchorB.z),
      restLength: this.restLength,
      stiffness: this.stiffness,
      damping: this.damping,
    });

    RogueCannon.getWorld().addEventListener('postStep', this.applyForce)
  }

  onBeforeRemoved() {
    RogueCannon.getWorld().removeEventListener('postStep', this.applyForce);
  }
}

RE.registerComponent(CannonSpring);
