// KatanaSwingUp.js
import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {Sprite} from "../../../Sprite.js";
import {resources} from "../../../Resource.js";
import {events} from "../../../Events.js";
import {Animations} from "../../../Animations.js";
import {FrameIndexPattern} from "../../../FrameIndexPattern.js";

import {
  SWING_UP,
} from "./attackAnimations.js";

export class KatanaSwingUp extends GameObject {
  constructor(x,y) {
    super({
      position: new Vector2(x,y)
    });
    const sprite = new Sprite({
      frameSize: new Vector2(48, 48),
      hFrames: 4,
      vFrames: 4,      
      scale: .9,
      resource: resources.images.katana,
      position: new Vector2(-19, -25),
      animations: new Animations({
        swingUp: new FrameIndexPattern(SWING_UP),       
      }), 
    })
    this.addChild(sprite);
  }
  
  ready() {
     
  }
}