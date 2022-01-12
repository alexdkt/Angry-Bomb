import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import CannonBody from '../CannonBody.re';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonMaterial extends RE.Component {
  material: CANNON.Material;

  @RE.Prop("Number") friction: number;
  @RE.Prop("Number") restitution: number;

  awake() {
    this.createMaterial();
  }

  start() {
    this.setMaterial();
  }

  protected createMaterial() {
    this.material = new CANNON.Material(this.name);

    // if (this.friction < 0)
      this.material.friction = this.friction;
    // if (this.restitution < 0)
    this.material.restitution = this.restitution;

    RogueCannon.getWorld().addMaterial(this.material);
  }

  private setMaterial() {
    const cannonBody = RE.getComponent(CannonBody, this.object3d);

    if (cannonBody) {
      cannonBody.body.shapes.forEach(shape => shape.material = this.material);
    }
  }
}

RE.registerComponent(CannonMaterial);
