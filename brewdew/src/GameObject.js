// GameObject.js
import {Vector2} from "./Vector2.js";
import {events} from "./Events.js";

export class GameObject {
  constructor({ position }) {
    this.position = position ?? new Vector2(0, 0);
    this.children = [];
    this.parent = null;
    this.hasReadyBeenCalled = false;
  }
  
  stepEntry(delta, root) {
    // call updates on all children
    this.children.forEach((child) => child.stepEntry(delta, root));
  
    // call ready on first frame
    if (!this.hasReadyBeenCalled) {
      this.hasReadyBeenCalled = true;
      this.ready();
    }
    
    // call implimented step code
    this.step(delta, root);
  }
  
  ready() {
    //... 
  }
  
  
  step(delta) {
    // ...
  }  

  draw(ctx, x, y) {
    const drawPosX = x + this.position.x;
    const drawPosY = y + this.position.y;
    
    this.drawImage(ctx, drawPosX, drawPosY);
    
    this.children.forEach((child) => child.draw(ctx, drawPosX, drawPosY));
    
  } 

  drawImage(ctx, drawPosX, drawPosY) {
    // ...
  }
  // Remove from tree
  destroy() {
    this.children.forEach(child => {
      child.destroy();
    })
    this.parent.removeChild(this)
  }
  addChild(gameObject) {
    gameObject.parent = this;
    this.children.push(gameObject);
  }
  removeChild(gameObject) {
    events.unsubscribe(gameObject)
    this.children = this.children.filter(g => {
      return gameObject !== g;
    })
  }
  
}

