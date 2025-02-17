class FeyLight extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the feyLight in the game world
        this.feyLightImage = new Image(); // Create a new Image object for the feyLight image
        this.feyLightImage.src = 'images/fey-light.png'; // Set the source of the feyLight image
        
        // Add animation properties
        this.baseSize = 48;  // Base size of the feyLight
        this.currentSize = this.baseSize;
        this.pulseAmount = 1;  // How much to expand/shrink
        this.pulseSpeed = 0.001;  // Speed of the pulse
        this.time = Math.random() * Math.PI * 2;  // Random start time

        // Add particle properties
        this.particleCount = 16; // Number of particles to emit
        this.particleColor = 'rgba(255, 255, 180, 0.6)'; // Warm light color
        this.trailParticleTimer = 0;
        this.trailParticleInterval = 100; // Emit trail particles every 100ms

        this.feyLightImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.feyLightImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load feyLight image');
        };

        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the feyLight object

            // Check if the player is within range of the feyLight (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 32) { // If the player is within range, emit a feyLight event
                // Emit particles before destroying
                this.emitCollectionParticles();
                events.emit('FEY_LIGHT_COLLECTED', this); // Emit the feyLight collected event with the feyLight object as data
                this.parent.removeChild(this); // Remove the feyLight from the game world
                this.destroy(); // Remove the feyLight from the game world
            }
        });

        // Add attraction properties
        this.attractionRange = 256; // Two tiles range
        this.maxAttractionRange = 256; // Can be increased as player grows stronger
        this.attractionStrength = 1.5;
        this.maxAttractionStrength = 2;
        this.isAttracted = false;
        
        // Add rocking animation properties
        this.rockAmount = 0;
        this.maxRockAmount = Math.PI / 6; // 30 degrees max rotation
        this.rockSpeed = 0.005;
        this.rockTime = Math.random() * Math.PI * 2;
        this.breakFreeThreshold = 32; // Distance at which feyLight breaks free

        // Add visibility properties
        this.isHidden = true;
        this.revealProgress = 0;
        this.revealDuration = 500; // Time to fully emerge in ms
        this.emergingParticlesEmitted = false;
        
        // Adjust attraction properties
        this.emergenceThreshold = this.attractionRange * 0.8; // Start emerging at 80% of attraction range

        // Add fairy movement properties
        this.danceTime = Math.random() * Math.PI * 2;
        this.danceSpeed = 0.002;
        this.danceAmplitude = 16; // How far it sways
        this.approachSpeed = 0.8; // Base speed towards player
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
    }

    emitCollectionParticles() {
        // Emit particles in a spiral pattern
        const spiralCount = 24;
        for (let i = 0; i < spiralCount; i++) {
            const angle = (i / spiralCount) * Math.PI * 4; // Two full rotations
            const radius = (i / spiralCount) * 32; // Increasing radius
            const velocity = {
                x: Math.cos(angle) * 3 * (radius / 32),
                y: Math.sin(angle) * 3 * (radius / 32)
            };

            events.emit('PARTICLE_EMIT', {
                x: this.position.x + this.baseSize / 2,
                y: this.position.y + this.baseSize / 2,
                color: 'rgba(255, 255, 180, 0.6)',
                size: 3 + Math.random() * 2,
                duration: 800 + Math.random() * 400,
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

        // Update dance movement
        this.danceTime += this.danceSpeed * delta;
        this.verticalOffset = Math.sin(this.danceTime) * this.danceAmplitude;
        this.horizontalOffset = Math.cos(this.danceTime * 0.7) * (this.danceAmplitude * 0.5);

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

                        // Add dancing motion to movement
                        this.position.x += Math.cos(angle) * currentAttractionStrength + 
                            (Math.sin(this.danceTime * 0.7) * 0.3);
                        this.position.y += Math.sin(angle) * currentAttractionStrength + 
                            (Math.cos(this.danceTime) * 0.3);

                        // Emit trail particles
                        this.trailParticleTimer += delta;
                        if (this.trailParticleTimer >= this.trailParticleInterval) {
                            this.emitTrailParticles();
                            this.trailParticleTimer = 0;
                        }
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
        events.emit('FEY_LIGHT_COLLECTED', this);
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

    emitTrailParticles() {
        for (let i = 0; i < 3; i++) {
            events.emit('PARTICLE_EMIT', {
                x: this.position.x + this.baseSize / 2 + (Math.random() - 0.5) * 8,
                y: this.position.y + this.baseSize / 2 + (Math.random() - 0.5) * 8,
                color: 'rgba(255, 255, 180, 0.3)',
                size: 2 + Math.random() * 2,
                duration: 600,
                shape: 'circle',
                velocity: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5 - 0.2
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

        // Translate to feyLight center, rotate, then translate back
        ctx.translate(
            drawPosX + this.baseSize / 2,
            drawPosY + this.baseSize / 2
        );
        ctx.rotate(this.rockAmount);
        
        // Draw feyLight with offset for pulse and centered rotation
        ctx.drawImage(
            this.feyLightImage,
            -this.currentSize / 2,
            -this.currentSize / 2,
            this.currentSize,
            this.currentSize
        );

        // Add subtle glow effect
        if (this.revealProgress > 0) {
            const gradient = ctx.createRadialGradient(
                drawPosX + this.baseSize / 2,
                drawPosY + this.baseSize / 2,
                0,
                drawPosX + this.baseSize / 2,
                drawPosY + this.baseSize / 2,
                this.currentSize
            );
            gradient.addColorStop(0, 'rgba(255, 255, 180, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 180, 0)');
            
            ctx.globalAlpha = this.revealProgress * 0.5;
            ctx.fillStyle = gradient;
            ctx.fillRect(
                drawPosX - this.currentSize / 2,
                drawPosY - this.currentSize / 2,
                this.currentSize * 2,
                this.currentSize * 2
            );
        }

        ctx.restore();

    }

    upgradeAttractionRange(newRange) {
        this.attractionRange = Math.min(newRange, this.maxAttractionRange);
    }
}