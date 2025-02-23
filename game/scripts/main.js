const DEBUG = {
    BYPASS_SAVE: false,  // Set to true to bypass save loading
    DEFAULT_POSITION: { x: 128, y: 128 }, // Default spawn position
    WORLD_TYPE: 'superFlat' // Default world type
};
window.DEBUG = DEBUG;

Resources.initialize();


window.addEventListener('resize', () => {

  const canvas = document.getElementById('gameCanvas');
  resizeCanvas(canvas);

});

document.addEventListener('DOMContentLoaded', () => {


  const canvas = document.getElementById('gameCanvas');
  resizeCanvas(canvas);

  const ctx = canvas.getContext('2d');


  const main = new GameObject();
  main.canvas = canvas;


  const newWorld = new GameMap(canvas, world);
  main.world = newWorld;
  main.addChild(newWorld);


  const camera = new Camera(canvas, newWorld);
  main.camera = camera;
  main.addChild(camera)


  const player = new Unit(
    newWorld.tileSize * constants.PLAYER_SPAWN.x,
    newWorld.tileSize * constants.PLAYER_SPAWN.y,
    newWorld.tileSize,
    'player-color',
    constants.PLAYER_SPEED,
    constants.PLAYER_NAME,
    newWorld
  );
  main.player = player;
  player.teamName = constants.PLAYER_TEAM;


  const playerTeam = new Team('player-color', teamName = 'Player Team');
  main.playerTeam = playerTeam;
  main.playerTeam.playerOne = player;
  main.playerTeam.addChild(player);
  main.addChild(main.playerTeam);


  const dragon = new Flying(player);
  main.addChild(dragon);
  dragon.x = 200;
  dragon.y = 200;

  const input = new Input(canvas, camera, main, newWorld);
  main.input = input;

  const automatedInput = new AutomatedInput([
    { direction: "left", weight: 0.5 },
    { direction: "right", weight: 13 },
    { direction: "up", weight: 3 },
    { direction: "down", weight: 3 },
    { direction: "up-left", weight: 0.5 },
    { direction: "up-right", weight: 0.5 },
    { direction: "down-left", weight: 0.5 },
    { direction: "down-right", weight: 1 },
    { direction: "up-two", weight: 0.3 },
    { direction: "up-left-two", weight: 0.2 },
    { direction: "up-right-two", weight: 0.2 },
    { direction: "up-three-left-one", weight: 0.1 },
    { direction: "up-three-right-one", weight: 0.1 }
  ], 150);
  main.automatedInput = automatedInput;


  const particleSystem = new ParticleSystem(canvas, camera, newWorld);
  main.particleSystem = particleSystem;
  main.addChild(particleSystem);


  const muslin = new Muslin(canvas, camera, newWorld);
  main.muslin = muslin;


  const farBackground = new BackgroundLayer(canvas, camera);
  main.farBackground = farBackground;


  const sceneLighting = new LightLayer(canvas, player, newWorld);
  main.sceneLighting = sceneLighting;

  const darkness = new DarknessLayer(canvas, player, newWorld);
  main.darkness = darkness;


  const curtain = new Curtain(canvas, camera, newWorld);
  main.curtain = curtain;


  const onScreenWriting = new OnScreenWriting(canvas, camera, newWorld);
  main.onScreenWriting = onScreenWriting;


  const worldEdit = new WorldEditMenu(canvas, main);
  main.worldEditMenu = worldEdit;

  const spriteSheetViewer = new SpriteSheetViewer(canvas, main);
  main.spriteSheetViewer = spriteSheetViewer;


  const stageManager = new StageManager(canvas, {
    muslin: muslin,
    curtain: curtain,
    darkness: darkness,
    background: farBackground
  });
  main.devMenu = stageManager;


  const game = new Game(canvas, main);
  main.game = game;


  const update = (delta) => {

    main.stepEntry(delta, main);

    muslin.update(delta);
    farBackground.update(delta);
    sceneLighting.update(delta);
    curtain.update(delta);

    onScreenWriting.update(delta);

  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    muslin.draw(ctx);
    farBackground.draw(ctx);

    ctx.save();

    main.camera.follow(ctx, 0, 0);
    main.draw(ctx, 0, 0);

    sceneLighting.draw(ctx);

    worldEdit.drawGrid(ctx);
    worldEdit.drawHoverTile(ctx);
    worldEdit.drawTileStats(ctx);

    ctx.restore();

    darkness.draw(ctx);
    curtain.draw(ctx);

    onScreenWriting.draw(ctx);

  };


  const gameLoop = new GameLoop(update, draw);
  main.gameLoop = gameLoop;
  gameLoop.start();

});


class TileSheetConfig {
  static sheets = {};

  static async initialize() {
    this.sheets = await TileSheetLoader.loadTileSheets();
    events.emit('TILE_SHEETS_INITIALIZED', this.sheets);
  }

  static getVariantCoords(type, variant) {
    const sheet = this.sheets[type];
    return sheet?.variants[variant] || null;
  }
}


class TileSheetLoader {
  static async loadTileSheets() {
    const tileSheets = {};

    try {
      // Define the base tile types and their files

      for (const [type, filename] of Object.entries(tileTypes)) {
        const sheet = await this.analyzeTileSheet(`assets/tiles/${filename}`);
        tileSheets[type] = {
          src: `assets/tiles/${filename}`,
          variants: sheet.variants
        };
      }
      events.emit('TILE_SHEETS_LOADED', tileSheets);
      return tileSheets;
    } catch (error) {
      console.error('Error loading tile sheets:', error);
      return null;
    }
  }

  static analyzeTileSheet(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const variants = [];
        const baseSize = 32; // Base tile size

        // Calculate number of tiles in the sheet
        const tilesX = Math.floor(img.width / baseSize);
        const tilesY = Math.floor(img.height / baseSize);

        // Generate variant data
        for (let y = 0; y < tilesY; y++) {
          for (let x = 0; x < tilesX; x++) {
            variants.push({
              x: x * baseSize,
              y: y * baseSize,
              w: baseSize,
              h: baseSize
            });
          }
        }

        resolve({
          width: img.width,
          height: img.height,
          variants
        });
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }
}


