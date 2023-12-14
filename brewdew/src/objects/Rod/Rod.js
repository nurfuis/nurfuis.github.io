// Rod.js
import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {Sprite} from "../../Sprite.js";
import {resources} from "../../Resource.js";
import {events} from "../../Events.js";


export class Rod extends GameObject {
  constructor(x,y) {
    super({
      position: new Vector2(x,y)
    });
    const sprite = new Sprite({
      resource: resources.images.rod,      
      position: new Vector2(0, -5)
    })
    this.addChild(sprite);
    
    
  }
  
  ready() {
    // console.log("ROD IS READY")
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
    // alert rod being picked up
    events.emit("PLAYER_PICKS_UP_ITEM", {
      image: resources.images.rod,
      position: this.position,
    })
  }
  
  
}