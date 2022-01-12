import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonBody from '../CannonBody.re';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonRaycastVehicle extends RE.Component {
  @RE.Prop("Object3D") chasis: THREE.Object3D;
  @RE.Prop("Number") mass = 500;
  @RE.Prop("Number") suspensionStiffness = 30;
  @RE.Prop("Number") suspensionRestLength = 0.1;
  @RE.Prop("Number") frictionSlip = 0.7;
  @RE.Prop("Number") dampingRelaxation: 2.3;
  @RE.Prop("Number") dampingCompression: 4.4;
  @RE.Prop("Number") maxSuspensionForce: 100000;
  @RE.Prop("Number") rollInfluence: 0.01;
  @RE.Prop("Number") maxSuspensionTravel = 0.2;
  @RE.Prop("Number") customSlidingRotationalSpeed = -30;
  @RE.Prop("Boolean") useCustomSlidingRotationalSpeed = true;

  vehicle: CANNON.RaycastVehicle;

  start() {
    if (!RogueCannon.getWorld()) return;

    let body = RE.getComponent(CannonBody, this.object3d);

    if (!body) {
      body = new CannonBody("CarBody", this.object3d);
      body.mass = this.mass;
      RE.addComponent(body);
    }

    if (!this.chasis) return;

    const chassisBody = RE.getComponent(CannonBody, this.chasis);

    if (!(chassisBody instanceof CannonBody)) return;

    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: body.body,
      indexForwardAxis: 2,
      indexUpAxis: 1,
      indexRightAxis: 0,
    });

    this.vehicle.addToWorld(RogueCannon.getWorld());
  }
}

RE.registerComponent(CannonRaycastVehicle);
