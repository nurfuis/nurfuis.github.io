// Items.js
import {events} from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { Oat } from "./Oat/Oat.js";
export class Items extends GameObject {
  constructor() {
    super({});
    // Handle item drops
    events.on("DROP_ITEM", this, (item) => {
      this.dropItem(item);
    });    
        
  } // end of consctructor
  
  // Methods
  dropItem(item) {
    const x = item.posX;
    const y = item.posY
    const itemName = item.name;
    
    let drop;
    switch (itemName) {
      case "Oat":
      drop = new Oat(x, y); 
    }
    this.addChild(drop);
  } 
  // loadItems(chunkX, chunkY, chunkData) {
    // const items = new ItemsLayer(chunkX, chunkY, chunkData);
    // this.addChild(items);
  // }
}
