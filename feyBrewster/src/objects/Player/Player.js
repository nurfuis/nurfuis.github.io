import {
  PICK_UP_DOWN,
  STAND_DOWN,
  STAND_LEFT,
  STAND_RIGHT,
  STAND_UP,
  WALK_DOWN,
  WALK_LEFT,
  WALK_RIGHT,
  WALK_UP,
  ATTACK_LEFT,
  ATTACK_UP,
  ATTACK_RIGHT,
  ATTACK_DOWN,
} from "./playerAnimations.js";
import { Katana } from "../Items/Katana/Katana.js";

import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";

import { Sprite } from "../../Sprite.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";

import { events } from "../../Events.js";
import { resources } from "../../Resource.js";

import { DOWN, LEFT, RIGHT, UP } from "../../Input.js";

import { moveTowards } from "../../helpers/moveTowards.js";

import { movingObjects } from "../../helpers/collisionDetection.js";

import { obstacles } from "../../helpers/grid.js";
import { gridSize } from "../../helpers/grid.js";
import { isSpaceFree } from "../../helpers/grid.js";


export class Player extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });    
    this.isSpawned = false;
    this.canSpawn = true;
    this.currentWorld = null;
    
    this.type = 'player';
    
    this.hasCollision = true;
    this.width = 32;
    this.height = 32;

    this.mass = 200;
    this.speed = 2;
    
    this.radius = 16;
    this.center = new Vector2(this.position.x + gridSize / 2, this.position.y + gridSize / 2);
    this.destinationPosition = this.position.duplicate();
    
    this.facingDirection = DOWN;    
    
    this.itemPickUpTime = 0;
    this.itemPickUpShell = null;
    
    this.teleportCooldown = 0;
    this.teleportEffect = null;
    
    this.attackTime = 0;
    this.attackImage = null;
    
    this.idleTime = 0;
    this.idleAction = 200;
  
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32,32),
      position: new Vector2(2, -16),
    })
    
    this.addChild(shadow);
    
    this.body = new Sprite({
      resource: resources.images.player,
      frameSize: new Vector2(32,32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
      scale: 2,
      position: new Vector2(-16, -32), // offset x, y
      animations: new Animations({
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standRight: new FrameIndexPattern(STAND_RIGHT),
        pickUpDown: new FrameIndexPattern(PICK_UP_DOWN),
        attackLeft: new FrameIndexPattern(ATTACK_LEFT),
        attackUp: new FrameIndexPattern(ATTACK_UP),
        attackRight: new FrameIndexPattern(ATTACK_RIGHT),
        attackDown: new FrameIndexPattern(ATTACK_DOWN),        

      })
    })
    
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

    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.onPickUpItem(data);
    })
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
    
    const collisionVectorNormalized = {
      x: dx / distance,
      y: dy / distance
    }
    
    return {
      x: Math.round(collisionVectorNormalized.x * other.mass),
      y: Math.round(collisionVectorNormalized.y * other.mass)
    }       
  }
  
  onCollision(repulsionForce) {
    const pushedX = this.position.x + repulsionForce.x / this.mass;
    const pushedY = this.position.y + repulsionForce.y / this.mass;
    
    if (isSpaceFree(pushedX, pushedY, this).collisionDetected === false) {
      this.position.x = pushedX;
      this.position.y = pushedY;
      this.updateHitboxCenter();  
      this.destinationPosition = this.position.duplicate();
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
    this.center.x = this.position.x + gridSize / 2; 
    this.center.y = this.position.y + gridSize / 2;       
  } 
  
  setPosition(x, y, world) {
    this.position = new Vector2(x, y);
    this.destinationPosition = this.position.duplicate();
    this.currentWorld = world;
  };
  
  spawn(x, y, world, plane) {
    if (this.canSpawn && !this.isSpawned) {
      this.setPosition(x, y, world);
      
      plane.addChild(this);
      
      
      if (this.hasCollision) {
        this.updateHitboxCenter();
        movingObjects.push(this);
      }
      
      this.isSpawned = true;    

    }
    console.log(this.type + " has spawned at " + this.position.x + "," + this.position.y + "," + this.currentWorld);

  }
  
  despawn() {
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].owner === this) {
        obstacles.splice(i, 1); 
      }
    }
  }
  
  ready() {
  
  }
  
  step(delta, root) {
    if (this.teleportCooldown > 0) {
      this.workOnTeleport(delta);
      return;
    }    
    if (this.attackTime > 0) {
      this.workOnSwordAttack(delta);
      return;
    }  
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }
    
    const distance = moveTowards(this, this.destinationPosition, this.speed);    
    this.updateHitboxCenter();
    this.checkCollisions(movingObjects);       

    
    const hasArrived = distance < 1;
    if (hasArrived) {
      this.tryMove(delta, root)
    }
    this.tryEmitPosition()
  }
  
  tryEmitPosition() {
    if (this.lastX == this.position.x && this.lastY == this.position.y) {
      return;
    }
    this.lastX = this.position.x;
    this.lastY = this.position.y;
    events.emit("PLAYER_POSITION", { 
      x: this.position.x, 
      y: this.position.y, 
      world: this.currentWorld,
      center: this.center,
      radius: this.radius,    
    })
  }
  
  tryMove(delta, root) {
    const {input} = root;

    if (input.key) {
      if (input.key === 'F1' && this.currentWorld != 'tutorialMap') {
        this.teleport(-128, 96, 'tutorialMap');
      }
      if (input.key === 'F2' && this.currentWorld != 'brewhouse2') {
        this.teleport(96, 96, 'brewhouse2'); 
      }
    };  
    
    if (!input.direction && !input.isClicking) {    
      this.idleBehavior(delta);
      return;
    }
    
    if (input.isClicking && !input.isTextFocused) {      
      this.clickBehavior();
      return;
    }

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
      this.body.animations.play("walkDown")
    }
    
    if (input.direction == UP) {
      nextY -= gridSize;
      this.body.animations.play("walkUp")
    }
    
    if (input.direction == LEFT) {
      nextX -= gridSize;
      this.body.animations.play("walkLeft")
    }
    
    if (input.direction == RIGHT) {
      nextX += gridSize;
      this.body.animations.play("walkRight")
    }
    
    const collisionCheck = isSpaceFree(nextX, nextY, this);
    
    if (collisionCheck.collisionDetected === false) {
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;    
    } 
    this.facingDirection = input.direction ?? this.facingDirection;
  };   
  
  teleport(x, y, world) {
    if (this.teleportCooldown > 0) {
      return this.teleportCooldown;
    }
    this.clearColliders();
    this.isSpawned = false;
    this.parent.removeChild(this);
    this.teleportCooldown = 500;
    // this.teleportEffect = new GameObject({});
    // this.teleportEffect.addChild(new Sprite({
      // resource: resources.images.shroud,
      // position: new Vector2(-1000, -560),
      // frameSize: new Vector2(2000, 1125),
    // }))
    // this.addChild(this.teleportEffect);    
    // for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      // if (obstacles[i].owner === this) {
        // obstacles.splice(i, 1); 
      // }
    // }     
    this.destinationPosition.x = x;
    this.destinationPosition.y = y;
    this.position.x = x;
    this.position.y = y;
    this.currentWorld = world;
    this.facingDirection = DOWN;    
    events.emit("TEXT_OUTPUT", { details: world})       
    events.emit("PLAYER_POSITION", { x: x, y: y, world: world, reason: "teleport" })     
  }
  
  workOnTeleport(delta) {
    this.teleportCooldown -= delta;
    // if (this.teleportCooldown <= 0) {
      // this.teleportEffect.destroy();
    // }
  }  
  
  idleBehavior(delta) {
    if (this.idleTime < this.idleAction ) {
      this.idleTime += delta;
    } else {              
        this.idleTime = 0;
      };       
    if (this.facingDirection === LEFT) {this.body.animations.play("standLeft")}
    if (this.facingDirection === RIGHT) {this.body.animations.play("standRight")}
    if (this.facingDirection === UP) {this.body.animations.play("standUp")}
    if (this.facingDirection === DOWN) {this.body.animations.play("standDown")}
  }
  
  clickBehavior() {
    if (this.facingDirection === LEFT) {this.onSwordAttack(LEFT)}
    if (this.facingDirection === UP) {this.onSwordAttack(UP)}
    if (this.facingDirection === RIGHT) {this.onSwordAttack(RIGHT)}
    if (this.facingDirection === DOWN) {this.onSwordAttack(DOWN)}    
  }
  
  onSwordAttack(direction) {
    // start animation 
    if (this.attackTime > 0) {
      return;
    }
    this.attackTime = 250; // ms
    
    this.attackImage = new Katana(this.position.x, this.position.y, this.currentWorld, direction);
    
    this.addChild(this.attackImage);
  } 
  
  workOnSwordAttack(delta) {
    this.attackTime -= delta;
    
    if (this.facingDirection === LEFT) {this.body.animations.play( 'attackLeft' )}
    if (this.facingDirection === RIGHT) {this.body.animations.play( 'attackRight' )}
    if (this.facingDirection === UP) {this.body.animations.play( 'attackUp' ) }
    if (this.facingDirection === DOWN) {this.body.animations.play( 'attackDown' )}    
    
    if (this.attackTime <= 0) {
      this.attackImage.destroy();
    } 
  }      
  
  onPickUpItem({ image, position }) {
    // place character on item position
    this.destinationPosition = position.duplicate();
    // start animation
    this.itemPickUpTime = 400; // ms
    this.itemPickUpShell = new GameObject({});
    this.itemPickUpShell.addChild(new Sprite({
      resource: image,
      position: new Vector2(1, -20)
    }))
    this.addChild(this.itemPickUpShell)
  }
  
  workOnItemPickUp(delta) {
    this.itemPickUpTime -= delta;
    this.body.animations.play("pickUpDown")
    if (this.itemPickUpTime <= 0) {
      this.itemPickUpShell.destroy();
    }
  }
  
 
}