import * as RE from 'rogue-engine';

export default class WebcamController extends RE.Component {

  // Callback
  private onWebcamReadyCb: (() => void)[] = [];

  awake() {
    this.initUI();
  }

  async initUI() {

    const htmlPath = RE.getStaticPath("ui.html");

    RE.Runtime.uiContainer.innerHTML = await (await fetch(htmlPath)).text();

    // Only when the UI is loaded, and there is a video html tag, we load the camera:
    this.setupWebcamTexture();

  }

  setupWebcamTexture() {

    const video = document.getElementById('video') as HTMLVideoElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.play();
        this.runEnabledCallbacks();
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
