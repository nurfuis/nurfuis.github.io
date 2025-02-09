const attackTypes = [
    {
        name: 'Basic Attack',
        range: 128,
        damage: 10,
        cost: 0
    },
    {
        name: 'Long Range Attack',
        range: 512,
        damage: 5,
        cost: 5
    },
    {
        name: 'AOE Attack',
        range: 256,
        damage: 15,
        cost: 10
    },
    {
        name: 'Heal',
        range: 128,
        damage: -10,
        cost: 5
    }
];

class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, canvas, camera, mapSize, level = 1, experience = 0, health = 100) {
        super(canvas);
        this.x = x;
        this.y = y;
        this.size = size;
        this.colorClass = colorClass;
        this.speed = speed;
        this.name = name;
        this.level = level;
        this.experience = experience;
        this.health = health;
        this.maxHealth = health;
        this.mapSize = mapSize;
        this.targetPosition = null;
        this.maxDistance = 128; // Default max distance
        this.initialX = x; // Store initial X position
        this.initialY = y; // Store initial Y position
        this.attacks = this.getRandomAttacks(2); // Assign 2 random attacks
        this.selectedAttack = null;
        this.isLoaded = false; // Add a flag to indicate if the unit is loaded
        this.loadReady = false; // Add a flag to indicate if the unit is ready to load
        this.turnsLoaded = 0; // Add a counter to track turns loaded
        this.vehicle = null; // Reference to the vehicle the unit is loaded in
        this.seatIndex = null; // Index of the seat the unit is occupying
        this.movePending = false; // Add a flag to indicate if a move is pending
        this.attackPending = false; // Add a flag to indicate if an attack is pending
        this.attackReady = false; // Add a flag to indicate if the unit is ready
        this.maxAttacks = 2; // Maximum number of attacks the unit can make
        this.remainingAttacks = this.maxAttacks; // Initialize remaining attacks
        this.perceptionRange = 128; // Range for detecting other units
        this.isMoving = false; // Add a flag to indicate if the unit is currently moving
    }

    canMoveTo(x, y) {
        const distance = Math.sqrt((x - this.initialX) ** 2 + (y - this.initialY) ** 2);
        return distance <= this.maxDistance;
    }

    getRandomAttacks(count) {
        const availableAttacks = [...attackTypes]; // Copy the array
        const selectedAttacks = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * availableAttacks.length);
            selectedAttacks.push(availableAttacks.splice(randomIndex, 1)[0]);
        }
        return selectedAttacks;
    }

    handleClick(click, root) {
        const x = click.x;
        const y = click.y;

        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);

        if (distance <= this.selectedAttack.range) {
            const attackMenu = document.getElementById('attack-menu');

            const allTargets = [...root.playerTeam.children, ...root.opponentTeam.children];

            if (this.selectedAttack.name === 'AOE Attack') {
                const aoeRad = this.selectedAttack.range / 4;
                const targets = aoeAttack(x, y, aoeRad, allTargets);
                targets.forEach(target => {
                    if (target !== this) {
                        takeDamage(target, this.selectedAttack.damage);
                    }
                });
                console.log('AOE Attack hit', targets.length, 'targets');
            } else {
                const target = raycast(this.x, this.y, x, y, allTargets);
                if (target) {
                    takeDamage(target, this.selectedAttack.damage);
                    console.log('Raycast Attack hit', target.name);
                } else {
                    console.log('Raycast Attack missed');
                }
            }
            this.attackReady = false; // Reset this.attackReady after attack

            this.attackPending = false; // Reset this.attackPending after attack
            root.attackPending = false;
            attackButton.classList.remove('active'); // Remove highlight from the attack button
            toggleActionBarButtons(this.movePending, this.attackPending);
            attackMenu.style.display = 'none'; // Hide the attack menu

            this.selectedAttack = null; // Clear selected attack
            this.remainingAttacks--;
            return;
        }
    }

    move(keysPressed) {
        if (this.isMoving) return; // Prevent input or actions while moving

        let dx = 0;
        let dy = 0;

        if (keysPressed.includes('w')) {
            dy -= this.mapSize.tileSize; // Move up one tile
        }
        if (keysPressed.includes('s')) {
            dy += this.mapSize.tileSize; // Move down one tile
        }
        if (keysPressed.includes('a')) {
            dx -= this.mapSize.tileSize; // Move left one tile
        }
        if (keysPressed.includes('d')) {
            dx += this.mapSize.tileSize; // Move right one tile
        }

        const targetX = Math.floor(this.x + dx);
        const targetY = Math.floor(this.y + dy);

        const canMove = this.canMoveTo(targetX, targetY);
        // Ensure the target position is within the map boundaries and walkable

        if (targetX >= 0 && targetX < this.mapSize.width && targetY >= 0 && targetY < this.mapSize.height && canMove) {
            this.targetPosition = { x: targetX, y: targetY };
            this.isMoving = true;
        }
    }
    moveTowards(unit, destinationPosition, speed) {
        let distanceToTravelX = destinationPosition.x - unit.x;
        let distanceToTravelY = destinationPosition.y - unit.y;

        let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

        if (distance <= speed) {
            unit.x = destinationPosition.x;
            unit.y = destinationPosition.y;
            this.targetPosition = null;
            this.isMoving = false;
        } else {
            let normalizedX = distanceToTravelX / distance;
            let normalizedY = distanceToTravelY / distance;

            const newX = unit.x + normalizedX * speed;
            const newY = unit.y + normalizedY * speed;

            if (newX > 0) {
                unit.x = newX;
            }
            if (newY > 0) {
                unit.y = newY;
            }

        }
        return distance;
    }

    step(delta, root) {
        const overlappingUnits = root.turnOrder.filter(unit => unit !== this && unit.x === this.x && unit.y === this.y);
        if (overlappingUnits.length == 0) {
            this.overlappingUnits = [];
        } else if (overlappingUnits.length > 0) {
            this.overlappingUnits = overlappingUnits;
        }

        this.movePending = root.movePending;
        this.attackPending = root.attackPending;
        this.currentUnit = root.turnOrder[root.currentTurnIndex];

        if (this.currentUnit === this) {
            this.active = true;
        } else {
            this.active = false;
        }

        const keysPressed = root.input.keysPressed;

        if (this.movePending && this.currentUnit === this) {
            if (this.isLoaded) {
                // this.vehicle.drive(keysPressed);
                if (this.turnsLoaded == 0) {
                    document.getElementById('vehicle-controls-menu').style.display = 'none';
                }
            }
            if (!this.isLoaded) {
                if (this.unloaded) {
                    this.initialX = this.x;
                    this.initialY = this.y;
                    this.unloaded = false;
                }
                if (keysPressed.length > 0) {
                    this.move(keysPressed);
                }
            }

            const x = this.x;
            const y = this.y;

            let vehicleInRange = false;

            // Check if a vehicle is nearby and show the load menu
            if (!this.isLoaded) {
                for (const obj of root.vehicles) {
                    if (obj instanceof Vehicle) {
                        const vehicleDistance = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
                        const unitDistance = Math.sqrt((this.x - obj.x) ** 2 + (this.y - obj.y) ** 2);
                        if (vehicleDistance <= obj.loadRange && unitDistance <= obj.loadRange) {
                            if (!this.loadReady) {
                                console.log('Unit is ready to load');
                                this.loadReady = true;
                                showLoadMenu(this, obj);

                            }
                            vehicleInRange = true;
                            break; // Exit the loop after showing the load menu
                        }
                    }
                }
            }

            // Hide the load menu if no vehicle is in range
            if (!vehicleInRange) {
                const loadMenu = document.getElementById('load-menu');
                loadMenu.style.display = 'none';
                this.loadReady = false;
            }
        }

        if (this.attackPending && this.currentUnit === this && this.attackReady) {
            const click = root.input.canvasClicks[0];
            const isClicking = root.input.isDragging || root.input.isClicking;
            if (click && isClicking) {
                this.handleClick(click, root);
            }
        } else if (this.attackPending && this.currentUnit === this && !this.attackReady) {
            const attackMenu = document.getElementById('attack-menu');
            if (!this.selectedAttack) {
                this.selectedAttack = this.attacks[0];
                populateAttackMenu(this);
                attackMenu.style.display = 'flex';
            }
        } else if (!this.attackPending && this.currentUnit === this) {
            this.selectedAttack = null;
            this.attackReady = false;
        }

        // Move towards the target position if set
        if (this.isMoving && this.targetPosition) {
            this.moveTowards(this, this.targetPosition, this.speed);
        }
    }

    highlightMoveRange(ctx) {
        const tilesInRange = [];
        const tileSize = this.mapSize.tileSize;

        for (let dx = -this.maxDistance; dx <= this.maxDistance; dx += tileSize) {
            for (let dy = -this.maxDistance; dy <= this.maxDistance; dy += tileSize) {
                const targetX = this.initialX + dx;
                const targetY = this.initialY + dy;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance <= this.maxDistance &&
                    targetX >= 0 && targetX < this.mapSize.width &&
                    targetY >= 0 && targetY < this.mapSize.height) {
                    tilesInRange.push({ x: targetX, y: targetY });
                }
            }
        }

        ctx.fillStyle = 'rgba(255, 238, 0, 0.5)'; // Semi-transparent green for move range
        tilesInRange.forEach(tile => {
            ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        });
    }

    highlightAttackRange(ctx) {
        const tilesInRange = [];
        const tileSize = this.mapSize.tileSize;
        const attackRange = this.selectedAttack ? this.selectedAttack.range : 0;

        for (let dx = -attackRange; dx <= attackRange; dx += tileSize) {
            for (let dy = -attackRange; dy <= attackRange; dy += tileSize) {
                const targetX = this.x + dx;
                const targetY = this.y + dy;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance <= attackRange &&
                    targetX >= 0 && targetX < this.mapSize.width &&
                    targetY >= 0 && targetY < this.mapSize.height) {
                    tilesInRange.push({ x: targetX, y: targetY });
                }
            }
        }

        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; // Semi-transparent red for attack range
        tilesInRange.forEach(tile => {
            ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        });
    }

    draw(ctx) {
        if (this.isLoaded) return; // Skip drawing if loaded in a vehicle

        if (this.movePending && this.currentUnit === this) {
            this.highlightMoveRange(ctx);
        }
        if (this.attackPending && this.currentUnit === this && this.attackReady) {
            this.highlightAttackRange(ctx);
        }

        let offsetX = 0;
        let offsetY = 0;

        const numOverlappingUnits = this.overlappingUnits.length;
        if (numOverlappingUnits == 1 && !this.active) {
            offsetX = 16;
            offsetY = 16;
        }
        if (numOverlappingUnits == 2 && !this.active) {
            offsetX = 16;
            offsetY = 16;
        }
        if (numOverlappingUnits == 3 && !this.active) {
            offsetX = 16;
            offsetY = 16;
        }
        if (numOverlappingUnits == 4 && !this.active) {
            offsetX = 16;
            offsetY = 16;
        }


        ctx.fillStyle = getComputedStyle(document.querySelector(`.${this.colorClass}`)).backgroundColor;
        ctx.fillRect(this.x + offsetX, this.y + offsetY, this.size, this.size);

        if (this.active) {
            ctx.strokeStyle = 'yellow'; // Yellow border for active unit
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x + offsetX, this.y + offsetY, this.size, this.size);
        } else {
            ctx.strokeStyle = 'black'; // Black border for inactive units
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + offsetX, this.y + offsetY, this.size, this.size);
        }

        // Draw dots to indicate the number of overlapping units
        if (numOverlappingUnits > 0 && !this.active) {
            ctx.fillStyle = 'white';
            const dotPositions = [
                { x: this.x + offsetX + 5, y: this.y + offsetY + 5 }, // Top-left
                { x: this.x + offsetX + this.size - 5, y: this.y + offsetY + 5 }, // Top-right
                { x: this.x + offsetX + 5, y: this.y + offsetY + this.size - 5 }, // Bottom-left
                { x: this.x + offsetX + this.size - 5, y: this.y + offsetY + this.size - 5 }, // Bottom-right
                { x: this.x + offsetX + this.size / 2, y: this.y + offsetY + this.size / 2 } // Center
            ];
            for (let i = 0; i < Math.min(numOverlappingUnits + 1, 5); i++) {
                ctx.beginPath();
                ctx.arc(dotPositions[i].x, dotPositions[i].y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}