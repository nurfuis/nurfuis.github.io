import { Vector2 } from "../Vector2.js";
import { randomInt } from "../utils/randomInt.js";
import { Acorn } from "./Acorn.js";
import { GameObject } from "../GameObject.js";

export class Sapling extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0),
    });
    this.type = "sapling";

    this.radius = 4;
    this.width = this.radius * 2;
    this.height = this.radius * 2;

    this.color = "rgba(46, 61, 53, 0.8)";
    this.stroke = "rgba(26, 17, 16, 1)";
  }

  ready() {}

  step(delta, root) {
    // const random = randomInt(0, 100);
    // const randomOffsetX =
    //   randomInt(0, this.radius * 2) * (randomInt(0, 1) === 0 ? -1 : 1); // Random offset for X
    // const randomOffsetY =
    //   randomInt(0, this.radius * 2) * (randomInt(0, 1) === 0 ? -1 : 1); // Random offset for Y
    // if (random === 0) {
    //   const acorn = new Acorn();
    //   acorn.position.x = this.position.x + randomOffsetX;
    //   acorn.position.y = this.position.y + randomOffsetY;
    //   this.addChild(acorn);
    // }
  }

  drawImage(ctx) {
    ctx.beginPath(); // Start a new path
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true); // Draw the circle
    ctx.strokeWidth = 1; // Adjust to your desired thickness

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.stroke;
    ctx.stroke(); // Draw the circle
    ctx.fill(); // Add a semi-transparent fill

    ctx.closePath(); // Close the path
    ctx.strokeWidth = 1; // Adjust to your desired thickness
  }
}
