import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import * as RE from 'rogue-engine';
import { Object3D } from 'three';
import BombTimer from './BombTimer.re';
import Explodable from './Explodable.re';
import ProjectileObject from './ProjectileObject.re';



const { Prop } = RE;

export default class Bomb extends RE.Component {

  // External dependencies
  @Prop("Prefab") bombTimerPrefab: RE.Prefab;
  @Prop("Number") explosionForce: number = 100;

  // Private variables
  private bombBody: CannonBody;
  private bombTimer: Object3D;
  private bombTimerController: BombTimer;
  private projectileController: ProjectileObject;


  awake() {
    this.bombBody = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this.projectileController = RE.getComponent(ProjectileObject, this.object3d) as ProjectileObject;
  }

  start() {

    // Instantiate bomb timer
    this.bombTimer = this.bombTimerPrefab.instantiate();
    this.bombTimerController = RE.getComponent(BombTimer, this.bombTimer) as BombTimer;

    // Callback when bomb timer ends:
    this.bombTimerController.onTimerEnds(() => {
      // All objects that will react to the explosion belong to the Explodable class
      Explodable.addForce(this.bombBody.body.position, this.explosionForce);
      // Remove bomb and timer
      this.object3d.parent?.remove(this.object3d);
      this.bombTimer.parent?.remove(this.bombTimer);
    })

    // Callback when projectile in launched
    this.projectileController.onLaunch(() => {
      // Start bomb timer
      this.bombTimerController.startCount();
    })

  }

  update() {

    // Bombtimer is not a bomb's child to prevent its rotation... However, we have to synchronize the position.
    if (this.bombTimer)
      this.bombTimer.position.copy(this.object3d.position);

  }



}

RE.registerComponent(Bomb);
