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

const update = (delta) => {
  mainScene.stepEntry(delta, mainScene);
};

const draw = () => {
  ctx.clearRect(0, 0, stage.width, stage.height);

  muslin.draw(ctx, 0, 0);

  ctx.save();
  ctx.translate(camera.position.x, camera.position.y);

  mainScene.draw(ctx, 0, 0);

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

