import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import CannonBody from '../CannonBody.re';

export default class CannonSimpleCharacterController extends RE.Component {
  @RE.Prop("Number") fwdSpeed = 3;
  @RE.Prop("Number") jumpSpeed = 5;

  rigidbody: CannonBody | undefined;
  canJump = false;

  private contactNormal = new CANNON.Vec3();
  private upAxis = new CANNON.Vec3(0, 1, 0);

  private inputAngularVelocity = new CANNON.Vec3();
  private inputVelocity = new CANNON.Vec3();

  awake() {
    this.rigidbody = RE.getComponent(CannonBody, this.object3d);
    // this.stick = RE.getComponent(TouchStick, this.object3d);
    this.rigidbody?.onCollide(event => {
      event.contact.ni.negate(this.contactNormal);

      if (this.contactNormal.dot(this.upAxis) > 0.5) {
        this.canJump = true
      }
    });

    if (!this.rigidbody) return;

    this.rigidbody.body.type = CANNON.Body.DYNAMIC;
  }

  update() {
    if (!this.rigidbody) return;

    this.inputVelocity.setZero();

    if (RE.Input.keyboard.getKeyPressed("KeyW")) {
      this.inputVelocity.z = -1;
    }
    else if (RE.Input.keyboard.getKeyPressed("KeyS")) {
      this.inputVelocity.z = 1;
    }
    else {
      this.inputVelocity.z = 0;
    }
    
    if (RE.Input.keyboard.getKeyPressed("KeyA")) {
      this.inputVelocity.x = -1;
    }
    else if (RE.Input.keyboard.getKeyPressed("KeyD")) {
      this.inputVelocity.x = 1;
    }
    else {
      this.inputVelocity.x = 0;
    }

    this.inputVelocity.normalize();
    this.inputVelocity.scale(this.fwdSpeed, this.inputVelocity);

    if (this.canJump && RE.Input.keyboard.getKeyDown("Space")) {
      this.rigidbody.body.velocity.y = this.jumpSpeed;
      this.canJump = false;
    }

    this.rigidbody.body.angularVelocity.y = this.inputAngularVelocity.y;

    this.rigidbody.body.vectorToWorldFrame(this.inputVelocity, this.inputVelocity);

    if (!this.canJump) return;

    this.rigidbody.body.velocity.x = this.inputVelocity.x;
    this.rigidbody.body.velocity.z = this.inputVelocity.z;
  }
}

RE.registerComponent(CannonSimpleCharacterController);
