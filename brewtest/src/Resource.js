class Resources {
  constructor() {
    this.toLoad = {
      sky: "./public/sprites/sky.png",
      ground: "./public/sprites/ground.png",
      player: "./public/sprites/player-sheet.png",
      shadow: "./public/sprites/shadow.png",
      rod: "./public/sprites/rod.png",
      helmet: "./public/sprites/helmet.png",
      celadon: "./public/sprites/celadon.png",
      terrain: "./public/sprites/terrain-sheet.png",
      goblin: "./public/sprites/goblin.png",
      oat: "./public/sprites/oat.png",
      granny: "./public/sprites/granny-sheet.png",
      slime: "./public/sprites/slime-sheet.png",
      energyShield: "./public/sprites/energy-shield.png",
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
      };
    });
  }
}
export const resources = new Resources();
