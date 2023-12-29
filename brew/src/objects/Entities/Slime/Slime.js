// Slime.js
import { resources } from "../../../Resource.js";
import { GameObject } from "../../../GameObject.js";
import { Vector2 } from "../../../Vector2.js";
import { Sprite } from "../../../Sprite.js";
import { gridSize } from "../../../helpers/grid.js";
import { Animations } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import {DOWN, LEFT, RIGHT, UP} from "../../../Input.js";

import { generateUniqueId } from "../../../helpers/nextId.js";
import {moveTowards} from "../../../helpers/moveTowards.js";
import {events} from "../../../Events.js";
import {isSpaceFree} from "../../../helpers/grid.js";
import { colliders } from "../../../../main.js";

import {
  IDLE,
  SHIELD,
} from "./slimeAnimations.js";

export class Slime extends GameObject {
  constructor(x, y, tileData) {
    super({
      position: new Vector2(x, y),
    });
    this.shieldImage = null;
    this.shieldTime = 0;
    this.body = new Sprite({
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
   
    // Default Facing
    this.facingDirection = IDLE;
    // Movement 
    
    
    this.currentWorld = 'world';
    
    this.destinationPosition = this.position.duplicate();

     // Collision tile
    this.entityId = null;
    this.colliderPosition = null;
    this.colliderPositionLast = null;

    this.isAlive = true;   
    this.isMoving = true;

    events.on("COLLISION_DETECTED", this, collision => {
      if (collision.owner === this.entityId && collision.entity === 'katana') {
        this.onEnergyShield();
        this.isAlive = false;
      };
    });    
  }
  ready() {
    this.entityId = `slime-${generateUniqueId()}`;
    
    colliders.addCollider(Math.floor(this.position.x), Math.floor(this.position.y), this.currentWorld, this.entityId );
    console.log('slime spawned');
  }
  deSpawn() {
    colliders.removeCollider( this.colliderPositionLast.x, this.colliderPositionLast.y, this.currentWorld, this.entityId );
    
    colliders.removeCollider( this.colliderPosition.x, this.colliderPosition.y, this.currentWorld, this.entityId );
    this.destroy();
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
    // Try move 

    const distance = moveTowards(this, this.destinationPosition, .4)
    const hasArrived = distance < .3;
    if (hasArrived) {
      // Collision tile
      if (this.isMoving) {
        this.isMoving = false;
        if (this.colliderPositionLast) {
          colliders.removeCollider( this.colliderPositionLast.x, this.colliderPositionLast.y, this.currentWorld, this.entityId );   
        }
      }      
      this.tryMove(delta)
    }    
  } 
  // Try Move
  tryMove(delta) {
   
    // Create a movement sequence array
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
      
      let nextX = this.destinationPosition.x;
      let nextY = this.destinationPosition.y;    
      
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
      
      if (isSpaceFree(nextX, nextY, this.currentWorld, this.entityId).collisionDetected === false) {
        this.destinationPosition.x = nextX;
        this.destinationPosition.y = nextY;
        
        // Collision tile
        this.isMoving = true;
        this.colliderPositionLast = new Vector2(Math.round(this.position.x), Math.round(this.position.y));
        
        this.colliderPosition = new Vector2(Math.round(nextX), Math.round(nextY)); 
        colliders.addCollider( this.colliderPosition.x, this.colliderPosition.y, this.currentWorld, this.entityId );                 
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
    this.shieldTime = 100; // ms
    
    this.shieldImage = new GameObject({});
    this.shieldImage.addChild(new Sprite({
      frameSize: new Vector2(32, 32),
      scale: 1.1,
      resource: resources.images.energyShield,
      position: new Vector2(-10, -9)
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