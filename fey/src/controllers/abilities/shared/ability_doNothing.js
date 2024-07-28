let lastDoNothingCall = 0; // Timestamp of the last function call

export function doNothing(entity) {
  const now = Date.now();
  if (now - lastDoNothingCall >= 5000) {
    lastDoNothingCall = now;
    const entities = entity.findSpawnedEntities();
    console.warn(
      entity.name,
      "done got a bad brain and is a vegetable. They can't do shit",
    );
    // Magikarp used splash, it didn't do shit.
  }
}
