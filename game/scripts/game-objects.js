class GameObject {
    constructor(canvas, camera) {
        this.children = [];
        this.canvas = canvas;
        this.camera = camera;
    }

    addChild(child) {
        this.children.push(child);
    }

    update() {
        this.children.forEach(child => child.update());
    }

    draw(ctx) {
        this.children.forEach(child => child.draw(ctx));
    }
}

class Map extends GameObject {
    constructor(canvas, camera) {
        super(canvas, camera);
        this.x = 0;
        this.y = 0;
        this.tileSize = 64;
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

    drawMap(ctx, offsetX, offsetY, canvas) {
        const startX = Math.floor(offsetX / this.tileSize);
        const startY = Math.floor(offsetY / this.tileSize);
        const endX = startX + Math.ceil(canvas.width / this.tileSize);
        const endY = startY + Math.ceil(canvas.height / this.tileSize);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const tile = this.generateTile(x, y);
                ctx.fillStyle = tile.color;
                ctx.fillRect(tile.x * this.tileSize - offsetX, tile.y * this.tileSize - offsetY, this.tileSize, this.tileSize);
            }
        }
    }
    update() {
        super.update();
    }

    draw(ctx) {
        this.drawMap(ctx, this.camera.x, this.camera.y, this.canvas);
        super.draw(ctx);
    }
}

class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, canvas, camera, mapSize, level = 1, experience = 0, health = 100) {
        super(canvas, camera);
        this.x = x;
        this.y = y;
        this.size = size;
        this.colorClass = colorClass;
        this.speed = speed;
        this.name = name;
        this.speedBoost = 1;
        this.targetPosition = null;
        this.maxDistance = 192; // Maximum distance the unit can move
        this.mapSize = mapSize; // Map size for boundary checks
        this.health = health; // Add health property
        this.level = level; // Add level property
        this.experience = experience; // Add experience property
        this.maxHealth = 100; // Assuming max health is 100
    }

    update() {
        // Move towards the target position if it exists
        if (this.targetPosition) {
            const dx = this.targetPosition.x - this.x;
            const dy = this.targetPosition.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                this.x = this.targetPosition.x;
                this.y = this.targetPosition.y;
                this.targetPosition = null;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }

            // Constrain within the map boundaries
            if (this.x < 0) {
                this.x = 0;
            } else if (this.x + this.size > this.mapSize.width) {
                this.x = this.mapSize.width - this.size;
            }

            if (this.y < 0) {
                this.y = 0;
            } else if (this.y + this.size > this.mapSize.height) {
                this.y = this.mapSize.height - this.size;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = getComputedStyle(document.querySelector(`.${this.colorClass}`)).backgroundColor;
        ctx.fillRect(this.x - this.camera.x, this.y - this.camera.y, this.size, this.size);
    }

    move(dx, dy) {
        // Normalize the movement vector
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        }

        this.x += dx * this.speed * this.speedBoost;
        this.y += dy * this.speed * this.speedBoost;

        // Constrain within the map boundaries
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.size > this.mapSize.width) {
            this.x = this.mapSize.width - this.size;
        }

        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.size > this.mapSize.height) {
            this.y = this.mapSize.height - this.size;
        }
    }

    canMoveTo(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.maxDistance && targetX >= 0 && targetX <= this.mapSize.width - this.size && targetY >= 0 && targetY <= this.mapSize.height - this.size;
    }
}

class Team extends GameObject {
    constructor(colorClass, canvas, camera) {
        super(canvas, camera);
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
    constructor(x, y, size, lifetime, camera) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifetime = lifetime;
        this.age = 0;
        this.camera = camera;
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
            ctx.arc(this.x - this.camera.x, this.y - this.camera.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}