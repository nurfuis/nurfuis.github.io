export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
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
        "Invalid position: " + this.x + " and " + this.y + " must be finite numbers."
      );
    }
    return this; // Return the validated Vector2 instance
  }

  duplicate() {
    return new Vector2(this.x, this.y);
  }
}
