import { entities } from "../main.js";
import { ENTITY_COLOR } from "./constants.js";
import { GameObject } from "./GameObject.js";
import { Vector2 } from "./Vector2.js";

export class Entity extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0),
    });
    this.radius = 16;
    this.speed = 1;
    this.destinationPosition = this.position.duplicate();
    this.moveHistory = [];
    this.tryMoveAttempts = 0;
  }
  moveTowards() {
    let distanceToTravelX = this.destinationPosition.x - this.position.x;
    let distanceToTravelY = this.destinationPosition.y - this.position.y;

    let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

    if (distance <= this.speed) {
      this.position.x = this.destinationPosition.x;
      this.position.y = this.destinationPosition.y;
    } else {
      let normalizedX = distanceToTravelX / distance;
      let normalizedY = distanceToTravelY / distance;

      const newX = this.position.x + normalizedX * this.speed;
      const newY = this.position.y + normalizedY * this.speed;

      const newPosition = new Vector2(newX, newY).validate();
      this.position = newPosition;
    }
  }
  spawn() {
    if (!!entities) {
      entities.addChild(this);
      console.log("Entity Spawned: ", this);
    } else {
      console.error("Entities is:", entities);
    }
  }
  step() {
    this.moveHistory.push(this.direction);

    if (this.moveHistory.length > 20) {
      this.moveHistory.shift();
    }

    if (!!this.brain) {
      this.controller.update();
    }
  }
  drawCircle(ctx, position, radius) {
    ctx.strokeStyle = ENTITY_COLOR;

    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
  drawImage(ctx) {
    this.drawCircle(ctx, this.position, this.radius);
  }
}
