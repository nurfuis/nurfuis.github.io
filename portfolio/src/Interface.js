import { events } from "./Events.js";

export class Interface {
  constructor() {
    this.textInput = document.querySelector("#textInput");
    this.outputText = "Press Space to begin or F1 to see controls.";
    this.outputFlag = false;
    this.outputTimeout = null;
    this.clearInterval = null;

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

    events.on("CLICK", this, (position) => {});
    events.on("RIGHT_CLICK", this, () => {});
    events.on("WHEEL_UP", this, () => {});
    events.on("WHEEL_DOWN", this, () => {});
    events.on("SPACE", this, () => {});
    events.on("F3", this, () => {});
    events.on("F2", this, () => {});
    events.on("F1", this, () => {});
    events.on("F4", this, () => {});

    events.on("F6", this, () => {});

    events.on("F7", this, () => {});

    events.on("ESCAPE", this, () => {});

    this.toggleTextInput();

    events.on("TEXT_OUTPUT", this, (details) => {
      this.handleOutput(details);
    });
  }

  toggleTextInput() {
    this.textInput.style.display =
      this.textInput.style.display === "none" ? "" : "none";
  }

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
