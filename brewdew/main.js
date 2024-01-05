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
import { Inventory } from "./src/objects/Inventory/Inventory.js"; // Player's inventory management

// Levels
const world = "world";
const brewhouse = "brewhouse";
const worlds = [world, brewhouse]; // worlds to load at start


// Canvas
export const canvas = document.querySelector("#game-canvas"); // imported by Camera, Input
const ctx = canvas.getContext("2d");
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

// Main Scene
const mainScene = new GameObject({ position: new Vector2(0, 0) });
mainScene.input = new Input();

export const camera = new Camera(); // imported by Input
mainScene.addChild(camera);

const sceneManager = new SceneManager(mainScene, worlds);

const inventory = new Inventory();

const update = (delta) => {
  mainScene.stepEntry(delta, mainScene); // Update the entire scene and its children
};

// Main draw loop called every frame
const draw = () => {
  // Clear the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply camera offset for scene rendering
  ctx.save();
  ctx.translate(camera.position.x, camera.position.y);

  // Draw the entire scene hierarchy starting from the main scene
  mainScene.draw(ctx, 0, 0);

  // Restore original context after drawing the scene
  ctx.restore();

  // Draw any UI elements on top of the scene, like the inventory
  inventory.draw(ctx, 0, 0);
};

// Start the game loop with update and draw functions
const gameLoop = new GameLoop(update, draw);
gameLoop.start();

