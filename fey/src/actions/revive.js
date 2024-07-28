import { MAX_HEALTH } from "../constants";
export class revive {
  constructor(entity) {
    entity.currentHealth = MAX_HEALTH;
  }
}
