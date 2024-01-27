export const movingObjects = [];


function getSplitAxis(objects) {
  const xMax = Math.max(...objects.map(c => c.center.x));
  const xMin = Math.min(...objects.map(c => c.center.x));
  const yMax = Math.max(...objects.map(c => c.center.y));
  const yMin = Math.min(...objects.map(c => c.center.y));

  return (xMax - xMin) > (yMax - yMin) ? 'x' : 'y'; // Choose axis with wider spread
}

function buildBVH(objects) {
  if (objects.length <= 1) {
    return objects[0]; // Leaf node with single object
  }

  const axis = getSplitAxis(objects, 'center');
  objects.sort((a, b) => a.center[axis] - b.center[axis]);

  const midIndex = Math.floor(objects.length / 2);
  const leftChild = buildBVH(objects.slice(0, midIndex));
  const rightChild = buildBVH(objects.slice(midIndex));

  return {
    left: leftChild,
    right: rightChild,
  };
}

function detectCollision(bvhRoot, object) {
  if (!bvhRoot) {
    return false; // No collision possible with empty BVH
  }

  if (object.center && object.radius) { // Check for necessary properties
    return bvhRoot.overlaps(object);
  }
  return detectCollision(bvhRoot.left, object) || detectCollision(bvhRoot.right, object);
}



export function checkCollisions(object) {
  const bvh = buildBVH(movingObjects);  
  
  for (const otherObject of movingObjects) {
    if (object !== otherObject) {
      if (object.overlaps || detectCollision(bvh, otherObject)) { // Use entity's overlaps method if available
        // Collision detected! Handle it here
      }
    }
  }
}

