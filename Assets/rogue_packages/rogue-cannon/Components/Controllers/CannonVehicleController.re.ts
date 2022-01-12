import * as RE from 'rogue-engine';
import CannonRaycastVehicle from '../Objects/CannonRaycastVehicle.re';

export default class CannonVehicleController extends RE.Component {
  @RE.Prop("Number") maxForce = 200;
  @RE.Prop("Number") reverseForce = 50;
  @RE.Prop("Number") breakForce = 250;
  @RE.Prop("Number") maxSteering = 0.5;

  raycastVehicle: CannonRaycastVehicle;

  start() {
    this.raycastVehicle = RE.getComponentByName("CannonRaycastVehicle", this.object3d) as CannonRaycastVehicle;
  }

  update() {
    if (!(this.raycastVehicle instanceof CannonRaycastVehicle)) return;

    // Acceleration

    if (RE.Input.keyboard.getKeyPressed("KeyW")) {
      this.releaseBreaks();
      this.raycastVehicle.vehicle.applyEngineForce(this.maxForce, 2);
      this.raycastVehicle.vehicle.applyEngineForce(this.maxForce, 3);
    }

    if (RE.Input.keyboard.getKeyPressed("KeyS")) {
      const speed = -this.raycastVehicle.vehicle.currentVehicleSpeedKmHour;

      if (speed <= 0 ) {
        this.releaseBreaks();
        this.raycastVehicle.vehicle.applyEngineForce(-this.reverseForce, 2);
        this.raycastVehicle.vehicle.applyEngineForce(-this.reverseForce, 3);
      }

      else if (speed > 0.05) {
        // this.releaseBreaks();
        this.raycastVehicle.vehicle.applyEngineForce(-this.maxForce, 2);
        this.raycastVehicle.vehicle.applyEngineForce(-this.maxForce, 3);
        // this.break();
      }

      // else if (speed > 0.1) {
      //   this.break();
      // }
    }

    if (RE.Input.keyboard.getKeyUp("KeyW")) {
      this.raycastVehicle.vehicle.applyEngineForce(0, 2);
      this.raycastVehicle.vehicle.applyEngineForce(0, 3);
    }

    if (RE.Input.keyboard.getKeyUp("KeyS")) {
      const speed = Math.abs(this.raycastVehicle.vehicle.currentVehicleSpeedKmHour);

      this.raycastVehicle.vehicle.applyEngineForce(0, 2);
      this.raycastVehicle.vehicle.applyEngineForce(0, 3);

      if (speed < 1) {
        this.break();
      }
      else {
        this.releaseBreaks();
      }
    }

    // Steering

    if (RE.Input.keyboard.getKeyPressed("KeyA")) {
      this.raycastVehicle.vehicle.setSteeringValue(this.maxSteering, 0);
      this.raycastVehicle.vehicle.setSteeringValue(this.maxSteering, 1);
    }

    if (RE.Input.keyboard.getKeyPressed("KeyD")) {
      this.raycastVehicle.vehicle.setSteeringValue(-this.maxSteering, 0);
      this.raycastVehicle.vehicle.setSteeringValue(-this.maxSteering, 1);
    }

    if (RE.Input.keyboard.getKeyUp("KeyA")) {
      this.raycastVehicle.vehicle.setSteeringValue(0, 0);
      this.raycastVehicle.vehicle.setSteeringValue(0, 1);
    }

    if (RE.Input.keyboard.getKeyUp("KeyD")) {
      this.raycastVehicle.vehicle.setSteeringValue(0, 0);
      this.raycastVehicle.vehicle.setSteeringValue(0, 1);
    }
  }

  break() {
    this.raycastVehicle.vehicle.setBrake(this.breakForce, 0);
    this.raycastVehicle.vehicle.setBrake(this.breakForce, 1);
    this.raycastVehicle.vehicle.setBrake(this.breakForce, 2);
    this.raycastVehicle.vehicle.setBrake(this.breakForce, 3);
  }

  releaseBreaks() {
    this.raycastVehicle.vehicle.setBrake(0, 0);
    this.raycastVehicle.vehicle.setBrake(0, 1);
    this.raycastVehicle.vehicle.setBrake(0, 2);
    this.raycastVehicle.vehicle.setBrake(0, 3);
  }
}

RE.registerComponent(CannonVehicleController);
