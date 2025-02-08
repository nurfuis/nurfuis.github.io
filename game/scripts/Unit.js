const attackTypes = [
    {
        name: 'Basic Attack',
        range: 64,
        damage: 10,
        cost: 0
    },
    {
        name: 'Long Range Attack',
        range: 228,
        damage: 5,
        cost: 5
    },
    {
        name: 'AOE Attack',
        range: 32,
        damage: 15,
        cost: 10
    },
    {
        name: 'Heal',
        range: 32,
        damage: -10,
        cost: 5
    }
];

class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, canvas, mapSize, level = 1, experience = 0, health = 100) {
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
        this.perceptionRange = 100; // Range for detecting other units
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
                const targets = aoeAttack(x, y, this.selectedAttack.range, allTargets);
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
        let dx = 0;
        let dy = 0;

        if (keysPressed.includes('w')) {
            dy -= 1;
        }
        if (keysPressed.includes('s')) {
            dy += 1;
        }
        if (keysPressed.includes('a')) {
            dx -= 1;
        }
        if (keysPressed.includes('d')) {
            dx += 1;
        }

        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
            dx /= magnitude;
            dy /= magnitude;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Calculate distance from initial position
        const distance = Math.sqrt((this.x - this.initialX) ** 2 + (this.y - this.initialY) ** 2);

        // Constrain unit within the move range
        if (distance > this.maxDistance) {
            const angle = Math.atan2(this.y - this.initialY, this.x - this.initialX);
            this.x = this.initialX + Math.cos(angle) * this.maxDistance;
            this.y = this.initialY + Math.sin(angle) * this.maxDistance;
        }

        // Constrain unit within the map boundaries
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.size > this.mapSize.width) this.x = this.mapSize.width - this.size;
        if (this.y + this.size > this.mapSize.height) this.y = this.mapSize.height - this.size;
    }

    step(delta, root) {


        this.movePending = root.movePending;
        this.attackPending = root.attackPending;
        this.currentUnit = root.turnOrder[root.currentTurnIndex];

        const keysPressed = root.input.keysPressed;

        if (this.movePending && this.currentUnit === this) {
            if (this.isLoaded) {
                this.vehicle.drive(keysPressed);
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
                this.move(keysPressed);
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
            if (click) {
                this.handleClick(click, root);
            }
        } else if (this.attackPending && this.currentUnit === this && !this.attackReady) {
            const attackMenu = document.getElementById('attack-menu');
            if (!this.selectedAttack) {
                this.selectedAttack = this.attacks[0];
                populateAttackMenu(this);
                attackMenu.style.display = 'flex';
                root.input.canvasClicks = [];
            }
        } else if (!this.attackPending && this.currentUnit === this) {
            this.selectedAttack = null;
            this.attackReady = false;
        }
    }

    draw(ctx) {
        if (this.isLoaded) return; // Skip drawing if loaded in a vehicle

        ctx.fillStyle = getComputedStyle(document.querySelector(`.${this.colorClass}`)).backgroundColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // Draw move range indicator if move is pending and this is the current unit
        if (this.movePending && this.currentUnit === this) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.initialX + this.size / 2, this.initialY + this.size / 2, this.maxDistance, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw attack range indicator if attack is pending and this is the current unit
        if (this.attackPending && this.currentUnit === this && this.attackReady) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.selectedAttack.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}