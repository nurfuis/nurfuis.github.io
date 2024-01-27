import { events } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { iterateChunkTiles } from "../../helpers/iterateChunkTiles.js";

import { Slime } from "./Slime/Slime.js";
import { Spark } from "./Spark/Spark.js";
import { WoodFermenter } from "./Equipment/woodFermenter.js";

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
  async addChunkEntities(chunkX, chunkY, world, chunkData, chunkId, overlay) {

    if (chunkData.layers && chunkData.layers[2] && chunkData.layers[2].objects) {
      
      const numObjects = chunkData.layers[2].objects.length;
      for (let i = 0; i < numObjects; i++) {
      	const entityObject = chunkData.layers[2].objects[i];
        
        const entityX = entityObject.x + chunkX * 512;
        const entityY = entityObject.y + chunkY * 512;
              	
				if (entityObject) {
					switch(entityObject.name) {
						case "slime":
							let slime = new Slime(entityX, entityY, world, chunkId);
							this.addChild(slime);
							break;
						case "spark":
							let spark = new Spark(entityX, entityY, world, chunkId);
							this.addChild(spark);
							break;
						case "woodFermenter":
							let woodFermenter = new WoodFermenter(entityX, entityY, world, chunkId, overlay, entityObject);
							this.addChild(woodFermenter);
							break;              
					}
				}      	      	      	      
      }    
    }
  }  
}


