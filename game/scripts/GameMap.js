const rarityRates = [0.01, 0.05, 0.1, 0.2, 0.3]; // Rarity rates for each rarity level
const rarityLabels = ['legendary', 'epic', 'rare', 'uncommon', 'common']; // Rarity labels for each rarity level



class GameMap extends GameObject {
    constructor(canvas, camera, mapSize) {
        super(canvas);
        this.x = 0;
        this.y = 0;
        this.tileSize = mapSize.tileSize; // Size of the square tiles
        this.canvas = canvas;
        this.mapSize = mapSize;
        this.camera = camera;
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

        events.on('PLAYER_POSITION', this, (data) => {
            this.playerPosition = data;
            if (this.editMode) {
                this.selectedTile = this.getTileAtCoordinates(this.playerPosition.x, this.playerPosition.y);
            }
        });

        events.on('EDIT_TILES', this, () => {
            this.toggleEditMode();
        });

        // gameItems.forEach(item => {
        //     const gameItem = new GameItem(item.itemName, item.description, item.image, item.value, item
        //         .rarity);
        //     gameItem.position = new Vector2(0,
        //     0); // Set the position of the item to the current tile's position
        //     this.addChild(gameItem);
        // });

        // Add water disturbance tracking
        this.disturbedWaterTiles = new Map(); // Map of {tileKey: animationFrame}
        this.disturbanceDuration = 1500; // How long the disturbance lasts (ms)
        this.animationSpeed = 200; // Time between animation frames (ms)
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

    generateTiles() {
        const tiles = [];
        const rows = Math.ceil(this.mapSize.height / this.tileSize);
        const cols = Math.ceil(this.mapSize.width / this.tileSize);

        // First pass: Generate all tiles
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

                if (noiseValue > 0.2) {
                    colorClass = 'brown'; // Brown
                    type = 'earth';
                    solid = true;
                    passable = false; // Hills are not passable
                    breakable = false; // Hills are not breakable
                    climbable = true; // Hills are climbable
                } else if (noiseValue < -0.2) {
                    colorClass = 'dark-grey'; // Dark grey
                    type = 'water';
                    solid = false;
                } else if (noiseValue < 0) {
                    colorClass = 'grey'; // Grey
                    type = 'wood';
                    solid = true;
                    passable = false;
                } else {
                    colorClass = 'light-grey'; // Light grey
                    type = 'air';
                    durability = 100;
                    breakable = false; // Air is not breakable
                }

                const color = getComputedStyle(document.querySelector(`.${colorClass}`)).backgroundColor;
                const drawX = x * this.tileSize;
                const drawY = y * this.tileSize;

                tiles.push({
                    x: drawX,
                    y: drawY,
                    color,
                    solid,
                    type,
                    passable,
                    durability,
                    climbable,
                    breakable
                });
            }
        }

        let itemCount = 0;
        let itemLimit = gameItems.length - 1; // Set the item limit to the number of items in the gameItems array
        // let itemLimit = gameItems.length - 1; // Set the item limit to the number of items in the gameItems array


        // Second pass: Add objects based on tile relationships
        for (let y = 1; y < rows; y++) { // Start from 1 to check tile above
            for (let x = 0; x < cols; x++) {
                const currentIndex = y * cols + x;
                const tileAboveIndex = (y - 1) * cols + x;
                const tileBelowIndex = (y + 1) * cols + x;
                const currentTile = tiles[currentIndex];
                const tileAbove = tiles[tileAboveIndex];
                const tileBelow = tiles[tileBelowIndex];
                const tileLeft = tiles[currentIndex - 1]; // Tile to the left of the current tile
                const tileRight = tiles[currentIndex + 1]; // Tile to the right of the current tile



                // Check for earth tile with air above
                if (currentTile.type === 'earth' && tileAbove.type === 'air') {
                    const random = Math.random();
                    if (random < 0.05) { // 15% chance to spawn a seed
                        const seed = new Seed(this.canvas, new Vector2(
                            currentTile.x,
                            currentTile.y - this.tileSize
                        ));
                        this.addChild(seed);
                    }
                    if (random > 0.05 && random < 0.1) { 
                        const obstacle = new EvasiveUnit(this.canvas, new Vector2(currentTile.x, currentTile.y - this.tileSize), new Vector2(this.tileSize, this.tileSize), 'obstacle');
                        this.addChild(obstacle);
                    }
                }


                if (currentTile.type === 'earth' && tileAbove.type === 'earth') {
                    const random = Math.random();
                    if (random < 0.05) { // 15% chance to spawn a seed
                        const acorn = new Acorn(this.canvas, new Vector2(currentTile.x, currentTile.y - this
                            .tileSize));
                        this.addChild(acorn);
                    }
                }


                if (!!tileBelow && !!tileAbove) { // Ensure tileBelow and tileAbove are defined

                    const random = Math.random();


                    if (currentTile.type === 'air' && tileBelow.solid && itemCount <
                        itemLimit
                    ) { // Check if the current tile is air and the tile below is solid and the item count is less than the item limit
                        if (random < gameItems[itemCount].rarity) { // 15% chance to spawn a seed
                            const item = new GameItem(gameItems[itemCount].itemName, gameItems[itemCount]
                                .description, gameItems[itemCount].image, gameItems[itemCount].value, gameItems[
                                    itemCount].rarity);
                            item.position = new Vector2(currentTile.x, currentTile
                                .y); // Set the position of the item to the current tile's position
                            this.addChild(item); // Add the item to the map's children array
                            itemCount++; // Increment the item count to move to the next item in the gameItems array
                        }
                    }

                    if (currentTile.type === 'air' && tileAbove.type === 'air' && tileBelow.type === 'air') {
                        if (random < 0.05) { // 5% chance to spawn a feyLight
                            const feyLight = new FeyLight(this.canvas, new Vector2(currentTile.x, currentTile.y));
                            this.addChild(feyLight);
                        }
                    }

                    if (currentTile.type === 'water' && tileBelow.type == 'wood' && random > 0.1 && random < 0.15) {
                        const anemone = new Anemone(this.canvas, new Vector2(currentTile.x, currentTile.y));
                        this.addChild(anemone);
                    }
                }


                if (tileLeft && tileRight && tileAbove && tileBelow) { // Ensure tileLeft and tileRight are defined
                    if (currentTile.type === 'air' && tileLeft.type === 'air' && tileRight.type === 'air' &&
                        tileAbove.type === 'air' && tileBelow.type === 'air') {
                        const random = Math.random(); // Generate a random number between 0 and 1
                        if (random < 0.05) {
                            const patrol = new PatrolUnit(this.canvas, new Vector2(currentTile.x, currentTile.y));
                            this.addChild(patrol);
                        }
                    }
                }


                const random = Math.random();


                if (currentTile.type === 'wood' && random < 0.05) {
                    const sap = new Sap(this.canvas, new Vector2(currentTile.x, currentTile.y));
                    this.addChild(sap);
                }


                if (currentTile.type === 'water' && random < 0.05) {
                    const air = new AirBubble(this.canvas, new Vector2(currentTile.x, currentTile.y));
                    this.addChild(air);
                }


                if (currentTile.type === 'water' && random > 0.05 && random < 0.1) {
                    const luminaSphere = new LuminaSphere(this.canvas, new Vector2(currentTile.x, currentTile.y));
                    this.addChild(luminaSphere);
                }



            }
        }

