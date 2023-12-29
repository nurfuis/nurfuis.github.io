import { GameObject } from "../../GameObject.js";
import { events } from "../../Events.js";
import { Vector2 } from "../../Vector2.js";
import { Tile } from "./Tile/Tile.js";
import { Water } from "./Water/Water.js";
import { Grass } from "./Grass/Grass.js";

export class TileLayer extends GameObject {
  constructor(x, y, world, data) {
    super({});
    this.x = x; // X-coordinate of the chunk
    this.y = y; // Y-coordinate of the chunk
    this.world = world;
    this.chunkData = data; // Chunk data, typically an array of tiles or other relevant information
    this.chunkId = this.x + ',' + this.y + ',' + this.world;
    this.render(this.chunkData);
  }
  render(chunkData) {
    const tileWidth = chunkData.tilewidth;
    const tileHeight = chunkData.tileheight;    
    const chunkWidth = chunkData.width * tileWidth;
    const chunkHeight = chunkData.height * tileHeight;
    const tileSets = chunkData.tilesets;
    // console.log(tileSets);
    // Calculate the starting and ending chunk indices for the visible area
    const startX = Math.floor((this.x * chunkHeight) / tileWidth);
    const endX = Math.ceil((this.x * chunkWidth + chunkWidth) / tileWidth);
    const startY = Math.floor((this.y * chunkHeight) / tileHeight);
    const endY = Math.ceil((this.y * chunkHeight + chunkHeight) / tileHeight);    
    
    // LOAD TILES    
    let entry = 0;   
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // Calculate the actual position of the object on the screen
        const posX = x * tileWidth;
        const posY = y * tileHeight;
        this.loadTile(posX, posY, chunkData.layers[0].data[entry], tileSets);
        entry++;
      }
    }   
  }      
  loadTile(x, y, tileData, tileSets) {
    if (tileData >= 1) {
      const tile = this.createTile(tileData, x, y, tileSets);
      this.addChild(tile);
    }
  }
  createTile(id, x, y, tileSets) {
    switch (id) {
      case 54:
        return new Water(x, y, id);
      case 19:
        return new Grass(x, y, id);
      default:
        return new Tile(x, y, id, tileSets);
    }
  }

}