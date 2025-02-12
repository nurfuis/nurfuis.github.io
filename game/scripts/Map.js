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
        this.screenNumber = 0; // Initialize screen number to 0 

        events.on('PLAYER_POSITION', this, (data) => {
        });
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
                    console.log(rows)
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
                } else{
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

    drawImage(ctx, offsetX, offsetY) {
        this.tiles.forEach(tile => {
            const drawX = tile.x - offsetX;
            const drawY = tile.y - offsetY;
            this.drawSquare(ctx, drawX, drawY, this.tileSize, tile.color);
        });
    }
}