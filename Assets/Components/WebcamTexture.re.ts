import * as RE from 'rogue-engine';
import { LinearFilter, RGBFormat, MeshLambertMaterial, Mesh, VideoTexture, RepeatWrapping, Vector2 } from 'three';
import WebcamController from './WebcamController.re';

const { Prop } = RE;

export default class WebcamTexture extends RE.Component {

  @Prop("Vector2") offset: Vector2 = new Vector2(0,0); // Offset for webcam texture

  private repeat: Vector2 = new Vector2(0.25, 0.33); // 0.25 = 4 horizontal blocks, 0.33 = 3 vertical blocks
  private webcamController: WebcamController;

  awake() {
    this.webcamController = RE.getComponent(WebcamController) as WebcamController;
  }

  start() {
    // We have to wait for the webcam stream to use its texture
    this.webcamController.onWebcamReady(() => {
      this.setWebcamTexture();
    });

  }

  setWebcamTexture() {
  
    const video = document.getElementById('video') as HTMLVideoElement;

    const texture = new VideoTexture(video);

    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.repeat = this.repeat;
    texture.center = this.offset;
    texture.format = RGBFormat;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    const parameters = { color: 0xffffff, map: texture };
    const material_base = new MeshLambertMaterial(parameters);

    if (this.object3d instanceof Mesh) { // We avoid errors with Type Assertions getting object.material
      this.object3d.material = material_base;
    }
  }

  update() {

  }
}

RE.registerComponent(WebcamTexture);
