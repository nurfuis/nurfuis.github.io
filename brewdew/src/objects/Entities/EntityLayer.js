// EntityLayer.js
import { events } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { Goblin } from "./Goblin/Goblin.js";
import { Granny } from "./Granny/Granny.js";
import { Slime } from "./Slime/Slime.js";

export class EntityLayer extends GameObject {
  constructor(x, y, world, data) {
    super({});
    this.x = x; // X-coordinate of the chunk
    this.y = y; // Y-coordinate of the chunk
    this.world = world;
    
    this.chunkData = data; // Chunk data, typically an array of tiles or other relevant information
    this.chunkId = this.x + ',' + this.y + ',' + this.world;
    this.render(this.chunkData);
    
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
    // LOAD ENTITIES
    let entry = 0;   
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // Calculate the actual position of the object on the screen
        const posX = x * tileWidth;
        const posY = y * tileHeight;        
        this.loadEntity(posX, posY, chunkData.layers[1].data[entry]);
        entry++;
      }
    }
  }
  // Load entity 
  loadEntity(x, y, entityData) {
    // console.log('load entity: ' + entityData);
    switch(entityData) {
      case 259:
        let granny = new Granny(x, y);
        this.addChild(granny);
        break;
      case 257:
        let slime = new Slime(x, y);
        this.addChild(slime);
        break;
    }
  }    
}