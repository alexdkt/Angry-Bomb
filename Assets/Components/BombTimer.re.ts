import * as RE from 'rogue-engine';
import { Object3D } from 'three';

const { Prop } = RE;

export default class BombTimer extends RE.Component {

  // External dependencies
  @Prop("Object3D") timerProgress: Object3D;
  @Prop("Number") duration: number;

  // Private variables
  private endTime: number;
  private timerStarted: boolean = false;
  private onTimerEndCallbacks: (() => void)[] = [];

  awake() {
    this.object3d.visible = false;  // Bombtimer is only visible when it starts counting
  }

  startCount() {
    this.object3d.visible = true;
    this.endTime = RE.Runtime.clock.elapsedTime + this.duration;
    this.timerStarted = true;
  }

  update() {

    if (this.timerStarted) {

      const now = RE.Runtime.clock.elapsedTime;

      if (now > this.endTime) {

        this.timerStarted = false;
        this.runTimeEndCallbacks();

      } else {

        const w = (this.endTime - now) / this.duration;
        // Resize progress bar
        this.timerProgress.position.setX(-0.5 + w * 0.5);
        // Adjust the X axis of the progress bar because the horizontal scale changes from the center of sprite
        this.timerProgress.scale.setX(w);

      }

    }

  }

  // Register a new callback
  onTimerEnds(callback: () => void) {
    this.onTimerEndCallbacks.push(callback);
  }

  // Fire all calbacks registered
  private runTimeEndCallbacks() {
    for (const callback of this.onTimerEndCallbacks) {
      callback();
    }
  }
}

RE.registerComponent(BombTimer);
