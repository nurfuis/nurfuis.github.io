import { events } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { iterateChunkTiles } from "../../helpers/iterateChunkTiles.js";

import { Slime } from "./Slime/Slime.js";
import { Spark } from "./Spark/Spark.js";

export class Entities extends GameObject {
  constructor() {
    super({});
    
  }
  async removeChunkEntities(chunkId) {
    const entitiesToDespawn = this.children.filter((child) => child.chunkId === chunkId);

    for (const entity of entitiesToDespawn) {
      await new Promise((resolve) => setTimeout(() => {
        entity.despawn();
        resolve();
      }, 0));
    }
  }
  async addChunkEntities(chunkX, chunkY, world, chunkData, chunkId) {
  	/*
    await iterateChunkTiles(chunkX, chunkY, chunkData, async (entry, posX, posY, tileSets) => {
      await new Promise((resolve) => setTimeout(() => {
        this.addEntity(chunkData.layers[1].data[entry], posX, posY, world, chunkId);
        resolve();
      }, 0));
    });
    */
    if (chunkData.layers && chunkData.layers[2] && chunkData.layers[2].objects) {
      
      const numObjects = chunkData.layers[2].objects.length;
      for (let i = 0; i < numObjects; i++) {
      	const entityObject = chunkData.layers[2].objects[i];
      	
				if (entityObject) {
					console.log(entityObject.name);			
					switch(entityObject.name) {
						case "slime":
							let slime = new Slime(entityObject.x, entityObject.y, world, chunkId);
							this.addChild(slime);
							break;
						case "spark":
							let spark = new Spark(entityObject.x, entityObject.y, world, chunkId);
							this.addChild(spark);
							break;        
					}
				}      	      	      	      
      }    
    }
  }  
}


