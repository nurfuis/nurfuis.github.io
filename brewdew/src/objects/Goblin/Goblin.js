// Goblin.js
import { resources } from "../../Resource.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { Sprite } from "../../Sprite.js";
import { gridSize } from "../../helpers/grid.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";

export class Goblin extends GameObject {
  constructor(x, y, tileData) {
    super({
      position: new Vector2(x, y),
    });
    this.sprite = new Sprite({
      resource: resources.images.goblin,
      frameSize: new Vector2(16, 16),
      hFrames: 1,
      vFrames: 1,
      spacing: 0,
      frame: 0, 
    })
    this.addChild(this.sprite);
  }    
}