function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
    return a + t * (b - a);
}

function grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const a = p[X] + Y;
    const aa = p[a];
    const ab = p[a + 1];
    const b = p[X + 1] + Y;
    const ba = p[b];
    const bb = p[b + 1];

    return lerp(v, lerp(u, grad(p[aa], x, y), grad(p[ba], x - 1, y)),
        lerp(u, grad(p[ab], x, y - 1), grad(p[bb], x - 1, y - 1)));
}

const p = new Array(512);
const permutation = [151, 162, 137, 91, 90, 115, 131, 13, 201, 95, 96, 53, 194, 233, 7,
    225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
    203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174,
    20, 105, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
    27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
    65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89,
    18, 169, 200, 196, 135, 111, 116, 188, 159, 86, 164, 100, 109,
    198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
    147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
    17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39,
    253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
    218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191,
    179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192,
    214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50,
    45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24,
    72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

for (let i = 0; i < 256; i++) {
    p[256 + i] = p[i] = permutation[i];
}

function updateUnitStats(unit) {
    const activeUnitName = document.getElementById('active-unit-name');
    const unitLevel = document.getElementById('unit-level');
    const unitExperience = document.getElementById('unit-experience');
    activeUnitName.innerText = unit.name;
    unitLevel.innerText = `Level: ${unit.level}`;
    unitExperience.innerText = `Experience: ${unit.experience}`;

}

function toggleUIVisibility(hide) {
    const zIndex = hide ? '-1' : '1';
    const turnOrderList = document.querySelector('.turn-order');
    const legend = document.querySelector('.legend');
    const unitStats = document.querySelector('.unit-stats');
    const healthBarContainer = document.querySelector('.health-bar');
    const actionBar = document.querySelector('.action-bar');
    const oxygenBar = document.querySelector('.oxygen-bar');
    const stomachBar = document.querySelector('.stomach-bar');
    const scoreBoard = document.querySelector('.scoreboard');


    turnOrderList.style.zIndex = zIndex;
    legend.style.zIndex = zIndex;
    unitStats.style.zIndex = zIndex;
    healthBarContainer.style.zIndex = zIndex;
    actionBar.style.zIndex = zIndex;
    oxygenBar.style.zIndex = zIndex;
    stomachBar.style.zIndex = zIndex;
    scoreBoard.style.zIndex = zIndex;

}
// Resize canvas to fit window
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function toggleActionBarButtons(movePending, attackPending) {
    const actionBarButtons = document.querySelectorAll('.action-bar button');
    actionBarButtons.forEach(button => {
        if (movePending && button.id !== 'move-button') {
            button.disabled = true;
        } else if (attackPending && button.id !== 'attack-button') {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    });

    const loadMenu = document.getElementById('load-menu');
    loadMenu.style.display = 'none';
}

function populateAttackMenu(unit) {
    const attackMenu = document.getElementById('attack-menu');
    attackMenu.innerHTML = ''; // Clear previous buttons
    unit.attacks.forEach(attack => {
        const button = document.createElement('button');
        button.textContent = attack.name;
        button.addEventListener('click', () => {
            console.log(unit.name, 'selected attack:', attack.name);
            unit.selectedAttack = attack;
            unit.attackReady = true;
            attackMenu.style.display = 'none'; // Hide the menu after selection
        });
        attackMenu.appendChild(button);
    });
}

function raycast(x1, y1, x2, y2, gameObjects) {
    let closestObject = null;
    let closestDistance = Infinity;

    for (const obj of gameObjects) {
        // Skip the attacking unit
        if (obj.x === x1 && obj.y === y1) continue;

        // Check if the ray intersects the object's bounding box
        const intersects = intersectsRect(x1, y1, x2, y2, obj.x, obj.y, obj.size, obj.size);

        if (intersects) {
            // Calculate the distance to the object
            const distance = Math.sqrt((obj.x - x1) ** 2 + (obj.y - y1) ** 2);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        }
    }

    return closestObject;
}

function intersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    // Calculate the direction vector of the ray
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Calculate the t values for the intersection with the vertical sides of the rectangle
    let tNear = (rx - x1) / dx;
    let tFar = (rx + rw - x1) / dx;

    // If tNear is greater than tFar, swap them
    if (tNear > tFar) {
        [tNear, tFar] = [tFar, tNear];
    }

    // Calculate the t values for the intersection with the horizontal sides of the rectangle
    let tNearY = (ry - y1) / dy;
    let tFarY = (ry + rh - y1) / dy;

    // If tNearY is greater than tFarY, swap them
    if (tNearY > tFarY) {
        [tNearY, tFarY] = [tFarY, tNearY];
    }

    // If the intervals do not overlap, there is no intersection
    if (tNear > tFarY || tNearY > tFar) {
        return false;
    }

    // Update tNear and tFar to the overlapping interval
    tNear = Math.max(tNear, tNearY);
    tFar = Math.min(tFar, tFarY);

    // If tFar is negative, the rectangle is behind the ray
    if (tFar < 0) {
        return false;
    }

    // There is an intersection
    return true;
}

function aoeAttack(x, y, radius, gameObjects) {
    const targets = [];
    for (const obj of gameObjects) {
        const distance = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2);
        if (distance <= radius) {
            targets.push(obj);
        }
    }
    return targets;
}

let selectedVehicle = null; // Track the selected vehicle
let vehicleControlsMenu = document.getElementById('vehicle-controls-menu'); // Get the vehicle controls menu

function showLoadMenu(unit, vehicle) {
    console.log(unit.name, 'is near', vehicle.name);

    const loadMenu = document.getElementById('load-menu');
    loadMenu.innerHTML = ''; // Clear previous buttons

    for (let i = 0; i < vehicle.capacity; i++) {
        if (!vehicle.occupiedSeats[i]) {
            const button = document.createElement('button');
            button.textContent = `Seat ${i + 1}`;
            button.addEventListener('click', () => {
                if (vehicle.loadUnit(unit, i)) {
                    console.log(unit.name, 'loaded into seat', i + 1);
                    loadMenu.style.display = 'none';
                    selectedVehicle = null;

                    showVehicleControls(vehicle, unit);

                    // If the unit is the driver, show the vehicle controls
                    if (i === 0) {
                        //
                    }
                } else {
                    console.log('Failed to load unit into seat', i + 1);
                }
            });
            loadMenu.appendChild(button);
        }
    }

    loadMenu.style.display = 'flex';
    selectedVehicle = vehicle;
}

function showVehicleControls(vehicle, unit) {
    vehicleControlsMenu.innerHTML = ''; // Clear previous buttons

    // Add unload button only if the unit has been loaded for 1 or more turns
    if (unit.turnsLoaded >= 1) {
        const unloadButton = document.createElement('button');
        unloadButton.textContent = 'Unload';
        unloadButton.addEventListener('click', () => {
            // Find the first occupied seat
            const seatIndex = vehicle.occupiedSeats.findIndex(seat => seat !== null);
            if (seatIndex !== -1) {
                const unit = vehicle.occupiedSeats[seatIndex];
                if (vehicle.unloadUnit(seatIndex)) {
                    console.log(unit.name, 'unloaded from vehicle');
                    vehicleControlsMenu.style.display = 'none';
                }
            }
        });
        vehicleControlsMenu.appendChild(unloadButton);
    }

    vehicleControlsMenu.style.display = 'flex';
}