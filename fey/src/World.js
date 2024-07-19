import { GameObject } from "./GameObject.js";
import { Layer } from "./Layer.js";

export class World extends GameObject {
  constructor() {
    super({});

    this.tilesets = [];
  }

  async build(mapData) {
    for (const tileSet of mapData["tilesets"]) {
      const a = await loadTilesets(tileSet);

      this.tilesets.push({
        firstgid: tileSet["firstgid"],
        source: a,
      });
    }

    this.tileWidth = mapData["tilewidth"];
    this.tileHeight = mapData["tileheight"];

    for (const layer of mapData["layers"]) {
      const newLayer = new Layer(
        layer,
        this.tileWidth,
        this.tileHeight,
        this.tilesets
      );
      this.addChild(newLayer);
    }

    async function loadTilesets(tileSet) {
      const img = new Image();
      img.src = tileSet["image"];

      const a = { image: img, width: null, height: null, isLoaded: true };
      a.width = tileSet["imagewidth"];
      a.height = tileSet["imageheight"];
      return a;
    }
    return true;
  }
}
