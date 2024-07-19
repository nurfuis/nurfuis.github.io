import { GameObject } from "./GameObject.js";
import { Layer } from "./Layer.js";

export class World extends GameObject {
  constructor() {
    super({});

    this.tilesets = [];

    // this.limit = 1000;
    // this.counter = 0;
  }

  step(delta, root) {
    // if (root.input.heldDirections.length > 0) {
    //   console.log(root.input.heldDirections);
    // }
    // const quarter = this.limit / 4;
    // const half = this.limit / 2;
    // const threeQuarter = quarter + half;
    // if (this.counter <= quarter) {
    //   this.counter++;
    //   this.position.x++;
    // } else if (this.counter > quarter && this.counter <= half) {
    //   this.counter++;
    //   this.position.y++;
    // } else if (this.counter > half && this.counter <= threeQuarter) {
    //   this.counter++;
    //   this.position.x--;
    // } else if (this.counter > threeQuarter && this.counter <= this.limit) {
    //   this.counter++;
    //   this.position.y--;
    // } else if (this.counter > this.limit) {
    //   this.counter = 0;
    // } else {
    //   console.log("ERROR");
    // }
  }

  build(mapData) {
    for (const tileSet of mapData["tilesets"]) {
      const img = new Image();
      img.src = tileSet["image"];

      const a = { image: img, width: null, height: null, isLoaded: true };
      a.width = tileSet["imagewidth"];
      a.height = tileSet["imageheight"];

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
  }
}
