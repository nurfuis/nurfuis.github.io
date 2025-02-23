const world = 'superFlat';

const gameWorlds = {
    superFlat: {
        type: 'superFlat',
        name: 'Super Flat Land',
        paragraph: 'A land of flat land.',
        width: 512 * 20,
        height: 512,
        tileSize: 32,
        lengthOfRun: 20,
    }
};

class GameMap extends GameObject {
    constructor(canvas, type = 'flat') {
        super(canvas);
        this.x = 0;
        this.y = 0;

        this.canvas = canvas;

        this.type = type;

        this.tiles = [];

        for (let x = 0; x < this.width / this.tileSize; x++) {
            for (let y = 0; y < this.height / this.tileSize; y++) {
                this.tiles.push({
                    type: 'air',
                    variant: 0,
                    x: x * this.tileSize,
                    y: y * this.tileSize,
                    solid: false,
                    passable: true,
                    breakable: false,
                    color: 'rgba(0, 0, 0, 0)'
                });
            }
        }

        if (world) {
            this.initializeGameWorld(world);
            this.tiles = this.generateTiles(world);
        }

        this.waterAnimationTimer = 0;
        this.waterAnimationInterval = 1400; // Cycle every 200ms
        this.waterAnimationFrame = 0;


        this.lengthOfRun = 20;

        events.on('ADVANCE_MAP', this, () => {
            this.advanceMap(); // Call the advanceMap method when the event is triggered
        });

        events.on('RETREAT_MAP', this, () => {
            this.retreatMap(); // Call the retreatMap method when the event is triggered
        });

        events.on('CHANGE_GAME_WORLD', this, (data) => {

            console.log('Changing game world to ' + data.world);

            this.initializeGameWorld(data.world);
        });

        // Add water disturbance tracking
        this.disturbedWaterTiles = new Map(); // world of {tileKey: animationFrame}
        this.disturbanceDuration = 1500; // How long the disturbance lasts (ms)
        this.animationSpeed = 200; // Time between animation frames (ms)

        this.gravity = 0;

        this.width = this.width;
        this.height = this.height;
        this.tileSize = this.tileSize;


    }

    initializeGameWorld(world) {
        const worldData = gameWorlds[world];

        if (!worldData) {
            throw new Error(`Game world "${worldName}" not found!`); // Throw an error
        }

        Object.assign(this, worldData);

        this.tiles = this.generateTiles(this.type);

    }

    ready() {
        events.emit('DISPLAY_TEXT', {
            heading: this.name,
            subheading: this.subheading,
            paragraph: this.paragraph
        });
    }

