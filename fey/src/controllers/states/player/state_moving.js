import { moving } from "../../abilities/player/ability_moving.js";
export const movingState = {
  update: (entity, delta, root) => moving(entity, delta, root),
  transitions: {
    hasDirection: "movingState",
    noDirection: "tryMoveState",
  },
};
