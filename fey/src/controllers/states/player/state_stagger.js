import { stagger } from "../../abilities/player/ability_stagger.js";
export const staggerState = {
  update: (entity, delta, root) => stagger(entity, delta, root),
  transitions: {
    hasCollision: "staggerState",
    noCollision: "clearState",
  },
};