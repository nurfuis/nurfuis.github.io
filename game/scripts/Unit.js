const attackTypes = [{
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
const mooreNeighbors = [
    { x: -64, y: -64 }, { x: 0, y: -64 }, { x: 64, y: -64 },
    { x: -64, y: 0 }, { x: 0, y: 0 }, { x: 64, y: 0 },
    { x: -64, y: 64 }, { x: 0, y: 64 }, { x: 64, y: 64 }
];
const extendedMooreNeighbors = [
    { x: -128, y: -128 }, { x: 0, y: -128 }, { x: 128, y: -128 },
    { x: -128, y: -64 }, { x: 0, y: -64 }, { x: 128, y: -64 },
    { x: -128, y: 0 }, { x: 0, y: 0 }, { x: 128, y: 0 },
    { x: -128, y: 64 }, { x: 0, y: 64 }, { x: 128, y: 64 },
    { x: -128, y: 128 }, { x: 0, y: 128 }, { x: 128, y: 128 }
];
const vonNuemanNeighbors = [
    { x: -64, y: 0 }, { x: 64, y: 0 },
    { x: 0, y: -64 }, { x: 0, y: 64 }
];

class Lungs {
    constructor(unit) {
        this.unit = unit;
        this.oxygen = 10000;
        this.maxOxygen = 10000;
    }
    updateOxygenBar() {
        const oxygenBar = document.getElementById('oxygen');
        const oxygenPercentage = (this.oxygen / this.maxOxygen) * 100;
        oxygenBar.style.width = `${oxygenPercentage}%`;
    }
    takeBreath(amount) {
        this.oxygen -= amount;
        if (this.oxygen < 0) {
            this.oxygen = 0;
        } else if (this.oxygen > this.maxOxygen) {
            this.oxygen = this.maxOxygen;
        } else {
            this.updateOxygenBar(this.oxygen, this.maxOxygen);
        }
    }
    restoreBreath(amount) {
        this.oxygen += amount;
        if (this.oxygen > this.maxOxygen) {
            this.oxygen = this.maxOxygen;
        } else {
            this.updateOxygenBar(this.oxygen, this.maxOxygen);
        }
    }
    emitWaterBubbles() {
        if (this.unit.particleCooldowns.water.current > 0) {
            return;
        }

        const oxygenRatio = this.oxygen / this.maxOxygen;
        const baseBurstCount = this.unit.particleCooldowns.water.burstCount;
        const actualBurstCount = Math.ceil(baseBurstCount * (1 + (1 - oxygenRatio) * 3));

        for (let i = 0; i < actualBurstCount; i++) {
            setTimeout(() => {
                events.emit("PARTICLE_EMIT", {
                    x: this.unit.x + 32 + (Math.random() - 0.5) * 16,
                    y: this.unit.y + 8 + (Math.random() - 0.5) * 16,
                    color: 'rgba(0, 0, 255, 0.5)',
                    size: 4 + (1 - oxygenRatio) * 2,
                    duration: 1000,
                    shape: 'circle',
                    count: 1,
                });
            }, i * this.unit.particleCooldowns.water.burstDelay);
        }


        const cooldownMultiplier = 0.5 + oxygenRatio * 0.5;
        this.unit.particleCooldowns.water.current = this.unit.particleCooldowns.water.max * cooldownMultiplier;
    }
    step(delta) {
        if (this.unit.isAlive) {
            if (this.unit.tile.type === 'water') {
                this.takeBreath(1);
                this.emitWaterBubbles();

            } else if (this.unit.tile.type === 'air') {
                if (this.oxygen < this.maxOxygen) {
                    this.oxygen += 0.1;
                } else if (this.oxygen > this.maxOxygen) {
                    this.oxygen = this.maxOxygen;

                }
            }
            this.updateOxygenBar(this.oxygen, this.maxOxygen);
        }
    }
}
class Heart {
    constructor(unit) {
        this.unit = unit;
        this.health = 100;
        this.maxHealth = 100;
        this.beatInterval = 1000;
        this.lastBeatTime = 0;
    }
    updateHealthBar() {
        const healthBar = document.getElementById('health');
        const healthPercentage = (this.health / this.maxHealth) * 100;
        healthBar.style.width = Math.floor(healthPercentage) + '%';
        healthBar.innerText = Math.floor(healthPercentage) + '%';
    }
    takeDamage(amount) {
        this.health -= amount;
        events.emit("PARTICLE_EMIT", {
            x: this.unit.x + 32,
            y: this.unit.y + 32,
            color: 'rgba(255, 0, 0, 1)',
            size: 3 + Math.random() * 2,
            duration: 2000,
            shape: 'circle',
            count: amount,
        });
        if (this.health < 0) {
            this.health = 0;
        } else {
            this.updateHealthBar(this.health, this.maxHealth);
        }
    }
    heal(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
            this.updateHealthBar(this.health, this.maxHealth);

        } else {
            this.updateHealthBar(this.health, this.maxHealth);
        }
    }
    step(delta) {
        // ...
    }
}
class Stomach {

    constructor(unit) {
        this.unit = unit;
        this.energy = 1000;
        this.maxEnergy = 1000;
    }

    updateEnergyBar() {
        const energyBar = document.getElementById('stomach');
        const energyPercentage = (this.energy / this.maxEnergy) * 100;
        energyBar.style.width = `${energyPercentage}%`;
    }
    consumeEnergy(amount) {
        this.energy -= amount;

        if (this.energy < 0) {
            this.energy = 0;

        } else {
            this.updateEnergyBar(this.energy, this.maxEnergy);
        }
    }
    restoreEnergy(amount) {
        this.energy += amount;

        if (this.energy > this.maxEnergy) {
            this.energy = this.maxEnergy;
        } else {
            this.updateEnergyBar(this.energy, this.maxEnergy);
        }
    }
    step(delta) {
        // ...
    }
}

class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, canvas, camera, mapSize, level = 1, experience = 0, health = 100) {
        super(canvas);
        this.debug = false;
        document.addEventListener('keydown', (event) => {
            if (event.key === 'F2') {
                event.preventDefault();
                this.debug = !this.debug;
            }
        });
        this.isLoaded = false;
        this.loadReady = false;
        this.turnsLoaded = 0;
        this.vehicle = null;
        this.seatIndex = null;
        this.movePending = false;
        this.attackPending = false;
        this.attackReady = false;
        this.maxAttacks = 2;
        this.remainingAttacks = this.maxAttacks;
        this.perceptionRange = 128;


