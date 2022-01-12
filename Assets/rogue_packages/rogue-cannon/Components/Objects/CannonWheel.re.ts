import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonRaycastVehicle from './CannonRaycastVehicle.re';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonWheel extends RE.Component {
  @RE.Prop("Object3D") wheel: THREE.Object3D;

  connectionPoint = new THREE.Vector3(0, 0, 0);
  raycastVehicle: CannonRaycastVehicle;
  wheelInfo: CANNON.WheelInfo;

  private matrixA = new THREE.Matrix4();
  private matrixB = new THREE.Matrix4();
  private matrixC = new THREE.Matrix4();

  start() {
    this.raycastVehicle = RE.getComponent(CannonRaycastVehicle, this.object3d) as CannonRaycastVehicle;

    if (!(this.raycastVehicle instanceof CannonRaycastVehicle)) return;

    let radius = 0.3;

    if (this.wheel) {
      this.connectionPoint.copy(this.wheel.position);

      const bbox = new THREE.Box3().setFromObject(this.wheel);
      radius = bbox.max.x - bbox.min.x;
    }

    this.wheelInfo = new CANNON.WheelInfo({
      radius,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: this.raycastVehicle.suspensionStiffness,
      suspensionRestLength: this.raycastVehicle.suspensionRestLength,
      frictionSlip: this.raycastVehicle.frictionSlip,
      dampingRelaxation: this.raycastVehicle.dampingRelaxation,
      dampingCompression: this.raycastVehicle.dampingCompression,
      maxSuspensionForce: this.raycastVehicle.maxSuspensionForce,
      rollInfluence: this.raycastVehicle.rollInfluence,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(this.connectionPoint.x, this.connectionPoint.y, this.connectionPoint.z),
      maxSuspensionTravel: this.raycastVehicle.maxSuspensionTravel,
      customSlidingRotationalSpeed: this.raycastVehicle.customSlidingRotationalSpeed,
      useCustomSlidingRotationalSpeed: this.raycastVehicle.useCustomSlidingRotationalSpeed,
    });

    this.raycastVehicle.vehicle.wheelInfos.push(this.wheelInfo);

    if (!this.wheel) return;

    if (!RogueCannon.getWorld()) return;

    RogueCannon.getWorld().addEventListener('postStep', this.postStep);
  }

  postStep = () => {
    if (!this.wheel) return;

    const wheel = this.wheelInfo;

    if (!wheel) return;

    const pos = wheel.worldTransform.position;
    const rot = wheel.worldTransform.quaternion;

    this.wheel.position.set(pos.x, pos.y, pos.z);
    this.wheel.parent?.worldToLocal(this.wheel.position);

    this.wheel.quaternion.set(rot.x, rot.y, rot.z, rot.w);

    this.matrixA.makeRotationFromQuaternion(this.wheel.quaternion);
    this.wheel.updateMatrixWorld();
    this.matrixB.copy((this.wheel.parent as THREE.Object3D).matrixWorld).invert();
    this.matrixC.extractRotation(this.matrixB);
    this.matrixA.premultiply(this.matrixC);
    this.wheel.quaternion.setFromRotationMatrix(this.matrixA);
  }

  onBeforeRemoved() {
    RogueCannon.getWorld().removeEventListener('postStep', this.postStep);
  }
}

RE.registerComponent(CannonWheel);
