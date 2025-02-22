const x = 0;
const y = 0;
const type = 'air';
const solid = false;
const breakable = false;
const worldSpawnPoint = false;
const passable = true;
const climbable = false;
const durability = 100;
const color = 'black';
const variant = 0;

const tile = {
    type,
    x,
    y,
    solid,
    breakable,
    worldSpawnPoint,
    passable,
    climbable,
    durability,
    color,
    variant
};

const terrainTypes = ['air', 'earth', 'water', 'wood', 'stone', 'foliage'];

const terrainColors = {
    'air': 'purple',
    'earth': 'brown',
    'water': 'blue',
    'wood': 'grey',
    'stone': 'grey',
    'foliage': 'green'
};
const terrainSolid = {
    'air': false,
    'earth': true,
    'water': false,
    'wood': true,
    'stone': true,
    'foliage': true
};
const terrainPassable = {
    'air': true,
    'earth': false,
    'water': true,
    'wood': false,
    'stone': false,
    'foliage': false
};
const terrainBreakable = {
    'air': false,
    'earth': false,
    'water': false,
    'wood': true,
    'stone': false,
    'foliage': true

};
const terrainDurability = {
    'air': 100,
    'earth': 100,
    'water': 100,
    'wood': 100,
    'stone': 100,
    'foliage': 100
};
const terrainClimbable = {
    'air': false,
    'earth': false,
    'water': false,
    'wood': false,
    'stone': false,
    'foliage': false
};

const air = (x, y) => generateTile(x, y, 0);
const earth = (x, y) => generateTile(x, y, 1);
const water = (x, y) => generateTile(x, y, 2);
const wood = (x, y) => generateTile(x, y, 3);
const stone = (x, y) => generateTile(x, y, 4);
const foliage = (x, y) => generateTile(x, y, 5);

function generateTile(x, y, index) {
    const type = terrainTypes[index];
    const color = terrainColors[type];
    const solid = terrainSolid[type];
    const passable = terrainPassable[type];
    const breakable = terrainBreakable[type];
    const durability = terrainDurability[type];
    const climbable = terrainClimbable[type];
    const worldSpawnPoint = false;
    const variant = 0;

    return {
        type,
        x,
        y,
        solid,
        breakable,
        worldSpawnPoint,
        passable,
        climbable,
        durability,
        color,
        variant
    };
}

