import { GameObject } from "./GameObject.js";
import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";

// TODO reset tilesize when map loads

const displayWidth = window.innerWidth;
const displayHeight = window.innerHeight;

import {
  NORTH,
  SOUTH,
  EAST,
  WEST,
  NORTHWEST,
  NORTHEAST,
  SOUTHWEST,
  SOUTHEAST,
  CENTER,
  HOME,
} from "./Input.js";

export class Camera extends GameObject {
  constructor() {
    super({});
    this.previousPosition = null;
    this.homePosition = new Vector2(0, 0);

    this.movementSpeed = 3;
    this.isPanning = false;

    this.screenShift = "ready"; // ready |  complete | charging
    this.shiftTiming = 0; // frames
    this.shiftDistance = 0; // pixels
    this.shiftCounter = this.shiftDistance;

    this.halfTile = 16;
    this.halfWidth = -this.halfTile + displayWidth / 2;
    this.halfHeight = -this.halfTile + displayHeight / 2;

    events.on("SHAKE_CAMERA", this, (event) => {
      this.hasShake = true;
      const shakeX = event.position.x - event.destinationPosition.x;
      const shakeY = event.position.y - event.destinationPosition.y;
      const magnitude = 0.25; // TODO set by something else
      this.shakeCamera(shakeX, shakeY, magnitude);
    });

    events.on("PLAYER_POSITION", this, (position) => {
      this.shiftTiming = 0;
      if (position.cause === "teleport") {
        this.isPanning = false;
      }
      this.updateView(position);
    });
  }

  updateView(position) {
    const transformX = Math.round(-position.x + this.halfWidth);
    const transformY = Math.round(-position.y + this.halfHeight);

    const transform = new Vector2(transformX, transformY);

    if (this.isPanning) {
      this.homePosition = transform.duplicate();
      this.driftTowards(transform);
    } else {
      this.position = transform;
      this.homePosition = transform.duplicate();
    }
    // this.position = new Vector2(transformX, transformY); // add state to use static camera follow
    // for adjusting camera mood, consider playing with it for more settings
  }

  driftTowards(center) {
    const driftAmount = 0.02;
    // .02 = what weve been using
    // .01 = running away from something

    const roundedPosition = new Vector2(
      Math.round(this.position.x + driftAmount * (center.x - this.position.x)),
      Math.round(this.position.y + driftAmount * (center.y - this.position.y))
    );

    this.position = roundedPosition;

    if (
      Math.abs(this.position.x - center.x) <= 32 &&
      Math.abs(this.position.y - center.y) <= 32
    ) {
      this.shiftCamera();
    }
  }
  shiftCamera() {
    if (this.screenShift === "complete" && this.shiftTiming === 0) {
      this.screenShift = "charging";
    }
    if (!this.previousPosition || this.previousPosition != this.position) {
      if (
        this.shiftCounter < this.shiftDistance &&
        this.screenShift === "charging"
      ) {
        this.shiftCounter += 1;
      }
      if (this.shiftCounter === this.shiftDistance) {
        this.screenShift = "ready";
      }
    }
    this.previousPosition = this.position.duplicate();

    if (this.screenShift === "ready") {
      this.shiftTiming += 1;
    }

    if (
      this.shiftCounter > 0 &&
      this.screenShift === "ready" &&
      this.shiftTiming > 150 &&
      !this.isPanning
    ) {
      this.position.y -= 1;
      this.shiftCounter -= 1;
    }
    if (this.shiftCounter <= 0) {
      this.isPanning = true;
      this.screenShift = "complete";
    }
  }
  shakeCamera(x, y, magnitude) {
    // Calculate new positions with shake applied, but don't update yet
    const newPositionX = this.position.x + x * magnitude;
    const newPositionY = this.position.y + y * magnitude;

    // Check if any value is valid
    if (isNaN(x) || isNaN(y) || isNaN(magnitude)) {
      // No shake applied if any value is invalid
      return; // Early return if needed
    } else if (x === 0 && y === 0) {
      // No shake applied if both x and y are 0
      return;
    }

    // Apply the shake only if at least one value is valid
    this.position.x = newPositionX;
    this.position.y = newPositionY;
  }

  panCamera(numpad) {
    if (!this.isPanning) {
      this.isPanning = true;
      this.homePosition = this.position.duplicate();
    }
    if (
      Math.abs(this.position.x - this.homePosition.x) > this.halfWidth ||
      Math.abs(this.position.y - this.homePosition.y) > this.halfHeight
    ) {
      const rockAmount = 0.1;

      this.position.x =
        this.position.x +
        (rockAmount * (this.homePosition.x - this.position.x)) / this.halfWidth;

      this.position.y =
        this.position.y +
        (rockAmount * (this.homePosition.y - this.position.y)) /
          this.halfHeight;

      return;
    }
    switch (numpad) {
      case CENTER:
        this.driftTowards(this.homePosition);
        break;
      case HOME:
        this.position = this.homePosition.duplicate();
        this.isPanning = false;
        break;
      case NORTH:
        this.position.y -= this.movementSpeed;
        break;
      case SOUTH:
        this.position.y += this.movementSpeed;
        break;
      case EAST:
        this.position.x += this.movementSpeed;
        break;
      case WEST:
        this.position.x -= this.movementSpeed;
        break;
      case NORTHWEST:
        this.position.x -= this.movementSpeed;
        this.position.y -= this.movementSpeed;
        break;
      case NORTHEAST:
        this.position.x += this.movementSpeed;
        this.position.y -= this.movementSpeed;
        break;
      case SOUTHWEST:
        this.position.x -= this.movementSpeed;
        this.position.y += this.movementSpeed;
        break;
      case SOUTHEAST:
        this.position.x += this.movementSpeed;
        this.position.y += this.movementSpeed;
        break;
    }
  }
  step(delta, root) {
    const { input } = root;
    this.shiftCamera();
    if (input.numpad && !input.direction) {
      this.panCamera(input.numpad);
    }
    if (this.hasShake) {
      this.hasShake = false;
      this.shakeCamera();
    }
  }

  follow(ctx) {
    ctx.translate(this.position.x, this.position.y);
  }
}
