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
  add(vector) {
    if (vector instanceof Vector2) {
      this.x += vector.x;
      this.y += vector.y;
    } else {
      this.x += vector;
      this.y += vector;
    }
    return this;
  }
  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize() {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }
}
