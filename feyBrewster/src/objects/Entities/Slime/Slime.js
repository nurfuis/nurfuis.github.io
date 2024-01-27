// Slime.js
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
import { obstacles } from "../../../helpers/grid.js";
import { movingObjects } from "../../../helpers/collisionDetection.js";
import { checkCollisions } from "../../../helpers/collisionDetection.js";

import {
  IDLE,
  SHIELD,
} from "./slimeAnimations.js";

export class Slime extends GameObject {
  constructor(x, y, world, chunkId) {
    super({
      position: new Vector2(x, y),
    });
    this.shieldImage = null;
    this.shieldTime = 0;
    
    this.body = new Sprite({
      position: new Vector2(8, 8), // offset x, y
      
      resource: resources.images.slime,
      frameSize: new Vector2(16, 16),
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
    
    this.hitBox = new Sprite({
      resource: resources.images.FeyBrewsterTileSet,
      frameSize: new Vector2(32,32),
      position: new Vector2(0, 0),
      frameSize: new Vector2(gridSize,gridSize),
      hFrames: 16,
      vFrames: 16,
      frame: 47,
      
    })
    this.addChild(this.hitBox);  
    
    this.facingDirection = IDLE;
    
    this.currentWorld = world;
    this.destinationPosition = this.position.duplicate();

    this.entityId = null;

    this.hasCollision = true;
    this.width = 32;
    this.height = 32;
    
    this.radius = 16;
    this.center = new Vector2(this.position.x + gridSize / 2, this.position.y + gridSize / 2);
    
    this.isAlive = true;   

    this.type = 'entity';
    this.chunkId = chunkId;
  }
  onCollision(repulsionForce) {
    this.position = new Vector2(
      Math.round(this.position.x + repulsionForce.x), 
      Math.round(this.position.y + repulsionForce.y)
      );

    // this.destinationPosition = this.position.duplicate();
  }  
  overlaps(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius + other.radius;
  }
  
  distanceTo(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  }
  
  ready() {
    this.entityId = `slime-${generateUniqueId()}`;
    
    // events.on("PLAYER_POSITION", this, pos => {
      // const playerCenter = pos.center
      // const playerRadius = pos.radius
      
      // const dx = this.center.x.toFixed(2) - playerCenter.x.toFixed(2);
      // const dy = this.center.y.toFixed(2) - playerCenter.y.toFixed(2);
    
      // const distance = Math.sqrt(dx * dx + dy * dy);
      // console.log(distance.toFixed(2));
      
    // })
    
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

    const distance = moveTowards(this, this.destinationPosition, .5);
    this.center = new Vector2(this.position.x + gridSize / 2, this.position.y + gridSize / 2);    
    
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
      scale: 1,
      resource: resources.images.energyShield,
      position: new Vector2(8, 8)
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