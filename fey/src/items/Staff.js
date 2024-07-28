import { GameObject } from "../GameObject.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { resources } from "../utils/loadResources.js";
import { Animations } from "../Animations.js";
import { FrameIndexPattern } from "../FrameIndexPattern.js";
import {
  SWING_LEFT,
  SWING_DOWN,
  SWING_UP,
  SWING_RIGHT,
} from "../animations/attackAnimations.js";
import { LEFT, RIGHT, UP, DOWN } from "../Input.js";

export class Staff extends GameObject {
  constructor(x, y, world, direction) {
    super({});
    this.x = x;
    this.y = y;
    this.world = world;
    this.direction = direction;
  }
  ready() {
    if (this.direction === LEFT) {
      const sprite = new Sprite({
        frameSize: new Vector2(96, 96),
        hFrames: 4,
        vFrames: 1,
        scale: 1,
        resource: resources.images.broom,
        position: new Vector2(-40, -32),
        animations: new Animations({
          swingLeft: new FrameIndexPattern(SWING_LEFT),
        }),
      });
      this.addChild(sprite);
    }
    if (this.direction === UP) {
      const sprite = new Sprite({
        frameSize: new Vector2(96, 96),
        hFrames: 4,
        vFrames: 1,
        scale: 1,
        resource: resources.images.broom,
        position: new Vector2(-32, -32),
        animations: new Animations({
          swingUp: new FrameIndexPattern(SWING_UP),
        }),
      });
      this.addChild(sprite);
    }
    if (this.direction === RIGHT) {
      const sprite = new Sprite({
        frameSize: new Vector2(96, 96),
        hFrames: 4,
        vFrames: 1,
        scale: 1,
        resource: resources.images.broom,
        position: new Vector2(-26, -32),
        animations: new Animations({
          swingRight: new FrameIndexPattern(SWING_RIGHT),
        }),
      });
      this.addChild(sprite);
    }
    if (this.direction === DOWN) {
      const sprite = new Sprite({
        frameSize: new Vector2(96, 96),
        hFrames: 4,
        vFrames: 1,
        scale: 1,
        resource: resources.images.broom,
        position: new Vector2(-32, -32),
        animations: new Animations({
          swingDown: new FrameIndexPattern(SWING_DOWN),
        }),
      });
      this.addChild(sprite);
    }
  }
}
