import { events } from "./Events.js";

class Resources {
  constructor() {
    this.toLoad = {
      air: "./public/sprites/air.png",        
      cellsSheet: "./public/sprites/cells-sheet.png",
    };

    this.images = {};

    Object.keys(this.toLoad).forEach((key) => {
      const img = new Image();
      img.src = this.toLoad[key];
      this.images[key] = {
        image: img,
        isLoaded: false,
      };
      img.onload = () => {
        this.images[key].isLoaded = true;
        this.images[key].width = img.width;
        this.images[key].height = img.height;
        
        // Check if all images are loaded, and if so, emit the event
        if (Object.values(this.images).every((image) => image.isLoaded)) {
          // Assuming you have an events object or function for emitting events:
          events.emit("RESOURCES_LOADED"); // Replace with your actual event mechanism
        }        
      };
      
    });
  }
}
export const resources = new Resources();
