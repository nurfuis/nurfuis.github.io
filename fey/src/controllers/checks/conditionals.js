// user
export const isBusy = (entity) => entity.isBusy > 0;
export const isIdle = (entity) => entity.isBusy <= 0;

export const isClicking = (entity) => entity.isClicking;
export const isNotClicking = (entity) => !entity.isClicking;

export const hasDirection = (entity) => !!entity.direction;
export const noDirection = (entity) => !entity.direction;

export const newDestination = (entity) => {
  const distance = entity.position.distanceTo(entity.destinationPosition);
  return distance >= 0;
};

export const hasArrived = (entity) => {
  const distance = entity.position.distanceTo(entity.destinationPosition);
  return distance < 1;
};

export const hasCollision = (entity) => entity.hasCollision;
export const noCollision = (entity) => !entity.hasCollision;

export const isStaggered = (entity) => entity.stagger > 0;
export const notStaggered = (entity) => entity.stagger <= 0;

export const isNotFacingDirection = (entity) =>
  entity.lastDirection != entity.facingDirection;
export const isFacingDirection = (entity) =>
  entity.lastDirection == entity.facingDirection;

export const hasTurnDelay = (entity) => entity.turnDelay > 0;
export const noTurnDelay = (entity) => entity.turnDelay <= 0;

// blob
export const shouldMoveRandomly = (entity, moveProbability = 0.11) => {
  return Math.random() < moveProbability;
};

export const exceedsTryMoveAttempts = (entity) => {
  return entity.tryMoveAttempts > 20;
};

export const exceedsStuckTurns = (entity) => {
  return entity.tryMoveAttempts > 100;
};

export const hasNewDirection = (entity) => {
  return entity.direction != entity.moveHistory[1];
};

export const hasSameDirection = (entity) => {
  return entity.direction === entity.moveHistory[1];
};

// vegetable
export const isVegetable = (entity) => {
  const brain = entity.brain;
  return brain === "vegetable";
};

export const isNotVegetable = (entity) => {
  const brain = entity.brain;
  return brain != "vegetable";
};
