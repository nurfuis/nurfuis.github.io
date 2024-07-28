import { Sprite } from "./Sprite.js";
import { Vector2 } from "./Vector2.js";
import { GameObject } from "./GameObject.js";
import { GrainBag } from "./items/GrainBag.js";
import { Keg } from "./items/Keg.js";
import { entities } from "../main.js";

export class Tile extends GameObject {
  constructor(id, tilesets, tileWidth, tileHeight, coords) {
    super({});
    this.color = "rgb(211,211,211, 0.1)";
    this.strokeColor = "rgb(099,099,099, 1)";
    this.id = id;
    this.tilesets = tilesets;

    this.width = tileWidth;
    this.height = tileHeight;

    this.position.x = coords.x;
    this.position.y = coords.y;

    this.source = this.findMatchingTileset();

    this.showGrid = false;

    if (!!this.source) {
      const hFrames = this.source.image.width / this.width;
      const vFrames = this.source.image.height / this.height;

      const sprite = new Sprite({
        resource: this.source,
        frameSize: new Vector2(this.width, this.height),
        hFrames: hFrames,
        vFrames: vFrames,
        frame: this.id - 1,
      });

      this.addChild(sprite);
    }
  }
  findMatchingTileset() {
    for (let i = 0; i < this.tilesets.length; i++) {
      const data = this.tilesets[i];

      if (this.id >= data["firstgid"]) {
        return data["source"];
        break;
      }
    }
    return null;
  }
  //   function findMatchingTileset(tileSets, gid) {
  //     for (let i = 0; i < tileSets.length; i++) {
  //         const data = tileSets[i];

  //         if (gid >= data["firstgid"] && (i + 1 === tileSets.length || gid < tileSets[i + 1]["firstgid"])) {
  //             return data["source"];
  //         }
  //     }
  //     return null;
  // }
  drawImage(ctx) {
    const posX = this.position.x + this.parent.x * this.width;
    const posY = this.position.y + this.parent.y * this.height;

    const parent1 = this.parent;
    const parent2 = parent1.parent;
    const layerName = parent2.name;

    if (this.showGrid && layerName == "background") {
      ctx.beginPath();
      ctx.rect(posX, posY, this.width, this.height);
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
      ctx.fillStyle = "black";
    }
  }

  ready() {
    // spawn an entity upon creation
    const offsetX = this.parent.position.x;
    const offsetY = this.parent.position.y;
    const globalPosition = new Vector2(
      this.position.x + offsetX,
      this.position.y + offsetY
    );

    if (this.id == 1 && Math.random() < 0.02) {
      const grainBag = new GrainBag();
      grainBag.position = globalPosition;
      entities.addChild(grainBag);
    } else if (this.id == 1 && Math.random() < 0.02) {
      const keg = new Keg();
      keg.position = globalPosition;

      entities.addChild(keg);
    }
  }
}
