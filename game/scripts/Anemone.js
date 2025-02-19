class Anemone extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the anemone in the game world
        this.anemoneImage = new Image(); // Create a new Image object for the anemone image
        this.anemoneImage.src = 'images/anemone.png'; // Set the source of the anemone image

        this.anemoneClosed = new Image();
        this.anemoneClosed.src = 'images/anemone-closed.png';

        this.anemoneAggro = new Image();
        this.anemoneAggro.src = 'images/anemone-aggro.png';

        // Add animation properties
        this.baseSize = 96;  // Base size of the anemone
        this.currentSize = this.baseSize;
        this.pulseAmount = 1;  // How much to expand/shrink
        this.pulseSpeed = 0.003;  // Speed of the pulse
        this.time = Math.random() * Math.PI * 2;  // Random start time

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
        this.perfectTugWindow = { start: 0.4, end: 0.6 }; // 40-60% of the duration
        this.feedingBonus = 400;
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
        this.isSnapping = false;
        this.snapTimer = 0;
        this.snapDuration = 750; // Time to stay closed
        this.snapTransition = 200; // Time for open/close transition
        this.snapState = 'open'; // 'open', 'closing', 'closed', 'opening'
        this.snapProgress = 0;
        this.snapChance = 0.005; // 0.5% chance per frame to snap

        this.anemoneImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.anemoneImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load anemone image');
        };

        events.on('PLAYER_POSITION', this, (data) => {
            this.playerPosition = data;

            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 32 && !this.isBeingCollected && !data.unit.isMoving) { // If the player is within range and not already collecting, start collection mini-game
                const useAutomatedInput = data.unit.useAutomatedInput; // Check if the player is using automated input
                this.startCollection(useAutomatedInput);
            }
        });

    }

    startCollection() {
        this.isBeingCollected = true;
        this.collectionTimer = 0;
        events.emit('COLLECTION_STARTED', {
            type: 'anemone',
            duration: this.collectionDuration,
            isSnapping: this.isSnapping,
        });
    }

    finishCollection(wasPerfect) {
        if (wasPerfect) {
            events.emit('FEED_PLAYER', this.feedingBonus);
            // Emit sparkle particles for perfect collection
            for (let i = 0; i < 8; i++) {
                events.emit('PARTICLE_EMIT', {
                    x: this.position.x + this.baseSize / 2,
                    y: this.position.y + this.baseSize / 2,
                    color: 'rgba(0, 255, 0, 0.8)',
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
        events.emit('ANEMONE_COLLECTED', this);
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

    step(delta, root) {
        // Update the time
        this.time += this.pulseSpeed * delta;

        // Calculate the new size using a sine wave
        this.currentSize = this.baseSize + Math.sin(this.time) * this.pulseAmount;

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
                    events.emit('COLLECTION_FAILED', { type: 'anemone' });
                    return;
                }

                // Check for key press to start
                if (root.input && root.input.keysPressed.length > 0) {
                    this.isCollectionActive = true;
                    this.collectionTimer = 0;
                }
                
                // else if (root.player.useAutomatedInput) { // Automated input case
                //     // delay by a random amount to simulate player reaction time
                //     const delay = Math.random() * 500 + 500; // 500-1000ms delay

                //     setTimeout(() => {
                //         this.isCollectionActive = true;
                //         this.collectionTimer = 0;
                //     }, delay);


                // }
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
                    events.emit('COLLECTION_FAILED', { type: 'anemone' });
                }
            }
        }

        // Handle snap animation when not being collected
        if (!this.isBeingCollected) {
            if (!this.isSnapping) {
                if (Math.random() < this.snapChance) {
                    this.isSnapping = true;
                    this.snapTimer = 0;
                    this.snapState = 'closing';
                    this.snapProgress = 0;
                }
            } else {
                this.snapTimer += delta;

                switch (this.snapState) {
                    case 'closing':
                        this.snapProgress = Math.min(1, this.snapProgress + delta / this.snapTransition);
                        if (this.snapProgress >= 1) {
                            this.snapState = 'closed';
                            this.snapProgress = 0;
                        }
                        break;

                    case 'closed':
                        if (this.snapTimer >= this.snapDuration) {
                            this.snapState = 'opening';
                            this.snapProgress = 0;
                        }
                        break;

                    case 'opening':
                        this.snapProgress = Math.min(1, this.snapProgress + delta / this.snapTransition);
                        if (this.snapProgress >= 1) {
                            this.isSnapping = false;
                            this.snapState = 'open';
                        }
                        break;
                }
            }
        }
    }

    draw(ctx) {

        const drawPosX = this.position.x + this.offsetX - 16; // X position to draw the anemone image at (in world coordinates)
        const drawPosY = this.position.y + this.offsetY - 16; // Y position to draw the anemone image at (in world coordinates)


        // Center the anemone while it pulses
        const offsetX = (this.baseSize - this.currentSize) / 2;
        const offsetY = (this.baseSize - this.currentSize) / 2;

        // Only draw anemone if not being collected
        if (!this.isBeingCollected) {
            if (this.snapState === 'open' || !this.isSnapping) {
                ctx.drawImage(
                    this.anemoneImage,
                    drawPosX + offsetX,
                    drawPosY + offsetY + 8,
                    this.currentSize,
                    this.currentSize
                );
            } else {
                // Draw transition between open and closed
                ctx.save();
                if (this.snapState === 'closing') {
                    ctx.globalAlpha = 1 - this.snapProgress;
                    ctx.drawImage(
                        this.anemoneImage,
                        drawPosX + offsetX,
                        drawPosY + offsetY,
                        this.currentSize,
                        this.currentSize
                    );
                    ctx.globalAlpha = this.snapProgress;
                } else if (this.snapState === 'opening') {
                    ctx.globalAlpha = this.snapProgress;
                    ctx.drawImage(
                        this.anemoneImage,
                        drawPosX + offsetX,
                        drawPosY + offsetY,
                        this.currentSize,
                        this.currentSize
                    );
                    ctx.globalAlpha = 1 - this.snapProgress;
                }

                ctx.drawImage(
                    this.anemoneClosed,
                    drawPosX + offsetX,
                    drawPosY + offsetY,
                    this.currentSize,
                    this.currentSize
                );
                ctx.restore();
            }
        } else {
            // Draw aggro state during collection
            ctx.drawImage(
                this.anemoneAggro,
                drawPosX,
                drawPosY + 4,
                this.baseSize,
                this.baseSize
            );
        }

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
                ctx.fillText('Press a key to collect', this.position.x, this.position.y - 50);
            }
        }


    }
}