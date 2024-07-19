import { GameObject } from "./GameObject.js";
import { Tile } from "./Tile.js";

export class Chunk extends GameObject {
  constructor(chunk, tileWidth, tileHeight, tilesets) {
    super({});
    this.showGrid = false;
    this.data = chunk["data"];

    this.width = chunk["width"] * tileWidth;
    this.height = chunk["height"] * tileHeight;

    this.x = chunk["x"];
    this.y = chunk["y"];

    this.position.x = chunk["x"] * tileWidth;
    this.position.y = chunk["y"] * tileHeight;

    addTiles(this, tileWidth, tileHeight, tilesets);
  }

  drawImage(ctx) {
    const posX = this.position.x;
    const posY = this.position.y;

    ctx.beginPath();

    ctx.rect(this.position.x, this.position.y, this.width, this.height);
    const parent = this.parent;
    const layerName = parent.name;

    if (this.showGrid && layerName == "background") {
      ctx.fillText(`CHUNK: ${posX}, ${posY}  `, posX, posY - 8);

      ctx.strokeStyle = "lightblue";
      ctx.lineWidth = 2;

      ctx.stroke();
    }

    ctx.closePath();

    ctx.lineWidth = 1;
  }
}

function addTiles(chunk, tileWidth, tileHeight, tilesets) {
  for (let i = 0; i < chunk.data.length; i++) {
    const row = Math.floor(i / (chunk["height"] / tileHeight));
    const col = i % (chunk["width"] / tileWidth);
    const coords = {
      x: col * tileWidth,
      y: row * tileHeight,
    };

    // only add tile if data > 0 ??

    const newTile = new Tile(chunk, i, tilesets, tileWidth, tileHeight, coords);

    chunk.addChild(newTile);
  }
}
