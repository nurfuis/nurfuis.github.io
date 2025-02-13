class Map extends GameObject {
    constructor(canvas, camera, mapSize) {
        super(canvas);
        this.x = 0;
        this.y = 0;
        this.tileSize = 64; // Size of the square tiles
        this.canvas = canvas;
        this.mapSize = mapSize;
        this.camera = camera;
        this.tiles = this.generateTiles();
        this.editMode = false;
        this.selectedTile = null;
        this.useArrowKeys = false;

        events.on('PLAYER_POSITION', this, (data) => {
            this.playerPosition = data;
            if (this.editMode) {
                this.selectedTile = this.getTileAtCoordinates(this.playerPosition.x, this.playerPosition.y);
            }
        });

        events.on('EDIT_TILES', this, () => {
            this.toggleEditMode();
        });
    }

    step(delta, root) {
        const editRange = this.tileSize * 2;

        const input = root.input;
        const x = input.mouse.x;
        const y = input.mouse.y;
        this.mousePosition = { x, y };
        const keysPressed = input.keysPressed;
        if (this.delay > 0) {
            this.delay -= delta; // Decrease the delay by the delta time
            return; // Exit the function if the delay is still active
        }

        if (this.editMode && keysPressed.length > 0 && !!this.selectedTile) {
            this.delay = 250; // Delay in milliseconds (e.g., 250ms = 0.25 seconds)

            // Handle arrow key presses
            let newX = this.selectedTile.x;
            let newY = this.selectedTile.y;

            if (input.keysPressed.includes('ArrowUp')) {
                newY -= this.tileSize;
            } else if (input.keysPressed.includes('ArrowDown')) {
                newY += this.tileSize;
            } else if (input.keysPressed.includes('ArrowLeft')) {
                newX -= this.tileSize;
            } else if (input.keysPressed.includes('ArrowRight')) {
                newX += this.tileSize;
            }

            const distance = Math.sqrt(
                (newX - this.playerPosition.x) ** 2 +
                (newY - this.playerPosition.y) ** 2
            );

            // Check if the new position is within the edit range and map boundaries
            if (distance <= editRange &&
                newX >= 0 && newX < this.mapSize.width &&
                newY >= 0 && newY < this.mapSize.height) {
                this.selectedTile = this.getTileAtCoordinates(newX, newY);
            } else {
                return; // Return early if the updated position is outside the edit range or map boundaries
            }


            // Handle 'q' key press to change the selected tile to air
            if (input.keysPressed.includes('q') && this.selectedTile) {
                if (distance <= editRange) {
                    if (this.selectedTile.type === 'air') {
                        this.selectedTile.type = 'earth';
                        this.selectedTile.color = getComputedStyle(document.querySelector('.brown')).backgroundColor;
                        this.selectedTile.walkable = true;
                    } else {
                        this.selectedTile.type = 'air';
                        this.selectedTile.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                        this.selectedTile.walkable = false;
                    }
                }
            }
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        this.selectedTile = this.getTileAtCoordinates(this.playerPosition.x, this.playerPosition.y);
    }

    generateTiles() {
        const tiles = [];
        const rows = Math.ceil(this.mapSize.height / this.tileSize);
        const cols = Math.ceil(this.mapSize.width / this.tileSize);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);
                let colorClass;
                let walkable = false;
                let type = 'grass';

                if (y > rows - 2) {
                    colorClass = 'brown'; // Brown
                    type = 'hill';
                    walkable = true;
                } else if (noiseValue < -0.2) {
                    colorClass = 'dark-grey'; // Dark grey
                    type = 'water';
                    walkable = true;
                } else if (noiseValue < 0) {
                    colorClass = 'grey'; // Grey
                    type = 'grass';
                    walkable = true;
                } else {
                    colorClass = 'light-grey'; // Light grey
                    type = 'air';
                }

                const color = getComputedStyle(document.querySelector(`.${colorClass}`)).backgroundColor;
                const drawX = x * this.tileSize;
                const drawY = y * this.tileSize;
                tiles.push({ x: drawX, y: drawY, color, walkable, type });
            }
        }
        return tiles;
    }

    getTileAtCoordinates(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.tiles.find(tile => tile.x === tileX * this.tileSize && tile.y === tileY * this.tileSize);
        return tile;
    }

    drawSquare(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
    }

    highlightEditRange(ctx) {
        const tilesInRange = [];
        const tileSize = this.mapSize.tileSize;
        const editRange = tileSize * 2; // Adjust the range as needed

        for (let dx = -editRange; dx <= editRange; dx += tileSize) {
            for (let dy = -editRange; dy <= editRange; dy += tileSize) {
                const targetX = this.playerPosition.x + dx;
                const targetY = this.playerPosition.y + dy;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance <= editRange &&
                    targetX >= 0 && targetX < this.mapSize.width &&
                    targetY >= 0 && targetY < this.mapSize.height) {
                    tilesInRange.push({ x: targetX, y: targetY });
                }
            }
        }

        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'; // Semi-transparent red for edit range
        tilesInRange.forEach(tile => {
            ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        });
    }

    highlightSelectedTile(ctx) {
        if (this.selectedTile) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'; // Semi-transparent green for selected tile
            ctx.fillRect(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize);
        }
    }

    drawImage(ctx, offsetX, offsetY) {
        this.tiles.forEach(tile => {
            const drawX = tile.x - offsetX;
            const drawY = tile.y - offsetY;
            this.drawSquare(ctx, drawX, drawY, this.tileSize, tile.color);
        });

        if (this.editMode) {
            this.highlightEditRange(ctx);

            // Highlight the tile in the center position on the player

            this.highlightSelectedTile(ctx);
        }
    }
}