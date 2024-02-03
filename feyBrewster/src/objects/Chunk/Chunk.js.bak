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
  
  addTerrain(terrain) {
    terrain.makeChunk(this.x, this.y, this.world, this.data, this.chunkId);
  } 
  
  removeTerrain(terrain) {
    terrain.removeChunk(this.chunkId);
  }
  
  addScenery(scenery) {
    scenery.makeChunk(this.x, this.y, this.world, this.data, this.chunkId);
  } 
  
  removeScenery(scenery) {
    scenery.removeChunk(this.chunkId);
  }  

  addEntities(entities) {
    entities.addChunkEntities(this.x, this.y, this.world, this.data, this.chunkId);
  }
  
  removeEntities(entities) {
    entities.removeChunkEntities(this.chunkId);
  }
  
  addForeground(foreground) {
    foreground.addChunkForeground(this.x, this.y, this.world, this.data, this.chunkId);
  }
  
  removeForeground(foreground) {
    foreground.removeChunkForeground(this.chunkId);
  }
    
  addOverlay(overlay) {
    overlay.makeChunk(this.x, this.y, this.world, this.data, this.chunkId);
  } 
  
  removeOverlay(overlay) {
    overlay.removeChunk(this.chunkId);
  }
  
  addCollision(collision) {
    collision.makeColliders(this.x, this.y, this.world, this.data, this.chunkId);       
  }
  
  removeCollision(collision) { 
    collision.removeColliders(this.chunkId);
  }
      
  addScripts(scripts) {
    scripts.addChunkScripts(this.x, this.y, this.world, this.data, this.chunkId);
  } 
  
  removeScripts(scripts) {
    scripts.removeChunkScripts(this.chunkId);
  }   
}