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

export class Entity extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });
           
    this.respawnDelay = 0;
      
    this.type = 'entity';
    
    this.hasCollision = false;
    this.width = 32;
    this.height = 32;    
    this.radius = 16;
    
    this.mass = 1;
    this.baseSpeed = 1;
    this.speed = this.baseSpeed;    
    this.facingDirection = DOWN;    
    
    this.maxHealth = 1;
    this.currentHealth = 1;
    
    this.attackPower = 1;    

    this.awarenessField = 1;
    this.sensingRadius = this.awarenessField * gridSize;
    
    this.debug2 = false;
    events.on("TOGGLE_DEBUG", this, () => {
      this.debug = this.debug ? false : true;
    })
    
    events.on("TOGGLE_DEBUG_2", this, () => {
      this.debug2 = this.debug2 ? false : true;
    })    
    
  }
  _validateVector2(position) {
    if (!position || !position.x || !position.y ||
        isNaN(position.x) || isNaN(position.y)
      ) {
      console.warn("Invalid position value. Setting position to origin.");
      return this.originPosition; // Set default safe position
    } else {
      return new Vector2(position.x, position.y);
    }
  }  
  
  get entityId () {
    return this._entityId;
  }
  set entityId(string) {
    this._entityId = string;
  }
  
  get chunkId () {
    return this._chunkId;
  }
  set chunkId(chunkId) {
    this._chunkId = chunkId;
  }
  
  get name () {
    return this._name;
  }
  set name(string) {
    this._name = string;
  }
  get originPosition() {
    return this._originPosition;
  }
  set originPosition(position) {
    this._originPosition = new Vector2(position.x, position.y);    
  }
  get originWorld() {
    return this._originWorld;
  }
  set originWorld(world) {
    this._originWorld = world;
  }
  
  get position() {
    return this._position;
  }
  set position(position) {
    this._position = this._validateVector2(position);    
  }
  get currentWorld() {
    return this._currentWorld;
  }
  set currentWorld(world) {
    this._currentWorld = world;
  }
  
  get destinationPosition() {
    return this._destinationPosition;
  }
  set destinationPosition(position) {
    this._destinationPosition = this._validateVector2(position);    
  }
  get destinationtWorld() {
    return this._destinationWorld;
  }
  set destinationWorld(world) {
    this._destinationWorld = world;
  }
   
  get center() {
    const x = Math.floor(this.position.x + this.width / 2);
    const y = Math.floor(this.position.y + this.height / 2);        
    return {x: x, y: y};
  }
  set center(position) {
    const x = Math.floor(position.x + this.width / 2);
    const y = Math.floor(position.y + this.height / 2);
    this._center = new Vector2(x, y);
  }
    
  get isSpawned() {
    return this._isSpawned;
  }
  set isSpawned(binary) {
    this._isSpawned = binary;
  }
  
  get invisible() {
    return this._invisible;
  }
  set invisible(binary) {
    this._invisible = binary;
  }
  
  get inactive() {
    return this._inactive;
  }
  set inactive(binary) {
    this._inactive = binary;
  }
  
  get overlayPlane () {
    return this._overlayPlane;
  }
  set overlayPlane (overlay) {
    this._overlayPlane = overlay;
  }
  
  joinWorld(x, y, world) {
    this.entityId = `${this.type}-${generateUniqueId()}`;    
   
    this.originPosition = {x:x, y:y};
    this.originWorld = world;
    
    this.position = { x: x, y: y};
    this.currentWorld = world;
    
    this.destinationPosition = { x: x, y: y };   
   
    this.debugLog(this.entityId + " has joined at "
        + this.position.x + "," + this.position.y + "," 
        + this.currentWorld
      ); 
  }  
 
  setProperties() {
    // ...
  }
  
  addSkin() {
    // ...
  }
  
  enableCollisions() {
    if (this.hasCollision) {
      movingObjects.push(this);
    }
    if (this.hasObstacle) {
      obstacles.push(this);
    }
  }

  disableCollisions() {
    if (this.hasCollision) {
      for (let i = movingObjects.length - 1; i >= 0; i--) { 
        
        if (movingObjects[i] === this) {
          movingObjects.splice(i, 1);
          break;
        }
      } 
    }
    if (this.hasObstacle) {
      for (let i = obstacles.length - 1; i >= 0; i--) { 
        
        if (movingObjects[i] === this) {
          movingObjects.splice(i, 1);
          break;
        }
      }     
    }
      
  }
  
  show() {
    this.invisible = false; 
    // this.startAnimation("idle"); 
    // this.playSound("appear"); 
  }
  
  hide() {
    this.invisible = true; 
  } 
    
  activate() {
    this.inactive = false; 
    this.enableCollisions(); 
  }  
  
  deactivate() {
    this.inactive = true;
    this.disableCollisions();
  }
   
  ko() {
    this.currentHealth = 0;    
  }  
  
  revive() {
    this.currentHealth = this.maxHealth;       
  }
   
  spawn() {
    if (this.isSpawned) {
      return;
    } else {
      this.isSpawned = true;
      this.activate();
      this.show();
    }
  }      
   
  despawn() { 
    if (!this.isSpawned) {
      return;      
    } else {
      this.isSpawned = false;
      this.deactivate();
      this.hide();
      
      const delay = this.respawnDelay;
      
      if (delay && delay > 0) {
        this.respawn(delay);
        
      } else {
        this.destroy();     
      }       
    }
  }
 
  respawn(delay) {
    setTimeout(() => {
      this.position = { x: this.originPosition.x, y: this.originPosition.y };
      this.destinationPosition = { x: this.originPosition.x,
                                   y: this.originPosition.y };
      
      this.revive();
      this.spawn();
    }, this.respawnDelay);        
  }  
    
  attackAction (entity) {
    // ..
    
  }

  equipMainhand(item) {
    
    
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
  
  onCollision(repulsionForce) {  
    const newPosition = {
      x: Math.floor(this.position.x + repulsionForce.x / this.mass),
      y: Math.floor(this.position.y + repulsionForce.y / this.mass)
    };
    
    const raycastHit = this.raycast(
                          this.position.x,
                          this.position.y, 
                          newPosition.x, 
                          newPosition.y
                        );
    this.visualizeRaycast(
                          this.center.x, 
                          this.center.y, 
                          newPosition.x + gridSize / 2, 
                          newPosition.y + gridSize / 2, 
                          raycastHit, this);

    if (raycastHit) {
      this.position = { x: Math.floor(raycastHit.x), 
                        y: Math.floor(raycastHit.y) }
      
      this.destinationPosition = { x: Math.floor(raycastHit.x),
                                   y: Math.floor(raycastHit.y) };   
      this.updateHitboxCenter();
    }
    
    if (!raycastHit && 
      isSpaceFree(newPosition.x, 
                  newPosition.y, 
                  this).collisionDetected === false) {
      this.position = { x: newPosition.x, y: newPosition.y };
      this.destinationPosition = { x: newPosition.x, y: newPosition.y };
      this.updateHitboxCenter();
    }
  }
   
  returnOverlappingEntities() {
    let overlappingEntities = [];
    
    if (movingObjects.length <= 1) {return overlappingEntities};

    for (let i = movingObjects.length - 1; i >= 0; i--) {
      const entity = movingObjects[i];

      if (this.overlaps(entity) && this !== entity) {
          overlappingEntities.push(entity);        
      }
    }
    return overlappingEntities;
  }
  
  runDynamicCollisionCheck() {
    
    if (movingObjects.length <= 1) {return false};

    let collisionDetected = false;

    for (let i = movingObjects.length - 1; i >= 0; i--) {
      const other = movingObjects[i];

      if (this.overlaps(other) && this !== other) {
        
        this.onCollision(this.calculateRepulsionForce(other));
                
        if (!collisionDetected) {collisionDetected = true};
      }
    }

    return collisionDetected;
  }  
  
  runStaticCollisionCheck() { 
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
  
  pursueNearestEntity(nearbyEntities) {
    const filteredNearbyEntities = nearbyEntities.filter(
        entity => entity !== this);
    
    const closestEntity = filteredNearbyEntities.reduce((
                            closest, entity) => {
      
      const distanceToEntity = this.distanceTo(entity);
     
     if (distanceToEntity <= this.sensingRadius &&
          (closest === undefined ||
           distanceToEntity < this.distanceTo(closest))
        ) {
        return entity;
      } else {
        return closest;
      }
    }, undefined);

    if (closestEntity) {
      this.debugLog(closestEntity)
      const angleToEntity = Math.atan2(
        closestEntity.center.y - this.center.y,
        closestEntity.center.x - this.center.x);
      
      const pursuitMagnitude = 10;
      
      const pursuitForce = {
        x: Math.cos(angleToEntity) * pursuitMagnitude,
        y: Math.sin(angleToEntity) * pursuitMagnitude,
      };

      const newPosition = {
        x: Math.floor(this.position.x + pursuitForce.x),
        y: Math.floor(this.position.y + pursuitForce.y),
      };
      //  TODO if distance is less than attack range do an attack
      
      if (isSpaceFree(
          newPosition.x,
          newPosition.y,
          this).collisionDetected === false
        ) {
        this.destinationPosition = { x: newPosition.x,
                                     y: newPosition.y };
      }
    }    
  }
  avoid(nearbyEntities, nearbyPlayer) {
    const distanceToPlayer = this.distanceTo(nearbyPlayer);
    const targetArcDistance = (Math.random() * 3 + 1) * nearbyPlayer.radius * 2;
    
    const numNearby = nearbyEntities.length;
    const angleOffset = (Math.PI * 2) / numNearby * nearbyEntities.indexOf(this);
    
    const angleToPlayer = Math.atan2(nearbyPlayer.center.y - this.center.y,
      nearbyPlayer.center.x - this.center.x);
    
    let targetAngle = angleToPlayer + angleOffset;

    const magnitude = 0.1;
    
    const attractionForce = {
      x: Math.cos(targetAngle) * (targetArcDistance - distanceToPlayer) * magnitude,
      y: Math.sin(targetAngle) * (targetArcDistance - distanceToPlayer) * magnitude,
    };

    const thresholdDistance = this.sensingRadius / 3;
    
    if (distanceToPlayer < thresholdDistance) {
      attractionForce.x *= magnitude**2; 
      attractionForce.y *= magnitude**2;
    }

    const newPosition = {
      x: Math.floor(this.position.x + attractionForce.x),
      y: Math.floor(this.position.y + attractionForce.y)
    };
    
    if (this.debug2) {
      const raycastHitA = this.raycast(
                                       this.center.x,
                                       this.center.y, 
                                       newPosition.x, 
                                       newPosition.y);
      this.visualizeRaycast( 
                        this.center.x, 
                        this.center.y, 
                        newPosition.x, 
                        newPosition.y, 
                        raycastHitA, 
                        this);
    }                
                      
    if (isSpaceFree(
                    newPosition.x,
                    newPosition.y, 
                    this).collisionDetected === false
                  ) {
      this.destinationPosition = { x:  newPosition.x, 
                                   y: newPosition.y};
    }
  }
  
  avoidNearbyEntities(nearbyEntities) {
    const numNearby = nearbyEntities.length;

    const averagePosition = {
      x: 0,
      y: 0,
    };
    
    const numAvoiding = nearbyEntities.filter(
      entity => entity.inAvoidState).length;
    
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
    
    if (isSpaceFree(
                  newPosition.x,
                  newPosition.y, 
                  this).collisionDetected === false
                ) {
      this.destinationPosition = { x: newPosition.x,
                                   y: newPosition.y };    
    } 
  }  
  
  reflexAction(entity) {    
    // ..
  }
   
  subtractHealth(integer) {
    this.currentHealth -= integer;
    
    if (this.currentHealth <= 0) {
      this.despawn();
    }
  }
  
  slow(duration, amount) {  // 0.0 - 1.0
      this.speed = Math.max(0, this.speed * amount); 
      setTimeout(() => {
          this.speed = this.baseSpeed;
      }, duration);
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
   
  calculateRepulsionForce(entity) {
    const dx = Math.ceil(this.center.x - entity.center.x);
    const dy = Math.ceil(this.center.y - entity.center.y);
    const distance = Math.sqrt(dx * dx + dy * dy).toFixed(2);    
    
    if (distance < .001) {
      const randomAngle = Math.random() * 2 * Math.PI;
      
      return {
        x: Math.cos(randomAngle) * 32,
        y: Math.sin(randomAngle) * 32
      };
    }

    const penetrationDepth = this.radius + entity.radius - distance;    

    const collisionVectorNormalized = {
      x: dx / distance,
      y: dy / distance
    }
   
    const relativeSpeed = Math.sqrt(this.speed * entity.speed);    
    const linearForce = Math.min(penetrationDepth * 6, 10);   
    const forceCurve = Math.pow(penetrationDepth, .8) * 20;
    const logarithmicForce = Math.log(penetrationDepth + 1) * 30;
    
    const forceCap = this.mass;
    
    return {
      x: Math.max(
         Math.min(
         collisionVectorNormalized.x 
         * linearForce 
         * relativeSpeed,
         forceCap),
         -forceCap).toFixed(2),
      y: Math.max(
         Math.min(
         collisionVectorNormalized.y 
         * linearForce 
         * relativeSpeed,
         forceCap),
         -forceCap).toFixed(2)
    }       
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

  overlaps(entity) {
    const dx = this.center.x - entity.center.x;
    const dy = this.center.y - entity.center.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius + entity.radius;
  }
   
  distanceSquared(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  }
  
  distanceTo(entity) {
    const dx = this.center.x - entity.center.x;
    const dy = this.center.y - entity.center.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance;
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
  
  circleIntersection(rayStartX,
                     rayStartY,
                     rayDX,
                     rayDY,
                     circleCenterX,
                     circleCenterY,
                     circleRadius
                   ) {
    const a = rayDY;
    const b = -rayDX;
    const c = -a * rayStartX - b * rayStartY;

    const dx = rayStartX - circleCenterX;
    const dy = rayStartY - circleCenterY;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distanceFromCenter > this.radius * 4) {
      return null;
    }
    const discriminant = (a * circleCenterX + 
                          b * circleCenterY + c) ** 2 
                          - (a ** 2 + b ** 2) 
                          * (circleRadius ** 2 
                          - distanceFromCenter ** 2);

    if (discriminant < 0) {
      return null;
    }

    const t1 = (-a * circleCenterX 
                - b * circleCenterY - c 
                + Math.sqrt(discriminant)) / (a ** 2 + b ** 2);
    const t2 = (-a * circleCenterX 
               - b * circleCenterY - c 
               - Math.sqrt(discriminant)) / (a ** 2 + b ** 2);
    
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
        
  dynamicRaycastBox(startX, startY, endX, endY) {
    let closestHit;   
    
    const dX = endX - startX;
    const dY = endY - startY;
        
    for (let i = 0; i < movingObjects.length; i++) {
      const entity = movingObjects[i];
      
      const entityX1 = entity.minX();
      const entityY1 = entity.minY();
      const entityX2 = entity.maxX();
      const entityY2 = entity.maxY();
      
      const intersection = this.lineSegmentIntersection(
                                startX, 
                                startY, 
                                dX, 
                                dY,   
                                entityX1, 
                                entityY1, 
                                entityX2, 
                                entityY2
                              );
      
      if (this.entityId != entity.entityId && 
          intersection && 
          (!closestHit || 
            this.distanceSquared(
              startX, 
              startY, 
              intersection.x, 
              intersection.y) < this.distanceSquared(
                                      startX, 
                                      startY, 
                                      closestHit.x, 
                                      closestHit.y))
                                    ) {
        
        closestHit = intersection;
      }
    }
    return closestHit;
  }
   
  dynamicRaycastCircle(startX, startY, endX, endY) {
    let closestHit = {collision: false, 
                      position: null, 
                      entity: null};

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
          this.distanceSquared(
              startX, 
              startY, 
              intersection.x, 
              intersection.y) < this.distanceSquared(
                                      startX, 
                                      startY, 
                                      closestHit.x, 
                                      closestHit.y))
                                    ) {        
        
        closestHit = { collision: true, 
                       position: intersection,
                       entity: entity };        
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
      
      const intersection = this.lineSegmentIntersection(
          startX, 
          startY, 
          dX, 
          dY, 
          obstacleX1, 
          obstacleY1, 
          obstacleX2, 
          obstacleY2);

      if (intersection && 
        (!targetHit || 
          this.distanceSquared(
            startX,
            startY,
            intersection.x, 
            intersection.y) < this.distanceSquared(
                                    startX, 
                                    startY, 
                                    targetHit.x, 
                                    targetHit.y))
                                  ) {
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
      
      const intersection = this.lineSegmentIntersection(
          startX, 
          startY, 
          dX, 
          dY, 
          obstacleX1, 
          obstacleY1, 
          obstacleX2, 
          obstacleY2);

      if (intersection && 
        (!closestHit || this.distanceSquared(
          startX, 
          startY, 
          intersection.x, 
          intersection.y) < this.distanceSquared(
                                  startX, 
                                  startY, 
                                  closestHit.x, 
                                  closestHit.y))
                                ) {
        closestHit = intersection;
      }
    }
    return closestHit;
  } 
   
  visualizeRaycast(startX, startY, endX, endY, collision, object) {
    if (!this.debug) {return};
    const ray = {
      startTime: Date.now(),
      startX,
      startY,
      endX,
      endY,
      collision,
      type: object.type
    };
    rays.push(ray);
  }
  
  updateRays(ctx) {
    for (let i = rays.length - 1; i >= 0; i--) {
      const ray = rays[i];
      const elapsedTime = Date.now() - ray.startTime;
      const alpha = Math.max(0, 1 - elapsedTime / 2000);
      const playerColor = '#ffffff';
      const entityColor = '#007bff';
      ctx.beginPath();
      ctx.moveTo(ray.startX, ray.startY);
      ctx.lineTo(ray.endX, ray.endY);
      ctx.lineWidth = 3;

      ctx.strokeStyle = ray.type === 'player' ? playerColor : entityColor;
      ctx.strokeStyle = `rgba(${ctx.strokeStyle.replace('#', '')}, ${alpha})`;

      ctx.stroke();

      if (ray.collision) {
        ctx.fillStyle = ray.type === 'player' ? 'red' : 'yellow';
        ctx.beginPath();
        ctx.arc(ray.collision.x, ray.collision.y, 2, 0, Math.PI * 2, true);
        ctx.fill();
      }

      if (alpha === 0) {
        rays.splice(i, 1);
      }
    }
  }
  
  displayName(ctx) {
    if (this.name) {
      ctx.font = "18px handjet";
      ctx.fillText(`${this.name}`, this.position.x, this.position.y - 12);
    }
  }       
  
  displayEntityId(ctx) {
    if (this.debug) {
      ctx.fillStyle = "white";
      
      ctx.font = "18px handjet";
      ctx.fillText(`${this.type}`,
          this.position.x,
          this.position.y + this.height + 12
        );            
    }
  }
 
  drawImage(ctx) {
    this.updateRays(ctx)
    this.displayEntityId(ctx)  
  }
 
    
  // legacy - will be removed soon
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
 
  updateHitboxCenter() {
    this.center.x = Math.floor(this.position.x + this.width / 2);
    this.center.y = Math.floor(this.position.y + this.height / 2);
  }
}