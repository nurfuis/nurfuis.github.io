const debug = true;

import { foreground_id, gameParams } from "./config/constants.js";

import { loadMap } from "./src/utils/loadMap.js";

import { Vector2 } from "./src/Vector2.js";
import { GameObject } from "./src/GameObject.js";
import { GameLoop } from "./src/GameLoop.js";
import { World } from "./src/World.js";
import { Camera } from "./src/Camera.js";
import { Input } from "./src/Input.js";
import { AutomatedInput } from "./src/utils/AutomatedInput.js";
import { Player } from "./src/Player.js";
import { Inventory } from "./src/Inventory.js";

const gameWrapper = createGameWrapper();
const gameCanvasMain = createGameCanvasMain();
const gameCtx = gameCanvasMain.getContext("2d");

const mapData = await loadMap();

const main = new GameObject({ position: new Vector2(0, 0) });

main.world = new World();
main.world.build(mapData);
main.addChild(main.world);

main.camera = new Camera(main.world.tileWidth);
main.addChild(main.camera);

main.automatedInput = new AutomatedInput();
main.input = new Input(
  main.world.tileWidth,
  main.world.tileHeight,
  main.camera
);

export const player = new Player();
main.player = player;
main.world.children[foreground_id].addChild(main.player);

const inventory = new Inventory();
player.inventory = inventory;

const update = (delta) => {
  main.stepEntry(delta, main);
};

const draw = () => {
  gameCtx.clearRect(0, 0, gameCanvasMain.width, gameCanvasMain.height);
  gameCtx.save();

  main.camera.follow(gameCtx, 0, 0);

  main.draw(gameCtx, 0, 0);

  gameCtx.restore();

  inventory.draw(gameCtx, 0, 0);
};

const gameLoop = new GameLoop(update, draw);
gameLoop.name = "mainLoop";
gameLoop.start();

function createGameCanvasMain() {
  const gameCanvasMain = document.createElement("canvas");
  gameCanvasMain.style.zIndex = "1";
  gameCanvasMain.width = gameParams.width;
  gameCanvasMain.height = gameParams.height;
  gameCanvasMain.style.backgroundColor = gameParams.backgroundColor;

  gameWrapper.appendChild(gameCanvasMain);
  return gameCanvasMain;
}

function createGameWrapper() {
  const body = document.getElementsByTagName("body");

  const gameWrapper = document.createElement("div");
  gameWrapper.style.position = "relative";
  gameWrapper.style.display = "flex";
  gameWrapper.style.justifyContent = "center";
  gameWrapper.style.alignItems = "center";

  body[0].appendChild(gameWrapper);
  return gameWrapper;
}

if (debug) {
  console.log(main);
}
