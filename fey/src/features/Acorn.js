import { Vector2 } from "../Vector2.js";
import { GameObject } from "../GameObject.js";

export class Acorn extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0),
    });
    this.width = 2;
    this.height = 2;
    this.radius = 1;
  }

  ready() {
    this.expirationDate = 20000;
  }

  step(delta, root) {
    if (this.expirationDate > 0) {
      this.expirationDate -= delta;
    } else if (this.expirationDate <= 0) {
      this.destroy();
    }
  }

  drawImage(ctx) {
    ctx.beginPath(); // Start a new path
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true); // Draw the circle
    ctx.strokeWidth = 1; // Adjust to your desired thickness

    ctx.fillStyle = "rgba(255, 155, 55, 1)";
    ctx.strokeStyle = "brown";
    ctx.stroke(); // Draw the circle
    ctx.fill(); // Add a semi-transparent fill

    ctx.closePath(); // Close the path
    ctx.strokeWidth = 1; // Adjust to your desired thickness
  }
}
