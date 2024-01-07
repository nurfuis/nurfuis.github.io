import { canvas } from "../main.js";
import { gridSize } from "./helpers/grid.js";
import { events } from "./Events.js";
import {Vector2} from "./Vector2.js";

export const LEFT = "LEFT"
export const RIGHT = "RIGHT"
export const UP = "UP"
export const DOWN = "DOWN"

export const NORTH = "NORTH";
export const SOUTH = "SOUTH";
export const EAST = "EAST";
export const WEST = "WEST";

export const NORTHEAST = "NORTHEAST";
export const NORTHWEST = "NORTHWEST";
export const SOUTHEAST = "SOUTHEAST";
export const SOUTHWEST = "SOUTHWEST";

export const CENTER = "CENTER";
export const HOME = "HOME";

export const ZERO = "ZERO";
export const ONE = "ONE";
export const TWO = "TWO";
export const THREE = "THREE";
export const FOUR = "FOUR";
export const FIVE = "FIVE";
export const SIX = "SIX";
export const SEVEN = "SEVEN";
export const EIGHT = "EIGHT";
export const NINE = "NINE";

export const F1 = "F1";
export const F2 = "F2";

export const NUMPAD1 = "NUMPAD1";
export const NUMPAD2 = "NUMPAD2";
export const NUMPAD3 = "NUMPAD3";
export const NUMPAD4 = "NUMPAD4";
export const NUMPAD5 = "NUMPAD5";
export const NUMPAD6 = "NUMPAD6";
export const NUMPAD7 = "NUMPAD7";
export const NUMPAD8 = "NUMPAD8";
export const NUMPAD9 = "NUMPAD9";
export const NUMPAD0 = "NUMPAD0";

