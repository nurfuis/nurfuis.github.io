import { events } from "./Events.js";

export class Commands {
  constructor(mainScene, player) {
    this.mainScene = mainScene;
    this.player = player;
    
    this.inputText = " "
    this.inputFlag = false;
    this.inputTimeout = null;
    this.clearInterval = null; 
       
    events.on("TEXT_INPUT", this, (details) => {
      this.handleInput(details);
    });    
  }
  
  
  handleInput(text) {
    this.inputText = text.details;
    this.inputFlag = true;
    
    if (this.inputText.toLowerCase() === "teleport world") {
      // Emit the PLAYER_TELEPORT event with appropriate details
      events.emit("PLAYER_TELEPORT", {
        // Replace with your actual x, y, and world values
        x: 96,
        y: 96,
        world: "world",
      });
    }
    if (this.inputText.toLowerCase() === "teleport brewhouse") {
      // Emit the PLAYER_TELEPORT event with appropriate details
      events.emit("PLAYER_TELEPORT", {
        // Replace with your actual x, y, and world values
        x: 96,
        y: 96,
        world: "brewhouse",
      });
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
      // Redraw the text here (using your stage drawing code)
    }, 20); 
  }

}