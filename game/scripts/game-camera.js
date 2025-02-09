class Camera extends GameObject {
    constructor(canvas, mapSize) {
        super(canvas);
        this.canvas = canvas;
        this.mapSize = mapSize;
        const newX = Math.floor(canvas.width / 2 - mapSize.width / 2);
        const newY = Math.floor(canvas.height / 2 - mapSize.height / 2);
        this.position = new Vector2(newX, newY);
        this.panSpeed = 15; // Adjust panning speed as needed
    }


    follow(ctx) {
        ctx.translate(this.position.x, this.position.y);
    }

    panCamera(keysPressed) {
        const panExtensionX = this.canvas.width / 2;
        const panExtensionY = this.canvas.height / 2;

        let newX = this.position.x;
        let newY = this.position.y;

        if (keysPressed.includes('4')) { // Numpad 4 (Left)
            newX += this.panSpeed;
        }
        if (keysPressed.includes('6')) { // Numpad 6 (Right)
            newX -= this.panSpeed;
        }
        if (keysPressed.includes('8')) { // Numpad 8 (Up)
            newY += this.panSpeed;
        }
        if (keysPressed.includes('2')) { // Numpad 2 (Down)
            newY -= this.panSpeed;
        }
        if (keysPressed.includes('7')) { // Numpad 7 (Up Left)
            newX += this.panSpeed;
            newY += this.panSpeed;
        }
        if (keysPressed.includes('9')) { // Numpad 9 (Up Right)
            newX -= this.panSpeed;
            newY += this.panSpeed;
        }
        if (keysPressed.includes('1')) { // Numpad 1 (Down Left)
            newX += this.panSpeed;
            newY -= this.panSpeed;
        }
        if (keysPressed.includes('3')) { // Numpad 3 (Down Right)
            newX -= this.panSpeed;
            newY -= this.panSpeed;
        }

        // Constrain camera within the map boundaries
        const minX = this.canvas.width - this.mapSize.width - panExtensionX;
        const minY = this.canvas.height - this.mapSize.height - panExtensionY;
        const maxX = panExtensionX;
        const maxY = panExtensionY;

        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        this.position.x = Math.floor(newX);
        this.position.y = Math.floor(newY);

    }

    step(delta, root) {
        const keysPressed = root.input.keysPressed;

        if (!keysPressed) return;

        if (keysPressed.length > 0) {
          this.panCamera(keysPressed);
        }
      }

}