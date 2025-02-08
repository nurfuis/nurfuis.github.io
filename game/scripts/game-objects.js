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
        this.tileSize = 64;
        this.canvas = canvas;
        this.mapSize = mapSize;
        this.camera = camera;
    }

    generateTile(x, y) {
        const noiseValue = perlin(x / 10, y / 10);
        let colorClass;
        let walkable = true;
        if (noiseValue < -0.2) {
            colorClass = 'dark-grey'; // Dark grey
            walkable = false;
        } else if (noiseValue < 0) {
            colorClass = 'grey'; // Grey
        } else if (noiseValue < 0.2) {
            colorClass = 'light-grey'; // Light grey
        } else {
            colorClass = 'brown'; // Brown
        }
        const color = getComputedStyle(document.querySelector(`.${colorClass}`)).backgroundColor;
        return { x, y, color, walkable };
    }

    drawImage(ctx, offsetX, offsetY) {
        const startX = Math.floor((offsetX) / this.tileSize);
        const startY = Math.floor((offsetY) / this.tileSize);
        const endX = startX + Math.ceil(this.mapSize.width / this.tileSize);
        const endY = startY + Math.ceil(this.mapSize.height / this.tileSize);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                // Check if the tile is within the map boundaries
                if (x * this.tileSize < this.mapSize.width &&
                    x * this.tileSize >= 0 &&
                    y * this.tileSize < this.mapSize.height &&
                    y * this.tileSize >= 0) {

                    const tile = this.generateTile(x, y);
                    ctx.fillStyle = tile.color;
                    ctx.fillRect(tile.x * this.tileSize - offsetX, tile.y * this.tileSize - offsetY, this.tileSize, this.tileSize);
                }
            }
        }
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
class Fort extends GameObject {
    constructor(x, y, size, colorClass, canvas, mapSize) {
        super(canvas);
        this.x = x;
        this.y = y;
        this.size = size;
        this.colorClass = colorClass;
        this.mapSize = mapSize;
        this.owner = null; // Initially neutral
        this.perceptionRange = 200; // Define the perception range
    }

    update() {
        // Fort-specific update logic
    }

    draw(ctx) {
        ctx.fillStyle = getComputedStyle(document.querySelector(`.${this.colorClass}`)).backgroundColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    capture(teamColor) {
        this.colorClass = teamColor;
        this.owner = teamColor;
    }
}
class Vehicle extends GameObject {
    constructor(x, y, size, capacity, speed, canvas, mapSize) {
        super(canvas);
        this.x = x;
        this.y = y;
        this.size = size;
        this.capacity = capacity;
        this.speed = speed;
        this.mapSize = mapSize;
        this.occupiedSeats = new Array(capacity).fill(null); // Initialize empty seats
        this.loadRange = 64; // Define the load range
        this.isMoving = false;
        this.colorClass = 'vehicle-color'; // Assign the vehicle-color class
        this.name = 'Vehicle'; // Assign a default name
        this.perceptionRange = 150; // Define the perception range
    }

    loadUnit(unit, seatIndex) {
        if (seatIndex >= 0 && seatIndex < this.capacity && !this.occupiedSeats[seatIndex]) {
            this.occupiedSeats[seatIndex] = unit;
            unit.isLoaded = true; // Add a flag to the unit to indicate it's loaded
            unit.vehicle = this; // Store the vehicle reference in the unit
            unit.seatIndex = seatIndex; // Store the seat index in the unit
            return true;
        }
        return false;
    }

    unloadUnit(seatIndex) {
        if (seatIndex >= 0 && seatIndex < this.capacity && this.occupiedSeats[seatIndex]) {
            const unit = this.occupiedSeats[seatIndex];
            unit.isLoaded = false;
            unit.vehicle = null;
            unit.seatIndex = null;
            unit.unloaded = true; // Add a flag to the unit to indicate it's been unloaded
            unit.turnsLoaded = 0; // Reset the turns loaded counter
            this.occupiedSeats[seatIndex] = null;

            // Update unit's position to reflect vehicle's position
            unit.x = this.x + seatIndex * (this.size / this.capacity); // Simple positioning
            unit.y = this.y + this.size;

            return true;
        }
        return false;
    }

