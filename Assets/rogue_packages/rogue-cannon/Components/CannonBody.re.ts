import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as RogueCannon from '../Lib/RogueCannon';

export default class CannonBody extends RE.Component {
  protected _isTrigger = false;
  protected _angularDamping = 0;
  protected _linearDamping = 0;
  protected _angularFactor = new THREE.Vector3(1, 1, 1);
  protected _linearFactor = new THREE.Vector3(1, 1, 1);
  protected _mass = 1;
  protected _useDefaultMass = true;
  protected _type = 0;
  protected typeOptions = [
    "Dynamic",
    "Static",
    "Kinematic",
  ];

  @RE.Prop("Select")
  get type() {
    return this._type;
  }

  set type(value: number) {
    this._type = value;

    let type: CANNON.BodyType = 1;

    if (value === 0) type = 1;
    if (value === 1) type = 2;
    if (value === 2) type = 4;

    this.body && (this.body.type = type);
  }

  @RE.Prop("Number") 
  get angularDamping() {
    return this._angularDamping;
  }

  set angularDamping(value: number) {
    this._angularDamping = value;
    this.body && (this.body.angularDamping = value);
  }

  @RE.Prop("Number")
  get linearDamping() {
    return this._linearDamping;
  }

  set linearDamping(value: number) {
    this._linearDamping = value;
    this.body && (this.body.linearDamping = value);
  }

  @RE.Prop("Number")
  get mass() {
    return this._mass;
  }

  set mass(value: number) {
    this._mass = value;
    this.body && (this.body.mass = value);
    this.body && this.body.updateMassProperties();
  }

  @RE.Prop("Vector3")
  get linearFactor() {
    return this._linearFactor;
  }

  set linearFactor(value: THREE.Vector3) {
    this._linearFactor = value;
    this.body && (this.body.linearFactor.set(value.x, value.y, value.z));
  }

  @RE.Prop("Vector3")
  get angularFactor() {
    return this._angularFactor;
  }

  set angularFactor(value: THREE.Vector3) {
    this._angularFactor = value;
    this.body && (this.body.angularFactor.set(value.x, value.y, value.z));
  }

  @RE.Prop("Boolean") 
  get isTrigger() {
    return this._isTrigger;
  }

  set isTrigger(value: boolean) {
    this._isTrigger = value;
    this.body && (this.body.isTrigger = value);
  }

  body: CANNON.Body;

  private worldPos = new THREE.Vector3();
  private worldRot = new THREE.Quaternion();
  private newBodyPos = new CANNON.Vec3();
  private newBodyRot = new CANNON.Quaternion();

  private newPos = new THREE.Vector3();
  private newRot = new THREE.Quaternion();
  private matrixA = new THREE.Matrix4();
  private matrixB = new THREE.Matrix4();
  private matrixC = new THREE.Matrix4();

  private onCollideCB: (event: {other: CANNON.Body, contact: CANNON.ContactEquation}) => void | undefined;

  private triggerCollision;

  static findByBody(body: CANNON.Body) {
    let bodyComponent: undefined | CannonBody;

    RE.traverseComponents(component => {
      if (bodyComponent) return;

      if (component instanceof CannonBody && component.body === body) {
        bodyComponent = component;
      }
    });

    return bodyComponent;
  }

  awake() {
    this.createBody();

    RE.Runtime.onStop(() => {
      this.handleOnCollide && this.body.removeEventListener('collide', this.handleOnCollide);
    });
  }

  start() {
    RogueCannon.getWorld().addBody(this.body);
    this.copyObjectTransform();
  }

  update() {
    if (this.body.mass !== this._mass) {
      this.mass = this._mass;
    }

    this.body && (this.body.type = this.getBodyType())

    this.body.type !== CANNON.BODY_TYPES.STATIC && this.updatePhysics();
  }

  afterUpdate() {
    if (this.triggerCollision !== undefined && this.onCollideCB) {
      this.onCollideCB(this.triggerCollision);
      this.triggerCollision = undefined;
    }
  }

  onBeforeRemoved() {
    RogueCannon.getWorld().removeBody(this.body);
  }

  onCollide(callback: (event: {other: CANNON.Body, contact: CANNON.ContactEquation}) => void) {
    this.onCollideCB = callback;

    this.body.removeEventListener('collide', this.handleOnCollide);
    this.body.addEventListener('collide', this.handleOnCollide);
  }

  private handleOnCollide = (event: {body: CANNON.Body, target: CANNON.Body, contact: CANNON.ContactEquation}) => {
    const bj = event.contact.bj;
    const bi = event.contact.bi;

    const collision = {
      other: bj !== this.body ? bj : bi,
      contact: event.contact,
    }

    this.triggerCollision = collision;
  }

  private getBodyType() {
    let type: CANNON.BodyType = 1;

    if (this._type === 0) type = 1;
    if (this._type === 1) type = 2;
    if (this._type === 2) type = 4;

    return type;
  }

  private createBody() {
    this.body = new CANNON.Body({
      type: this.getBodyType(),
      angularDamping: this.angularDamping,
      linearDamping: this.linearDamping,
      linearFactor: new CANNON.Vec3(this.linearFactor.x, this.linearFactor.y, this.linearFactor.z),
      angularFactor: new CANNON.Vec3(this.angularFactor.x, this.angularFactor.y, this.angularFactor.z),
      isTrigger: this.isTrigger,
      mass: this._mass,
    });

    this.copyObjectTransform();
  }

  protected createShape(): void {};

  protected copyObjectTransform() {
    this.object3d.parent?.updateMatrixWorld(true);

    this.object3d.getWorldPosition(this.worldPos);
    this.object3d.getWorldQuaternion(this.worldRot);

    this.newBodyPos.set(
      this.worldPos.x,
      this.worldPos.y,
      this.worldPos.z
    );

    this.newBodyRot.set(
      this.worldRot.x,
      this.worldRot.y,
      this.worldRot.z,
      this.worldRot.w
    );

    this.body.quaternion.copy(this.newBodyRot);
    this.body.position.copy(this.newBodyPos);
  }

  protected copyBodyTransform() {
    this.copyBodyPosition();
    this.copyBodyRotation();
  }

  private copyBodyPosition() {
    this.newPos.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
    
    if (!this.object3d.parent) return;

    this.object3d.parent?.worldToLocal(this.newPos);
    this.object3d.position.copy(this.newPos);
  }

  private copyBodyRotation() {
    this.newRot.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );

    this.matrixA.makeRotationFromQuaternion(this.newRot);
    this.object3d.updateMatrixWorld();
    this.matrixB.copy((this.object3d.parent as THREE.Object3D).matrixWorld).invert();
    this.matrixC.extractRotation(this.matrixB);
    this.matrixA.premultiply(this.matrixC);
    this.object3d.quaternion.setFromRotationMatrix(this.matrixA);
  }

  private updatePhysics() {
    this.copyBodyTransform();
  }
}

RE.registerComponent(CannonBody);
