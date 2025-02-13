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

    const map = new Map(canvas, camera, mapSize);
    game.map = map;


    const playerTeam = new Team('player-color', canvas, camera);
    const opponentTeam = new Team('opponent-color', canvas, camera);
    game.playerTeam = playerTeam;
    game.opponentTeam = opponentTeam;

    game.map.addChild(game.playerTeam);
    game.map.addChild(game.opponentTeam);

    const player = new Unit(0, 0, 64, 'player-color', 4, 'Player', canvas, camera, mapSize);
    game.player = player;
    game.playerTeam.addChild(player);


    game.addChild(map);


    const input = new Input(canvas, camera, game, mapSize);
    game.input = input;


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

