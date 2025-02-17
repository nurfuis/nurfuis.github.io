class Debug {
    constructor() {
        this.debug = false; // Initialize debug mode as disabled
        events.on('DEBUG_TOGGLE', this, (data) => {
            this.log('Debug mode toggled');
            this.toggle(); // Toggle debug mode
        });
    }
    update() {
        if (this.debug) {
            const debugMenu = document.getElementById('debug-menu');

            debugMenu.innerHTML = ''; // Clear the debug menu
            const canvas = document.getElementById('gameCanvas');
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const canvasDiv = document.createElement('div');
            debugMenu.appendChild(canvasDiv);
            canvasDiv.innerText = `Canvas size: ${canvasWidth}x${canvasHeight}`;

            const particleCount = this.particleSystem.particles.length;
            const particleCountDiv = document.createElement('div');
            debugMenu.appendChild(particleCountDiv);
            particleCountDiv.innerText = `Particle count: ${particleCount}`;
        }
    }  


    toggle() {
        this.debug = !this.debug;

        if (this.debug) {
            this.log('Debug mode enabled');
            const debugMenu = document.getElementById('debug-menu');
            debugMenu.style.display = 'block'; // Show the debug menu
            debugMenu.innerHTML = ''; // Clear the debug menu
            const canvas = document.getElementById('gameCanvas');
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const canvasDiv = document.createElement('div');
            debugMenu.appendChild(canvasDiv);
            canvasDiv.innerText = `Canvas size: ${canvasWidth}x${canvasHeight}`;

            const particleCount = this.particleSystem.particles.length;
            const particleCountDiv = document.createElement('div');
            debugMenu.appendChild(particleCountDiv);
            particleCountDiv.innerText = `Particle count: ${particleCount}`;
            
            this.darknessLayer.debug = true; // Enable darkness layer debug mode
            this.vignette.debug = true; // Enable vignette debug mode

            
        } else {
            this.log('Debug mode disabled');
            const debugMenu = document.getElementById('debug-menu');
            debugMenu.style.display = 'none'; // Hide the debug menu
            
            this.darknessLayer.debug = false; // Disable darkness layer debug mode
            this.vignette.debug = false; // Disable vignette debug mode
        }
    }

    log(message) {
        if (this.debug) {
            console.log(message);
        }
    }
}