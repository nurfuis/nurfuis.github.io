import { Battery } from "./Battery.js";
import { Motor } from "./Motor.js";
import { Transmission } from "./Transmission.js";

import { Vector2 } from "./Vector2.js";
import { Sprite } from "./Sprite.js";
import { Animations } from "./Animations.js";
import { FrameIndexPattern } from "./FrameIndexPattern.js";
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
} from "./animations/playerAnimations.js";
import { DOWN, UP, LEFT, RIGHT } from "./Input.js";
import { events } from "./Events.js";

import { GameObject } from "./GameObject.js";
import { globalCooldownDuration } from "../config/constants.js";
import { resources } from "./utils/loadResources.js";

export class Player extends GameObject {
  constructor() {
    super({
      position: new Vector2(48, 48),
    });
    this.canPickUpItems = true;
    this.itemPickUpShell = null;
    this.useAutoInput = false;
    this.showGrid = false;

    this.gcd = 0;

    this.width = 32;
    this.height = 64;

    this.scale = 12;
    this.radius = 16;

    this.speed = 2;
    this.facingDirection = DOWN;

    this.powerSupply = new Battery();
    this.powerSupply.storedEnergy = this.powerSupply.storedCapacity;

    this.motor = new Motor();
    this.motor.KV = 10;

    this.transmission = new Transmission();
    this.transmission.gear = 3;

    this._maxSpeed = this.powerSupply.dischargeRate;

    this._mass = this.radius * this.scale ** 2;

    this._gravity = this.scale ** 2;
    this._drag = this.scale ** 2 / this._mass;

    this._acceleration = new Vector2(0, 0);
    this._velocity = new Vector2(0, 0);

    this.shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-32, -49),
      scale: 2,
    });
    this.body = new Sprite({
      resource: resources.images.player,
      frameSize: new Vector2(32, 64),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
      scale: 1,
      position: new Vector2(-16, -52), // offset x, y
      animations: new Animations({
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standRight: new FrameIndexPattern(STAND_RIGHT),
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        pickUpDown: new FrameIndexPattern(PICK_UP_DOWN),
        attackLeft: new FrameIndexPattern(ATTACK_LEFT),
        attackUp: new FrameIndexPattern(ATTACK_UP),
        attackRight: new FrameIndexPattern(ATTACK_RIGHT),
        attackDown: new FrameIndexPattern(ATTACK_DOWN),
      }),
    });

    this.addChild(this.shadow);
    this.addChild(this.body);

    events.on("F3", this, () => (this.useAutoInput = !this.useAutoInput));

    events.on("PLAYER_PICKS_UP_ITEM", this, (data) => {
      this.onPickUpItem(data);
    });
  }
  get mass() {
    return this._mass + this?.inventory?.items?.length * this.scale ** 2;
  }

  move(direction, world) {
    if (direction && direction != this._lastDirection) {
      this._velocity = new Vector2(0, 0);
      this._acceleration = new Vector2(0, 0);
      return;
    }
    if (direction) {
      const torque =
        (this.motor.KV *
          this.powerSupply.voltage *
          this.transmission.gearBox[this.transmission.gear].motor) /
        (this.mass * this.transmission.gearBox[this.transmission.gear].drive);

      switch (direction) {
        case "LEFT":
          if (Math.abs(this._acceleration.x) < this._maxSpeed) {
            this._acceleration.x -= torque;
            this.body.animations.play("walkLeft");
          }
          break;
        case "RIGHT":
          if (Math.abs(this._acceleration.x) < this._maxSpeed) {
            this._acceleration.x += torque;
            this.body.animations.play("walkRight");
          }
          break;
        case "UP":
          if (Math.abs(this._acceleration.y) < this._maxSpeed) {
            this._acceleration.y -= torque;
            this.body.animations.play("walkUp");
          }
          break;
        case "DOWN":
          if (Math.abs(this._acceleration.y) < this._maxSpeed) {
            this._acceleration.y += torque;
            this.body.animations.play("walkDown");
          }
          break;
      }
    } else {
      // Reset acceleration to 0 on key release (no input)
      const aX = this._acceleration.x;
      const aY = this._acceleration.y;

      // x friction
      if (aX < 0) {
        this._acceleration.x = aX + this._drag;
      } else if (aX > 0) {
        this._acceleration.x = aX - this._drag;
      }

      if ((aX < 4 && aX > 0) || (aX > -4 && aX < 0)) {
        this._acceleration.x = 0;
      }

      // y friction
      if (aY < 0) {
        this._acceleration.y = aY + this._drag;
      } else if (aY > 0) {
        this._acceleration.y = aY - this._drag;
      }

      if ((aY < 4 && aY > 0) || (aY > -4 && aY < 0)) {
        this._acceleration.y = 0;
      }
    }

    const sag = this.powerSupply.dropoff[this.powerSupply.storedCharge];

    const forceX = this._acceleration.x * this.mass * sag;
    const forceY = this._acceleration.y * this.mass * sag;

    const vX = forceX / this.mass;
    const vY = forceY / this.mass;

    if (vX < 0 || vX > 0) {
      this._velocity.x = vX * 1 - this._gravity;
    } else if ((vX < 4 && vX > 0) || (vX > -4 && vX < 0)) {
      this._velocity.x = 0;
    }

    if (vY < 0 || vY > 0) {
      this._velocity.y = vY * 1 - this._gravity;
    } else if ((vY < 4 && vY > 0) || (vY > -4 && vY < 0)) {
      this._velocity.y = 0;
    }
    let nextX;
    let nextY;

    if (this.direction == LEFT || this.direction == RIGHT) {
      nextX = this.position.x + vX;
      nextY = this.position.y;
      this._velocity.y = 0;
    }
    if (this.direction == UP || this.direction == DOWN) {
      nextX = this.position.x;
      nextY = this.position.y + vY;
      this._velocity.x = 0;
    }

    const nextPosition = new Vector2(nextX, nextY);
    const result = getTile(nextPosition, world);

    if (
      !!result.currentTile &&
      result.currentTile.id > 0 &&
      result.currentTile.id < 3
    ) {
      this.position = nextPosition;
    } else {
      this._velocity = new Vector2(0, 0);
      this._acceleration = new Vector2(0, 0);
      switch (this.facingDirection) {
        case LEFT:
          this.body.animations.play("standLeft");
          break;

        case RIGHT:
          this.body.animations.play("standRight");
          break;

        case UP:
          this.body.animations.play("standUp");
          break;

        case DOWN:
          this.body.animations.play("standDown");
          break;

        default:
          break;
      }
    }
  }

  onPickUpItem(item) {
    console.log(this.inventory.items.length);
    if (this.inventory.items.length > 10) {
      this.canPickUpItems = false;
    } else if (
      this.inventory.items.length <= 10 &&
      this.inventory.items.lengt >= 0
    ) {
      this.canPickUpItems = true;
    }
    if (this.itemPickUpShell === null) {
      this.itemPickUpTime = 80;
      this.itemPickUpShell = new GameObject({ x: 0, y: 0 });
      const sprite = new Sprite({
        resource: item.image,
        frameSize: new Vector2(32, 32),
        position: new Vector2(-12, -52),
        scale: 0.75,
      });
      this.itemPickUpShell.addChild(sprite);
      this.addChild(this.itemPickUpShell);
    }
  }

  workOnItemPickUp(delta) {
    this.itemPickUpTime -= delta;
    this.body.animations.play("pickUpDown");
    if (this.itemPickUpTime <= 0) {
      this.itemPickUpShell.destroy();
      this.itemPickUpShell = null;
    }
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
      cause: "movement",
      radius: this.radius,
      canPickUpItems: this.canPickUpItems,
    });
  }

  step(delta, root) {
    const layer = this.parent;
    const world = layer.parent;

    this.powerSupply.checkState();
    this.powerSupply.drawPower(this._acceleration);

    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }
    this._lastDirection = this.direction;

    const { input } = root;
    const { automatedInput } = root;

    if (this.useAutoInput) {
      this.direction = input.direction || automatedInput.direction;
    } else {
      this.direction = input.direction;
    }

    this.move(this.direction, world);

    this.keyPress = input.heldKeys;
    if (this.gcd > 0) {
      this.gcd -= delta;
    }
    if (this.keyPress.length > 0 && this.gcd <= 0) {
      this.gcd += globalCooldownDuration;

      console.log(getTile(this.position, world).currentTile.id || undefined);
    }

    this.tryEmitPosition();
  }

  drawImage(ctx) {
    const posX = this.position.x;
    const posY = this.position.y;

    // ctx.fillText(`Player: ${posX}, ${posY}  `, posX, posY + 16);

    // ctx.beginPath();

    // ctx.rect(posX, posY, this.width, this.height);

    // if (this.showGrid) {
    //   ctx.strokeStyle = "blue";
    //   ctx.lineWidth = 1;

    //   ctx.stroke();
    // }
    // ctx.closePath();

    // ctx.lineWidth = 1;
  }
}
function getTile(position, world) {
  const background = world.children[0]; // layer id 0
  let currentChunk;
  let currentTile;
  if (background.children.length > 0) {
    background.children.forEach((chunk) => {
      if (
        position.x >= chunk.position.x &&
        position.x < chunk.position.x + chunk.width &&
        position.y >= chunk.position.y &&
        position.y < chunk.position.y + chunk.height
      )
        currentChunk = chunk;
    });
  }

  if (!!currentChunk) {
    currentChunk.children.forEach((tile) => {
      if (
        position.x >= tile.position.x + currentChunk.position.x &&
        position.x < tile.position.x + tile.width + currentChunk.position.x &&
        position.y >= tile.position.y + currentChunk.position.y &&
        position.y < tile.position.y + tile.height + currentChunk.position.y
      )
        currentTile = tile;
    });
  } else {
    currentTile = undefined;
  }
  return { currentChunk, currentTile };
}
