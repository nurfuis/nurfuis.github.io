import { GameObject } from "../GameObject.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { events } from "../Events.js";
import { resources } from "../utils/loadResources.js";

export class GrainBag extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y),
    });
    const sprite = new Sprite({
      resource: resources.images.grainBag,
      position: new Vector2(0, 0),
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

      if (
        Math.abs(playerX - this.globalPosition.x - 16) <= radius &&
        Math.abs(playerY - this.globalPosition.y - 16) <= radius
      ) {
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
}
