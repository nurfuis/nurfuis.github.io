import { events } from "./Events.js";

export class GameInterface {
  constructor() {
    this.debugDisplay = false;
    
    this.textInput = document.getElementById("text-input");
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
    }); 
    events.on("F7", this, () => {
    });     
  }
  toggleTextInput() {
    this.textInput.style.display = this.textInput.style.display === "none" ? "" : "none";
  };
  toggleDebugDisplay(){
    this.debugDisplay = !this.debugDisplay; 
    events.emit("TOGGLE_DEBUG")     
  };
  handleOutput(input) {
    this.inputText = input.details;
    this.inputFlag = true;
    
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