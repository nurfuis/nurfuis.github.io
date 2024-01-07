// Tile.js
import {resources} from "../../../Resource.js";
import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {Sprite} from "../../../Sprite.js";

export class Tile extends GameObject{
  constructor(tileData, tileSets, x, y, world, chunkId) {
    super({
      position: new Vector2(x,y)
    });
    this.chunkId = chunkId;
    const fileName = tileSets[0].source;
    const parts = fileName.split('.');
    const spriteSheet = parts[0]; 

    const sprite = new Sprite({
      resource: resources.images[spriteSheet], 
      frameSize: new Vector2(16,16),
      hFrames: 16,
      vFrames: 16,
      spacing: 0,
      frame: tileData-1, 
    })
    this.addChild(sprite);  
  }
  makeTile(tileData){
    
  }
}