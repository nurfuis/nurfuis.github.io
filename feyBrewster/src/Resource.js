import { events } from "./Events.js";

class Resources {
  constructor() {
    this.toLoad = {
      air: "./public/sprites/air.png",      
      player: "./public/sprites/player-sheet.png",
      shadow: "./public/sprites/shadow.png",
      rod: "./public/sprites/rod.png",
      terrain: "./public/sprites/terrain-sheet.png",
      goblin: "./public/sprites/goblin.png",
      oat: "./public/sprites/oat.png",
      granny: "./public/sprites/granny-sheet.png",
      slime: "./public/sprites/slime-sheet.png",
      energyShield: "./public/sprites/energy-shield.png",
      brewhouseBackground1: "./public/sprites/brewhouse-background1.png",
      brewhouseBackground2: "./public/sprites/brewhouse-background2.png",
      katana: "./public/sprites/katana.png",
      shroud: "./public/sprites/shroud.png",
      spark: "./public/sprites/spark-sheet.png",
      FullTileSet1: "./public/sprites/FullTileSet1.png",
    
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
