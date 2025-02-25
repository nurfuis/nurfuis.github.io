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

class BackgroundLayer extends GameObject {
    constructor(canvas, camera, scrollSpeed = 0.5) {
        super();
        this.canvas = canvas;
        this.camera = camera;
        this.scrollSpeed = scrollSpeed;

        // Image loading
        this.image = new Image();
        this.isImageLoaded = false;
        this.image.onload = () => {
            this.isImageLoaded = true;
            this.updateDimensions();
        };
        this.image.src = 'images/bg-2.png';

        // Initial position
        this.position = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);

        this.scaleFactor = 1.0;

        this.visible = true;
    }

    updateDimensions() {
        // Calculate scale to maintain aspect ratio and fit height
        this.baseScale = this.canvas.height / this.image.height;

        // Apply scale factor
        this.scale = this.baseScale * this.scaleFactor;
        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;

        // Calculate vertical centering offset
        this.verticalOffset = (this.canvas.height - this.height) / 2;

        // Calculate how many copies needed to cover viewport plus buffer
        this.copiesNeeded = Math.ceil((this.canvas.width * 2) / this.width) + 2;
    }

    setScaleFactor(value) {
        this.scaleFactor = value;
        if (this.isImageLoaded) {
            this.updateDimensions();
        }
    }

    setBackgroundImage(imageUrl) {
        this.isImageLoaded = false;
        this.image = new Image();
        this.image.onload = () => {
            this.isImageLoaded = true;
            this.updateDimensions();
        };
        this.image.src = imageUrl;
    }

    update(delta) {
        if (!this.isImageLoaded) return;

        // Update horizontal parallax with extended range
        this.offset.x = (-this.camera.position.x * this.scrollSpeed) % this.width;

        // Ensure smooth wrapping
        if (this.offset.x > 0) {
            this.offset.x -= this.width;
        }
    }

    drawImage(ctx) {
        if (!this.isImageLoaded) return;
        if (!this.visible) return;
        
        ctx.save();

        // Draw more copies to ensure coverage during camera movement
        const startX = Math.floor(-this.copiesNeeded / 2);
        const endX = Math.ceil(this.copiesNeeded / 2);

        for (let x = startX; x <= endX; x++) {
            ctx.drawImage(
                this.image,
                this.offset.x + (x * this.width),
                this.verticalOffset,
                this.width,
                this.height
            );
        }

        ctx.restore();
    }
}

class LightLayer extends GameObject {
    constructor(canvas, unit, world) {
        super(canvas);
        this.unit = unit;
        this.canvas = canvas;
        this.world = world;

        this.torchRadius = 150;
        this.torchFlicker = 0;
        this.hasShake = false;
        this.shakeDuration = 0;

        events.on("CAMERA_SHAKE", this, (data) => {
            this.hasShake = true;
            this.shakeDuration = 200;
        });
    }

    update(delta) {
        let flicker = 0.001;
        if (this.hasShake) {
            flicker = 0.01;
            this.shakeDuration -= delta;
            if (this.shakeDuration <= 0) {
                this.hasShake = false;
            }
        }
        this.torchFlicker += delta * flicker;
        this.torchRadius = 150 + Math.sin(this.torchFlicker) * 10 + Math.random() * 5;
    }

    draw(ctx) {
        let torchX = this.unit.position.x;
        let torchY = this.unit.position.y;

        if (this.unit.facingDirection === 'right') {
            torchX += this.unit.size;
        }

        if (this.hasShake) {
            const randomX = Math.random() * 10 - 5;
            const randomY = Math.random() * 10 - 5;
            torchX += randomX;
            torchY += randomY;
        }

        const torchGradient = ctx.createRadialGradient(
            torchX, torchY, 0,
            torchX, torchY, this.torchRadius
        );
        torchGradient.addColorStop(0, 'rgba(255, 140, 0, 0.2)');
        torchGradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

        ctx.fillStyle = torchGradient;
        ctx.fillRect(-this.canvas.width / 2, 0, this.world.width + this.canvas.width, this.canvas.height);
    }
}

class DarknessLayer extends GameObject {
    constructor(canvas, player, world) {
        super(canvas);
        this.player = player;
        this.canvas = canvas;
        this.world = world;
        this.darknessLevel = 0; // Start at neutral
        this.maxLevel = 10; // Maximum darkness/lightness level
        this.opacityStep = 0.1; // Amount to change per keypress
        this.debug = false;

        // Add keyboard listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'NumpadAdd') {
                this.darknessLevel = Math.min(this.maxLevel, this.darknessLevel + 1);
                console.log('Darkness Level:', this.darknessLevel);
            } else if (e.code === 'NumpadSubtract') {
                this.darknessLevel = Math.max(-this.maxLevel, this.darknessLevel - 1);
                console.log('Darkness Level:', this.darknessLevel);
            }
        });
    }

    draw(ctx) {
        if (this.debug) return;

        if (this.darknessLevel !== 0) {
            const opacity = Math.abs(this.darknessLevel * this.opacityStep);
            if (this.darknessLevel < 0) {
                // Darken
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            } else {
                // Lighten
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            }

            ctx.fillRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }
    }
}

