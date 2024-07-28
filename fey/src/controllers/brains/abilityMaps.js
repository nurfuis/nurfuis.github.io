import { idleState } from "../states/player/state_idle.js";
import { movingState } from "../states/player/state_moving.js";
import { stuckState } from "../states/player/state_stuck.js";
import { tryMoveState } from "../states/player/state_tryMove.js";
import { vegetableState } from "../states/shared/state_vegetable.js";
import { idleStateAi } from "../states/ai/state_idle_ai.js";
import { tryMoveStateAi } from "../states/ai/state_tryMove_ai.js";
import { stuckStateAi } from "../states/ai/state_stuck_ai.js";
import { movingStateAi } from "../states/ai/state_moving_ai.js";
import { tryActionState } from "../states/player/state_tryAction.js";
import { actionState } from "../states/player/state_action.js";
import { staggerState } from "../states/player/state_stagger.js";
import { clearState } from "../states/player/state_clear.js";
import { changeFacingState } from "../states/player/state_changeFacing.js";


export const user = {
  abilities: {
    changeFacingState: changeFacingState,
    idleState: idleState,
    tryActionState: tryActionState,
    actionState: actionState,
    tryMoveState: tryMoveState,
    stuckState: stuckState,
    movingState: movingState,
    staggerState: staggerState,
    clearState: clearState,
  },
  initial: "idleState",
};

export const vegetable = {
  abilities: {
    vegetableState: vegetableState,
  },
  initial: "vegetableState",
};

export const blob = {
  abilities: {
    idleStateAi: idleStateAi,
    tryMoveStateAi: tryMoveStateAi,
    stuckStateAi: stuckStateAi,
    movingStateAi: movingStateAi,
  },
  initial: "idleStateAi",
};
