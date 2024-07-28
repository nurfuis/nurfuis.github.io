import { movingAi } from "../../abilities/ai/ability_moving_ai.js";
export const movingStateAi = {
  update: (entity, delta, root) => movingAi(entity, delta, root),
  transitions: {
    hasNewDirection: "movingStateAi",
    hasArrived: "idleStateAi",
  },
};
