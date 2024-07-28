export class Grow {
    constructor(entity) {
      this.entity = entity;
      this.damageSubject = entity.ability;
      this.damageSubject.subscribe(this);
    }
  
    update(damage) {
      const scaleFactor = damage / 10000; 
      this.entity.radius += scaleFactor; 
      this.entity.mass += scaleFactor * 10;
    }
  }
  