        this.name = name;
        this.level = level;
        this.experience = experience;

        this.inventory = new Inventory();

        this.luminaSpheres = 0;
        this.acorns = 0;
        this.feyLight = 0;

        this.size = size;
        this.colorClass = colorClass;

        this.mapSize = mapSize;
        this.maxDistance = 128;
        this.targetPosition = null;

        this.initialX = x;
        this.initialY = y;

        this.x = x;
        this.y = y;

        this.lastX = null;
        this.lastY = null;

        this.lastMovementDirection = {
            x: 0,
            y: 0
        };

        this.speed = speed;
        this.isGravityOff = false;

        this.tile = null;
        this.previousTile = null;

        this.vonNuemanNeighbors = [];
        this.mooreNeighbors = [];
        this.extendedMooreNeighbors = [];


        this.heart = new Heart(this);
        this.lungs = new Lungs(this);
        this.stomach = new Stomach(this);

        this.isAlive = true;

        this.delay = 0;
        this.hangtime = 0;

        this.isCollecting = false;
        this.isSinking = false;
        this.isMoving = false;
        this.isFalling = false;
        this.fallingDamage = 0;

        this.facingDirection = 'right';
        this.spriteWidth = 64;
        this.spriteHeight = 128;

        this.image = new Image();
        this.image.src = 'images/Sprite-curioustraveler.png';

