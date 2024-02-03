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
      katana: "./public/sprites/katana.png",
      shroud: "./public/sprites/shroud.png",
      spark: "./public/sprites/spark-sheet.png",
      feyBrewsterTileSet: "./public/sprites/FeyBrewsterTileSet.png",
      woodenFermentationVesselTileset: "./public/sprites/woodenfvTileset.png",
      woodenKettleTileset: "./public/sprites/woodenkettleTileset.png",
      woodenMashTunTileset: "./public/sprites/woodenmashtunTileset.png",
      broom: "./public/sprites/broom-sheet.png",
      twoTop: "./public/sprites/bartableTileset.png",
      barstool: "./public/sprites/barstoolTileset.png",
    };

    this.images = {};

    Object.keys(this.toLoad).forEach((key) => {
      const img = new Image();
      img.src = this.toLoad[key];
      this.images[key] = {
        image: img,
        isLoaded: false,
        width: null,
        height: null
      };
      img.onload = () => {
        this.images[key].isLoaded = true;
        this.images[key].width = img.width;
        this.images[key].height = img.height;
        
        if (Object.values(this.images).every((image) => image.isLoaded)) {
          events.emit("RESOURCES_LOADED"); 
        }        
      };
      
    });
  }
}
export const resources = new Resources();
