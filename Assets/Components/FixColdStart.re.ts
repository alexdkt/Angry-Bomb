import * as RE from 'rogue-engine';

export default class FixColdStart extends RE.Component {

  /*
  Sometimes, especially in Firefox, if RogueCannon starts before the scene (or viceversa, I'm not really sure) 
  the CannonBodies won't initialize correctly and the objects won't be displayed on the screen.
  I don't like to use a timeout but I haven't figured out the event to wait for to initialize everything.
  */

  awake() {
    RE.Runtime.pause();
  }

  start() {
    setTimeout(() => {
      RE.Runtime.play(RE.Runtime.scene);
    }, 1000);
  }

}

RE.registerComponent(FixColdStart);
