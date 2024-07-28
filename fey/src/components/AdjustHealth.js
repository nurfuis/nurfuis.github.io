export class AdjustHealth {
  constructor(entity) {
    this.entity = entity;
    this.maxHealth = 1000; // Set a default maximum health
    this.minHealth = 0; // Set a default minimum health
    this.entity.currentHealth = this.maxHealth; // Initialize health to maximum
    this.observers = [];
  }
  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(health) {
    this.observers.forEach((observer) => observer.update(health));
  }

  add(amount) {
    this.entity.currentHealth = Math.min(
      this.entity.currentHealth + amount,
      this.maxHealth
    );
  }

  subtract(amount) {
    this.entity.currentHealth = Math.max(
      this.entity.currentHealth - amount,
      this.minHealth
    );
    this.notify(amount)
  }

  deplete() {
    this.entity.currentHealth = this.minHealth;
  }

  restore() {
    this.entity.currentHealth = this.maxHealth;
  }
}
