import { LEFT, RIGHT, UP, DOWN } from "../Input.js";
export class AutomatedInput {
  constructor(directions = [LEFT, RIGHT, UP, DOWN], interval = 1000) {
    this.directions = directions;
    this.interval = interval;
    this.currentDirection = null;
    this.heldKeys = [];

    this.scheduleNextInput();
  }

  get direction() {
    return this.currentDirection;
  }

  scheduleNextInput() {
    setTimeout(() => {
      this.chooseRandomDirection();
      this.scheduleNextInput();
    }, this.interval);
  }

  chooseRandomDirection() {
    const randomIndex = Math.floor(Math.random() * this.directions.length);
    const randomIndex2 = Math.floor(Math.random() * this.directions.length);
    if (randomIndex != randomIndex2) {
      this.currentDirection = this.directions[randomIndex];
    } else {
      this.currentDirection = undefined;
    }
  }
}
