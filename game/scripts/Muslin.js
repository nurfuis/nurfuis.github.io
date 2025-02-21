class Muslin {
    constructor(canvas) {
        this.canvas = canvas;
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.ctx = this.offscreenCanvas.getContext('2d');

        // Feywild color themes
        this.colors = {
            warm: [
                '#FF7D5C', // Sunset orange
                '#FFB85C', // Golden amber
                '#FF9EAA', // Rose pink
                '#FFC8A2', // Peach glow
                '#FFE5D9'  // Warm mist
            ],
            cool: [
                '#5CE1E6', // Crystal blue
                '#7ED957', // Emerald gleam
                '#8B62E8', // Twilight purple
                '#5CFFE7', // Aqua shine
                '#C8E6FF'  // Cool mist
            ]
        };

        this.currentColor = this.colors.warm[0];
        this.targetColor = this.colors.warm[0];
        this.transitionProgress = 0;
        this.transitionSpeed = 0.005;
        this.colorIndex = 0;
        this.isWarm = true;

        // Add keyboard listener
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(event) {
        // NumpadMultiply key (*)
        if (event.code === 'NumpadMultiply') {
            this.cycleColors();
        }
    }

    cycleColors() {
        // Switch between warm and cool colors
        this.isWarm = !this.isWarm;
        const palette = this.isWarm ? this.colors.warm : this.colors.cool;
        this.colorIndex = (this.colorIndex + 1) % palette.length;
        this.currentColor = this.targetColor;
        this.targetColor = palette[this.colorIndex];
        this.transitionProgress = 0;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    interpolateColor(progress) {
        const start = this.hexToRgb(this.currentColor);
        const end = this.hexToRgb(this.targetColor);
        
        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    update(delta) {
        if (this.transitionProgress < 1) {
            this.transitionProgress += this.transitionSpeed * delta;
            if (this.transitionProgress > 1) this.transitionProgress = 1;
        }

        // Create gradient effect
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height
        );

        const color = this.interpolateColor(this.transitionProgress);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.targetColor);

        // Draw gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(ctx) {
        // Draw offscreen canvas
        ctx.globalAlpha = 0.3; // Adjust for subtle background effect
        ctx.drawImage(this.offscreenCanvas, 0, 0);
        ctx.globalAlpha = 1;
    }
}