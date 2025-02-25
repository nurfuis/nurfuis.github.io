class SplashScreen {
    constructor(game) {
        this.game = game;
        this.isActive = true;
        this.createScreen();

        
        if (Resources.initialized) {
            this.element.querySelector('.loading-indicator').remove();
        }

        events.on('TILE_SHEETS_INITIALIZED', () => {
            // update loading indicator
            console.log('Tile sheets loaded');
            this.element.querySelector('.loading-indicator').remove();
        });
    }

    createScreen() {
        this.element = document.createElement('div');
        this.element.className = 'splash-screen';
        this.element.innerHTML = `
            <div class="splash-content">
                <h1>${constants.GAME_TITLE}</h1>
                <p>Click anywhere to start</p>
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <span>Loading...</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.element);

        // Handle click/touch to start
        this.element.addEventListener('click', () => this.handleStart());
        this.element.addEventListener('touchstart', () => this.handleStart());
    }

    handleStart() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.element.classList.add('fade-out');

        this.game.start();
        this.element.innerHTML = '';

        // Remove after animation
        setTimeout(() => {
            this.element.remove();
        }, 300);
    }
}