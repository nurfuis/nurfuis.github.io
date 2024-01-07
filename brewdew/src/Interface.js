import { events } from "./Events.js";

export class Interface {
  constructor(textInput, camera, player) {
    this.debugDisplay = false;
    
    this.textInput = textInput;
    this.camera = camera;
    this.player = player;
    this.inputText = ""
    this.inputFlag = false;
    this.inputTimeout = null;
    this.clearInterval = null; 
    this.currentScale = 1;
    this.handleOutput({details: "Welcome to the Fey Brewster." });   
    
    events.on("TEXT_OUTPUT", this, (details) => {
      this.handleOutput(details);
    }); 
    events.on("F3", this, () => {
      this.toggleDebugDisplay();
    });    
    events.on("F4", this, () => {
      this.toggleTextInput();
    }); 
    events.on("F6", this, () => {
      this.zoomIn();
    }); 
    events.on("F7", this, () => {
      this.zoomOut();
    });     
  }
  zoomOut() { 
    this.currentScale -= .1;
    this.camera.currentScale -= .1;
    events.emit("PLAYER_POSITION", { x: this.player.position.x, y: this.player.position.y, world: this.player.currentWorld })    
  }
  zoomIn() {
    this.currentScale += .1;
    this.camera.currentScale += .1;
    
    events.emit("PLAYER_POSITION", { x: this.player.position.x, y: this.player.position.y, world: this.player.currentWorld })
  }   
  toggleTextInput() {
    this.textInput.style.display = this.textInput.style.display === "none" ? "" : "none";
  };
  toggleDebugDisplay(){
    this.debugDisplay = !this.debugDisplay;       
  };
  handleOutput(input) {
    this.inputText = input.details;
    this.inputFlag = true;
    
    if (
      this.inputText.toLowerCase() === "/teleport world" ||
      this.inputText.toLowerCase() === "/tp world" 
      ) {
      this.player.teleport(96, 96, 'world');
    }
    if (
      this.inputText.toLowerCase() === "/teleport brewhouse" ||
      this.inputText.toLowerCase() === "/tp brew"      
      ) {
      this.player.teleport(96, 96, 'brewhouse');
    }
    
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }

    this.inputTimeout = setTimeout(() => {
      this.inputFlag = false;
      this.startClearingText();
    }, 3000);
  }

  startClearingText() {
    this.clearInterval = setInterval(() => {
      if (this.inputText.length > 0) {
        this.inputText = this.inputText.slice(0, -1);
      } else {
        clearInterval(this.clearInterval); 
        this.inputTimeout = null; 
      }
      // Redraw the text here (using your canvas drawing code)
    }, 20); 
  }

}