    step(delta, root) {
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
    setTile(x, y, tile) {
        let newTile = tile;

        newTile.x = x * this.tileSize;
        newTile.y = y * this.tileSize;

        const oldTile = this.getTileAtCoordinates(x * this.tileSize, y * this.tileSize);

        Object.assign(oldTile, tile);

        return true;
    }
    generateTiles(world) {

        this.children.forEach(child => {
            this.removeChild(child);
        });

        switch (world) {
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
            case 'poolWater':
                return generatePoolWater(this);
            case 'columnWater':
                return generateColumnWater(this);
            case 'superFlat':
                return makeSuperFlat(this);
            default:
                console.warn(`Unknown world type: ${this.world}, defaulting to flat`);
                return generateFlatWorld(this);
        }
    }

    getEmptyTileAbove(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        for (let i = tileY; i >= 0; i--) {
            const tile = this.getTileAtCoordinates(tileX * this.tileSize, i * this.tileSize);
            if (!tile.solid) {
                return tile;
            }
        }

        return null;
    }

    getJumpTarget(x, y, range) {

        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        let index = 0;
        let tiles = [];

        for (let i = tileY; i < this.height / this.tileSize; i++) {
            const tile = this.getTileAtCoordinates(tileX * this.tileSize, i * this.tileSize);

            tiles.push(tile);

            index++;

            if (index >= range) {
                // return the air tile above a solid tile or the last tile if no solid tile is found
                const solidTile = tiles.find(tile => tile.solid);
                if (solidTile) {
                    return this.getEmptyTileAbove(solidTile.x, solidTile.y);
                } else {
                    return tiles[tiles.length - 1];
                }
            }
        }
    }

    getFallTarget(x, y) {

        let index = 0;
        let tiles = [];

        const tileY = Math.floor(y / this.tileSize);

        tiles.push(tile);

        index++;

        for (let i = tileY; i < this.height / this.tileSize; i++) {

            const solidTile = tiles.find(tile => tile.solid);

            if (solidTile) {
                return this.getEmptyTileAbove(solidTile.x, solidTile.y);
            } else {
                return tiles[tiles.length - 1];
            }
        }

        return null;

    }

    getWaterTileBelow(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        for (let i = tileY; i < this.height / this.tileSize; i++) {
            const tile = this.getTileAtCoordinates(tileX * this.tileSize, i * this.tileSize);
            if (tile.type === 'water') {
                return tile;
            }
        }

        return null;
    }

    getSolidTileBelow(x, y) {

        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        let tiles = [];

        for (let i = tileY; i < this.height / this.tileSize; i++) {
            const tile = this.getTileAtCoordinates(tileX * this.tileSize, i * this.tileSize);

            tiles.push(tile);


            if (tile.solid) {
                return tile;
            }
        }

        return null;


    }

    getTileBelow(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        const tile = this.getTileAtCoordinates(tileX * this.tileSize, (tileY + 1) * this.tileSize);
        return tile;

    }

    getTileAtCoordinates(x, y) {

        const findX = Math.floor(x / this.tileSize) * this.tileSize;
        const findY = Math.floor(y / this.tileSize) * this.tileSize;

        const tile = this.tiles.find(tile => tile.x === findX && tile.y === findY);

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

    getTileAt(x, y) {
        return this.getTileAtCoordinates(x, y);
    }

    drawTile(ctx, tile, drawX, drawY, size) {
        const coords = Resources.getTileVariant(tile.type, tile.variant);

        if (!coords) {
            // fill with tile.color 
            this.drawSquare(ctx, drawX, drawY, size, tile.color);
            return;
        }

        const img = Resources.getImage(tile.type);

        ctx.drawImage(
            img,
            coords.x, coords.y, coords.w, coords.h,
            drawX, drawY, size, size
        );
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

    drawImage(ctx, offsetX, offsetY) {
        // Add debug logging

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        let x = this.x;
        let y = this.y;

        if (!!this.player) {
            x = this.player.position.x;
            y = this.player.position.y;
        }

        const buffer = this.tileSize * 2;

        this.tiles.forEach((tile, index) => {
            // Add position debugging
            if (!tile) {
                console.warn(`Empty tile at index ${index}`);
                return;
            }

            // Debug tile culling
            const isCulled = tile.x + this.tileSize < x - canvasWidth / 2 - buffer ||
                tile.x > x + canvasWidth / 2 + buffer ||
                tile.y + this.tileSize < y - canvasHeight / 2 + buffer;

            if (isCulled) {
                return;
            }

            const {
                newSize,
                offsetX: tileOffsetX,
                offsetY: tileOffsetY
            } = this.updateTileVisibility(tile);

            const drawX = tile.x - offsetX + tileOffsetX;
            const drawY = tile.y - offsetY + tileOffsetY;

            this.drawTile(ctx, tile, drawX, drawY, newSize);
        });
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

        const currentIndex = worldTypes.indexOf(this.type);

        const nextIndex = (currentIndex + 1) % worldTypes.length;

        const nextWorld = worldTypes[nextIndex];

        this.initializeGameWorld(nextWorld);

        this.tiles = this.generateTiles(nextWorld);

        events.emit('DISPLAY_TEXT', {
            heading: this.name,
            subheading: this.subheading,
            paragraph: this.paragraph
        });

        events.emit('MAP_CHANGED', this);
        console.log(`world type changed to: ${nextWorld} (${this.width}x${this.height})`);
    }

    retreatMap() {
        const worldTypes = Object.keys(gameWorlds);

        const currentIndex = worldTypes.indexOf(this.type);

        if (currentIndex > 0) {
            const prevWorld = worldTypes[currentIndex - 1];


            this.initializeGameWorld(prevWorld);

            this.tiles = this.generateTiles(prevWorld);

            // Set up world name display
            events.emit('DISPLAY_TEXT', {
                heading: this.name,
                subheading: this.subheading,
                paragraph: this.paragraph
            });

            events.emit('MAP_CHANGED', this); // Emit the world changed event with the new world type as data

            console.log(`world type changed to: ${prevWorld} (${this.width}x${this.height})`);

        }
    }

    advanceMap() {
        const worldTypes = Object.keys(gameWorlds);

        const currentIndex = worldTypes.indexOf(this.type);

        if (currentIndex < worldTypes.length - 1) {
            const nextWorld = worldTypes[currentIndex + 1];


            this.initializeGameWorld(nextWorld);

            this.tiles = this.generateTiles(nextWorld);

            // Set up world name display
            events.emit('DISPLAY_TEXT', {
                heading: this.name,
                subheading: '',
                paragraph: this.paragraph
            });

            events.emit('MAP_CHANGED', this); // Emit the world changed event with the new world type as data

            console.log(`world type changed to: ${nextWorld} (${this.width}x${this.height})`);

        }
    }

    get player() {
        return this.parent.player;
    }
}