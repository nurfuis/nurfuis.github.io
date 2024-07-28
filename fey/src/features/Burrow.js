import { Vector2 } from "../Vector2.js";
import { GameObject } from "../GameObject.js";
import { Creature } from "../Creature.js";

export class Burrow extends GameObject {
  constructor() {
    super({
      position: new Vector2(8, 8),
    });
    this.type = "burrow";

    this.radius = 5;
    this.width = this.radius * 2;
    this.height = this.radius * 2;

    this.color = "rgba(170, 135, 54, 1)";
    this.stroke = "rgba(26, 17, 16, 1)";

    this.residents = [];
  }

  // addResident(root) {
  //   const newCreature = new Creature();
  //   newCreature.position.x = this.position.x;
  //   newCreature.position.y = this.position.y;
  //   newCreature.burrow = this;
  //   this.residents.push(newCreature);

  //   const targetId = "ground";
  //   const ground = root.layers.find((layer) => layer.id === targetId);
  //   ground.addChild(newCreature);
  // }
  landSurvey() {}
  ready() {
    this.landSurvey();
  }

  step(delta, root) {
    // if (this.residents.length === 0) {
    //   this.addResident(root);
    // }
  }

  drawImage(ctx) {
    ctx.beginPath(); // Start a new path
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true); // Draw the circle
    ctx.strokeWidth = 2; // Adjust to your desired thickness

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.stroke;
    ctx.stroke(); // Draw the circle
    ctx.fill(); // Add a semi-transparent fill

    ctx.closePath(); // Close the path
    ctx.strokeWidth = 1; // Adjust to your desired thickness
  }
}
