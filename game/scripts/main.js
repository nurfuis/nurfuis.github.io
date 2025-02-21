window.addEventListener('resize', () => {

  const canvas = document.getElementById('gameCanvas');

  resizeCanvas(canvas);
});

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('gameCanvas');

  resizeCanvas(canvas);

  const ctx = canvas.getContext('2d');

  const game = new GameObject();

  game.canvas = canvas;

  const newWorld = new GameMap(canvas, world);

  game.world = newWorld;

  game.addChild(newWorld);

  const camera = new Camera(canvas, newWorld);

  game.camera = camera;

  game.addChild(camera)

  const player = new Unit(
    newWorld.tileSize * constants.PLAYER_SPAWN.x,
    newWorld.tileSize * constants.PLAYER_SPAWN.y, 
    newWorld.tileSize,
    'player-color',
    constants.PLAYER_SPEED,
    constants.PLAYER_NAME,
    newWorld
  );

  player.teamName = constants.PLAYER_TEAM;

  const d = new UnitDebugger(canvas, player);

  player.addChild(d);

  const playerTeam = new Team('player-color', teamName = 'Player Team');

  game.playerTeam = playerTeam;

  game.playerTeam.playerOne = player;

  game.playerTeam.addChild(player);

  game.addChild(game.playerTeam);


  const dragon = new Flying(player);
  game.addChild(dragon);
  dragon.x = 200;
  dragon.y = 200;

  const input = new Input(canvas, camera, game, newWorld);

  game.input = input;

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

  game.automatedInput = automatedInput;

  const particleSystem = new ParticleSystem(canvas, camera, newWorld);

  game.particleSystem = particleSystem;

  game.addChild(particleSystem);

  const muslin = new Muslin(canvas, camera, newWorld);

  game.muslin = muslin;

  const farBackground = new BackgroundLayer(canvas, camera);

  game.farBackground = farBackground;

  const lightLayer = new LightLayer(canvas, player, newWorld);

  game.lightLayer = lightLayer;

  const darknessLayer = new DarknessLayer(canvas, player, newWorld);

  game.darknessLayer = darknessLayer;

  const curtain = new Curtain(canvas, camera, newWorld);

  game.curtain = curtain;

  const onScreenWriting = new OnScreenWriting(canvas, camera, newWorld);

  game.onScreenWriting = onScreenWriting;

  const update = (delta) => {

    game.stepEntry(delta, game);

    muslin.update(delta);

    farBackground.update(delta);

    lightLayer.update(delta);
    
    curtain.update(delta);

    onScreenWriting.update(delta);
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    muslin.draw(ctx);

    farBackground.draw(ctx);
    
    ctx.save();
    
    game.camera.follow(ctx, 0, 0);
    
    game.draw(ctx, 0, 0);
    
    lightLayer.draw(ctx);

    ctx.restore();
    
    darknessLayer.draw(ctx);
    
    curtain.draw(ctx);

    onScreenWriting.draw(ctx);
    
  };

  const gameLoop = new GameLoop(update, draw);

  gameLoop.start();
});




