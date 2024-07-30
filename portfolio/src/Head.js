import { GameObject } from "./GameObject.js";
import { Vector2 } from "./Vector2.js";
import { Sprite } from "./Sprite.js";
import { events } from "./Events.js";
import { resources } from "./utils/loadResources.js";

export class Head extends GameObject {
  constructor() {
    super({
      position: new Vector2(0, 0),
    });
  }

  addHead() {
    this.speakingCount = 0;
    this.scanningCount = 0;

    this.head = new Sprite({
      resource: resources.images.head,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, 0),
    });
    this.addChild(this.head);

    this.face = new Sprite({
      resource: resources.images.face,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, 0),
    });
    this.addChild(this.face);

    this.mouth = new Sprite({
      resource: resources.images.mouth,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, -20),
    });
    this.addChild(this.mouth);

    this.mustache = new Sprite({
      resource: resources.images.mustache,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, -20),
    });
    this.addChild(this.mustache);

    this.eyebrows = new Sprite({
      resource: resources.images.eyebrows,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, 0),
    });
    this.addChild(this.eyebrows);

    this.hair = new Sprite({
      resource: resources.images.hair,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, 2),
    });
    this.addChild(this.hair);

    this.wideEyes = new Sprite({
      resource: resources.images.wideEyes,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, -16),
    });
    this.addChild(this.wideEyes);

    this.eyes = new Sprite({
      resource: resources.images.eyes,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, 6),
    });
    this.addChild(this.eyes);

    this.redEyes = new Sprite({
      resource: resources.images.redEyes,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, 0),
    });
    // this.addChild(this.redEyes);
    this.openMouth = new Sprite({
      resource: resources.images.openMouth,
      frameSize: new Vector2(512, 512),
      position: new Vector2(0, -20),
    });
    this.addChild(this.openMouth);

    this.eyeLimitX = 10;
    this.eyeLimitY = 10;

    events.on("MOUSE_MOVED", this, (position) => {
      this.eyesBusy = true;
      this.mouthBusy = true;
      this.openMouth.visible = false;

      this.targetEyeX = position.x;
      this.targetEyeY = position.y;
    });
    events.on("MOUSE_OUT", this, (position) => {
      this.eyesBusy = false;
      this.mouthBusy = false;
      this.openMouth.visible = true;

      this.targetEyeX = null;
      this.targetEyeY = null;

      this.eyes.position.x = this.position.x;
      this.eyes.position.y = this.position.y + 6;
    });
  }

  step(delta, root) {
    this.idleEyes();
    this.blink();
    this.gape();
    this.brow();
    this.stache();
    this.moveHair();
    this.moveHead();
  }
  moveHead() {
    if (this.headMoved) return;

    // if (Math.random() < 0.02) {
    //   this.head.position.x -= 2;
    //   this.headMoved = true;

    //   setTimeout(() => {
    //     this.head.position.x += 2;
    //     this.headMoved = false;
    //   }, 150);
    // }

    //   if (Math.random() < 0.02) {
    //     this.head.position.x += 2;
    //     this.headMoved = true;

    //     setTimeout(() => {
    //       this.head.position.x -= 2;
    //       this.headMoved = false;
    //     }, 150);
    //   }

    if (Math.random() < 0.001) {
      this.head.position.y += 2;
      this.headMoved = true;

      setTimeout(() => {
        this.head.position.y -= 2;
        this.headMoved = false;
      }, 150);
    }

    if (Math.random() < 0.001) {
      this.head.position.y -= 2;
      this.headMoved = true;

      setTimeout(() => {
        this.head.position.y += 2;
        this.headMoved = false;
      }, 150);
    }
  }

  moveHair() {
    if (this.hairRaised) return;

    if (Math.random() < 0.001) {
      this.hair.position.y += 1;
      this.hairRaised = true;
      setTimeout(() => {
        this.hair.position.y -= 1;
        this.hairRaised = false;
      }, 150);
    }
  }

  stache() {
    if (this.stacheRaised) return;
    if (Math.random() < 0.002) {
      this.mustache.position.y += 1;
      this.stacheRaised = true;
      setTimeout(() => {
        this.mustache.position.y -= 1;
        this.stacheRaised = false;
      }, 150);
    }
  }

  brow() {
    if (this.eyebrowsRaised) return;
    if (Math.random() < 0.001) {
      this.eyebrows.position.y -= 2;
      this.eyebrowsRaised = true;
      setTimeout(() => {
        this.eyebrows.position.y += 2;
        this.eyebrowsRaised = false;
      }, 150);
    }
  }

  gape() {
    if (this.mouthOpen) return;
    if (this.mouthBusy) return;
    if (this.speakingCooldown && this.speakingCount <= 0) {
      this.speakingCooldown = false;
      this.openMouth.visible = true;
    }

    if (this.speakingCooldown && this.speakingCount > 0) {
      this.speakingCount -= 1;
      return;
    }
    if (this.speakingCount > 20) {
      this.speakingCooldown = true;
      this.openMouth.visible = false;
      this.speakingCount = 300;
    }

    if (Math.random() < 0.1) {
      this.openMouth.position.y += 16;
      this.mouthOpen = true;
      this.speakingCount += 1;
      setTimeout(() => {
        this.openMouth.position.y -= 16;
        this.mouthOpen = false;
      }, 100);
    }
  }

  blink() {
    if (Math.random() < 0.005) {
      this.wideEyes.position.y += 2;

      setTimeout(() => {
        this.wideEyes.position.y -= 2;
      }, 150);
    }
  }

  idleEyes() {
    if (this.eyesBusy && this.targetEyeX !== null && this.targetEyeY !== null) {
      const dx = (this.targetEyeX - 256) * 0.001;
      const dy = (this.targetEyeY - 256) * 0.001;

      const newPosX = this.eyes.position.x + dx;

      const newPosY = this.eyes.position.y + dy;

      if (Math.abs(newPosX) < this.eyeLimitX) {
        this.eyes.position.x = newPosX;
      }
      if (Math.abs(newPosY) < this.eyeLimitY) {
        this.eyes.position.y = newPosY;
      }
    }
    if (this.eyesBusy) return;

    if (this.eyesMoved) return;
    if (this.scanningCooldown && this.scanningCount <= 0) {
      this.scanningCooldown = false;
    }

    if (this.scanningCooldown && this.scanningCount > 0) {
      this.scanningCount -= 1;
      return;
    }
    if (this.scanningCount > 20) {
      this.scanningCooldown = true;
      this.scanningCount = 300;
    }
    this.scanningCount += 1;

    if (Math.random() < 0.02) {
      this.eyes.position.x -= 2;
      this.eyesMoved = true;

      setTimeout(() => {
        this.eyes.position.x += 2;
        this.eyesMoved = false;
      }, 150);
    }

    if (Math.random() < 0.02) {
      this.eyes.position.x += 2;
      this.eyesMoved = true;

      setTimeout(() => {
        this.eyes.position.x -= 2;
        this.eyesMoved = false;
      }, 150);
    }

    if (Math.random() < 0.02) {
      this.eyes.position.y += 2;
      this.eyesMoved = true;

      setTimeout(() => {
        this.eyes.position.y -= 2;
        this.eyesMoved = false;
      }, 150);
    }

    if (Math.random() < 0.02) {
      this.eyes.position.y -= 2;
      this.eyesMoved = true;

      setTimeout(() => {
        this.eyes.position.y += 2;
        this.eyesMoved = false;
      }, 150);
    }
  }
}
