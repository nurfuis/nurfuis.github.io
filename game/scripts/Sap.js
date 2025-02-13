class Sap extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the sap in the game world
        this.sapImage = new Image(); // Create a new Image object for the sap image
        this.sapImage.src = 'images/sap.png'; // Set the source of the sap image
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

            if (distance <= 64) { // If the player is within range, emit a sap event
                events.emit('SAP_COLLECTED', this); // Emit the sap collected event with the sap object as data
                this.destroy(); // Remove the sap from the game world
            }
        });

    }


    draw(ctx) {

        const drawPosX = this.position.x; // X position to draw the sap image at (in world coordinates)
        const drawPosY = this.position.y; // Y position to draw the sap image at (in world coordinates)

        ctx.drawImage(this.sapImage, drawPosX, drawPosY, 64, 64); // Draw the sap image at the specified position


    }
}