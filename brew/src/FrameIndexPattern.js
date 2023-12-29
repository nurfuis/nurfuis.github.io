export class FrameIndexPattern {
  constructor(animationConfig) {
    this.currentTime = 0;
    this.animationConfig = animationConfig;
    this.duration = animationConfig.duration ?? 500;
  }
  // get frame based on how much time has passed since animation play began
  // playerAnimations.js has examples of how to config an animation
  get frame() {
    const {frames} = this.animationConfig;
    // checks each frame starting with the last and returns frame 0 first
    for (let i = frames.length - 1; i >= 0; i--) {
      if (this.currentTime >= frames[i].time) {
        return frames[i].frame;
      }
    }
    throw "Time is before the first keyframe";
  }

  step(delta) {
    this.currentTime += delta;
    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
    }
  }

}