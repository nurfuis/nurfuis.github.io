import { resources } from "./src/Resource.js"; // props, scenery, wardrobe
import { Sprite } from "./src/Sprite.js"; // visuals
import { events } from "./src/Events.js"; // cues
import { Vector2 } from "./src/Vector2.js"; // positions
import { GameLoop } from "./src/GameLoop.js"; // clock
import { Input } from "./src/Input.js"; // director
import { GameObject } from "./src/GameObject.js"; // stage tree [roots, trunk, limbs, branches, sticks, leaves, flowers, acorns]
import { Camera } from "./src/Camera.js"; // camera
import { SceneManager } from "./src/SceneManager.js"; // stage manager
import { GameInterface } from "./src/GameInterface.js"; 
import { Inventory } from "./src/objects/Inventory/Inventory.js"; // 
import { Player } from "./src/objects/Player/Player.js"; 
import { Entities } from "./src/objects/Entities/Entities.js"; 
import { Foreground } from "./src/objects/Foreground.js"; 

const playerOne = new Player();
const playerList = [playerOne];

const setOne = "tutorialMap";
const setTwo = "brewhouse";
const setList = [setOne, setTwo]; 

const stage = document.querySelector("#game-stage"); 
const ctx = stage.getContext("2d");

const muslin = new Sprite({
  resource: resources.images.air,
  frameSize: new Vector2(stage.width, stage.height),
});

const mainScene = new GameObject({ position: new Vector2(0, 0) });
mainScene.input = new Input();

const sceneManager = new SceneManager(mainScene, setList, playerList);

const camera = new Camera(); 
mainScene.addChild(camera);

const inventory = new Inventory();

const gameInterface = new GameInterface();

const rays = [];
const playerColor = '#ffffff';
const entityColor = '#007bff'; 
const collisionColor = '#ffc107';
 
export function visualizeRaycast(startX, startY, endX, endY, collision, object) {
  const ray = {
    startTime: Date.now(), // Store starting time
    startX,
    startY,
    endX,
    endY,
    collision,
    type: object.type // Store object type for color selection
  };
  rays.push(ray);
}

function updateRays() {
  for (let i = rays.length - 1; i >= 0; i--) {
    const ray = rays[i];
    const elapsedTime = Date.now() - ray.startTime;
    const alpha = Math.max(0, 1 - elapsedTime / 2000); // Fade out over 2 seconds

    ctx.beginPath();
    ctx.moveTo(ray.startX, ray.startY);
    ctx.lineTo(ray.endX, ray.endY);
    ctx.lineWidth = 2;

    // Set color based on object type
    ctx.strokeStyle = ray.type === 'player' ? playerColor : entityColor;
    ctx.strokeStyle = `rgba(${ctx.strokeStyle.replace('#', '')}, ${alpha})`; // Apply fading alpha

    ctx.stroke();

    if (ray.collision) {
      ctx.fillStyle = 'red'; // Green with fading alpha
      ctx.beginPath();
      ctx.arc(ray.collision.x, ray.collision.y, 5, 0, Math.PI * 2, true);
      ctx.fill();
    }

    if (alpha === 0) {
      rays.splice(i, 1); // Remove fully faded rays
    }
  }
}
const update = (delta) => {
  mainScene.stepEntry(delta, mainScene);
};

const draw = () => {
  ctx.clearRect(0, 0, stage.width, stage.height);

  muslin.draw(ctx, 0, 0);

  ctx.save();
  ctx.translate(camera.position.x, camera.position.y);

  mainScene.draw(ctx, 0, 0);
  updateRays();

  ctx.restore();
   
  inventory.draw(ctx, 0, 0);
  
  ctx.font = "24px handjet";
  ctx.fillStyle = "white";
  
  ctx.fillText(gameInterface.inputText, 23, 132);
  
  if (gameInterface.debugDisplay) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour12: true, // Use 24-hour format
    });
    const fps = gameLoop.fps;  
    ctx.font = "12px handjet";
    
    ctx.fillText(formattedTime, 3, 22);  
    ctx.fillText(`${gameLoop.rafId} fId`, 3, 32);  
    ctx.fillText(`${gameLoop.fps} fps`, 3, 42);
    ctx.fillText(`x${playerOne.position.x},${playerOne.position.y},${playerOne.currentWorld}`, 3, 52);
    
  }
};

// Start the game loop with update and draw functions
const gameLoop = new GameLoop(update, draw);
gameLoop.start();

