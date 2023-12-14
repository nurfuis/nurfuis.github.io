// Oat.js
import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {Sprite} from "../../Sprite.js";
import {resources} from "../../Resource.js";
import {events} from "../../Events.js";


export class Oat extends GameObject {
  constructor(x,y) {
    super({
      position: new Vector2(x,y)
    });
    const sprite = new Sprite({
      resource: resources.images.oat,      
      position: new Vector2(0, 0),
      scale: .3,
    })
    this.addChild(sprite);
    
    
  }
  
  ready() {
    // console.log("Oat IS READY")
    events.on("PLAYER_POSITION", this, pos => {
      // console.log("PLAYER POSITION")
      const roundedPlayerX = Math.round(pos.x);
      const roundedPlayerY = Math.round(pos.y);
      if (roundedPlayerX === this.position.x && roundedPlayerY === this.position.y) {
        this.onCollideWithPlayer();
      }
    })      
  }
  
  
  onCollideWithPlayer() {
    // remove from scene
    this.destroy();
    // alert Oat being picked up
    events.emit("PLAYER_PICKS_UP_ITEM", {
      image: resources.images.oat,
      position: this.position,
    })
  }
  
  
}