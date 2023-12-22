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
  WALK_UP
} from "./playerAnimations.js";
import {moveTowards} from "../../helpers/moveTowards.js";
import {events} from "../../Events.js";
import { colliders } from "../../../main.js";
import { mainScene } from "../../../main.js";
import { player } from "../../../main.js";

export class Player extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y)
    });
    // add player shadow
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32,32),
      position: new Vector2(-8, -22),
    })
    this.addChild(shadow);
    // add new sprite
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
      })
    })
    this.addChild(this.body);
    // Default Facing
    this.facingDirection = DOWN;
    // Movement
    this.destinationPosition = this.position.duplicate();
    this.idleTime = 0;
    this.idleAction = 6000;
    // Item Pickup
    this.itemPickUpTime = 0;
    this.itemPickUpShell = null;
    // Collision tile
    this.entityId = "nurfuis";
    this.isMoving = false;
    this.lastSquare = null;
    this.nextSquare = null;
    // Spawn player
    
    events.on("SPAWN_ZONE_READY", this, (location) => {
      console.log(' work on spawn player ');
      this.spawnPlayer();
    });
    events.on("SPAWN_PLAYER", this, (location) => {
      this.spawnPlayer(this.spawnLocation);
    });
    // On Player Picks Up Item
    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.onPickUpItem(data)
    })
  }
  spawnPlayer() {
    mainScene.addChild(player);
    colliders.addCollider(Math.floor(player.position.x), Math.floor(player.position.y), player.entityId );
    console.log(player.entityId + " has spawned at " + player.position.x + "," + player.position.y);
  }
  ready() {
  }
  step(delta, root) {
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }
    // Try move
    const distance = moveTowards(this, this.destinationPosition, 1) // destination, speed
    const hasArrived = distance < 1;
    if (hasArrived) {
      // Collision tile
      if (this.isMoving) {
        this.isMoving = false;
        if (this.lastSquare) {
          colliders.removeCollider( this.lastSquare.x, this.lastSquare.y, this.entityId );
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
    events.emit("PLAYER_POSITION", this.position)
  }
  idleBehavior() {
    // events.emit("PLAYER_POSITION", this.position)
  }
  tryMove(delta, root) {
    //  This line extracts the input property from the root object and assigns it to the input variable.
    const {input} = root;
    if (!input.direction) {
      if (this.idleTime < this.idleAction ) {
        this.idleTime += delta;
      } else {
        this.idleBehavior();
        this.idleTime = 0;
      };
      if (this.facingDirection === LEFT) {this.body.animations.play("standLeft")}
      if (this.facingDirection === RIGHT) {this.body.animations.play("standRight")}
      if (this.facingDirection === UP) {this.body.animations.play("standUp")}
      if (this.facingDirection === DOWN) {this.body.animations.play("standDown")}
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
    if (isSpaceFree(colliders.colliders, nextX, nextY, this.entityId).collisionDetected === false) {
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;
      // Collision tile
      this.isMoving = true;
      this.lastSquare = new Vector2(Math.floor(this.position.x), Math.floor(this.position.y));
      this.nextSquare = new Vector2(Math.floor(nextX), Math.floor(nextY));
      colliders.addCollider( this.nextSquare.x, this.nextSquare.y, this.entityId );
    }
    this.facingDirection = input.direction ?? this.facingDirection;
  };
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
      this.itemPickUpShell.destroy()
    }
  }
}