import { GameObject } from "../GameObject.js";
import { events } from "../Events.js";
import { Vector2 } from "../Vector2.js";
import { iterateChunkTiles } from "../helpers/iterateChunkTiles.js";

export class Scripts extends GameObject {
  constructor() {
    super({});        
  }
  async removeChunkScripts(chunkId) {
    const objectsToDespawn = this.children.filter((child) => child.chunkId === chunkId);

    for (const object of objectsToDespawn) {
     await new Promise((resolve) => setTimeout(() => {
        
        object.despawn();
        
        resolve();
      }, 0));
    }
  }
  async addChunkScripts(chunkX, chunkY, world, chunkData, chunkId) {
  /*
    if (chunkData.layers && chunkData.layers[6] && chunkData.layers[6].objects) {
      
      const spawnLocation = chunkData.layers[6].objects[6];
      console.log(spawnLocation);
      if (spawnLocation.name === "spawnLocation") {          
        events.emit("SPAWN_ZONE_READY", {x: spawnLocation.x, y: spawnLocation.y, world: world});
      }
    }
  */
  
  }
}