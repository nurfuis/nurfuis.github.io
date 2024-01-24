import { GameObject } from "./GameObject.js";
import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";
import { gridSize } from "./helpers/grid.js";
const stageWidth = 1280;
const stageHeight = 768;

import {
  NORTH,
  SOUTH,
  EAST,
  WEST,
  NORTHWEST,
  NORTHEAST,
  SOUTHWEST,
  SOUTHEAST,
  CENTER,
  HOME
} from "./Input.js";

export class Camera extends GameObject {
  constructor() {
    super({});
    this.previousPosition = null;
    this.homePosition = new Vector2(0,0);
    
    this.movementSpeed = 3;
    this.currentScale = 1;
    this.isPanning = false;    
    
    this.screenShift = 'ready'; // ready |  complete | charging   
    this.shiftTiming = 80; // frames
    this.shiftDistance = 48; // pixels
    this.shiftCounter = this.shiftDistance; 
     
    this.personHalf = gridSize / 2;  

    this.halfWidth = -this.personHalf + stageWidth / 2;
    this.halfHeight = -this.personHalf + stageHeight / 2;    
    
    events.on("PLAYER_POSITION", this, position => {
      this.shiftTiming = 0;
      if (position.reason === "teleport") {
        this.isPanning = false;
      };
      this.updateView(position);
    });
  }
  updateView(position) { 

    const transformX = -position.x + this.halfWidth * (1 / this.currentScale);
    const transformY = -position.y + this.halfHeight * (1 / this.currentScale);
    const transform = new Vector2(transformX, transformY);
    if (this.isPanning) {
      this.homePosition = transform.duplicate();
      this.driftTowards(transform);
    } else {
      this.position = transform;
    }
  }
  driftTowards(center) {
    if (this.isPanning) {
      const driftAmount = 0.02;

      const roundedPosition = new Vector2(
        Math.round(this.position.x + driftAmount * (center.x - this.position.x)),
        Math.round(this.position.y + driftAmount * (center.y - this.position.y))
      );

      this.position = roundedPosition;

      if (
        Math.abs(this.position.x - center.x) <= 1 &&
        Math.abs(this.position.y - center.y) <= 1
      ) {
        this.position = center.duplicate();
        this.isPanning = false;
      }
    }
  }
  shiftCamera() {
    if (this.screenShift === 'complete' && this.shiftTiming === 0) {this.screenShift = 'charging'};
    if (!this.previousPosition || this.previousPosition != this.position) {
      if (this.shiftCounter < this.shiftDistance && this.screenShift === 'charging') {
        this.shiftCounter +=1;
      }
      if (this.shiftCounter === this.shiftDistance) {
        this.screenShift = 'ready';        
      }     
    }
    this.previousPosition = this.position.duplicate();   
    
    if (this.screenShift === 'ready') {this.shiftTiming += 1};
    
    if (this.shiftCounter > 0 && this.screenShift === 'ready' && this.shiftTiming > 150 && !this.isPanning) {
      this.position.y -= 1;
      this.shiftCounter -= 1;
    }
    if (this.shiftCounter <= 0) {
      this.isPanning = true;      
      this.screenShift = 'complete';
    }
        
  }
  panCamera(numpad){    
    if (!this.isPanning) {
      this.isPanning = true;
      this.homePosition = this.position.duplicate();
    }
    if (
      Math.abs(this.position.x - this.homePosition.x) > this.halfWidth ||
      Math.abs(this.position.y - this.homePosition.y) > this.halfHeight
    ) {
    const rockAmount = 0.32;
    
    this.position.x =
      this.position.x +
      rockAmount * (this.homePosition.x - this.position.x) / this.halfWidth;
    
    this.position.y =
      this.position.y +
      rockAmount * (this.homePosition.y - this.position.y) / this.halfHeight;        
      return; 
    }        
   
    switch (numpad) {
      case CENTER:
        this.driftTowards(this.homePosition);
        break;
      case HOME:
        this.position = this.homePosition.duplicate();
        this.isPanning = false;
        break;          
      case NORTH:
        this.position.y -= this.movementSpeed;
        break;
      case SOUTH:
        this.position.y += this.movementSpeed;
        break;
      case EAST:
        this.position.x += this.movementSpeed;
        break;
      case WEST:
        this.position.x -= this.movementSpeed;
        break;
      case NORTHWEST:
        this.position.x -= this.movementSpeed;
        this.position.y -= this.movementSpeed;
        break;
      case NORTHEAST:
        this.position.x += this.movementSpeed;
        this.position.y -= this.movementSpeed;
        break;
      case SOUTHWEST:
        this.position.x -= this.movementSpeed;
        this.position.y += this.movementSpeed;
        break;
      case SOUTHEAST:
        this.position.x += this.movementSpeed;
        this.position.y += this.movementSpeed;
        break;
    }
  }
  step(delta, root) {
    const {input} = root;
    this.shiftCamera();
    if (input.numpad && !input.direction) {
      this.panCamera(input.numpad);
    }
  }  
}

