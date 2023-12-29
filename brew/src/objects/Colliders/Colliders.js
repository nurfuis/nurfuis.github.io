// Colliders.js
import {events} from "../../Events.js";
import { CollidersLayer } from "./CollidersLayer.js";

export class Colliders {
  constructor() {
    this.colliders = [];

    events.on("COLLISION_DETECTED", this, (collider) => {
      // console.log(collider.collisionDetected, collider.location, collider.ownerId, collider.entityId);    
    });    
  } // end of consctructor
  // Methods
  addCollider(x, y, world, owner) {
    this.colliders.push({ colliderId: `${x},${y},${world}`, owner: owner });

  }
  removeCollider(x, y, world, owner) {
    for (let i = this.colliders.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (this.colliders[i].colliderId === `${x},${y},${world}` && this.colliders[i].owner === `${owner}`) {
        this.colliders.splice(i, 1); // Remove only the matched element

        break; // Stop iterating once found
      }
    }
  }
  removeColliderByOwner(x, y, world, owner) {
    for (let i = this.colliders.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (this.colliders[i].owner === `${owner}`) {
        this.colliders.splice(i, 1); 
        break; 
      }
    }
  }   
  removeChunkColliders(x, y, world, owner) {
    for (let i = this.colliders.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (this.colliders[i].owner === `${owner}`) {
        this.colliders.splice(i, 1); // Remove only the matched element
      }      
    }
  }
  
  loadChunkColliders(chunkX, chunkY, world, chunkData) {
    const chunkId = `${chunkX},${chunkY},${world}`; 
    const tileWidth = chunkData.tilewidth;
    const tileHeight = chunkData.tileheight;    
    const chunkWidth = chunkData.width * tileWidth;
    const chunkHeight = chunkData.height * tileHeight;
    // Calculate the starting and ending chunk indices for the visible area
    const startX = Math.floor((chunkX * chunkHeight) / tileWidth);
    const endX = Math.ceil((chunkX * chunkWidth + chunkWidth) / tileWidth);
    const startY = Math.floor((chunkY * chunkHeight) / tileHeight);
    const endY = Math.ceil((chunkY * chunkHeight + chunkHeight) / tileHeight);    
    // LOAD Colliders
    let entry = 0;   
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // Calculate the actual position of the object on the screen
        const posX = x * tileWidth;
        const posY = y * tileHeight; 
        if (chunkData.layers[2].data[entry] >= 1) {
          this.addCollider(posX, posY, world, chunkId ); 
        };
        entry++;
      }
    }    
  }
}
