import { GameObject } from "../../GameObject.js";
import { events } from "../../Events.js";
import { Vector2 } from "../../Vector2.js";
import { iterateChunkTiles } from "../../helpers/iterateChunkTiles.js";


import { Tile } from "./Tile/Tile.js";
import { Water } from "./Water/Water.js";
import { Grass } from "./Grass/Grass.js";

export class Terrain extends GameObject {
  constructor() {
    super({});
  }
  async removeChunk(chunkId) {
    const childrenToRemove = this.children.filter((child) => child.chunkId === chunkId);

    for (const child of childrenToRemove) {
      await new Promise((resolve) => setTimeout(() => {
        child.destroy();
        resolve();
      }, 0));
    }
  }
  async makeChunk(chunkX, chunkY, world, chunkData, chunkId) {
    const chunkContainer = new GameObject(this.position.x, this.position.y);
    chunkContainer.chunkId = chunkId;

    const tileSets = chunkData.tilesets;

    await iterateChunkTiles(chunkX, chunkY, chunkData, async (entry, posX, posY, tileSets) => {
      await new Promise((resolve) => setTimeout(() => {
        const tile = new Tile(
          chunkData.layers[0].data[entry],
          tileSets,
          posX,
          posY,
          world,
          chunkId
        );
        chunkContainer.addChild(tile);
        resolve();
      }, 0));
    });

    this.addChild(chunkContainer);
    return chunkContainer;
  }      
}
