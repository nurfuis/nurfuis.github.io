// Tiles.js
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { TileLayer } from "./TileLayer.js";

export class Tiles extends GameObject {
  constructor() {
    super({});
  } // end of consctructor
  
  // Methods
  loadTiles(chunkX, chunkY, chunkData) {
    const tiles = new TileLayer(chunkX, chunkY, chunkData);
    this.addChild(tiles);
  }
}