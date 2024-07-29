const debug = false;

import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";
export const LEFT = "LEFT";
export const RIGHT = "RIGHT";
export const UP = "UP";
export const DOWN = "DOWN";

export const NORTH = "NORTH";
export const SOUTH = "SOUTH";
export const EAST = "EAST";
export const WEST = "WEST";

export const NORTHEAST = "NORTHEAST";
export const NORTHWEST = "NORTHWEST";
export const SOUTHEAST = "SOUTHEAST";
export const SOUTHWEST = "SOUTHWEST";

export const ESCAPE = "ESCAPE";

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
  constructor() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.tileWidth = 32;
    this.tileHeight = 32;
    this.camera = undefined;

    this.textInput = document.querySelector("#textInput");
    this.cursorTarget = document.querySelectorAll(".cursorTarget");

    // this.actionBar = document.querySelector("#action-bar");

    this.isTextFocused = false;

    this.keyPresses = [];
    this.heldDirections = [];
    this.heldKeys = [];
    this.heldNumpad = [];

    this.clicks = [];
    this.isClicking = false;

    // debugger
    this.keyCode = undefined;

    const centerX = this.windowWidth / 2;
    const centerY = this.windowHeight / 2;

    const upAngle = Math.PI * 1.5;
    const rightAngle = 0;
    const downAngle = Math.PI * 0.5;
    const leftAngle = Math.PI;

    document.addEventListener("touchstart", (event) => {
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;

      let angle = Math.atan2(touchY - centerY, touchX - centerX);

      angle = normalizeAngle(angle);

      const wedgeAngle = Math.PI / 4;
      const tolerance = wedgeAngle / 3;

      if (
        angle > upAngle - wedgeAngle - tolerance &&
        angle < upAngle + wedgeAngle + tolerance
      ) {
        this.onArrowPressed(UP);
      } else if (
        angle > rightAngle - wedgeAngle - tolerance &&
        angle < rightAngle + wedgeAngle + tolerance
      ) {
        this.onArrowPressed(RIGHT);
      } else if (
        angle > downAngle - wedgeAngle - tolerance &&
        angle < downAngle + wedgeAngle + tolerance
      ) {
        this.onArrowPressed(DOWN);
      } else if (
        angle > leftAngle - wedgeAngle - tolerance &&
        angle < leftAngle + wedgeAngle + tolerance
      ) {
        this.onArrowPressed(LEFT);
      }

      function normalizeAngle(angle) {
        angle = angle + Math.PI * 2;
        angle %= Math.PI * 2;
        return angle;
      }
    });

    document.addEventListener("touchend", (event) => {
      this.heldDirections = [];
    });

    this.textInput.addEventListener("focus", () => {
      this.isTextFocused = true;
    });

    this.textInput.addEventListener("blur", () => {
      this.isTextFocused = false;
    });

    this.textInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const text = textInput.value;
        textInput.value = "";
        events.emit("TEXT_INPUT", { message: text });
      }
    });

    document.addEventListener("keydown", (e) => {
      this.keyPresses.push(e);
      this.keyCode = e.code;
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
      if (e.code === "Slash" || e.code === "Enter") {
        if (e.code === "Slash") {
          this.handleSlashKey();
        } else if (e.code === "Enter") {
          this.handleEnterKey();
        }
      }
      if (e.code === "Escape") {
        this.handleEscapeKey();
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
        console.log("Pressed F1");
        events.emit("F1");
      }
      if (e.code === "F2") {
        e.preventDefault();
        events.emit("F2");
      }
      if (e.code === "F3") {
        e.preventDefault();
        events.emit("F3");
      }

      if (e.code === "F4") {
        e.preventDefault();
        events.emit("F4");
      }
      if (e.code === "F6") {
        e.preventDefault();
        events.emit("F6");
      }
      if (e.code === "F7") {
        e.preventDefault();
        events.emit("F7");
      }
    });

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
      }
      if (e.code === "F1") {
        e.preventDefault();
      }
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
    this.heldKeys.splice(index, 1);
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
      this.heldDirections.splice(index, 1);
    }
  }

  get pressCounter() {
    return this.keyPresses.length;
  }
  get clickCounter() {
    return this.clicks.length;
  }
  get click() {
    if (!this.clicks[0]) {
      return { x: 0, y: 0 };
    }

    return this.clicks[0];
  }
  onClick(event) {
    this.clicks.unshift(event);
    events.emit("CLICK", event);
  }
  handleSlashKey = () => {
    if (this.textInput.style.display === "none") {
      this.textInput.style.display = "block";
      this.textInput.focus();
    } else {
      this.textInput.focus();
    }
  };

  handleEnterKey = () => {
    this.textInput.focus();
    // Handle enter key behavior (as needed)
  };

  handleEscapeKey = () => {
    if (this.textInput.value) {
      this.textInput.value = "";
    } else if (this.textInput === document.activeElement) {
      this.textInput.blur();
    } else if (
      !this.textInput.value &&
      this.textInput != document.activeElement
    ) {
      events.emit("ESCAPE");
    }
  };
  addCanvas(gameCanvasMain) {
    gameCanvasMain.addEventListener("touchstart", (e) => {
      // Emit MOUSE_MOVED event for each touch point
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const rect = gameCanvasMain.getBoundingClientRect();
        const offsetX = Math.round(touch.clientX - rect.left);
        const offsetY = Math.round(touch.clientY - rect.top);
        events.emit("MOUSE_MOVED", new Vector2(offsetX, offsetY));
      }
    });

    gameCanvasMain.addEventListener("touchmove", (e) => {
      // Emit MOUSE_MOVED event for each active touch point
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = gameCanvasMain.getBoundingClientRect();
        const offsetX = Math.round(touch.clientX - rect.left);
        const offsetY = Math.round(touch.clientY - rect.top);
        events.emit("MOUSE_MOVED", new Vector2(offsetX, offsetY));
      }
    });

    gameCanvasMain.addEventListener("touchend", (e) => {
      // Check if all touches have ended (no active touches)
      if (e.touches.length === 0) {
        events.emit("MOUSE_OUT");
      }
    });

    gameCanvasMain.addEventListener("mouseout", (e) => {
      console.log("Mouse left the canvas");
      const rect = gameCanvasMain.getBoundingClientRect();
      const offsetClickX = Math.round(e.clientX - rect.left);
      const offsetClickY = Math.round(e.clientY - rect.top);

      events.emit("MOUSE_OUT", new Vector2(offsetClickX, offsetClickY));
    });
    gameCanvasMain.addEventListener("mousemove", (e) => {
      if (
        this.isTextFocused ||
        e.target.localName === "button" ||
        e.target.localName === "input"
      ) {
        return;
      }
      const rect = gameCanvasMain.getBoundingClientRect();
      const offsetClickX = Math.round(e.clientX - rect.left);
      const offsetClickY = Math.round(e.clientY - rect.top);

      events.emit("MOUSE_MOVED", new Vector2(offsetClickX, offsetClickY));
      // Optional: Track mouse position for dragging or other interactions
      // this.mouseX = mainClickX;
      // this.mouseY = mainClickY;
    });
    gameCanvasMain.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    gameCanvasMain.addEventListener("mouseup", (e) => {
      this.isClicking = false;
    });

    gameCanvasMain.addEventListener("mousedown", (e) => {
      if (
        this.isTextFocused ||
        e.target.localName == "button" ||
        e.target.localName == "input"
      ) {
        return false;
      }
      this.isClicking = true;
      if (e.button === 2) {
        // right click
      }
      const rect = gameCanvasMain.getBoundingClientRect();

      const mainClickX = Math.round(
        e.clientX - rect.left - this.camera?.position?.x - this.tileWidth
      );
      const mainClickY = Math.round(
        e.clientY - rect.top - this.camera?.position?.y - this.tileHeight
      );

      const offsetClickX = Math.round(e.clientX - rect.left);
      const offsetClickY = Math.round(e.clientY - rect.top);

      //   this.onClick({ x: posX, y: posY, event: e });
      console.log(
        "Click main:",
        mainClickX,
        mainClickY,
        "Click offset:",
        offsetClickX,
        offsetClickY
      );
    });
  }
}
