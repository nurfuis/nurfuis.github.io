export class GameLoop {
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
    }
  
    mainLoop = (timestamp) => {
      if (!this.isRunning) return;
  
      if (this.isPaused){
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
  