    drive(keysPressed) {
        let dx = 0;
        let dy = 0;

        if (keysPressed.includes('w')) {
            dy -= 1;
        }
        if (keysPressed.includes('s')) {
            dy += 1;
        }
        if (keysPressed.includes('a')) {
            dx -= 1;
        }
        if (keysPressed.includes('d')) {
            dx += 1;
        }

        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
            dx /= magnitude;
            dy /= magnitude;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Constrain vehicle within the map boundaries
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.size > this.mapSize.width) this.x = this.mapSize.width - this.size;
        if (this.y + this.size > this.mapSize.height) this.y = this.mapSize.height - this.size;

        // Update unit positions if loaded
        this.occupiedSeats.forEach((unit, index) => {
            if (unit) {
                unit.x = this.x + index * (this.size / this.capacity); // Simple positioning
                unit.y = this.y + this.size;
            }
        });
    }

    draw(ctx) {
        ctx.fillStyle = getComputedStyle(document.querySelector(`.${this.colorClass}`)).backgroundColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // Optionally draw seat indicators
        for (let i = 0; i < this.capacity; i++) {
            if (!this.occupiedSeats[i]) {
                ctx.strokeStyle = 'white';
                ctx.strokeRect(this.x + i * (this.size / this.capacity), this.y, this.size / this.capacity, this.size);
            }
        }
    }
}
class FogOfWar extends GameObject {
    constructor(mapSize, tileSize) {
        super();
        this.mapSize = mapSize;
        this.tileSize = tileSize;
        this.fogLayer = this.createFogLayer();
    }

    createFogLayer() {
        const fogLayer = [];
        for (let y = 0; y < this.mapSize.height / this.tileSize; y++) {
            const row = [];
            for (let x = 0; x < this.mapSize.width / this.tileSize; x++) {
                row.push(true); // Initially, all tiles are covered by fog
            }
            fogLayer.push(row);
        }
        return fogLayer;
    }

    updateFog(units, vehicles, buildings) {
        // Reset fog layer
        this.fogLayer = this.createFogLayer();

        // Update fog based on units
        units.children.forEach(unit => {
            this.clearFog(unit.x, unit.y, unit.perceptionRange);
        });

        // Update fog based on vehicles
        vehicles.forEach(vehicle => {
            this.clearFog(vehicle.x, vehicle.y, vehicle.perceptionRange);
        });

        // Update fog based on buildings
        buildings.forEach(building => {
            this.clearFog(building.x, building.y, building.perceptionRange);
        });
    }

    clearFog(x, y, range) {
        const startX = Math.max(0, Math.floor((x - range) / this.tileSize));
        const startY = Math.max(0, Math.floor((y - range) / this.tileSize));
        const endX = Math.min(this.mapSize.width / this.tileSize, Math.ceil((x + range) / this.tileSize));
        const endY = Math.min(this.mapSize.height / this.tileSize, Math.ceil((y + range) / this.tileSize));

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                const dx = (j * this.tileSize + this.tileSize / 2) - x;
                const dy = (i * this.tileSize + this.tileSize / 2) - y;
                if (Math.sqrt(dx * dx + dy * dy) <= range) {
                    this.fogLayer[i][j] = false; // Clear fog in this tile
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black for fog
        for (let y = 0; y < this.fogLayer.length; y++) {
            for (let x = 0; x < this.fogLayer[y].length; x++) {
                if (this.fogLayer[y][x]) {
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
}

class CoverLayer extends GameObject {
    constructor(mapSize, tileSize) {
        super();
        this.mapSize = mapSize;
        this.tileSize = tileSize;
        this.coverLayer = this.createCoverLayer();
    }

    createCoverLayer() {
        const coverLayer = [];
        for (let y = 0; y < this.mapSize.height / this.tileSize; y++) {
            const row = [];
            for (let x = 0; x < this.mapSize.width / this.tileSize; x++) {
                row.push(false); // Initially, no tiles have cover
            }
            coverLayer.push(row);
        }
        return coverLayer;
    }

    addCover(x, y, width, height) {
        const startX = Math.max(0, Math.floor(x / this.tileSize));
        const startY = Math.max(0, Math.floor(y / this.tileSize));
        const endX = Math.min(this.mapSize.width / this.tileSize, Math.ceil((x + width) / this.tileSize));
        const endY = Math.min(this.mapSize.height / this.tileSize, Math.ceil((y + height) / this.tileSize));

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                this.coverLayer[i][j] = true; // Add cover to this tile
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(34, 139, 34, 0.75)'; // Semi-transparent green for cover
        for (let y = 0; y < this.coverLayer.length; y++) {
            for (let x = 0; x < this.coverLayer[y].length; x++) {
                if (this.coverLayer[y][x]) {
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
}