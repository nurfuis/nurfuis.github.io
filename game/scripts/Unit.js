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
const mooreNeighbors = [{
    x: -64,
    y: -64
}, {
    x: 0,
    y: -64
}, {
    x: 64,
    y: -64
},
{
    x: -64,
    y: 0
}, {
    x: 0,
    y: 0
}, {
    x: 64,
    y: 0
},
{
    x: -64,
    y: 64
}, {
    x: 0,
    y: 64
}, {
    x: 64,
    y: 64
}
];
// TODO when change to 32 fix this
const extendedMooreNeighbors = [{
    x: -128, // row 1
    y: -128
}, {
    x: -64,
    y: -128
}, {
    x: 0,
    y: -128
},
{
    x: 64,
    y: -128
}, {
    x: 128,
    y: -128
}, {
    x: -128, // row 2
    y: -64
},
{
    x: -64,
    y: -64
}, {
    x: 0,
    y: -64
}, {
    x: 64,
    y: -64
},
{
    x: 128,
    y: -64
}, {
    x: -128, // row 3
    y: 0
}, {
    x: -64,
    y:0
},
{
    x: 0,  // center
    y: 0
}, {
    x: 64,
    y: 0
}, {
    x: 128,
    y: 0
},
{
    x: -128, // row 4
    y: 64
}, {
    x: -64,
    y: 64
}, {
    x: 0,
    y: 64
},
{
    x: 64,
    y: 64
}, {
    x: 128,
    y: 64
}, {
    x: -128, // row 5
    y: 128
},
{
    x: -64,
    y: 128
}, {
    x: 0,
    y: 128
}, {
    x: 64,
    y: 128
},
{
    x: 128,
    y: 128
}
];
const vonNuemanNeighbors = [{
    x: -64,
    y: 0
}, {
    x: 64,
    y: 0
},
{
    x: 0,
    y: -64
}, {
    x: 0,
    y: 64
}
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
                    x: this.unit.position.x + 32 + (Math.random() - 0.5) * 16,
                    y: this.unit.position.y + 8 + (Math.random() - 0.5) * 16,
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
            x: this.unit.position.x + 32,
            y: this.unit.position.y + 32,
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
        this.energy = 10000;
        this.maxEnergy = 10000;
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
class Battery {
    constructor(unit) {
        this.storedEnergy = 80000;
        this.storedCapacity = 80000; // mHa
        this.floatStage = 0.95;
        this.absorptionStage = 0.8;
        this.lowStage = 0.5;
        this.criticalStage = 0.2;
        this.dischargeRate = 40; // Amps
        this.voltage = 6; // Volts
        this.dropoff = {
            float: 1,
            absorb: 0.9,
            bulk: 0.8,
            low: 0.8,
            critical: 0.5,
            discharged: 0,
        };
        this.unit = unit;
        this.storedCharge = "bulk";
        this.isDisabled = false;

    }
    update() {
        this.checkState();
        // this.drawPower(this.unit._acceleration);

        if (this.storedCharge == "discharged") {
            this.isDisabled = true;
        }
        if (this.isDisabled) {
            this.recoverEnergy();
            return;
        }

        if (this.unit.direction === 'center') {
            if (this.storedEnergy < this.storedCapacity) {
                switch (this.storedCharge) {
                    case "absorb":
                        this.storedEnergy += 2;

                        break;
                    case "bulk":
                        this.storedEnergy += 3;

                        break;
                    case "low":
                        this.storedEnergy += 4;

                        break;
                    default:
                        this.storedEnergy += 1;

                        break;
                }
            }
        }

    }
    drawPower(acceleration) {
        if (acceleration.x != 0 || acceleration.y != 0) {
            const cost = Math.abs(acceleration.x + acceleration.y);
            this.storedEnergy -= cost;
        }
    }
    checkState() {
        if (this.storedEnergy >= this.storedCapacity * this.floatStage) {
            this.storedCharge = "float";
        } else if (
            this.storedEnergy < this.storedCapacity &&
            this.storedEnergy >= this.storedCapacity * this.absorptionStage
        ) {
            this.storedCharge = "absorb";
        } else if (
            this.storedEnergy < this.storedCapacity * this.absorptionStage &&
            this.storedEnergy > this.storedCapacity * this.lowStage
        ) {
            this.storedCharge = "bulk";
        } else if (
            this.storedEnergy < this.storedCapacity * this.lowStage &&
            this.storedEnergy > this.storedCapacity * this.criticalStage
        ) {
            this.storedCharge = "low";
        } else if (
            this.storedEnergy < this.storedCapacity * this.criticalStage &&
            this.storedEnergy > 0
        ) {
            this.storedCharge = "critical";
        } else if (this.storedEnergy <= 0) {
            this.storedCharge = "discharged";
        }
    }

    recharge() {
        this.storedEnergy = this.storedCapacity;
    }
    recoverEnergy() {
        // this.body.animations.play("spin");
        this.storedEnergy += 10;
        if (this.storedEnergy > this.storedCapacity / 3) {
            this.isDisabled = false;
        }
    }
}
class Motor {
    constructor() {
        this.KV = 5;
    }
}
class Transmission {
    constructor() {
        this.gearBox = {
            1: {
                drive: 1,
                motor: 2
            }, // low
            2: {
                drive: 1,
                motor: 1
            }, // direct
            3: {
                drive: 2,
                motor: 1
            }, // overdrive
        };
        this.gear = 2;
    }
}



class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, canvas, camera, map, level = 1, experience = 0, health = 100) {
        super(canvas);
        this.debug = true;

