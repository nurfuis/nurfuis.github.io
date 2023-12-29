// Entities.js
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { EntityLayer } from "./EntityLayer.js";

export class Entities extends GameObject {
  constructor() {
    super({});
  } // end of consctructor
  
  // Methods
  loadEntities(chunkX, chunkY, world, chunkData) {
    const entities = new EntityLayer(chunkX, chunkY, world, chunkData);
    this.addChild(entities);
    
  }
  removeEntities(chunkX, chunkY, world) {
    // Find the matching TileLayer child
    const chunkId = `${chunkX},${chunkY},${world}`;    
    
    const entityLayerToRemove = this.children.find(
      (child) => child instanceof EntityLayer && child.chunkId === chunkId
    );

    if (entityLayerToRemove) {
      const removeThese = entityLayerToRemove.children;
        for (let i = 0; i < removeThese.length; i++) {
          // console.log(removeThese[i]);
          removeThese[i].deSpawn();
        }
      this.removeChild(entityLayerToRemove);
      
    } else {
      console.warn("EntityLayer not found for chunk:", chunkX, chunkY);
    }
  }   
}


