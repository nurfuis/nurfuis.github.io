class Resources {
    static instance = null;
    static images = new Map();
    static tileSheets = new Map();
    static initialized = false;

    constructor() {
        if (Resources.instance) {
            return Resources.instance;
        }
        Resources.instance = this;
    }

    static initialize() {
        if (this.initialized) return;

        const tileTypes = {
            earth: 'tilesheetaseprite.png',
            water: 'water-tile-sheet.png',
            air: 'air-tile.png',
            wood: 'wood-tile.png',
            stone: 'cobblestone-tile.png',
            shadow: 'shadow.png',
        };

        this.loadTileSheets(tileTypes);
        this.initialized = true;


    }

    static loadTileSheets(tileTypes) {
        Object.entries(tileTypes).forEach(([type, filename]) => {
            const image = new Image();
            image.onload = () => {
                const sheet = this.analyzeTileSheet(image);
                this.images.set(type, image);
                this.tileSheets.set(type, {
                    image,
                    src: `assets/tiles/${filename}`,
                    variants: sheet.variants
                });
            };
            image.onerror = () => {
                console.error(`Failed to load tilesheet: ${type}`);
            };
            image.src = `assets/tiles/${filename}`;
        });
    }

    static analyzeTileSheet(img) {
        const baseSize = 32;
        const variants = [];
        
        const tilesX = Math.floor(img.width / baseSize);
        const tilesY = Math.floor(img.height / baseSize);

        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                variants.push({
                    x: x * baseSize,
                    y: y * baseSize,
                    w: baseSize,
                    h: baseSize
                });
            }
        }

        return {
            width: img.width,
            height: img.height,
            variants
        };
    }

    static getImage(key) {
        const image = this.images.get(key);
        if (!image) {
            console.warn(`Image not found: ${key}`);
            return null;
        }
        return image;
    }

    static getTileSheet(type) {
        const sheet = this.tileSheets.get(type);
        if (!sheet) {
            console.warn(`Tilesheet not found: ${type}`);
            return null;
        }
        return sheet;
    }

    static getTileVariant(type, variant) {
        const sheet = this.tileSheets.get(type);
        if (!sheet) {
            console.warn(`Tilesheet not found: ${type}`);
            return null;
        }
        return sheet.variants[variant] || null;
    }
}