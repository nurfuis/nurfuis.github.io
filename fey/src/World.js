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
    const loadedTilesets = [];

    function processTileSet(tileSet, callback) {
      const img = new Image();
      img.onload = function () {
        // Callback function after image loads
        const a = {
          image: img,
          width: tileSet["imagewidth"],
          height: tileSet["imageheight"],
        };
        loadedTilesets.push({ firstgid: tileSet["firstgid"], source: a });
        callback(); // Call the callback function after processing
      };
      img.src = tileSet["image"];
    }

    // Loop through tilesets with callbacks
    mapData["tilesets"].forEach((tileSet) => {
      processTileSet(tileSet, () => {
        // All tilesets are loaded, proceed with further processing
        if (loadedTilesets.length === mapData["tilesets"].length) {
          this.tileWidth = mapData["tilewidth"];
          this.tileHeight = mapData["tileheight"];

          for (const layer of mapData["layers"]) {
            const newLayer = new Layer(
              layer,
              this.tileWidth,
              this.tileHeight,
              loadedTilesets
            );
            this.addChild(newLayer);
          }
        }
      });
    });
  }
}
