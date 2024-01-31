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
    this.currentWorld = world;      
    this.chunkId = chunkId;    
    this.objectData = objectData;    
    
    this.type = 'entity';
    this.entityId = null;

    this.isAlive = true;   
    this.invisible = false;
    this.respawnDelay = 10000;
    
    this.hasCollision = true;
    this.width = 32;
    this.height = 32;
    
    this.speed = 1;
    this.mass = 100;
    
    this.radius = 16;
    this.center = new Vector2(this.position.x + gridSize / 2, this.position.y + gridSize / 2);
   
    this.destinationPosition = this.position.duplicate();
    
    this.maxHealth = 100;
    this.currentHealth = 100
    this.attackPower = 10; 
    
    this.awarenessField = 5;
    this.sensingRadius = this.awarenessField * gridSize;
    
    this.facingDirection = IDLE;    
    
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

  distanceSquared(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  }
  
  normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: vector.x / length,
      y: vector.y / length
    };
  }

  lineSegmentIntersection(x1, y1, dx1, dy1, x2, y2, dx2, dy2) {
    const denominator = (dy2 * dx1) - (dx2 * dy1);
    if (denominator === 0) {   
      return null; 
    }

    const t = ((x2 - x1) * dy2 + (y1 - y2) * dx2) / denominator;
    const u = ((x2 - x1) * dy1 + (y1 - y2) * dx1) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const intersectionX = Math.round(x1 + (t * dx1));
      const intersectionY = Math.round(y1 + (t * dy1));
      
      return { x: intersectionX, y: intersectionY };
    
    } else {
      return null; 
    }
  }  

  raycast(startX, startY, endX, endY) {   
    let closestHit;   
    
    const dX = endX - startX;
    const dY = endY - startY;

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
  
  calculateForce(target) {
    const distance = this.distanceTo(target)
    const desiredDistance = (gridSize * 2) / 3; // Desired distance from player
    const forceMagnitude = Math.abs(distance - desiredDistance); // Scaled by distance difference
    const directionVector = {
      x: target.x - this.position.x,
      y: target.y - this.position.y,
    };

    // Normalize direction vector (magnitude = 1)
    const magnitude = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
    directionVector.x /= magnitude;
    directionVector.y /= magnitude;

    // Determine attraction/repulsion based on distance
    const repulsionForce = directionVector;
    const attractionForce = {
      x: -repulsionForce.x,
      y: -repulsionForce.y,
    };

    if (distance < desiredDistance) {
      return attractionForce; // Apply attraction if closer than desired distance
    } else {
      return repulsionForce; // Apply repulsion if further than desired distance
    }
  }
  
  calculateRepulsionForce(other) {
    const dx = Math.ceil(this.center.x - other.center.x);
    const dy = Math.ceil(this.center.y - other.center.y);
    
    const distance = Math.sqrt(dx * dx + dy * dy).toFixed(2);
    
    if (Math.sqrt(dx * dx + dy * dy) < .001) {
      const randomAngle = Math.random() * 2 * Math.PI;
      
      return {
        x: Math.cos(randomAngle) * 32,
        y: Math.sin(randomAngle) * 32
      };
    }

    const penetrationDepth = Math.min(this.radius + other.radius - distance, 1);    
    
    const collisionVectorNormalized = {
      x: dx / distance,
      y: dy / distance
    }
   
    const relativeSpeed = Math.sqrt(this.speed * other.speed);    
    const linearForce = Math.min(penetrationDepth * 6, 10);   
    const forceCurve = Math.pow(penetrationDepth, .8) * 20;
    const logarithmicForce = Math.log(penetrationDepth + 1) * 30;
    
    const forceCap = this.mass;
    
    return {
      x: Math.max(Math.min(collisionVectorNormalized.x * linearForce * logarithmicForce * forceCurve * relativeSpeed, forceCap), -forceCap).toFixed(2),
      y: Math.max(Math.min(collisionVectorNormalized.y * linearForce * logarithmicForce * forceCurve * relativeSpeed, forceCap), -forceCap).toFixed(2)
    };      
  }
  
  distanceTo(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance;
  } 
  
  overlaps(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius + other.radius;
  }
   
  onCollision(repulsionForce) {
    
    const newPosition = {
      x: Math.floor(this.position.x + repulsionForce.x / this.mass),
      y: Math.floor(this.position.y + repulsionForce.y / this.mass)
    };
    
    const raycastHit = this.raycast(this.position.x, this.position.y, newPosition.x, newPosition.y);
    visualizeRaycast(this.center.x, this.center.y, newPosition.x + gridSize / 2, newPosition.y + gridSize / 2, raycastHit, this);

    if (raycastHit) {
      this.position = new Vector2(Math.floor(raycastHit.x), Math.floor(raycastHit.y));
      this.destinationPosition = this.position.duplicate();   
      this.updateHitboxCenter();
    }
    
    if (!raycastHit && isSpaceFree(newPosition.x, newPosition.y, this).collisionDetected === false) {
      this.position = new Vector2(newPosition.x, newPosition.y);
      this.destinationPosition = this.position.duplicate();
      this.updateHitboxCenter();
    }
  }
  
  collisionReaction(other) {    
    if (other.type === 'player') {
      other.slow(750, 0.3);
      this.body.frame = 3; 
      this.subtractHealth(2);
      this.onEnergyShield();
    }        
  }
  
  checkCollisions(entities) {
    if (entities.length <= 1) {
      return false
    };

    let collisionDetected = false;

    for (let i = entities.length - 1; i >= 0; i--) {
      const other = entities[i];

      if (this.overlaps(other) && this !== other) {
        this.onCollision(this.calculateRepulsionForce(other));
        
        if (!collisionDetected) {
          collisionDetected = true
        };
      }
    }
    return collisionDetected;
  }
  
  findNearbyPlayer(entities) {
    return entities.find(object => object.type === 'player');
  }
 
  findEntitiesWithinRadius(entities, referenceObject, radius) {
    return entities.filter(object => {
      const distance = Math.sqrt(
        Math.pow(object.position.x - referenceObject.position.x, 2) +
        Math.pow(object.position.y - referenceObject.position.y, 2)
      );
      return distance <= radius;
    });
  }  
   
  updateHitboxCenter() {
    this.center = new Vector2(Math.floor(this.position.x + gridSize / 2), Math.floor(this.position.y + gridSize / 2));
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
  
  respawn(delay) {
    setTimeout(() => {

      this.currentHealth = this.maxHealth; // Assuming you have a health property

      this.spawn();
    }, this.respawnDelay);        
  }
  
  spawn() {
    this.isAlive = true;
    this.invisible = false;    
    
    if (this.hasCollision) {
      movingObjects.push(this);
    }     

  }
  
  despawn() {
    
    for (let i = movingObjects.length - 1; i >= 0; i--) { 
      if (movingObjects[i] === this) {
        movingObjects.splice(i, 1); 
      }
    }
    this.isAlive = false;
    this.invisible = true;
    
    const delay = this.respawnDelay;
    
    if (delay > 0) {
      this.respawn(delay);
      
    }
  }
  
  subtractHealth(integer) {
    this.currentHealth -= integer;
    
    console.log(this.currentHealth)
    
    if (this.currentHealth <= 0 && this.isAlive) {
      this.despawn();
    }
  }
  
  ready() {
    this.entityId = `slime-${generateUniqueId()}`;
    
    if (this.objectData.properties) {
      this.setProperties();      
    }
    
    this.spawn();
   
  }    
  
  avoid(nearbyEntities, nearbyPlayer) {
    const distanceToPlayer = this.distanceTo(nearbyPlayer);
    const targetArcDistance = (Math.random() * 3 + 1) * gridSize;
    
    const numNearby = nearbyEntities.length;
    const angleOffset = (Math.PI * 2) / numNearby * nearbyEntities.indexOf(this);
    
    const angleToPlayer = Math.atan2(nearbyPlayer.position.y - this.position.y, nearbyPlayer.position.x - this.position.x); // Angle relative to nearbyPlayer

    let targetAngle = angleToPlayer + angleOffset + Math.PI;
    targetAngle = Math.max(-Math.PI, Math.min(Math.PI, targetAngle));
    
    const attractionForce = {
      x: Math.cos(targetAngle) * (targetArcDistance - distanceToPlayer) * 0.01, // Lower magnitude for subtle movement
      y: Math.sin(targetAngle) * (targetArcDistance - distanceToPlayer) * 0.01,
    };

    const thresholdDistance = 5 * gridSize;
    
    if (distanceToPlayer < thresholdDistance) {
      attractionForce.x *= 0.3; 
      attractionForce.y *= 0.3;
    }

    const newPosition = {
      x: Math.floor(this.position.x + attractionForce.x),
      y: Math.floor(this.position.y + attractionForce.y)
    };
    
    if (isSpaceFree(newPosition.x, newPosition.y, this).collisionDetected === false) {
      this.destinationPosition.x = newPosition.x;
      this.destinationPosition.y = newPosition.y;    
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
    this.facingDirection = currentStepData.direction ?? this.facingDirection; 
  }   
    
  step(delta, root) { 
    if (!this.isAlive) {return};
    
    if (this.shieldTime > 0) {
      this.workOnEnergyShield(delta);
      return;
    }
       
    const nearbyEntities = this.findEntitiesWithinRadius(movingObjects, this, this.sensingRadius);    
    const nearbyPlayer = this.findNearbyPlayer(movingObjects);
    
    const distanceToPlayer = this.distanceTo(nearbyPlayer);
  
    if (distanceToPlayer <= this.sensingRadius) {
      this.avoid(nearbyEntities, nearbyPlayer);
      this.body.frame = 2;    
    }
    
    const distance = moveTowards(this, this.destinationPosition, this.speed);    
    
    this.updateHitboxCenter();
    
    const collisionTest = this.checkCollisions(movingObjects);
    
    if (collisionTest) {
      
    }
    
    const hasArrived = distance < 1;
    
    if (hasArrived) {      
      this.tryMove(delta)
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
}