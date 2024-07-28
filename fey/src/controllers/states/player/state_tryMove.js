import { tryMove } from "../../abilities/player/ability_tryMove.js";
export const tryMoveState = {
  update: (entity, delta, root) => tryMove(entity, delta, root),
  transitions: {
    hasDirection: "movingState",
    noDirection: "idleState",
  },
};