        document.addEventListener('keydown', (event) => {
            if (event.key === 'F2') {
                event.preventDefault();
                this.debug = !this.debug;
            }
            if (event.key === 'n') {
                event.preventDefault();
                this.useAutoInput = !this.useAutoInput;

                events.emit('DISPLAY_TEXT', {
                    heading: 'Auto Input',
                    subheading: this.useAutoInput ? 'Enabled' : 'Disabled',
                    paragraph: ''
                });
            }

        });
        this.map = map;



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



        this.maxDistance = 128;
        this.targetPosition = null;

        this.initialX = x;
        this.initialY = y;

        this.position = new Vector2(x, y);

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
        this.isFloating = false;
        this.isJumping = false;

        this.fallingDamage = 0;

        this.facingDirection = 'right';
        this.spriteWidth = 64;
        this.spriteHeight = 128;

        this.gcd = 0;

        this.scale = 12;
        this.radius = 16;

        this.powerSupply = new Battery(this);
        this.powerSupply.storedEnergy = 12000;
        this.powerSupply.storedCapacity = 12000;
        this.powerSupply.dischargeRate = 2; // Amps
        this.motor = new Motor();
        this.motor.KV = 10;

        this.transmission = new Transmission();
        this.transmission.gear = 1;

        this._maxSpeed = this.powerSupply.dischargeRate;

        this._mass = 120;

        this._gravity = 40;
        this._drag = 0.1; // friction

        this._acceleration = new Vector2(0, 0);
        this._velocity = new Vector2(0, 0);


        this.useAutoInput = false;

