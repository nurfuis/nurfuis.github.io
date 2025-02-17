class LuminaSphere extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the luminaSphere in the game world
        this.initialY = position.y; // Store the initial Y position
        this.bobAmount = 8; // Maximum pixels to bob up and down
        this.bobSpeed = 0.002; // Speed of the bobbing motion
        this.time = Math.random() * Math.PI * 2; // Random start time for variation
        this.luminaSphereImage = new Image(); // Create a new Image object for the luminaSphere image
        this.luminaSphereImage.src = 'images/lumina-sphere.png'; // Set the source of the luminaSphere image
        this.luminaSphereImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.luminaSphereImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load luminaSphere image');
        };

        // Add particle effect properties
        this.particleCount = 4; // Number of particles in ring
        this.confettiCount = 4; // Number of confetti pieces
        this.particleColors = [
            'rgba(255, 220, 100, 0.8)', // Golden
            'rgba(255, 255, 200, 0.8)', // Light yellow
            'rgba(200, 255, 255, 0.8)'  // Light blue
        ];
        this.confettiColors = [
            'rgba(255, 100, 100, 0.9)', // Red
            'rgba(100, 255, 100, 0.9)', // Green
            'rgba(100, 100, 255, 0.9)', // Blue
            'rgba(255, 255, 100, 0.9)'  // Yellow
        ];

        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the luminaSphere object

            // Check if the player is within range of the luminaSphere (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 64) { // If the player is within range, emit a luminaSphere event
                this.emitCollectionParticles();
                events.emit('LUMINA_SPHERE_COLLECTED', this); // Emit the luminaSphere collected event with the luminaSphere object as data
                
                // Delay removal slightly to allow particles to spawn
                setTimeout(() => {
                    this.parent.removeChild(this); // Remove the luminaSphere from the game world  
                    this.destroy(); // Remove the luminaSphere from the game world
                }, 100);
            }
        });

    }

    emitCollectionParticles() {
        // First stage: Ring of particles
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            const radius = 32; // Initial ring radius
            const color = this.particleColors[i % this.particleColors.length];
            
            events.emit('PARTICLE_EMIT', {
                x: this.position.x + 32 + Math.cos(angle) * radius,
                y: this.position.y + 32 + Math.sin(angle) * radius,
                color: color,
                size: 2,
                duration: 1000,
                shape: 'circle',
                velocity: {
                    x: Math.cos(angle) * -0.5, // Inward velocity
                    y: Math.sin(angle) * -0.5
                },
                acceleration: {
                    x: Math.cos(angle) * -0.8, // Accelerate inward
                    y: Math.sin(angle) * -0.8
                },
                fade: true,
                scale: {
                    start: 1,
                    end: 0.2
                }
            });
        }

        // Second stage: Confetti squares
        setTimeout(() => {
            for (let i = 0; i < this.confettiCount; i++) {
                const angle = (i / this.confettiCount) * Math.PI * 2;
                const color = this.confettiColors[i % this.confettiColors.length];
                const speed = 2 + Math.random() * 2;
                
                events.emit('PARTICLE_EMIT', {
                    x: this.position.x + 32,
                    y: this.position.y + 32,
                    color: color,
                    size: 1 + Math.random() * 2,
                    duration: 1200 + Math.random() * 400,
                    shape: 'square',
                    velocity: {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed - 2 // Extra upward boost
                    },
                    gravity: 0.15,
                    rotation: {
                        initial: Math.random() * Math.PI * 2,
                        speed: (Math.random() - 0.5) * 0.2
                    },
                    bounce: {
                        count: 2,
                        factor: 0.6
                    },
                    fade: true
                });
            }
        }, 200); // Delay confetti slightly after ring particles
    }

    step(delta) { // Update the luminaSphere's state each frame (if needed)
        // Update the time
        this.time += this.bobSpeed * delta;
        
        // Calculate the new Y position using a sine wave
        this.position.y = this.initialY + Math.sin(this.time) * this.bobAmount;
    }
    draw(ctx) {

        const drawPosX = this.position.x; // X position to draw the luminaSphere image at (in world coordinates)
        const drawPosY = this.position.y; // Y position to draw the luminaSphere image at (in world coordinates)

        ctx.drawImage(this.luminaSphereImage, drawPosX + 4, drawPosY + 4, 56, 56); // Draw the luminaSphere image at the specified position


    }
}