class OnScreenWriting extends GameObject {
    constructor(canvas, camera, world) {
        super();
        this.canvas = canvas;
        this.camera = camera;
        this.world = world;

        this.displayText = {
            heading: { text: '', opacity: 0, fadeTimer: 0 },
            subheading: { text: '', opacity: 0, fadeTimer: 0 },
            paragraph: { text: '', opacity: 0, fadeTimer: 0 }
        };

        this.fadeConfig = {
            fadeInDuration: 500,
            displayDuration: 2000,
            fadeOutDuration: 1000,
            headingDelay: 0,
            subheadingDelay: 500,
            paragraphDelay: 1000
        };

        // Listen for text display events
        events.on('DISPLAY_TEXT', this, (data) => {
            this.displayText = {
                heading: {
                    text: data.heading || '',
                    opacity: 0,
                    fadeTimer: -this.fadeConfig.headingDelay
                },
                subheading: {
                    text: data.subheading || '',
                    opacity: 0,
                    fadeTimer: -this.fadeConfig.subheadingDelay
                },
                paragraph: {
                    text: data.paragraph || '',
                    opacity: 0,
                    fadeTimer: -this.fadeConfig.paragraphDelay
                }
            };
        });
    }

    update(delta) {
        ['heading', 'subheading', 'paragraph'].forEach(type => {
            const element = this.displayText[type];
            if (element.text) {
                element.fadeTimer += delta;
                const totalDuration = this.fadeConfig.fadeInDuration +
                    this.fadeConfig.displayDuration +
                    this.fadeConfig.fadeOutDuration;

                if (element.fadeTimer <= 0) {
                    element.opacity = 0;
                } else if (element.fadeTimer <= this.fadeConfig.fadeInDuration) {
                    element.opacity = element.fadeTimer / this.fadeConfig.fadeInDuration;
                } else if (element.fadeTimer <= this.fadeConfig.fadeInDuration + this.fadeConfig.displayDuration) {
                    element.opacity = 1;
                } else if (element.fadeTimer <= totalDuration) {
                    const fadeOutProgress = (element.fadeTimer - this.fadeConfig.fadeInDuration - this.fadeConfig.displayDuration)
                        / this.fadeConfig.fadeOutDuration;
                    element.opacity = 1 - fadeOutProgress;
                } else {
                    element.text = '';
                    element.opacity = 0;
                }
            }
        });
    }

    drawImage(ctx, drawPosX, drawPosY) {
        ctx.save();

        // Translate to center of viewport
        ctx.translate(
            this.canvas.width / 2,
            this.canvas.height / 4  // Position text in upper third of screen
        );

        // Configure text styles
        const styles = {
            heading: {
                font: 'bold 48px Oswald',
                y: 0, // Adjusted relative to translated position
                bgHeight: 60,
                padding: 20
            },
            subheading: {
                font: 'bold 32px Trocchi',
                y: 60, // Space below heading
                bgHeight: 40,
                padding: 15
            },
            paragraph: {
                font: '24px Trocchi',
                y: 120, // Space below subheading
                bgHeight: 30,
                padding: 10
            }
        };

        // Draw each text element
        Object.entries(this.displayText).forEach(([type, element]) => {
            if (element.text && element.opacity > 0) {
                const style = styles[type];
                ctx.font = style.font;

                // Measure text width for background
                const textWidth = ctx.measureText(element.text).width;
                const bgWidth = textWidth + (style.padding * 2);

                // Draw background
                ctx.fillStyle = `rgba(0, 0, 0, ${element.opacity * 0.5})`;
                ctx.fillRect(
                    -bgWidth / 2,
                    style.y - style.bgHeight / 2,
                    bgWidth,
                    style.bgHeight
                );

                // Draw text with outline for better visibility
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Thicker outline for larger text
                ctx.lineWidth = type === 'heading' ? 3 : 2;
                ctx.strokeStyle = `rgba(0, 0, 0, ${element.opacity})`;
                ctx.strokeText(element.text, 0, style.y);

                // Main text
                ctx.fillStyle = `rgba(255, 255, 255, ${element.opacity})`;
                ctx.fillText(element.text, 0, style.y);

                // Add subtle drop shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            }
        });

        ctx.restore();
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
