import { camera } from "../main.js";
import { canvas } from "../main.js";
import { gridSize } from "./helpers/grid.js";

export const LEFT = "LEFT"
export const RIGHT = "RIGHT"
export const UP = "UP"
export const DOWN = "DOWN"

export class Input {
  constructor() {
	
    this.heldDirections = [];
    this.clicks = [];
    
    document.addEventListener("keydown", (e) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") {
      this.onArrowPressed(UP);  
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
      this.onArrowPressed(DOWN);  
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
      this.onArrowPressed(LEFT);  
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
      this.onArrowPressed(RIGHT);  
      }	  
    })
    
    document.addEventListener("keyup", (e) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        this.onArrowReleased(UP);  
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        this.onArrowReleased(DOWN);  
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        this.onArrowReleased(LEFT);  
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        this.onArrowReleased(RIGHT);  
      }	  
    })
    // Mouse click event
    document.addEventListener("click", (e) => {       
        // find the canvas dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;    
        
        // find the tile size
        const tileSize = gridSize;

        // fimd how much offset the canvas is translated by from camera
        const offsetX = Math.floor(camera.position.x / tileSize);
        const offsetY = Math.floor(camera.position.y / tileSize);  

        // find number of tiles across and down that fit in the window
        const tilesAcross = canvasWidth / tileSize;
        const tilesDown = canvasHeight / tileSize;
        
        // center grid on player
        const cameraOffset = tileSize / 2;
        
        // click coordinates (x is offset by half of a tile)
        const clickX = e.clientX + cameraOffset;
        const clickY = e.clientY;
        
        // find the size of the game window
        const windowX = window.innerWidth;
        const scale = windowX / canvasWidth;    
        const windowY = canvasHeight * scale;
        
        // size of scaled tiles
        const scaledX = Math.floor(windowX / tilesAcross); // should be equal
        const scaledY = Math.floor(windowY / tilesDown);  // to each other
        
        // grid cell
        const tileX = Math.floor(clickX / scaledX) - 1; // magic adjustment
        const tileY = Math.floor(clickY / scaledY);
        
        // tile coordinates
        const posX = (tileX - offsetX) * tileSize;
        const posY = (tileY - offsetY) * tileSize;
        this.onClick({ x: posX, y: posY });
    });    
  }
 
  get direction() {
    return this.heldDirections[0];  
  } 
    
  onArrowPressed(direction) {
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction); 	
    }
  }
  
  onArrowReleased(direction) {
    const index = this.heldDirections.indexOf(direction);
    if (index === -1) {
      return;	
    }
    this.heldDirections.splice(index, 1)
   }
  onClick(location){
   this.clicks.unshift(location); 
   console.log(this.clicks);
  }
}