        this.momentum = 0;
        this.upCount = 0;
        this.maxUp = 2;


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
                this.isFloating = true;
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
    ready() {
        this.startingposition = new Vector2(this.position.x, this.position.y);

        const tile = this.currentTile;

        if (!tile) {
            throw new Error('Tile not found');
        } else {
            this.tile = tile;
        }

        this.calculateMooreNeighbors(this.gameMap);

        console.log('Unit ready', this);
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

        this.tryEmitPosition();

        // Check tile
        const tile = this.currentTile;
        const tileBelow = this.tileBelow;

        if (tile !== this.tile) {
            this.previousTile = this.tile;
            this.tile = tile;
            this.calculateMooreNeighbors(this.gameMap);
        }

        // UPDATE GRID MOVEMENT
        if (this.isMoving && this.targetPosition) {

            const distance = this.moveTowards();

            if (tile.type === 'water') {
                root.map.disturbWater(this.position.x, this.position.y);
            }
            return;
        }

        this.doVitals(delta);

        this.powerSupply.update();



        let input = {
            direction: this.getDirectionFromInput(root.input.keysPressed)
        };

        let direction = 'center';

        if (this.useAutoInput) {
            input = root.automatedInput;
            direction = input.direction;
        } else if (!!input.direction && !this.isFalling) {
            direction = input.direction;
        }

        this.lastDirection = this.direction;
        this.direction = direction;

        // idle ability
        this.updateIdleState(delta, root);
        if (this.isIdling) {
            return;
        }

        // change facing ability
        if (this.facingDirection != 'right' && direction === 'right') {
            this.facingDirection = 'right';
            this.delay = 200;
            return;
        } else if (this.facingDirection != 'left' && direction === 'left') {
            this.facingDirection = 'left';
            this.delay = 200;
            return;
        } else if (this.facingDirection != 'down' && direction === 'down') {
            this.facingDirection = 'down';
        } else if (this.facingDirection != 'up' && direction === 'up') {
            this.facingDirection = 'up';
        }

        if (this.momentum > 0) {
            this.momentum -= 1;
            this.tryMove(this.momentumDirection);
            return;
        }

        if (this.isFloating) {
            if (!!tileBelow && tileBelow.solid) {
                this.isFloating = false;
            }
        }

        if (this.isFalling) {
            if (!!tileBelow && tileBelow.solid) {
                this.breakFall(tileBelow);
                this.isFalling = false;
                this.momentum = 0;
                this.delay = 200;
            }
        }

        if (!tile.solid && !!tileBelow && tileBelow.type === 'water') {
            direction = 'down';

            this.tryMove(direction);
            return;
        }

        if (!tile.solid && !!tileBelow && tileBelow.type === 'air') {
            direction = 'down';
            this.isFalling = true;

            this.tryMove(direction);
            return;
        }



        if (this.upCount > 0) {
            this.upCount -= 1;
            this.delay = 30;
            return;
        }

        // move ability
        this.tryMove(direction);

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
                this.position.x + offsetX,
                this.position.y + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'right') {
            ctx.drawImage(
                this.image,
                this.position.x + offsetX,
                this.position.y + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'down') {
            ctx.drawImage(
                this.imageDown,
                this.position.x + offsetX,
                this.position.y + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        } else if (this.facingDirection === 'up') {
            ctx.drawImage(
                this.imageDown,
                this.position.x + offsetX,
                this.position.y + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        }

        this.drawManaBar(ctx, this.position.x, this.position.y - 10);

        if (this.debug) {
            let index = 0;
            this.calculateExtendedMooreNeighbors(this.gameMap);
            this.extendedMooreNeighbors.forEach(neighbor => {
                let text = `${neighbor.x} ${neighbor.y}`;
                let text2 = `${neighbor.type}`;
                let text3 = `${neighbor.passable}`;

                if (index === 12) {
                    // UNIT TILE
                    text = `${Math.floor(this.position.x)}, ${Math.floor(this.position.y)}`;
                    text2 = `${this.facingDirection}, ${neighbor.type}`;
                    text3 = `${this.direction}`;
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                    ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                    ctx.fillStyle = 'white';
                    ctx.fillText(text, neighbor.x + 10, neighbor.y + 10);
                    ctx.fillText(text2, neighbor.x + 10, neighbor.y + 30);
                    ctx.fillText(text3, neighbor.x + 10, neighbor.y + 60);

                } else if (neighbor.solid) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                    ctx.fillStyle = 'black';
                    ctx.fillText(text, neighbor.x + 10, neighbor.y + 10);
                    ctx.fillText(text2, neighbor.x + 10, neighbor.y + 30);
                    ctx.fillText(text3, neighbor.x + 10, neighbor.y + 50);

                } else if (neighbor.passable) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(neighbor.x, neighbor.y, 64, 64);

                    ctx.fillStyle = 'white';
                    ctx.fillText(text, neighbor.x + 10, neighbor.y + 10);
                    ctx.fillText(text2, neighbor.x + 10, neighbor.y + 30);
                    ctx.fillText(text3, neighbor.x + 10, neighbor.y + 50);

                }
                if (this.direction) {
                    const directions = {
                        'up': 7,
                        'up-right': 8,
                        'right': 13,
                        'down-right': 18,
                        'down': 17,
                        'down-left': 16,
                        'left': 11,
                        'up-left': 6,
                        'up-two': 2,
                        'up-two-right-one': 3,
                        'up-two-left-one': 1,
                        'up-left-two': 0,
                        'up-right-two': 4
                    };
                    const directionIndex = directions[this.direction];
                    if (index === directionIndex) {
                        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                        ctx.fillRect(neighbor.x, neighbor.y, 64, 64);
                        // fill text with tile durability, breakable, type
                        text = `${Math.floor(neighbor.durability)}`;
                        text2 = `${neighbor.variant}`;
                        text3 = `${neighbor.breakable}`;


                        ctx.fillStyle = 'white';
                        ctx.fillText(text, neighbor.x + 10, neighbor.y + 20);
                        ctx.fillText(text2, neighbor.x + 10, neighbor.y + 40);
                        ctx.fillText(text3, neighbor.x + 10, neighbor.y + 60);

                    }
                }

                index++;

            });

        }
        ctx.restore();
    }


