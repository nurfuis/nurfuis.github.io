// Inventory.js
import {GameObject} from "../../GameObject.js";
import {Sprite} from "../../Sprite.js";
import {resources} from "../../Resource.js";
import {Vector2} from "../../Vector2.js";
import {events} from "../../Events.js";

export class Inventory extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 1)
      
    });
    this.nextId = 0;
    this.items = [
      // {
        // id: -1,
        // image: resources.images.rod
      // },
      // {
        // id: -2,
        // image: resources.images.rod
      // },      
    ]
    
    // React to picking up an item
    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.nextId += 1;
      this.items.push({
        id: this.nextId,
        image: resources.images.oat,
      })
      this.renderInventory();
    })
    
/*     setTimeout(() => {
      this.removeFromInventory(-2)
    }, 2000) */
    
    // draw initial state on boot
    this.renderInventory();
  }
  renderInventory() {
    this.children.forEach(child => child.destroy())
    
    this.items.forEach((item, index) => {
      const sprite = new Sprite({
        resource: item.image,
        position: new Vector2(index*12, 0),
        scale: .6,

      })
      this.addChild(sprite);      
    })
  }
  removeFromInventory(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.renderInventory();
  }
}
