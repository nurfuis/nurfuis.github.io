export class Eyesight {
  constructor() {}
  scan(root, position, radius) {
    const targetId = "world";
    const world = root.layers.find((layer) => layer.id === targetId);
    const distanceX = radius;
    const distanceY = radius;

    let mostOverlappingTile = null;
    let highestOverlap = 0;

    for (const tile of world.children) {
      const playerRight = position.x + distanceX;
      const playerLeft = position.x - distanceX;
      const playerBottom = position.y + distanceY;
      const playerTop = position.y - distanceY;
      const tileRight = tile.position.x + tile.width;
      const tileLeft = tile.position.x;
      const tileBottom = tile.position.y + tile.height;
      const tileTop = tile.position.y;

      if (
        playerRight >= tileLeft && // Player right edge pasts tile left edge
        playerLeft <= tileRight && // Player left edge before tile right edge
        playerBottom >= tileTop && // Player bottom edge pasts tile top edge
        playerTop <= tileBottom // Player top edge before tile bottom edge
      ) {
        // Overlap detected within view distance
        const overlapX =
          Math.min(playerRight, tileRight) - Math.max(playerLeft, tileLeft);
        const overlapY =
          Math.min(playerBottom, tileBottom) - Math.max(playerTop, tileTop);
        const overlapArea = overlapX * overlapY;

        if (overlapArea > highestOverlap) {
          highestOverlap = overlapArea;
          mostOverlappingTile = tile;
        }

        // if (tile.fog) {
        //   tile.fog = false; // Reveal fogged tiles within view distance
        // }

        // You can also perform other actions based on the detected tile here
      }
    }
    if (mostOverlappingTile) {
      mostOverlappingTile.selected = true;
      return mostOverlappingTile;
    }
  }
}
