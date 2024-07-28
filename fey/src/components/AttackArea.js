import { Creature } from "../Creature.js";

export class AttackArea {
  constructor(entity, damage, radius, maxTargets) {
    this.entity = entity;
    this.damage = damage;
    this.radius = radius;
    this.maxTargets = maxTargets;
    this.damageDealt = 0;
    this.observers = [];
    this.scoreCounter = document.getElementById("score-counter");
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

  notify(damage) {
    this.observers.forEach((observer) => observer.update(damage));
  }

  attack(root) {
    const targets = this.findTargets(root);
    const damagePerTarget = this.calculateDamagePerTarget(targets.length);
    for (const target of targets) {
      if (target !== this.entity) {
        target.health.subtract(damagePerTarget);
        this.damageDealt += damagePerTarget;
        this.scoreCounter.textContent = this.damageDealt;
        this.notify(damagePerTarget);
      }
    }
    return { targets, damagePerTarget };
  }

  findTargets(root) {
    const targetId = "ground";
    const layer = root.layers.find((layer) => layer.id === targetId);    
    const children = layer.children;
    return children.filter((child) => {
      return child instanceof Creature && this.isInRange(child);
    });
  }

  isInRange(target) {
    const distance = this.getDistance(target);
    return distance <= this.radius;
  }

  getDistance(target) {
    const dx = target.center.x - this.entity.center.x;
    const dy = target.center.y - this.entity.center.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateDamagePerTarget(numTargets) {
    if (numTargets === 0) {
      return 0;
    }
    return Math.floor(this.damage / numTargets);
  }
}
