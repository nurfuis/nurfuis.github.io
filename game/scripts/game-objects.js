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
        ctx.fillRect(-this.canvas.width / 2, 0, this.world.width, this.canvas.height);
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

class UnitDebugger extends GameObject {
    constructor(canvas, unit) {
        super();
        this.unit = unit;
        this.enabled = true;

        // Create debug container
        this.debugElement = document.createElement('div');
        this.debugElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 200px;
            background: rgba(0, 0, 0, 0.85);
            color: #ffffff;
            font-family: 'Cascadia Code', 'Source Code Pro', 'Consolas', monospace;
            font-size: 14px;
            padding: 10px;
            border-radius: 4px;
            z-index: 1000;
            display: none;
            pointer-events: none;
            width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        `;

        // Create elements for each debug property
        this.debugInfo = [
            { label: 'World:', getValue: () => this.unit.currentGameWorld },
            { label: 'Position', getValue: () => `x:${Math.round(this.unit.position.x)} y:${Math.round(this.unit.position.y)}` },
            { label: 'Target Position', getValue: () => this.unit.targetPosition ? `x:${this.unit.targetPosition.x} y:${this.unit.targetPosition.y}` : 'none' },
            { label: 'Current Tile', getValue: () => this.unit.currentTile?.type || 'none' },
            { label: 'Tile Below', getValue: () => this.unit.tileBelow?.type || 'none' },
            { label: 'Direction', getValue: () => this.unit.direction },
            { label: 'Facing', getValue: () => this.unit.facingDirection },
            { label: 'isIdling', getValue: () => this.unit.isIdling },
            { label: 'isMoving', getValue: () => this.unit.isMoving },
            { label: 'isJumping', getValue: () => this.unit.isJumping },
            { label: 'isFalling', getValue: () => this.unit.isFalling },
            { label: 'Fall Damage', getValue: () => Math.round(this.unit.fallingDamage) },
            { label: 'isFloating', getValue: () => this.unit.isFloating },
            { label: 'Recording', getValue: () => this.isReplaying ? 'REPLAY' : 'LIVE' },
            { label: 'History Size', getValue: () => `${this.movementHistory.length} frames` },
            {
                label: 'Replay Time', getValue: () => this.isReplaying ?
                    `${((Date.now() - this.replayStartTime) / 1000).toFixed(1)}s` : '-'
            },
        ];



        // Create header
        const header = document.createElement('div');
        header.textContent = '🔧 UNIT DEBUG INFO';
        header.style.cssText = `
            margin-bottom: 10px;
            font-weight: bold;
            color: #00ff00;
            padding: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;
        this.debugElement.appendChild(header);

        // Create elements for each property
        this.debugElements = this.debugInfo.map((info, index) => {
            const element = document.createElement('div');
            element.style.cssText = `
                padding: 4px 5px;
                margin-bottom: 2px;
                background-color: ${index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
                display: flex;
                justify-content: space-between;
            `;

            const labelSpan = document.createElement('span');
            labelSpan.style.color = '#888888';
            labelSpan.textContent = info.label;

            const valueSpan = document.createElement('span');
            valueSpan.style.color = '#ffffff';

            element.appendChild(labelSpan);
            element.appendChild(valueSpan);
            this.debugElement.appendChild(element);

            return {
                element,
                valueSpan
            };
        });

        // Add to document
        document.body.appendChild(this.debugElement);

        // Toggle debug display with F3
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                this.enabled = !this.enabled;
                this.debugElement.style.display = this.enabled ? 'block' : 'none';
            }
        });


        // Add replay properties
        this.historyDuration = 30000; // 30 seconds in ms
        this.replaySpeed = 1; // 1 = normal speed, 2 = double speed, etc.
        this.isReplaying = false;
        this.replayStartTime = 0;
        this.currentReplayIndex = 0;

        // Store movement history
        this.movementHistory = [];
        this.lastRecordTime = Date.now();
        this.recordInterval = 16; // Record every 16ms (roughly 60fps)

        // Add replay info to debug display
        this.currentGameWorld = null;



        // Add replay controls listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.toggleReplay();
            }
        });



    }
    recordState() {
        if (!!this.currentGameWorld) {
            this.currentGameWorld = null;
        }
        const now = Date.now();
        if (now - this.lastRecordTime >= this.recordInterval) {
            this.lastRecordTime = now;

            // Record current state
            const state = {
                timestamp: now,
                position: { x: this.unit.position.x, y: this.unit.position.y },
                direction: this.unit.direction,
                facingDirection: this.unit.facingDirection,
                isMoving: this.unit.isMoving,
                isFalling: this.unit.isFalling,
                isFloating: this.unit.isFloating,
                fallingDamage: this.unit.fallingDamage,
                currentTile: this.unit.currentTile?.type,
                tileBelow: this.unit.tileBelow?.type,
                currentGameWorld: this.unit?.currentGameWorld
            };

            this.movementHistory.push(state);

            // Trim history to duration limit
            const cutoffTime = now - this.historyDuration;
            this.movementHistory = this.movementHistory.filter(state =>
                state.timestamp >= cutoffTime
            );
        }
    }

    toggleReplay() {
        if (this.isReplaying) {
            // Stop replay
            this.isReplaying = false;
            // Restore unit's current state
            Object.assign(this.unit.position, this.currentPosition);
        } else {
            // Start replay
            this.isReplaying = true;
            this.replayStartTime = Date.now();
            this.currentReplayIndex = 0;
            // Store current position to restore later
            this.currentPosition = {
                x: this.unit.currentTile.x,
                y: this.unit.currentTile.y
            };
        }
    }
    step(delta, root) {
        if (!this.enabled) return;

        if (this.isReplaying) {
            // Handle replay playback
            const replayTime = Date.now() - this.replayStartTime;
            const targetIndex = Math.floor((replayTime * this.replaySpeed) / this.recordInterval);

            if (targetIndex >= this.movementHistory.length) {
                this.toggleReplay(); // End replay when finished
            } else {
                const state = this.movementHistory[targetIndex];


                if (this.currentGameWorld !== state.currentGameWorld) {
                    this.currentGameWorld = state.currentGameWorld;
                    events.emit('CHANGE_GAME_WORLD', { world: this.currentGameWorld });
                }
                
                // Apply historical state to unit
                Object.assign(this.unit.position, state.position);
                this.unit.direction = state.direction;
                this.unit.facingDirection = state.facingDirection;
                this.unit.isMoving = state.isMoving;
                this.unit.isFalling = state.isFalling;
                this.unit.isFloating = state.isFloating;
                this.unit.fallingDamage = state.fallingDamage;
            }
        } else {
            // Record current state
            this.recordState();
        }


        // Update each debug element
        this.debugElements.forEach((element, index) => {
            const info = this.debugInfo[index];
            element.valueSpan.textContent = info.getValue();

            // Update value color based on state
            if (info.label === 'Health' || info.label === 'Energy' || info.label === 'Oxygen') {
                const value = parseFloat(info.getValue());
                if (value < 30) {
                    element.valueSpan.style.color = '#ff4444';
                } else if (value < 70) {
                    element.valueSpan.style.color = '#ffaa44';
                } else {
                    element.valueSpan.style.color = '#44ff44';
                }
            }
        });
    }

    // Override drawImage since we're using DOM
    drawImage(ctx, drawPosX, drawPosY) {
        // No canvas drawing needed
    }

    // Clean up when destroyed
    destroy() {
        this.debugElement.remove();
        super.destroy();
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
            
            // Calculate scale and dimensions after image loads
            this.scale = Math.max(
                this.canvas.width / this.image.width,
                this.canvas.height / this.image.height
            );
            
            // Calculate dimensions to cover viewport
            this.width = this.image.width * this.scale;
            this.height = this.image.height * this.scale;
        };
        this.image.src = 'images/bg-2.png';
        
        // Initial position
        this.position = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);
    }

    update(delta) {
        if (!this.isImageLoaded) return;
        
        // Update parallax offset based on camera position
        this.offset.x = -this.camera.position.x * this.scrollSpeed;
        this.offset.y = -this.camera.position.y * this.scrollSpeed;
        
        // Wrap offset to prevent image tearing
        this.offset.x = this.offset.x % this.width;
        this.offset.y = this.offset.y % this.height;
    }

    drawImage(ctx) {
        if (!this.isImageLoaded) return;
        
        ctx.save();
        
        // Draw main image and wrapped copies for seamless scrolling
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                ctx.drawImage(
                    this.image,
                    this.offset.x + (x * this.width),
                    this.offset.y + (y * this.height),
                    this.width,
                    this.height
                );
            }
        }
        
        ctx.restore();
    }
}