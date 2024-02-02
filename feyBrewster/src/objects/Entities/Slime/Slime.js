import { Entity } from "../../../Entity.js";
import { resources } from "../../../Resource.js";
import { events } from "../../../Events.js";
import { GameObject } from "../../../GameObject.js";
import { Vector2 } from "../../../Vector2.js";
import { Sprite } from "../../../Sprite.js";
import { Animations } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import { DOWN, LEFT, RIGHT, UP } from "../../../Input.js";

import { gridSize } from "../../../helpers/grid.js";
import { isSpaceFree } from "../../../helpers/grid.js";


import {
  IDLE,
  SHIELD,
} from "./slimeAnimations.js";

export class Slime extends Entity {
  constructor(chunkId, objectData) {
    super({
    });    
    this.chunkId = chunkId;    
    this.objectData = objectData;    

    this.isAlive = false;   
    this.invisible = true;
    this.respawnDelay = 10000;
    
    this.type = 'entity';
   
    this.hasCollision = true;
    this.width = 32;
    this.height = 32;    
    this.radius = 16; 

    this.mass = 100;      
    this.baseSpeed = 1;
    this.speed = this.baseSpeed;
    this.facingDirection = DOWN;    
    
    this.maxHealth = 100;
    this.currentHealth = 100
    
    this.attackPower = 10; 
    
    this.awarenessField = 5;
    this.sensingRadius = this.awarenessField * gridSize;
    this.inAvoidState = false;   
    
    this.shieldImage = null;
    this.shieldTime = 0;     
    
    this.body = new Sprite({
      position: new Vector2(0, -4), // offset x, y
      
      resource: resources.images.slime,
      frameSize: new Vector2(32, 32),
      hFrames: 2,
      vFrames: 2,
      scale: 1,
      spacing: 0,
      animations: new Animations({
        idle: new FrameIndexPattern(IDLE),
        shield: new FrameIndexPattern(SHIELD),
        
      }),      
    })   
    this.addChild(this.body);
    
  }
  setProperties() {
    for (let i = 0; i < this.objectData.properties.length; i++) {
      const property = this.objectData.properties[i];
      switch(property.name){
        case "mass":
          this.mass = property.value;
          break;
        
        case "maxHealth":
          this.maxHealth = property.value;
          break;
        
        case "attackPower":
          this.attackPower = property.value;
          break; 
      }       
    }
  }
  
  reflexAction(other) {    
    if (other.type === 'player') {
      other.slow(750, 0.3);
      this.body.frame = 3; 
    }        
  }
  
  onEnergyShield() {
    if (this.shieldTime > 0) {
      return;
    }
    
    this.shieldTime = 500; // ms
    
    this.shieldImage = new GameObject({});
    
    this.shieldImage.addChild(new Sprite({
      frameSize: new Vector2(32, 32),
      scale: 2,
      resource: resources.images.energyShield,
      position: new Vector2(-16, -16)
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
  
  tryMove(delta) { 
    const sequence = [
      { direction: LEFT, steps: 2 },  
      { direction: RIGHT, steps: 2 },
      { direction: UP, steps: 2 },
      { direction: DOWN, steps: 2 },    
    ];
    if (this.currentStep === undefined || this.currentStep >= sequence.length) {
      this.currentStep = 0;
    }
    const currentStepData = sequence[this.currentStep];
    if (currentStepData.direction) {  
      const input = currentStepData;      
      
      let snapToGridX = this.destinationPosition.x % gridSize < gridSize / 2
        ? Math.floor(this.destinationPosition.x / gridSize)
        : Math.ceil(this.destinationPosition.x / gridSize);

      let snapToGridY = this.destinationPosition.y % gridSize < gridSize / 2
        ? Math.floor(this.destinationPosition.y / gridSize)
        : Math.ceil(this.destinationPosition.y / gridSize);
      
      let nextX = snapToGridX * gridSize;
      let nextY = snapToGridY * gridSize;    
      
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
    this.facingDirection = currentStepData.direction ?? this.facingDirection; 
  }   
    
  step(delta, root) {
    if (!this.isAlive) { return; }

    if (this.shieldTime > 0) {
      this.workOnEnergyShield(delta);
      return;
    }

    const nearbyEntities = this.findEntitiesWithinRadius(this, this.sensingRadius);
    let anyNearbyAvoiding = false;
    for (const entity of nearbyEntities) {
      if (entity.inAvoidState) {
        anyNearbyAvoiding = true;
        break;
      }
    }   
    const nearbyPlayer = this.findNearbyPlayer();
    const distanceToPlayer = this.distanceTo(nearbyPlayer);

    if (distanceToPlayer <= this.sensingRadius) {
      this.inAvoidState = true;
      this.avoid(nearbyEntities, nearbyPlayer);
      this.body.frame = 2;
    } else if (nearbyEntities.length > 0 && anyNearbyAvoiding) {
      this.avoidNearbyEntities(nearbyEntities);
      this.body.frame = 2;
      this.inAvoidState = false;
     
    } else {
      this.inAvoidState = false;
    }

    const distance = this.moveTowards(this, this.destinationPosition, this.speed);

    const collisionTest = this.runDynamicCollisionCheck();

    const hasArrived = distance < 1;

    if (hasArrived && !this.inAvoidState) {
      this.tryMove(delta);
    }
  }
  
  ready() { 
    if (this.objectData.properties) {
      this.setProperties();      
    }    
  }    

}