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

class AutomatedInput {
    constructor(directions = [
        { direction: "left", weight: 2 },
        { direction: "right", weight: 2 },
        { direction: "up", weight: 1 },
        { direction: "down", weight: 1 },
        { direction: "up-left", weight: 0.5 },
        { direction: "up-right", weight: 0.5 },
        { direction: "down-left", weight: 0.5 },
        { direction: "down-right", weight: 0.5 },
        { direction: "up-two", weight: 0.3 },
        { direction: "up-left-two", weight: 0.2 },
        { direction: "up-right-two", weight: 0.2 },
        { direction: "up-three-left-one", weight: 0.1 },
        { direction: "up-three-right-one", weight: 0.1 }
    ], interval = 1000) {
        this.directions = directions;
        this.interval = interval;
        this.currentDirection = null;
        this.heldKeys = [];

        // Calculate total weight
        this.totalWeight = this.directions.reduce((sum, dir) => sum + dir.weight, 0);

        this.scheduleNextInput();
    }

    get direction() {
        return this.currentDirection;
    }

    scheduleNextInput() {
        setTimeout(() => {
            this.chooseRandomDirection();
            this.scheduleNextInput();
        }, this.interval);
    }

    chooseRandomDirection() {
        // Get random value between 0 and total weight
        const random = Math.random() * this.totalWeight;
        let weightSum = 0;

        // Find the direction based on weight
        for (const dir of this.directions) {
            weightSum += dir.weight;
            if (random <= weightSum) {
                this.currentDirection = dir.direction;
                return;
            }
        }

        // Fallback to center
        this.currentDirection = 'center';
    }
}