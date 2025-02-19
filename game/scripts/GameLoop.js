class GameLoop {
  constructor(update, render) {
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    this.timeStep = 1000 / 60; // set to run at 60 fps

    this.fps = 0; // fps tracker
    this.frameCount = 0; // fps tracker
    this.frameTime = 0; // fps tracker

    this.update = update;
    this.render = render;

    this.rafId = null;
    this.isRunning = false;
    this.isPaused = false;

    this.debug = false;

    enablePause(this);
  }

  mainLoop = (timestamp) => {
    if (!this.isRunning) return;

    if (this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = timestamp;
    }

    let deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulatedTime -= this.timeStep;
    }
    this.render();

    this.rafId = requestAnimationFrame(this.mainLoop);

    this.frameTime += deltaTime;
    if (this.frameTime >= 1000) {
      this.fps = this.rafId - this.frameCount;
      this.frameCount = this.rafId;
      this.frameTime -= 1000;
    }
  };

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.mainLoop);
    }
  }
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.isRunning = false;
  }
}
function enablePause(gameLoop) {
  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      if (gameLoop.isPaused) {
        unpause();
      } else {
        gameLoop.stop();
        gameLoop.isPaused = true;
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      gameLoop.stop();
      gameLoop.isPaused = true;
      document.title = "Abstract Images";
      document.querySelector('.game-interface').style.filter = "blur(5px)";
      document.getElementById("pause-screen").style.display = "block";    
    }
  });
  document.addEventListener("mousedown", (e) => {
    if (gameLoop.isPaused) {
      unpause();
    }
  });
  function unpause() {
    gameLoop.start();
    document.title = "Fey Unit";
    document.querySelector('.game-interface').style.filter = "none";
    document.getElementById("pause-screen").style.display = "none";


  }
}
