const debug = false;

import { events } from "./Events.js";
import { gameParams } from "../config/constants.js";
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
  constructor(tileWidth, tileHeight, camera) {
    this.camera = camera;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

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
    const canvas = document.getElementById("gameCanvas");

    // Define touch zones based on canvas dimensions (adjust as needed)
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    let heldDirections = []; // Array to store current directions

    canvas.addEventListener("touchstart", (event) => {
      const touch = event.touches[0]; // Get the first touch point
      const x = touch.clientX;
      const y = touch.clientY;

      // Check touch location and update heldDirections
      if (x < halfWidth) {
        heldDirections.push("LEFT");
      } else if (x > halfWidth) {
        heldDirections.push("RIGHT");
      }
      if (y < halfHeight) {
        heldDirections.push("UP");
      } else if (y > halfHeight) {
        heldDirections.push("DOWN");
      }
    });

    canvas.addEventListener("touchend", (event) => {
      // Remove direction from heldDirections based on ending touch
      const touchedIndex = event.changedTouches.length - 1; // Get index of ending touch
      const touch = event.changedTouches[touchedIndex];
      const x = touch.clientX;
      const y = touch.clientY;

      // Logic similar to touchstart, but remove directions
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

    window.addEventListener("mousemove", (event) => {
      const x = event.clientX;
      const y = event.clientY;
      // console.log(`Mouse position: X=${x}, Y=${y}`);

      const offsetX = Math.floor(this.camera.position.x / this.tileWidth);
      const offsetY = Math.floor(this.camera.position.y / this.tileHeight);

      const tilesAcross = gameParams.width / this.tileWidth;
      const tilesDown = gameParams.height / this.tileHeight;

      const cameraOffset = this.tileWidth / 2;

      const cursorX = event.clientX + cameraOffset;
      const cursorY = event.clientY - cameraOffset;

      const windowX = window.innerWidth;

      const scale = windowX / gameParams.width;

      const windowY = gameParams.height * scale;

      // size of scaled tiles
      const scaledX = Math.floor(windowX / tilesAcross); // should be equal
      const scaledY = Math.floor(windowY / tilesDown); // to each other

      // grid cell
      const tileX = Math.floor(cursorX / scaledX) - 1; // magic adjustment
      const tileY = Math.floor(cursorY / scaledY);

      // tile coordinates
      const posX = (tileX - offsetX) * this.tileWidth;
      const posY = (tileY - offsetY) * this.tileHeight;

      // console.log("Cursor:", posX, posY);
    });

    document.addEventListener("mousedown", (e) => {
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

      //   const offsetX = Math.floor(this.camera.position.x / this.tileWidth);
      //   const offsetY = Math.floor(this.camera.position.y / this.tileHeight);

      const offsetX = e.clientX / this.tileWidth;
      const offsetY = e.clientY / this.tileHeight;

      const tilesAcross = gameParams.width / this.tileWidth;
      const tilesDown = gameParams.height / this.tileHeight;

      // center grid on player
      const cameraOffset = this.tileWidth / 2;

      // click coordinates (x is offset by half of a tile)
      const clickX = e.clientX + cameraOffset;
      const clickY = e.clientY - cameraOffset;

      const windowX = window.innerWidth;
      const scale = windowX / gameParams.width;
      const windowY = gameParams.height * scale;

      // size of scaled tiles
      const scaledX = Math.floor(windowX / tilesAcross); // should be equal
      const scaledY = Math.floor(windowY / tilesDown); // to each other

      // grid cell
      const tileX = Math.floor(clickX / scaledX) - 1; // magic adjustment
      const tileY = Math.floor(clickY / scaledY);

      // tile coordinates
      const posX = (tileX - offsetX) * this.tileWidth;
      const posY = (tileY - offsetY) * this.tileHeight;

      this.onClick({ x: posX, y: posY, event: e });
      if (debug) {
        console.log("click event:", e);
        console.log("target element:", e.target);
        console.log("click position:", posX, posY);
        console.log("click time:", Date.now());
      }
    });
    document.addEventListener("mouseup", (e) => {
      this.isClicking = false; // Set isClicking to false on mouseup
    });
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    document.addEventListener("mouseup", (e) => {
      this.isClicking = false; // Set isClicking to false on mouseup
    });
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
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
      // Text input has value, clear it
      this.textInput.value = "";
    } else if (this.textInput === document.activeElement) {
      // Text input is empty and focused, blur it and emit event if display is none
      this.textInput.blur();
    } else if (
      !this.textInput.value &&
      this.textInput != document.activeElement
    ) {
      events.emit("ESCAPE");
    }
  };
}
