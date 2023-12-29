// CollidersLayer.js
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { events } from "../../Events.js";
import { colliders } from "../../../main.js";
export class CollidersLayer extends GameObject {
  constructor(x, y, data) {
    super({});
    this.x = x; // X-coordinate of the chunk
    this.y = y; // Y-coordinate of the chunk
    this.chunkData = data; // Chunk data, typically an array of tiles or other relevant information
    this.chunkId = this.x + ',' + this.y;
    // this.render(this.x, this.y, this.chunkData);
    this.render(this.chunkData);
    
    // console.log(this);
  }
  render(chunkData) {
    const tileWidth = chunkData.tilewidth;
    const tileHeight = chunkData.tileheight;    
    const chunkWidth = chunkData.width * tileWidth;
    const chunkHeight = chunkData.height * tileHeight;
    // Calculate the starting and ending chunk indices for the visible area
    const startX = Math.floor((this.x * chunkHeight) / tileWidth);
    const endX = Math.ceil((this.x * chunkWidth + chunkWidth) / tileWidth);
    const startY = Math.floor((this.y * chunkHeight) / tileHeight);
    const endY = Math.ceil((this.y * chunkHeight + chunkHeight) / tileHeight);    
    // LOAD Colliders
    let entry = 0;   
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // Calculate the actual position of the object on the screen
        const posX = x * tileWidth;
        const posY = y * tileHeight;     
        this.loadColliders(posX, posY, chunkData.layers[2].data[entry]);      
        entry++
      }
    } 
  }
  loadColliders(x, y, collidersData) {
    if (collidersData >= 1) {      
      colliders.addCollider(x, y, this.chunkId);
    }    
  }   
}