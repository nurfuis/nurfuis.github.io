// Camera.js
import {GameObject} from "./GameObject.js";
import {events} from "./Events.js";
import {Vector2} from "./Vector2.js";


export class Camera extends GameObject {
  constructor() {
    super({});
    // listens for the "character has moved" event
    events.on("PLAYER_POSITION", this, playerPosition => {
      const personHalf = 8;  
      const canvasWidth = 384 
      const canvasHeight = 216;
      const halfWidth = -personHalf + canvasWidth / 2;
      const halfHeight = -personHalf + canvasHeight / 2;
      
      this.position = new Vector2(
        Math.floor(-playerPosition.x + halfWidth),
        Math.floor(-playerPosition.y + halfHeight)
      )
    })
  }
}