import { Vector2 } from "./Vector2.js";
import { events } from "./Events.js";

export class GameObject {
  position;
  children;
  parent;
  hasReadyBeenCalled;

  constructor(options) {
    this.position = options.position ?? new Vector2(0, 0);
    this.children = [];
    this.parent = null;
    this.hasReadyBeenCalled = false;
  }

  stepEntry(delta, root) {
    this.children.forEach((child) => child.stepEntry(delta, root));

    if (!this.hasReadyBeenCalled) {
      this.hasReadyBeenCalled = true;
      this.ready();
    }
    this.step(delta, root);
  }
  
  draw(ctx, x, y) {
    const drawPosX = x + this.position.x;
    const drawPosY = y + this.position.y;

    this.drawImage(ctx, drawPosX, drawPosY);

    this.children.forEach((child) => child.draw(ctx, drawPosX, drawPosY));
  }

  ready() {
    // ...
  }

  step(delta) {
    // ...
  }

  drawImage(ctx, drawPosX, drawPosY) {
    // ...
  }

  destroy() {
    this.children.forEach((child) => child.destroy());
    this.parent.removeChild(this);
  }

  addChild(gameObject) {
    gameObject.parent = this;
    this.children.push(gameObject);
  }

  removeChild(gameObject) {
    events.unsubscribe(gameObject);
    this.children = this.children.filter((g) => g !== gameObject);
  }
}
