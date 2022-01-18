import * as RE from 'rogue-engine';
import DeviceUtils from './Static/DeviceUtils';
import UiManager from './UiManager.re';

export default class SceneManager extends RE.Component {

  private reloadBtn: HTMLElement;
  private nextSceneBtn: HTMLElement;

  start() {

    const uiManager = RE.getComponent(UiManager) as UiManager;

    // On Firefox we have to wait for the UI to be loaded to be able to access the video tag
    uiManager.onUILoaded(() => {

      this.reloadBtn = document.getElementById('reload-button') as HTMLVideoElement;

      this.reloadBtn.addEventListener(DeviceUtils.getClickEventName(), () => {

        // Get index of current scene so scene name is always empty
        const indexScene = RE.App.scenes.map(function (e) { return e.uuid; }).indexOf(RE.App.currentScene.uuid);
        RE.App.loadScene(indexScene);
      })


      this.nextSceneBtn = document.getElementById('next-button') as HTMLVideoElement;

      this.nextSceneBtn.addEventListener(DeviceUtils.getClickEventName(), () => {

        // Get index of current scene so scene name is always empty
        const indexScene = RE.App.scenes.map(function (e) { return e.uuid; }).indexOf(RE.App.currentScene.uuid);

        const newSceneIndex = (indexScene < RE.App.scenes.length - 1) ? indexScene + 1 : 0;
        RE.App.loadScene(newSceneIndex);
      })
    })

  }
}

RE.registerComponent(SceneManager);
