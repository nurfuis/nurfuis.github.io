import { GameObject } from "./GameObject.js";
import { Vector2 } from "./Vector2.js";
import { events } from "./Events.js";
import { Sprite } from "./Sprite.js";

export class Inventory extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 1),
    });

    this.nextId = 0;
    this.items = [];

    events.on("PLAYER_PICKS_UP_ITEM", this, (data) => {
      this.nextId += 1;
      this.items.push({ id: this.anextId, image: data.image });

    //   setTimeout(() => {
    //     this.removeFromInventory(this.items[0].id);
    //   }, 12000);
      this.renderInventory();
    });

    this.renderInventory();
  }
  renderInventory() {
    this.children.forEach((child) => child.destroy());

    this.items.forEach((item, index) => {
      const sprite = new Sprite({
        resource: item.image,
        position: new Vector2(index * 32, 0),
      });
      this.addChild(sprite);
    });
  }
  removeFromInventory(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.renderInventory();
  }
}
