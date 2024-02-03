import { Entity } from "../../../Entity.js";

import { resources } from "../../../Resource.js";
import { GameObject } from "../../../GameObject.js";
import { Vector2 } from "../../../Vector2.js";
import { Sprite } from "../../../Sprite.js";
import { gridSize } from "../../../helpers/grid.js";
import { Animations } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import {
  WOODEN_MASH_TUN_EMPTY,  
  WOODEN_MASH_TUN_MASHING,
} from "./woodenAnimations.js";
import { generateUniqueId } from "../../../helpers/nextId.js";
import { events } from "../../../Events.js";
import { obstacles } from "../../../helpers/grid.js";

export class WoodenMashTun extends Entity {
  constructor() {
    super({});      
    this.type = 'brewing equipment';

    this.hasObstacle = true;
    this.width = gridSize * 3;
    this.height = gridSize * 2;
   
    this.hasOverlay = true;
    this.overlaySpriteFrame = 0;   
    this.baseSpriteFrame = 4;     
        
  }
  addSkin() {
    this.body = new Sprite({
      position: new Vector2(0, -32), // offset x, y    
      resource: resources.images.woodenMashTunTileset,
      frameSize: new Vector2(96, 96),
      hFrames: 4,
      vFrames: 2,
      spacing: 0,
      frame: this.baseSpriteFrame,
    });
    this.addChild(this.body);
    
    if (this.hasOverlay) {
      this.overlayObject = new GameObject({});
      this.overlayObject.position = this.position.duplicate();
      this.overlayObject.addChild(new Sprite({
        position: new Vector2(0, -32), // offset x, y    
        resource: resources.images.woodenMashTunTileset,
        frameSize: new Vector2(96, 96),
        hFrames: 4,
        vFrames: 2,
        spacing: 0,
        frame: this.overlaySpriteFrame,
        animations: new Animations({
          mashTunMashing: new FrameIndexPattern(WOODEN_MASH_TUN_MASHING),
          mashTunEmpty: new FrameIndexPattern(WOODEN_MASH_TUN_EMPTY),
        })         
      }))
      this.overlayPlane.addChild(this.overlayObject)
    }     
    
  }
  
  ready() {
    // ...
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