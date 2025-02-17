class PatrolUnit extends GameObject {
    constructor(canvas, position) {
        super(canvas);

        // Base properties
        this.position = position;
        this.baseSize = 96;
        this.currentSize = this.baseSize;

        this.facingDirection = 'right';

        this.attackName = 'Attack'; // Default attack name
        this.attack = function () {
            // Attack logic here
        };

        this.range = 512; // Default attack range (in tiles)

        this.sprite = new Image(); // Load sprite image
        this.sprite.src = 'images/enemy-anemone.png'; // Set the source of the sprite image

        this.spriteTwo = new Image(); // Load sprite image for second frame of animation
        this.spriteTwo.src =
            'images/enemy-anemone-2.png'; // Set the source of the sprite image for second frame of animation

        this.sprite3 = new Image(); // Load sprite image for third frame of animation
        this.sprite3.src = 'images/enemy-anemone-3.png'; // Set the source of the sprite image for third frame of animation

        this.sprite3Red = new Image(); // Load sprite image for third frame of animation when red (attacking)
        this.sprite3Red.src = 'images/enemy-anemone-3-red.png'; // Set the source of the sprite image for third frame of animation when red (attacking)



        this.isMoving = false; // Flag to indicate if the unit is moving
        this.speed = 1; // Speed of the unit's movement

        this.initialPosition = position; // Store the initial position of the unit

        // Add collection mini-game properties
        this.isBeingCollected = false;
        this.isCollectionActive = false;
        this.collectionTimer = 0;
        this.collectionDuration = 2000; // 2 seconds to collect
        this.perfectTugWindow = { start: 0.4, end: 0.6 }; // 40-60% of duration
        this.defeatBonus = 100;
        this.collectionTimeout = 3000; // Time allowed to start
        this.timeoutTimer = 0;

        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            const distance = Math.sqrt( // Calculate the distance between the player and the unit
                (this.position.x - data.x) ** 2 + (this.position.y - data.y) ** 2 // Use the Pythagorean theorem to calculate the distance between two points
            );
            if (distance <= this.range) { // If the player is within range, emit an attack event with the unit as data
                this.isPatrolling = true; // Stop patrolling when the player is within range
            } else { // If the player is not within range, resume patrolling
                this.isPatrolling = false; // Resume patrolling when the player is out of range
            }

            if (this.isPatrolling) {
                const distance = Math.sqrt(
                    (this.position.x - data.x) ** 2 + 
                    (this.position.y - data.y) ** 2
                );

                if (distance <= 56 && !this.isBeingCollected && !data.unit.isMoving) {
                    this.startCollection();
                }
            }
        });
    }
    ready() {
        this.initialTile = this.parent.getTileAtCoordinates(this.position.x, this.position.y); // Get the tile type of the unit's current position from the map object in the root object

    }
    moveTowards(unit, destinationPosition, speed) {
        let distanceToTravelX = destinationPosition.x - unit.position.x;
        let distanceToTravelY = destinationPosition.y - unit.position.y;

        let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

        if (distance <= speed) {
            unit.position.x = destinationPosition.x;
            unit.position.y = destinationPosition.y;
            this.targetPosition = null;
            this.isMoving = false;

            this.pausePeriod = 2000; // Set the pause period to 1 second (1000 milliseconds)

        } else {
            let normalizedX = distanceToTravelX / distance;
            let normalizedY = distanceToTravelY / distance;

            const newX = Math.floor(unit.position.x + normalizedX * speed);
            const newY = Math.floor(unit.position.y + normalizedY * speed);

            if (newX > 0) {
                unit.lastX = unit.position.x;
                unit.position.x = newX;
            }
            if (newY > 0) {
                unit.lastY = unit.position.y;
                unit.position.y = newY;
            }

        }
        return distance;
    }
    getNeighborTiles(root) {
        const neighbors = [];

        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 }, // Right
            { x: 0, y: 1 }, // Down
            { x: -1, y: 0 }, // Left
        ];

        const tileSize = root.mapSize.tileSize; // Get the tile size from the root object

        for (const direction of directions) {
            const neighborX = this.position.x + direction.x * tileSize;
            const neighborY = this.position.y + direction.y * tileSize;

            const neighborTile = root.map.getTileAtCoordinates(neighborX, neighborY); // Get the neighbor tile from the map object in the root object
            const neighborTileType = neighborTile?.type; // Get the tile type of the neighbor tile from the map object in the root object

            const match = neighborTileType == this.initialTile.type; // Log the tile type of the neighbor tile to the console for debugging purposes

            if (neighborTile && match) { // Check if the neighbor tile is walkable and exists
                neighbors.push(neighborTile); // Add the neighbor tile to the neighbors array
            } else {
                neighbors.push(null); // Add null to the neighbors array if the neighbor tile is not walkable or does not exist
            }
        }

        return neighbors; // Return the neighbors array
    }

    move(root) {
        const randomDirection = Math.floor(Math.random() * 4);


        const neighbors = this.getNeighborTiles(root); // Get the neighbor tiles of the unit's current position

        if (neighbors[randomDirection]) { // Check if the random direction is a valid neighbor tile (not null)
            this.targetPosition = new Vector2(neighbors[randomDirection].x, neighbors[randomDirection].y); // Set the target position to the random neighbor tile's position
            this.isMoving = true; // Set the moving flag to true to indicate that the unit is moving
        } else { // If the random direction is not a valid neighbor tile, try again with a new random direction
            this.move(root); // Recursively call the move function to try again with a new random direction
        }
    }

    startCollection() {
        this.isBeingCollected = true;
        this.collectionTimer = 0;
        this.isPatrolling = false;
        events.emit('COLLECTION_STARTED', {
            type: 'patrol',
            duration: this.collectionDuration
        });
    }

    finishCollection(wasPerfect) {
        if (wasPerfect) {
            events.emit('REWARD_PLAYER', this.defeatBonus);
            // Emit victory particles
            for (let i = 0; i < 8; i++) {
                events.emit('PARTICLE_EMIT', {
                    x: this.position.x + 32,
                    y: this.position.y + 32,
                    color: 'rgba(255, 215, 0, 0.8)', // Gold color
                    size: 4,
                    duration: 1000,
                    shape: 'circle',
                    velocity: {
                        x: (Math.random() - 0.5) * 3,
                        y: (Math.random() - 0.5) * 3
                    },
                    fade: true
                });
            }
        }
        this.emitDefeatParticles();
        events.emit('PATROL_DEFEATED', this);
        this.destroy();
    }

    emitDefeatParticles() {
        // Emit particles in a circular pattern
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            events.emit('PARTICLE_EMIT', {
                x: this.position.x + 32,
                y: this.position.y + 32,
                color: 'rgba(255, 100, 100, 0.7)',
                size: 6,
                duration: 1000,
                shape: 'circle',
                velocity: {
                    x: Math.cos(angle) * 2,
                    y: Math.sin(angle) * 2
                },
                fade: true
            });
        }
    }

    step(delta, root) {
        if (this.isBeingCollected) {
            if (!this.isCollectionActive) {
                // Waiting for key press
                this.timeoutTimer += delta;
                if (this.timeoutTimer >= this.collectionTimeout) {
                    this.isBeingCollected = false;
                    this.isPatrolling = true;
                    this.timeoutTimer = 0;
                    events.emit('COLLECTION_FAILED', { type: 'patrol' });
                    return;
                }

                if (root.input && root.input.keysPressed.length > 0) {
                    this.isCollectionActive = true;
                    this.collectionTimer = 0;
                }
            } else {
                this.collectionTimer += delta;

                if (root.input && root.input.keysPressed.length === 0) {
                    const progress = this.collectionTimer / this.collectionDuration;
                    if (progress >= this.perfectTugWindow.start && 
                        progress <= this.perfectTugWindow.end) {
                        this.finishCollection(true);
                    } else {
                        this.finishCollection(false);
                    }
                    return;
                }

                if (this.collectionTimer >= this.collectionDuration) {
                    this.isBeingCollected = false;
                    this.isCollectionActive = false;
                    this.isPatrolling = true;
                    this.collectionTimer = 0;
                    events.emit('COLLECTION_FAILED', { type: 'patrol' });
                }
            }
            return;
        }

        if (!this.isPatrolling) { // If the unit is not patrolling, do not move or attack
            return;
        }
        if (this.pausePeriod > 0) { // If the unit is paused, decrement the pause period by the delta time
            this.pausePeriod -= delta; // Decrement the pause period by the delta time
            return; // Exit the step function to prevent movement during the pause period
        } else { // If the unit is not paused, reset the pause period to 0 and continue with the step function
            this.pausePeriod = 0; // Reset the pause period to 0 to indicate that the unit is not paused anymore
        }

        if (this.isMoving) { // If the unit is moving, move it towards the target position
            this.moveTowards(this, this.targetPosition, this.speed); // Move the unit towards the target position at the unit's speed
            return; // Exit the step function to prevent movement during the pause period
        } else {
            this.move(root); // Move the unit in a random direction
        }

    }

    draw(ctx) {
        ctx.save();
        
        // Draw unit sprite based on state
        if (this.isBeingCollected) {
            // Alternate between sprite3 and sprite3Red every 200ms
            const shouldUseRedSprite = Math.floor(Date.now() / 200) % 2 === 0;
            const spriteToUse = shouldUseRedSprite ? this.sprite3Red : this.sprite3;
            
            if (this.facingDirection === 'left') {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    spriteToUse,
                    -this.position.x - this.baseSize,
                    this.position.y,
                    this.baseSize,
                    this.baseSize
                );
            } else {
                ctx.drawImage(
                    spriteToUse,
                    this.position.x,
                    this.position.y,
                    this.baseSize,
                    this.baseSize
                );
            }
        } else if (this.isMoving) {
            ctx.drawImage(
                this.spriteTwo,
                this.position.x,
                this.position.y,
                this.baseSize,
                this.baseSize
            );
        } else {
            if (this.facingDirection === 'left') {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.sprite,
                    -this.position.x - this.baseSize,
                    this.position.y,
                    this.baseSize,
                    this.baseSize
                );
            } else {
                ctx.drawImage(
                    this.sprite,
                    this.position.x,
                    this.position.y,
                    this.baseSize,
                    this.baseSize
                );
            }
        }

        // Draw collection indicator if being collected
        if (this.isBeingCollected) {
            const indicatorWidth = 32;
            const indicatorHeight = 4;
            
            // Background bar
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(
                this.position.x + 16,
                this.position.y - 40,
                indicatorWidth,
                indicatorHeight
            );
            
            // Perfect zone
            ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Gold color
            ctx.fillRect(
                this.position.x + 16 + (indicatorWidth * this.perfectTugWindow.start),
                this.position.y - 40,
                indicatorWidth * (this.perfectTugWindow.end - this.perfectTugWindow.start),
                indicatorHeight
            );
            
            if (this.isCollectionActive) {
                const progress = this.collectionTimer / this.collectionDuration;
                ctx.fillStyle = 'white';
                ctx.fillRect(
                    this.position.x + 16 + (indicatorWidth * progress),
                    this.position.y - 42,
                    2,
                    8
                );
            } else {
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Press a key to release', this.position.x + 32, this.position.y - 50);
            }
        }
        ctx.restore();
    }
}