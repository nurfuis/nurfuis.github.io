class EvasiveUnit extends GameObject {
    constructor(canvas, position) {
        super(canvas);
        this.position = position;
        this.baseSize = 32; // Reduced to actual sprite size
        this.currentSize = this.baseSize;
        this.padding = 8; // Add padding (32 pixels of padding in 64px frame)

        // Sprite properties
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'images/blob.png';
        this.frameWidth = 64;  // Total frame width including padding
        this.frameHeight = 64; // Total frame height including padding
        this.spriteSize = 48;  // Actual sprite size within frame
        this.frameX = 0;
        this.frameY = 0;
        this.animationTimer = 0;
        this.animationSpeed = 250; // ms per frame
        this.facingDirection = 'down';

        // Movement properties
        this.isMoving = false;
        this.speed = 2;
        this.targetPosition = null;
        this.initialTile = null;
        this.evasionRange = 256; // Distance at which unit starts evading
        this.playerPosition = null;

        // Track player position
        events.on("PLAYER_POSITION", this, (data) => {
            const distance = Math.sqrt(
                (this.position.x - data.x) ** 2 +
                (this.position.y - data.y) ** 2
            );

            if (distance <= this.evasionRange) {
                this.playerPosition = new Vector2(data.x, data.y);
            } else {
                this.playerPosition = null;
            }
        });
    }
    ready() {
        const tile = this.parent.getTileAtCoordinates(this.position.x, this.position.y);
        this.initialTile = tile;
    }
    getNeighborTiles(root) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
        ];

        const tileSize = root.mapSize.tileSize;

        for (const direction of directions) {
            const neighborX = this.position.x + direction.x * tileSize;
            const neighborY = this.position.y + direction.y * tileSize;
            const neighborTile = root.map.getTileAtCoordinates(neighborX, neighborY);

            if (neighborTile && neighborTile.type === this.initialTile.type) {
                neighbors.push(neighborTile);
            } else {
                neighbors.push(null);
            }
        }

        return neighbors;
    }

    findFurthestTile(neighbors) {
        if (!this.playerPosition) return null;

        let maxDistance = -1;
        let bestTile = null;

        neighbors.forEach(tile => {
            if (!tile) return;

            const distance = Math.sqrt(
                (tile.x - this.playerPosition.x) ** 2 +
                (tile.y - this.playerPosition.y) ** 2
            );

            if (distance > maxDistance) {
                maxDistance = distance;
                bestTile = tile;
            }
        });

        return bestTile;
    }

    updateAnimation(delta) {
        this.animationTimer += delta;

        if (this.isMoving) {
            // Update animation frame
            if (this.animationTimer >= this.animationSpeed) {
                this.frameX = (this.frameX + 1) % 3;
                this.animationTimer = 0;
            }

            // Update facing direction based on movement
            if (this.targetPosition) {
                const dx = this.targetPosition.x - this.position.x;
                const dy = this.targetPosition.y - this.position.y;

                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal movement dominates
                    this.facingDirection = dx > 0 ? 'right' : 'left';
                } else {
                    // Vertical movement dominates
                    this.facingDirection = dy > 0 ? 'down' : 'up';
                }

                // Set frameY based on direction
                switch (this.facingDirection) {
                    case 'down':
                        this.frameY = 0;
                        break;
                    case 'left':
                        this.frameY = 2;
                        break;
                    case 'right':
                        this.frameY = 3;
                        break;
                    case 'up':
                        this.frameY = 1;
                        break;
                }
            }
        } else {
            // Reset to first frame when not moving
            this.frameX = 0;
        }
    }

    step(delta, root) {
        if (!this.isMoving && this.playerPosition) {
            const neighbors = this.getNeighborTiles(root);
            const escapeTile = this.findFurthestTile(neighbors);

            if (escapeTile) {
                this.targetPosition = new Vector2(escapeTile.x, escapeTile.y);
                this.isMoving = true;
            }
        }

        if (this.isMoving && this.targetPosition) {
            const dx = this.targetPosition.x - this.position.x;
            const dy = this.targetPosition.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.speed) {
                this.position.x += (dx / distance) * this.speed;
                this.position.y += (dy / distance) * this.speed;
            } else {
                this.position.x = this.targetPosition.x;
                this.position.y = this.targetPosition.y;
                this.isMoving = false;
                this.targetPosition = null;
            }
        }

        // Update animation
        this.updateAnimation(delta);
    }

    draw(ctx) {
        // Draw sprite with padding compensation and vertical offset
        ctx.drawImage(
            this.spriteSheet,
            this.frameX * this.frameWidth + this.padding,  // Source X with padding offset
            this.frameY * this.frameHeight + this.padding, // Source Y with padding offset
            this.spriteSize,    // Only get the actual sprite size from source
            this.spriteSize,    // Only get the actual sprite size from source
            this.position.x + (this.baseSize / 2), // Offset by half a tile (16px)
            this.position.y + this.baseSize + 4, // Offset by half a tile (16px)
            this.baseSize,      // Draw at the actual sprite size
            this.baseSize
        );


    }
}