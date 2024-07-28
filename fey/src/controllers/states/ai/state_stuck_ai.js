import { stuckAi } from "../../abilities/ai/ability_stuck_ai.js";
export const stuckStateAi = {
  update: (entity, delta, root) => stuckAi(entity, delta, root),
  transitions: {
    exceedsStuckTurns: "idleStateAi",
  },
};
