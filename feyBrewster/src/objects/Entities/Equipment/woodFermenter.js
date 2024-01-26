import { resources } from "../../../Resource.js";
import { GameObject } from "../../../GameObject.js";
import { Vector2 } from "../../../Vector2.js";
import { Sprite } from "../../../Sprite.js";
import { gridSize } from "../../../helpers/grid.js";
import { Animations } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";

import { generateUniqueId } from "../../../helpers/nextId.js";
import { events } from "../../../Events.js";
import { obstacles } from "../../../helpers/grid.js";

export class WoodFermenter extends GameObject {
  constructor(x, y, world, chunkId) {
    super({
      position: new Vector2(x, y),
    });
    this.body = new Sprite({
      position: new Vector2(0, 0), // offset x, y    
      resource: resources.images.woodFermenter,
      frameSize: new Vector2(64, 96),
      hFrames: 1,
      vFrames: 1,
      spacing: 0,
    });
    this.addChild(this.body);
       
    this.currentWorld = world;

     // Collision tile
    this.entityId = null;
    this.colliderPosition = null;
    this.isMoving = false;
    this.type = 'entity';
    this.chunkId = chunkId;
  }
  
  ready() {
    this.entityId = `woodFermenter-${generateUniqueId()}`;
    this.colliderPosition = this.position.duplicate();
    this.place();
  }
 
  step(delta, root) { 
    // ...
  }
  
  despawn() {
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].owner === this) {
        obstacles.splice(i, 1); 
      }
    }
    this.destroy();
  } 

  place() {
    obstacles.push({ 
      id: `${this.colliderPosition.x},${this.colliderPosition.y},${this.currentWorld}`, 
      owner: this, 
      width: this.width, 
      height: this.height 
    });    
  }  
}