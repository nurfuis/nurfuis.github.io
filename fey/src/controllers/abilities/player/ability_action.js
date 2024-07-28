import { LEFT, RIGHT, UP, DOWN } from "../../../Input.js";
import { SWING_TIMER } from "../../../constants.js";

const validWeapons = {};

export function action(entity, delta, root) {
  if (entity.isBusy === SWING_TIMER) {
    const direction = entity.facingDirection;

    // Get weapon
    let weapon = undefined;

    if (validWeapons[weapon]) {
      weapon = validWeapons[weapon];
    } else {
      console.warn("Equip a valid weapon");
    }

    // entity._attackWeapon = new weapon(0, 0, entity.currentWorld, direction);

    // if (direction === "RIGHT" || direction === "UP") {
    //   entity.equipMinusZ.addChild(entity._attackWeapon);
    // } else {
    //   entity.equipPlusZ.addChild(entity._attackWeapon);
    // }

    if (entity.facingDirection === LEFT) {
      entity.body.animations.play("attackLeft");
    }
    if (entity.facingDirection === RIGHT) {
      entity.body.animations.play("attackRight");
    }
    if (entity.facingDirection === UP) {
      entity.body.animations.play("attackUp");
    }
    if (entity.facingDirection === DOWN) {
      entity.body.animations.play("attackDown");
    }
  }

  if (entity.isBusy > 0) {
    entity.isBusy -= delta;
  }

  if (entity.isBusy <= 0) {
    entity.isBusy = 0;
    // entity._attackWeapon.destroy();
  }
}
