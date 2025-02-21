    function generateUnderworld(world) {
        const tiles = [];
        const rows = Math.ceil(world.height / world.tileSize);
        const cols = Math.ceil(world.width / world.tileSize);

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
                const drawX = x * world.tileSize;
                const drawY = y * world.tileSize;

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

                let startingTile = false;

                // Check for earth tile with air above
                if (currentTile.type === 'earth' && tileAbove.type === 'air') {

                    if (startingTile === false && y > 10) { // Check if the starting tile has been set yet
                        startingTile = true; // Set the starting tile flag to true
                        currentTile.worldSpawnPoint = true;
                    }

                    const random = Math.random();
                    if (random < 0.05) { // 15% chance to spawn a seed
                        const seed = new Seed(world.canvas, new Vector2(
                            currentTile.x,
                            currentTile.y - world.tileSize
                        ));
                        world.addChild(seed);
                    }

                }


                if (currentTile.type === 'earth' && tileAbove.type === 'earth') {
                    const random = Math.random();
                    if (random < 0.05) { // 15% chance to spawn a seed
                        const acorn = new Acorn(world.canvas, new Vector2(currentTile.x, currentTile.y - world.tileSize));
                        world.addChild(acorn);
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
                            world.addChild(item); // Add the item to the world's children array
                            itemCount++; // Increment the item count to move to the next item in the gameItems array
                        }
                    }

                    if (currentTile.type === 'air' && tileAbove.type === 'air' && tileBelow.type === 'air') {
                        if (random < 0.05) { // 5% chance to spawn a feyLight
                            const feyLight = new FeyLight(world.canvas, new Vector2(currentTile.x, currentTile.y));
                            world.addChild(feyLight);
                        }
                    }

                    if (currentTile.type === 'water' && tileBelow.type == 'wood' && random > 0.1 && random < 0.15) {
                        const anemone = new Anemone(world.canvas, new Vector2(currentTile.x, currentTile.y));
                        world.addChild(anemone);
                    }
                }


                if (tileLeft && tileRight && tileAbove && tileBelow) { // Ensure tileLeft and tileRight are defined
                    if (currentTile.type === 'air' && tileLeft.type === 'air' && tileRight.type === 'air' &&
                        tileAbove.type === 'air' && tileBelow.type === 'air') {
                        const random = Math.random(); // Generate a random number between 0 and 1
                        if (random < 0.05) {
                            const patrol = new PatrolUnit(world.canvas, new Vector2(currentTile.x, currentTile.y));
                            world.addChild(patrol);
                        }
                    }
                }


                const random = Math.random();


                if (currentTile.type === 'wood' && random < 0.05) {
                    const sap = new Sap(world.canvas, new Vector2(currentTile.x, currentTile.y));
                    world.addChild(sap);
                }
                if (random > 0.05 && random < 0.1 && currentTile.type === 'wood') { 
                    const obstacle = new EvasiveUnit(world.canvas, new Vector2(currentTile.x, currentTile.y), new Vector2(world.tileSize, world.tileSize), 'obstacle');
                    world.addChild(obstacle);
                }

                if (currentTile.type === 'water' && random < 0.05) {
                    const air = new AirBubble(world.canvas, new Vector2(currentTile.x, currentTile.y));
                    world.addChild(air);
                }


                if (currentTile.type === 'water' && random > 0.05 && random < 0.1) {
                    const luminaSphere = new LuminaSphere(world.canvas, new Vector2(currentTile.x, currentTile.y));
                    world.addChild(luminaSphere);
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


                if (tileAbove && tileBelow && currentTile.type === 'earth' && tileAbove.type === 'air') {

                    currentTile.variant = randomInt(1,
                        5); // Set the image of the current tile to the earth tile texture with air above
                }
                if (tileAbove && tileBelow && currentTile.type === 'earth' && tileBelow.type === 'air') {

                    currentTile.variant = randomInt(6,
                        11); // Set the image of the current tile to the earth tile texture with air above
                }
                if (tileAbove && tileBelow && currentTile.type === 'earth' && tileAbove.type === 'earth' &&
                    tileBelow.type === 'earth') {
                    const random = Math.random(); // Generate a random number between 0 and 1
                    if (random < 0.5) {
                        currentTile.variant = randomInt(12,
                            27); // Set the image of the current tile to the earth tile texture with air above
                    }
                }

                if (currentTile.type === 'wood') {
                    const random = Math.random(); // Generate a random number between 0 and 1
                    if (random < 0.5) { // 50% chance to set the image to the wood tile texture with air adjacent
                        currentTile.variant =
                            2; // Set the image of the current tile to the wood tile texture with air adjacent
                    }

                    if (tileLeft && tileRight && tileAbove &&
                        tileBelow) { // Ensure tileLeft and tileRight are defined
                        const airUp = tileAbove.type === 'air'; // Check if the tile above is air
                        const airDown = tileBelow.type === 'air'; // Check if the tile below is air
                        const airLeft = tileLeft.type === 'air'; // Check if the tile to the left is air
                        const airRight = tileRight.type === 'air'; // Check if the tile to the right is air

                        if (airUp || airDown || airLeft || airRight) { // Check if any of the adjacent tiles are air
                            currentTile.variant =
                                1; // Set the image of the current tile to the wood tile texture with air adjacent
                        }
                    }
                }

                if (currentTile.type === 'water') {
                    const tileIndex = randomInt(1, 5);
                    currentTile.variant =
                        tileIndex; // Set the image of the current tile to the water tile texture with air adjacent   
                }
            }
        }
        events.emit('MAP_GENERATED', tiles); // Emit the world generated event with the tiles array as data
        return tiles;
    }