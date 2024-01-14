import {GameObject} from "./GameObject.js";
import {events} from "./Events.js";
import {Vector2} from "./Vector2.js";
import { canvas } from "../main.js";
import { gridSize } from "./helpers/grid.js";
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
  HOME,
  ADD,
  SUBTRACT,
  MULTIPLY,
  STILL
} from "./Input.js";

export class Camera extends GameObject {
  constructor(input) {
    super({});
    this.gameInput = input;
    this.previousPosition = null;
    this.homePosition = null;
    
    this.movementSpeed = 3;
    this.currentScale = 1;
    this.isPanning = false;    
    this.pointerPosition = new Vector2(0, 0);
    this.screenShift = 'ready'; // ready |  complete | charging   
    this.shiftTiming = 80; // frames
    this.shiftDistance = 48; // pixels
    this.shiftCounter = this.shiftDistance; 
     
    this.resetCamera = false; 
    this.buttonCooldown = 0;
    this.focusCycleDuration = 0;
    
    this.personHalf = gridSize / 2;  
    this.canvasWidth = canvas.width; 
    this.canvasHeight = canvas.height;
    this.halfWidth = -this.personHalf + this.canvasWidth / 2;
    this.halfHeight = -this.personHalf + this.canvasHeight / 2;    
    
   
    events.on("_POSITION", this, position => {
      // console.log(position.cause);
      this.shiftTiming = 0;
      this.updateView(position);
    });
  }
  zoomOut() { 
    if (this.currentScale <= 1 || this.buttonCooldown > 0) {
      return;
    } else {
 
      const zoom = this.currentScale - .25;
      this.currentScale = zoom;
      this.buttonCooldown = 50;      
    }
  }
  zoomIn() {
    if (this.currentScale >= 1 || this.buttonCooldown > 0) {
      return;
    } else {

      
      const zoom = this.currentScale + .25;
      this.currentScale = zoom;      
      this.buttonCooldown = 50;      
    }
  }
  wobble(delta) {
    const timer = this.focusCycleDuration -= delta;

    if (timer <= 0) {
      this.focusCycleDuration = 200; // 3 seconds in milliseconds
    }
    if (this.focusCycleDuration > 100) {
      this.currentScale += .0025;
    } else {
      if (this.focusCycleDuration <= 100) {
        this.currentScale -= 0.0025;
      }
    }
  }
  setPointerPosition(position) {
    // Check if the click position is within the canvas bounds
    if (
      position.x >= 0 &&
      position.x < 1048 &&
      position.y >= 0 &&
      position.y < 1048
    ) {
      // Only set the pointer position and trigger panning if the click is within bounds
      this.pointerPosition = position;
      this.isPanning = true;
      this.resetCamera = true;
    } else {
      // Optionally, log a message or perform other actions if the click is outside the canvas
      console.log("Click outside canvas bounds.");
    }
  }
  updateView(position) { 
    const transformX = Math.floor( (-position.x + this.halfWidth * (1 / this.currentScale)) / gridSize) * gridSize;
    const transformY = Math.floor( (-position.y + this.halfHeight * (1 / this.currentScale)) / gridSize) * gridSize;
    const transform = new Vector2(transformX, transformY);
    if (position.cause === 'teleport') {this.isPanning = false};
    
    if (this.isPanning) {
      this.homePosition = transform.duplicate();
      this.driftTowards(transform);
    } else { // snap to new position
      this.position = transform;
    }
    this.gameInput.cameraPosition = transform;
  }
  driftTowards(center) {
    if (this.isPanning) {
      const driftAmount = 0.25;

      const roundedPosition = new Vector2(
        Math.floor( (this.position.x + driftAmount * (center.x - this.position.x)) / gridSize ) * gridSize,
        Math.floor( (this.position.y + driftAmount * (center.y - this.position.y)) / gridSize ) * gridSize
      );

      this.position = roundedPosition;

      if (
        Math.abs(this.position.x - center.x) === 0 &&
        Math.abs(this.position.y - center.y) === 0
      ) {
        // this.position = center.duplicate();
        this.isPanning = false;
        this.resetCamera = false;
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
  panCamera(delta, direction){  
    if (!this.isPanning) {
      this.isPanning = true;
      this.homePosition = this.position.duplicate();
    }
    if (
      Math.abs(this.position.x - this.homePosition.x) > this.canvasWidth ||
      Math.abs(this.position.y - this.homePosition.y) > this.canvasWidth 
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
   
    switch (direction) {
      case ADD:
        this.zoomIn();
        break;        
      case SUBTRACT:
        this.zoomOut();
        break; 
      case MULTIPLY:
        this.currentScale = 1;
        break;
      case STILL:
        break;        
      case CENTER:
        this.driftTowards(this.homePosition);
        break;
      case HOME:
        this.position = new Vector2(0, 0);
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
  step(delta) {
    this.buttonCooldown -= delta; // Decrement cooldown in each step
    if (this.gameInput.numpad) {
      const direction = this.gameInput.numpad;
      this.panCamera(delta, direction);
    } 
    // if (this.gameInput.isClicking) {
      // const clickDirection = this.gameInput.click.direction; 
      // this.panCamera(delta, clickDirection);        
    // }
  }  
}

