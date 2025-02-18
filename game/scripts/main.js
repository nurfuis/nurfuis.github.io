const gameWorlds = {
    flat: {
        type: 'flat',
        name: 'Flat Land',
        paragraph: 'A flat land.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    hills: {
        type: 'hills',
        name: 'Small Hill',
        paragraph: 'A small hill.',
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
    shallowWater: {
        type: 'shallowWater',
        name: 'Shallow Water',
        paragraph: 'A shallow body of water.',
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
    }
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener('DOMContentLoaded', () => {
    const gameWorld = 'flat'; // Set the game world to 'overworld' by default

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
        map.mapSize
    );
    player.teamName = 'Player Team';


    const playerTeam = new Team('player-color', teamName = 'Player Team');
    game.playerTeam = playerTeam;
    game.playerTeam.playerOne = player;
    game.playerTeam.addChild(player);
    

    game.addChild(game.playerTeam);


    const input = new Input(canvas, camera, game, map.mapSize);
    game.input = input;

    const automatedInput = new AutomatedInput();
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
    constructor(directions = ["left", "right", "up", "down", "up-left", "up-right", "down-left", "down-right"], interval = 1000) {
      this.directions = directions;
      this.interval = interval;
      this.currentDirection = null;
      this.heldKeys = [];
  
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
      const randomIndex = Math.floor(Math.random() * this.directions.length);
      const randomIndex2 = Math.floor(Math.random() * this.directions.length);
      if (randomIndex != randomIndex2) {
        this.currentDirection = this.directions[randomIndex];
      } else {
        this.currentDirection = undefined;
      }
    }
  }