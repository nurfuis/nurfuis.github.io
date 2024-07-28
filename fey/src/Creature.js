import { AutomatedInput } from "./utils/AutomatedInput.js";
import { Vector2 } from "./Vector2.js";
import { MoveUnit } from "./components/MoveUnit.js";
import { GameObject } from "./GameObject.js";
import { AdjustHealth } from "./components/AdjustHealth.js";
import { GatherResource } from "./components/GatherResource.js";
import { Procreate } from "./components/subscribers/Procreate.js";

export class Creature extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0),
    });
    this.width = 3;
    this.height = 3;
    this.radius = 2;
    this.speed = 0.2;
    this.color = "rgba(75, 50, 67, 1)";
    this.stroke = "rgba(26, 17, 16, 1)";

    this.move = new MoveUnit(this);
    this.health = new AdjustHealth(this);
    this.ability = new GatherResource(this, this.radius * 2, 1);

    this.procreate = new Procreate(this);

    this.input = new AutomatedInput();
  }

  tryMove() {
    let newX = this.position.x;
    let newY = this.position.y;

    if (this.input.direction) {
      switch (this.input.direction) {
        case "LEFT":
          newX = this.move.left(this.speed);
          break;
        case "RIGHT":
          newX = this.move.right(this.speed);
          break;
        case "UP":
          newY = this.move.up(this.speed);
          break;
        case "DOWN":
          newY = this.move.down(this.speed);
          break;
      }
    }
    return new Vector2(newX, newY);
  }

  reproduce() {
    const offspring = new Creature();
    offspring.position = this.position.duplicate();
    this.parent.addChild(offspring);
  }

  checkTerrainType(root, newPos) {
    const targetId = "world";
    const world = root.layers.find((layer) => layer.id === targetId);

    // Loop through tiles in the world layer
    for (const tile of world.children) {
      // Check for AABB overlap
      if (this.checkForAABBOverlap(this, newPos, tile)) {
        // If there's overlap, check the tile's type (assuming a 'type' property)
        return tile.type;
      }
    }

    // If no overlap with any tile, return 'undefined' (or appropriate value)
    return undefined;
  }
  step(delta, root) {
    if (this.currentHealth <= 0) {
      // console.log('imded')
      for (let i = 0; i < this.burrow.residents.length; i++) {
        if (this.burrow.residents[i] === this) {
          this.burrow.residents.splice(i, 1);
        }
      }
      this.destroy();
    }
    const newPos = this.tryMove();
    const terrainType = this.checkTerrainType(root, newPos);

    if (terrainType != "water") {
      this.position = newPos; // Update position if allowed
    } else {
      return;
      // Handle case where movement is not allowed (e.g., stay at current position)
    }
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

  checkForAABBOverlap(obj1, obj1Pos, obj2) {
    const obj1Right = obj1Pos.x + obj1.width;
    const obj1Bottom = obj1Pos.y + obj1.height;
    const obj2Right = obj2.position.x + obj2.width;
    const obj2Bottom = obj2.position.y + obj2.height;

    return (
      obj1Pos.x < obj2Right &&
      obj1Right > obj2.position.x &&
      obj1Pos.y < obj2Bottom &&
      obj1Bottom > obj2.position.y
    );
  }
}
