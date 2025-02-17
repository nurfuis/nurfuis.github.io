class Sap extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the sap in the game world
        this.sapImage = new Image(); // Create a new Image object for the sap image
        this.sapImage.src = 'images/sap.png'; // Set the source of the sap image
        
        this.frameOverlay = new Image(); // Create a new Image object for the frame overlay image
        this.frameOverlay.src = 'images/wood-tile-frame.png'; // Set the source of the frame overlay image

        // Add animation properties
        this.baseSize = 64;  // Base size of the sap
        this.currentSize = this.baseSize;
        this.pulseAmount = 8;  // How much to expand/shrink
        this.pulseSpeed = 0.003;  // Speed of the pulse
        this.time = Math.random() * Math.PI * 2;  // Random start time

        // Add particle properties
        this.particleCount = 12; // Number of particles to emit
        this.particleColor = 'rgba(255, 200, 100, 0.7)'; // Sappy amber color

        this.sapImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.sapImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load sap image');
        };

        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the sap object

            // Check if the player is within range of the sap (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 32) { // If the player is within range, emit a sap event
                // Emit particles before destroying
                this.emitCollectionParticles();
                events.emit('SAP_COLLECTED', this); // Emit the sap collected event with the sap object as data
                this.parent.removeChild(this); // Remove the sap from the game world
                this.destroy(); // Remove the sap from the game world
            }
        });

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
        // Update the time
        this.time += this.pulseSpeed * delta;
        
        // Calculate the new size using a sine wave
        this.currentSize = this.baseSize + Math.sin(this.time) * this.pulseAmount;
    }

    draw(ctx) {

        const drawPosX = this.position.x; // X position to draw the sap image at (in world coordinates)
        const drawPosY = this.position.y; // Y position to draw the sap image at (in world coordinates)

        // Center the sap while it pulses
        const offsetX = (this.baseSize - this.currentSize) / 2;
        const offsetY = (this.baseSize - this.currentSize) / 2;

        ctx.drawImage(
            this.sapImage, 
            drawPosX + offsetX, 
            drawPosY + offsetY, 
            this.currentSize, 
            this.currentSize
        );

        // Draw the frame overlay image on top of the sap image
        ctx.drawImage(
            this.frameOverlay,
            drawPosX,
            drawPosY,
            this.baseSize,
            this.baseSize
        );
    }
}