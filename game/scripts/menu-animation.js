document.addEventListener('DOMContentLoaded', () => {
    const menuCanvas = document.getElementById('menuCanvas');
    const menuCtx = menuCanvas.getContext('2d');
    menuCanvas.width = window.innerWidth;
    menuCanvas.height = window.innerHeight;

    const cellSize = 32;
    const cols = Math.floor(menuCanvas.width / cellSize);
    const rows = Math.floor(menuCanvas.height / cellSize);
    let grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

    // Track cursor position
    let cursorX = -1;
    let cursorY = -1;

    menuCanvas.addEventListener('mousemove', (event) => {
        const rect = menuCanvas.getBoundingClientRect();
        cursorX = Math.floor((event.clientX - rect.left) / cellSize);
        cursorY = Math.floor((event.clientY - rect.top) / cellSize);
    });

    menuCanvas.addEventListener('mouseleave', () => {
        cursorX = -1;
        cursorY = -1;
    });

    // Add a small rock on click
    menuCanvas.addEventListener('click', () => {
        if (cursorX >= 0 && cursorY >= 0 && cursorX < cols && cursorY < rows) {
            grid[cursorX][cursorY] = 2; // 2 represents a rock
        }
    });

    const rockShapes = [
        // Shape 1: Small circle-like shape
        [
            [1, 1],
            [1, 1]
        ],
        // Shape 2: Medium circle-like shape
        [
            [0, 1, 1, 0],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [0, 1, 1, 0]
        ],
        // Shape 3: Large circle-like shape
        [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 0, 0]
        ],
        // Shape 4: Extra large circle-like shape
        [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0]
        ],
        // Shape 5: Huge circle-like shape
        [
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]
        ]
    ];

    function placeRockShape(x, y, shape) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] === 1 && x + i < cols && y + j < rows) {
                    grid[x + i][y + j] = 2; // 2 represents a rock
                }
            }
        }
    }

    function isOverlappingShape(x, y, shape) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] === 1 && x + i < cols && y + j < rows && grid[x + i][y + j] === 2) {
                    return true;
                }
            }
        }
        return false;
    }

    function setupRocks() {
        const selectedShapes = [];
        while (selectedShapes.length < 3) {
            const shape = rockShapes[Math.floor(Math.random() * rockShapes.length)];
            if (!selectedShapes.includes(shape)) {
                selectedShapes.push(shape);
            }
        }

        const thirdsX = [Math.floor(cols / 3), Math.floor((2 * cols) / 3)];
        const thirdsY = [Math.floor(rows / 3), Math.floor((2 * rows) / 3)];

        let rockPlaced = false;

        thirdsX.forEach(x => {
            thirdsY.forEach(y => {
                if (Math.random() > 0.5 || !rockPlaced) { // Randomly skip some positions to avoid the center, ensure at least one rock is placed
                    const shape = selectedShapes[Math.floor(Math.random() * selectedShapes.length)];
                    if (!isOverlappingShape(x, y, shape)) {
                        placeRockShape(x, y, shape);
                        rockPlaced = true;
                    }
                }
            });
        });

        // Ensure at least one rock is placed
        if (!rockPlaced) {
            const x = Math.floor(Math.random() * thirdsX.length);
            const y = Math.floor(Math.random() * thirdsY.length);
            const shape = selectedShapes[Math.floor(Math.random() * selectedShapes.length)];
            placeRockShape(thirdsX[x], thirdsY[y], shape);
        }
    }

    function setup() {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] !== 2) {
                    grid[i][j] = Math.random() < 0.05 ? 1 : 0; // Reduce the probability to 0.05 for fewer water cells
                }
            }
        }
        setupRocks();
    }

    function drawGrid() {
        menuCtx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
        menuCtx.fillStyle = 'aqua'; // Aqua background
        menuCtx.fillRect(0, 0, menuCanvas.width, menuCanvas.height);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] === 1) {
                    menuCtx.fillStyle = 'rgba(0, 0, 255, 0.05)'; // Less bold blue for water
                } else if (grid[i][j] === 2) {
                    menuCtx.fillStyle = 'rgba(139, 69, 19, .3)'; // Brown for rocks
                } else if (grid[i][j] === 3 || grid[i][j] === 5) {
                    menuCtx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // White for turbulence and shimmer
                } else if (grid[i][j] === 4) {
                    menuCtx.fillStyle = 'rgba(34, 139, 34, 0.2)'; // Green for leaves
                } else if (grid[i][j] === 6) {
                    menuCtx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Red for salmon
                } else {
                    continue;
                }
                menuCtx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    let salmonSpawnRate = 0.01;

    function updateSalmonSpawnRate() {
        salmonSpawnRate = Math.random() * 0.1; // Randomly fluctuate between 0 and 0.1
        setTimeout(updateSalmonSpawnRate, Math.random() * 10000 + 5000); // Update rate every 5 to 15 seconds
    }

    function updateGrid() {
        const next = grid.map(arr => [...arr]);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] === 1 || grid[i][j] === 3 || grid[i][j] === 4) {
                    let newX = i - 1;
                    let newY = j;
                    if (Math.random() < 0.1) { // Further reduce the probability of moving up or down
                        newY = j + (Math.random() > 0.5 ? 1 : -1);
                    }
                    if (newX < 0) {
                        next[i][j] = 0; // Destroy cells that reach the left edge
                    } else {
                        if (newY < 0) newY = rows - 1;
                        if (newY >= rows) newY = 0;

                        if (grid[newX][newY] === 0) {
                            next[newX][newY] = grid[i][j];
                            next[i][j] = 0;
                        } else if (grid[newX][newY] === 2 || (newX === cursorX && newY === cursorY)) {
                            next[i][j] = 3; // Create turbulence when water hits a rock or cursor
                        }
                    }
                } else if (grid[i][j] === 6) { // Salmon movement
                    let newX = i + 1;
                    let newY = j;
                    if (Math.random() < 0.1) { // Probability of moving up or down
                        newY = j + (Math.random() > 0.5 ? 1 : -1);
                    }
                    if (newX >= cols) {
                        next[i][j] = 0; // Destroy cells that reach the right edge
                    } else {
                        if (newY < 0) newY = rows - 1;
                        if (newY >= rows) newY = 0;

                        if (grid[newX][newY] === 0 || grid[newX][newY] === 1) {
                            next[newX][newY] = grid[i][j];
                            next[i][j] = 0;
                        } else if (grid[newX][newY] === 2 || (newX === cursorX && newY === cursorY)) {
                            next[i][j] = 0; // Destroy salmon if it hits a rock or cursor
                        }
                    }
                }
            }
        }

        // Continuously add new water cells at the right edge
        for (let j = 0; j < rows; j++) {
            if (Math.random() < 0.05) { // Adjust the probability as needed
                next[cols - 1][j] = 1; // Add water cell at the right edge
            }
        }

        // Occasionally add a leaf
        if (Math.random() < 0.01) {
            const leafY = Math.floor(Math.random() * rows);
            next[cols - 1][leafY] = 4; // Add leaf at the right edge
        }

        // Occasionally add a group of salmon
        if (Math.random() < salmonSpawnRate) {
            const salmonY = Math.floor(Math.random() * rows);
            next[0][salmonY] = 6; // Add salmon at the left edge
        }

        // Occasionally make water cells behind turbulence flicker
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] === 3 && Math.random() < 0.1) {
                    next[i][j] = 5; // Change to white for shimmery effect
                } else if (grid[i][j] === 5 && Math.random() < 0.1) {
                    next[i][j] = 3; // Change back to turbulence
                }
                // Decay turbulence to water
                if (grid[i][j] === 3 && Math.random() < 0.05) { // Decrease the probability to decay slower
                    next[i][j] = 1; // Change turbulence back to water
                }
            }
        }

        grid = next;
    }

    function animate() {
        drawGrid();
        updateGrid();
        setTimeout(animate, 100); // Adjust the delay to control the speed of the animation
    }

    setup();
    animate();
    updateSalmonSpawnRate();
});