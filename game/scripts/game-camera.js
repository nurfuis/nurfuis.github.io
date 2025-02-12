class Camera extends GameObject {
    constructor(canvas, mapSize) {
        super(canvas);
        this.canvas = canvas;
        this.mapSize = mapSize;
        const newX = 0;
        const newY = 0;
        this.position = new Vector2(newX, newY);
        this.panSpeed = 15; // Adjust panning speed as needed
        events.on("PLAYER_POSITION", this, (position) => {
            this.updateView(position);
        });

        this.previousPosition = null;
        this.homePosition = new Vector2(0, 0);

        this.movementSpeed = 3;
        this.isPanning = false;

        this.screenShift = "ready"; // ready |  complete | charging
        this.shiftTiming = 0; // frames
        this.shiftDistance = 64; // pixels
        this.shiftCounter = this.shiftDistance;

        const tileWidth = mapSize.tileSize; // Adjust tile width as needed
        this.halfTile = tileWidth / 2;
        this.halfWidth = -this.halfTile + canvas.width / 2;
        this.halfHeight = -this.halfTile + canvas.height / 2;

        events.on("CAMERA_SHAKE", this, (event) => {
            this.hasShake = true;
            const shakeX = event.position.x - event.destinationPosition.x;
            const shakeY = event.position.y - event.destinationPosition.y;
            const magnitude = 0.25; // TODO set by something else
            this.shakeCamera(shakeX, shakeY, magnitude);
        });

        events.on("PLAYER_POSITION", this, (position) => {
            this.shiftTiming = 0;
            if (position.cause === "teleport") {
                this.isPanning = false;
            }
            this.updateView(position);
        });

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
    driftTowards(center) {
        const driftAmount = 0.015;
        // .02 = what weve been using
        // .01 = running away from something

        const roundedPosition = new Vector2(
            Math.round(this.position.x + driftAmount * (center.x - this.position.x)),
            Math.round(this.position.y + driftAmount * (center.y - this.position.y))
        );

        this.position = roundedPosition;

        if (
            Math.abs(this.position.x - center.x) <= 32 &&
            Math.abs(this.position.y - center.y) <= 32
        ) {
            this.shiftCamera();
        }
    }
    shiftCamera() {
        if (this.screenShift === "complete" && this.shiftTiming === 0) {
            this.screenShift = "charging";
        }
        if (!this.previousPosition || this.previousPosition != this.position) {
            if (
                this.shiftCounter < this.shiftDistance &&
                this.screenShift === "charging"
            ) {
                this.shiftCounter += 1;
            }
            if (this.shiftCounter === this.shiftDistance) {
                this.screenShift = "ready";
            }
        }
        this.previousPosition = this.position.duplicate();

        if (this.screenShift === "ready") {
            this.shiftTiming += 1;
        }

        if (
            this.shiftCounter > 0 &&
            this.screenShift === "ready" &&
            this.shiftTiming > 150 &&
            !this.isPanning
        ) {
            this.position.y -= 1;
            this.shiftCounter -= 1;
        }
        if (this.shiftCounter <= 0) {
            this.isPanning = true;
            this.screenShift = "complete";
        }
    }
    shakeCamera(x, y, magnitude) {
        // Calculate new positions with shake applied, but don't update yet
        const newPositionX = this.position.x + x * magnitude;
        const newPositionY = this.position.y + y * magnitude;
        // Check if any value is valid
        if (isNaN(x) || isNaN(y) || isNaN(magnitude)) {
            // No shake applied if any value is invalid
            return; // Early return if needed
        } else if (x === 0 && y === 0) {
            // No shake applied if both x and y are 0
            return;
        } else {
            // Apply the shake only if at least one value is valid
            this.position.x = newPositionX;
            this.position.y = newPositionY;
        }
    }
    updateView(position) {
        const transformX = Math.round(-position.x + this.halfWidth);
        const transformY = Math.round(-position.y + this.halfHeight);

        const transform = new Vector2(transformX, transformY);

        if (this.isPanning) {
            this.homePosition = transform.duplicate();
            this.driftTowards(transform);
        } else {
            this.position = transform;
            this.homePosition = transform.duplicate();
        }
        // this.position = new Vector2(transformX, transformY); // add state to use static camera follow
        // for adjusting camera mood, consider playing with it for more settings
    }
    follow(ctx) {
        ctx.translate(this.position.x, this.position.y);
    }
    centerOnUnit(unit) {
        const centerX = unit.x - this.canvas.width / 2 + unit.size / 2;
        const centerY = unit.y - this.canvas.height / 2 + unit.size / 2;

        // Constrain camera within the map boundaries
        const minX = 0;
        const minY = 0;
        const maxX = this.mapSize.width - this.canvas.width;
        const maxY = this.mapSize.height - this.canvas.height;

        this.position.x = Math.max(minX, Math.min(centerX, maxX));
        this.position.y = Math.max(minY, Math.min(centerY, maxY));
    }
    step(delta, root) {
        this.shiftCamera();
        if (this.hasShake) {
            this.hasShake = false;
            this.shakeCamera();
        }
        const keysPressed = root.input.keysPressed;

        if (!keysPressed) return;

        if (keysPressed.length > 0) {
            this.panCamera(keysPressed);
        }
    }

}