import { events } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { iterateChunkTiles } from "../../helpers/iterateChunkTiles.js";

import { Slime } from "./Slime/Slime.js";
import { Spark } from "./Spark/Spark.js";
import { WoodenFermenter } from "./Equipment/WoodenFermenter.js";
import { WoodenKettle } from "./Equipment/WoodenKettle.js";
import { WoodenMashTun } from "./Equipment/WoodenMashTun.js";
import { TwoTop } from "./Furniture/TwoTop.js";
import { Barstool } from "./Furniture/Barstool.js";


const validEntities = {
  Slime: Slime,
  TwoTop: TwoTop,
  Barstool: Barstool,
  WoodenFermenter: WoodenFermenter,
  WoodenKettle: WoodenKettle,
  WoodenMashTun: WoodenMashTun
};
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
      	const entityData = chunkData.layers[2].objects[i];
        
        if (!validEntities[entityData.type]){
          return;
        }     
        
        const entityDataX = entityData.x + chunkX * 512;
        const entityDataY = entityData.y + chunkY * 512;         
        const newEntity = new validEntities[entityData.type]();
        
        this.addChild(newEntity);                
        
        newEntity.chunkId = chunkId;
        newEntity.joinWorld(entityDataX, entityDataY, world);
        newEntity.overlayPlane = this.overlay;  
        
        if (entityData.properties && entityData.properties.length > 0){
          newEntity.setProperties(entityData)           
        }
        newEntity.addSkin();
        
        newEntity.spawn();        
      }    
    }
  }  
}


