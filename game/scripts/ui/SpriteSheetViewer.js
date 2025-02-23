class SpriteSheetViewer extends ToolPane {
    constructor() {
        super({
            id: 'sprite-viewer',
            title: 'SPRITE VIEWER',
            icon: '🎬',
            position: { right: '20px', top: '20px' },
            hotkey: 'F8',
            visible: false
        });

        this.sprite = null;
        this.isPlaying = false;
        this.currentRow = 0;
        this.frameTime = 100;
        this.setupViewer();
    }

    setupViewer() {
        // File Upload Section
        const uploadSection = this.addSection('Upload');
        this.addControl('Upload', {
            id: 'spritesheet',
            type: 'fileUpload',
            label: 'Sprite Sheet',
            accept: 'image/*',
            getValue: () => 'Choose File',
            setValue: (file) => this.loadSpriteSheet(file)
        });

        // Frame Settings Section
        const settingsSection = this.addSection('Frame Settings');
        const settings = {
            frameWidth: {
                type: 'number',
                label: 'Frame Width',
                min: 1,
                max: 1000,
                value: 32,
                onChange: () => this.updateSprite()
            },
            frameHeight: {
                type: 'number',
                label: 'Frame Height',
                min: 1,
                max: 1000,
                value: 32,
                onChange: () => this.updateSprite()
            },
            spacing: {
                type: 'number',
                label: 'Frame Spacing',
                min: 0,
                max: 100,
                value: 0,
                onChange: () => this.updateSprite()
            },
            frameTime: {
                type: 'range',
                label: 'Frame Time',
                min: 16,
                max: 500,
                value: 100,
                onChange: (value) => this.frameTime = value
            }
        };

        Object.entries(settings).forEach(([id, setting]) => {
            this.addControl('Frame Settings', {
                id,
                ...setting
            });
        });

        // Preview Section
        const previewSection = this.addSection('Preview');
        
        // Create preview canvas
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.width = 200;
        this.previewCanvas.height = 200;
        this.previewCanvas.className = 'sprite-preview';
        previewSection.content.appendChild(this.previewCanvas);

        // Animation Controls
        const controls = {
            row: {
                type: 'number',
                label: 'Row',
                min: 0,
                max: 0,
                value: 0,
                onChange: (value) => {
                    this.currentRow = value;
                    this.updatePreview();
                }
            },
            play: {
                type: 'button',
                label: 'Play/Pause',
                onClick: () => this.togglePlay()
            }
        };

        Object.entries(controls).forEach(([id, control]) => {
            this.addControl('Preview', {
                id,
                ...control
            });
        });

        this.startAnimationLoop();
    }

    async loadSpriteSheet(file) {
        const resource = new Resource(URL.createObjectURL(file));
        await resource.load();
        
        this.sprite = new Sprite({
            resource,
            frameSize: new Vector2(
                this.getControlValue('frameWidth'),
                this.getControlValue('frameHeight')
            ),
            spacing: this.getControlValue('spacing')
        });

        this.updateSprite();
    }

    updateSprite() {
        if (!this.sprite?.resource?.image) return;

        const frameWidth = this.getControlValue('frameWidth');
        const frameHeight = this.getControlValue('frameHeight');
        const image = this.sprite.resource.image;

        // Calculate total frames
        this.sprite.hFrames = Math.floor(image.width / frameWidth);
        this.sprite.vFrames = Math.floor(image.height / frameHeight);
        this.sprite.frameSize = new Vector2(frameWidth, frameHeight);
        this.sprite.spacing = this.getControlValue('spacing');
        this.sprite.buildFrameMap();

        // Update row control max value
        const rowControl = this.getControl('Preview', 'row');
        rowControl.max = this.sprite.vFrames - 1;

        this.updatePreview();
    }

    updatePreview() {
        if (!this.sprite?.resource?.image) return;

        const ctx = this.previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        // Calculate frame based on current row
        const framesInRow = this.sprite.hFrames;
        const frameInRow = Math.floor(this.sprite.frame % framesInRow);
        this.sprite.frame = this.currentRow * framesInRow + frameInRow;

        // Center and scale sprite in preview
        const scale = Math.min(
            this.previewCanvas.width / this.sprite.frameSize.x,
            this.previewCanvas.height / this.sprite.frameSize.y
        ) * 0.8;

        const x = (this.previewCanvas.width - this.sprite.frameSize.x * scale) / 2;
        const y = (this.previewCanvas.height - this.sprite.frameSize.y * scale) / 2;

        this.sprite.scale = scale;
        this.sprite.drawImage(ctx, x, y);
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playButton = this.getControl('Preview', 'play');
        playButton.textContent = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
    }

    startAnimationLoop() {
        let lastTime = 0;
        let accumulator = 0;

        const animate = (timestamp) => {
            if (lastTime === 0) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;

            if (this.isPlaying && this.sprite) {
                accumulator += delta;
                while (accumulator >= this.frameTime) {
                    const framesInRow = this.sprite.hFrames;
                    this.sprite.frame = (this.sprite.frame + 1) % framesInRow + 
                                      (this.currentRow * framesInRow);
                    accumulator -= this.frameTime;
                }
                this.updatePreview();
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}