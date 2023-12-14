import { GameObject } from "./GameObject.js";
import { Vector2 } from "./Vector2.js";
import { Tile } from "./objects/Tile/Tile.js";
import { Water } from "./objects/Water/Water.js";
import { Grass } from "./objects/Grass/Grass.js";
import { Goblin } from "./objects/Goblin/Goblin.js";

export class Chunk extends GameObject {
  constructor(x, y, data) {
    super({});
    this.x = x; // X-coordinate of the chunk
    this.y = y; // Y-coordinate of the chunk
    this.chunkData = data; // Chunk data, typically an array of tiles or other relevant information
    this.chunkId = this.x + ',' + this.y;
    this.walls = []; 
    this.render(this.x, this.y, this.chunkData);
  }
           
  // Method to render the chunk to a canvas
  async render(xOffset, yOffset, chunkData) {
    // Define chunk and tile dimensions

    const CHUNK_WIDTH = 256;
    const CHUNK_HEIGHT = 256;
    const TILE_WIDTH = 16;
    const TILE_HEIGHT = 16;

    // Calculate the starting and ending chunk indices for the visible area
    const startX = Math.floor((xOffset * CHUNK_HEIGHT) / TILE_WIDTH);
    const endX = Math.ceil((xOffset * CHUNK_WIDTH + CHUNK_WIDTH) / TILE_WIDTH);
    const startY = Math.floor((yOffset * CHUNK_HEIGHT) / TILE_HEIGHT);
    const endY = Math.ceil((yOffset * CHUNK_HEIGHT + CHUNK_HEIGHT) / TILE_HEIGHT);
    // console.log(startX + ', ' + startY + ' , ' + endX + ' , ' + endY);
    
    // Iterate through the visible tile indices and create tiles, add collisionData, and get items
    let id = 0;   
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        
        // Calculate the actual position of the object on the screen
        const tileX = x * TILE_WIDTH;
        const tileY = y * TILE_HEIGHT;
        
        // LOAD TILES
        this.loadTile(tileX, tileY, chunkData.layers[0].data[id]);
        
        // LOAD ENTITIES
        this.loadEntity(tileX, tileY, chunkData.layers[1].data[id]);
        
        // LOAD WALLS
        this.loadWall(tileX, tileY, chunkData.layers[2].data[id]);      
        
        id++
      }
    }        
  }
  
  loadWall(x, y, wallData) {
    if (wallData >= 1) {
      this.walls.push(`${x},${y}`);
    }    
  }
  
  loadTile(x, y, tileData) {
    if (tileData >= 1) {
      const terrain = this.createTerrain(tileData, x, y);
      this.addChild(terrain);
    }
  }
  // Add entity checks
  loadEntity(x, y, entityData) {
    if (entityData >= 1) {
      const entity = new Goblin(x, y);
      this.addChild(entity);
    } 
  }    

  createTerrain(id, x, y) {
    switch (id) {
      case 54:
        return new Water(x, y, id);
      case 19:
        return new Grass(x, y, id);
      default:
        return new Tile(x, y, id);
    }
  }
  
}