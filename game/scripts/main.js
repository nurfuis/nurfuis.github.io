document.addEventListener('DOMContentLoaded', () => {
    const mapSize = {
        width: 3000,
        height: 3000,
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

    let turnOrder = [];
    let currentTurnIndex = 0;
    game.turnOrder = turnOrder;
    game.currentTurnIndex = currentTurnIndex;

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


    game.playerTeam.addUnit(new Unit(150, 150, 32, 'player-color', 5, 'Alpha', canvas, camera, mapSize));
    game.playerTeam.addUnit(new Unit(200, 150, 32, 'player-color', 4, 'Bravo', canvas, camera, mapSize));
    game.playerTeam.addUnit(new Unit(150, 200, 32, 'player-color', 3, 'Charlie', canvas, camera, mapSize));
    game.playerTeam.addUnit(new Unit(200, 200, 32, 'player-color', 2, 'Delta', canvas, camera, mapSize));
    game.playerTeam.addUnit(new Unit(250, 150, 32, 'player-color', 1, 'Echo', canvas, camera, mapSize));

    // Add units to opponent team near opponent fort
    game.opponentTeam.addUnit(new Unit(2750, 150, 32, 'opponent-color', 5, 'Foxtrot', canvas, camera, mapSize));
    game.opponentTeam.addUnit(new Unit(2800, 150, 32, 'opponent-color', 4, 'Golf', canvas, camera, mapSize));
    game.opponentTeam.addUnit(new Unit(2750, 200, 32, 'opponent-color', 3, 'Hotel', canvas, camera, mapSize));
    game.opponentTeam.addUnit(new Unit(2800, 200, 32, 'opponent-color', 2, 'India', canvas, camera, mapSize));
    game.opponentTeam.addUnit(new Unit(2850, 150, 32, 'opponent-color', 1, 'Juliet', canvas, camera, mapSize));

    game.map.addChild(game.playerTeam);
    game.map.addChild(game.opponentTeam);

    const buildings = [];
    game.buildings = buildings;

    const fort = new Fort(100, 100, 64, 'player-color', canvas, camera, mapSize);
    const opponentFort = new Fort(2900, 100, 64, 'opponent-color', canvas, camera, mapSize);
    const neutralFort = new Fort(1500, 1500, 64, 'neutral-color', canvas, camera, mapSize);
    game.map.addChild(fort);
    game.map.addChild(opponentFort);
    game.map.addChild(neutralFort);
    game.buildings.push(fort);



    const vehicles = [];
    const newVehicle = new Vehicle(200, 100, 64, 3, 3, canvas, camera, mapSize);
    game.map.addChild(newVehicle);
    vehicles.push(newVehicle);
    game.vehicles = vehicles;

    const coverLayer = new CoverLayer(mapSize, mapSize.tileSize);
    game.addChild(coverLayer);
    game.coverLayer = coverLayer;

    const fogLayer = new FogOfWar(mapSize, mapSize.tileSize);
    game.addChild(fogLayer);
    game.fogLayer = fogLayer;

    function createRandomCover () {
        const x = Math.random() * mapSize.width;
        const y = Math.random() * mapSize.height;
        const width = Math.random() * 100 + 50;
        const height = Math.random() * 100 + 50;
        game.coverLayer.addCover(x, y, width, height);
    }
    const randomCoverAmount = 50;
    for (let i = 0; i < randomCoverAmount; i++) {
        createRandomCover();
    }

    game.addChild(map);


    initializeTurnOrder(game, playerTeam, opponentTeam, camera, mapSize);

    const input = new Input(canvas, camera, game, mapSize);
    game.input = input;


    const particles = [];

    const update = (delta) => {
        game.stepEntry(delta, game);
        game.fogLayer.updateFog(game.playerTeam, game.vehicles, game.buildings);
    };
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        game.camera.follow(ctx, 0, 0);

        game.draw(ctx, 0, 0);
        game.coverLayer.draw(ctx, 0, 0);
        game.fogLayer.draw(ctx, 0, 0);
        ctx.restore();
    };

    const gameLoop = new GameLoop(update, draw);

    const initialScreen = 'game'; // Options: 'splash', 'menu', 'game'


    function showInitialScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const menu = document.getElementById('menu');
        const gameInterface = document.querySelector('.game-interface');
        switch (initialScreen) {
            case 'splash':
                splashScreen.style.display = 'flex';
                menu.style.display = 'none';
                gameInterface.style.display = 'none';
                break;
            case 'menu':
                splashScreen.style.display = 'none';
                menu.style.display = 'flex';
                gameInterface.style.display = 'none';
                break;
            case 'game':
                splashScreen.style.display = 'none';
                menu.style.display = 'none';
                gameInterface.style.display = 'flex';
                if (!gameStarted) {
                    gameLoop.start();
                    gameStarted = true;
                }
                break;
            default:
                splashScreen.style.display = 'flex';
                menu.style.display = 'none';
                gameInterface.style.display = 'none';
        }
    }

    window.gameStarted = false;

    document.getElementById('end-turn-button').addEventListener('click', () => {
        nextTurn();
    });

    document.addEventListener('keydown', (event) => {
        // End turn on Space or Return key press
        if (event.key === ' ' || event.key === 'Enter') {
            nextTurn();
        }
    });
    function initializeTurnOrder(game, playerTeam, opponentTeam, camera, mapSize) {
        game.turnOrder = [...playerTeam.children, ...opponentTeam.children];
        game.turnOrder.sort((a, b) => b.speed - a.speed);
        updateTurnOrderDisplay(game.turnOrder, game.currentTurnIndex);

        // Center the camera on the first unit to move
        const firstUnit = game.turnOrder[0];
        camera.x = firstUnit.x - camera.width / 2 + firstUnit.size / 2;
        camera.y = firstUnit.y - camera.height / 2 + firstUnit.size / 2;

        // Constrain camera within the map boundaries
        if (camera.x < 0) camera.x = 0;
        if (camera.y < 0) camera.y = 0;
        if (camera.x + camera.width > mapSize.width) camera.x = mapSize.width - camera.width;
        if (camera.y + camera.height > mapSize.height) camera.y = mapSize.height - camera.height;

        updateUnitStats(firstUnit); // Update unit stats for the first unit
    }

    function updateTurnOrderDisplay() {
        const turnOrderList = document.querySelector('.turn-order ul');
        turnOrderList.innerHTML = '';
        game.turnOrder.forEach((unit, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${unit.name}`;
            const unitElement = document.querySelector(`.${unit.colorClass}`);
            if (unitElement) {
                listItem.style.backgroundColor = getComputedStyle(unitElement).backgroundColor;
            }
            if (index === game.currentTurnIndex) {
                listItem.classList.add('active');
            } else {
                listItem.classList.remove('active');
            }
            turnOrderList.appendChild(listItem);
        });
    }

    function nextTurn() {
        game.movePending = false;
        game.attackPending = false;
        toggleActionBarButtons(game.movePending, game.attackPending);
        moveButton.classList.remove('active');
        attackButton.classList.remove('active');
        document.getElementById('attack-menu').style.display = 'none'; // Hide the attack menu

        const vehicleControlsMenu = document.getElementById('vehicle-controls-menu');
        vehicleControlsMenu.style.display = 'none';

        game.currentTurnIndex = (game.currentTurnIndex + 1) % game.turnOrder.length;
        updateTurnOrderDisplay();

        const currentUnit = game.turnOrder[game.currentTurnIndex];
        if (currentUnit.isLoaded) {
            currentUnit.turnsLoaded++;
        }


        updateUnitStats(currentUnit); // Update unit stats for the active unit

        // Update initial position and max distance at the start of the turn
        currentUnit.initialX = currentUnit.x;
        currentUnit.initialY = currentUnit.y;

        if (currentUnit.isLoaded) {
            // Show vehicle controls if the unit is loaded
            showVehicleControls(currentUnit.vehicle, currentUnit);
        }

        if (currentUnit.colorClass === 'opponent-color') {
            // Automate opponent's unit movement
            let targetPosition;
            do {
                targetPosition = {
                    x: currentUnit.x + (Math.random() - 0.5) * 2 * currentUnit.maxDistance,
                    y: currentUnit.y + (Math.random() - 0.5) * 2 * currentUnit.maxDistance
                };

                // Ensure the target position is within the map boundaries
                targetPosition.x = Math.max(0, Math.min(targetPosition.x, mapSize.width - currentUnit.size));
                targetPosition.y = Math.max(0, Math.min(targetPosition.y, mapSize.height - currentUnit.size));

            } while (!currentUnit.canMoveTo(targetPosition.x, targetPosition.y) ||
            targetPosition.x < 0 || targetPosition.x > mapSize.width - currentUnit.size ||
            targetPosition.y < 0 || targetPosition.y > mapSize.height - currentUnit.size);
            currentUnit.targetPosition = targetPosition;
        }
    }




    initializeEventListeners();


    showInitialScreen();






});