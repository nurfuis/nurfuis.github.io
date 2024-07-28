// state machine updates the states based on entity.type
// each state has an update method and transitions triggered by
// a check returning true. Transitions to a new state with
// a different update, transitions, and check.

// we should make a bool property handler in the entities to add a state machine on creation
// an npc would have states that trigger and handle interactions or open windows
// a kettle would accept inputs until full and then run the boil and do something when finished
// a monster would have access to movement patterns and attacks, weapons, spells, and drop loot

// finish making out new files for statesAi and ActionsAI
// the ai update actions can check for abilities that are set on the entity
// and access those functions. maybe something like entity.knownSpells = []
// could have an inventory flag on the entity and use an item

// player will be able to go into pull or push from stuck
// alsy into a carrying state when picked up a item
// consider ome type of sprint fro mthe move state
// a ranged and melee attack
import * as brains from "./brains/abilityMaps.js";
import * as checks from "./checks/conditionals.js";

export class StateMachine {
  constructor(parent) {
    this.entity = parent;
    this.currentState = undefined;
    this.states = {};

    const abilityMap = brains[this.entity.brain] || brains.vegetable;
    const abilities = abilityMap.abilities;

    for (const abilityName in abilities) {
      this.states[abilityName] = abilities[abilityName];
    }
    this.currentState = abilityMap.initial;
  }

  update(delta, root) {
    // if this.entity.sensors
    // console.log(this.currentState);
    const currentState = this.states[this.currentState];
    currentState.update(this.entity, delta, root);
    for (const event in currentState.transitions) {
      if (this.checkTransition(event)) {
        this.currentState = currentState.transitions[event];
        break;
      }
    }
  }

  checkTransition(e) {
    const checkFunction = checks[e];
    if (!checkFunction) {
      console.warn(this.entity, e, "no check function exists.");
      return false;
    }
    return checkFunction(this.entity);
  }
}