    updateIdleState(delta, root) {
        if (this.useAutoInput) return;
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

        } else if (keysPressed.includes('w') && keysPressed.includes(' ') && numKeysPressed === 2) {
            if (this.mooreNeighbors[1].passable) {
                this.calculateExtendedMooreNeighbors(this.gameMap);
                if (this.extendedMooreNeighbors[2].passable) {
                    direction = 'up-two';
                } else {
                    direction = 'up';
                }
            } else {
                direction = 'up';
            }

        } else if (keysPressed.includes('a') && keysPressed.includes(' ') && numKeysPressed === 2) {
            if (this.mooreNeighbors[0].passable) {

                direction = 'up-left-two';


            } else {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                if (this.extendedMooreNeighbors[0].passable && this.tileUpOne.passable && this.tileUpTwo.passable) {

                    direction = 'up-two-left-one';
                } else {

                    direction = 'up-left';

                }


            }

        } else if (keysPressed.includes('d') && keysPressed.includes(' ') && numKeysPressed === 2) {
            if (this.mooreNeighbors[2].passable) {

                direction = 'up-right-two';


            } else {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                if (this.extendedMooreNeighbors[3].passable && this.tileUpOne.passable && this.tileUpTwo.passable) {
                    direction = 'up-two-right-one';

                } else {
                    direction = 'up-right';
                }

            }

        } else if (keysPressed.includes('ArrowUp') && numKeysPressed === 1) {

            direction = 'up';

        } else if (keysPressed.includes('ArrowDown') && numKeysPressed === 1) {

            direction = 'down';

        } else if (keysPressed.includes('ArrowLeft') && numKeysPressed === 1) {

            direction = 'left';

        } else if (keysPressed.includes('ArrowRight') && numKeysPressed === 1) {

            direction = 'right';

        } else if (keysPressed.includes('ArrowUp') && keysPressed.includes('ArrowLeft') && numKeysPressed === 2) {

            direction = 'up-left';

        } else if (keysPressed.includes('ArrowUp') && keysPressed.includes('ArrowRight') && numKeysPressed === 2) {

            direction = 'up-right';

        } else if (keysPressed.includes('ArrowDown') && keysPressed.includes('ArrowLeft') && numKeysPressed === 2) {

            direction = 'down-left';

        } else if (keysPressed.includes('ArrowDown') && keysPressed.includes('ArrowRight') && numKeysPressed === 2) {

            direction = 'down-right';

        } else if (keysPressed.includes('ArrowUp') && keysPressed.includes(' ') && numKeysPressed === 2) {

            if (this.mooreNeighbors[1].passable) {
                this.calculateExtendedMooreNeighbors(this.gameMap);
                if (this.extendedMooreNeighbors[2].passable) {
                    direction = 'up-two';
                } else {
                    direction = 'up';
                }
            } else {
                direction = 'up';
            }
        } else if (keysPressed.includes('ArrowLeft') && keysPressed.includes(' ') && numKeysPressed === 2) {

            if (this.mooreNeighbors[0].passable) {

                direction = 'up-left-two';


            } else {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                if (this.extendedMooreNeighbors[0].passable && this.tileUpOne.passable && this.tileUpTwo.passable) {

                    direction = 'up-two-left-one';
                } else {

                    direction = 'up-left';

                }


            }
        } else if (keysPressed.includes('ArrowRight') && keysPressed.includes(' ') && numKeysPressed === 2) {

            if (this.mooreNeighbors[2].passable) {

                direction = 'up-right-two';


            } else {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                if (this.extendedMooreNeighbors[3].passable && this.tileUpOne.passable && this.tileUpTwo.passable) {
                    direction = 'up-two-right-one';

                } else {
                    direction = 'up-right';
                }

            }

        } else if (keysPressed.includes(' ') && numKeysPressed === 1) {

            direction = 'up';

        } else if (keysPressed.includes('Shift') && numKeysPressed === 1) {

            direction = 'down';

        } else if (keysPressed.includes('Shift') && keysPressed.includes('ArrowLeft') && numKeysPressed === 2) {

            direction = 'down-left';

        } else if (keysPressed.includes('Shift') && keysPressed.includes('ArrowRight') && numKeysPressed === 2) {

            direction = 'down-right';

        } 
         

