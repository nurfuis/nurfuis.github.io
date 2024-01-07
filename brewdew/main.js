// Import essential libraries
import { resources } from "./src/Resource.js"; // Resource manager
import { events } from "./src/Events.js"; // Global event bus
import { Sprite } from "./src/Sprite.js"; // Sprite rendering component
import { Vector2 } from "./src/Vector2.js"; // 2D vector helper
import { GameLoop } from "./src/GameLoop.js"; // Main game loop
import { Input } from "./src/Input.js"; // Keyboard and mouse input handler
import { GameObject } from "./src/GameObject.js"; // Base class for game objects
import { Camera } from "./src/Camera.js"; // Camera control and positioning
import { SceneManager } from "./src/SceneManager.js"; // Manages world generation and chunks
import { Interface } from "./src/Interface.js"; 
import { Inventory } from "./src/objects/Inventory/Inventory.js"; // Player's inventory management


// Levels
const world = "world";
const brewhouse = "brewhouse";
const worlds = [world, brewhouse]; // worlds to load at start

// Canvas
export const canvas = document.querySelector("#game-canvas"); // imported by Camera, Input
export const ctx = canvas.getContext("2d");
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

const mainBackground = new Sprite({
  resource: resources.images.air,
  frameSize: new Vector2(canvas.width, canvas.height),
});

const mainScene = new GameObject({ position: new Vector2(0, 0) });
const textInput = document.getElementById("text-input");
const gameInput = new Input(textInput);
mainScene.input = gameInput; 

export const camera = new Camera(gameInput); 
mainScene.addChild(camera);

const sceneManager = new SceneManager(mainScene, worlds);
const inventory = new Inventory();
const gameInterface = new Interface(textInput, camera, sceneManager.player);

const update = (delta) => {
  mainScene.stepEntry(delta, mainScene); 
};

const draw = () => {
  // Clear the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.scale(gameInterface.currentScale, gameInterface.currentScale);

  mainBackground.draw(ctx, 0, 0);

  ctx.save();
  ctx.translate(camera.position.x, camera.position.y);

  mainScene.draw(ctx, 0, 0);

  ctx.restore();
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  inventory.draw(ctx, 0, 0);
  
  ctx.font = "12px handjet";
  ctx.fillStyle = "white";
  
  ctx.fillText(gameInterface.inputText, 23, 132);
  
  if (gameInterface.debugDisplay) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour12: true, // Use 24-hour format
    });
    const fps = gameLoop.fps;  
    ctx.fillText(formattedTime, 3, 22);  
    ctx.fillText(`${gameLoop.rafId} fId`, 3, 32);  
    ctx.fillText(`${gameLoop.fps} fps`, 3, 42);
    ctx.fillText(`x${mainScene.children[4].children[0].position.x},y${mainScene.children[4].children[0].position.y} player`, 3, 62);     
    ctx.fillText(`${mainScene.children[4].children[0].currentWorld}`, 3, 52);     
    ctx.fillText(`x${Math.floor(camera.position.x)},y${Math.floor(camera.position.y)} camera`, 3, 72);     
  
  }
};

// Start the game loop with update and draw functions
const gameLoop = new GameLoop(update, draw);
gameLoop.start();

