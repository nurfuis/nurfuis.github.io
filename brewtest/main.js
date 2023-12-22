// Import essential libraries
import { resources } from "./src/Resource.js"; // Resource manager
import { events } from "./src/Events.js"; // Global event bus
import { Sprite } from "./src/Sprite.js"; // Sprite rendering component
import { Vector2 } from "./src/Vector2.js"; // 2D vector helper
import { GameLoop } from "./src/GameLoop.js"; // Main game loop
import { Input } from "./src/Input.js"; // Keyboard and mouse input handler
import { GameObject } from "./src/GameObject.js"; // Base class for game objects
import { Camera } from "./src/Camera.js"; // Camera control and positioning

// Import objects by category
import { Chunks } from "./src/objects/Chunks/Chunks.js"; // Manages world generation and chunks
import { Colliders } from "./src/objects/Colliders/Colliders.js"; // Collision detection and management
import { Tiles } from "./src/objects/Tiles/Tiles.js"; // Tile layer for the world
import { Items } from "./src/objects/Items/Items.js"; // Items placed around the world
import { Entities } from "./src/objects/Entities/Entities.js"; // Entities like NPCs and enemies
import { Player } from "./src/objects/Player/Player.js"; // Player character with movement and interactions
import { Inventory } from "./src/objects/Inventory/Inventory.js"; // Player's inventory management

// Define canvas element and context
export const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

// Create the main scene as a root game object
export const mainScene = new GameObject({
  position: new Vector2(0, 0), // Main scene doesn't move with camera
});

// Create a player
export const player = new Player(96, 96);

// Define a static background image
const mainBackground = new Sprite({
  resource: resources.images.sky,
  frameSize: new Vector2(canvas.width, canvas.height),
});

// Initialize a chunk manager for world generation
const chunks = new Chunks();

// Initialize the collision detection system
export const colliders = new Colliders();

// Create a tile layer for the world
export const tiles = new Tiles();
mainScene.addChild(tiles); // Add tiles to the main scene

// Create an item layer for dropped and interactable objects
export const items = new Items();
mainScene.addChild(items); // Add items to the main scene

// Create an entity layer for NPCs, enemies, and other interactable objects
export const entities = new Entities();
mainScene.addChild(entities); // Add entities to the main scene

// Initialize the camera with its own position relative to the scene
export const camera = new Camera();
mainScene.addChild(camera); // Add camera to the main scene

// Configure player input handling
mainScene.input = new Input();




// Define inventory for the player
const inventory = new Inventory();

// Main update loop called every frame with delta time
const update = (delta) => {
  mainScene.stepEntry(delta, mainScene); // Update the entire scene and its children
};

// Main draw loop called every frame
const draw = () => {
  // Clear the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the static background (not affected by camera)
  // Replace with actual implementation if needed

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

