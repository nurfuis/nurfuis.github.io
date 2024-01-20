import {GameObject} from "../../GameObject.js";

export class Chunk extends GameObject{
  constructor(chunkX, chunkY, chunkWorld, chunkData, chunkId) {
    super({
    });
    this.x = chunkX;
    this.y = chunkY;
    this.world = chunkWorld;
    this.data = chunkData;
    this.chunkId = chunkId;
  } 
  addCollision(collision) {
    collision.makeColliders(this.x, this.y, this.world, this.data, this.chunkId);       
  }
  removeCollision(collision) { 
    collision.removeColliders(this.chunkId);
  }  
  
  addTerrain(terrain) {
    terrain.makeChunk(this.x, this.y, this.world, this.data, this.chunkId);
  } 
  removeTerrain(terrain) {
    terrain.removeChunk(this.chunkId);
  }
  
  spawnEntities(entities) {
    entities.spawnChunkEntities(this.x, this.y, this.world, this.data, this.chunkId);
  }
  despawnEntities(entities) {
    entities.despawnChunkEntities(this.chunkId);
  };

  spawnForeground(foreground) {
    foreground.spawnChunkForeground(this.x, this.y, this.world, this.data, this.chunkId);
  }
  despawnForeground(foreground) {
    foreground.despawnChunkForeground(this.chunkId);
  };
  
 
}