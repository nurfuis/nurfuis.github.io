// Collision.js
import { GameObject } from "../../GameObject.js";
import { Collider } from "./Collider.js";
import { iterateChunkTiles } from "../../helpers/iterateChunkTiles.js";

export class Collision extends GameObject {
  constructor() {
    super({});        
  }
  async removeColliders(chunkId) {
    const collidersToRemove = this.children.filter((child) => child.chunkId === chunkId);
    for (const collider of collidersToRemove) {
      await new Promise((resolve) => setTimeout(() => {
        collider.remove();
        resolve();
      }, 0));
    }
  }
  async makeColliders(chunkX, chunkY, world, chunkData, chunkId) {
    await iterateChunkTiles(chunkX, chunkY, chunkData, (entry, posX, posY, tileSets) => {
      this.addCollider(chunkData.layers[2].data[entry], tileSets, posX, posY, world, chunkId);
    });
  }  

  addCollider(collidersData, tileSets, x, y, world, chunkId) {
    if (collidersData >= 1) {      
      const collider = new Collider(collidersData, tileSets, x, y, world, chunkId);
      this.addChild(collider);   
    }    
  }  
}
