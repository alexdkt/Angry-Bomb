import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Vec3 } from 'cannon-es';
import * as RE from 'rogue-engine';

const { Prop } = RE;

export default class Explodable extends RE.Component {

  // External dependencies
  @Prop("Boolean") enableMassWhenExplodes: Boolean = true;

  // Private variables  
  private cannonBody: CannonBody;
  private _mass: number;

  // Static variables
  static layerCollision: number = 3;
  static explodables: Explodable[] = [];

  awake() {
    this.cannonBody = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    // Not related to an explodable object, but when mass is applied to an object on start sometimes it bounces weirdly.
    // We cancel the mass and apply it with a timeout, it is not very nice, but it works for testing.
    // TODO: I guess we should have to wait for a Cannon or scene "OnReady-like" event to do this.
    this._mass = this.cannonBody.mass;
    this.cannonBody.mass = 0;
  }

  start() {

    // Add this component in explodables array. Later (in static addForce method) we can iterate the static array to react to the explosion
    Explodable.explodables.push(this);
    
    if (!this.enableMassWhenExplodes) {
      setTimeout(() => {
        this.enableMass();
      }, 2500);
    }
  }

  enableMass() {
    this.cannonBody.mass = this._mass;
  }

  addForce(vector: Vec3, force: number) {

    // Get the direction of the projection from vector force
    const impulseDirection = this.cannonBody.body.position.vsub(vector);
    // Get the impulse force taking into account the distance from explosion
    const distanceFromForceVector = this.cannonBody.body.position.distanceTo(vector);
    // The greater the (square of) distance, the smaller the reaction
    const scaleImpulse = 1 / (distanceFromForceVector * distanceFromForceVector);
    // Scale impulseDirection
    const vImpulse = impulseDirection.scale(scaleImpulse).scale(force);

    this.enableMassWhenExplodes && this.enableMass();

    this.cannonBody.body.applyForce(vImpulse);
  }

  static addForce = (vector: Vec3, force: number) => {

    for (let i = 0, l = Explodable.explodables.length; i < l; i++) {
      Explodable.explodables[i].addForce(vector, force);
    }
  };

}

RE.registerComponent(Explodable);
