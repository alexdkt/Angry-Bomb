import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Vec3 } from 'cannon-es';
import * as RE from 'rogue-engine';
import { MathUtils, Vector3 } from 'three';
import ProjectileObject from './ProjectileObject.re';

const { Prop } = RE;

export default class BasketballController extends RE.Component {

  // External dependencies
  @Prop("Vector3") maxBoundaries: Vector3;
  @Prop("Vector3") minBoundaries: Vector3;
  @Prop("Vector3") maxInitPosition: Vector3;
  @Prop("Vector3") minInitPosition: Vector3;

  private cannonBody: CannonBody;
  private projectileController: ProjectileObject;
  private isOutOfRange: Boolean = false;


  awake() {
    this.cannonBody = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this.projectileController = RE.getComponent(ProjectileObject, this.object3d) as ProjectileObject;
  }

  start() {

  }

  isOutOfBoundaries() {

    const position = this.cannonBody.body.position;

    // Maybe there is a wonderful Vector3 method to check if one coordinate of a vector exceeds a value without having to do this mess?
    return (position.x > this.maxBoundaries.x || position.x < this.minBoundaries.x ||
      position.y > this.maxBoundaries.y || position.y < this.minBoundaries.y ||
      position.z > this.maxBoundaries.z || position.z < this.minBoundaries.z);
  }

  resetPosition() {
    // Disable projectile mass:
    this.projectileController.setMassEnabled(false);

    // Reset position:
    this.cannonBody.body.velocity.setZero();
    const newPos = this.getNewPosition();
    this.cannonBody.body.position = newPos;

    // Reset rotation, from: https://github.com/schteppe/cannon.js/issues/215
    this.cannonBody.body.angularVelocity.setZero();
    this.cannonBody.body.quaternion.set(0, 0, 0, 1);
    this.cannonBody.body.initQuaternion.set(0, 0, 0, 1);
    this.cannonBody.body.previousQuaternion.set(0, 0, 0, 1);
    this.cannonBody.body.interpolatedQuaternion.set(0, 0, 0, 1);

    // Projectile object can be dragged again:
    this.projectileController.isDragEnabled = true;

    // Enable check ball position again
    this.isOutOfRange = false;
  }

  getNewPosition(): Vec3 {
    const newX = MathUtils.randFloat(this.minInitPosition.x, this.maxInitPosition.x);
    const newY = MathUtils.randFloat(this.minInitPosition.y, this.maxInitPosition.y);
    const newZ = MathUtils.randFloat(this.minInitPosition.z, this.maxInitPosition.z);

    return new Vec3(newX, newY, newZ);
  }

  update() {

    if (this.isOutOfBoundaries() && !this.isOutOfRange) {

      this.isOutOfRange = true;

      setTimeout(() => {
        this.resetPosition();
      }, 1000);

    }

  }
}

RE.registerComponent(BasketballController);
