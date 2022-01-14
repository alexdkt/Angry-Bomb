import * as RE from 'rogue-engine';
import UiManager from './UiManager.re';

const { Prop } = RE;

export default class WebcamController extends RE.Component {

  // External dependencies
  @Prop("String") videoFallback: string = "";

  // Callback
  private onWebcamReadyCb: (() => void)[] = [];


  awake() {
    const uiManager = RE.getComponent(UiManager) as UiManager;
    // On Firefox we have to wait for the UI to be loaded to be able to access the video tag
    uiManager.onUILoaded(() => {
      this.setupWebcamTexture();
    })

  }

  setupWebcamTexture() {

    const video = document.getElementById('video') as HTMLVideoElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => { // If camera is OK:
        video.srcObject = stream;
        // Video is loaded and can be played
        video.addEventListener('loadeddata', () => {
          this.runEnabledCallbacks();
        }, false);
        video.play();

      }).catch((err) => { // If camera is not present, show video stream

        if (this.videoFallback != "") {
          video.src = this.videoFallback;
          video.crossOrigin = "anonymous";
          video.load();
          // Video is loaded and can be played
          video.addEventListener('loadeddata', () => {
            this.runEnabledCallbacks();
          }, false);
          video.play();
        }
      });
    }


  }

  onWebcamReady(callback: () => void) {
    this.onWebcamReadyCb.push(callback);
  }

  private runEnabledCallbacks() {
    for (const callback of this.onWebcamReadyCb) {
      callback();
    }
  }
}

RE.registerComponent(WebcamController);
