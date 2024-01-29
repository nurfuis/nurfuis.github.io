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
import { visualizeRaycast } from "../../../../main.js";

import {
  IDLE,
  SHIELD,
} from "./slimeAnimations.js";

export class Slime extends GameObject {
  constructor(x, y, world, chunkId, objectData) {
    super({
      position: new Vector2(x, y),
    });
    this.objectData = objectData;
    
    this.shieldImage = null;
    this.shieldTime = 0;
    
    this.body = new Sprite({
      position: new Vector2(0, -4), // offset x, y
      
      resource: resources.images.slime,
      frameSize: new Vector2(16, 16),
      hFrames: 2,
      vFrames: 2,
      scale: 2,
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
    // this.addChild(this.hitBox);  
    
    this.facingDirection = IDLE;
    
    this.currentWorld = world;
    this.destinationPosition = this.position.duplicate();

    this.entityId = null;

    this.hasCollision = true;
    this.width = 32;
    this.height = 32;
    this.speed = 1;
    this.friction = .1;    
    
    
    this.radius = 16;
    this.center = new Vector2(this.position.x + gridSize / 2, this.position.y + gridSize / 2);
    this.mass = 100;
    
    this.maxHealth = null;
    this.attackPower = null;
    
    this.isAlive = true;   

    this.type = 'entity';
    this.chunkId = chunkId;
  }
  distanceSquared(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  }  
  
  lineSegmentIntersection(x1, y1, dx1, dy1, x2, y2, dx2, dy2) {
    // console.log(dy2, dx1, dx2, dy1)
    const denominator = (dy2 * dx1) - (dx2 * dy1);
    // console.log(this.entityId,denominator)
    if (denominator === 0) {
      return null; // No intersection
    }

    const t = ((x2 - x1) * dy2 + (y1 - y2) * dx2) / denominator;
    const u = ((x2 - x1) * dy1 + (y1 - y2) * dx1) / denominator;
    // console.log(this.entityId, t.toFixed(2), u.toFixed(2))

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const intersectionX = Math.round(x1 + (t * dx1));
      const intersectionY = Math.round(y1 + (t * dy1));
      console.log(this.entityId, { x: intersectionX, y: intersectionY })
      return { x: intersectionX, y: intersectionY };
    } else {
      return null; // No intersection within segments
    }
  }  

  raycast(startX, startY, endX, endY) {
    // console.log(this.entityId, startX, startY, endX, endY)
    
    let closestHit;   
    
    const dX = Math.round(endX - startX);
    const dY = Math.round(endY - startY);
    // console.log(this.entityId, dX, dY)

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      const obstacleX1 = obstacle.minX();
      const obstacleY1 = obstacle.minY();
      const obstacleX2 = obstacle.maxX();
      const obstacleY2 = obstacle.maxY();
      const intersection = this.lineSegmentIntersection(startX, startY, dX, dY, obstacleX1, obstacleY1, obstacleX2, obstacleY2);

      if (intersection && (!closestHit || this.distanceSquared(startX, startY, intersection.x, intersection.y) < this.distanceSquared(startX, startY, closestHit.x, closestHit.y))) {
        closestHit = intersection;
      }
    }
    return closestHit;
  } 
  
  minX() {
    return this.position.x;
  }
  minY () {
    return this.position.y;
  }
  maxX() {
    return this.position.x + this.width;
  }
  maxY() {
    return this.position.y + this.height;
  }
  
  distanceTo(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  }
  
  calculateRepulsionForce(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
  
    const distance = Math.sqrt(dx * dx + dy * dy);
    const penetrationDepth = this.radius + other.radius - distance;    
    
    const collisionVectorNormalized = {
      x: dx / distance,
      y: dy / distance
    }
    
    const forceMultiplier = penetrationDepth * (this.speed + other.speed)    
    
    return {
      x: collisionVectorNormalized.x * forceMultiplier * other.mass * (1 - this.friction),
      y: collisionVectorNormalized.y * forceMultiplier * other.mass * (1 - this.friction)
    }    
  }
  
  onCollision(repulsionForce) {
    const pushedX = Math.round(this.position.x + repulsionForce.x / this.mass);
    const pushedY = Math.round(this.position.y + repulsionForce.y / this.mass);

    // Raycast to check for collisions along the push path
    const raycastHit = this.raycast(this.position.x, this.position.y, pushedX, pushedY);
    visualizeRaycast(this.position.x, this.position.y, pushedX, pushedX, raycastHit, this);

    if (raycastHit) {
      // Collision detected, move to the collision point instead
      // console.log(this.entityId, raycastHit.x, raycastHit.y)
      // this.position.x = Math.round(raycastHit.x);
      // this.position.y = Math.round(raycastHit.y);
      this.destinationPosition = this.position.duplicate();   
      // this.updateHitboxCenter();
    } else {
      // No collision, move to the pushed coordinates
      if (isSpaceFree(pushedX, pushedY, this).collisionDetected === false) {
        this.position.x = pushedX;
        this.position.y = pushedY;
        console.log(this.entityId,pushedX,pushedY)
        this.destinationPosition = this.position.duplicate();
        // console.log(this.entityId, this.destinationPosition)
        this.updateHitboxCenter();
      }
    }
  }
  
  overlaps(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius + other.radius;
  }
  
  checkCollisions(otherObjects) {
    if (otherObjects.length <= 1) { return };
    
    for (let i = otherObjects.length -1; i >= 0; i-- ) {
      const other = otherObjects[i];
      
      if (this.overlaps(other) && this != other) {
        this.onCollision(this.calculateRepulsionForce(other))
      }       
    }   
  }
  
  updateHitboxCenter() {
    this.center.x = Math.round(this.position.x + gridSize / 2); 
    this.center.y = Math.round(this.position.y + gridSize / 2);       
  } 
  
  setPosition(x, y, world) {
    this.position = new Vector2(x, y);
    this.destinationPosition = this.position.duplicate();
    this.currentWorld = world;
  };
  
  setProperties(){
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
  
  ready() {
    this.entityId = `slime-${generateUniqueId()}`;
    if (this.objectData.properties) {
      this.setProperties();      
    }
    if (this.hasCollision) {
      movingObjects.push(this);
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

    const distance = moveTowards(this, this.destinationPosition, this.speed);    
    this.updateHitboxCenter();
    this.checkCollisions(movingObjects);    
    
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
      let multiplierX = this.destinationPosition.x % gridSize < gridSize / 2
        ? Math.floor(this.destinationPosition.x / gridSize)
        : Math.ceil(this.destinationPosition.x / gridSize);

      let multiplierY = this.destinationPosition.y % gridSize < gridSize / 2
        ? Math.floor(this.destinationPosition.y / gridSize)
        : Math.ceil(this.destinationPosition.y / gridSize);
      
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