export class Procreate {
  constructor(entity) {
    this.entity = entity;
    this.resourceSubject = entity.ability;
    this.resourceSubject.subscribe(this);
    this.reproductiveCost = 20;
  }

  update(count) {
    if (count >= this.reproductiveCost) {
      this.entity.reproduce();
      this.entity.ability.totalGathered -= this.reproductiveCost;
    }
  }
}
