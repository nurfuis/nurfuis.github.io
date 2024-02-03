import { Entity } from "../../../Entity.js";

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

export class Barstool extends Entity {
  constructor() {
    super({});
    this.type = 'furniture';   
    this.hasObstacle = true;
    this.width = 32;
    this.height = 32;
    
    this.baseSpriteFrame = 0;     
    
  }
  addSkin() {
    this.body = new Sprite({
      position: new Vector2(0, 0), // offset x, y    
      resource: resources.images.barstool,
      frameSize: new Vector2(this.width, this.height),
      hFrames: 1,
      vFrames: 1,
      frame: this.baseSpriteFrame,
    });
    this.addChild(this.body);                     
  }       

  ready() {        
    
  }
 
  step(delta, root) { 
    // ...
  }
  
  despawn() {
    if (this.hasOverlay) { this.overlayObject.destroy(); }
    
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].owner === this) {
        obstacles.splice(i, 1); 
      }
    }
    this.destroy();
  }
 
}