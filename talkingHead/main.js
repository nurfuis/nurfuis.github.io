const debug = true;
let state = 1;
let loadStartMain = true;
let loadStartGame = true;

let showMain = true;

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

import { resources } from "./src/utils/loadResources.js";
import { events } from "./src/Events.js";
import { Vector2 } from "./src/Vector2.js";
import { GameObject } from "./src/GameObject.js";
import { GameLoop } from "./src/GameLoop.js";
import { Camera } from "./src/Camera.js";
import { Input } from "./src/Input.js";
import { AUTO_START, BACKGROUND_COLOR } from "./src/constants.js";
import { Head } from "./src/head.js";

let main;

const gameWrapper = createGameWrapper();
const gameCanvasMain = createGameCanvasMain();
const ctx = gameCanvasMain.getContext("2d");

const camera = new Camera();

const input = new Input();
input.camera = camera;

const update = (delta) => {
  if (showMain) main?.stepEntry(delta, main);
};

const draw = () => {
  ctx.clearRect(0, 0, gameCanvasMain.width, gameCanvasMain.height);
  ctx.save();

  camera.follow(ctx, 0, 0);

  if (showMain) main?.draw(ctx, 0, 0);

  ctx.restore();
};

const gameLoop = new GameLoop(update, draw);
gameLoop.name = "mainLoop";

function createGameCanvasMain() {
  const gameCanvasMain = document.createElement("canvas");
  gameCanvasMain.id = "gameCanvas";
  gameCanvasMain.style.zIndex = "1";

  gameCanvasMain.width = 512;
  gameCanvasMain.height = 512;

  gameCanvasMain.style.backgroundColor = BACKGROUND_COLOR;

  gameWrapper.appendChild(gameCanvasMain);
  return gameCanvasMain;
}
function createGameWrapper() {
  const body = document.getElementsByTagName("body");
  const gameWrapper = document.createElement("div");
  gameWrapper.style.position = "relative";
  gameWrapper.style.display = "none";
  gameWrapper.style.justifyContent = "center";
  gameWrapper.style.alignItems = "center";
  body[0].appendChild(gameWrapper);
  return gameWrapper;
}
function createStartButton() {
  const body = document.getElementsByTagName("body");

  const startContainer = document.createElement("div");
  startContainer.classList.add("container");

  const startChild = document.createElement("div");
  startContainer.appendChild(startChild);

  const startButton = document.createElement("button");
  startButton.textContent = "Start";
  startButton.id = "start";
  startButton.addEventListener("click", () => {
    startContainer.remove();

    gameWrapper.style.display = "flex";

    init();
    console.log("Start!");
  });

  startChild.appendChild(startButton);

  body[0].appendChild(startContainer);
  return startContainer;
}

function startGame() {
  input.addCanvas(gameCanvasMain);
  gameLoop.start();
}

async function startMain() {
  main = new GameObject({ position: new Vector2(0, 0) });
  main.addChild(camera);

  input.tileWidth = 32;
  input.tileHeight = 32;
  main.input = input;

  const head = new Head();
  main.addChild(head);

  if (debug) console.log(main);
}

async function init() {
  if (loadStartMain) {
    await startMain();
  }
  if (loadStartGame) {
    startGame();
  }
}

events.on("F1", this, () => {
  switch (state) {
    case 1:
      state = 2;
      showMain = !showMain;

      break;
    case 2:
      state = 1;
      showMain = !showMain;

      break;
    default:
      break;
  }
});
window.onload = function () {
  if (!AUTO_START) createStartButton();
};
events.on("RESOURCES_LOADED", this, () => {
  if (!!AUTO_START) {
    const startScreen = document.querySelectorAll(".container")[0];

    if (!!startScreen) startScreen.remove();

    gameWrapper.style.display = "flex";

    init();
  }
  console.log("Resources are Loaded: ", resources);
});
