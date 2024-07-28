import { idle } from "../../abilities/player/ability_idle.js";
export const idleState = {
  update: (entity, delta, root) => idle(entity, delta, root),
  transitions: {
    isNotFacingDirection: "changeFacingState",
    isClicking: "tryActionState",
    noDirection: "idleState",
    isFacingDirection: "tryMoveState",
  },
};
