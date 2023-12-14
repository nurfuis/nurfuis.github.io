import {resources} from "./src/Resource.js";
import {Sprite} from "./src/Sprite.js";
import {Vector2} from "./src/Vector2.js";
import {GameLoop} from "./src/GameLoop.js";
import {Input} from "./src/Input.js";
import {gridCells} from "./src/helpers/grid.js";
import {GameObject} from "./src/GameObject.js";
import {Player} from "./src/objects/Player/Player.js";
import {Camera} from "./src/Camera.js";
import {Inventory} from "./src/objects/Inventory/Inventory.js";
import {Tile} from "./src/objects/Tile/Tile.js";
import {ChunkManager} from "./src/ChunkManager.js";
import world from './src/levels/1/world.json' assert { type: 'json' };
// Canvas
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

// Main Scene
const mainScene = new GameObject({
  position: new Vector2(0, 0)
})

// Main background (doesn't pan with camera)  
const mainBackground = new Sprite({
  resource: resources.images.sky,
  frameSize: new Vector2(canvas.width, canvas.height)
})

// Chunk Manager
export const chunkManager = new ChunkManager(world);
mainScene.addChild(chunkManager);

// Player Character
const player = new Player(gridCells(7), gridCells(7));
mainScene.addChild(player);

// Camera
const camera = new Camera();
mainScene.addChild(camera);

// Overlays
const inventory = new Inventory();

// Input
mainScene.input = new Input();

// Update and Draw Loops
const update = (delta) => {
  mainScene.stepEntry(delta, mainScene)
};

const draw = () => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  // mainBackground.drawImage(ctx, 0, 0);
 
  // Camera effect
  // Save the current canvas state
  ctx.save();
  
  // Offset by camera position
  ctx.translate(camera.position.x, camera.position.y);
  
  // Draw scene
  mainScene.draw(ctx, 0, 0); 

  // restore to original state - complete camera effect
  ctx.restore();

  // draw overlays
  inventory.draw(ctx, 0, 0);
}; 
// Start Game
const gameLoop = new GameLoop(update, draw)
gameLoop.start();