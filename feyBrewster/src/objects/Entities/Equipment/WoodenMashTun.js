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

export class WoodenMashTun extends GameObject {
  constructor(x, y, world, chunkId, overlay, objectData) {
    super({
      position: new Vector2(x, y),
    });      
    this.currentWorld = world;

    this.entityId = null;   
    this.hasCollision = true;
    this.width = gridSize * 3;
    this.height = gridSize * 1;
    
    this.overlayObject = null;
    this.hasOverlay = true;
    this.overlayPlane = overlay;
    this.overlaySpriteFrame = 0;
    
    this.body = null;
    this.baseSpriteFrame = 4;     
        
    this.type = 'brewing equipment';
  } 
  ready() {
    
    this.entityId = `woodenMashTun-${generateUniqueId()}`;
    
    if (this.hasCollision) {
      obstacles.push(this);        
    } 
    
    this.body = new Sprite({
      position: new Vector2(0, -64), // offset x, y    
      resource: resources.images.woodenmashtunTileset,
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
        position: new Vector2(0, -64), // offset x, y    
        resource: resources.images.woodenmashtunTileset,
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