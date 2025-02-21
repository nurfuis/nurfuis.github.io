class Seed extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the seed in the game world
        this.seedImage = new Image(); // Create a new Image object for the seed image
        this.seedImage.src = 'images/seed.png'; // Set the source of the seed image
        
        this.vineImage = new Image(); // Create a new Image object for the vine image
        this.vineImage.src = 'images/vine.png'; // Set the source of the vine image

        this.leafImage = new Image(); // Create a new Image object for the leaf image
        this.leafImage.src = 'images/leaf.png'; // Set the source of the leaf image

        this.gasImage = new Image(); // Create a new Image object for the gas image
        this.gasImage.src = 'images/gas.png'; // Set the source of the gas image

        this.vineTeethImage = new Image(); // Create a new Image object for the vine teeth image
        this.vineTeethImage.src = 'images/vine-teeth.png'; // Set the source of the vine teeth image

        this.vineTeethTwoImage = new Image(); // Create a new Image object for the vine teeth image (alternate)
        this.vineTeethTwoImage.src = 'images/vine-teeth-2.png'; // Set the source of the vine teeth image (alternate)

        // Add animation properties
        this.baseSize = 64;  // Base size of the seed
        this.currentSize = this.baseSize;
        this.pulseAmount = 1;  // How much to expand/shrink
        this.pulseSpeed = 0.003;  // Speed of the pulse
        this.time = Math.random() * Math.PI * 2;  // Random start time

        // Add leaf pulse properties
        this.leafPulseAmount = 2;  // How much to expand/shrink
        this.leafPulseSpeed = 0.002;  // Slower than seed pulse
        this.leafTime = Math.random() * Math.PI * 2;  // Random start time
        this.leafBaseSize = 64;
        this.leafCurrentSize = this.leafBaseSize;

        // Add particle properties
        this.particleCount = 12; // Number of particles to emit
        this.particleColor = 'rgba(255, 0, 0, 0.7)'; 

        // Quiver animation properties
        this.quiverAmount = 2;  // How many pixels to shake
        this.quiverSpeed = 0.2; // Speed of quiver
        this.quiverChance = 0.01; // Chance to start quivering each frame
        this.isQuivering = false;
        this.quiverTime = 0;
        this.quiverDuration = 500; // Duration of quiver in ms
        this.offsetX = 0;
        this.offsetY = 0;

        // Add collection mini-game properties
        this.isBeingCollected = false;
        this.isCollectionActive = false; // New flag for when key is pressed
        this.collectionTimer = 0;
        this.collectionDuration = 2000; // 2 seconds to collect once started
        this.perfectTugWindow = {start: 0.4, end: 0.6}; // 40-60% of the duration
        this.healingBonus = 25;
        this.collectionTimeout = 3000; // Time allowed to start collection
        this.timeoutTimer = 0;

        // Add gas properties
        this.gasSpawnChance = 0; // Start with no chance to spawn
        this.gasCheckRadius = 2; // Check 2 tiles in each direction
        this.gasClouds = new Set(); // Track active gas cloud positions
        this.gasCloudDuration = 5000; // Gas clouds last 5 seconds
        this.gasSpawnCooldown = 3000; // Check every 3 seconds
        this.lastGasSpawnCheck = 0;
        this.playerNearbyRadius = 640; // 10 tiles (64 * 10)
        this.isPlayerNearby = false;

        // Add teeth snap properties
        this.teethSnapChance = 0.005; // 0.5% chance per frame to snap
        this.teethSnapDuration = 750; // Show teeth for 200ms
        this.isSnapping = false;
        this.snapTimer = 0;
        this.showLeaf = true;

        this.seedImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.seedImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load seed image');
        };

        events.on('PLAYER_POSITION', this, (data) => {
            this.playerPosition = data;

            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 32 && !this.isBeingCollected && !data.isMoving) { // If the player is within range and not already collecting, start collection mini-game
                this.startCollection();
            }
        });

    }

    startCollection() {
        this.isBeingCollected = true;
        this.collectionTimer = 0;
        events.emit('COLLECTION_STARTED', {
            type: 'seed',
            duration: this.collectionDuration,
            isSnapping: this.isSnapping,
        });
    }

    finishCollection(wasPerfect) {
        if (wasPerfect) {
            events.emit('HEAL_PLAYER', this.healingBonus);
            // Emit sparkle particles for perfect collection
            for (let i = 0; i < 8; i++) {
                events.emit('PARTICLE_EMIT', {
                    x: this.position.x + this.baseSize / 2,
                    y: this.position.y + this.baseSize / 2,
                    color: 'rgba(255, 255, 100, 0.8)',
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
        this.emitCollectionParticles();
        events.emit('SEED_COLLECTED', this);
        this.parent.removeChild(this);
        this.destroy();
    }

    emitCollectionParticles() {
        // Emit particles in a circular pattern
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            const velocity = {
                x: Math.cos(angle) * 2,
                y: Math.sin(angle) * 2
            };

            events.emit('PARTICLE_EMIT', {
                x: this.position.x + this.baseSize / 2,
                y: this.position.y + this.baseSize / 2,
                color: this.particleColor,
                size: 6,
                duration: 1000,
                shape: 'circle',
                velocity: velocity,
                fade: true
            });
        }
    }

    findEmptyAirTiles(root) {
        const tileSize = 64;
        const possiblePositions = [];

        // Check extended neighborhood
        for (let dx = -this.gasCheckRadius; dx <= this.gasCheckRadius; dx++) {
            for (let dy = -this.gasCheckRadius; dy <= this.gasCheckRadius; dy++) {
                // Skip the current position
                if (dx === 0 && dy === 0) continue;

                const checkX = this.position.x + (dx * tileSize);
                const checkY = this.position.y + (dy * tileSize);

                const tile = root.world.getTileAtCoordinates(checkX, checkY);
                if (tile && tile.type === 'air' && tile.passable) {
                    possiblePositions.push({ x: checkX, y: checkY });
                }
            }
        }

        return possiblePositions;
    }

    spawnGasCloud(position) {
        const driftDirection = Math.random() < 0.5 ? -1 : 1; // Randomly drift left or right
        this.gasClouds.add({
            position: position,
            createdAt: Date.now(),
            velocity: {
                x: 0.02 * driftDirection, // Slow horizontal drift
                y: -0.01 // Very slight upward drift
            }
        });

        // Emit gas particles
        events.emit('PARTICLE_EMIT', {
            x: position.x + 32,
            y: position.y + 32,
            color: 'rgba(144, 238, 144, 0.3)',
            size: 16,
            duration: this.gasCloudDuration,
            shape: 'circle',
            fade: true
        });
    }

    checkGasCollisions(playerPosition) {
        for (const cloud of this.gasClouds) {
            const distance = Math.sqrt(
                (cloud.position.x - playerPosition.x) ** 2 +
                (cloud.position.y - playerPosition.y) ** 2
            );

            if (distance <= 48) { // Gas cloud collision radius
                events.emit('GAS_CONTACT', {
                    position: cloud.position,
                    duration: 1000
                });
            }
        }
    }

    step(delta, root) {
        // Update the time
        this.time += this.pulseSpeed * delta;
        
        // Calculate the new size using a sine wave
        this.currentSize = this.baseSize + Math.sin(this.time) * this.pulseAmount;

        // Update leaf pulse
        this.leafTime += this.leafPulseSpeed * delta;
        this.leafCurrentSize = this.leafBaseSize + Math.sin(this.leafTime) * this.leafPulseAmount;

        if (!this.isQuivering) {
            // Random chance to start quivering
            if (Math.random() < this.quiverChance) {
                this.isQuivering = true;
                this.quiverTime = 0;
            }
        }

        if (this.isQuivering) {
            this.quiverTime += delta;
            
            // Update position offsets using noise
            this.offsetX = (Math.random() - 0.5) * this.quiverAmount;
            this.offsetY = (Math.random() - 0.5) * this.quiverAmount;

            // Stop quivering after duration
            if (this.quiverTime >= this.quiverDuration) {
                this.isQuivering = false;
                this.offsetX = 0;
                this.offsetY = 0;
            }
        }

        if (this.isBeingCollected) {
            if (!this.isCollectionActive) {
                // Waiting for key press to start
                this.timeoutTimer += delta;
                if (this.timeoutTimer >= this.collectionTimeout) {
                    // Failed to start in time
                    this.isBeingCollected = false;
                    this.timeoutTimer = 0;
                    events.emit('COLLECTION_FAILED', { type: 'seed' });
                    return;
                }

                // Check for key press to start
                if (root.input && root.input.keysPressed.length > 0) {
                    this.isCollectionActive = true;
                    this.collectionTimer = 0;
                }
            } else {
                // Collection is active, update timer
                this.collectionTimer += delta;

                // Check for key release
                if (root.input && root.input.keysPressed.length === 0) {
                    // Calculate progress percentage
                    const progress = this.collectionTimer / this.collectionDuration;
                    
                    // Check if player released at the right time
                    if (progress >= this.perfectTugWindow.start && 
                        progress <= this.perfectTugWindow.end) {
                        this.finishCollection(true);
                    } else {
                        this.finishCollection(false);
                    }
                    return;
                }

                // Failed to release in time
                if (this.collectionTimer >= this.collectionDuration) {
                    this.isBeingCollected = false;
                    this.isCollectionActive = false;
                    this.collectionTimer = 0;
                    events.emit('COLLECTION_FAILED', { type: 'seed' });
                }
            }
        }

        // Check if player is nearby
        if (this.playerPosition) {
            const distanceToPlayer = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            this.isPlayerNearby = distanceToPlayer <= this.playerNearbyRadius;

            // Only try to spawn gas if player is nearby and cooldown has elapsed
            const now = Date.now();
            if (this.isPlayerNearby && now - this.lastGasSpawnCheck >= this.gasSpawnCooldown) {
                this.lastGasSpawnCheck = now;
                
                const emptyTiles = this.findEmptyAirTiles(root);
                if (emptyTiles.length > 0) {
                    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
                    this.spawnGasCloud(randomTile);
                }
            }
        }

        // Clean up expired gas clouds and update positions
        const now = Date.now();
        for (const cloud of this.gasClouds) {
            if (now - cloud.createdAt >= this.gasCloudDuration) {
                this.gasClouds.delete(cloud);
                continue;
            }

            // Update cloud position
            cloud.position.x += cloud.velocity.x * delta;
            cloud.position.y += cloud.velocity.y * delta;
            
            // Fade velocity as cloud ages
            const ageRatio = (now - cloud.createdAt) / this.gasCloudDuration;
            cloud.velocity.x *= (1 - ageRatio * 0.01);
            cloud.velocity.y *= (1 - ageRatio * 0.01);
        }

        // Check for gas collisions only if clouds exist
        if (this.playerPosition && this.gasClouds.size > 0) {
            this.checkGasCollisions(this.playerPosition);
        }

        // Check for player position to detect gas collisions
        if (this.playerPosition) {
            this.checkGasCollisions(this.playerPosition);
        }

        // Handle teeth snap animation only when not being collected
        if (!this.isBeingCollected) {
            if (!this.isSnapping) {
                if (Math.random() < this.teethSnapChance) {
                    this.isSnapping = true;
                    this.snapTimer = 0;
                    this.showLeaf = false;
                }
            } else {
                this.snapTimer += delta;
                if (this.snapTimer >= this.teethSnapDuration) {
                    this.isSnapping = false;
                    this.showLeaf = true;
                }
            }
        }
    }

    draw(ctx) {

        const drawPosX = this.position.x + this.offsetX; // X position to draw the seed image at (in world coordinates)
        const drawPosY = this.position.y + this.offsetY; // Y position to draw the seed image at (in world coordinates)


        // Center the seed while it pulses
        const offsetX = (this.baseSize - this.currentSize) / 2;
        const offsetY = (this.baseSize - this.currentSize) / 2;

        ctx.drawImage(
            this.vineImage,
            this.position.x,
            this.position.y + 8, 64, 64
        );

        // Only draw seed if not being collected
        if (!this.isBeingCollected) {
            ctx.drawImage(
                this.seedImage, 
                drawPosX + offsetX, 
                drawPosY + offsetY, 
                this.currentSize, 
                this.currentSize
            );

            // Draw either leaf or teeth based on state
            if (this.showLeaf) {
                // Draw leaf with pulse
                const leafOffsetX = (this.leafBaseSize - this.leafCurrentSize) / 2;
                const leafOffsetY = (this.leafBaseSize - this.leafCurrentSize) / 2;
                ctx.drawImage(
                    this.leafImage,
                    this.position.x + leafOffsetX,
                    this.position.y + leafOffsetY, 
                    this.leafCurrentSize, 
                    this.leafCurrentSize
                );
            } else {
                // Draw vine teeth
                ctx.drawImage(
                    this.vineTeethImage,
                    this.position.x - 1,
                    this.position.y,
                    this.baseSize,
                    this.baseSize
                );
            }
        } else {
            // Draw alternate teeth image during collection
            ctx.drawImage(
                this.vineTeethTwoImage,
                this.position.x + 2,
                this.position.y - 32,
                this.baseSize,
                this.baseSize * 2
            );
        }

        // Draw the frame overlay image on top of the seed image
        // ctx.drawImage(
        //     this.frameOverlay,
        //     drawPosX,
        //     drawPosY,
        //     this.baseSize,
        //     this.baseSize
        // );

        // Draw collection indicator if being collected
        if (this.isBeingCollected) {
            const indicatorWidth = 32;
            const indicatorHeight = 4;
            
            // Draw background bar
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(
                this.position.x + 16,
                this.position.y - 40,
                indicatorWidth,
                indicatorHeight
            );
            
            // Draw perfect zone
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.fillRect(
                this.position.x + 16 + (indicatorWidth * this.perfectTugWindow.start),
                this.position.y - 40,
                indicatorWidth * (this.perfectTugWindow.end - this.perfectTugWindow.start),
                indicatorHeight
            );
            
            // Only show progress bar if collection is active
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
                // Show "press key" indicator
                ctx.fillStyle = 'white';
                ctx.fillText('Press key to collect', this.position.x, this.position.y - 50);
            }
        }

        // Draw gas clouds
        for (const cloud of this.gasClouds) {
            ctx.drawImage(
                this.gasImage,
                cloud.position.x + 8,
                cloud.position.y + 8,
                48,
                48
            );
        }
    }
}