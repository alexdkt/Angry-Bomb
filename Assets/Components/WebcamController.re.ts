import * as RE from 'rogue-engine';
import UiManager from './UiManager.re';

export default class WebcamController extends RE.Component {

  // Callback
  private onWebcamReadyCb: (() => void)[] = [];
  

  awake() {
    const uiManager = RE.getComponent(UiManager) as UiManager;
    // On Firefox we have to wait for the UI to be loaded to be able to access the video tag
    uiManager.onUILoaded(()=> {
      this.setupWebcamTexture();
    })
 
  }

  setupWebcamTexture() {

    const video = document.getElementById('video') as HTMLVideoElement;
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.play();

        // Release getUserMedia stream when your web page closes
        window.addEventListener("unload", function(event) {
          
          const tracks = stream.getTracks();
          tracks.forEach(function(track) {
            track.stop()
          })
          video.srcObject = null;
          stream = null as unknown as MediaStream;
        })
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
