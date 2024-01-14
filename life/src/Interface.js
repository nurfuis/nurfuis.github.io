import { events } from "./Events.js";

export class Interface {
  constructor(textInput, camera) {
    this.textInput = textInput;
    this.outputText = "Press Space to begin or F1 to see controls.";
    this.outputFlag = false;
    this.outputTimeout = null;
    this.clearInterval = null;    
    this.camera = camera;    
    
    this.debugDisplay = false;
    this.settingsDisplay = false; 
    this.helpDisplay = false;
    this.statisticsDisplay = false;
    this.clockDisplay = false;
    
    this.script = "openingTutorial";
    
    this.isStarted = false;
        
    events.on("Q", this, () => {
      events.emit("INTERVAL_UP");
    });
    events.on("A", this, () => {
      events.emit("INTERVAL_DOWN");        
    }); 
    events.on("W", this, () => {
      events.emit("RESPAWN_DELAY_UP");
    });
    events.on("S", this, () => {
      events.emit("RESPAWN_DELAY_DOWN");  
    });    
    events.on("E", this, () => {
      events.emit("GROWTH_UP");
    });    
    events.on("D", this, () => {
      events.emit("GROWTH_DOWN");      
    });
    events.on("R", this, () => {
      events.emit("CAPACITY_UP");
    });
    events.on("F", this, () => {
        events.emit("CAPACITY_DOWN");
    });
    events.on("BACKQUOTE", this, () => {
      events.emit("TOGGLE_MUTATIONS");
    });    
    events.on("T", this, () => {
      events.emit("TERMINATE");
    }); 
    events.on("G", this, () => {
      events.emit("CORRUPT");
    });                         
    events.on("Y", this, () => {
      events.emit("CYCLE_NEIGHBORHOODS");
    });        
    events.on("ONE", this, () => {
      events.emit("SET_CELL_TYPE_ONE");              
    });
    events.on("TWO", this, () => {
        events.emit("SET_CELL_TYPE_TWO");
    });
    events.on("THREE", this, () => {
      if (!this.canMutate) {      
        events.emit("SET_CELL_TYPE_THREE");
      }
    });    
    events.on("FOUR", this, () => {
        events.emit("SET_CELL_TYPE_FOUR");
    });
    events.on("FIVE", this, () => {
        events.emit("SET_CELL_TYPE_FIVE");
    });
    events.on("SIX", this, () => {
        events.emit("SET_CELL_TYPE_SIX");
    });
    events.on("SEVEN", this, () => {
        events.emit("SET_CELL_TYPE_SEVEN");
    });
    events.on("EIGHT", this, () => {
        events.emit("SET_CELL_TYPE_EIGHT");
    });
    events.on("NINE", this, () => {
        events.emit("SET_CELL_TYPE_NINE");
    }); 
    events.on("ZERO", this, () => {
        events.emit("SET_CELL_TYPE_TEN");
    }); 
    events.on("MINUS", this, () => {
        events.emit("SET_CELL_TYPE_ELEVEN");
    });    
    events.on("EQUAL", this, () => {
        events.emit("SET_CELL_TYPE_TWELVE");
    });
    
    events.on("CLICK", this, (position) => {
      if (this.helpDisplay) {
        this.toggleHelpDisplay();      
      }      
      if (!this.isStarted) {
        this.isStarted = true;
        this.startSim();
        
        this.handleOutput({details: "Welcome to life." });        
      } else {
        // this.toggleSettingsDisplay();
        // events.emit("CAPACITY_UP");  
      }
    });
    events.on("RIGHT_CLICK", this, () => {
      // this.toggleStatisticsDisplay();
      // events.emit("CYCLE_NEIGHBORHOODS");
    });
    events.on("WHEEL_UP", this, () => {
      // if (!this.isStarted) {
        // this.isStarted = true;
        // this.startSim();
        // this.handleOutput({details: "Welcome to life." });        
      // } else {
        // this.camera.zoomIn();
      // }
      // events.emit("GROWTH_UP");
    });
    events.on("WHEEL_DOWN", this, () => {
      // if (!this.isStarted) {
        // this.isStarted = true;
        // this.startSim();
        // this.handleOutput({details: "Welcome to life." });        
      // } else {
        // this.camera.zoomOut();
      // }
      // events.emit("GROWTH_DOWN");
    });     
    events.on("SPACE", this, () => {
      
      if (!this.isStarted) {        
        this.startSim();
      
      } else {
        events.emit("PAUSE");
      }
    });
    events.on("F3", this, () => {
      
      if (!this.isStarted) {
        this.startSim();
      
      } else {
        this.toggleSettingsDisplay();
      }      
    });     
    events.on("F2", this, () => {
      this.toggleClockDisplay();
    });
    events.on("F1", this, () => {
      this.outputText = "";
      this.toggleHelpDisplay();
    });    
    events.on("F4", this, () => {
      this.toggleStatisticsDisplay();
    }); 
    events.on("F6", this, () => {
      this.toggleDebugDisplay();
    }); 
    events.on("F7", this, () => {
    
    });     
    events.on("ESCAPE", this, () => {
      this.toggleHelpDisplay();
    });
    this.toggleTextInput();  
    events.on("TEXT_OUTPUT", this, (details) => {
      this.handleOutput(details);
    });  
  }
  
  startSim() {
    
    if (this.helpDisplay) {
      this.toggleHelpDisplay();      
    }
    
    this.isStarted = true;
    this.handleOutput({details: "Welcome to life." });
    
    events.emit("START_SIM");
    
    // this.toggleSettingsDisplay();
  }
  toggleClockDisplay(){
    
    if (this.helpDisplay) {
      this.toggleHelpDisplay();      
    }
    
    this.clockDisplay = !this.clockDisplay;       
  };  
  toggleTextInput() {
    this.textInput.style.display = this.textInput.style.display === "none" ? "" : "none";
  };
  toggleDebugDisplay(){
    
    if (this.helpDisplay) {
      this.toggleHelpDisplay();      
    }
    
    this.debugDisplay = !this.debugDisplay;       
  };
  toggleSettingsDisplay(){
    
    if (this.helpDisplay) {
      this.toggleHelpDisplay();      
    } 
    
    this.settingsDisplay = !this.settingsDisplay;       
  };
  toggleStatisticsDisplay(){
    
    if (this.helpDisplay) {
      this.toggleHelpDisplay();      
    }  
    
    this.statisticsDisplay = !this.statisticsDisplay;       
  }  
  toggleHelpDisplay(){
    this.outputText = "";
    
    this.debugDisplay = false;
    this.settingsDisplay = false;
    this.statisticsDisplay = false;
    this.clockDisplay = false;
    this.helpDisplay = !this.helpDisplay;       
  }; 
  
  handleOutput(output) {
    this.outputText = output.details;
    
    this.outputFlag = true;
    
    if (this.outputText.toLowerCase() === "start") {
      this.startSim();
    } 
    
    if (this.outputTimeout) {
      clearTimeout(this.outputTimeout);
    }

    this.outputTimeout = setTimeout(() => {
      this.outputFlag = false;
      this.startClearingText();
    }, 4000);
  }

  startClearingText() {
    this.clearInterval = setInterval(() => {
      
      if (this.outputText.length > 0) {
        this.outputText = this.outputText.slice(0, -1);
      
      } else {
        clearInterval(this.clearInterval); 
        this.outputTimeout = null; 
      }
      // Redraw the text here (using your canvas drawing code)
    }, 20); 
  }
}