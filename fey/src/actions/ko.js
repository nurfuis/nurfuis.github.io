import { MIN_HEALTH } from "../constants";
export class ko {
  constructor(entity) {
    entity.currentHealth = MIN_HEALTH;
  }
}
