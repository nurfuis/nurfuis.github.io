import { GameObject } from "./GameObject.js";
import {events} from "./Events.js";

import { Vector2 } from "./Vector2.js";
import { DOWN, LEFT, RIGHT, UP } from "./Input.js";


import { generateUniqueId } from "./helpers/nextId.js";
import { gridSize } from "./helpers/grid.js";
import { movingObjects } from "./helpers/collisionDetection.js";
import { obstacles } from "./helpers/grid.js";
import { isSpaceFree } from "./helpers/grid.js";

const rays = [];
const playerColor = '#ffffff';
const entityColor = '#007bff';

export class Entity extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });
    this.originWorld = null;
    this.currentWorld = null;
    this.originPosition = this.position.duplicate();
    this.destinationPosition = this.position.duplicate();    
    
    this.isAlive = false;   
    this.invisible = true;       
    this.respawnDelay = 0;
      
    this.type = 'entity';
    this.entityId = null;    
    
    this.hasCollision = false;
    this.width = 32;
    this.height = 32;    
    this.radius = 16;
    this.center = new Vector2(this.position.x + this.width / 2, this.position.y + this.height / 2);     
    
    this.mass = 1;
    this.baseSpeed = 1;
    this.speed = this.baseSpeed;    
    this.facingDirection = DOWN;    
    
    this.maxHealth = 1;
    this.currentHealth = 1;
    
    this.attackPower = 1;    

    this.awarenessField = 1;
    this.sensingRadius = this.awarenessField * gridSize;

  }
  
  attackAction (other) {
    // ..
    
  }

  avoid(nearbyEntities, nearbyPlayer) {
    const distanceToPlayer = this.distanceTo(nearbyPlayer);
    const targetArcDistance = (Math.random() * 1 + 2) * gridSize;
    
    const numNearby = nearbyEntities.length;
    const angleOffset = (Math.PI * 2) / numNearby * nearbyEntities.indexOf(this);
    
    const angleToPlayer = Math.atan2(nearbyPlayer.position.y - this.position.y, nearbyPlayer.position.x - this.position.x); // Angle relative to nearbyPlayer

    const randomOffset = Math.random() * Math.PI / 4;;
    let targetAngle = angleToPlayer + angleOffset + randomOffset;
    
    const attractionForce = {
      x: Math.cos(targetAngle) * (targetArcDistance - distanceToPlayer) * 0.5, // Lower magnitude for subtle movement
      y: Math.sin(targetAngle) * (targetArcDistance - distanceToPlayer) * 0.5,
    };

    const thresholdDistance = this.sensingRadius / 2;
    
    if (distanceToPlayer < thresholdDistance) {
      attractionForce.x *= 0.5; 
      attractionForce.y *= 0.5;
    }

    const newPosition = {
      x: Math.floor(this.position.x + attractionForce.x),
      y: Math.floor(this.position.y + attractionForce.y)
    };
    // const raycastHitA = this.raycast(this.position.x, this.position.y, newPosition.x, newPosition.y);
    // this.visualizeRaycast( this.position.x, 
                      // this.position.y, 
                      // newPosition.x, 
                      // newPosition.y, 
                      // raycastHitA, 
                      // this);
    // const raycastHitB = this.raycast(this.center.x, this.center.y, newPosition.x, newPosition.y);
    // this.visualizeRaycast( this.center.x, 
                      // this.center.y, 
                      // newPosition.x - this.radius, 
                      // newPosition.y - this.radius, 
                      // raycastHitB, 
                      // this); 
    // const raycastHitC = this.raycast(this.position.x + this.width, this.position.y + this.height, newPosition.x, newPosition.y);
    // this.visualizeRaycast( this.position.x + this.width, 
                      // this.position.y + this.height, 
                      // newPosition.x, 
                      // newPosition.y, 
                      // raycastHitC, 
                      // this); 

    // const raycastHitF = this.targetRaycast(this.position.x, this.position.y, newPosition.x, newPosition.y);
                
                      
    if (isSpaceFree(newPosition.x, newPosition.y, this).collisionDetected === false) {
      this.destinationPosition.x = newPosition.x;
      this.destinationPosition.y = newPosition.y;    
    }
  }
  
  avoidNearbyEntities(nearbyEntities) {
    const numNearby = nearbyEntities.length;

    const averagePosition = {
      x: 0,
      y: 0,
    };
    const numAvoiding = nearbyEntities.filter(entity => entity.inAvoidState).length;
    for (const entity of nearbyEntities) {
      if (entity.inAvoidState) {
        averagePosition.x += entity.position.x;
        averagePosition.y += entity.position.y;
      }
    }
    averagePosition.x /= numAvoiding;
    averagePosition.y /= numAvoiding;

    const angleToAverage = Math.atan2(
      averagePosition.y - this.position.y,
      averagePosition.x - this.position.x
    );

    const randomOffset = Math.random() * Math.PI / 4;
    const targetAngle = angleToAverage + randomOffset;

    const targetDistance = (Math.random() * 2 + 2) * gridSize;

    const attractionForce = {
      x: Math.cos(targetAngle) * targetDistance * 0.5,
      y: Math.sin(targetAngle) * targetDistance * 0.5,
    };
    const thresholdDistance = this.sensingRadius / 2;
    
    if (targetDistance < thresholdDistance) {
      attractionForce.x *= 0.5; 
      attractionForce.y *= 0.5;
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
  
  calculateRepulsionForce(other) {
    const dx = Math.ceil(this.center.x - other.center.x);
    const dy = Math.ceil(this.center.y - other.center.y);
    const distance = Math.sqrt(dx * dx + dy * dy).toFixed(2);    
    
    if (distance < .001) {
      const randomAngle = Math.random() * 2 * Math.PI;
      
      return {
        x: Math.cos(randomAngle) * 32,
        y: Math.sin(randomAngle) * 32
      };
    }

    const penetrationDepth = this.radius + other.radius - distance;    

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
    }       
  }
  
  returnOverlappingEntities() { // used to run custom collision behavior
    let overlappingEntities = [];
    
    if (movingObjects.length <= 1) {return overlappingEntities};

    for (let i = movingObjects.length - 1; i >= 0; i--) {
      const other = movingObjects[i];

      if (this.overlaps(other) && this !== other) {
          overlappingEntities.push(other);        
      }
    }
    return overlappingEntities;
  }
  
  runDynamicCollisionCheck() { // execute some default collision events
    
    if (movingObjects.length <= 1) {return false};

    let collisionDetected = false;

    for (let i = movingObjects.length - 1; i >= 0; i--) {
      const other = movingObjects[i];

      if (this.overlaps(other) && this !== other) {
        
        this.onCollision(this.calculateRepulsionForce(other));
        
        // other.reflexAction(this);
        
        if (!collisionDetected) {collisionDetected = true};
      }
    }

    return collisionDetected;
  }  
  
  runStaticCollisionCheck() { // execute some default collision events
    let collisionDetected = false;
    
    if (obstacles.length <= 0) {return collisionDetected};

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const other = obstacles[i];

      if (this.overlaps(other) && this !== other) {
        
        this.onCollision(this.calculateRepulsionForce(other));
        
        // other.reflexAction(this);
        
        if (!collisionDetected) {collisionDetected = true};
      }
    }

    return collisionDetected;
  }   
  
  despawn() {
    if (!this.isAlive) {
      console.log('cannot despawn entity', this.entityId);
      return;
    }
    
    if (this.hasCollision) {  
      for (let i = movingObjects.length - 1; i >= 0; i--) { 
        
        if (movingObjects[i] === this) {
          movingObjects.splice(i, 1);
          break;
        }
      }
    }
    
    this.isAlive = false;
    
    this.invisible = true;
    
    const delay = this.respawnDelay;
    
    if (delay > 0) {
      this.respawn(delay);
      
    } else {
      this.destroy();      
    }
  }
    
  distanceSquared(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  }
  
  distanceTo(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance;
  } 
   
  findNearbyPlayer() {
    return movingObjects.find(object => object.type === 'player');
  }
 
  findEntitiesWithinRadius(referenceObject, radius) {
    return movingObjects.filter(object => {
      const distance = Math.sqrt(
        Math.pow(object.position.x - referenceObject.position.x, 2) +
        Math.pow(object.position.y - referenceObject.position.y, 2)
      );
      return distance <= radius;
    });
  }  
  
  joinWorld(x, y, world, plane) {
    this.entityId = `${this.type}-${generateUniqueId()}`;
    this.setOriginPosition(x, y, world);
    this.setPosition(x, y, world);
    this.setDestinationPosition(x, y, world);
    this.updateHitboxCenter();
    plane.addChild(this);
    
    console.log(this.entityId + " has joined at " + this.position.x + "," + this.position.y + "," + this.currentWorld);
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
  
  maxX() {
    return this.position.x + this.width;
  }
  
  maxY() {
    return this.position.y + this.height;
  }
   
  minX() {
    return this.position.x;
  }
  
  minY () {
    return this.position.y;
  }
  
  moveTowards(entity, destinationPosition, speed) {
    let distanceToTravelX = destinationPosition.x - entity.position.x;
    let distanceToTravelY = destinationPosition.y - entity.position.y;
    
    let distance = Math.sqrt(distanceToTravelX**2 + distanceToTravelY**2);

    if (distance <= speed) {
      entity.position.x = destinationPosition.x;
      entity.position.y = destinationPosition.y;
    } else {
    let normalizedX = distanceToTravelX / distance;
    let normalizedY = distanceToTravelY / distance;
    
    entity.position.x += normalizedX * speed;
    entity.position.y += normalizedY * speed;
    
    distanceToTravelX = destinationPosition.x - entity.position.x;
    distanceToTravelY = destinationPosition.y - entity.position.y;
    distance = Math.sqrt(distanceToTravelX**2 + distanceToTravelY**2);
    }
    entity.updateHitboxCenter();
    
    return distance;	
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
  
  onCollision(repulsionForce) {  
    const newPosition = {
      x: Math.floor(this.position.x + repulsionForce.x / this.mass),
      y: Math.floor(this.position.y + repulsionForce.y / this.mass)
    };
    
    const raycastHit = this.raycast(this.position.x, this.position.y, newPosition.x, newPosition.y);
    this.visualizeRaycast(this.center.x, this.center.y, newPosition.x + gridSize / 2, newPosition.y + gridSize / 2, raycastHit, this);

    if (raycastHit) {
      this.setPosition(Math.floor(raycastHit.x), Math.floor(raycastHit.y), this.currentWorld);      
      this.setDestinationPosition(Math.floor(raycastHit.x), Math.floor(raycastHit.y), this.currentWorld);   
      this.updateHitboxCenter();
    }
    
    if (!raycastHit && isSpaceFree(newPosition.x, newPosition.y, this).collisionDetected === false) {
      this.setPosition(newPosition.x, newPosition.y, this.currentWorld);
      this.setDestinationPosition(newPosition.x, newPosition.y, this.currentWorld);
      this.updateHitboxCenter();
    }
  }
 
  overlaps(other) {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius + other.radius;
  }
  
  // dynamicRaycast(startX, startY, endX, endY) {
    // let closestHit;   
    
    // const dX = endX - startX;
    // const dY = endY - startY;
    
    // console.log('dx',dX,'dy', dY)
    
    // for (let i = 0; i < movingObjects.length; i++) {
      // const entity = movingObjects[i];
      
      // const entityX1 = entity.minX();
      // const entityY1 = entity.minY();
      // const entityX2 = entity.maxX();
      // const entityY2 = entity.maxY();
      
      // const intersection = this.lineSegmentIntersection(startX, startY, dX, dY, entityX1, entityY1, entityX2, entityY2);
      
      // if (this.entityId != entity.entityId && intersection && (!closestHit || this.distanceSquared(startX, startY, intersection.x, intersection.y) < this.distanceSquared(startX, startY, closestHit.x, closestHit.y))) {
        // console.log(this.entityId,' at ',this.center,' hit location',intersection,entity.entityId,'was damaged at',entity.position)
        // console.log('intersection off by x:',entity.position.x - intersection.x,'intersection off by y:', entity.position.y - intersection.y)
        // entity.onEnergyShield();
        // entity.subtractHealth(1);
        // closestHit = intersection;
      // }
    // }
    // return closestHit;
  // }
  
  circleIntersection(rayStartX, rayStartY, rayDX, rayDY, circleCenterX, circleCenterY, circleRadius) {
    const a = rayDY;
    const b = -rayDX;
    const c = -a * rayStartX - b * rayStartY;

    const dx = rayStartX - circleCenterX;
    const dy = rayStartY - circleCenterY;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distanceFromCenter > this.radius * 4) {
      return null;
    }
    const discriminant = (a * circleCenterX + b * circleCenterY + c) ** 2 - (a ** 2 + b ** 2) * (circleRadius ** 2 - distanceFromCenter ** 2);

    if (discriminant < 0) {
      return null;
    }

    const t1 = (-a * circleCenterX - b * circleCenterY - c + Math.sqrt(discriminant)) / (a ** 2 + b ** 2);
    const t2 = (-a * circleCenterX - b * circleCenterY - c - Math.sqrt(discriminant)) / (a ** 2 + b ** 2);
    
    let t = null;
    if (t1 >= 0 && t1 <= 1) {
      t = t1;
    } else if (t2 >= 0 && t2 <= 1) {
      t = t2;
    }

    if (t === null) {
      return null;
    }

    const intersectionX = rayStartX + t * rayDX;
    const intersectionY = rayStartY + t * rayDY;

    return { x: intersectionX, y: intersectionY };
  }
  
  dynamicRaycast(startX, startY, endX, endY) {
    let closestHit = {collision: false, position: null, entity: null};

    const dX = endX - startX;
    const dY = endY - startY;
        
    const filteredMovingObjects = movingObjects
      .filter((entity) => entity !== this)
      .filter((entity) => {
        const facing = this.facingDirection;

        switch (facing) {
          case "UP":
            return entity.center.y < this.center.y;
          case "DOWN":
            return entity.center.y > this.center.y;
          case "LEFT":
            return entity.center.x < this.center.x;
          case "RIGHT":
            return entity.center.x > this.center.x;
          default:
            console.warn("Invalid facing direction:", facing);
            return false; 
        }
      });
    
    for (let i = 0; i < filteredMovingObjects.length; i++) {
      const entity = filteredMovingObjects[i];

      const entityCenterX = entity.center.x;
      const entityCenterY = entity.center.y;
      const entityRadius = entity.radius;

      const intersection = this.circleIntersection(
        startX,
        startY,
        dX,
        dY,
        entityCenterX,
        entityCenterY,
        entityRadius
      );

      if (
        intersection &&
        (!closestHit.collision ||
          this.distanceSquared(startX, startY, intersection.x, intersection.y) <
            this.distanceSquared(startX, startY, closestHit.x, closestHit.y))
      ) {
       
        closestHit = {collision: true, position: intersection, entity: entity};
        
      }
    }

    return closestHit;
  }
  
  targetRaycast(startX, startY, endX, endY) {   
    let targetHit = null;   
    
    const dX = endX - startX;
    const dY = endY - startY;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      
      const obstacleX1 = obstacle.minX();
      const obstacleY1 = obstacle.minY();
      const obstacleX2 = obstacle.maxX();
      const obstacleY2 = obstacle.maxY();
      
      const intersection = this.lineSegmentIntersection(startX, startY, dX, dY, obstacleX1, obstacleY1, obstacleX2, obstacleY2);

      if (intersection && (!targetHit || this.distanceSquared(startX, startY, intersection.x, intersection.y) < this.distanceSquared(startX, startY, targetHit.x, targetHit.y))) {
        targetHit = obstacle;
      }
    }
    return targetHit;
  } 
  
  raycast(startX, startY, endX, endY) {   
    let closestHit = null;   
    
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
  
  reflexAction(other) {    
    // ..
  }
   
  respawn(delay) {
    setTimeout(() => {
      this.setPosition(this.originPosition.x, this.originPosition.y, this.originWorld);
      this.setDestinationPosition(this.originPosition.x, this.originPosition.y, this.currentWorld)
      this.updateHitboxCenter();
      this.currentHealth = this.maxHealth;

      this.spawn();
    }, this.respawnDelay);        
  }  
    
  setDestinationPosition(x, y, world) {
    this.destinationPosition.x = x;
    this.destinationPosition.y = y;     
    this.currentWorld = world;        
  }
  
  setOriginPosition(x, y, world) {
    this.originPosition.x = x;
    this.originPosition.y = y;
    this.originWorld = world;
  }

  setPosition(x, y, world) {
    this.position.x = x;
    this.position.y = y;   
    this.currentWorld = world;      
  };
  
  slow(duration, amount) {
      this.speed = Math.max(0, this.speed * amount); // Apply slow effect
      setTimeout(() => {
          this.speed = this.baseSpeed; // Restore speed after duration
      }, duration);
  }     
  
  spawn() {
    if (this.isAlive) {
      console.log('cannot spawn living entity', this.entityId);
      return;
    }
    
    this.isAlive = true;      
    this.invisible = false;  
    
    if (this.hasCollision) {movingObjects.push(this)};     

  }    
  
  subtractHealth(integer) {
    this.currentHealth -= integer;
    
    if (this.currentHealth <= 0 && this.isAlive) {
      this.despawn();
    }
  }
  
  updateHitboxCenter() {
    this.center.x = Math.floor(this.position.x + this.width / 2);
    this.center.y = Math.floor(this.position.y + this.height / 2);
  }
  
  visualizeRaycast(startX, startY, endX, endY, collision, object) {
    if (!this.debug) {return};
    const ray = {
      startTime: Date.now(), // Store starting time
      startX,
      startY,
      endX,
      endY,
      collision,
      type: object.type // Store object type for color selection
    };
    rays.push(ray);
  }
  updateRays(ctx) {
    for (let i = rays.length - 1; i >= 0; i--) {
      const ray = rays[i];
      const elapsedTime = Date.now() - ray.startTime;
      const alpha = Math.max(0, 1 - elapsedTime / 2000); // Fade out over 2 seconds

      ctx.beginPath();
      ctx.moveTo(ray.startX, ray.startY);
      ctx.lineTo(ray.endX, ray.endY);
      ctx.lineWidth = 16;

      // Set color based on object type
      ctx.strokeStyle = ray.type === 'player' ? playerColor : entityColor;
      ctx.strokeStyle = `rgba(${ctx.strokeStyle.replace('#', '')}, ${alpha})`; // Apply fading alpha

      ctx.stroke();

      if (ray.collision) {
        ctx.fillStyle = ray.type === 'player' ? 'red' : 'yellow';
        ctx.beginPath();
        ctx.arc(ray.collision.x, ray.collision.y, 8, 0, Math.PI * 2, true);
        ctx.fill();
      }

      if (alpha === 0) {
        rays.splice(i, 1); // Remove fully faded rays
      }
    }
  }
  drawImage(ctx) {
    this.updateRays(ctx)   
  }
    
}