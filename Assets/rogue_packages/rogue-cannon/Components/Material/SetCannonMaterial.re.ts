import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import CannonBody from '../CannonBody.re';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class SetCannonMaterial extends RE.Component {
  material: CANNON.Material;

  @RE.Prop("String") materialName: string;

  start() {
    this.setMaterial();
  }

  private getMaterial() {
    return RogueCannon.getWorld().materials.find(material => material.name === this.materialName)
  }

  private setMaterial() {
    const material = this.getMaterial();

    if (!material) return;

    this.material = material;

    const cannonBody = RE.getComponent(CannonBody, this.object3d);

    if (cannonBody) {
      cannonBody.body.shapes.forEach(shape => (shape.material = this.material));
    }
  }
}

RE.registerComponent(SetCannonMaterial);
