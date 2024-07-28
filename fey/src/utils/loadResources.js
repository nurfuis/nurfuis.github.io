const debug = false;

import { events } from "../Events.js";

class ResourceLoader {
  static instance;

  constructor() {
    if (ResourceLoader.instance) {
      return ResourceLoader.instance;
    }
    this.images = {};

    this.imageList = {
      blob: "/assets/sprites/blob2.png",
      energy: "/assets/sprites/energy.png",
      keg: "/assets/sprites/woodenKeg.png",
      grainBag: "/assets/sprites/grainBag.png",
      air: "/assets/sprites/air.png",
      tileSet: "/assets/sprites/base.png",
      player: "/assets/sprites/player.png",
      shadow: "/assets/sprites/shadow.png",
    };

    Object.keys(this.imageList).forEach((key) => {
      const img = new Image();
      img.src = this.imageList[key];

      if (debug) {
        console.log("Loading image:", this.imageList[key]);
      }

      this.images[key] = {
        image: img,
        isLoaded: false,
        width: null,
        height: null,
      };

      img.onload = () => {
        this.images[key].isLoaded = true;
        if (Object.values(this.images).every((image) => image.isLoaded)) {
          events.emit("RESOURCES_LOADED");
        }
      };
    });
    ResourceLoader.instance = this;

    return { images: this.images, sounds: null };
  }
  static getInstance() {
    if (!ResourceLoader.instance) {
      ResourceLoader.instance = new ResourceLoader();
    }
    return ResourceLoader.instance;
  }
}
export const resources = ResourceLoader.getInstance();
