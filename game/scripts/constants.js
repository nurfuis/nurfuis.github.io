// constants
const tileTypes = {
    earth: 'tilesheetaseprite.png',
    water: 'water-tile-sheet.png',
    air: 'air-tile.png',
    wood: 'wood-tile.png',
    stone: 'cobblestone-tile.png'
};


const extendedMooreNeighbors = [{
    x: -2, // row 1
    y: -2
}, {
    x: -1,
    y: -2
}, {
    x: 0,
    y: -2
},
{
    x: 1,
    y: -2
}, {
    x: 2,
    y: -2
}, {
    x: -2, // row 2
    y: -1
},
{
    x: -1,
    y: -1
}, {
    x: 0,
    y: -1
}, {
    x: 1,
    y: -1
},
{
    x: 2,
    y: -1
}, {
    x: -2, // row 3
    y: 0
}, {
    x: -1,
    y: 0
},
{
    x: 0, // center
    y: 0
}, {
    x: 1,
    y: 0
}, {
    x: 2,
    y: 0
},
{
    x: -2, // row 4
    y: 1
}, {
    x: -1,
    y: 1
}, {
    x: 0,
    y: 1
},
{
    x: 1,
    y: 1
}, {
    x: 2,
    y: 1
}, {
    x: -2, // row 5
    y: 2
},
{
    x: -1,
    y: 2
}, {
    x: 0,
    y: 2
}, {
    x: 1,
    y: 2
},
{
    x: 2,
    y: 2
}
];

const vonNuemanNeighbors = [{
    x: -1,
    y: 0
}, {
    x: 1,
    y: 0
},
{
    x: 0,
    y: -1
}, {
    x: 0,
    y: 1
}
];

const rarityRates = [0.01, 0.05, 0.1, 0.2, 0.3]; // Rarity rates for each rarity level

const rarityLabels = ['legendary', 'epic', 'rare', 'uncommon', 'common']; // Rarity labels for each rarity level

const constants = {
    KEY_DELAY: 250,
    BREAK_BLOCK_DELAY: 350,
    PLAYER_RESPAWN_TIME: 3000,
    ITEM_COLLECT_RANGE: 32,
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

