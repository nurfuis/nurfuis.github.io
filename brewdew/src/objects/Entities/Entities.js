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
  async despawnChunkEntities(chunkId) {
    const entitiesToDespawn = this.children.filter((child) => child.chunkId === chunkId);

    for (const entity of entitiesToDespawn) {
      await new Promise((resolve) => setTimeout(() => {
        entity.despawn();
        resolve();
      }, 0));
    }
  }
  async spawnChunkEntities(chunkX, chunkY, world, chunkData, chunkId) {
    await iterateChunkTiles(chunkX, chunkY, chunkData, async (entry, posX, posY, tileSets) => {
      await new Promise((resolve) => setTimeout(() => {
        this.spawnEntity(chunkData.layers[1].data[entry], posX, posY, world, chunkId);
        resolve();
      }, 0));
    });
  }
  spawnEntity(entityData, x, y, world, chunkId) {
    switch(entityData) {
      case 257:
        let slime = new Slime(entityData, x, y, world, chunkId);
        this.addChild(slime);
        break;
      case 261:
        let spark = new Spark(entityData, x, y, world, chunkId);
        this.addChild(spark);
        break;        
    }
  }  
}


