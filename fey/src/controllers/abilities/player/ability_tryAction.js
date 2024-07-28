import { SWING_TIMER } from "../../../constants.js";
import { sweepAttack } from "../../../actions/sweepAttack.js";
import { interact } from "../../../actions/interact.js";

const validActions = {
  interact: interact,
  sweepAttack: sweepAttack,
};
export function tryAction(entity, delta, root) {
  let action = entity.actions[entity.selectAction];

  if (validActions[action]) {
    action = validActions[action];
    action(entity, delta, root);
  }

  entity.isBusy = SWING_TIMER;
}
