export class GatherResource {
  constructor(entity, radius, maxTargets) {
    this.entity = entity;
    this.radius = radius;
    this.maxTargets = maxTargets;
    this.totalGathered = 0;
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

  notify(gatheredCount) {
    this.observers.forEach((observer) => observer.update(gatheredCount));
  }

  collect(resources) {
    const targets = resources.children;
    let gatheredCount = 0;

    for (const target of targets) {
      // Check if target is an Acorn and within range
      if (target.constructor.name === "Acorn" && this.isInRange(target)) {
        this.totalGathered++;
        target.destroy();
        gatheredCount++;
        if (gatheredCount >= this.maxTargets) {
          break; // Stop gathering after reaching max limit
        }
      }
    }

    // Notify observers only if resources were gathered
    if (gatheredCount > 0) {
      this.notify(this.totalGathered);
    }
  }

  findTargets() {
    const children = this.entity.parent.children;
    return children.filter((child) => {
      return child instanceof Creature && this.isInRange(child);
    });
  }

  isInRange(target) {
    const distance = this.getDistance(target);
    return distance <= this.radius;
  }

  getDistance(target) {
    const dx = target.position.x - this.entity.position.x;
    const dy = target.position.y - this.entity.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
