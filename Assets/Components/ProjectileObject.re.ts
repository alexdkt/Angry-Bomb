
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Vec3 } from 'cannon-es';
import * as RE from 'rogue-engine';
import { MathUtils, Object3D, Raycaster, Vector2, Vector3 } from 'three';
import DeviceUtils from './Static/DeviceUtils';


const { Prop } = RE;

export default class ProjectileObject extends RE.Component {
  
  // External dependencies
  @Prop("Prefab") pointPrefab: RE.Prefab;
  @Prop("Number") numPoints: number = 10;
  @Prop("Number") launchForce: number = 0.05;
  @Prop("String") targetName: string = "";
  @Prop("Boolean") dragOnTouchScreen: Boolean = false;

  // Private variables
  private raycaster: Raycaster;
  private target: Vector2 = new Vector2(0, 0);
  private useTouches: Boolean = false;
  private rogueDOMrect: any;
  private inputCoordinates: Vector2 = new Vector2(0, 0);
  private startInputCoords: Vector2 = new Vector2();
  private isValidTouch: Boolean = false;
  private isTouched: Boolean = false;
  private trajectoryPoints: Object3D[] = [];
  private body: CannonBody;
  private onLaunchCB: (() => void)[] = [];
  private _mass: number = 1;

  // Public variables
  public isDragEnabled: Boolean = true;

  awake() {
    this.useTouches = DeviceUtils.isMobile();
    this.body = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this._mass = this.body.mass;

    // We remove the mass of the object as soon as we start so that it does not move until launch event
    this.setMassEnabled(false);
  }

  start() {
    // Instantiate points for trajectory path
    for (let i = 0; i < this.numPoints; i++) {
      const point = this.pointPrefab.instantiate(this.object3d);
      this.trajectoryPoints.push(point);
    }

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

  setMassEnabled(enabled: boolean) {
    this.body.mass = enabled ? this._mass : 0;
  }


  update() {

    if (!this.isDragEnabled)
      return;

    this.setInputCoordinates();

    // Is input coords touching the bomb?
    this.isValidTouch = (this.dragOnTouchScreen) ? true : this.isOverTarget(this.inputCoordinates.x, this.inputCoordinates.y);

    // Touchstart
    if (this.isValidTouch && this.isKeyPressed()) {
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
      this.isValidTouch = false;
      this.resetPoints();
      this.launch();
    }
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
    this.setMassEnabled(true);
    // Scale vector with launch force and create a Cannon Vec3
    const vec3Impulse = new Vec3(-vectorImpulse.x, vectorImpulse.y, 0).scale(this.body.mass * this.launchForce);
    // Apply bomb impulse
    this.body.body.applyImpulse(vec3Impulse);
    // Disable more draggings:
    this.isDragEnabled = false;
    // Run callbacks on launch
    this.runOnLaunchCallbacks();
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
      if (element.object.name == this.targetName) {
        isIntersecting = true;
      }
    });

    return isIntersecting;
  }

  onLaunch(callback: () => void) {
    this.onLaunchCB.push(callback);
  }

  private runOnLaunchCallbacks() {
    for (const callback of this.onLaunchCB) {
      callback();
    }
  }
}

RE.registerComponent(ProjectileObject);
