import { GameObject } from "./GameObject.js";
import { Chunk } from "./Chunk.js";

export class Layer extends GameObject {
  constructor(layer, tileWidth, tileHeight, tileSets) {
    super({});
    this.tileSets = tileSets;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.showGrid = false;

    this.name = layer["name"];
    this.id = layer["id"];
    this.type = layer["type"];

    this.position.x = layer["x"];
    this.position.y = layer["y"];
    this.startX = layer["startx"];
    this.startY = layer["starty"];

    this.width = layer["width"];
    this.height = layer["height"];

    this.visible = layer["visible"];
    this.opacity = layer["opacity"];

    if (layer["type"] == "tilelayer") {
      const newChunks = addChunks(layer, tileWidth, tileHeight, tileSets);
      for (const chunk of newChunks) {
        this.addChild(chunk);
      }
    } else if (layer["type"] == "objectgroup") {
    }
  }
  drawImage(ctx) {
    const posX = this.startX * this.tileWidth;
    const posY = this.startY * this.tileHeight;

    if (this.showGrid && this.name == "background") {
      ctx.beginPath();

      ctx.rect(
        posX,
        posY,
        this.width * this.tileWidth,
        this.height * this.tileHeight
      );

      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;

      ctx.stroke();
      ctx.closePath();

      ctx.lineWidth = 1;
    }
  }
}

function addChunks(layer, tileWidth, tileHeight, tileSets) {
  let chunks = [];
  for (const chunk of layer["chunks"]) {
    chunks.push(new Chunk(chunk, tileWidth, tileHeight, tileSets));
  }
  return chunks;
}
