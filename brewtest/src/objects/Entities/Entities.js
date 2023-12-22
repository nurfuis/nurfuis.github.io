// Entities.js
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { EntityLayer } from "./EntityLayer.js";

export class Entities extends GameObject {
  constructor() {
    super({});
    this.players = [];
  } // end of consctructor
  
  // Methods
  loadEntities(chunkX, chunkY, chunkData) {
    const entities = new EntityLayer(chunkX, chunkY, chunkData);
    this.addChild(entities);
  }
}


