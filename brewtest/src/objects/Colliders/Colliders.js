// Colliders.js
import {events} from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { CollidersLayer } from "./CollidersLayer.js";

export class Colliders extends GameObject {
  constructor() {
    super({});
    this.colliders = [];
/*     // Bind events in the constructor
    events.on("ADD_COLLIDER", this, (x, y, owner) => {
      this.addCollider(x, y, owner); // Use the defined method to add
    });

    events.on("REMOVE_COLLIDER", this, (x, y, owner) => {
      this.removeCollider(collider); // Use the defined method to remove
    }); */
    
    events.on("COLLISION_DETECTED", this, (collider) => {
      // console.log(collider.collisionDetected, collider.location, collider.ownerId, collider.entityId);    
    });    
  } // end of consctructor
  // Methods
  addCollider(x, y, owner) {
    this.colliders.push({ location: `${x},${y}`, ownerId: owner });
    // Emit event or perform any additional actions for adding a collider
    // console.log(' COLLIDER_ADDED ' + ' location: ' + x + ',' + y + ' ownerId: ' + owner );
    // events.emit("COLLIDER_ADDED", { location: `${x},${y}`, ownerId: owner });
  }
  removeCollider(x, y, owner) {
    for (let i = this.colliders.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (this.colliders[i].location === `${x},${y}` && this.colliders[i].ownerId === `${owner}`) {
        this.colliders.splice(i, 1); // Remove only the matched element
        // Emit event or perform any actions for removing a collider
        // console.log(" COLLIDER_REMOVED " + " location: " + x + "," + y + " ownerId: " + owner );
        
        // events.emit("COLLIDER_REMOVED", { location: `${x},${y}`, ownerId: owner });        
        break; // Stop iterating once found
      }
    }
  }  
  loadColliders(chunkX, chunkY, chunkData) {
    const colliders = new CollidersLayer(chunkX, chunkY, chunkData); 
  }
}
