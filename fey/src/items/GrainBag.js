import { GameObject } from "../GameObject.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { events } from "../Events.js";
import { resources } from "../utils/loadResources.js";
import { ITEM_COLOR } from "../constants.js";

export class GrainBag extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y),
    });
    this.radius = 12;
    const sprite = new Sprite({
      resource: resources.images.grainBag,
      position: new Vector2(-16, -26),
      scale: 1,
    });
    this.addChild(sprite);
  }

  ready() {
    events.on("PLAYER_POSITION", this, (pos) => {
      if (!pos.canPickUpItems) return;

      const playerX = pos.x;
      const playerY = pos.y;
      const radius = pos.radius;

      const distance = Math.sqrt(
        Math.pow(playerX - this.position.x, 2) +
          Math.pow(playerY - this.position.y, 2)
      );

      if (distance <= radius + this.radius) {
        this.onCollideWithPlayer();
      }
    });
  }

  onCollideWithPlayer() {
    this.destroy();
    events.emit("PLAYER_PICKS_UP_ITEM", {
      image: resources.images.grainBag,
      name: "Grain Bag",
    });
  }
  drawCircle(ctx, position, radius) {
    ctx.strokeStyle = ITEM_COLOR;

    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  drawImage(ctx) {
    this.drawCircle(ctx, this.position, this.radius);
  }
}
