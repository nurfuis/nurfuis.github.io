class Animations {
  constructor(patterns = {}) {
    this.patterns = patterns;
    this.activeKey = Object.keys(this.patterns)[0] || null; // Set to null if no patterns
  }

  addAnimation(key, pattern) {
    this.patterns[key] = pattern;
    // Optionally update activeKey if it's null or set as desired
    if (!this.activeKey) {
      this.activeKey = key;
    }
  }
  get frame() {
    if (this.activeKey && this.patterns[this.activeKey]) {
      return this.patterns[this.activeKey].frame;
    } else {
      // Return a default frame or handle the missing animation (e.g., log a warning)
      // console.warn(this.activeKey, this.patterns[this.activeKey])
      return 0; // Example default frame
    }
  }

  play(key, startAtTime = 0) {
    if (this.activeKey === key) {
      return; // Already playing the requested animation
    }
  
    if (this.patterns[key]) { // Check if the animation exists
      this.activeKey = key;
      this.patterns[this.activeKey].currentTime = startAtTime;
    } else {
      console.warn(`Animation key "${key}" not found`, this);
      // Handle missing animation (e.g., play a default animation, log a different error)
    }
  }

  step(delta) {
    if (this.activeKey && this.patterns[this.activeKey]) {
      this.patterns[this.activeKey].step(delta);
    }
  }

  // Static method to create an instance without a constructor
  static create() {
    return new Animations();
  }
}