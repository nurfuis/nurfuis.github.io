import { FrameIndexPattern } from "../FrameIndexPattern.js";
import { Animations } from "../Animations.js";
import { StateMachine } from "../controllers/StateMachine.js";
import {
  HOP_DOWN,
  HOP_LEFT,
  HOP_RIGHT,
  HOP_UP,
  IDLE_DOWN,
  IDLE_LEFT,
  IDLE_RIGHT,
  IDLE_UP,
} from "../animations/blobAnimations.js";
import {
  WALK_UP,
  WALK_DOWN,
  WALK_LEFT,
  WALK_RIGHT,
  STAND_DOWN,
  STAND_UP,
  STAND_RIGHT,
  STAND_LEFT,
} from "../animations/playerAnimations.js";

export const propertyHandlers = {
  // Property name: function to handle the logic
  light: (newEntity, value) => {
    newEntity.isIlluminated = false;
    newEntity.light(value);
  },
  brain: (newEntity, value) => {
    newEntity.brain = value;
    newEntity.controller = new StateMachine(newEntity);
  },
  shape: (newEntity, value) => {
    newEntity.shape = value;
  },
  "stat.speed": (newEntity, value) => {
    newEntity.speed = value;
  },
  "stat.strength": (newEntity, value) => {
    newEntity.strength = value;
  },
  "stat.agility": (newEntity, value) => {
    newEntity.agility = value;
  },
  "stat.health": (newEntity, value) => {
    newEntity.currentHealth = value;
  },
  "stat.maxHealth": (newEntity, value) => {
    newEntity.maxHealth = value;
  },
  mien: (newEntity, value) => {
    newEntity.mien = value;
  },
  sensingRadius: (newEntity, value) => {
    newEntity.sensingRadius = value;
  },
  "shadow.offset": (newEntity, value) => {
    const offsetParts = value.split(",");
    if (offsetParts.length !== 2) {
      throw new TypeError(
        "shadow.offset must be a pair of integers separated by a comma. Check custom properties of the template in Tiled."
      );
    }

    const [x, y] = offsetParts.map((part) => parseInt(part, 10));
    if (isNaN(x) || isNaN(y)) {
      throw new TypeError(
        "shadow.offset values must be integers. Check custom properties of the template in Tiled."
      );
    }
    console.log(newEntity.shadow);
    newEntity.shadow.position.x = x;
    newEntity.shadow.position.y = y;
  },
  "shadow.scale": (newEntity, value) => {
    newEntity.shadow.scale = value;
  },
  "sprite.frame": (newEntity, value) => {
    newEntity.body.frame = value;
  },
  "sprite.spacing": (newEntity, value) => {
    newEntity.body.spacing = value;
  },
  "sprite.offset": (newEntity, value) => {
    const offsetParts = value.split(",");
    if (offsetParts.length !== 2) {
      throw new TypeError(
        "sprite.offset must be a pair of integers separated by a comma. Check custom properties of the template in Tiled."
      );
    }

    const [x, y] = offsetParts.map((part) => parseInt(part, 10));
    if (isNaN(x) || isNaN(y)) {
      throw new TypeError(
        "sprite.offset values must be integers. Check custom properties of the template in Tiled."
      );
    }

    newEntity.body.position.x = x;
    newEntity.body.position.y = y;
  },
  animations: (newEntity, value) => {
    if (!newEntity.body.animations) {
      newEntity.body.animations = Animations.create();
    }
    newEntity.bodyType = value;

    if (value === "blob") {
      newEntity.body.animations.addAnimation(
        "moveDown",
        new FrameIndexPattern(HOP_DOWN)
      );
      newEntity.body.animations.addAnimation(
        "moveUp",
        new FrameIndexPattern(HOP_UP)
      );
      newEntity.body.animations.addAnimation(
        "moveLeft",
        new FrameIndexPattern(HOP_LEFT)
      );
      newEntity.body.animations.addAnimation(
        "moveRight",
        new FrameIndexPattern(HOP_RIGHT)
      );

      newEntity.body.animations.addAnimation(
        "idleDown",
        new FrameIndexPattern(IDLE_DOWN)
      );
      newEntity.body.animations.addAnimation(
        "idleUp",
        new FrameIndexPattern(IDLE_UP)
      );
      newEntity.body.animations.addAnimation(
        "idleLeft",
        new FrameIndexPattern(IDLE_LEFT)
      );
      newEntity.body.animations.addAnimation(
        "idleRight",
        new FrameIndexPattern(IDLE_RIGHT)
      );
    }

    if (value === "humanoid") {
      newEntity.body.animations.addAnimation(
        "moveDown",
        new FrameIndexPattern(WALK_DOWN)
      );
      newEntity.body.animations.addAnimation(
        "moveUp",
        new FrameIndexPattern(WALK_UP)
      );
      newEntity.body.animations.addAnimation(
        "moveLeft",
        new FrameIndexPattern(WALK_LEFT)
      );
      newEntity.body.animations.addAnimation(
        "moveRight",
        new FrameIndexPattern(WALK_RIGHT)
      );

      newEntity.body.animations.addAnimation(
        "idleDown",
        new FrameIndexPattern(STAND_DOWN)
      );
      newEntity.body.animations.addAnimation(
        "idleUp",
        new FrameIndexPattern(STAND_UP)
      );
      newEntity.body.animations.addAnimation(
        "idleLeft",
        new FrameIndexPattern(STAND_LEFT)
      );
      newEntity.body.animations.addAnimation(
        "idleRight",
        new FrameIndexPattern(STAND_RIGHT)
      );
    }
  },
};
