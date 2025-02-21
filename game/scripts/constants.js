// constants

const world = 'superFlat';

const gameWorlds = {
    flat: {
        type: 'flat',
        name: 'Flat Land',
        paragraph: 'Move up, down, and side to side by pressing movement keys (Arrows or WASD).',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    hills: {
        type: 'hills',
        name: 'Small Hill',
        paragraph: 'Move diagonally by pressing two directions at the same time.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    ledge: {
        type: 'ledge',
        name: 'Small Ledge',
        paragraph: 'Press the space key to jump. Try jumping with a directional key.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    shallowWater: {
        type: 'shallowWater',
        name: 'Shallow Water',
        paragraph: 'A shallow body of water.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    poolWater: {
        type: 'poolWater',
        name: 'Pool of Water',
        paragraph: 'A pool of water.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    columnWater: {
        type: 'columnWater',
        name: 'Column of Water',
        paragraph: 'A column of water.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },
    forest: {
        type: 'forest',
        name: 'Small Tree',
        paragraph: 'Some blocks can be broken by moving towards them.',
        width: 512,
        height: 512,
        tileSize: 64,
        lengthOfRun: 1
    },

    sapForest: {
        type: 'sapForest',
        name: 'Sap Wood',
        paragraph: 'Collecting sap restores some hunger.',
        width: 512 * 3,
        height: 512,
        tileSize: 64,
        lengthOfRun: 3
    },
    combined: {
        type: 'combined',
        name: 'Adventure Land',
        paragraph: 'A land of flat land, hills, forests, and shallow water.',
        width: 512 * 20,
        height: 512,
        tileSize: 64,
        lengthOfRun: 20
    },
    underworld: {
        type: 'underworld',
        name: 'Underworld',
        paragraph: 'A land of darkness and danger.',
        width: 12800,
        height: 12800,
        tileSize: 64,
        lengthOfRun: 1

    },
    superFlat: {
        type: 'superFlat',
        name: 'Super Flat Land',
        paragraph: 'A land of flat land.',
        width: 512 * 20,
        height: 512,
        tileSize: 32,
        lengthOfRun: 20,
    }
};

// const world should return the game world object


const rarityRates = [0.01, 0.05, 0.1, 0.2, 0.3]; // Rarity rates for each rarity level
const rarityLabels = ['legendary', 'epic', 'rare', 'uncommon', 'common']; // Rarity labels for each rarity level

const constants = {
    KEY_DELAY: 250,
    BREAK_BLOCK_DELAY: 350,
    PLAYER_RESPAWN_TIME: 3000,
    ITEM_COLLECT_RANGE: 64,
    SIMULATION_RANGE: 640,
    GAS_CLOUD_DURATION: 5000,
    ITEM_SIZE: 64,
    PLAYER_SPEED: 100,
    PLAYER_NAME: 'Player',
    PLAYER_SPAWN: { x: 1, y: 4 },
    PLAYER_TEAM: 'Player Team',
    PLAYER_SPRITE_Y_OFFSET: -73,
    PLAYER_SPRITE_X_OFFSET: 0,
}

