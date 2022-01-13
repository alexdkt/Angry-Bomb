import * as RE from 'rogue-engine';
import DeviceUtils from './Static/DeviceUtils';
import UiManager from './UiManager.re';

const { Prop } = RE;

export default class ReloadScene extends RE.Component {

  @Prop("Number") indexScene: number = 0;

  private reloadBtn: HTMLElement;
  
  start () {

    const uiManager = RE.getComponent(UiManager) as UiManager;

    // On Firefox we have to wait for the UI to be loaded to be able to access the video tag
    uiManager.onUILoaded(()=> {
      
      this.reloadBtn = document.getElementById('reload-button') as HTMLVideoElement;
  
      this.reloadBtn.addEventListener(DeviceUtils.getClickEventName(), () => {
        RE.App.loadScene(this.indexScene);
      })
    })
 
  }
  
}

RE.registerComponent(ReloadScene);
