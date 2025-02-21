const moveStates = {
    idle: {
        enter: (unit) => {
            unit.idleTimer = 0;
        },
        update: (unit, delta) => {
            unit.idleTimer += delta;
            if (unit.idleTimer >= unit.idleDelay) {
                unit.moveState = moveStates.lookAround;
            }
        },
        exit: (unit) => {
        },
    },
    lookAround: {
        enter: (unit) => {
            unit.lookTime = 0;
        },
        update: (unit, delta) => {
            unit.lookTime += delta;
            if (unit.lookTime >= unit.lookDuration) {
                unit.moveState = moveStates.idle;
            }
        },
        exit: (unit) => {

        }
    },
    jumping: {
        enter: (unit) => {
            unit.jumpArc.active = true;
        },
        update: (unit, delta) => {
            unit.updateJumpArc(delta);
        },
        exit: (unit) => {
            unit.jumpArc.active = false;
        }
    },
    moving: {
        enter: (unit) => {
            unit.isMoving = true;
        },
        update: (unit, delta) => {
            unit.moveTowards();
        },
        exit: (unit) => {
            unit.isMoving = false;
        }
    },
    falling: {
        enter: (unit) => {
            unit.isFalling = true;
        },
        update: (unit, delta) => {
            unit.tryMove('down');
        },
        exit: (unit) => {
            unit.isFalling = false;
        }
    },
    floating: {
        enter: (unit) => {
            unit.isFloating = true;
        },
        update: (unit, delta) => {
            unit.tryMove('down');
        },
        exit: (unit) => {
            unit.isFloating = false;
        }
    }
};

const checkFalling = (unit) => {
    return unit.isFalling;
};

const checkJumping = (unit) => {
    return unit.isJumping;
};

const checkMoving = (unit) => {
    return unit.isMoving;
};

const checkFloating = (unit) => {
    return unit.isFloating;
}

const checkIdle = (unit) => {
    return unit.isIdling;
};


const checks = {
    checkFalling,
    checkJumping,
    checkMoving,
    checkFloating,
    checkIdle,
};

class MoveState {
    constructor(unit) {
        this.unit = unit;
        this.states = moveStates;
        this.currentState = this.states.idle;
        this.currentState.enter(this.unit);
    }

    update(delta) {
        // Run current state update
        this.currentState.update(this.unit, delta);

        // Check transitions
        for (const [check, nextState] of Object.entries(this.currentState.transitions)) {
            if (checks[check](this.unit)) {
                this.transitionTo(this.states[nextState]);
                break;
            }
        }
    }

    transitionTo(newState) {
        this.currentState.exit(this.unit);
        this.currentState = newState;
        this.currentState.enter(this.unit);
    }
}

const { idle, jumping, moving, falling, floating } = moveStates;
