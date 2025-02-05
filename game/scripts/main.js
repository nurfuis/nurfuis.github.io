document.addEventListener('DOMContentLoaded', () => {
    const gameInterface = document.querySelector('.game-interface');
    const menu = document.getElementById('menu');
    const optionsMenu = document.querySelector('.options-menu');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const introAudio = document.getElementById('intro-audio');
    const splashScreen = document.getElementById('splash-screen');
    const startButton = document.getElementById('start-button');
    const endTurnButton = document.getElementById('end-turn-button');
    const moveButton = document.getElementById('move-button');
    let gameStarted = false; // Flag to check if the game has started
    let turnOrder = [];
    let currentTurnIndex = 0;
    let movePending = false;
    let uiHidden = false; // Flag to track UI visibility

    // Configuration variable to determine which screen displays first
    const initialScreen = 'splash'; // Options: 'splash', 'menu', 'game'

    // Map size configuration
    const mapSize = {
        width: 3000, // Set the desired map width
        height: 3000 // Set the desired map height
    };

    function showInitialScreen() {
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
                    startGameLoop();
                    gameStarted = true;
                }
                break;
            default:
                splashScreen.style.display = 'flex';
                menu.style.display = 'none';
                gameInterface.style.display = 'none';
        }
    }

    splashScreen.addEventListener('click', () => {
        splashScreen.style.display = 'none';
        menu.style.display = 'flex';
        introAudio.play();
    });

    document.getElementById('exit-button').addEventListener('click', () => {
        menu.style.display = 'none';
        splashScreen.style.display = 'flex';
        introAudio.pause();
        introAudio.currentTime = 0;
    });

    document.getElementById('menu-button').addEventListener('click', () => {
        gameInterface.style.display = 'none';
        menu.style.display = 'flex';
        if (gameStarted) {
            startButton.textContent = 'Resume Game';
        }
    });

    startButton.addEventListener('click', () => {
        menu.style.display = 'none';
        gameInterface.style.display = 'flex';
        introAudio.play();
        if (!gameStarted) {
            startGameLoop();
            gameStarted = true;
        }
    });

    // Example actions
    document.getElementById('damage-button').addEventListener('click', () => {
        const currentUnit = turnOrder[currentTurnIndex];
        takeDamage(currentUnit, 10);
    });

    document.getElementById('heal-button').addEventListener('click', () => {
        const currentUnit = turnOrder[currentTurnIndex];
        heal(currentUnit, 10);
    });

    // Show options menu on options button click
    document.getElementById('options-button').addEventListener('click', () => {
        menu.style.display = 'none';
        optionsMenu.style.display = 'flex';
    });

    // Hide options menu and show main menu on back button click
    document.getElementById('back-button').addEventListener('click', () => {
        optionsMenu.style.display = 'none';
        menu.style.display = 'flex';
    });

    const keysPressed = {};

    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;

        // Toggle menu display on Escape key press
        if (event.key === 'Escape') {
            if (!menu.style.display || menu.style.display === 'none') {
                menu.style.display = 'flex';
                gameInterface.style.display = 'none';
                if (gameStarted) {
                    startButton.textContent = 'Resume Game';
                }
            } else {
                menu.style.display = 'none';
                gameInterface.style.display = 'flex';
            }
        }

        // Recenter map to player on numpad 0 key press
        if (event.key === '0' && event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
            camera.x = playerTeam.children[0].x - camera.width / 2 + playerTeam.children[0].size / 2;
            camera.y = playerTeam.children[0].y - camera.height / 2 + playerTeam.children[0].size / 2;
        }

        // Toggle UI visibility on F1 key press
        if (event.key === 'F1') {
            event.preventDefault(); // Prevent the default F1 action
            uiHidden = !uiHidden;
            toggleUIVisibility(uiHidden);
        }
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key] = false;
    });

    function handleMovement() {
        let dx = 0;
        let dy = 0;

        if (keysPressed['w']) dy -= 1;
        if (keysPressed['a']) dx -= 1;
        if (keysPressed['s']) dy += 1;
        if (keysPressed['d']) dx += 1;

        const currentUnit = turnOrder[currentTurnIndex];
        if (movePending && currentUnit.colorClass === 'player-color') {
            currentUnit.move(dx, dy);
        } else {
            // Pan the camera
            camera.x += dx * 10; // Adjust the speed of panning as needed
            camera.y += dy * 10; // Adjust the speed of panning as needed

            // Constrain camera within the map boundaries
            if (camera.x < 0) camera.x = 0;
            if (camera.y < 0) camera.y = 0;
            if (camera.x + camera.width > mapSize.width) camera.x = mapSize.width - camera.width;
            if (camera.y + camera.height > mapSize.height) camera.y = mapSize.height - camera.height;
        }
    }

    // Camera object
    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };

    function updateCamera() {
        // No automatic camera centering on player movement
    }

    // Variables for dragging
    let isDragging = false;
    let dragStartX, dragStartY;

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const dx = event.clientX - dragStartX;
            const dy = event.clientY - dragStartY;
            camera.x -= dx;
            camera.y -= dy;
            dragStartX = event.clientX;
            dragStartY = event.clientY;

            // Constrain camera within the map boundaries
            if (camera.x < 0) camera.x = 0;
            if (camera.y < 0) camera.y = 0;
            if (camera.x + camera.width > mapSize.width) camera.x = mapSize.width - camera.width;
            if (camera.y + camera.height > mapSize.height) camera.y = mapSize.height - camera.height;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    canvas.addEventListener('click', (event) => {
        const currentUnit = turnOrder[currentTurnIndex];
        if (movePending && currentUnit.colorClass === 'player-color') {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left + camera.x;
            const y = event.clientY - rect.top + camera.y;
            currentUnit.targetPosition = { x, y };
        }
    });

    function initializeTurnOrder() {
        turnOrder = [...playerTeam.children, ...opponentTeam.children];
        turnOrder.sort((a, b) => b.speed - a.speed);
        updateTurnOrderDisplay();

        // Center the camera on the first unit to move
        const firstUnit = turnOrder[0];
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
        turnOrder.forEach((unit, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${unit.name}`;
            const unitElement = document.querySelector(`.${unit.colorClass}`);
            if (unitElement) {
                listItem.style.backgroundColor = getComputedStyle(unitElement).backgroundColor;
            }
            if (index === currentTurnIndex) {
                listItem.classList.add('active');
            } else {
                listItem.classList.remove('active');
            }
            turnOrderList.appendChild(listItem);
        });
    }

    function nextTurn() {
        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        updateTurnOrderDisplay();
        const currentUnit = turnOrder[currentTurnIndex];
        updateUnitStats(currentUnit); // Update unit stats for the active unit
        if (currentUnit.colorClass === 'opponent-color') {
            // Automate opponent's unit movement
            let targetPosition;
            do {
                targetPosition = {
                    x: currentUnit.x + (Math.random() - 0.5) * 2 * currentUnit.maxDistance,
                    y: currentUnit.y + (Math.random() - 0.5) * 2 * currentUnit.maxDistance
                };
            } while (!currentUnit.canMoveTo(targetPosition.x, targetPosition.y) || 
                     targetPosition.x < 0 || targetPosition.x > mapSize.width - currentUnit.size || 
                     targetPosition.y < 0 || targetPosition.y > mapSize.height - currentUnit.size);
            currentUnit.targetPosition = targetPosition;
        }
    }

    endTurnButton.addEventListener('click', () => {
        nextTurn();
    });

    moveButton.addEventListener('click', () => {
        movePending = !movePending; // Toggle movePending state
    });

    // Variables for particles
    const particles = [];

    // Game loop
    function startGameLoop() {
        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            handleMovement();
            game.update();
            game.draw(ctx);

            // Draw move range indicator if move is pending
            if (movePending) {
                const currentUnit = turnOrder[currentTurnIndex];
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.lineWidth = 2;

                // Draw moveable area
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                for (let angle = 0; angle < 360; angle += 1) {
                    const rad = angle * (Math.PI / 180);
                    const x = currentUnit.x + Math.cos(rad) * currentUnit.maxDistance;
                    const y = currentUnit.y + Math.sin(rad) * currentUnit.maxDistance;
                    if (currentUnit.canMoveTo(x, y) && x >= 0 && x <= mapSize.width && y >= 0 && y <= mapSize.height) {
                        ctx.fillRect(x - camera.x, y - camera.y, 1, 1);
                    }
                }

                // Draw the arc segments within the map boundaries
                ctx.beginPath();
                for (let angle = 0; angle < 360; angle += 1) {
                    const rad = angle * (Math.PI / 180);
                    const x = currentUnit.x + Math.cos(rad) * currentUnit.maxDistance;
                    const y = currentUnit.y + Math.sin(rad) * currentUnit.maxDistance;
                    if (currentUnit.canMoveTo(x, y) && x >= 0 && x <= mapSize.width && y >= 0 && y <= mapSize.height) {
                        if (angle === 0) {
                            ctx.moveTo(x - camera.x, y - camera.y);
                        } else {
                            ctx.lineTo(x - camera.x, y - camera.y);
                        }
                    }
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Update and draw particles
            particles.forEach(particle => particle.update());
            particles.forEach(particle => particle.draw(ctx));
            // Remove particles that have expired
            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].size === 0) {
                    particles.splice(i, 1);
                }
            }

            requestAnimationFrame(gameLoop);
        }

        gameLoop();
    }

    // Resize canvas to fit window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        camera.width = canvas.width;
        camera.height = canvas.height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create game objects
    const game = new GameObject(canvas, camera);
    const map = new Map(canvas, camera, mapSize);
    const playerTeam = new Team('player-color', canvas, camera);
    const opponentTeam = new Team('opponent-color', canvas, camera);

    // Add units to teams
    playerTeam.addUnit(new Unit(0, 0, 32, 'player-color', 5, 'Alpha', canvas, camera, mapSize));
    playerTeam.addUnit(new Unit(50, 50, 32, 'player-color', 4, 'Bravo', canvas, camera, mapSize));
    playerTeam.addUnit(new Unit(100, 0, 32, 'player-color', 3, 'Charlie', canvas, camera, mapSize));
    playerTeam.addUnit(new Unit(150, 50, 32, 'player-color', 2, 'Delta', canvas, camera, mapSize));
    playerTeam.addUnit(new Unit(200, 0, 32, 'player-color', 1, 'Echo', canvas, camera, mapSize));

    opponentTeam.addUnit(new Unit(100, 100, 32, 'opponent-color', 5, 'Foxtrot', canvas, camera, mapSize));
    opponentTeam.addUnit(new Unit(150, 150, 32, 'opponent-color', 4, 'Golf', canvas, camera, mapSize));
    opponentTeam.addUnit(new Unit(200, 100, 32, 'opponent-color', 3, 'Hotel', canvas, camera, mapSize));
    opponentTeam.addUnit(new Unit(250, 150, 32, 'opponent-color', 2, 'India', canvas, camera, mapSize));
    opponentTeam.addUnit(new Unit(300, 100, 32, 'opponent-color', 1, 'Juliet', canvas, camera, mapSize));

    map.addChild(playerTeam);
    map.addChild(opponentTeam);
    game.addChild(map);

    initializeTurnOrder();
    showInitialScreen();
});