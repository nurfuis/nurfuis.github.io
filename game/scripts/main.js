document.addEventListener('DOMContentLoaded', () => {
    const mapSize = {
        width: 12800, // Reduced map width
        height: 12800, // Reduced map height
        tileSize: 64
    };

    const canvas = document.getElementById('gameCanvas');
    resizeCanvas(canvas);
    const ctx = canvas.getContext('2d');

    const camera = new Camera(canvas, mapSize);
    const game = new GameObject(canvas, camera);
    game.canvas = canvas;
    game.camera = camera;
    game.addChild(camera)
    game.mapSize = mapSize;



    let movePending = false;
    let attackPending = false;
    game.movePending = movePending;
    game.attackPending = attackPending;

    const map = new GameMap(canvas, camera, mapSize);
    game.map = map;


    // const opponentTeam = new Team('opponent-color', teamName = 'Opponent Team');
    // game.opponentTeam = opponentTeam;
    // game.map.addChild(game.opponentTeam);


    const playerTeam = new Team('player-color', teamName = 'Player Team');
    game.playerTeam = playerTeam;
    game.map.addChild(game.playerTeam);
    
    const player = new Unit(mapSize.tileSize * 1, mapSize.tileSize * 1, 64, 'player-color', 4, 'Player',
        canvas, camera, mapSize);
    player.teamName = 'Player Team';

    game.playerTeam.playerOne = player; 

    game.playerTeam.addChild(player);


    game.addChild(map);


    const input = new Input(canvas, camera, game, mapSize);
    game.input = input;



    const particleSystem = new ParticleSystem(canvas, camera, mapSize);
    game.particleSystem = particleSystem;
    game.map.addChild(particleSystem);


    const darknessLayer = new DarknessLayer(canvas, player, mapSize);
    game.darknessLayer = darknessLayer;
    game.addChild(darknessLayer);

    const vignette = new VignetteLayer(canvas, mapSize);
    game.vignette = vignette;
    game.addChild(vignette);

    const debug = new Debug();
    debug.particleSystem = particleSystem; // used to display particle count
    debug.darknessLayer = darknessLayer; // used to display darkness layer info
    debug.vignette = vignette; // used to display vignette info

    

    const update = (delta) => {
        game.stepEntry(delta, game);
        debug.update();
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

    function RandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

});
window.addEventListener('resize', () => {
    const canvas = document.getElementById('gameCanvas');
    resizeCanvas(canvas);
});

