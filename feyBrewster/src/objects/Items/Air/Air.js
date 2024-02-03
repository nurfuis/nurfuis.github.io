import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {Sprite} from "../../../Sprite.js";
import {resources} from "../../../Resource.js";
import {events} from "../../../Events.js";


export class Air extends GameObject {
  constructor() {
    super({});
    const sprite = new Sprite({
      resource: resources.images.air,      
      position: new Vector2(0, 0),
      frameSize: new Vector2(32, 32),
      frame: 0
    })
    this.addChild(sprite);  
  }
}