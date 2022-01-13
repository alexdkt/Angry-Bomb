import * as RE from 'rogue-engine';

export default class UiManager extends RE.Component {

  private onUILoadedCallbacks: (() => void)[] = [];

  awake() {
    this.initUI();
  }

  async initUI() {

    const htmlPath = RE.getStaticPath("ui.html");
    
    RE.Runtime.uiContainer.innerHTML = await (await fetch(htmlPath)).text();
    
    this.runOnUILoadedCallbacks();
  }

  start() {

  }

  onUILoaded(callback: () => void) {
    this.onUILoadedCallbacks.push(callback);
  }

  private runOnUILoadedCallbacks() {
    for (const callback of this.onUILoadedCallbacks) {
      callback();
    }
  }
}

RE.registerComponent(UiManager);
