// Water.js
import { resources } from "../../Resource.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { Sprite } from "../../Sprite.js";
import { gridSize } from "../../helpers/grid.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import {
  WATER_MOVING_1,
  WATER_MOVING_2,
  WATER_MOVING_3,
} from "./waterAnimations.js";

const waterAnimations = ["waterMoving1", "waterMoving2", "waterMoving3"];

export class Water extends GameObject {
  constructor(x, y, tileData) {
    super({
      position: new Vector2(x, y),
    });
    this.sprite = new Sprite({
      resource: resources.images.terrain,
      frameSize: new Vector2(16, 16),
      hFrames: 16,
      vFrames: 16,
      spacing: 0,
      frame: tileData, 
      animations: new Animations({
        waterMoving1: new FrameIndexPattern(WATER_MOVING_1),
        waterMoving2: new FrameIndexPattern(WATER_MOVING_2),
        waterMoving3: new FrameIndexPattern(WATER_MOVING_3),
      }),
    });

    const randomAnimationIndex = Math.floor(
      Math.random() * waterAnimations.length
    );
    const randomAnimationName = waterAnimations[randomAnimationIndex];

    // Play the randomly chosen animation
    this.sprite.animations.play(randomAnimationName);

    this.addChild(this.sprite);
  }    
}