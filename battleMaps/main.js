import gameParams from "./config/gameParams.json";

import { Vector2 } from "./src/Vector2";

import { GameObject } from "./src/gameObject";
import { GameLoop } from "./src/gameLoop";
import { loadMaps } from "./src/loadMaps";

const gameWrapper = createGameWrapper();

const gameCanvasMain = createGameCanvasMain();
const gameCtx = gameCanvasMain.getContext("2d");

const gameOffscreenCanvas = createGameOffscreenCanvas();
const gameOffscreenCtx = gameOffscreenCanvas.getContext("2d");

const main = new GameObject({ position: new Vector2(0, 0) });

const gameMaps = ["world"];
const mapsData = loadMaps(gameMaps);
main.maps = mapsData;

const update = (delta) => {
  main.stepEntry(delta, main);
};

const draw = () => {
  gameCtx.clearRect(0, 0, gameCanvasMain.width, gameCanvasMain.height);
  main.draw(gameCtx, 0, 0);

  gameOffscreenCtx.clearRect(
    0,
    0,
    gameOffscreenCanvas.width,
    gameOffscreenCanvas.height
  );
  gameCtx.drawImage(gameOffscreenCanvas, 0, 0);
};

const gameLoop = new GameLoop(update, draw);
gameLoop.name = "mainLoop";
gameLoop.start();

function createGameOffscreenCanvas() {
  const gameOffscreenCanvas = document.createElement("canvas");
  gameOffscreenCanvas.width = gameParams.width;
  gameOffscreenCanvas.height = gameParams.height;

  return gameOffscreenCanvas;
}

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
