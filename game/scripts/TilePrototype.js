class TilePrototype {
    constructor(config) {
        this.type = config.type;
        this.solid = config.solid;
        this.breakable = config.breakable;
        this.passable = config.passable;
        this.climbable = config.climbable;
        this.baseDurability = config.durability;
        this.baseColor = config.color;
        this.variants = config.variants || [];
    }

    createTile(x, y, variant = 0) {
        return {
            type: this.type,
            x,
            y,
            solid: this.solid,
            breakable: this.breakable,
            passable: this.passable,
            climbable: this.climbable,
            durability: this.baseDurability,
            color: this.variants[variant]?.color || this.baseColor,
            variant,
            worldSpawnPoint: false,
            // Add serialization helper
            toJSON() {
                return {
                    type: this.type,
                    x: this.x,
                    y: this.y,
                    variant: this.variant,
                    worldSpawnPoint: this.worldSpawnPoint,
                    // Only save non-default values
                    ...(this.durability !== this.baseDurability && { durability: this.durability })
                };
            }
        };
    }
}

// Create tile prototypes with variants
const tilePrototypes = {
    air: new TilePrototype({
        type: 'air',
        solid: false,
        breakable: false,
        passable: true,
        climbable: false,
        durability: 100,
        color: 'purple',
        variants: [
            { color: 'purple' },
            { color: 'darkpurple' }
        ]
    }),
    earth: new TilePrototype({
        type: 'earth',
        solid: true,
        breakable: false,
        passable: false,
        climbable: false,
        durability: 100,
        color: 'brown',
        variants: [
            { color: 'brown' },
            { color: 'darkbrown', durability: 150 },
            { color: 'lightbrown', durability: 75 }
        ]
    }),
    water: new TilePrototype({
        type: 'water',
        solid: false,
        breakable: false,
        passable: true,
        climbable: false,
        durability: 100,
        color: 'blue',
        variants: [
            { color: 'blue' },
            { color: 'darkblue' }
        ]
    }),
    wood: new TilePrototype({
        type: 'wood',
        solid: true,
        breakable: true,
        passable: false,
        climbable: false,
        durability: 50,
        color: 'brown',
        variants: [
            { color: 'brown' },
            { color: 'darkbrown', durability: 75 },
            { color: 'lightbrown', durability: 30 }
        ]
    }),
    stone: new TilePrototype({
        type: 'stone',
        solid: true,
        breakable: true,
        passable: false,
        climbable: false,
        durability: 100,
        color: 'gray',
        variants: [
            { color: 'gray' },
            { color: 'darkgray', durability: 150 },
            { color: 'lightgray', durability: 75 }
        ]
    })
};

// Tile factory functions
const createTile = (type, x, y, variant = 0) => {
    const prototype = tilePrototypes[type];
    if (!prototype) {
        throw new Error(`Unknown tile type: ${type}`);
    }
    return prototype.createTile(x, y, variant);
};

// Helper functions for common tiles
const tiles = {
    air: (x, y, variant) => createTile('air', x, y, variant),
    earth: (x, y, variant) => createTile('earth', x, y, variant),
    water: (x, y, variant) => createTile('water', x, y, variant),
    wood: (x, y, variant) => createTile('wood', x, y, variant),
    stone: (x, y, variant) => createTile('stone', x, y, variant)
};

// World loading/saving helpers
const serializeTile = (tile) => tile.toJSON();

const deserializeTile = (data) => {
    const prototype = tilePrototypes[data.type];
    if (!prototype) {
        throw new Error(`Unknown tile type: ${data.type}`);
    }
    const tile = prototype.createTile(data.x, data.y, data.variant);
    // Restore any saved custom values
    return { ...tile, ...data };
};