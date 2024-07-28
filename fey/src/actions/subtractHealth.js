import { MIN_HEALTH } from "../constants";
export function subtractHealth(entity, dmg) {
  if (dmg >= entity.currentHealth && dmg > MIN_HEALTH) {
    entity.currentHealth = MIN_HEALTH;
  } else if (dmg > MIN_HEALTH) {
    entity.currentHealth -= dmg;
  } else {
    console.warn("Can't subtract a negative health value.");
  }
  if (entity.currentHealth <= MIN_HEALTH) {
    entity.isSpawned = false;
  }
}
