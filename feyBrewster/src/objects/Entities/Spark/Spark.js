// Spark.js
import { resources } from "../../../Resource.js";
import { GameObject } from "../../../GameObject.js";
import { Vector2 } from "../../../Vector2.js";
import { Sprite } from "../../../Sprite.js";
import { gridSize } from "../../../helpers/grid.js";
import { Animations } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import { DOWN, LEFT, RIGHT, UP } from "../../../Input.js";

import { generateUniqueId } from "../../../helpers/nextId.js";
import { moveTowards } from "../../../helpers/moveTowards.js";
import { events } from "../../../Events.js";
import { isSpaceFree } from "../../../helpers/grid.js";
import {obstacles} from "../../../helpers/grid.js";

import {
  IDLE,
  SHIELD,
} from "./sparkAnimations.js";

export class Spark extends GameObject {
  constructor(x, y, world, chunkId) {
    super({
      position: new Vector2(x, y),
    });
    this.shieldImage = null;
    this.shieldTime = 0;
    this.body = new Sprite({
      position: new Vector2(-8, -10), // offset x, y    
      resource: resources.images.spark,
      frameSize: new Vector2(32, 32),
      hFrames: 2,
      vFrames: 2,
      spacing: 0,
      animations: new Animations({
        idle: new FrameIndexPattern(IDLE),
        shield: new FrameIndexPattern(SHIELD),
        
      }),      
    })
    this.body.animations.play('idle');
    this.addChild(this.body);
   
    this.facingDirection = IDLE;
    
    this.currentWorld = world;
    this.destinationPosition = this.position.duplicate();

     // Collision tile
    this.entityId = null;
    
    this.hasCollision = true;
    this.width = 32;
    this.height = 32;   


    this.isAlive = true; 
    
    this.type = 'entity';
    this.chunkId = chunkId;
  }
  ready() {
    this.entityId = `spark-${generateUniqueId()}`;
    if (this.hasCollision) {
            obstacles.push(this);        
          }    
      }
  despawn() {
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].owner === this) {
        obstacles.splice(i, 1); 
      }
    }
  }     
  step(delta, root) { 
    if (this.isAlive === false) {
      this.deSpawn();
      return;
    };
    
    if (this.shieldTime > 0) {
      this.workOnEnergyShield(delta);
      return;
    }
    
    if (!this.parent) {
      console.log(this.parent);
    }
    
    const distance = moveTowards(this, this.destinationPosition, .9);
    const hasArrived = distance < 1;

    if (hasArrived) {
 
      this.tryMove(delta)
    }    
  } 
  tryMove(delta) { 
    const sequence = [
      { direction: LEFT, steps: 2 },
      { direction: LEFT, steps: 2 },      
      { direction: LEFT, steps: 2 }, 
      { direction: DOWN, steps: 2 },
      { direction: DOWN, steps: 2 },
      { direction: DOWN, steps: 2 },      
      { direction: RIGHT, steps: 2 },
      { direction: RIGHT, steps: 2 },
      { direction: RIGHT, steps: 2 },     
      { direction: UP, steps: 2 },
      { direction: UP, steps: 2 },
      { direction: UP, steps: 2 },   
    ];
    // Check if the sequence has finished
    if (this.currentStep === undefined || this.currentStep >= sequence.length) {
      this.currentStep = 0; // Reset sequence on completion
    }
    // Get the current movement data from the sequence
    const currentStepData = sequence[this.currentStep];
    // Handle movement based on the data
    if (currentStepData.direction) {  
      const input = currentStepData;      
      
      // grid snapping
      let multiplierX = Math.floor(this.destinationPosition.x / gridSize); 
      let multiplierY = Math.floor(this.destinationPosition.y / gridSize);
      
      let nextX = multiplierX * gridSize;
      let nextY = multiplierY * gridSize;    
      
      if (input.direction == DOWN) {
        nextY += gridSize;
        this.body.animations.play("idle") 
      }
      if (input.direction == UP) {
        nextY -= gridSize;
        this.body.animations.play("idle")
      }  
      if (input.direction == LEFT) {
        nextX -= gridSize;
        this.body.animations.play("idle")  
      }
      if (input.direction == RIGHT) {
        nextX += gridSize;
        this.body.animations.play("idle")    
      }
      
      this.currentStep++;     
      
      if (isSpaceFree(nextX, nextY, this).collisionDetected === false) {
        this.destinationPosition.x = nextX;
        this.destinationPosition.y = nextY;       
      }
    }
    // Update facing direction   
    this.facingDirection = currentStepData.direction ?? this.facingDirection; 
  }   
  onEnergyShield() {
    // start animation 
    if (this.shieldTime > 0) {
      return;
    }
    this.shieldTime = 500; // ms
    
    this.shieldImage = new GameObject({});
    this.shieldImage.addChild(new Sprite({
      frameSize: new Vector2(32, 32),
      scale: 1.1,
      resource: resources.images.energyShield,
      position: new Vector2(-10, -18)
    }))
    this.addChild(this.shieldImage) 
  }
  workOnEnergyShield(delta) {
    this.shieldTime -= delta;
    this.body.animations.play("shield");
    
    if (this.shieldTime <= 0) {
      this.shieldImage.destroy();
      this.body.animations.play('idle');

    }
  }
}