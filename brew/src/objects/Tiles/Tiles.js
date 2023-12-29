// Tiles.js
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { TileLayer } from "./TileLayer.js";

export class Tiles extends GameObject {
  constructor() {
    super({});
  } // end of consctructor
  
  // Methods
  loadTiles(chunkX, chunkY, world, chunkData) {
    const tiles = new TileLayer(chunkX, chunkY, world, chunkData);
    this.addChild(tiles);
  }
  removeTiles(chunkX, chunkY, world) {
    // Find the matching TileLayer child
    const chunkId = `${chunkX},${chunkY},${world}`;    
    
    const tileLayerToRemove = this.children.find(
      (child) => child instanceof TileLayer && child.chunkId === chunkId
    );

    if (tileLayerToRemove) {
      this.removeChild(tileLayerToRemove);
    } else {
      console.warn("TileLayer not found for chunk:", chunkX, chunkY);
    }
  }   
}