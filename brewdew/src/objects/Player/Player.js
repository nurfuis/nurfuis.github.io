// Player.js
import {Animations} from "../../Animations.js";
import {events} from "../../Events.js";
import {FrameIndexPattern} from "../../FrameIndexPattern.js";
import {GameObject} from "../../GameObject.js";
import {DOWN, LEFT, RIGHT, UP} from "../../Input.js";
import {resources} from "../../Resource.js";
import {Sprite} from "../../Sprite.js";
import {Vector2} from "../../Vector2.js";
import {gridSize} from "../../helpers/grid.js";
import {isSpaceFree} from "../../helpers/grid.js";
import {moveTowards} from "../../helpers/moveTowards.js";
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
import {obstacles} from "../../helpers/grid.js";

import { Katana } from "../Items/Katana/Katana.js";

export class Player extends GameObject {
  constructor(x, y, world) {
    super({
      position: new Vector2(x, y)
    });
    this.world = world;
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32,32),
      position: new Vector2(-8, -22),
    })
    this.addChild(shadow);

    this.body = new Sprite({
      resource: resources.images.player,
      frameSize: new Vector2(32,32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
      position: new Vector2(-8, -22), // offset x, y
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
    
    // Default Facing
    this.facingDirection = DOWN;
    this.currentAnimation = "standDown";
    
    // Movement
    this.destinationPosition = this.position.duplicate();
    
    this.idleTime = 0;
    this.idleAction = 10000;
    
    // Item Pickup
    this.itemPickUpTime = 0;
    this.itemPickUpShell = null;
    
    // Collision tile
    this.entityId = "nurfuis";
    this.isMoving = false;
    this.colliderPosition = null;
    this.colliderPositionLast = null;
    this.type = 'entity';
    // Spawn player
    this.isSpawned = false;
    this.canSpawn = true;
    this.currentWorld = this.world;
    
    this.teleportCooldown = 0;
    
    // Attack
    this.attackTime = 0;
    this.attackImage = null;

    // On Player Picks Up Item
    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.onPickUpItem(data);
    })
  }
  spawnPlayer(player) {
    if (this.canSpawn && !this.isSpawned) {
      this.isSpawned = true;
      this.colliderPosition = this.position;
      this.place();
      console.log(this.entityId + " has spawned at " + this.position.x + "," + this.position.y + "," + this.currentWorld);         
    }
  }
  ready() {
    this.spawnPlayer;
  }
  step(delta, root) { 
    if (this.attackTime > 0) {
      this.workOnSwordAttack(delta);
      return;
    }  
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }
    
    const distance = moveTowards(this, this.destinationPosition, 1) // destination, speed
    const hasArrived = distance < 1;
    if (hasArrived) {
      // Collision tile
      if (this.isMoving) {
        this.isMoving = false;
        if (this.colliderPositionLast) {
          this.pickup();
        }
      }
      this.tryMove(delta, root)
    }
    // Signal if player has moved
    this.tryEmitPosition()
  }
  tryEmitPosition() {
    if (this.lastX == this.position.x && this.lastY == this.position.y) {
      return;
    }
    this.lastX = this.position.x;
    this.lastY = this.position.y;
    events.emit("PLAYER_POSITION", { x: this.position.x, y: this.position.y, world: this.currentWorld })
  }
  teleport(x, y, world) {
    if (this.teleportCooldown > 0) {
      console.log('teleport on cooldown');
      return this.teleportCooldown;
    }
    this.teleportCooldown = 500;
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].owner === this) {
        obstacles.splice(i, 1); 
      }
    }    
    this.destinationPosition.x = x;
    this.destinationPosition.y = y;
    this.position.x = x;
    this.position.y = y;
    this.currentWorld = world;
    
    events.emit("PLAYER_TELEPORT", { x: x, y: y, world: world })     
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
  tryMove(delta, root) {
    //  This line extracts the input property from the root object and assigns it to the input variable.
    const {input} = root;
    if (this.teleportCooldown >= 0) {
      this.teleportCooldown -= delta;
    }
    if (input.digit) {
      if (input.digit === 'ONE' && this.currentWorld != 'world') {
        this.teleport(96, 96, 'world');
      }
      if (input.digit === 'TWO' && this.currentWorld != 'brewhouse') {
        this.teleport(96, 96, 'brewhouse');        
      }  
    };  
    
    if (!input.direction && !input.isClicking) {    
      this.idleBehavior(delta);
      return;
    }
    if (input.isClicking) {
      this.clickBehavior();
      return;
    }   
    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;
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
    // Check space availability using chunk manager
    if (isSpaceFree(nextX, nextY, this.currentWorld, this).collisionDetected === false) {
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;    
      
      // Collision tile
      this.isMoving = true;
      this.colliderPositionLast = this.colliderPosition;
      this.colliderPosition = new Vector2(nextX, nextY); ; 
      this.place(); 
    }
    this.facingDirection = input.direction ?? this.facingDirection;
  };  
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
  place() {
    obstacles.push({ id: `${this.colliderPosition.x},${this.colliderPosition.y},${this.currentWorld}`, owner: this });    
  }
  pickup() {
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].id === `${this.colliderPositionLast.x},${this.colliderPositionLast.y},${this.currentWorld}` && obstacles[i].owner === this) {
        obstacles.splice(i, 1); // Remove only the matched element
        break; // Stop iterating once found
      }
    }
  }  
}