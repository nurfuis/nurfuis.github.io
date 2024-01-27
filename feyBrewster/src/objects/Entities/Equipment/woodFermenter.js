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
  constructor(x, y, world, chunkId, overlay) {
    super({
      position: new Vector2(x, y),
    });
    this.body = new Sprite({
      position: new Vector2(0, -32), // offset x, y    
      resource: resources.images.woodenfvTileset,
      frameSize: new Vector2(64, 96),
      hFrames: 2,
      vFrames: 2,
      spacing: 0,
      frame: 3,
    });
    this.addChild(this.body);
       
    this.currentWorld = world;

    this.entityId = null;   
    this.hasCollision = true;
    this.width = gridSize * 2;
    this.height = gridSize * 1;

    this.hasOverlay = true;
    this.overlayPlane = overlay;
    this.overlaySpriteFrame = 1;
    this.overlayObject = null;
  } 
  ready() {
    this.entityId = `woodFermenter-${generateUniqueId()}`;
    
    if (this.hasCollision) {
      obstacles.push(this);        
    }

    if (this.hasOverlay) {
      this.overlayObject = new GameObject({});
      this.overlayObject.position = this.position.duplicate();
      this.overlayObject.addChild(new Sprite({
        position: new Vector2(0, -32), // offset x, y    
        resource: resources.images.woodenfvTileset,
        frameSize: new Vector2(64, 96),
        hFrames: 2,
        vFrames: 2,
        spacing: 0,
        frame: this.overlaySpriteFrame,
      }))
      this.overlayPlane.addChild(this.overlayObject)
    }      
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