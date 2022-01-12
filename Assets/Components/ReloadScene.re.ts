import * as RE from 'rogue-engine';
import DeviceUtils from './Static/DeviceUtils';

export default class ReloadScene extends RE.Component {

  private reloadBtn: HTMLElement;
  
  start () {
    this.reloadBtn = document.getElementById('labelReload') as HTMLVideoElement;

    this.reloadBtn.addEventListener(DeviceUtils.getClickEventName(), function(){
      RE.App.loadScene(0);
    })
  }
  
}

RE.registerComponent(ReloadScene);
