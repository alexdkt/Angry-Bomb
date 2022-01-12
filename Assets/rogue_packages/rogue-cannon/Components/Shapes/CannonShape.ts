import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import CannonBody from '../CannonBody.re';

export default class CannonShape extends RE.Component {
  shape: CANNON.Shape;
  body: CANNON.Body | undefined;
  bodyComponent: CannonBody | undefined;

  localPos: THREE.Vector3 = new THREE.Vector3();
  worldPos = new THREE.Vector3();

  localRot = new THREE.Quaternion();
  worldQuaternion = new THREE.Quaternion();

  private matrixA = new THREE.Matrix4();
  private matrixB = new THREE.Matrix4();
  private matrixC = new THREE.Matrix4();

  awake() {
    this.createShape();
  }

  start() {
    if (!this.shape) return;

    this.bodyComponent = this.getBodyComponent(this.object3d);

    if (!this.bodyComponent) return;

    this.body = this.bodyComponent.body;

    const bodyIsShape = this.object3d === this.bodyComponent.object3d;

    this.object3d.getWorldPosition(this.worldPos);
    this.localPos.copy(this.worldPos);
    this.bodyComponent.object3d.updateWorldMatrix(true, true);
    this.bodyComponent.object3d.worldToLocal(this.localPos);

    let position = new CANNON.Vec3(
      this.localPos.x,
      this.localPos.y,
      this.localPos.z,
    );

    this.object3d.updateWorldMatrix(true, true);
    this.object3d.getWorldQuaternion(this.worldQuaternion);

    this.matrixA.makeRotationFromQuaternion(this.worldQuaternion);
    this.object3d.updateWorldMatrix(true, true);
    this.matrixB.copy(this.bodyComponent.object3d.matrixWorld).invert();
    this.matrixC.extractRotation(this.matrixB);
    this.matrixA.premultiply(this.matrixC);
    this.localRot.setFromRotationMatrix(this.matrixA);

    let rotation = new CANNON.Quaternion(
      this.localRot.x,
      this.localRot.y,
      this.localRot.z,
      this.localRot.w,
    );

    if (bodyIsShape) {
      this.body.addShape(this.shape);
    } else {
      this.body.addShape(this.shape, position, rotation);
    }
  }

  private getBodyComponent(object3d: THREE.Object3D): CannonBody | undefined {
    const bodyComponent = RE.getComponent(CannonBody, object3d);

    if (bodyComponent) {
      return bodyComponent;
    }

    if (!object3d.parent) return;

    return this.getBodyComponent(object3d.parent as THREE.Object3D);
  }

  protected createShape(): void {};
}
