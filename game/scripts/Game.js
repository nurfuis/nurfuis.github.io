class Game {
    async init(worldEdit) {
        await TileSheetConfig.initialize();
        this.tilePalette = new TilePalette(worldEdit);
        this.tilePalette.isVisible = PanelStateManager.getVisibilityState('tile-palette');
    }
    constructor(canvas, main) {

        this.canvas = canvas;
        this.world = main.world;
        this.player = main.player;
        this.camera = main.camera;
        
        this.autoSaveInterval = 30000; // Save every 30 seconds
        this.lastAutoSave = Date.now();
        
        // Initialize UI indicator
        this.uiIndicator = new UI();

        // Initialize with fresh state if debug flag is set
        if (window.DEBUG?.BYPASS_SAVE) {
            console.log('Debug mode: Bypassing saved game state');
            this.initializeCleanState();
        } else {
            this.loadGameState();
            this.uiIndicator.showAutoLoadIndicator();

        }
        
        // Set up auto-save and save-on-exit
        this.setupAutoSave();


        // Initialize console
        this.console = new Console(this);
        console.isVisible = PanelStateManager.getVisibilityState('game-console');

        const worldEdit = new WorldEditMenu(canvas, main);
        this.worldEdit = worldEdit;
        worldEdit.isVisible = PanelStateManager.getVisibilityState('world-edit');
        

        const stageManager = new StageManager(canvas, {
          muslin: main.muslin,
          curtain: main.curtain,
          darkness: main.darkness,
          background: main.farBackground
        });
        this.devMenu = stageManager;
        stageManager.isVisible = PanelStateManager.getVisibilityState('stage-manager');
      
        this.init(worldEdit);

    }

    initializeCleanState() {
        // Set default world
        this.world.initializeGameWorld(DEBUG.WORLD_TYPE);
        
        // Reset player position
        this.player.position = { ...DEBUG.DEFAULT_POSITION };
        this.player.inventory = [];

        
        events.emit('GAME_STATE_RESET');
    }

    setupAutoSave() {
        // Auto-save interval
        setInterval(() => this.saveGameState(), this.autoSaveInterval);

        // Save on page close/refresh
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });

    }

    saveGameState() {
        this.uiIndicator.showAutoSaveIndicator();

        const gameState = {
            timestamp: Date.now(),
            world: {
                type: this.world.type,
                tiles: this.world.tiles.map(tile => ({
                    type: tile.type,
                    variant: tile.variant,
                    x: tile.x,
                    y: tile.y,
                    solid: tile.solid,
                    breakable: tile.breakable,
                    durability: tile.durability
                }))
            },
            player: {
                position: this.player.position,
            },

        };

        try {
            localStorage.setItem('gameState', JSON.stringify(gameState));
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }

    loadGameState() {
        try {
            const savedState = localStorage.getItem('gameState');
            if (!savedState) return;

            const gameState = JSON.parse(savedState);
            
            // Check if save is too old (e.g., more than 24 hours)
            const saveAge = Date.now() - gameState.timestamp;
            if (saveAge > 24 * 60 * 60 * 1000) { // 24 * 60 * 60 * 1000
                console.log('Save file too old, starting fresh');
                return;
            }

            // Restore world state
            this.world.initializeGameWorld(gameState.world.type);
            gameState.world.tiles.forEach(tileData => {
                const tile = createTile(tileData.type, tileData.x, tileData.y, tileData.variant);
                Object.assign(tile, tileData);
                this.world.setTile(
                    Math.floor(tileData.x / this.world.tileSize), 
                    Math.floor(tileData.y / this.world.tileSize), 
                    tile
                );
            });

            // Restore player state
            this.player.position = gameState.player.position;
            this.player.inventory = gameState.player.inventory;
            // Object.assign(this.player.stats, gameState.player.stats);



            console.log('Game state loaded:', gameState);
            events.emit('GAME_STATE_LOADED');
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    }

    getSaveData() {
        return {
            world: {
                type: this.world.type,
                tiles: this.world.tiles.map(tile => ({
                    type: tile.type,
                    variant: tile.variant,
                    x: tile.x,
                    y: tile.y,
                    solid: tile.solid,
                    breakable: tile.breakable,
                    durability: tile.durability
                }))
            },
            player: {
                position: this.player.position,
                inventory: this.player.inventory
            }
        };
    }

    loadSaveData(data) {
        if (!data) return;
        
        // Restore world
        if (data.world) {
            this.world.loadState(data.world);
        }
        
        // Restore player
        if (data.player) {
            Object.assign(this.player.position, data.player.position);
            Object.assign(this.player.inventory, data.player.inventory);
        }

        events.emit('GAME_STATE_LOADED');
    }
}