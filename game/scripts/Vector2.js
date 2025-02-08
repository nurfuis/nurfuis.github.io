class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  distanceTo(position) {
    const dx = this.x - position.x;
    const dy = this.y - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance;
  }
  validate() {
    if (
      this.x === null ||
      this.y === null ||
      this.x === undefined ||
      this.y === undefined ||
      isNaN(this.x) ||
      isNaN(this.y)
    ) {
      throw new Error(
        "Invalid position: " +
          this.x +
          " and " +
          this.y +
          " must be finite numbers."
      );
    }
    return this; // Return the validated Vector2 instance
  }

  duplicate() {
    return new Vector2(this.x, this.y);
  }
}
