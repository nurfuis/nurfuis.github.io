// Tile.js
import {resources} from "../../../Resource.js";
import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {Sprite} from "../../../Sprite.js";
import {gridSize} from "../../../helpers/grid.js";

export class Tile extends GameObject{
  constructor(x, y, tileData, tileSets) {
    super({
      position: new Vector2(x,y)
    });
    // console.log(tileSets);
    const fileName = tileSets[0].source;
    const parts = fileName.split('.');
    const spriteSheet = parts[0]; 
    // console.log(spriteSheet);
    const sheetX = resources.images[spriteSheet].width;
    const sheetY = resources.images[spriteSheet].height;
    // console.log(sheetX,sheetY); // problem
    const h = sheetX / gridSize;
    const v = sheetY / gridSize;
    const sprite = new Sprite({
      resource: resources.images[spriteSheet], 
      frameSize: new Vector2(16,16),
      hFrames: h,
      vFrames: v,
      spacing: 0,
      frame: tileData-1, 
    })
    this.addChild(sprite);  
  }  
  
}