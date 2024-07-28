import { Vector2 } from "../Vector2.js";
import { GameObject } from "../GameObject.js";

export class Perch extends GameObject {
  constructor() {
    super({
      position: new Vector2(8, 8),
    });
    this.type = "perch";

    this.radius = 5;
    this.width = this.radius * 2;
    this.height = this.radius * 2;

    this.color = "rgba(26, 17, 16, 1)";
  }

  ready() {}

  step(delta, root) {
  
  }

  drawImage(ctx) {
    ctx.beginPath(); // Start a new path
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true); // Draw the circle
    ctx.strokeWidth = 5; // Adjust to your desired thickness

    ctx.strokeStyle = "black";
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "brown";
    ctx.stroke(); // Draw the circle
    ctx.fill(); // Add a semi-transparent fill

    ctx.closePath(); // Close the path
    ctx.strokeWidth = 1; // Adjust to your desired thickness
  }
}
