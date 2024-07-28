import { Vector2 } from "./Vector2.js";
import { GameObject } from "./GameObject.js";

export class Tile extends GameObject {
  constructor(x1, y1, x2, y2, index) {
    super({
      position: new Vector2(x1, y1),
    });
    this.position2 = new Vector2(x2, y2);

    this.width = x2 - x1;
    this.height = y2 - y1;
    this.index = index;
    this.color = "rgba(5, 155, 55, 1)";
    this.fog = false;
    this.selected = false;
  }
  step() {
    if (this.fog) {
      this.fog = false;
    }
    if (this.selected) {
      this.selected = false;
    }
  }
  drawImage(ctx) {
    if (this.fog) return;
    ctx.beginPath();
    ctx.rect(
      this.position.x + 1,
      this.position.y + 1,
      this.width - 2,
      this.height - 2
    );

    if (this.selected) {
      ctx.strokeStyle = "black"; // Change to your desired border color
      ctx.lineWidth = 1; // Adjust border width

      // Stroke the rectangle (outline)
      ctx.stroke();
    }

    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
  }
}
