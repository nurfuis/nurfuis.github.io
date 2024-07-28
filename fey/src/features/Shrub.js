import { Vector2 } from "../Vector2.js";
import { GameObject } from "../GameObject.js";

export class Shrub extends GameObject {
  constructor() {
    super({
      position: new Vector2(8, 8),
    });
    this.type = "shrub";

    this.radius = 5;
    this.width = this.radius * 2;
    this.height = this.radius * 2;

    this.color = "rgba(184, 134, 11, 1)";
    this.stroke = "rgba(127, 104, 52, 1)";
  }

  ready() {}

  step(delta, root) {}

  drawImage(ctx) {
    const circleOffsets = [
      { x: -this.radius * 2 - 3, y: -this.radius },
      { x: -3, y: -this.radius },
      { x: this.radius * 2 - 3, y: -this.radius },
    ];
    ctx.beginPath();

    for (let i = 0; i < this.density; i++) {
      const offsetX = this.center.x + circleOffsets[i].x;
      const offsetY = this.center.y + circleOffsets[i].y;
      ctx.arc(offsetX, offsetY, this.radius * 0.7, 0, Math.PI * 2, true); // Draw a circle with adjusted radius
    }
    ctx.strokeWidth = 1; // Adjust to your desired thickness

    ctx.strokeStyle = this.stroke;
    ctx.fillStyle = this.color;
    ctx.stroke(); // Draw the circle
    ctx.fill(); // Add a semi-transparent fill

    ctx.closePath(); // Close the path
    ctx.strokeWidth = 1; // Adjust to your desired thickness
  }
}