        for (let y = 1; y < rows; y++) { // Start from 1 to check tile above
            for (let x = 0; x < cols; x++) {
                const currentIndex = y * cols + x;
                const tileAboveIndex = (y - 1) * cols + x;
                const tileBelowIndex = (y + 1) * cols + x;
                const currentTile = tiles[currentIndex];
                const tileAbove = tiles[tileAboveIndex];
                const tileBelow = tiles[tileBelowIndex];
                const tileLeft = tiles[currentIndex - 1]; // Tile to the left of the current tile
                const tileRight = tiles[currentIndex + 1]; // Tile to the right of the current tile

                function randomInt(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                if (tileAbove && tileBelow && currentTile.type === 'earth' && tileAbove.type === 'air') {

                    currentTile.alernateImage = randomInt(1,
                        5); // Set the image of the current tile to the earth tile texture with air above
                }
                if (tileAbove && tileBelow && currentTile.type === 'earth' && tileBelow.type === 'air') {

                    currentTile.alernateImage = randomInt(6,
                        11); // Set the image of the current tile to the earth tile texture with air above
                }
                if (tileAbove && tileBelow && currentTile.type === 'earth' && tileAbove.type === 'earth' &&
                    tileBelow.type === 'earth') {
                    const random = Math.random(); // Generate a random number between 0 and 1
                    if (random < 0.5) {
                        currentTile.alernateImage = randomInt(12,
                            27); // Set the image of the current tile to the earth tile texture with air above
                    }
                }

                if (currentTile.type === 'wood') {
                    const random = Math.random(); // Generate a random number between 0 and 1
                    if (random < 0.5) { // 50% chance to set the image to the wood tile texture with air adjacent
                        currentTile.alernateImage =
                            2; // Set the image of the current tile to the wood tile texture with air adjacent
                    }

                    if (tileLeft && tileRight && tileAbove &&
                        tileBelow) { // Ensure tileLeft and tileRight are defined
                        const airUp = tileAbove.type === 'air'; // Check if the tile above is air
                        const airDown = tileBelow.type === 'air'; // Check if the tile below is air
                        const airLeft = tileLeft.type === 'air'; // Check if the tile to the left is air
                        const airRight = tileRight.type === 'air'; // Check if the tile to the right is air

                        if (airUp || airDown || airLeft || airRight) { // Check if any of the adjacent tiles are air
                            currentTile.alernateImage =
                                1; // Set the image of the current tile to the wood tile texture with air adjacent
                        }
                    }
                }

                if (currentTile.type === 'water') {
                    const tileIndex = randomInt(1, 5);
                    currentTile.alernateImage =
                        tileIndex; // Set the image of the current tile to the water tile texture with air adjacent   
                }
            }
        }

        return tiles;
    }

    getTileAtCoordinates(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        const tile = this.tiles.find(tile => tile.x === tileX * this.tileSize && tile.y === tileY * this.tileSize);

        if (tile) {
            return tile;
        } else {
            return {
                name: 'border',
                solid: true,
                passable: false,
                breakable: false
            };
        }
    }
    getSurfaceTileAt(x, y) {
        

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
                    switch (tile.alernateImage) {
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
                    if (tile.alernateImage) {
                        switch (tile.alernateImage) {
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
}