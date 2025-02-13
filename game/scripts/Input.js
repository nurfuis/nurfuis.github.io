const keysPressed = {};
const introAudio = document.getElementById('intro-audio');
const splashScreen = document.getElementById('splash-screen');
const menu = document.getElementById('menu');
const optionsMenu = document.querySelector('.options-menu');
const gameInterface = document.querySelector('.game-interface');
const startButton = document.getElementById('start-button');
const endTurnButton = document.getElementById('end-turn-button');

const moveButton = document.getElementById('move-button');
const attackButton = document.getElementById('attack-button');



let uiHidden = false;

class Input {
    constructor(canvas, camera, game, mapSize) {
        this.keysPressed = []; // Initialize as an empty array
        this.mouse = { x: 0, y: 0 };
        this.canvas = canvas;
        this.camera = camera;
        this.game = game;
        this.mapSize = mapSize;
        this.canvasClicks = [];
        this.clickProcessed = true;
        

        moveButton.addEventListener('click', () => {
            if (this.unloaded) return; // Prevent moving while unloaded
            this.game.movePending = !this.game.movePending; // Toggle movePending state

            if (this.game.movePending) {
                moveButton.classList.add('active'); // Highlight the move button
            } else {
                moveButton.classList.remove('active'); // Remove highlight
            }
            toggleActionBarButtons(this.game.movePending, this.game.attackPending);
        });

        attackButton.addEventListener('click', () => {
            const currentUnit = game.turnOrder[game.currentTurnIndex];
            const attackMenu = document.getElementById('attack-menu');
            if (currentUnit.isLoaded) return; // Prevent attacking from a vehicle
            if (currentUnit.remainingAttacks > 0) {

                this.game.attackPending = !this.game.attackPending;

                if (this.game.attackPending) {
                    attackButton.classList.add('active');
                    populateAttackMenu(currentUnit); // Populate the attack menu
                    attackMenu.style.display = 'flex'; // Show the attack menu
                } else {
                    attackButton.classList.remove('active');
                    attackMenu.style.display = 'none'; // Hide the attack menu
                    currentUnit.selectedAttack = null;
                }
                toggleActionBarButtons(this.game.movePending, this.game.attackPending);
            } else {
                console.log(`${currentUnit.name} has no remaining attacks.`);
            }
        });




        document.addEventListener('keydown', (event) => {
            const key = event.key;
            if (!this.keysPressed.includes(key)) {
                this.keysPressed.unshift(key); // Add to the beginning of the array
            }

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

            // Recenter map to active unit on numpad 0 key press
            if (event.key === '0' && event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
                const currentUnit = this.turnOrder[this.currentTurnIndex];
                this.camera.position.x = Math.round(currentUnit.x - this.canvas.width / 2 + currentUnit.size / 2);
                this.camera.position.y = Math.round(currentUnit.y - this.camera.height / 2 + currentUnit.size / 2);
            }

            // Toggle UI visibility on F1 key press
            if (event.key === 'F1') {
                event.preventDefault(); // Prevent the default F1 action
                uiHidden = !uiHidden;
                toggleUIVisibility(uiHidden);
            }

            // Toggle movePending state on 'v' key press
            if (event.key === 'v' && !this.game.attackPending) {
                if (this.unloaded) return; // Prevent moving while unloaded

                this.game.movePending = !this.game.movePending;
                if (this.game.movePending) {
                    moveButton.classList.add('active'); // Highlight the move button
                } else {
                    moveButton.classList.remove('active'); // Remove highlight
                }
                toggleActionBarButtons(this.game.movePending, this.game.attackPending);
            }

            if (event.key === 't' && !this.game.movePending) {
                const currentUnit = this.game.turnOrder[this.game.currentTurnIndex];
                const attackMenu = document.getElementById('attack-menu');
                if (currentUnit.isLoaded) return; // Prevent attacking from a vehicle
                if (currentUnit.remainingAttacks > 0) {

                    this.game.attackPending = !this.game.attackPending;
                    if (this.game.attackPending) {
                        attackButton.classList.add('active');
                        populateAttackMenu(currentUnit); // Populate the attack menu
                        attackMenu.style.display = 'flex'; // Show the attack menu
                    } else {
                        attackButton.classList.remove('active');
                        attackMenu.style.display = 'none'; // Hide the attack menu
                        currentUnit.selectedAttack = null;
                    }
                    toggleActionBarButtons(this.game.movePending, this.game.attackPending);
                } else {
                    console.log(`${currentUnit.name} has no remaining attacks.`);
                }
            }
            if (event.key ==='e') {
                events.emit("EDIT_TILES"); // Emit the event to toggle tile editing mode
            }
            if (event.key === 'q') {
                //
            }

        });

        document.addEventListener('keyup', (event) => {
            const key = event.key;
            const index = this.keysPressed.indexOf(key);
            if (index > -1) {
                this.keysPressed.splice(index, 1); // Remove the key from the array
            }
        });

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        this.canvas.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
        });

        this.canvas.addEventListener('mousemove', (event) => {
            if (!this.isDragging) {
                this.mouse.x = event.clientX; // Update mouse position
                this.mouse.y = event.clientY; // Update mouse position
                return;
            }

            // const dx = event.clientX - this.dragStartX;
            // const dy = event.clientY - this.dragStartY;

            // let newX = this.camera.position.x + dx;
            // let newY = this.camera.position.y + dy;


            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            // Allow the camera to pan past the mapSize by half the screen width and height
            // const panExtensionX = this.canvas.width / 2;
            // const panExtensionY = this.canvas.height / 2;

            // const minX = this.canvas.width - this.mapSize.width - panExtensionX;
            // const minY = this.canvas.height - this.mapSize.height - panExtensionY;
            // const maxX = panExtensionX;
            // const maxY = panExtensionY;

            // newX = Math.max(minX, Math.min(newX, maxX));
            // newY = Math.max(minY, Math.min(newY, maxY));

            // this.camera.position.x = Math.floor(newX);
            // this.camera.position.y = Math.floor(newY);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('click', (event) => {
            const x = event.clientX - this.camera.position.x;
            const y = event.clientY - this.camera.position.y;
            this.canvasClicks.unshift({ x, y });
        });
    }

}
