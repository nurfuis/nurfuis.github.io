import { LEFT, RIGHT, UP, DOWN } from "../../../Input.js";
import { Vector2 } from "../../../Vector2.js";
const debug = false;
export function tryMoveAi(entity, delta, root) {
  entity.tryMoveAttempts += 1;

  const randomIndex = Math.floor(Math.random() * 4);
  let direction = [LEFT, RIGHT, UP, DOWN][randomIndex];

  let nextX = entity.position.x;
  let nextY = entity.position.y;

  if (direction == DOWN) {
    nextY += entity.speed * 32;
    entity.body.animations.play("moveDown");
  }

  if (direction == UP) {
    nextY -= entity.speed * 32;
    entity.body.animations.play("moveUp");
  }

  if (direction == LEFT) {
    nextX -= entity.speed * 32;
    entity.body.animations.play("moveLeft");
  }

  if (direction == RIGHT) {
    nextX += entity.speed * 32;
    entity.body.animations.play("moveRight");
  }
  const layer = entity.parent;
  const world = layer.parent;

  const newDestinationPosition = new Vector2(nextX, nextY);

  const result = getTile(newDestinationPosition, world);
  if (
    !!result.currentTile &&
    result.currentTile.id > 0 &&
    result.currentTile.id < 3
  ) {
    entity.direction = direction;
    entity.destinationPosition = newDestinationPosition;
    // console.log("can move");
  } else {
    entity.destinationPosition = entity.position;
    // console.log("cannot move");
  }

  entity.facingDirection = entity.direction ?? entity.facingDirection;
}
function getTile(position, world) {
  const background = world.children[0]; // layer id 0
  let currentChunk;
  let currentTile;
  if (background.children.length > 0) {
    background.children.forEach((chunk) => {
      if (
        position.x >= chunk.position.x &&
        position.x < chunk.position.x + chunk.width &&
        position.y >= chunk.position.y &&
        position.y < chunk.position.y + chunk.height
      )
        currentChunk = chunk;
    });
  }

  if (!!currentChunk) {
    currentChunk.children.forEach((tile) => {
      if (
        position.x >= tile.position.x + currentChunk.position.x &&
        position.x < tile.position.x + tile.width + currentChunk.position.x &&
        position.y >= tile.position.y + currentChunk.position.y &&
        position.y < tile.position.y + tile.height + currentChunk.position.y
      )
        currentTile = tile;
    });
  } else {
    currentTile = undefined;
  }
  return { currentChunk, currentTile };
}
