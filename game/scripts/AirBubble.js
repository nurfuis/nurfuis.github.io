class AirBubble extends GameObject {

    constructor(canvas, position) {
        super(canvas);
        this.position = position; // Position of the airBubble in the game world
        this.airBubbleImage = new Image(); // Create a new Image object for the airBubble image
        this.airBubbleImage.src = 'images/bubble.png'; // Set the source of the airBubble image
        this.airBubbleImage.onload = () => { // Ensure the image is loaded before drawing
            this.ready();
        };

        this.airBubbleImage.onerror = () => { // Handle image loading errors
            console.error('Failed to load airBubble image');
        };

        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the airBubble object

            // Check if the player is within range of the airBubble (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 64) { // If the player is within range, emit a airBubble event
                events.emit('AIR_COLLECTED', this); // Emit the airBubble collected event with the airBubble object as data
                this.destroy(); // Remove the airBubble from the game world
            }
        });

    }


    draw(ctx) {

        const drawPosX = this.position.x; // X position to draw the airBubble image at (in world coordinates)
        const drawPosY = this.position.y; // Y position to draw the airBubble image at (in world coordinates)

        ctx.drawImage(this.airBubbleImage, drawPosX + 8, drawPosY + 8, 48, 48); // Draw the airBubble image at the specified position


    }
}