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

export class TwoTop extends Entity {
  constructor() {
    super({});
    this.type = 'furniture';   
    this.version = 0;
    
    this.hasObstacle = true;
    
    this.width = 32;
    this.height = 32;
   
    this.overlayObject = Sprite;
    this.hasOverlay = true;
    this.overlaySpriteFrame = 0;
    
    this.body = Sprite;
    this.baseSpriteFrame = 3;     
    
  }
  setProperties(objectData) {
    this.body = new Sprite({
      position: new Vector2(-16, -32), // offset x, y    
      resource: resources.images.twoTop,
      frameSize: new Vector2(64,64),
      hFrames: 3,
      vFrames: 2,
      spacing: 0,
      frame: this.baseSpriteFrame,
    });
    this.addChild(this.body);
    
    if (this.hasOverlay) {
      this.overlayObject = new GameObject({});
      this.overlayObject.position = this.position.duplicate();
      this.overlayObject.addChild(new Sprite({
        position: new Vector2(-16, -32), // offset x, y    
        resource: resources.images.twoTop,
        frameSize: new Vector2(64, 64),
        hFrames: 3,
        vFrames: 2,
        frame: this.overlaySpriteFrame,
      }))
      this.overlayPlane.addChild(this.overlayObject)
    }   
    
    const numProperties = objectData.properties.length;
    for (let i = 0; i < numProperties; i++) {
      const property = objectData.properties[i];
      switch(property.name){
        case "version":
          this.version = property.value;
          
          switch(property.value) {
            case "1":
              this.body.frame = 4;        
              this.overlayObject.children[0].frame = 1;
              break;
              
            case "2":
              this.body.frame = 5;      
              this.overlayObject.children[0].frame = 2;
              break;
              
            default:
              this.body.frame = 3;      
              this.overlayObject.children[0].frame = 0;              
          }                   
      }       
    }   
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