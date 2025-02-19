const rarityRates = [0.01, 0.05, 0.1, 0.2, 0.3]; // Rarity rates for each rarity level
const rarityLabels = ['legendary', 'epic', 'rare', 'uncommon', 'common']; // Rarity labels for each rarity level




class GameMap extends GameObject {
    constructor(canvas, mapSize, gameWorld) {
        super(canvas);
        this.x = 0;
        this.y = 0;
        this.canvas = canvas;

        this.mapSize = mapSize;
        this.tileSize = mapSize.tileSize;

        this.gameWorld = gameWorld;

        this.tiles = this.generateTiles();


        this.editMode = false;
        this.selectedTile = null;

        this.delay = 0; // Initialize the delay variable to 0

        this.waterAnimationTimer = 0;
        this.waterAnimationInterval = 1400; // Cycle every 200ms
        this.waterAnimationFrame = 0;

        this.woodTile = new Image(); // Create a new Image object for the wood tile texture
        this.woodTile.src = 'images/wood-tile.png'; // Set the source of the wood tile texture

        this.waterTile = new Image(); // Create a new Image object for the water tile texture   
        this.waterTile.src = 'images/water-tile.png'; // Set the source of the water tile texture

        this.earthTile = new Image(); // Create a new Image object for the earth tile texture
        this.earthTile.src = 'images/earth-tile.png'; // Set the source of the earth tile texture

        this.airTile = new Image(); // Create a new Image object for the air tile texture
        this.airTile.src = 'images/air-tile.png'; // Set the source of the air tile texture

        this.treeBark = new Image(); // Create a new Image object for the wood tile texture with air adjacent
        this.treeBark.src = 'images/tree-bark.png'; // Set the source of the wood tile texture with air adjacent

        this.earthTileSheet = new Image(); // Create a new Image object for the earth tile sheet texture
        this.earthTileSheet.src = 'images/earth-tile-sheet.png'; // Set the source of the earth tile sheet texture

        this.earthTileSheet2 = new Image(); // Create a new Image object for the earth tile sheet texture
        this.earthTileSheet2.src =
            'images/earth-tile-sheet-2.png'; // Set the source of the earth tile sheet texture   

        this.woodTile2 = new Image(); // Create a new Image object for the wood tile texture with air adjacent
        this.woodTile2.src = 'images/wood-tile-2.png'; // Set the source of the wood tile texture with air adjacent

        this.waterTileSheet = new Image(); // Create a new Image object for the water tile sheet texture
        this.waterTileSheet.src = 'images/water-tile-sheet.png'; // Set the source of the water tile sheet texture

        this.stoneTile = new Image(); // Create a new Image object for the stone tile texture
        this.stoneTile.src = 'images/cobblestone-tile.png'; // Set the source of the stone tile texture

        this.lengthOfRun = 20;


        events.on('ADVANCE_MAP', this, () => {
            this.advanceMap(); // Call the advanceMap method when the event is triggered
        });
        events.on('RETREAT_MAP', this, () => {
            this.retreatMap(); // Call the retreatMap method when the event is triggered
        });
        events.on('PLAYER_POSITION', this, (data) => {
            this.playerPosition = data;
            if (this.editMode) {
                this.selectedTile = this.getTileAtCoordinates(this.playerPosition.x, this.playerPosition.y);
            }
        });
        events.on('EDIT_TILES', this, () => {
            this.toggleEditMode();
        });

        // Add water disturbance tracking
        this.disturbedWaterTiles = new Map(); // Map of {tileKey: animationFrame}
        this.disturbanceDuration = 1500; // How long the disturbance lasts (ms)
        this.animationSpeed = 200; // Time between animation frames (ms)

        // Add event listener for F4
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F4') {
                e.preventDefault();
                this.cycleMapType();
            }
        });


    }
    ready() {
        events.emit('DISPLAY_TEXT', {
            heading: gameWorlds[this.gameWorld].name,
            subheading: gameWorlds[this.gameWorld].subheading,
            paragraph: gameWorlds[this.gameWorld].paragraph
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
                        this.selectedTile.color = getComputedStyle(document.querySelector('.brown'))
                            .backgroundColor;
                        this.selectedTile.solid = true;
                        this.selectedTile.passable = false; // Earth is not passable
                        this.selectedTile.breakable = false
                        this.selectedTile.durability = 200; // Earth has durability
                    } else if (this.selectedTile.type != 'air') {
                        this.selectedTile.type = 'air';
                        this.selectedTile.color = getComputedStyle(document.querySelector('.light-grey'))
                            .backgroundColor;
                        this.selectedTile.solid = false;
                        this.selectedTile.passable = true; // Air is passable

                        this.selectedTile.durability = -2; // Air has no durability
                        // TODO sort htis out into an ablity system
                    }
                }

            }
        }

        // Update water animation timer
        this.waterAnimationTimer += delta;
        if (this.waterAnimationTimer >= this.waterAnimationInterval) {
            this.waterAnimationTimer -= this.waterAnimationInterval;
            this.waterAnimationFrame = (this.waterAnimationFrame + 1) % 5; // Cycle through 5 frames
        }

        // Update disturbed water tiles
        this.disturbedWaterTiles.forEach((data, tileKey) => {
            data.timer += delta;
            if (data.timer >= this.animationSpeed) {
                data.timer -= this.animationSpeed;
                data.frame++;
                if (data.frame > 4) {
                    data.frame = 0; // Loop back to start
                }
            }

            if (data.totalTimer >= this.disturbanceDuration) {
                this.disturbedWaterTiles.delete(tileKey); // Remove disturbance
            } else {
                data.totalTimer += delta;
            }
        });


    }
    toggleEditMode() {
        this.editMode = !this.editMode;
        this.selectedTile = this.getTileAtCoordinates(this.playerPosition.x, this.playerPosition.y);
    }
    setMapSize(worldType) {
        const world = gameWorlds[worldType];
        if (!world) {
            console.warn(`Unknown world type: ${worldType}, defaulting to flat`);
            world = gameWorlds.flat;
        }

        this.mapSize = {
            width: world.width,
            height: world.height,
            tileSize: world.tileSize
        };
        this.lengthOfRun = world.lengthOfRun;
    }
    generateTiles() {
        this.children.forEach(child => {
            this.removeChild(child);
        });

        switch (this.gameWorld) {
            case 'flat':
                return generateFlatWorld(this);
            case 'hills':
                return generateHillsWorld(this);
            case 'forest':
                return generateForestWorld(this);
            case 'shallowWater':
                return generateShallowWaterWorld(this);
            case 'sapForest':
                return generateSapForestWorld(this, this.lengthOfRun);
            case 'combined':
                return generateCombinedWorld(this, this.lengthOfRun);
            case 'underworld':
                return generateUnderworld(this);
            case 'ledge':
                return generateEarthLedge(this);
            default:
                console.warn(`Unknown world type: ${this.gameWorld}, defaulting to flat`);
                return generateFlatWorld(this);
        }
    }
    getTileAtCoordinates(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.tiles.find(tile => tile.x === tileX * this.tileSize && tile.y === tileY * this.tileSize);

        if (tile) {
            return tile;
        } else {
            return {
                type: 'border',
                solid: true,
                passable: false,
                breakable: false
            };
        }
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

        return {
            newSize,
            offsetX,
            offsetY
        };
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
                    tilesInRange.push({
                        x: targetX,
                        y: targetY
                    });
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
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const playerX = this.playerPosition.x;
        const playerY = this.playerPosition.y;

        const buffer = this.tileSize * 2; // Buffer to draw additional tiles offscreen

        this.tiles.forEach(tile => {
            // Cull tiles that are offscreen, including buffer
            if (tile.x + this.tileSize < playerX - canvasWidth / 2 - buffer ||
                tile.x > playerX + canvasWidth / 2 + buffer ||
                tile.y + this.tileSize < playerY - canvasHeight / 2 - buffer ||
                tile.y > playerY + canvasHeight / 2 + buffer) {
                return;
            }

            const {
                newSize,
                offsetX: tileOffsetX,
                offsetY: tileOffsetY
            } = this.updateTileVisibility(tile);
            const drawX = tile.x - offsetX + tileOffsetX;
            const drawY = tile.y - offsetY + tileOffsetY;

            // Get the correct tile image based on tile type
            let tileImage;
            let sourceX = 0;
            let sourceY = 0;
            let sourceSizeW = 64; // Size of the source tile in the tile sheet
            let sourceSizeH = 64; // Size of the source tile in the tile sheet

            switch (tile.type) {
                case 'wood':
                    switch (tile.variant) {
                        case 1:
                            tileImage = this.treeBark; // Use the wood tile texture with air adjacent
                            break;
                        case 2:
                            tileImage = this.woodTile2; // Use the wood tile texture with air adjacent
                            break;
                        default:
                            tileImage = this.woodTile;

                    }
                    break;
                case 'water':
                    tileImage = this.waterTileSheet;
                    sourceX = 0;

                    const tileKey = `${tile.x},${tile.y}`;
                    if (this.disturbedWaterTiles.has(tileKey)) {
                        // Use disturbance animation frame
                        sourceX = (this.disturbedWaterTiles.get(tileKey).frame * 96) % 480;
                    } else {
                        // Use base water tile (frame 0)
                        sourceX = 0;
                    }

                    sourceY = 0;
                    sourceSizeW = 96;
                    sourceSizeH = 96;
                    break;
                case 'earth':
                    if (tile.variant) {
                        switch (tile.variant) {
                            case 1:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX = 14; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 27; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 2:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    104; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 27; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 3:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    196; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 27; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 4:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    288; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 27; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 5:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    380; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 27; // Set the sourceY to the first row in the sheet (air above)
                                break;
                            case 6:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX = 14; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 129; // Set the sourceY to the first row in the sheet (air above)
                                sourceSizeH = 64;
                                break;

                            case 7:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    104; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 129; // Set the sourceY to the first row in the sheet (air above)
                                sourceSizeH = 64;
                                break;

                            case 8:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    196; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 129; // Set the sourceY to the first row in the sheet (air above)
                                sourceSizeH = 64;
                                break;

                            case 9:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    288; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 129; // Set the sourceY to the first row in the sheet (air above)
                                sourceSizeH = 64;
                                break;

                            case 10:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    380; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 129; // Set the sourceY to the first row in the sheet (air above)
                                sourceSizeH = 64;
                                break;
                            case 11:
                                tileImage = this
                                    .earthTileSheet; // Use the earth tile sheet texture with air above
                                sourceX =
                                    481; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 129; // Set the sourceY to the first row in the sheet (air above)
                                sourceSizeH = 64;
                                break;


                            case 12:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX = 0; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 4; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 13:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX = 124
                                sourceY = 4; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 14:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    248; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 4; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 15:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above    
                                sourceX =
                                    380; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 4; // Set the sourceY to the first row in the sheet (air above)

                                break;

                            case 16:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX = 8; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 120; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 17:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    134; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 120; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 18:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    256; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 120; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 19:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    384; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 120; // Set the sourceY to the first row in the sheet (air above)

                                break;

                            case 20:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX = 8; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 254; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 21:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    128; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 254; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 22:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    256; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 254; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 23:


                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    384; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 254; // Set the sourceY to the first row in the sheet (air above)

                                break;

                            case 24:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX = 8; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 364; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 25:


                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    128; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 364; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 26:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    256; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 364; // Set the sourceY to the first row in the sheet (air above)
                                break;

                            case 27:

                                tileImage = this
                                    .earthTileSheet2; // Use the earth tile sheet texture with air above
                                sourceX =
                                    384; // Set the sourceX to the second tile in the sheet (air above)
                                sourceY = 364; // Set the sourceY to the first row in the sheet (air above)

                                break;

                            default:
                                tileImage = this.earthTile;
                                break;
                        }

                    } else {
                        tileImage = this.earthTile;
                    }
                    break;
                case 'air':
                    tileImage = this.airTile;
                    break;
                case 'stone':
                    tileImage = this.stoneTile;
                    break;
                default:
                    // Fallback to color-based drawing if no image is available
                    this.drawSquare(ctx, drawX, drawY, newSize, tile.color);
                    return;
            }

            // Draw the tile image if it's loaded
            if (tileImage.complete) {
                try {
                    ctx.drawImage(
                        tileImage,
                        sourceX, sourceY, sourceSizeW, sourceSizeH, // Source rectangle
                        drawX, drawY, newSize, newSize // Destination rectangle
                    );
                } catch (e) {
                    // Fallback to color-based drawing if image drawing fails
                    this.drawSquare(ctx, drawX, drawY, newSize, tile.color);
                }
            } else {
                // Fallback to color-based drawing while image is loading
                this.drawSquare(ctx, drawX, drawY, newSize, tile.color);
            }
        });

        if (this.editMode) {
            this.highlightEditRange(ctx);
            this.highlightSelectedTile(ctx);
        }
    }
    disturbWater(x, y) {
        const tile = this.getTileAtCoordinates(x, y);
        if (tile && tile.type === 'water') {
            const tileKey = `${tile.x},${tile.y}`;
            if (!this.disturbedWaterTiles.has(tileKey)) {
                // Start disturbance animation
                this.disturbedWaterTiles.set(tileKey, {
                    frame: 1, // Start at frame 1 (after the base frame)
                    timer: 0,
                    totalTimer: 0
                });
            }
        }
    }

    cycleMapType() {
        const worldTypes = Object.keys(gameWorlds);
        const currentIndex = worldTypes.indexOf(this.gameWorld);
        const nextIndex = (currentIndex + 1) % worldTypes.length;
        const nextWorld = worldTypes[nextIndex];

        this.gameWorld = nextWorld;
        this.setMapSize(nextWorld);
        this.tiles = this.generateTiles();

        // Emit text display event instead of updating worldNameDisplay
        events.emit('DISPLAY_TEXT', {
            heading: gameWorlds[nextWorld].name,
            subheading: gameWorlds[nextWorld].subheading,
            paragraph: gameWorlds[nextWorld].paragraph
        });

        events.emit('MAP_CHANGED', this);
        console.log(`Map type changed to: ${nextWorld} (${this.mapSize.width}x${this.mapSize.height})`);
    }
    retreatMap() {
        const worldTypes = Object.keys(gameWorlds);
        const currentIndex = worldTypes.indexOf(this.gameWorld);

        if (currentIndex > 0) {
            const prevWorld = worldTypes[currentIndex - 1];
            this.gameWorld = prevWorld;

            this.setMapSize(prevWorld);
            this.tiles = this.generateTiles();

            // Set up world name display
            events.emit('DISPLAY_TEXT', {
                heading: gameWorlds[prevWorld].name,
                subheading: 'Maybe you should go back',
                paragraph: ''
            });

            events.emit('MAP_CHANGED', this); // Emit the map changed event with the new map type as data

            console.log(`Map type changed to: ${prevWorld} (${this.mapSize.width}x${this.mapSize.height})`);

        }
    }
    advanceMap() {
        const worldTypes = Object.keys(gameWorlds);
        const currentIndex = worldTypes.indexOf(this.gameWorld);

        if (currentIndex < worldTypes.length - 1) {
            const nextWorld = worldTypes[currentIndex + 1];

            this.gameWorld = nextWorld;
            this.setMapSize(nextWorld);

            this.tiles = this.generateTiles();

            // Set up world name display
            events.emit('DISPLAY_TEXT', {
                heading: gameWorlds[nextWorld].name,
                subheading: '',
                paragraph: gameWorlds[nextWorld].paragraph
            });

            events.emit('MAP_CHANGED', this); // Emit the map changed event with the new map type as data

            console.log(`Map type changed to: ${nextWorld} (${this.mapSize.width}x${this.mapSize.height})`);

        }
    }
}