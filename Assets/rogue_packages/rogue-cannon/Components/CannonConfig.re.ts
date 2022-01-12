import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as RogueCannon from '../Lib/RogueCannon';

export default class CannonConfig extends RE.Component {
  private _defaultFriction = 0.01;
  private _defaultRestitution = 0;

  @RE.Prop("Number") maxSubSteps: number = 1;

  @RE.Prop("Number")
  get defaultFriction() {
    return this._defaultFriction;
  }

  set defaultFriction(value: number) {
    this._defaultFriction = value;
    RogueCannon.getWorld().defaultContactMaterial.friction = value;
  }

  @RE.Prop("Number") 
  get defaultRestitution() {
    return this._defaultRestitution;
  }

  set defaultRestitution(value: number) {
    this._defaultRestitution = value;
    RogueCannon.getWorld().defaultContactMaterial.restitution = value;
  }

  @RE.Prop("Vector3") gravity: THREE.Vector3 = new THREE.Vector3(0, -9.82, 0);

  awake() {
    RogueCannon.setWorld(new CANNON.World());
    RogueCannon.getWorld().gravity.set(this.gravity.x, this.gravity.y, this.gravity.z);
    RogueCannon.getWorld().broadphase = new CANNON.NaiveBroadphase();
    RogueCannon.getWorld().defaultContactMaterial.friction = this.defaultFriction;
    RogueCannon.getWorld().defaultContactMaterial.restitution = this.defaultRestitution;
  }

  beforeUpdate() {
    RogueCannon.getWorld().step(RE.Runtime.deltaTime, RE.Runtime.deltaTime, this.maxSubSteps || 1);
  }
}

RE.registerComponent( CannonConfig );
