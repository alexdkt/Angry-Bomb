import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Vec3 } from 'cannon-es';
import * as RE from 'rogue-engine';
import { MathUtils, Object3D, Raycaster, Vector2, Vector3 } from 'three';
import BombTimer from './BombTimer.re';
import Explodable from './Explodable.re';
import DeviceUtils from './Static/DeviceUtils';


const { Prop } = RE;

export default class Bomb extends RE.Component {

  // External dependencies
  @Prop("Prefab") pointPrefab: RE.Prefab;
  @Prop("Prefab") bombTimerPrefab: RE.Prefab;
  @Prop("Number") numPoints: number = 10;
  @Prop("Number") launchForce: number = 0.05;
  @Prop("Number") explosionForce: number = 100;

  // Private variables
  private raycaster: Raycaster;
  private target: Vector2 = new Vector2(0, 0);
  private useTouches: Boolean = false;
  private rogueDOMrect: any;
  private inputCoordinates: Vector2 = new Vector2(0, 0);
  private startInputCoords: Vector2 = new Vector2();
  private canDrag: Boolean = false;
  private isTouched: Boolean = false;
  private trajectoryPoints: Object3D[] = [];
  private bombBody: CannonBody;
  private bombTimer: Object3D;
  private bombTimerController: BombTimer;


  awake() {
    this.useTouches = DeviceUtils.isMobile();
    this.bombBody = RE.getComponent(CannonBody, this.object3d) as CannonBody;
  }

  start() {

    // Instantiate points for trajectory path
    for (let i = 0; i < this.numPoints; i++) {
      const point = this.pointPrefab.instantiate(this.object3d);
      this.trajectoryPoints.push(point);
    }

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

    // Create raycast and rogueDomRect to detect bomb touches
    this.raycaster = new Raycaster();
    this.rogueDOMrect = RE.Runtime.rogueDOMContainer.getBoundingClientRect();

    // Update rogueDOMrect size if window size is changed
    DeviceUtils.onResizeComplete(() => { this.resizeWindowRect() });

  }

  resizeWindowRect() {
    this.rogueDOMrect = RE.Runtime.rogueDOMContainer.getBoundingClientRect();
  }

  // Manage input coordinates either desktop or mobile
  setInputCoordinates() {
    if (this.useTouches) {
      if (RE.Input.touch.touches.length > 0)
        this.inputCoordinates.set(RE.Input.touch.touches[0].x, RE.Input.touch.touches[0].y);
    }
    else {
      this.inputCoordinates.set(RE.Input.mouse.x, RE.Input.mouse.y);
    }
  }

  // Reset the points of the trajectory
  resetPoints() {
    for (let i = 0, l = this.trajectoryPoints.length; i < l; i++) {
      this.trajectoryPoints[i].position.set(0, 0, 0);
    }
  }

  isKeyPressed() {
    return (this.useTouches) ? RE.Input.touch.startTouches.length > 0 : RE.Input.mouse.isLeftButtonDown;
  }

  isKeyReleased() {
    return (this.useTouches) ? RE.Input.touch.touches.length == 0 : RE.Input.mouse.isLeftButtonUp;
  }

  update() {

    this.setInputCoordinates();

    // Is input coords touching the bomb?
    this.canDrag = this.isOverTarget(this.inputCoordinates.x, this.inputCoordinates.y);

    // Touchstart
    if (this.canDrag && this.isKeyPressed()) {
      this.isTouched = true;
      this.startInputCoords.copy(this.inputCoordinates);
    }

    // Touchmove
    if (this.isTouched) {
      this.moveTrajectory();
    }

    // Touchend
    if (this.isTouched && this.isKeyReleased()) {
      this.isTouched = false;
      this.canDrag = false;
      this.resetPoints();
      this.launch();
    }

    // Bombtimer is not a bomb's child to prevent its rotation... However, we have to synchronize the position.
    if (this.bombTimer)
      this.bombTimer.position.copy(this.object3d.position);


  }


  moveTrajectory() {

    // Calc distance and angle between bomb and touch
    const force = this.startInputCoords.distanceTo(this.inputCoordinates) * this.launchForce;
    const angle = MathUtils.radToDeg(Math.atan2(this.inputCoordinates.y - this.startInputCoords.y, this.inputCoordinates.x - this.startInputCoords.x));
    const spacing = 0.1; // Space between points

    // Calc points trjectory
    for (let i = 0, l = this.trajectoryPoints.length; i < l; i++) {
      const element = this.trajectoryPoints[i];
      const spacingElement = spacing * i;
      const x = force * Math.cos(Math.PI / 180 * angle) * spacingElement;
      const y = force * Math.sin(Math.PI / 180 * angle) * spacingElement - 0.5 * 10 * (spacingElement * spacingElement);
      const posPoint = new Vector3(-x, y, 0);
      element.position.copy(posPoint);
    }
  }


  launch() {

    // Get vector impulse
    const vectorImpulse = this.inputCoordinates.sub(this.startInputCoords);
    // Enable mass
    this.bombBody.mass = 1;
    // Scale vector with launch force and create a Cannon Vec3
    const vec3Impulse = new Vec3(-vectorImpulse.x, vectorImpulse.y, 0).scale(this.bombBody.mass * this.launchForce);
    // Apply bomb impulse
    this.bombBody.body.applyImpulse(vec3Impulse);
    // Start bomb timer
    this.bombTimerController.startCount();
  }

  isOverTarget(x: number, y: number): Boolean {
    // Calculate mouse/touch position in normalized device coordinates
    this.target.set(((x - this.rogueDOMrect.left) / this.rogueDOMrect.width) * 2 - 1, -((y - this.rogueDOMrect.top) / this.rogueDOMrect.height) * 2 + 1);

    // Valid for Ortographic Camera
    this.raycaster.setFromCamera(this.target, RE.Runtime.camera);

    // Get children intersection
    var intersects = this.raycaster.intersectObjects(RE.Runtime.scene.children);

    if (intersects.length == 0)
      return false;

    let isIntersecting = false;

    intersects.forEach(element => {
      if (element.object.name == "BombSphere") {
        isIntersecting = true;
      }
    });

    return isIntersecting;
  }



}

RE.registerComponent(Bomb);
