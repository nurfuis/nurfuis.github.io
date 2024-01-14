import { events } from "./src/Events.js"; // Global event bus
import { Vector2 } from "./src/Vector2.js"; // 2D vector helper
import { resources } from "./src/Resource.js"; // 2D vector helper

import { GameLoop } from "./src/GameLoop.js"; // Main game loop
import { Input } from "./src/Input.js"; // Keyboard and mouse input handler
import { GameObject } from "./src/GameObject.js"; // Base class for game objects
import { Camera } from "./src/Camera.js"; // Camera control and positioning
import { Interface } from "./src/Interface.js"; 
import { World } from "./src/Objects/World.js";
const helpText = {
  0: "KEYBOARD INPUTS",
  1: "` enables cell mutations and disables selecting a cell type .",
  2: "1 - = change cells to corresponding type and color scheme.",  
  3: "Q | A increase or decrease the interval duration.",
  4: "W | S increase or decrease resource respawn delay.",  
  5: "E | D increase or decrease growth rate.",
  6: "R | F increase or decrease times a cell can reproduce (-1 for infinity).",
  7: "T | G to kill all or random squares of cells",
  8: "Y to cycle neighborhoods between von Neumann, Moore, or extended.",
  9: "Space pauses the simulation.",
  10: "F1 to view help.",
  11: "F2 to toggle clock.",
  12: "F3 to toggle settings display.",
  13: "F4 to toggle statistics." 
};
export const canvas = document.querySelector("#game-canvas");
export const ctx = canvas.getContext("2d");

const world = new World(0, 0);

const mainScene = new GameObject({ position: new Vector2(0, 0) });
const textInput = document.getElementById("text-input");
const gameInput = new Input(textInput);
mainScene.input = gameInput;
 
mainScene.addChild(world);

export const camera = new Camera(gameInput); 
mainScene.addChild(camera);

const gameInterface = new Interface(textInput, camera);

events.on("PAUSE", this, () => {
  if (gameLoop.isRunning) {
    console.log('stop sim');   
    gameLoop.stop();    
  } else {
    console.log('start sim');
    gameLoop.start();
  }
});

const update = (delta) => {
  const array = Array.from(world.children);
  world.cellsSnapshot = array; 
  world.stage++;
  mainScene.stepEntry(delta, mainScene);
};
const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.scale(camera.currentScale, camera.currentScale);

  ctx.translate(camera.position.x, camera.position.y);
  
  mainScene.draw(ctx, 0, 0);
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);
    
  ctx.font = "24px handjet";
  ctx.fillStyle = "white";
  if (gameInterface.helpDisplay) {
  
    const boxWidth = canvas.width;
    const boxHeight = canvas.height;
    const padding = 40;
    const lineHeight = 24; // Assuming 24px font
    const numLines = 14;

    ctx.fillStyle = "rgba(40, 40, 40, 0.8)"; // Semi-transparent dark background
    ctx.fillRect(
      canvas.width - boxWidth,
      canvas.height - boxHeight,
      boxWidth,
      boxHeight
    );
    for (let i = 0; i < numLines; i++) {
      ctx.font = "24px handjet";
      ctx.fillStyle = "white";    
      ctx.fillText(
        // Replace with your actual help text for each line
        `${helpText[i]}`,
        padding,
        (i + 1) * lineHeight
      );
    }  
  }
  if (gameInterface.clockDisplay) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour12: true, // Use 24-hour format
    });
    ctx.fillText(formattedTime, 4, 22);
  }      
  if (gameInterface.debugDisplay) {
    const fps = gameLoop.fps;  
    ctx.fillStyle = "grey";
    ctx.fillText(`${gameLoop.fps} fps`, 104, 22);    
    ctx.fillText(`${world.stage} ticks`, 164, 22);            
    ctx.fillText(`${gameLoop.rafId} fId`, 294, 22);  
   
  }
  ctx.fillStyle = "white";
  
  ctx.fillText(gameInterface.outputText, 4, 62);
  
  if (gameInterface.settingsDisplay) {
    ctx.fillText(`neighborhood: ${world.cellsSnapshot[0].neighborhood}`, 4, 82);        
    ctx.fillText(`mutations: ${world.cellsSnapshot[0].canMutate}`, 4, 102);    
    ctx.fillText(`rules interval: ${world.cellsSnapshot[0].interval} ms`, 4, 122);
    ctx.fillText(`respawn delay: ${world.cellsSnapshot[0].respawnDelay} ms`, 4, 142);    
    ctx.fillText(`growth rate: % ${world.cellsSnapshot[0].growth / 10}`, 4, 162);   
    ctx.fillText(`growth capacity: ${world.cellsSnapshot[0].capacity}`, 4, 182);
  }
  if (gameInterface.statisticsDisplay) {
    ctx.fillText(`mode age: ${Math.round(world.populationStats.mode)}`, 4, 222);    
    ctx.fillText(`mean age: ${Math.round(world.populationStats.mean)}`, 4, 242);
    ctx.fillText(`min age: ${world.populationStats.min}`, 4, 262);
    ctx.fillText(`max age: ${world.populationStats.max}`, 4, 282);
    ctx.fillText(`count: ${world.populationStats.total} | %: ${Math.floor(world.populationStats.percent) }`, 4, 302);   
  }
};

const gameLoop = new GameLoop(update, draw);
gameLoop.start();

