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
        const input = root.input;

        const keysPressed = input.keysPressed;
        
        if (this.delay > 0) {
            this.delay -= delta; // Decrease the delay by the delta time
            return; // Exit the function if the delay is still active
        }

        if (this.editMode) {
            const editRange = this.tileSize * 2;

            // Handle arrow key presses
            if (keysPressed.length > 0 && !!this.selectedTile) {
                this.delay = 200; // Delay in milliseconds (e.g., 200ms = 0.25 seconds)
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
                    this.useArrowKeys = true;
                    this.selectedTile = this.getTileAtCoordinates(newX, newY);
                } else {
                    this.useArrowKeys = false;
                    return; // Return early if the updated position is outside the edit range or map boundaries
                }
            }



            // Handle 'q' key press to change the selected tile to air or earth
            if (input.keysPressed.includes('q') && this.selectedTile) {
                const distance = Math.sqrt(
                    (this.selectedTile.x - this.playerPosition.x) ** 2 +
                    (this.selectedTile.y - this.playerPosition.y) ** 2
                );

                if (distance <= editRange) {
                    if (this.selectedTile.type != 'earth') {
                    this.selectedTile.type = 'earth';
                    this.selectedTile.color = getComputedStyle(document.querySelector('.brown')).backgroundColor;
                    this.selectedTile.solid = true;
                    this.selectedTile.passable = false; // Earth is not passable
                    this.selectedTile.breakable = false
                    this.selectedTile.durability = 200; // Earth has durability
                    } else if (this.selectedTile.type != 'air') {
                        this.selectedTile.type = 'air';
                        this.selectedTile.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                        this.selectedTile.solid = false;
                        this.selectedTile.passable = true; // Air is passable

                        this.selectedTile.durability = -2; // Air has no durability
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
                let solid = false;
                let type = 'grass';
                let passable = true;
                let durability = 100;
                let climbable = false; // Default to not climbable
                let breakable = true; // Default to breakable

                if (y > rows - 2) {
                    colorClass = 'brown'; // Brown
                    type = 'earth';
                    solid = true;
                    passable = false; // Hills are not passable
                    breakable = false; // Hills are not breakable
                } else if (noiseValue < -0.2) {
                    colorClass = 'dark-grey'; // Dark grey
                    type = 'water';
                    solid = false;
                    climbable = true;
                } else if (noiseValue < 0) {
                    colorClass = 'grey'; // Grey
                    type = 'wood';
                    solid = true;
                    passable = false;
                } else {
                    colorClass = 'light-grey'; // Light grey
                    type = 'air';
                    durability = -2; // Air has no durability
                }

                const color = getComputedStyle(document.querySelector(`.${colorClass}`)).backgroundColor;
                const drawX = x * this.tileSize;
                const drawY = y * this.tileSize;
                tiles.push({ x: drawX, y: drawY, color, solid, type, passable, durability, climbable, breakable });
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

    updateTileVisibility(tile) {
        const maxDurability = 100; // Assuming 100 is the maximum durability
        const sizeFactor = Math.min(tile.durability, maxDurability) / maxDurability;
        const newSize = this.tileSize * sizeFactor;

        // Center the tile as it shrinks
        const offsetX = (this.tileSize - newSize) / 2;
        const offsetY = (this.tileSize - newSize) / 2;

        return { newSize, offsetX, offsetY };
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

        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Semi-transparent red for edit range
        tilesInRange.forEach(tile => {
            ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        });
    }

    highlightSelectedTile(ctx) {
        if (this.selectedTile) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'; // Semi-transparent green for selected tile
            ctx.fillRect(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize);
        }
    }

    drawImage(ctx, offsetX, offsetY) {
        this.tiles.forEach(tile => {
            const { newSize, offsetX: tileOffsetX, offsetY: tileOffsetY } = this.updateTileVisibility(tile);
            const drawX = tile.x - offsetX + tileOffsetX;
            const drawY = tile.y - offsetY + tileOffsetY;
            this.drawSquare(ctx, drawX, drawY, newSize, tile.color);
        });

        if (this.editMode) {
            this.highlightEditRange(ctx);

            // Highlight the tile in the center position on the player
            this.highlightSelectedTile(ctx);
        }
    }
}