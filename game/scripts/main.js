const gameWorld = 'flat'; // Set the game world to 'overworld' by default

const gameWorlds = {
  flat: {
    type: 'flat',
    name: 'Flat Land',
    paragraph: 'Move up, down, and side to side by pressing the WASD keys.',
    width: 512,
    height: 512,
    tileSize: 64,
    lengthOfRun: 1
  },
  hills: {
    type: 'hills',
    name: 'Small Hill',
    paragraph: 'Move diagonally by pressing two of the WASD keys at the same time.',
    width: 512,
    height: 512,
    tileSize: 64,
    lengthOfRun: 1
  },
  ledge: {
    type: 'ledge',
    name: 'Small Ledge',
    paragraph: 'Press the space key with up, left, or right to jump.',
    width: 512,
    height: 512,
    tileSize: 64,
    lengthOfRun: 1
  },
  shallowWater: {
    type: 'shallowWater',
    name: 'Shallow Water',
    paragraph: 'A shallow body of water.',
    width: 512,
    height: 512,
    tileSize: 64,
    lengthOfRun: 1
  },
  forest: {
    type: 'forest',
    name: 'Small Tree',
    paragraph: 'A small tree.',
    width: 512,
    height: 512,
    tileSize: 64,
    lengthOfRun: 1
  },

  sapForest: {
    type: 'sapForest',
    name: 'Sap Wood',
    paragraph: 'A forest of small trees with sappy logs.',
    width: 512 * 3,
    height: 512,
    tileSize: 64,
    lengthOfRun: 3
  },
  combined: {
    type: 'combined',
    name: 'Adventure Land',
    paragraph: 'A land of flat land, hills, forests, and shallow water.',
    width: 512 * 20,
    height: 512,
    tileSize: 64,
    lengthOfRun: 20
  },
  underworld: {
    type: 'underworld',
    name: 'Underworld',
    paragraph: 'A land of darkness and danger.',
    width: 12800,
    height: 12800,
    tileSize: 64,
    lengthOfRun: 1

  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener('DOMContentLoaded', () => {

  const mapSize = { width: 512, height: 512, tileSize: 64 };
  mapSize.width = gameWorlds[gameWorld].width;
  mapSize.height = gameWorlds[gameWorld].height;
  mapSize.tileSize = gameWorlds[gameWorld].tileSize;

  console.log('Starting new game in ' + gameWorlds[gameWorld].name);
  console.log('Map size: ' + mapSize.width + 'x' + mapSize.height);


  const canvas = document.getElementById('gameCanvas');
  resizeCanvas(canvas);
  const ctx = canvas.getContext('2d');
  console.log('Canvas size: ' + canvas.width + 'x' + canvas.height);

  const game = new GameObject();
  game.canvas = canvas;

  const map = new GameMap(canvas, mapSize, gameWorld);
  game.map = map;
  game.addChild(map);
  console.log('Map object created', map);

  const camera = new Camera(canvas, map);
  game.camera = camera;
  game.addChild(camera)
  console.log('Camera object created', camera);

  let movePending = false;
  let attackPending = false;
  game.movePending = movePending;
  game.attackPending = attackPending;


  const player = new Unit(game.map.mapSize.tileSize * 1,
    game.map.mapSize.tileSize * 4, 64,
    'player-color',
    4,
    'Player',
    canvas,
    camera,
    map
  );
  player.teamName = 'Player Team';

  const d = new UnitDebugger(canvas, player);
  player.addChild(d);

const playerTeam = new Team('player-color', teamName = 'Player Team');
game.playerTeam = playerTeam;
game.playerTeam.playerOne = player;
game.playerTeam.addChild(player);


game.addChild(game.playerTeam);


const input = new Input(canvas, camera, game, map.mapSize);
game.input = input;

const automatedInput = new AutomatedInput([
  { direction: "left", weight: 0.5 },    // More likely to go left
  { direction: "right", weight: 13 },   // More likely to go right
  { direction: "up", weight: 3 },      // Standard up movement
  { direction: "down", weight: 3 },  // Less likely to go down
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

const particleSystem = new ParticleSystem(canvas, camera, game.map.mapSize);
game.particleSystem = particleSystem;
game.addChild(particleSystem);


const darknessLayer = new DarknessLayer(canvas, player, map);
game.darknessLayer = darknessLayer;
game.addChild(darknessLayer);

const onScreenWriting = new OnScreenWriting(canvas, camera, map);
game.onScreenWriting = onScreenWriting;
game.addChild(onScreenWriting);



// const vignette = new VignetteLayer(canvas, game.map.mapSize);
// game.vignette = vignette;
// game.addChild(vignette);

// const debug = new Debug();
// debug.particleSystem = particleSystem; // used to display particle count
// debug.darknessLayer = darknessLayer; // used to display darkness layer info
// debug.vignette = vignette; // used to display vignette info


const update = (delta) => {
  game.stepEntry(delta, game);
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  game.camera.follow(ctx, 0, 0);
  game.draw(ctx, 0, 0);

  ctx.restore();
};

const gameLoop = new GameLoop(update, draw);
gameLoop.start();

initializeEventListeners();

});

window.addEventListener('resize', () => {
  const canvas = document.getElementById('gameCanvas');
  resizeCanvas(canvas);
});


class AutomatedInput {
  constructor(directions = [
    { direction: "left", weight: 2 },
    { direction: "right", weight: 2 },
    { direction: "up", weight: 1 },
    { direction: "down", weight: 1 },
    { direction: "up-left", weight: 0.5 },
    { direction: "up-right", weight: 0.5 },
    { direction: "down-left", weight: 0.5 },
    { direction: "down-right", weight: 0.5 },
    { direction: "up-two", weight: 0.3 },
    { direction: "up-left-two", weight: 0.2 },
    { direction: "up-right-two", weight: 0.2 },
    { direction: "up-three-left-one", weight: 0.1 },
    { direction: "up-three-right-one", weight: 0.1 }
  ], interval = 1000) {
    this.directions = directions;
    this.interval = interval;
    this.currentDirection = null;
    this.heldKeys = [];
    
    // Calculate total weight
    this.totalWeight = this.directions.reduce((sum, dir) => sum + dir.weight, 0);

    this.scheduleNextInput();
  }

  get direction() {
    return this.currentDirection;
  }

  scheduleNextInput() {
    setTimeout(() => {
      this.chooseRandomDirection();
      this.scheduleNextInput();
    }, this.interval);
  }

  chooseRandomDirection() {
    // Get random value between 0 and total weight
    const random = Math.random() * this.totalWeight;
    let weightSum = 0;

    // Find the direction based on weight
    for (const dir of this.directions) {
      weightSum += dir.weight;
      if (random <= weightSum) {
        this.currentDirection = dir.direction;
        return;
      }
    }

    // Fallback to center
    this.currentDirection = 'center';
  }
}