        this.imageLeft = new Image();
        this.imageLeft.src = 'images/Sprite-curioustraveler2.png';

        this.imageDown = new Image();
        this.imageDown.src = 'images/Sprite-curioustraveler3.png';
        
        events.on('MAP_CHANGED', this, (map) => {
            this.moveToSpawn();
        });
        events.on('PATROL_DEFEATED', this, (patrol) => {
            this.isCollecting = false;
        });
        events.on('ACORN_COLLECTED', this, (acorn) => {
            this.isCollecting = false;
            const count = document.getElementById('acorn-count');
            this.acorns++;
            count.textContent = this.acorns.toString();
        });
        events.on('LUMINA_SPHERE_COLLECTED', this, (luminaSphere) => {
            this.isCollecting = false;
            const count = document.getElementById('sphere-count');
            this.luminaSpheres++;
            count.textContent = this.luminaSpheres.toString();
        });
        events.on('FEY_LIGHT_COLLECTED', this, (feyLight) => {
            if (this.isFalling) {
                this.fallingDamage = 0;
                this.isSinking = true;
            }
            const count = document.getElementById('pollen-count');
            this.feyLight++;
            count.textContent = this.feyLight.toString();
        });
        events.on('ANEMONE_COLLECTED', this, (anemone) => {
            this.isCollecting = false;
        });
        events.on('GAS_CONTACT', this, (gas) => {
            this.lungs.takeBreath(1);
        });
        events.on("COLLECTION_STARTED", this, (collection) => {
            this.isCollecting = true;
            if (collection.isSnapping) {
                this.heart.takeDamage(2);
            }

        });
        events.on("COLLECTION_FAILED", this, (collection) => {
            this.isCollecting = false;
            this.heart.takeDamage(2);


            const safePosition = this.findSafeReturnPosition(this.parent.parent.map);
            if (safePosition) {
                this.targetPosition = safePosition;
                this.isMoving = true;


                events.emit("PARTICLE_EMIT", {
                    x: safePosition.x + 32,
                    y: safePosition.y + 32,
                    color: 'rgba(191, 191, 191, 0.5)',
                    size: 2,
                    duration: 500,
                    shape: 'circle',
                    count: 5,
                    velocity: {
                        x: (Math.random() - 0.5) * 2,
                        y: -Math.random() * 2
                    }
                });
            }
        });
        events.on('SEED_COLLECTED', this, (food) => {
            this.heart.heal(10);
            this.isCollecting = false;

        });
        events.on('HEAL_PLAYER', this, (bonus) => {
            this.heart.heal(bonus);
        });
        events.on('FEED_PLAYER', this, (food) => {
            this.stomach.restoreEnergy(food);
        });
        events.on('SAP_COLLECTED', this, (sap) => {
            this.stomach.restoreEnergy(100);
        });
        events.on('AIR_COLLECTED', this, (airBubble) => {
            this.lungs.restoreBreath(100);
        });
        events.on('ITEM_COLLECTED', this, (item) => {
            this.inventory.addItem(item);

        });

        this.particleCooldowns = {
            water: {
                current: 0,
                max: 1000,
                burstCount: 3,
                burstDelay: 100
            },
            dust: {
                current: 0,
                max: 1500,
                burstCount: 3,
                burstDelay: 50
            }
        };