export class Input {
  constructor(textInput) {
    this.textInput = textInput;
    this.isTextFocused = false; 

    this.heldDirections = [];
    this.heldKeys = [];
    this.heldNumpad = [];
    
    this.cameraPosition = new Vector2(0,0);
    this.clicks = [];
    this.isClicking = false;

    this.textInput.addEventListener("focus", () => {
      this.isTextFocused = true;
    }); 
    this.textInput.addEventListener("blur", () => {
      this.isTextFocused = false;
    });    
    this.textInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const inputText = textInput.value;
        textInput.value = "";
        events.emit("TEXT_OUTPUT", { details: inputText})       
      }
    });
    
    document.addEventListener("keydown", (e) => {
      // console.log(e.code);
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
      if (e.code === "Numpad1") {
        this.onNumpadPressed(SOUTHWEST);
      }
      if (e.code === "Numpad2") {
        this.onNumpadPressed(SOUTH);
      }
      if (e.code === "Numpad3") {
        this.onNumpadPressed(SOUTHEAST);
      }
      if (e.code === "Numpad4") {
        this.onNumpadPressed(WEST);
      }
      if (e.code === "Numpad5") {
        this.onNumpadPressed(CENTER);
      }
      if (e.code === "Numpad6") {
        this.onNumpadPressed(EAST);
      }
      if (e.code === "Numpad7") {
        this.onNumpadPressed(NORTHWEST);
      }
      if (e.code === "Numpad8") {
        this.onNumpadPressed(NORTH);
      }
      if (e.code === "Numpad9") {
        this.onNumpadPressed(NORTHEAST);
      }
      if (e.code === "Numpad0") {
        this.onNumpadPressed(HOME);
      }      
      if (
        e.code === "Slash" ||
        e.code === "Enter"     
      ) { 
        this.textInput.focus(); 
      }
      if (
        e.code === "Escape") { 
        this.textInput.blur();
        this.textInput.value = "";        
      }
      if (e.code === "Backspace" && this.textInput.value === "") {
        this.textInput.blur(); 
      }      
      if (e.code === "Digit1") {
        this.onKeyPressed(ONE);  
      }	
      if (e.code === "Digit2") {
        this.onKeyPressed(TWO);  
      }
      if (e.code === "F1") {
        e.preventDefault();
        this.onKeyPressed(F1);  
;
      }
      if (e.code === "F2") {
        e.preventDefault();
        this.onKeyPressed(F2);  
        
      }
      if (e.code === "F3") {
        e.preventDefault();
        events.emit("F3")       
      }

      if (e.code === "F4") {
        e.preventDefault();
        events.emit("F4")       
      }
      if (e.code === "F6") {
        e.preventDefault();
        events.emit("F6")       
      }
      if (e.code === "F7") {
        e.preventDefault();
        events.emit("F7")       
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
      if (e.code === "Numpad1") {
        this.onNumpadReleased(SOUTHWEST);
      }
      if (e.code === "Numpad2") {
        this.onNumpadReleased(SOUTH);
      }
      if (e.code === "Numpad3") {
        this.onNumpadReleased(SOUTHEAST);
      }
      if (e.code === "Numpad4") {
        this.onNumpadReleased(WEST);
      }
      if (e.code === "Numpad5") {
        this.onNumpadReleased(CENTER);
      }
      if (e.code === "Numpad6") {
        this.onNumpadReleased(EAST);
      }
      if (e.code === "Numpad7") {
        this.onNumpadReleased(NORTHWEST);
      }
      if (e.code === "Numpad8") {
        this.onNumpadReleased(NORTH);
      }
      if (e.code === "Numpad9") {
        this.onNumpadReleased(NORTHEAST);
      }
      if (e.code === "Numpad0") {
        this.onNumpadReleased(HOME);
      }       
      if (e.code === "Digit1") {
        this.onKeyReleased(ONE);  
      }
      if (e.code === "Digit2") {
        this.onKeyReleased(TWO);  
      }
      if (e.code === "F1") {
        e.preventDefault();
        this.onKeyReleased(F1);  
        
      }
      if (e.code === "F1") {
        e.preventDefault();
        this.onKeyReleased(F2);  
        
      }      
    })
        
    document.addEventListener("mousedown", (e) => {
      if (!this.isTextFocused) {
        this.isClicking = true;
        if (event.button === 2) {
          // Handle right-click here
        }
      }
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;    
      
      // find the tile size
      const tileSize = gridSize;

      // find how much offset the canvas is translated by from camera
      const offsetX = Math.floor(this.cameraPosition.x / tileSize);
      const offsetY = Math.floor(this.cameraPosition.y / tileSize);  

      // find number of tiles across and down that fit in the window
      const tilesAcross = canvasWidth / tileSize;
      const tilesDown = canvasHeight / tileSize;
      
      // center grid on player
      const cameraOffset = tileSize / 2;
      
      // click coordinates (x is offset by half of a tile)
      const clickX = e.clientX + cameraOffset;
      const clickY = e.clientY - cameraOffset;
      
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
    document.addEventListener("mouseup", (e) => {
      this.isClicking = false; // Set isClicking to false on mouseup
    });   
  }
  
  get key() {
    return this.heldKeys[0];  
  }  
  onKeyPressed(key) {
    if (this.heldKeys.indexOf(key) === -1) {
      this.heldKeys.unshift(key); 	
    }
  } 
  onKeyReleased(key) {
    const index = this.heldKeys.indexOf(key);
    if (index === -1) {
      return;	
    }
    this.heldKeys.splice(index, 1)
  }
  
  get numpad() {
    return this.heldNumpad[0];  
  }  
  onNumpadPressed(direction) {
    if (!this.isTextFocused) {
      
      if (this.heldNumpad.indexOf(direction) === -1) {
        this.heldNumpad.unshift(direction);
      }
    }
  }
  onNumpadReleased(direction) {
    if (!this.isTextFocused) {
      
      const index = this.heldNumpad.indexOf(direction);
      if (index !== -1) {
        this.heldNumpad.splice(index, 1);
      }
    }
  }  
  get direction() {
    return this.heldDirections[0];  
  }
  onArrowPressed(direction) {
    if (!this.isTextFocused) {
      if (this.heldDirections.indexOf(direction) === -1) {
        this.heldDirections.unshift(direction); 	
      }        
    }    
  }  
  onArrowReleased(direction) {
    if (!this.isTextFocused) {
      const index = this.heldDirections.indexOf(direction);
      if (index === -1) {
        return;	
      }
      this.heldDirections.splice(index, 1)
     }  
  }   
  
  get clickCount() {
    return this.clicks.length;
  }
  get click() {
    return this.clicks[0];
  }
  onClick(location){
    
   this.clicks.unshift(location);
   
   // console.log('click detected',this.click);
  }
}