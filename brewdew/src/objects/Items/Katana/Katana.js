// Katana.js
import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {Sprite} from "../../../Sprite.js";
import {resources} from "../../../Resource.js";
import {DOWN, LEFT, RIGHT, UP} from "../../../Input.js";
import {Animations} from "../../../Animations.js";
import {FrameIndexPattern} from "../../../FrameIndexPattern.js";
import { gridSize } from  "../../../helpers/grid.js";
import {isSpaceFree} from "../../../helpers/grid.js";

import {
  SWING_LEFT,
  SWING_UP,
  SWING_RIGHT,
  SWING_DOWN,
  
} from "./attackAnimations.js";
export class Katana extends GameObject {
  constructor(x, y, world, direction) {
    super({});
    this.x = x;
    this.y = y;
    this.world = world;
    this.direction = direction;
    this.itemId = 'katana';
    this.tryMove();
    
  }
  
  ready() {
    if (this.direction === LEFT) {
      const sprite = new Sprite({
        frameSize: new Vector2(48, 48),
        hFrames: 4,
        vFrames: 4,      
        scale: .9,
        resource: resources.images.katana,
        position: new Vector2(-19, -22),
        animations: new Animations({
          swingLeft: new FrameIndexPattern(SWING_LEFT),       
        }), 
      })
      this.addChild(sprite);
    }
    if (this.direction === UP) {
      const sprite = new Sprite({
        frameSize: new Vector2(48, 48),
        hFrames: 4,
        vFrames: 4,      
        scale: .9,
        resource: resources.images.katana,
        position: new Vector2(-11, -29),
        animations: new Animations({
          swingUp: new FrameIndexPattern(SWING_UP),       
        }), 
      })
      this.addChild(sprite);
    }
    if (this.direction === RIGHT) {
      const sprite = new Sprite({
        frameSize: new Vector2(48, 48),
        hFrames: 4,
        vFrames: 4,      
        scale: .9,
        resource: resources.images.katana,
        position: new Vector2(-7, -22),
        animations: new Animations({
          swingRight: new FrameIndexPattern(SWING_RIGHT),       
        }), 
      })
      this.addChild(sprite);
    }
    if (this.direction === DOWN) {
      const sprite = new Sprite({
        frameSize: new Vector2(48, 48),
        hFrames: 4,
        vFrames: 4,      
        scale: .9,
        resource: resources.images.katana,
        position: new Vector2(-14, -14),
        animations: new Animations({
          swingDown: new FrameIndexPattern(SWING_DOWN),       
        }), 
      })
      this.addChild(sprite);
    } 
    
  }
  
  tryMove() {
    //  This line extracts the input property from the root object and assigns it to the input variable.
    let nextX = this.x;
    let nextY = this.y;
    
    if (this.direction == DOWN) {
      nextY += gridSize;
    }
    if (this.direction == UP) {
      nextY -= gridSize;
    }
    if (this.direction == LEFT) {
      nextX -= gridSize;
    }
    if (this.direction == RIGHT) {
      nextX += gridSize;
    }
    // Check space availability using chunk manager
    if (isSpaceFree(nextX, nextY, this.world, this).collisionDetected === true) {
      const owner = isSpaceFree(nextX, nextY, this.world, this).owner;
      if (owner.isAlive) {
        // owner.isAlive = false;
        owner.onEnergyShield();
        
      }
    }
  };
}