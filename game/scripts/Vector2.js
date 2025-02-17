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
  duplicate() {
    return new Vector2(this.x, this.y);
  }
}
