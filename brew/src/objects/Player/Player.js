// Player.js
import {GameObject} from "../../GameObject.js";
import {isSpaceFree} from "../../helpers/grid.js";
import {Vector2} from "../../Vector2.js";
import {DOWN, LEFT, RIGHT, UP} from "../../Input.js";
import {gridSize} from "../../helpers/grid.js";
import {Sprite} from "../../Sprite.js";
import {resources} from "../../Resource.js";
import {Animations} from "../../Animations.js";
import {FrameIndexPattern} from "../../FrameIndexPattern.js";
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

import {moveTowards} from "../../helpers/moveTowards.js";
import {events} from "../../Events.js";
import { colliders } from "../../../main.js";

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
    this.lastSquare = null;
    this.nextSquare = null;
    
    // Spawn player
    this.isSpawned = false;
    this.canSpawn = true;
    this.currentWorld = this.world;
    
    // Attack
    this.attackTime = 0;
    this.attackImage = null;
    
    this.currentAnimation = "standDown";
    
    // On Player Picks Up Item
    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.onPickUpItem(data)
    })
  }
  spawnPlayer(player) {
    if (this.canSpawn && !this.isSpawned) {
      this.isSpawned = true;
      colliders.addCollider(Math.floor(this.position.x), Math.floor(this.position.y), this.currentWorld, this.entityId );
      console.log(this.entityId + " has spawned at " + this.position.x + "," + this.position.y + "," + this.currentWorld);         
    }
  }
  ready() {
    this.spawnPlayer;
  }
  step(delta, root) {  
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }
    if (this.attackTime > 0) {
      this.workOnSwordAttack(delta);
      return;
    }    

    const distance = moveTowards(this, this.destinationPosition, 1) // destination, speed
    const hasArrived = distance < 1;
    if (hasArrived) {
      // Collision tile
      if (this.isMoving) {
        this.isMoving = false;
        if (this.lastSquare) {
          colliders.removeCollider( this.lastSquare.x, this.lastSquare.y, this.currentWorld, this.entityId );
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
    // console.log('player emit position');
    events.emit("PLAYER_POSITION", { x: this.position.x, y: this.position.y, world: this.currentWorld })
  }
  idleBehavior(delta) {
    if (this.idleTime < this.idleAction ) {
      this.idleTime += delta;
    } else {     
        // console.log('idle');
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
  getNextTile(direction) {
    
  }
  tryMove(delta, root) {
    //  This line extracts the input property from the root object and assigns it to the input variable.
    const {input} = root;
    if (!input.direction && !input.isClicking) {    
      this.idleBehavior(delta);
      return;
    }
    
    
    
    if (input.isClicking) {
      this.clickBehavior();
      // return;
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
    if (isSpaceFree(nextX, nextY, this.currentWorld, this.entityId).collisionDetected === false) {
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;
      
      
      // Collision tile
      this.isMoving = true;
      this.lastSquare = new Vector2(Math.floor(this.position.x), Math.floor(this.position.y));
      this.nextSquare = new Vector2(Math.floor(nextX), Math.floor(nextY));
      colliders.addCollider( this.nextSquare.x, this.nextSquare.y, this.currentWorld, this.entityId );
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
}