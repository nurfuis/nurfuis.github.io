import {resources} from "../../Resource.js";
import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {Sprite} from "../../Sprite.js";
import {gridSize} from "../../helpers/grid.js";
import {obstacles} from "../../helpers/grid.js";

export class Collider extends GameObject{
  constructor(tileData, tileSets, x, y, world, chunkId) {
    super({
      position: new Vector2(x,y)
    });
    this.x = x;
    this.y = y;
    this.world = world;
    this.chunkId = chunkId;
    this.tileData = tileData;
    this.tileSets = tileSets;   
  } 
  ready() {
    this.place();
  };
  show() {
    if (this.tileData && this.tileSets) {
      const fileName = this.tileSets[0].source;
      const parts = fileName.split('.');
      const spriteSheet = parts[0]; 
      const sprite = new Sprite({
        position: new Vector2(0, 0),
        resource: resources.images[spriteSheet], 
        frameSize: new Vector2(16,16),
        hFrames: 16,
        vFrames: 16,
        spacing: 0,
        frame: this.tileData-1, 
      })
    this.addChild(sprite); 
    };    
  }
  place() {
    obstacles.push({ id: `${this.x},${this.y},${this.world}`, owner: this.chunkId });    
  }
  remove() {
    for (let i = obstacles.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues
      if (obstacles[i].id === `${this.x},${this.y},${this.world}` && obstacles[i].owner === this.owner) {
        obstacles.splice(i, 1); // Remove only the matched element
        break; // Stop iterating once found
      }
    }
    this.destroy();
  }
}