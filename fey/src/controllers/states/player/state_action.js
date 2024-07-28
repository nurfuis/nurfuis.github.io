import {action } from "../../abilities/player/ability_action.js";
export const actionState = {
    update: (entity, delta, root) => action(entity, delta, root),
    transitions: {
      isBusy: "actionState",
      isIdle: "idleState",
    },
  };