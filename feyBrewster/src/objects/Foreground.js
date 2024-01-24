import { GameObject } from "../GameObject.js";
import { events } from "../Events.js";
import { Vector2 } from "../Vector2.js";
import { iterateChunkTiles } from "../helpers/iterateChunkTiles.js";

export class Foreground extends GameObject {
  constructor() {
    super({});        
  }
  async removeChunkForeground(chunkId) {
    const objectsToDespawn = this.children.filter((child) => child.chunkId === chunkId);

    for (const object of objectsToDespawn) {
     await new Promise((resolve) => setTimeout(() => {
        
        object.despawn();
        
        resolve();
      }, 0));
    }
  }
  async addChunkForeground(chunkX, chunkY, world, chunkData, chunkId) {
    if (chunkData.layers && chunkData.layers[3] && chunkData.layers[3].objects) {
      
      const foregroundObject = chunkData.layers[3].objects[0];

      if (foregroundObject) {
      
      	switch(foregroundObject.name) {
      		case "spawnLocation":
					events.emit("SPAWN_ZONE_READY", {
						x: foregroundObject.x, 
						y: foregroundObject.y, 
						world: world,  	
        	});
        }
      }
    }
  }
}