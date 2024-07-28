import { WORLD_BOUNDARIES } from "../constants.js";

export class MoveUnit {
  constructor(entity) {
    this.entity = entity;
    this.boundaries = WORLD_BOUNDARIES;
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(position) {
    this.observers.forEach((observer) => observer.update(position));
  }

  up(distance) {
    return this.clampY(this.entity.position.y - distance);
  }

  down(distance) {
    return this.clampY(this.entity.position.y + distance)
  }

  left(distance) {
    return this.clampX(this.entity.position.x - distance);
  }

  right(distance) {
    return this.clampY(this.entity.position.x + distance);
  }

  clampX(newX) {
    return Math.max(
      this.boundaries.minX,
      Math.min(newX, this.boundaries.maxX - this.entity.width)
    );
  }

  clampY(newY) {
    return Math.max(
      this.boundaries.minY,
      Math.min(newY, this.boundaries.maxY - this.entity.height)
    );
  }
}
