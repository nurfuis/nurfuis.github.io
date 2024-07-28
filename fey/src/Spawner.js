import { entities } from "../main.js";
import { Entity } from "./Entity.js";
import { events } from "./Events.js";
import { entityFactory } from "./factory/entityFactory.js";
export class Spawner {
  constructor() {
    this.spawnedEntities = [];
    this.spawnQueue = [];
    this._spawnPoint = {};

    events.on("SPAWN", this, (data) => {
      const newEntity = new Entity();
      const entity = entityFactory(data, newEntity);
      this.spawnQueue.push(entity);
    });
  }
  static getInstance() {
    if (!Spawner.instance) {
      Spawner.instance = new Spawner();
    }
    return Spawner.instance;
  }

  removeChild(entity) {
    let removedCount = 0;
    // TODO and from queueu
    for (let i = this.spawnedEntities.length - 1; i >= 0; i--) {
      if (this.spawnedEntities[i] === entity) {
        this.spawnedEntities.splice(i, 1);
        removedCount++;
      }
    }
  }

  update(delta, root) {
    if (this.spawnQueue.length > 0) {
      const entity = this.spawnQueue.shift(); // Remove the first entity from the queue
      this.spawnedEntities.push(entity);
      entity.spawn();
    }
  }
}
