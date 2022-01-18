/*
 * CameraController.re
 * Manage the camera movement
 */

import * as RE from 'rogue-engine';
import { MathUtils, Object3D } from 'three';
const { Prop } = RE;

export default class CameraController extends RE.Component {

  // Public component fields
  @Prop("Object3D") target: Object3D;
  @Prop("Number") offset: number = 1;
  @Prop("Number") smooth: number = 0.1;
  @Prop("Number") limitZ: number = 1;
  @Prop("Number") maxCameraX: number = 1.6;
  @Prop("Number") minCameraX: number = 0.16;


  update() {

    if (this.target) {

      const newX = this.target.position.x + this.offset;  // Add an offset to the target position
      const smoothX = MathUtils.lerp(this.target.position.x, newX, this.smooth); // Smooth Lerp movement
      const clampedX = MathUtils.clamp(smoothX, this.minCameraX, this.maxCameraX); // Clamp movement
      this.object3d.position.x = clampedX; // Set new Z pos

    }

  }
}

RE.registerComponent(CameraController);