function generateCombinedWorld(world, runLength = 20) {
    // Store original world dimensions for a single section
    const sectionWidth = world.width / runLength;
    const originalWidth = world.width;
    console.log('Combined world width: ' + originalWidth);
    console.log('Section width: ' + sectionWidth);

    // Store section generators in array for random selection
    const sectionGenerators = [
        generateFlatWorld,
        generateHillsWorld,
        generateForestWorld,
        generateFloatingIslandWorld,
        generateShallowWaterWorld,
        generateSapForestWorld,
        generateEarthLedge,
        generatePoolWater,
        generateColumnWater
    ];

    // Temporarily modify world size to generate sections
    world.width = sectionWidth;

    // Generate all sections
    const combinedTiles = [];

    // Generate sections based on run length
    for (let i = 0; i < runLength; i++) {
        // Randomly select a section generator
        const randomGenerator = sectionGenerators[Math.floor(Math.random() * sectionGenerators.length)];
        const sectionTiles = randomGenerator(world);

        // Offset tiles for this section
        const offsetTiles = sectionTiles.world(tile => ({
            ...tile,
            x: tile.x + (sectionWidth * i),
            worldSpawnPoint: false // Reset spawn point
        }));

        combinedTiles.push(...offsetTiles);
    }

    // Restore original world size
    world.width = originalWidth;

    return combinedTiles;
}
function generateFlatWorld(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    newTile = water(tileX, tileY);
                }


                else if (y === 5) {
                    newTile = earth(tileX, tileY);
                }

                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);

            }
        }
    }

    return tiles;

}
function makeSuperFlat(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                let newTile = tile;

                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 15) {
                    newTile = stone(tileX, tileY);
                }

                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    return tiles;

}
function generateHillsWorld(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);
    const tileSize = world.tileSize;
    const tiles = [];

    firstPass();
    secondPass();
    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    newTile = water(tileX, tileY);
                }


                else if (y === 5) {
                    newTile = earth(tileX, tileY);
                }

                else if (y === 4) {
                    if (x >= 2 && x <= 5) {

                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }

                else if (y === 3) {
                    if (x >= 3 && x <= 4) {

                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }

                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }
    // Second pass for spawn point
    function secondPass() {
        let worldSpawnFound = false;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tileX = x * tileSize;
                const tileY = y * tileSize;

                const tile = tiles.find(t => t.x === tileX && t.y === tileY);
                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);


            }
        }
    }
    return tiles;
}
function generateEarthLedge(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);
    const tileSize = world.tileSize;
    const tiles = [];

    firstPass();
    secondPass();
    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    newTile = water(tileX, tileY);
                }


                else if (y === 5) {
                    newTile = earth(tileX, tileY);
                }

                else if (y === 4) {
                    if (x >= 3 && x <= 5) {

                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }

                else if (y === 3) {
                    if (x === 3 || x === 5) {

                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }
                else if (y === 2) {
                    if (x === 5) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }
                else if (y === 1) {
                    if (x === 0 || x === 1 || x === 4) {
                        newTile = stone(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }
                else if (y === 0) {
                    if (x === 5) {
                        newTile = stone(tileX, tileY);
                    } else {
                        newTile = air(tileX, tileY);
                    }
                }

                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }
    // Second pass for spawn point
    function secondPass() {
        let worldSpawnFound = false;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tileX = x * tileSize;
                const tileY = y * tileSize;

                const tile = tiles.find(t => t.x === tileX && t.y === tileY);
                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);


            }
        }
    }
    return tiles;
}
function generateForestWorld(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    newTile = water(tileX, tileY);
                }


                else if (y === 5) {
                    newTile = earth(tileX, tileY);
                }


                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {


        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);

                if (x === 3) {
                    if (y === 4 || y === 3) {
                        const newTile = wood(tileX, tileY);
                        newTile.variant = 1;
                        Object.assign(tile, newTile);

                    }
                }
                if (x === 4 || x === 2 || x === 3) {
                    if (y === 2 || y === 1) {
                        Object.assign(tile, foliage(tileX, tileY));
                    }
                }
                if (x === 3) {
                    if (y === 0) {
                        Object.assign(tile, foliage(tileX, tileY));
                    }
                }

            }
        }
    }

    return tiles;

}
function generateFloatingIslandWorld(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    newTile = water(tileX, tileY);
                }


                else if (y === 5) {
                    newTile = earth(tileX, tileY);
                }


                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);


                if (x === 4 || x === 2 || x === 3) {
                    if (y === 3) {
                        Object.assign(tile, stone(tileX, tileY));
                    }
                }
            }
        }
    }
    return tiles;
}
function generateShallowWaterWorld(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    if (x >= 5) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = water(tileX, tileY);
                    }
                }


                else if (y === 5) {
                    if (x <= 1 || x >= 6) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = water(tileX, tileY);
                    }
                }

                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);

            }
        }
    }
    return tiles;
}
function generatePoolWater(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    if (x >= 5) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = water(tileX, tileY);
                    }
                }


                else if (y === 5) {
                    if (x <= 2 || x >= 6) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = water(tileX, tileY);
                    }
                }
                else if (y === 4) {
                    if (x === 2 || x === 6) {
                        newTile = earth(tileX, tileY);
                    } else {
                        if (x >= 3 && x <= 5) {
                            newTile = water(tileX, tileY);
                        } else {
                            newTile = air(tileX, tileY);
                        }
                    }
                }
                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);

            }
        }
    }
    return tiles;
}
function generateColumnWater(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    if (x >= 5) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = water(tileX, tileY);
                    }
                }


                else if (y === 5) {
                    if (x <= 2 || x >= 6) {
                        newTile = earth(tileX, tileY);
                    } else {
                        newTile = water(tileX, tileY);
                    }
                }
                else if (y === 4) {
                    if (x === 2 || x === 6 || x === 5 || x === 3) {
                        newTile = earth(tileX, tileY);
                    } else {
                        if (x >= 3 && x <= 5) {
                            newTile = water(tileX, tileY);
                        } else {
                            newTile = air(tileX, tileY);
                        }
                    }
                }
                else if (y === 3) {
                    if (x === 3 || x === 5) {
                        newTile = earth(tileX, tileY);
                    } else {
                        if (x >= 3 && x <= 5) {
                            newTile = water(tileX, tileY);
                        } else {
                            newTile = air(tileX, tileY);
                        }
                    }
                }


                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);

            }
        }
    }
    return tiles;
}
function generateSapForestWorld(world) {
    const rows = Math.ceil(world.height / world.tileSize);
    const cols = Math.ceil(world.width / world.tileSize);

    const tileSize = world.tileSize;

    let tiles = []

    firstPass();
    secondPass();

    function firstPass() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const noiseValue = perlin(x / 10, y / 10);

                let newTile = tile;
                const tileX = x * tileSize;
                const tileY = y * tileSize;


                if (y === 7) {
                    newTile = stone(tileX, tileY);
                }


                else if (y === 6) {
                    newTile = water(tileX, tileY);
                }


                else if (y === 5) {
                    newTile = earth(tileX, tileY);
                }


                else {
                    newTile = air(tileX, tileY);
                }


                tiles.push(newTile);
            }
        }
    }

    function secondPass() {


        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const tileX = x * tileSize;
                const tileY = y * tileSize;

                let tile = tiles.find(t => t.x === tileX && t.y === tileY);

                const tileAbove = tiles.find(t => t.x === tileX && t.y === tileY - tileSize);
                const tileBelow = tiles.find(t => t.x === tileX && t.y === tileY + tileSize);

                const trees = [2, 6, 10, 14, 18];

                trees.forEach(tree => {
                    drawSmallTree(x, y, tree, tile);
                });

                function drawSmallTree(x, y, treeX, tile) {

                    if (x === treeX) {
                        if (y === 5 || y === 4 || y === 3) {
                            const newTile = wood(tileX, tileY);
                            newTile.variant = 1;
                            Object.assign(tile, newTile);

                        }
                    }
                    if (x === treeX || x === treeX - 1 || x === treeX + 1) {
                        if (y === 2 || y === 1) {
                            Object.assign(tile, foliage(tileX, tileY));
                        }
                    }
                    if (x === treeX) {
                        if (y === 0) {
                            Object.assign(tile, foliage(tileX, tileY));
                        }
                    }

                }
                const random = Math.random();
                if (tile.type === 'wood' && y === 5) {
                    const sap = new Sap(world.canvas, new Vector2(tile.x, tile.y));
                    world.addChild(sap);
                }


            }
        }
    }

    return tiles;

}


