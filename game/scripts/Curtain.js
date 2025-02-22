class Curtain {
    constructor(canvas, camera, world) {
        this.canvas = canvas;
        this.world = world;
        this.camera = camera;


        // Add validation for panel dimensions
        this.minPadding = this.world.tileSize;
        this.maxWidth = this.canvas.width;
        this.maxHeight = this.canvas.height;




        // Panel properties
        const halfWidth = this.canvas.width / 2;
           
        this.leftPanel = { x: 0, width: halfWidth };
        this.rightPanel = {
                x: this.canvas.width - halfWidth,
                width: halfWidth
            },
            this.topPanel = { y: 0, height: this.canvas.height / 2 };
            this.bottomPanel = {
                y: this.canvas.height - this.canvas.height / 2,
                height: this.canvas.height / 2
            }

        // Animation properties
        this.targetState = {};
        this.isAnimating = false;
        this.animationSpeed = 0.1; // Slowed down for smoother transitions with larger panels

        // Solid black color
        this.color = '#000000';

        // Default to world view
        this.setPreset('world');

        // Add preset cycling properties
        this.presets = ['world', 'wide', 'open', 'sides', 'open', 'top-bottom', 'closed', 'tight' ];

        this.currentPresetIndex = 0;

        // Add keyboard listener
        window.addEventListener('keydown', this.handleKeyPress.bind(this));


    }

    setPreset(preset) {
        // Ensure padding is consistent across all presets
        const padding = this.world.tileSize * 2;
        const quarterWidth = this.canvas.width / 4;
        const quarterHeight = this.canvas.height / 4;

        switch (preset) {
            case 'world':
                this.targetState = {
                    leftPanel: { width: quarterWidth - padding },
                    rightPanel: {
                        x: this.canvas.width - quarterWidth + padding,
                        width: quarterWidth + padding
                    },
                    topPanel: { height: this.canvas.height / 6 - padding },
                    bottomPanel: {
                        y: this.canvas.height - quarterHeight + padding,
                        height: quarterHeight + padding
                    }
                };
                break;

            case 'wide':
                const sixthWidth = this.canvas.width / 6;
                this.targetState = {
                    leftPanel: { width: sixthWidth - padding },
                    rightPanel: {
                        x: this.canvas.width - sixthWidth + padding,
                        width: sixthWidth + padding
                    },
                    topPanel: { height: this.canvas.height / 8 - padding },
                    bottomPanel: {
                        y: this.canvas.height - quarterHeight + padding,
                        height: quarterHeight + padding
                    }
                };
                break;

            case 'open':
                this.targetState = {
                    leftPanel: { width: 0 },
                    rightPanel: { x: this.canvas.width, width: 0 },
                    topPanel: { height: 0 },
                    bottomPanel: { y: this.canvas.height, height: 0 }
                };
                break;
            case 'tight':
                const halfWidth = this.canvas.width / 2;
                const halfHeight = this.canvas.height / 2;
                this.targetState = {
                    leftPanel: { width: halfWidth - padding * 6 },
                    rightPanel: {
                        x: this.canvas.width - halfWidth + padding * 8,
                        width: halfWidth + padding * 6
                    },
                    topPanel: { height: halfHeight - padding * 4 },
                    bottomPanel: {
                        y: this.canvas.height - halfHeight + padding * 2,
                        height: halfHeight + padding * 4
                    }
                };
                break;
            case 'sides':
                this.targetState = {
                    leftPanel: { width: (this.canvas.width / 4) - padding },
                    rightPanel: {
                        x: this.canvas.width - (this.canvas.width / 4) + padding,
                        width: this.canvas.width / 4 + padding
                    },
                    topPanel: { height: 0 },
                    bottomPanel: {
                        y: this.canvas.height - (this.canvas.height / 2) + padding * 2,
                        height: 0
                    }
                };
                break;
            case 'top-bottom':
                // Show only camera view area
                this.targetState = {
                    leftPanel: { width: 0 },
                    rightPanel: {
                        x: this.canvas.width - (this.canvas.width / 4) + padding,
                        width: 0
                    },
                    topPanel: { height: this.canvas.height / 6 - padding },
                    bottomPanel: {
                        y: this.canvas.height - (this.canvas.height / 4) + padding,
                        height: this.canvas.height / 2 + padding
                    }
                };
                break;
            case 'closed':
                // Show only camera view area
                this.targetState = {
                    leftPanel: { width: this.canvas.width / 2 },
                    rightPanel: {
                        x: this.canvas.width - (this.canvas.width / 2),
                        width: this.canvas.width / 2
                    },
                    topPanel: { height: this.canvas.height / 2 },   
                    bottomPanel: {
                        y: this.canvas.height - (this.canvas.height / 2),
                        height: this.canvas.height / 2
                    }
                };
                break;
        }

        // Validate panel positions
        Object.keys(this.targetState).forEach(panel => {
            if (this.targetState[panel].width) {
                this.targetState[panel].width = Math.max(0, Math.min(this.targetState[panel].width, this.maxWidth));
            }
            if (this.targetState[panel].height) {
                this.targetState[panel].height = Math.max(0, Math.min(this.targetState[panel].height, this.maxHeight));
            }
            if (this.targetState[panel].x) {
                this.targetState[panel].x = Math.max(0, Math.min(this.targetState[panel].x, this.maxWidth));
            }
            if (this.targetState[panel].y) {
                this.targetState[panel].y = Math.max(0, Math.min(this.targetState[panel].y, this.maxHeight));
            }
        });

        this.isAnimating = true;
    }

    handleKeyPress(event) {
        // NumpadDivide key (/)
        if (event.code === 'NumpadDivide') {
            this.currentPresetIndex = (this.currentPresetIndex + 1) % this.presets.length;
            this.setPreset(this.presets[this.currentPresetIndex]);
        }
    }

    update(delta) {
        if (!this.isAnimating) return;

        let stillAnimating = false;

        // Animate each panel
        ['leftPanel', 'rightPanel', 'topPanel', 'bottomPanel'].forEach(panel => {
            Object.keys(this.targetState[panel]).forEach(prop => {
                const current = this[panel][prop];
                const target = this.targetState[panel][prop];
                const diff = target - current;

                if (Math.abs(diff) > 0.1) {
                    this[panel][prop] += diff * this.animationSpeed;
                    stillAnimating = true;
                } else {
                    this[panel][prop] = target;
                }
            });
        });

        this.isAnimating = stillAnimating;
    }

    draw(ctx) {
        // Draw solid black panels
        ctx.fillStyle = this.color;

        // Left panel
        ctx.fillRect(0, 0, this.leftPanel.width, this.canvas.height);

        // Right panel
        ctx.fillRect(this.rightPanel.x, 0, this.rightPanel.width, this.canvas.height);

        // Top panel
        ctx.fillRect(0, 0, this.canvas.width, this.topPanel.height);

        // Bottom panel
        ctx.fillRect(0, this.bottomPanel.y, this.canvas.width, this.bottomPanel.height);
    }

    get currentPreset() {
        return this.presets[this.currentPresetIndex];
    }
}