// KatanaSwingLeft.js
import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {Sprite} from "../../../Sprite.js";
import {resources} from "../../../Resource.js";
import {events} from "../../../Events.js";
import {Animations} from "../../../Animations.js";
import {FrameIndexPattern} from "../../../FrameIndexPattern.js";

import {
  SWING_RIGHT,
} from "./attackAnimations.js";

export class KatanaSwingRight extends GameObject {
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
        swingRight: new FrameIndexPattern(SWING_RIGHT),       
      }), 
    })
    this.addChild(sprite);
  }
  
  ready() {
     
  }
}