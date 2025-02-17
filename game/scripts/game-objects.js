class GameObject {
    position;
    children;
    parent;
    hasReadyBeenCalled;

    constructor() {
        this.position = new Vector2(0, 0);
        this.children = [];
        this.parent = null;
        this.hasReadyBeenCalled = false;
    }
    get center() {
        if (this.position && this.width && this.height) {
            const x = Math.floor(this.position.x + this.width / 2);
            const y = Math.floor(this.position.y + this.height / 2);
            return new Vector2(x, y);
        } else {
            return this.position.duplicate();
        }
    }
    stepEntry(delta, root) {
        this.children.forEach((child) => child.stepEntry(delta, root));

        if (!this.hasReadyBeenCalled) {
            this.hasReadyBeenCalled = true;
            this.ready();
        }
        this.step(delta, root);
    }

    draw(ctx, x, y) {
        const drawPosX = x + this.position.x;
        const drawPosY = y + this.position.y;

        this.drawImage(ctx, drawPosX, drawPosY);

        this.children.forEach((child) => child.draw(ctx, drawPosX, drawPosY));
    }

    ready() {
        // ...
    }

    step(delta, root) {
        // ...
    }

    drawImage(ctx, drawPosX, drawPosY) {
        // ...
    }

    destroy() {
        this.children.forEach((child) => child.destroy());
        this.parent.removeChild(this);
    }

    addChild(gameObject) {
        gameObject.parent = this;
        this.children.push(gameObject);
    }

    removeChild(gameObject) {
        events.unsubscribe(gameObject);
        this.children = this.children.filter((g) => g !== gameObject);
    }
}


class Team extends GameObject {
    constructor(colorClass, teamName) {
        super();
        this.colorClass = colorClass;
        this.teamName = teamName;
        events.on("UNIT_DEATH", this, (data) => {
            if (data.teamName === this.teamName) {
                console.log(this.teamName, 'unit died:', data);
                console.log(this.teamName, 'units left:', this.children.length);
            }
        });
    }
    step(delta, root) {
        // ...
    }
    addUnit(unit) {
        this.addChild(unit);
    }
}


class DarknessLayer extends GameObject {
    constructor(canvas, player, mapSize) {
        super(canvas);
        this.player = player;
        this.canvas = canvas;
        this.mapSize = mapSize;

        this.torchRadius = 150; // Initial torch radius
        this.torchFlicker = 0; // Flicker effect

        this.darknessDistance = 1500; 

        this.debug = false; // Initialize debug mode as disabled

        events.on("CAMERA_SHAKE", this, (data) => {
            this.hasShake = true;
            this.shakeDuration = 200;
        });
    }

    step(delta, root) {
        if (this.debug) {
            return; // Skip updating if debug mode is enabled
        }
        let flicker = 0.001;
        if (this.hasShake) {
            flicker = 0.01; // Increase flicker speed during shake
            this.shakeDuration -= delta; // Decrease shake duration over time
            if (this.shakeDuration <= 0) {
                this.hasShake = false; // Stop shaking after duration ends
            }

        }
        // Update torch radius to create a flicker effect
        this.torchFlicker += delta * flicker; // Adjust the speed of flicker
        this.torchRadius = 150 + Math.sin(this.torchFlicker) * 10 + Math.random() * 5; // Adjust the range of flicker
    }

    draw(ctx, x, y) {
        if (this.debug) {
            return; // Skip drawing if debug mode is enabled
        }
        const spread = this.darknessDistance; // Adjust the spread of the darkness effect as needed

        const gradient = ctx.createRadialGradient(
            this.player.x, this.player.y, 0,
            this.player.x, this.player.y, spread
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.mapSize.width, this.mapSize.height);

        // Draw the torchlight effect
        let torchX = this.player.x; // X position of the torchlight center (player position)
        let torchY = this.player.y; // Y position of the torchlight center (player position)

        if (this.player.facingDirection === 'right') {
            torchX += 64; // Adjust the torchlight position based on the player's facing direction
        } 
        if (this.hasShake) {
            const randomX = Math.random() * 10 - 5; // Random shake offset in X direction
            const randomY = Math.random() * 10 - 5; // Random shake offset in Y direction
            torchX += randomX; // Apply shake offset to the torchlight position
            torchY += randomY; // Apply shake offset to the torchlight position

        }
        const torchGradient = ctx.createRadialGradient(
            torchX, torchY, 0,
            torchX, torchY, this.torchRadius
        );
        torchGradient.addColorStop(0, 'rgba(255, 140, 0, 0.4)'); // Warm glow color
        torchGradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

        ctx.fillStyle = torchGradient;
        ctx.fillRect(0, 0, this.mapSize.width, this.mapSize.height);
    }
}

class VignetteLayer extends GameObject {
    constructor(canvas, mapSize) {
        super(canvas);
        this.canvas = canvas;
        this.mapSize = mapSize;
        
        // Add extra padding for shake effects
        this.padding = 64;
        
        // Calculate panel sizes based on max pan distance (half canvas)
        this.leftWidth = Math.ceil(canvas.width / 2) + this.padding;
        this.rightWidth = Math.ceil(canvas.width / 2) + this.padding;
        this.topHeight = Math.ceil(canvas.height / 2) + this.padding;
        this.bottomHeight = Math.ceil(canvas.height / 2) + this.padding;

        this.debug = false; // Initialize debug mode as disabled
    }

    draw(ctx) {
        if (this.debug) {
            return; // Skip drawing if debug mode is enabled
        }

        ctx.fillStyle = '#000000';

        // Left panel
        ctx.fillRect(
            -this.leftWidth, 
            -this.topHeight, 
            this.leftWidth, 
            this.mapSize.height + this.topHeight + this.bottomHeight
        );

        // Right panel
        ctx.fillRect(
            this.mapSize.width, 
            -this.topHeight, 
            this.rightWidth, 
            this.mapSize.height + this.topHeight + this.bottomHeight
        );

        // Top panel
        ctx.fillRect(
            0, 
            -this.topHeight, 
            this.mapSize.width, 
            this.topHeight
        );

        // Bottom panel
        ctx.fillRect(
            0, 
            this.mapSize.height, 
            this.mapSize.width, 
            this.bottomHeight
        );
    }
}