        this.idleTimer = 0;
        this.idleDelay = 3000;
        this.lookDirections = ['right', 'up', 'left', 'down'];
        this.currentLookIndex = 0;
        this.lookTime = 0;
        this.lookDuration = 4000;
        this.isIdling = false;
        this.lastInputTime = Date.now();
    }

    calculateMooreNeighbors(map) {
        this.mooreNeighbors = [];

        mooreNeighbors.forEach(neighbor => {
            const neighborX = this.x + neighbor.x;
            const neighborY = this.y + neighbor.y;
            const neighborTile = map.getTileAtCoordinates(neighborX, neighborY);
            if (neighborTile) {
                this.mooreNeighbors.push(neighborTile);
            } else {
                this.mooreNeighbors.push({ name: 'border', solid: true, breakable: false });
            }
        });
    }

    moveToSpawn() {
        this.x = this.startingposition.x;
        this.y = this.startingposition.y;

        this.lastX = null;
        this.lastY = null;

        this.lastMovementDirection = { x: 0, y: 0 };

        this.facingDirection = 'right';

        this.isGravityOff = false;

        this.previousTile = null;

        this.tile = this.currentTile;

        this.calculateMooreNeighbors(this.gameMap);

        events.emit("PLAYER_POSITION", {
            x: this.x,
            y: this.y,
            cause: "spawn"
        });


    }
    updateSpawnPoint(x, y) {
        this.x = x;
        this.y = y;

        this.initialX = x;
        this.initialY = y;

        this.startingposition = new Vector2(x, y);

        this.calculateMooreNeighbors(this.gameMap);

        this.tile = this.currentTile;

        events.emit("PLAYER_POSITION", {
            x: this.x,
            y: this.y,
            cause: "spawn"
        });
    }

    ready() {
        this.startingposition = new Vector2(this.x, this.y);

        const tile = this.currentTile;

        if (!tile) {
            throw new Error('Tile not found');
        } else {
            this.tile = tile;
        }

        this.calculateMooreNeighbors(this.gameMap);

        console.log('Unit ready', this);
    }
    handleDeath() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.isFalling = false;
        this.isMoving = false;
        this.isSinking = false;
        this.targetPosition = null;

        this.fallingDamage = 0;

        this.delay = 5000; // respawn timer
        events.emit('UNIT_DEATH', this); // emit death event  
    }
    respawn() {
        this.isAlive = true;

        this.lungs.restoreBreath(this.lungs.maxOxygen);
        this.heart.heal(this.heart.maxHealth);
        this.stomach.restoreEnergy(this.stomach.maxEnergy);

        this.x = this.startingposition.x;
        this.y = this.startingposition.y;

        this.lastX = null;
        this.lastY = null;

        this.lastMovementDirection = { x: 0, y: 0 };

        this.facingDirection = 'right';

        this.isGravityOff = false;
        this.isCollecting = false;

        this.previousTile = null;

        this.tile = this.currentTile;

        this.calculateMooreNeighbors(this.gameMap);

        events.emit("PLAYER_POSITION", {
            x: this.x,
            y: this.y,
            cause: "spawn"
        });
    }
    tryEmitPosition() {
        if (this.lastX == this.x && this.lastY == this.y) {
            return;
        }
        this.lastX = this.x;
        this.lastY = this.y;

        events.emit("PLAYER_POSITION", {
            x: this.x,
            y: this.y,
            unit: this
        });
    }
    canMoveTo(x, y) {
        const map = this.parent.parent.map;
        const tile = map.getTileAtCoordinates(x, y);
        if (!tile) return false;

        return tile;

    }
    showDustParticles() {
        if (this.particleCooldowns.dust.current > 0) {
            return;
        }

        for (let i = 0; i < this.particleCooldowns.dust.burstCount; i++) {
            let adjustedX = this.x;
            if (this.facingDirection === 'left') {
                adjustedX -= 32;
            } else {
                adjustedX += 32;
            }

            setTimeout(() => {
                events.emit("PARTICLE_EMIT", {
                    x: adjustedX + 32 + (Math.random() - 0.5) * 4,
                    y: this.y + 32 + (Math.random() - 0.5) * 4,
                    color: 'rgba(191, 191, 191, 0.3)',
                    size: 1 + Math.random() * 2,
                    duration: 150 + Math.random() * 100,
                    shape: 'circle',
                    count: 1,
                    velocity: {
                        x: (Math.random() - 0.5) * 2,
                        y: -Math.random() * 1
                    }
                });
            }, i * this.particleCooldowns.dust.burstDelay);
        }


        this.particleCooldowns.dust.current = this.particleCooldowns.dust.max;
    }
    breakBlock(target) {
        target.type = 'air';
        target.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
        target.solid = false;
        target.passable = true;
        target.durability = 100;
        target.breakable = false;
    }
    attackBlock(target) {
        const randomNumber = Math.random();
        target.durability -= randomNumber * 2;
        events.emit("PARTICLE_EMIT", {
            x: target.x + 32,
            y: target.y + 32,
            color: 'rgba(255, 255, 255, 0.5)',
            size: 4,
            duration: 1000,
            shape: 'square',
            count: 1,
        });
        this.stomach.consumeEnergy(1);
    }
    tryBreakBlock(target) {
        if (target.durability > 0 && target.breakable && this.stomach.energy > 0) {
            this.attackBlock(target);
        } else if (target.durability <= 0) {
            this.breakBlock(target);
        } else if (target.durability > 0 && !target.breakable) {
            this.showDustParticles();
        }
    }
    getDirectionFromInput(keysPressed) {
        let direction = 'center';
        const numKeysPressed = keysPressed.length;

        if (keysPressed.includes('w') && numKeysPressed === 1) {
            direction = 'up';
        }
        if (keysPressed.includes('s') && numKeysPressed === 1) {
            direction = 'down';

        } else if (keysPressed.includes('a') && numKeysPressed === 1) {
            direction = 'left';
        } else if (keysPressed.includes('d') && numKeysPressed === 1) {
            direction = 'right';
        } else if (keysPressed.includes('w') && keysPressed.includes('a') && numKeysPressed === 2) {
            direction = 'up-left';
        } else if (keysPressed.includes('w') && keysPressed.includes('d') && numKeysPressed === 2) {
            direction = 'up-right';
        } else if (keysPressed.includes('s') && keysPressed.includes('a') && numKeysPressed === 2) {
            direction = 'down-left';
        } else if (keysPressed.includes('s') && keysPressed.includes('d') && numKeysPressed === 2) {
            direction = 'down-right';
        };
        return direction;

    }
    tryMove(direction) {
        if (this.isMoving) return;

        this.targetPosition = null;
        let selectedTile = null;

        switch (direction) {
            case 'up': {
                selectedTile = this.mooreNeighbors[1];
                break;
            }
            case 'down': {
                selectedTile = this.mooreNeighbors[7];
                break;
            }
            case 'left': {
                selectedTile = this.mooreNeighbors[3];
                break;
            }
            case 'right': {
                selectedTile = this.mooreNeighbors[5];
                break;
            }
            case 'up-left': {
                selectedTile = this.mooreNeighbors[0];
                break;
            }
            case 'up-right': {
                selectedTile = this.mooreNeighbors[2];
                break;
            }
            case 'down-left': {
                selectedTile = this.mooreNeighbors[6];
                break;
            }
            case 'down-right': {
                selectedTile = this.mooreNeighbors[8];
                break;
            }
        }

        const checkRightBorder = this.x + this.size >= this.mapSize.width;
        const checkLeftBorder = this.x <= 0;

        if (selectedTile) {
            if (selectedTile.passable) {


                this.targetPosition = new Vector2(selectedTile.x, selectedTile.y);
                this.isMoving = true;

                // Store movement direction for later use
                this.lastMovementDirection = {
                    x: selectedTile.x - this.x,
                    y: selectedTile.y - this.y
                };
            } else if (selectedTile.breakable) {
                this.tryBreakBlock(selectedTile);
            } else if (selectedTile.type === 'border') {
                if (checkLeftBorder) {
                    // go back
                    events.emit('RETREAT_MAP');

                } else if (checkRightBorder) {
                    // go forward
                    events.emit('ADVANCE_MAP');
                }
            }
        }
    }


    fallTowards() {


    }

    moveTowards() {
        let distanceToTravelX = this.targetPosition.x - this.x;
        let distanceToTravelY = this.targetPosition.y - this.y;

        let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

        if (distance <= this.speed) {
            this.x = this.targetPosition.x;
            this.y = this.targetPosition.y;
            this.targetPosition = null;
            this.isMoving = false;

        } else {
            let normalizedX = distanceToTravelX / distance;
            let normalizedY = distanceToTravelY / distance;

            let adjustedSpeed = this.speed;

            if (this.isSinking) {
                adjustedSpeed *= 0.3;
            }
            if (this.tile.type === 'water') {
                adjustedSpeed *= 0.5;
            }
            if (this.isFalling) {
                adjustedSpeed *= 2;
            }

            const newX = this.x + normalizedX * adjustedSpeed;
            const newY = this.y + normalizedY * adjustedSpeed;

            if (newX > 0) {
                this.lastX = this.x;
                this.x = newX;
            }
            if (newY > 0) {
                this.lastY = this.y;
                this.y = newY;
            }

        }
        return distance;
    }
    findSafeReturnPosition(map) {

        const pushDistance = 64;
        const pushX = this.x - (this.lastMovementDirection.x * pushDistance);
        const pushY = this.y - (this.lastMovementDirection.y * pushDistance);


        const tile = map.getTileAtCoordinates(pushX, pushY);
        if (tile && (tile.type === 'air' || tile.type === 'water') && tile.passable) {
            return {
                x: pushX,
                y: pushY
            };
        }


        const directions = [{
            x: -1,
            y: 0
        },
        {
            x: 1,
            y: 0
        },
        {
            x: 0,
            y: -1
        },
        {
            x: 0,
            y: 1
        }
        ];

        for (const dir of directions) {
            const checkX = this.x + (dir.x * pushDistance);
            const checkY = this.y + (dir.y * pushDistance);
            const checkTile = map.getTileAtCoordinates(checkX, checkY);
            if (checkTile && (checkTile.type === 'air' || checkTile.type === 'water') && checkTile.passable) {
                return {
                    x: checkX,
                    y: checkY
                };
            }
        }

        return null;
    }

    doVitals(delta) {
        // update organs and check for death     
        this.lungs.step(delta);
        this.heart.step(delta);
        this.stomach.step(delta);

        // out of breath
        if (this.lungs.oxygen <= 0) {
            this.heart.takeDamage(1);
        }
        // starving to death
        if (this.stomach.energy <= 0) {
            this.heart.takeDamage(1);
        }
        // death by heart failure or starvation
        if (this.heart.health <= 0) {
            // deplete all organs before death
            this.lungs.takeBreath(this.lungs.maxOxygen);
            this.stomach.consumeEnergy(this.stomach.maxEnergy);
            this.heart.takeDamage(this.heart.maxHealth);

            if (this.isAlive) {
                this.handleDeath();
            }
        }
    }
    breakFall(tileBelow) {


        if (tileBelow.solid && this.isFalling) {
            if (tileBelow.breakable) {
                events.emit("PARTICLE_EMIT", {
                    x: this.x + 32,
                    y: this.y + 64,
                    color: 'rgba(255, 255, 255, 0.5)',
                    size: 4,
                    duration: 1000,
                    shape: 'square',
                    count: 10,
                });
            } else {
                events.emit("PARTICLE_EMIT", {
                    x: this.x + 32,
                    y: this.y + 32,
                    color: 'rgba(191, 191, 191, 0.5)',
                    size: 1,
                    duration: 1000,
                    shape: 'circle',
                    count: 1,
                });
            }

            events.emit("CAMERA_SHAKE", {
                position: {
                    x: this.x,
                    y: this.y
                },
                targetPosition: {
                    x: this.x,
                    y: this.y - 32
                }
            });


            if (tileBelow.durability > // Do damage to tile and player  
                0
            ) {
                if (tileBelow.breakable) {
                    tileBelow.durability -= 35;
                }

                if (this.fallingDamage > 1) {
                    this.heart.takeDamage(this.fallingDamage);
                };
                this.fallingDamage = 0;

            } else if (tileBelow.durability <= // Break tile and reset durability
                0
            ) {
                tileBelow.type = 'air';
                tileBelow.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                tileBelow.solid = false;
                tileBelow.passable = true;
                tileBelow.durability = 100;
                tileBelow.breakable = false;
                this.fallingDamage = 0; // freebies for breaking tiles
            }
        }
    }
    step(delta, root) {
        Object.values(this.particleCooldowns).forEach(cooldown => {
            cooldown.current = Math.max(0, cooldown.current - delta);
        });

        if (this.delay > 0) {
            this.delay -= delta;
            return;
        } else if (this.delay <= 0 && !this.isAlive) {
            this.respawn();
        } else if (!this.isAlive) {
            return;
        } else if (this.isCollecting) {
            return;
        }
        // Alert position
        this.tryEmitPosition();

        // Check tile
        const tile = this.currentTile;

        const tileBelow = this.tileBelow;

        if (tile !== this.tile) {
            this.previousTile = this.tile;
            this.tile = tile;
            this.calculateMooreNeighbors(this.gameMap);

        }



        // Check Vitals
        this.doVitals(delta);

        // Finish Moving
        if (this.isMoving && this.targetPosition) {

            const distance = this.moveTowards();

            if (tile.type === 'water') {
                root.map.disturbWater(this.x, this.y);
            }
            return;
        }

        const keysPressed = root.input.keysPressed;

        let direction = 'center';
        let sinking = this.isSinking;
        let falling = this.isFalling;



        if (tileBelow && tileBelow.type === 'water') {
            sinking = true;
            direction = 'down';
        }


        if (tile.type === 'air' && tileBelow.type === 'air' && !sinking) {
            direction = 'down';
            falling = true;
            this.fallingDamage += 1;
        } else if (tile.type === 'air' && tileBelow.type === 'air' && sinking) {
            direction = 'down';
            this.fallingDamage = 0;
        }

        if (tile.type === 'air' && tileBelow.solid && falling) {

            this.breakFall(tileBelow);

            if (this.fallingDamage > 0) {
                this.heart.takeDamage(this.fallingDamage);
                this.fallingDamage = 0;

            }
            falling = false;
        } else if (tile.type === 'air' && tileBelow.solid && sinking) {
            sinking = false;
            direction = 'center';
        }

        if (tile.type === 'air' && tileBelow.type === 'water') {
            falling = true;
            sinking = false;
        }

        if (tile.type === 'water' && falling) {
            falling = false;
            sinking = true;
            if (this.fallingDamage > 5) {
                this.heart.takeDamage(this.fallingDamage);
                this.fallingDamage = 0;
            }
        }

        if (sinking) {
            if (keysPressed.length > 0) {
                sinking = false;
                direction = 'center';
            }
        }

        if (keysPressed.length > 0 && !falling) {
            const input = this.getDirectionFromInput(keysPressed);
            if (!!input) {
                direction = input;
            }
        } else {
            // automated movement
        }


        // Check Idle
        this.updateIdleState(delta, root);
        if (this.isIdling) {
            return;
        }

        // TRY MOVE
        if (this.facingDirection === 'left' && direction === 'right') {
            this.facingDirection = 'right';
            this.delay = 200;
            return;
        } else if (this.facingDirection === 'right' && direction === 'left') {
            this.facingDirection = 'left';
            this.delay = 200;
            return;
        }
        this.lastDirection = this.direction;
        this.direction = direction;
        this.isSinking = sinking;
        this.isFalling = falling;
        this.tryMove(direction);
    }


    updateIdleState(delta, root) {

        const now = Date.now();


        if (root.input.keysPressed.length > 0) {
            this.lastInputTime = now;
            this.isIdling = false;
            this.idleTimer = 0;
        }

        if (this.isMoving || this.isFalling || this.isSinking) {
            this.idleTimer = 0;
            this.isIdling = false;
            this.lastInputTime = now;
            return;
        }


        if (!this.isIdling) {
            this.idleTimer += delta;
            if (this.idleTimer >= this.idleDelay) {
                this.isIdling = true;
                console.log('Unit idle timer:', this.idleTimer);
                this.lookTime = 0;
                this.currentLookIndex = this.lookDirections.indexOf(this.facingDirection);
            }
        }


        if (this.isIdling) {
            this.lookTime += delta;
            if (this.lookTime >= this.lookDuration) {
                this.lookTime = 0;
                this.currentLookIndex = (this.currentLookIndex + 1) % this.lookDirections.length;
                this.facingDirection = this.lookDirections[this.currentLookIndex];
            }
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
                    tilesInRange.push({
                        x: targetX,
                        y: targetY
                    });
                }
            }
        }

        ctx.fillStyle = 'rgba(255, 238, 0, 0.5)';
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
                    tilesInRange.push({
                        x: targetX,
                        y: targetY
                    });
                }
            }
        }

        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        tilesInRange.forEach(tile => {
            ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        });
    }
    draw(ctx) {
        if (!this.isAlive) return;
        if (this.isCollecting) return;

        const scale = 0.75;


        let offsetX = 0;
        let offsetY = -16;

        const scaledWidth = this.spriteWidth * scale;
        const scaledHeight = this.spriteHeight * scale;

        ctx.save();

        if (this.facingDirection === 'left') {
            ctx.drawImage(
                this.imageLeft,
                this.x + offsetX,
                this.y + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'right') {
            ctx.drawImage(
                this.image,
                this.x + offsetX,
                this.y + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'down') {
            ctx.drawImage(
                this.imageDown,
                this.x + offsetX,
                this.y + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        } else if (this.facingDirection === 'up') {
            ctx.drawImage(
                this.imageDown,
                this.x + offsetX,
                this.y + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        }
        if (this.debug) {
            let index = 0;
            this.mooreNeighbors.forEach(neighbor => {
                let text = `${neighbor.x}, ${neighbor.y}`;
                let text2 = `${neighbor.type}`;
                if (index === 4) {
                    text = `${Math.floor(this.x)}, ${Math.floor(this.y)}`;
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                    ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                    ctx.fillStyle = 'white';
                    ctx.fillText(text, neighbor.x + 10, neighbor.y + 20);
                    ctx.fillText(text2, neighbor.x + 10, neighbor.y + 40);

                } else if (neighbor.solid) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                    ctx.fillStyle = 'black';
                    ctx.fillText(text, neighbor.x + 10, neighbor.y + 20);
                    ctx.fillText(text2, neighbor.x + 10, neighbor.y + 40);

                } else if (neighbor.passable) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                    ctx.fillStyle = 'white';
                    ctx.fillText(text, neighbor.x + 10, neighbor.y + 20);
                    ctx.fillText(text2, neighbor.x + 10, neighbor.y + 40);

                }
                if (this.direction) {
                    const directions = { 'up': 1, 'up-right': 2, 'right': 5, 'down-right': 8, 'down': 7, 'down-left': 6, 'left': 3, 'up-left': 0 };
                    const directionIndex = directions[this.direction];
                    if (index === directionIndex) {
                        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                        ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                        ctx.fillStyle = 'white';
                        ctx.fillText(text, neighbor.x + 10, neighbor.y + 20);
                        ctx.fillText(text2, neighbor.x + 10, neighbor.y + 40);

                    }
                }



                index++;

            });

        }
        ctx.restore();
    }
    checkCurrentTile(root) {
        const tile = root.map.getTileAtCoordinates(this.x, this.y);
        return tile;
    }

    get position() {
        return new Vector2(this.x, this.y);
    }
    get gameMap() {
        return this.parent.parent.map;
    }
    get currentTile() {
        return this.parent.parent.map.getTileAtCoordinates(this.x, this.y);
    }
    get tileBelow() {
        return this.mooreNeighbors[7];
    }

}