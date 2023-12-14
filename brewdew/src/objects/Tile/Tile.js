// Tile.js
import {resources} from "../../Resource.js";
import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {Sprite} from "../../Sprite.js";
import {gridSize} from "../../helpers/grid.js";

export class Tile extends GameObject{
  constructor(x, y, tileData) {
    super({
      position: new Vector2(x,y)
    });
    const sprite = new Sprite({
      resource: resources.images.terrain, 
      frameSize: new Vector2(16,16),
      hFrames: 16,
      vFrames:16,
      spacing: 0,
      frame: tileData-1, 
    })
    this.addChild(sprite);  
  }  
  
}