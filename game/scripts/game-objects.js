class GameObject {
    position;
    children;
    parent;
    hasReadyBeenCalled;

    constructor() {
        this.position = new Vector2(0, 0);
        this.children = [];
        this.parent = null;
        this.hasReadyBeenCalled = false;
    }
    get center() {
        if (this.position && this.width && this.height) {
            const x = Math.floor(this.position.x + this.width / 2);
            const y = Math.floor(this.position.y + this.height / 2);
            return new Vector2(x, y);
        } else {
            return this.position.duplicate();
        }
    }
    stepEntry(delta, root) {
        this.children.forEach((child) => child.stepEntry(delta, root));

        if (!this.hasReadyBeenCalled) {
            this.hasReadyBeenCalled = true;
            this.ready();
        }
        this.step(delta, root);
    }

    draw(ctx, x, y) {
        const drawPosX = x + this.position.x;
        const drawPosY = y + this.position.y;

        this.drawImage(ctx, drawPosX, drawPosY);

        this.children.forEach((child) => child.draw(ctx, drawPosX, drawPosY));
    }

    ready() {
        // ...
    }

    step(delta, root) {
        // ...
    }

    drawImage(ctx, drawPosX, drawPosY) {
        // ...
    }

    destroy() {
        this.children.forEach((child) => child.destroy());
        this.parent.removeChild(this);
    }

    addChild(gameObject) {
        gameObject.parent = this;
        this.children.push(gameObject);
    }

    removeChild(gameObject) {
        events.unsubscribe(gameObject);
        this.children = this.children.filter((g) => g !== gameObject);
    }
}
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
                if (noiseValue < -0.2) {
                    colorClass = 'dark-grey'; // Dark grey
                    type = 'water';
                } else if (noiseValue < 0) {
                    colorClass = 'grey'; // Grey
                    type = 'grass';
                } else if (noiseValue < 0.2) {
                    colorClass = 'light-grey'; // Light grey
                    type = 'rock';
                } else {
                    colorClass = 'brown'; // Brown
                    type = 'hill';
                    walkable = true;

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
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        const index = row * Math.ceil(this.mapSize.width / this.tileSize) + col;
        return this.tiles[index];
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

class Team extends GameObject {
    constructor(colorClass, canvas) {
        super(canvas);
        this.colorClass = colorClass;
    }

    addUnit(unit) {
        this.addChild(unit);
    }

    update() {
        super.update();
    }

    draw(ctx) {
        super.draw(ctx);
    }
}
class Particle {
    constructor(x, y, size, lifetime) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifetime = lifetime;
        this.age = 0;
    }

    update() {
        this.age++;
        if (this.age > this.lifetime) {
            this.size = 0;
        }
    }

    draw(ctx) {
        if (this.size > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.age / this.lifetime})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

