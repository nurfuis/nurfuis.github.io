class Acorn extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the acorn in the game world
        this.acornImage = new Image(); // Create a new Image object for the acorn image
        this.acornImage.src = 'images/acorn.png'; // Set the source of the acorn image
        
        // Add animation properties
        this.baseSize = 48;  // Base size of the acorn
        this.currentSize = this.baseSize;
        this.pulseAmount = 1;  // How much to expand/shrink
        this.pulseSpeed = 0.001;  // Speed of the pulse
        this.time = Math.random() * Math.PI * 2;  // Random start time

        // Add particle properties
        this.particleCount = 12; // Number of particles to emit
        this.particleColor = 'rgba(87, 69, 37, 0.7)'; // Acornpy amber color

        this.acornImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.acornImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load acorn image');
        };

        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the acorn object

            // Check if the player is within range of the acorn (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 32) { // If the player is within range, emit a acorn event
                // Emit particles before destroying
                this.emitCollectionParticles();
                events.emit('ACORN_COLLECTED', this); // Emit the acorn collected event with the acorn object as data
                this.parent.removeChild(this); // Remove the acorn from the game world
                this.destroy(); // Remove the acorn from the game world
            }
        });

        // Add attraction properties
        this.attractionRange = 128; // Two tiles range
        this.maxAttractionRange = 256; // Can be increased as player grows stronger
        this.attractionStrength = 1.5;
        this.maxAttractionStrength = 2;
        this.isAttracted = false;
        
        // Add rocking animation properties
        this.rockAmount = 0;
        this.maxRockAmount = Math.PI / 6; // 30 degrees max rotation
        this.rockSpeed = 0.005;
        this.rockTime = Math.random() * Math.PI * 2;
        this.breakFreeThreshold = 32; // Distance at which acorn breaks free

        // Add visibility properties
        this.isHidden = true;
        this.revealProgress = 0;
        this.revealDuration = 500; // Time to fully emerge in ms
        this.emergingParticlesEmitted = false;
        
        // Adjust attraction properties
        this.emergenceThreshold = this.attractionRange * 0.8; // Start emerging at 80% of attraction range
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

    step(delta) {
        // Update pulse animation
        this.time += this.pulseSpeed * delta;
        this.currentSize = this.baseSize + Math.sin(this.time) * this.pulseAmount;

        // Handle attraction and rocking if player is nearby
        if (this.playerPosition) {
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            // Start revealing when player is within range
            if (distance <= this.attractionRange) {
                if (this.isHidden) {
                    // Calculate reveal progress
                    const revealRatio = Math.max(0, 1 - (distance / this.emergenceThreshold));
                    this.revealProgress = Math.min(this.revealProgress + (delta / this.revealDuration), revealRatio);

                    // Emit emerging particles once
                    if (!this.emergingParticlesEmitted && this.revealProgress > 0) {
                        this.emitEmergingParticles();
                        this.emergingParticlesEmitted = true;
                    }

                    // Fully reveal when emerged enough
                    if (this.revealProgress >= 1) {
                        this.isHidden = false;
                    }
                }

                // Only apply attraction when partially revealed
                if (this.revealProgress > 0.3) {
                    const attractionRatio = Math.pow(1 - (distance / this.attractionRange), 2);
                    const currentAttractionStrength = this.attractionStrength * attractionRatio;

                    // Update rocking animation
                    this.rockTime += this.rockSpeed * delta * (1 + attractionRatio * 2);
                    this.rockAmount = this.maxRockAmount * attractionRatio * Math.sin(this.rockTime);

                    if (distance > this.breakFreeThreshold) {
                        const dx = this.playerPosition.x - this.position.x;
                        const dy = this.playerPosition.y - this.position.y;
                        const angle = Math.atan2(dy, dx);

                        this.position.x += Math.cos(angle) * currentAttractionStrength;
                        this.position.y += Math.sin(angle) * currentAttractionStrength;
                    } else {
                        this.breakFree();
                    }
                }
            }
        }
    }

    breakFree() {
        // Emit break free particles
        for (let i = 0; i < 8; i++) {
            events.emit('PARTICLE_EMIT', {
                x: this.position.x + this.baseSize / 2,
                y: this.position.y + this.baseSize / 2,
                color: 'rgba(139, 69, 19, 0.7)',
                size: 4,
                duration: 500,
                shape: 'circle',
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: -Math.random() * 2 - 2
                },
                fade: true
            });
        }
        
        this.emitCollectionParticles();
        events.emit('ACORN_COLLECTED', this);
        this.destroy();
    }

    emitEmergingParticles() {
        for (let i = 0; i < 6; i++) {
            events.emit('PARTICLE_EMIT', {
                x: this.position.x + this.baseSize / 2,
                y: this.position.y + this.baseSize / 2,
                color: 'rgba(139, 69, 19, 0.5)',
                size: 3,
                duration: 800,
                shape: 'circle',
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: -Math.random() * 3
                },
                fade: true
            });
        }
    }

    draw(ctx) {
        // Don't draw anything if completely hidden
        if (this.revealProgress <= 0) return;

        const drawPosX = this.position.x;
        const drawPosY = this.position.y;

        // Save context for rotation
        ctx.save();

        // Apply reveal progress to opacity
        ctx.globalAlpha = this.revealProgress;

        // Translate to acorn center, rotate, then translate back
        ctx.translate(
            drawPosX + this.baseSize / 2,
            drawPosY + this.baseSize / 2
        );
        ctx.rotate(this.rockAmount);
        
        // Draw acorn with offset for pulse and centered rotation
        ctx.drawImage(
            this.acornImage,
            -this.currentSize / 2,
            -this.currentSize / 2,
            this.currentSize,
            this.currentSize
        );

        ctx.restore();

    }

    upgradeAttractionRange(newRange) {
        this.attractionRange = Math.min(newRange, this.maxAttractionRange);
    }
}