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
      eyebrows: "../../assets/sprites/eyebrows.png",
      eyes: "../../assets/sprites/eyes.png",
      face: "../../assets/sprites/face.png",
      hair: "../../assets/sprites/hair.png",
      head: "../../assets/sprites/head.png",
      mouth: "../../assets/sprites/mouth.png",
      mustache: "../../assets/sprites/mustache.png",
      openMouth: "../../assets/sprites/open-mouth.png",
      redEyes: "../../assets/sprites/red-eyes.png",
      wideEyes: "../../assets/sprites/wide-eyes.png",
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
