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

export class WoodenFermenter extends Entity {
  constructor() {
    super({});      
    this.type = 'brewing equipment';

    this.hasObstacle = true;
    this.width = gridSize * 2;
    this.height = gridSize * 2;
   
    this.hasOverlay = true;
    this.overlaySpriteFrame = 0;    
    this.baseSpriteFrame = 2;     
        
  }
  
  addSkin() {
    this.body = new Sprite({
      position: new Vector2(0, -32), // offset x, y    
      resource: resources.images.woodenFermentationVesselTileset,
      frameSize: new Vector2(64, 96),
      hFrames: 2,
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
        resource: resources.images.woodenFermentationVesselTileset,
        frameSize: new Vector2(64, 96),
        hFrames: 2,
        vFrames: 2,
        spacing: 0,
        frame: this.overlaySpriteFrame,
      }))
      this.overlayPlane.addChild(this.overlayObject)
    }         
    
  }
  
  setProperties(objectData) {
    this.facingDirection = objectData.properties[0].value;
   
    if (this.facingDirection === 'UP') {
      this.overlaySpriteFrame = 1;
      this.baseSpriteFrame = 3;
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