        return direction;

    }
    tryMove(direction) {
        if (this.isMoving) return;

        this.targetPosition = null;
        let selectedTile = null;

        let dX = 0;
        let dY = 0;

        switch (direction) {
            case 'up': {
                selectedTile = this.mooreNeighbors[1];
                dX = 0; dY = -1;
                this.upCount++;
                break;
            }
            case 'down': {
                selectedTile = this.mooreNeighbors[7];
                dX = 0; dY = 1;
                break;
            }
            case 'left': {
                selectedTile = this.mooreNeighbors[3];
                dX = -1; dY = 0;
                break;
            }
            case 'right': {
                selectedTile = this.mooreNeighbors[5];
                dX = 1; dY = 0;
                break;
            }
            case 'up-left': {
                selectedTile = this.mooreNeighbors[0];

                dX = -1; dY = -1;
                
                this.upCount++;

                break;
            }
            case 'up-right': {
                selectedTile = this.mooreNeighbors[2];

                dX = 1; dY = -1;

                this.upCount++;

                break;
            }
            case 'down-left': {
                selectedTile = this.mooreNeighbors[6];
                dX = -1; dY = 1;
                break;
            }
            case 'down-right': {
                selectedTile = this.mooreNeighbors[8];
                dX = 1; dY = 1;
                break;
            }
            case 'up-two': {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                selectedTile = this.extendedMooreNeighbors[2];

                dX = 0; dY = -2;

                this.upCount += 2;

                this.momentum = 1;
                this.momentumDirection = 'up';

                break;
            }
            case 'up-two-right-one': {

                selectedTile = this.tileUpTwo;

                this.momentum = 1;
                this.momentumDirection = 'right';

                dX = 0; dY = -3;
                this.upCount += 3;


                break;
            }
            case 'up-two-left-one': {

                selectedTile = this.tileUpTwo;
                this.momentum = 1;
                this.momentumDirection = 'left';

                dX = 0; dY = -3;
                this.upCount += 3;
                break;
            }
            case 'up-left-two': {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                selectedTile = this.extendedMooreNeighbors[0];

                dX = -2; dY = -2;

                this.upCount += 2;

                this.momentum = 1;
                this.momentumDirection = 'left';

                break;
            }
            case 'up-right-two': {
                this.calculateExtendedMooreNeighbors(this.gameMap);

                selectedTile = this.extendedMooreNeighbors[4];

                dX = 2; dY = -2;

                this.upCount += 2;

                this.momentum = 1;
                this.momentumDirection = 'right';

                break;
            }
        }

        const checkRightBorder = this.position.x + this.size >= this.mapSize.width;
        const checkLeftBorder = this.position.x <= 0;

        if (selectedTile) {
            if (selectedTile.passable) {
                this.targetPosition = new Vector2(selectedTile.x, selectedTile.y);
                this.isMoving = true;

                // Store movement direction for later use
                this.lastMovementDirection = {
                    x: selectedTile.x - this.position.x,
                    y: selectedTile.y - this.position.y
                };
            } else if (selectedTile.breakable) {
                this.tryBreakBlock(selectedTile);
            } else if (selectedTile.type === 'border') {
                if (checkLeftBorder) {
                    // go back
                    if (gameWorld != 'underworld') {
                        events.emit('RETREAT_MAP');
                    }
                } else if (checkRightBorder) {
                    // go forward
                    events.emit('ADVANCE_MAP');
                }
            }
        }
    }
    moveTowards() {
        let distanceToTravelX = this.targetPosition.x - this.position.x;
        let distanceToTravelY = this.targetPosition.y - this.position.y;

        let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

        if (distance <= this.speed) {
            this.position.x = this.targetPosition.x;
            this.position.y = this.targetPosition.y;
            this.targetPosition = null;
            this.isMoving = false;

        } else {
            let normalizedX = distanceToTravelX / distance;
            let normalizedY = distanceToTravelY / distance;

            let adjustedSpeed = this.speed;

            if (this.isSinking) {
                adjustedSpeed *= 0.3;
            }
            if (this.isFloating) {
                adjustedSpeed *= 0.4;
            }
            if (this.tile.type === 'water') {
                adjustedSpeed *= 0.5;
            }
            if (this.isFalling) {
                adjustedSpeed *= 2;
            }

            const newX = this.position.x + normalizedX * adjustedSpeed;
            const newY = this.position.y + normalizedY * adjustedSpeed;

            if (newX > 0) {
                this.lastX = this.position.x;
                this.position.x = newX;
            }
            if (newY > 0) {
                this.lastY = this.position.y;
                this.position.y = newY;
            }

        }
        return distance;
    }
    move(direction) {
        if (direction) {
            const torque =
                (this.motor.KV *
                    this.powerSupply.voltage *
                    this.transmission.gearBox[this.transmission.gear].motor) /
                (this.totalMass *
                    this.transmission.gearBox[this.transmission.gear].drive);


            switch (direction) {
                case "left":
                    if (Math.abs(this._acceleration.x) < this._maxSpeed) {
                        this._acceleration.x -= torque;
                        // this.body.animations.play("walkLeft");
                    }
                    break;
                case "right":
                    if (Math.abs(this._acceleration.x) < this._maxSpeed) {
                        this._acceleration.x += torque;
                        // this.body.animations.play("walkRight");
                    }
                    break;
                case "up":
                    if (Math.abs(this._acceleration.y) < this._maxSpeed) {
                        this._acceleration.y -= torque;
                        // this.body.animations.play("walkUp");
                    }
                    break;
                case "down":
                    if (Math.abs(this._acceleration.y) < this._maxSpeed) {
                        this._acceleration.y += torque;
                        // this.body.animations.play("walkDown");
                    }
                    break;
                case "up-left":
                    if (Math.abs(this._acceleration.x) < this._maxSpeed / 2 &&
                        Math.abs(this._acceleration.y) < this._maxSpeed / 2
                    ) {
                        this._acceleration.x -= torque / Math.sqrt(2);
                        this._acceleration.y -= torque / Math.sqrt(2);
                        // this.body.animations.play("walkLeft");
                    }
                    break;
                case "up-right":
                    if (Math.abs(this._acceleration.x) < this._maxSpeed / 2 &&
                        Math.abs(this._acceleration.y) < this._maxSpeed / 2
                    ) {
                        this._acceleration.x += torque / Math.sqrt(2);
                        this._acceleration.y -= torque / Math.sqrt(2);
                        // this.body.animations.play("walkRight");
                    }
                    break;
                case "down-left":
                    if (Math.abs(this._acceleration.x) < this._maxSpeed &&
                        Math.abs(this._acceleration.y) < this._maxSpeed / 2
                    ) {
                        this._acceleration.x -= torque / Math.sqrt(2);
                        this._acceleration.y += torque / Math.sqrt(2);
                        // this.body.animations.play("walkLeft");
                    }
                    break;
                case "down-right":
                    if (Math.abs(this._acceleration.x) < this._maxSpeed &&
                        Math.abs(this._acceleration.y) < this._maxSpeed / 2
                    ) {
                        this._acceleration.x += torque / Math.sqrt(2);
                        this._acceleration.y += torque / Math.sqrt(2);
                        // this.body.animations.play("walkRight");
                    }
                case "center":
                    // NO DIRECTION - APPLY FRICTION & GRAVITY
                    // Reset acceleration to 0 on key release (no input)
                    const aX = this._acceleration.x;
                    const aY = this._acceleration.y;

                    // x friction
                    if (aX < 0) {
                        this._acceleration.x = aX + this._drag;
                    } else if (aX > 0) {
                        this._acceleration.x = aX - this._drag;
                    }

                    if ((aX < 1 && aX > 0) || (aX > -1 && aX < 0)) {
                        this._acceleration.x = 0;
                    }

                    // y friction
                    if (aY < 0) {
                        this._acceleration.y = aY + this._drag;
                    } else if (aY > 0) {
                        this._acceleration.y = aY - this._drag;
                    }

                    if ((aY < 1 && aY > 0) || (aY > -1 && aY < 0)) {
                        this._acceleration.y = 0;
                    }

                    // gravity

                    // accelerate the unit downwards


                    break;
            }
        }

        const sag = this.powerSupply.dropoff[this.powerSupply.storedCharge];

        const forceX = this._acceleration.x * this.totalMass * sag;
        const forceY = this._acceleration.y * this.totalMass * sag;

        const vX = forceX / this._mass;
        const vY = forceY / this._mass;

        if (vX < 0 || vX > 0) {
            this._velocity.x = vX * 1 - this._gravity;
        } else if ((vX < 1 && vX > 0) || (vX > -1 && vX < 0)) {
            this._velocity.x = 0;
        }

        if (vY < 0 || vY > 0) {
            this._velocity.y = vY * 1 - this._gravity;
        } else if ((vY < 1 && vY > 0) || (vY > -1 && vY < 0)) {
            this._velocity.y = 0;
        }

        let nextX = this.position.x;
        let nextY = this.position.y;

        switch (this.direction) {
            case "left":
                nextX += vX;
                break;
            case "right":
                nextX += vX;
                break;
            case "up":
                nextY += vY;
                break;
            case "down":
                nextY += vY;
                break;
            case "up-left":
                nextX += vX;
                nextY += vY;
                break;
            case "up-right":
                nextX += vX;
                nextY += vY;
                break;
            case "down-left":
                nextX += vX;
                nextY += vY;
                break;
            case "down-right":
                nextX += vX;
                nextY += vY;
                break;
            default:
                break;
        }

        const nextPosition = new Vector2(nextX, nextY);
        const result = this.canMoveTo(nextPosition.x, nextPosition.y);


        if (
            !!result &&
            result.passable) {

            this.position = nextPosition;
        } else {
            this._velocity = new Vector2(0, 0);
            this._acceleration = new Vector2(0, 0);

            switch (this.facingDirection) {
                case "left":
                    // this.body.animations.play("standLeft");
                    break;

                case "right":
                    // this.body.animations.play("standRight");
                    break;

                case "up":
                    // this.body.animations.play("standUp");
                    break;

                case "down":
                    // this.body.animations.play("standDown");
                    break;

                default:
                    break;
            }
        }
    }
    breakFall(tileBelow) {


        if (tileBelow.solid && this.isFalling) {
            if (tileBelow.breakable) {
                events.emit("PARTICLE_EMIT", {
                    x: this.position.x + 32,
                    y: this.position.y + 64,
                    color: 'rgba(255, 255, 255, 0.5)',
                    size: 4,
                    duration: 1000,
                    shape: 'square',
                    count: 10,
                });
            } else {
                events.emit("PARTICLE_EMIT", {
                    x: this.position.x + 32,
                    y: this.position.y + 32,
                    color: 'rgba(191, 191, 191, 0.5)',
                    size: 1,
                    duration: 1000,
                    shape: 'circle',
                    count: 1,
                });
            }

            events.emit("CAMERA_SHAKE", {
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                targetPosition: {
                    x: this.position.x,
                    y: this.position.y - 32
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


    calculateExtendedMooreNeighbors(map) {

        this.extendedMooreNeighbors = [];

        extendedMooreNeighbors.forEach(neighbor => {
            const neighborX = this.position.x + neighbor.x;
            const neighborY = this.position.y + neighbor.y;
            const neighborTile = map.getTileAtCoordinates(neighborX, neighborY);
            if (neighborTile) {
                this.extendedMooreNeighbors.push(neighborTile);

            } else {
                this.extendedMooreNeighbors.push({
                    type: 'border',
                    solid: true,
                    breakable: false
                });

            }
        });
    }
    calculateMooreNeighbors(map) {
        this.mooreNeighbors = [];

        mooreNeighbors.forEach(neighbor => {
            const neighborX = this.position.x + neighbor.x;
            const neighborY = this.position.y + neighbor.y;
            const neighborTile = map.getTileAtCoordinates(neighborX, neighborY);
            if (neighborTile) {
                this.mooreNeighbors.push(neighborTile);
            } else {
                this.mooreNeighbors.push({
                    type: 'border',
                    solid: true,
                    breakable: false
                });
            }
        });
    }


    moveToSpawn() {
        this.position.x = this.startingposition.x;
        this.position.y = this.startingposition.y;

        this.lastX = null;
        this.lastY = null;

        this.lastMovementDirection = {
            x: 0,
            y: 0
        };

        this.facingDirection = 'right';

        this.isGravityOff = false;

        this.previousTile = null;

        this.tile = this.currentTile;

        this.calculateMooreNeighbors(this.gameMap);

        events.emit("PLAYER_POSITION", {
            x: this.position.x,
            y: this.position.y,
            cause: "spawn"
        });


    }
    updateSpawnPoint(x, y) {
        this.position.x = x;
        this.position.y = y;

        this.initialX = x;
        this.initialY = y;

        this.startingposition = new Vector2(x, y);

        this.calculateMooreNeighbors(this.gameMap);

        this.tile = this.currentTile;

        events.emit("PLAYER_POSITION", {
            x: this.position.x,
            y: this.position.y,
            cause: "spawn"
        });
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

        this.position.x = this.startingposition.x;
        this.position.y = this.startingposition.y;

        this.lastX = null;
        this.lastY = null;

        this.lastMovementDirection = {
            x: 0,
            y: 0
        };

        this.facingDirection = 'right';

        this.isGravityOff = false;
        this.isCollecting = false;

        this.previousTile = null;

        this.tile = this.currentTile;

        this.calculateMooreNeighbors(this.gameMap);

        events.emit("PLAYER_POSITION", {
            x: this.position.x,
            y: this.position.y,
            cause: "spawn"
        });
    }


    tryEmitPosition() {
        if (this.lastX === this.position.x && this.lastY === this.position.y) {
            return;
        }
        this.lastX = this.position.x;
        this.lastY = this.position.y;

        events.emit("PLAYER_POSITION", {
            x: this.position.x,
            y: this.position.y,
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
            let adjustedX = this.position.x;
            if (this.facingDirection === 'left') {
                adjustedX -= 32;
            } else {
                adjustedX += 32;
            }

            setTimeout(() => {
                events.emit("PARTICLE_EMIT", {
                    x: adjustedX + 32 + (Math.random() - 0.5) * 4,
                    y: this.position.y + 32 + (Math.random() - 0.5) * 4,
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




    findSafeReturnPosition(map) {

        const pushDistance = 64;
        const pushX = this.position.x - (this.lastMovementDirection.x * pushDistance);
        const pushY = this.position.y - (this.lastMovementDirection.y * pushDistance);


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
            const checkX = this.position.x + (dir.x * pushDistance);
            const checkY = this.position.y + (dir.y * pushDistance);
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
                const targetX = this.position.x + dx;
                const targetY = this.position.y + dy;
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
    drawManaBar(ctx, posX, posY) {
        const width = this.spriteWidth; // Assuming 'this.width' represents the total width for the bar
        const height = 4;
        let fillColor = "blue";
        const emptyColor = "gray";
        const percentFull = Math.min(
            this.powerSupply.storedEnergy / this.powerSupply.storedCapacity,
            1
        ); // Clamp percentage between 0 and 1
        switch (this.powerSupply.storedCharge) {
            case "discharged":
                fillColor = "gray";
                break;
            case "critical":
                fillColor = "red";
                break;
            case "low":
                fillColor = "orange";
                break;
            case "bulk":
                fillColor = "purple";
                break;
            case "absorb":
                fillColor = "blue";
                break;
            case "float":
                fillColor = "gold";
                break;
            default:
                break;
        }
        // Draw the empty bar outline
        ctx.beginPath();
        ctx.rect(posX, posY, width, height);
        ctx.strokeStyle = emptyColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw the filled portion of the bar
        ctx.beginPath();
        ctx.rect(posX, posY, width * percentFull, height); // Fill based on percentage
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.closePath();
    }


    set position(position) {
        this.x = position.x;
        this.y = position.y;
    }
    get position() {
        return new Vector2(this.x, this.y);
    }
    get gameMap() {
        return this.parent.parent.map;
    }
    get mapSize() {
        return this.parent.parent.map.mapSize;
    }
    get currentTile() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x, this.position.y);
    }
    get tileBelow() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x, this.position.y + 64);
    }

    get tileLeftFour() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x - 256, this.position.y);
    }
    get tileRightFour() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x + 256, this.position.y);
    }


    get tileUpOneLeftThree() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x - 192, this.position.y - 64);
    }
    get tileUpOneRightThree() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x + 192, this.position.y - 64);
    }


    get tileUpFour() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x, this.position.y - 256);
    }
    get tileUpThree() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x, this.position.y - 192);
    }
    get tileUpTwo() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x, this.position.y - 128);
    }
    get tileUpOne() {
        return this.parent.parent.map.getTileAtCoordinates(this.position.x, this.position.y - 64);
    }


    get totalMass() {
        // plus encumberance
        // return this._mass + this?.inventory?.items?.length * this.scale ** 2;
        return this._mass;
    }

}