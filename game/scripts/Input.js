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
        this.cursorTimeout = null;
        this.cursorHidden = false;

        document.addEventListener('keydown', (event) => {
            const key = event.key;
            if (!this.keysPressed.includes(key)) {
                this.keysPressed.unshift(key); // Add to the beginning of the array
                
                // Hide cursor on keyboard input
                if (!this.cursorHidden) {
                    this.canvas.style.cursor = 'none';
                    this.cursorHidden = true;
                }
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
                
                // Show cursor on mouse movement
                if (this.cursorHidden) {
                    this.canvas.style.cursor = 'default';
                    this.cursorHidden = false;
                }

                // Clear existing timeout
                if (this.cursorTimeout) {
                    clearTimeout(this.cursorTimeout);
                }

                // Set timeout to hide cursor after 2 seconds of no mouse movement
                this.cursorTimeout = setTimeout(() => {
                    if (!this.isDragging) {
                        this.canvas.style.cursor = 'none';
                        this.cursorHidden = true;
                    }
                }, 2000);

                return;
            }

            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;

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

        document.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent the default context menu from appearing

        });
    }

    handleKeyDown(event) {
        if (!this.keysPressed.includes(event.code)) {
            this.keysPressed.push(event.code);
        }
    }

    handleKeyUp(event) {
        const index = this.keysPressed.indexOf(event.code);
        if (index !== -1) {
            this.keysPressed.splice(index, 1);
        }
    }
}
