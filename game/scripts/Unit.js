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
const mooreNeighborOffsets = [{
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
    x: -1,
    y: 0
}, {
    x: 0,
    y: 0
}, {
    x: 1,
    y: 0
},
{
    x: -1,
    y: 1
}, {
    x: 0,
    y: 1
}, {
    x: 1,
    y: 1
}
];
// TODO when change to 32 fix this
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

class Lungs {
    constructor(unit) {
        this.unit = unit;
        this.oxygen = 100;
        this.maxOxygen = 100;
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

        if (this.health > 0) {

            events.emit("PARTICLE_EMIT", {
                x: this.unit.position.x + 32,
                y: this.unit.position.y + 32,
                color: 'rgba(255, 0, 0, 1)',
                size: 3 + Math.random() * 2,
                duration: 2000,
                shape: 'circle',
                count: amount,
            });
        } else
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



class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, world, level = 1, experience = 0, health = 100) {
        super();


        this.debug = false;

        this.useAutoInput = false;



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

        // MOVEMENT

        this.speed = speed;

        this.direction = 'center';
        this.lastDirection = 'center';

        this.facingDirection = 'right';
        this.maxDistance = world.tileSize * 2;
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

        this.tile = null;
        this.previousTile = null;

        this.vonNuemanNeighbors = [];
        this.mooreNeighbors = [];
        this.extendedMooreNeighbors = [];


        // STATS
        this.name = name;
        this.level = level;
        this.experience = experience;

        this.size = size;

        this.inventory = new Inventory();

        this.heart = new Heart(this);
        this.lungs = new Lungs(this);
        this.stomach = new Stomach(this);

        this.isAlive = true;


        // SCORE 

        this.luminaSpheres = 0;
        this.acorns = 0;
        this.feyLight = 0;


        // APPEARANCE

        this.colorClass = colorClass;


        // SPRITES

        this.spriteWidth = 64;
        this.spriteHeight = 128;

        this.image = new Image();
        this.image.src = 'images/Sprite-curioustraveler.png';

        this.imageLeft = new Image();
        this.imageLeft.src = 'images/Sprite-curioustraveler2.png';

        this.imageDown = new Image();
        this.imageDown.src = 'images/Sprite-curioustraveler3.png';


        // EVENTS

        events.on('MAP_CHANGED', this, (world) => {
            // cancel jump
            this.jumpArc.active = false;
            this.isJumping = false;
            this.isFalling = false;
            this.isMoving = false;
            this.isCollecting = false;
            this.fallingDamage = 0;
            this.delay = 0;


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
                this.isFalling = false;
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


            const safePosition = this.findSafeReturnPosition(this.world);
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


        // PARTICLE COOLDOWNS
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


        // STATES

        this.delay = 0;

        this.isCollecting = false;

        this.isFalling = false;
        this.fallDamage = 0;
        this.fallTowards = {
            active: false,
            startPos: null,
            endPos: null,
            progress: 0,
            duration: 500, // milliseconds
            fallDampening: 500, // Dampening factor for falling
            height: 0, // No upward arc for falling
            onComplete: null
        }

        this.isIdling = false;
        this.idleTimer = {
            active: false,
            startTime: 0,
            duration: 3000,
            onComplete: null
        };

        this.isJumping = false;
        this.jumpArc = {
            active: false,
            startPos: null,
            endPos: null,
            progress: 0,
            duration: 500, // milliseconds
            fallDampening: 10000, // Dampening factor for falling
            height: 192, // max height of jump arc
            onComplete: null
        };

        this.isMoving = false;
        this.moveTowards = {
            active: false,
            startPos: null,
            endPos: null,
            progress: 0,
            duration: 500, // milliseconds
            onComplete: null
        }
    }

    ready() {
        this.startingposition = new Vector2(this.position.x, this.position.y);

        const tile = this.currentTile;

        if (!tile) {
            throw new Error('Tile not found');
        } else {
            this.tile = tile;
        }

        this.calculateMooreNeighbors(this.world);

        console.log('Unit ready', this);
    }

    step(delta, root) {

        // UPDATE PARTICLE COOLDOWNS

        Object.values(this.particleCooldowns).forEach(cooldown => {
            cooldown.current = Math.max(0, cooldown.current - delta);
        });

        // TRANSMIT SIGNALS

        this.tryEmitPosition();


        // OBSERVE ENVIRONMENT

        // Check tiles
        // (update & store tile here to reduce calls to getTileAtCoordinates)

        const tile = this.currentTile;
        const tileBelow = this.tileBelow;

        if (tile !== this.tile) {
            this.previousTile = this.tile;

            this.tile = tile;

            this.calculateMooreNeighbors(this.world);
        }


        // CHECK VITALS

        this.doVitals(delta);


        // FIND DIRECTION

        let direction = this.direction;

        let input = {
            direction: this.getDirectionFromInput(root.input.keysPressed)
        };

        if (this.useAutoInput) {

            input = root.automatedInput;

            direction = input.direction;

        } else if (!!input.direction) {

            direction = input.direction;

        }

        this.lastDirection = this.direction;

        this.direction = direction;


        // UPDATES

        // delay
        if (this.delay > 0) {
            this.delay -= delta;
            return;
        }

        // respawn
        if (!this.isAlive) {
            this.respawn();
            return;
        }

        // collect
        if (this.isCollecting) {
            return;
        }

        // idle
        if (this.isIdling && !this.targetPosition) {
            if (this.idleTimer.active) {
                this.updateIdleTimer(delta);
            } else {
                this.startIdleTimer();
            }
        }

        // change facing 
        if (this.facingDirection != 'right' && direction === 'right') {

            this.facingDirection = 'right';

            if (!this.isJumping) {

                this.delay = constants.KEY_DELAY;
            }
            return;
        } else if (this.facingDirection != 'left' && direction === 'left') {

            this.facingDirection = 'left';

            if (!this.isJumping) {
                this.delay = constants.KEY_DELAY;
            }
            return;
        }

        // jump
        if (this.isJumping && this.targetPosition) { // transition to jumping state
            if (this.jumpArc.active) {

                this.updateJumpArc(delta);

                if (tile.type === 'water') {
                    root.world.disturbWater(this.position.x, this.position.y);
                }
                return;
            } else {
                this.startJumpArc();
            }
        }

        // move
        if (this.isMoving && this.targetPosition) {
            if (this.moveTowards.active) {

                this.updateMoveTowards(delta);

                if (tile.type === 'water') {
                    root.world.disturbWater(this.position.x, this.position.y);
                }
                return;
            } else {
                this.startMoveTowards();
            }
        }

        // fall
        if (this.isFalling && this.targetPosition) {
            if (this.fallTowards.active) {
                this.updateFallTowards(delta);
                return;
            } else {
                this.startFallTowards();
            }
        }

        // CHECKS & TRANSITIONS

        // check if idle
        if (!this.moving && !this.isFalling && !this.isJumping && !this.isCollecting && !this.isIdling && !this
            .isChangingFacingDirection) {
            this.isIdling = true;
        } else {
            if (direction != 'center') {
                this.isIdling = false;
                this.idleTimer.active = false;

            }
            // input detected, try other steps
        }

        // try swim
        const swimCondition = tile.type === 'water';

        if (swimCondition) {
            this.trySwim(direction);
            return;
        }

        // try fall
        const fallCondition = !tile.solid && !!tileBelow && tileBelow.type === 'air'; // check fall
        const sinkCondition = !tile.solid && !!tileBelow && tileBelow.type === 'water'; // check sink

        if (fallCondition || sinkCondition) {
            direction = 'down';

            this.tryFall(direction);
            return;
        }

        // try move
        this.tryMove(direction);

    }

    draw(ctx) {
        if (!this.isAlive) return;
        if (this.isCollecting) return;

        let drawX = this.position.x;
        let drawY = this.position.y;

        const scale = 1;

        let offsetX = constants.PLAYER_SPRITE_X_OFFSET;
        let offsetY = constants.PLAYER_SPRITE_Y_OFFSET;

        const scaledWidth = this.spriteWidth * scale;
        const scaledHeight = this.spriteHeight * scale;

        ctx.save();

        if (this.facingDirection === 'left') {
            ctx.drawImage(
                this.imageLeft,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'right') {
            ctx.drawImage(
                this.image,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'down') {
            ctx.drawImage(
                this.imageDown,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        } else if (this.facingDirection === 'up') {
            ctx.drawImage(
                this.imageDown,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        }

        // this.drawManaBar(ctx, drawX, drawY - 10);

        if (this.debug) {
            let index = 0;
            this.calculateExtendedMooreNeighbors(this.world);
            this.extendedMooreNeighbors.forEach(neighbor => {
                let text = `${index}`;
                let text2 = `${neighbor.type}`;
                let text3 = `${neighbor.passable}`;

                if (index === 12) {
                    // UNIT TILE
                    text = `${Math.floor(drawX)}, ${Math.floor(drawY)}`;
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
                this.calculateExtendedMooreNeighbors(this.world);
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
                this.calculateExtendedMooreNeighbors(this.world);

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
                this.calculateExtendedMooreNeighbors(this.world);

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

        } else if (keysPressed.includes('ArrowDown') && keysPressed.includes('ArrowRight') && numKeysPressed ===
            2) {

            direction = 'down-right';

        } else if (keysPressed.includes('ArrowUp') && keysPressed.includes(' ') && numKeysPressed === 2) {

            if (this.mooreNeighbors[1].passable) {
                this.calculateExtendedMooreNeighbors(this.world);
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
                this.calculateExtendedMooreNeighbors(this.world);

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
                this.calculateExtendedMooreNeighbors(this.world);

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

    tryMove(direction, momentum = 0) {
        if (this.isMoving || this.isJumping) return;

        this.targetPosition = null;

        let selectedTile = null;

        let jumping = false;

        let dX = 0;
        let dY = 0;

        switch (direction) {
            case 'up': {

                selectedTile = this.mooreNeighbors[1];

                dX = 0;
                dY = -1;

                jumping = true;

                break;
            }
            case 'down': {

                selectedTile = this.mooreNeighbors[7];

                dX = 0;
                dY = 1;

                break;
            }
            case 'left': {

                selectedTile = this.mooreNeighbors[3];

                dX = -1;
                dY = 0;

                break;
            }
            case 'right': {

                selectedTile = this.mooreNeighbors[5];

                dX = 1;
                dY = 0;

                break;
            }
            case 'up-left': {

                selectedTile = this.mooreNeighbors[0];

                dX = -1;
                dY = -1;

                if (!this.mooreNeighbors[3].solid && !this.mooreNeighbors[6].solid) {
                    this.calculateExtendedMooreNeighbors(this.world);
                    selectedTile = this.extendedMooreNeighbors[10];
                }

                jumping = true;

                break;
            }
            case 'up-right': {

                selectedTile = this.mooreNeighbors[2];

                dX = 1;
                dY = -1;

                if (!this.mooreNeighbors[5].solid && !this.mooreNeighbors[8].solid) {
                    this.calculateExtendedMooreNeighbors(this.world);
                    selectedTile = this.extendedMooreNeighbors[14];
                }

                jumping = true;

                break;
            }
            case 'down-left': {

                selectedTile = this.mooreNeighbors[6];

                dX = -1;
                dY = 1;

                jumping = true;

                break;
            }
            case 'down-right': {

                selectedTile = this.mooreNeighbors[8];

                dX = 1;
                dY = 1;

                jumping = true;

                break;
            }
            case 'up-two': {

                this.calculateExtendedMooreNeighbors(this.world);

                selectedTile = this.extendedMooreNeighbors[2];

                dX = 0;
                dY = -2;

                jumping = true;

                break;
            }
            case 'up-two-right-one': {

                this.calculateExtendedMooreNeighbors(this.world);

                selectedTile = this.extendedMooreNeighbors[3];

                dX = 1;
                dY = -2;

                jumping = true;

                break;
            }
            case 'up-two-left-one': {

                this.calculateExtendedMooreNeighbors(this.world);

                selectedTile = this.extendedMooreNeighbors[1];

                dX = -1;
                dY = -2;

                jumping = true;

                break;
            }
            case 'up-left-two': {

                this.calculateExtendedMooreNeighbors(this.world);

                selectedTile = this.extendedMooreNeighbors[0];

                dX = -2;
                dY = -2;

                jumping = true;

                break;
            }
            case 'up-right-two': {

                this.calculateExtendedMooreNeighbors(this.world);

                selectedTile = this.extendedMooreNeighbors[4];

                dX = 2;
                dY = -2;

                jumping = true;

                break;
            }
        }

        const checkRightBorder = this.position.x + this.size >= this.world.width;
        const checkLeftBorder = this.position.x <= 0;

        if (selectedTile) {

            if (selectedTile.passable) {

                if (jumping) {
                    this.isJumping = jumping;

                    const jumpDownRange = 3;

                    const targetJumpLocation = this.world.getJumpTarget(selectedTile.x, selectedTile.y,
                        jumpDownRange);

                    this.targetPosition = new Vector2(targetJumpLocation.x, targetJumpLocation.y);

                } else {
                    this.isMoving = true;
                    this.targetPosition = new Vector2(selectedTile.x, selectedTile.y);

                }

            } else if (selectedTile.breakable) {

                this.tryBreakBlock(selectedTile);


            } else if (selectedTile.type === 'border') {
                if (checkLeftBorder) {
                    // go back
                    if (world != 'underworld') {
                        events.emit('RETREAT_MAP');
                    }
                } else if (checkRightBorder) {
                    // go forward
                    events.emit('ADVANCE_MAP');
                }
            }
        }
    }

    trySwim(direction) {

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

            default: {
                selectedTile = this.mooreNeighbors[7];
                break;

            }
        }

        if (selectedTile.passable) {
            this.isMoving = true;
            this.targetPosition = new Vector2(selectedTile.x, selectedTile.y);

        }
    }

    tryFall(direction) {
        if (this.isFalling) return;

        this.targetPosition = null;

        let selectedTile = null;

        let dX = 0;
        let dY = 0;

        switch (direction) {
            case 'up':

                selectedTile = this.mooreNeighbors[1];

                dX = 0;
                dY = -1;

                break;

            case 'down':

                selectedTile = this.mooreNeighbors[7];

                dX = 0;
                dY = 1;

                break;

            case 'left':

                selectedTile = this.mooreNeighbors[3];

                dX = -1;
                dY = 0;

                break;

            case 'right':

                selectedTile = this.mooreNeighbors[5];

                dX = 1;
                dY = 0;

                break;

            default:
                break;
        }
        const checkRightBorder = this.position.x + this.size >= this.world.width;
        const checkLeftBorder = this.position.x <= 0;
        const checkTopBorder = this.position.y <= 0;
        const checkBottomBorder = this.position.y + this.size >= this.world.height;

        if (selectedTile.passable) {
            this.isFalling = true;


            const landingTile = this.world.getSolidTileBelow(selectedTile.x, selectedTile.y);

            if (!landingTile) {
                throw new Error('No landing tile found');
            }

            const emptyTile = this.world.getEmptyTileAbove(landingTile.x, landingTile.y);

            const waterTile = this.world.getWaterTileBelow(selectedTile.x, selectedTile.y);

            // compare the y values of the landingTile and waterTile
            if (!!waterTile && !!landingTile && waterTile.y < landingTile.y) {
                this.targetPosition = new Vector2(waterTile.x, waterTile.y);
            } else if (!!emptyTile) {
                this.targetPosition = new Vector2(emptyTile.x, emptyTile.y);
            }
        }
    }

    breakFall(tileBelow) {

        this.isFalling = false;
        this.delay = constants.KEY_DELAY;

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
            // Fall damage
            if (this.fallingDamage > 0) {

                let fallDamage = this.fallingDamage;

                const water = this.tile.type === 'water';
                const waterBelow = tileBelow.type === 'water';

                if (water || waterBelow) {
                    fallDamage *= 0;
                }

                const damage = Math.floor(fallDamage);

                this.heart.takeDamage(damage);
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

    startFallTowards() {
        if (!this.fallTowards.active) {
            this.fallTowards = {
                active: true,
                startPos: this.position,
                endPos: this.targetPosition,
                progress: 0,
                duration: 300, // milliseconds
                height: 0,
                fallDampening: 1000, // increase to reduce damage
                onComplete: () => {
                    this.isFalling = false;
                    this.targetPosition = null;
                    this.delay = constants.KEY_DELAY;
                    this.breakFall(this.tileBelow);
                }
            };
        } else {
            console.warn('Fall towards already active');
        }
    }

    updateFallTowards(delta) {
        if (!this.fallTowards.active) return;

        this.fallTowards.progress += delta / this.fallTowards.duration;

        if (this.fallTowards.progress >= 1) {
            this.position = this.fallTowards.endPos;
            this.fallTowards.active = false;
            if (this.fallTowards.onComplete) this.fallTowards.onComplete();
            return;
        }

        // Calculate fall position with downward acceleration
        const t = this.fallTowards.progress;
        const start = this.fallTowards.startPos;
        const end = this.fallTowards.endPos;

        // Horizontal linear interpolation
        const x = start.x + (end.x - start.x) * t;

        // Vertical movement with acceleration
        const fallCurve = t * t; // Quadratic acceleration
        const y = start.y + (end.y - start.y) * fallCurve;

        this.position = new Vector2(x, y);


        // Calculate falling damage
        const fallDistance = Math.abs(end.y - start.y);
        const fallDampening = this.fallTowards.fallDampening;
        const fallDamage = fallDistance / fallDampening; // Adjust the divisor to control damage sensitivity
        this.fallingDamage += fallDamage;


        // Emit falling particles
        if (t % 0.1 < 0.016) {
            events.emit("PARTICLE_EMIT", {
                x: this.position.x + 32,
                y: this.position.y + 64,
                color: 'rgba(128, 128, 128, 0.3)',
                size: 2,
                duration: 300,
                shape: 'circle',
                count: 1,
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: Math.random() * 2
                }
            });
        }
    }

    lookAround() {

        if (this.useAutoInput) return;

        const lookDirections = ['up', 'down', 'left', 'right'];
        const randomIndex = Math.floor(Math.random() * lookDirections.length);
        const randomDirection = lookDirections[randomIndex];

        this.facingDirection = randomDirection;

    }

    startIdleTimer() {
        if (!this.idleTimer.active) {
            this.idleTimer = {
                active: true,
                progress: 0,
                duration: 3000,
                onComplete: () => {
                    this.isIdling = false;
                    this.idleTimer.active = false;
                    this.lookAround();
                }
            };
        } else {
            console.warn('Idle timer already active');
        }
    }

    updateIdleTimer(delta) {
        if (!this.idleTimer.active) return;

        this.idleTimer.progress += delta;

        if (this.idleTimer.progress >= this.idleTimer.duration) {
            this.idleTimer.active = false;
            if (this.idleTimer.onComplete) this.idleTimer.onComplete();
            return;
        }
    }

    startMoveTowards() {
        if (!this.moveTowards.active) {
            this.moveTowards = {
                active: true,
                startPos: this.position,
                endPos: this.targetPosition,
                progress: 0,
                duration: this.speed,
                onComplete: () => {
                    this.isMoving = false;
                    this.targetPosition = null;
                    this.delay = 0;
                }
            };
        } else {
            console.warn('Move towards already active');
        }
    }

    updateMoveTowards(delta) {
        if (!this.moveTowards.active) return;

        let duration = this.moveTowards.duration;

        if (this.tile.type === 'water') {
            duration *= 3;
        }

        if (this.isFalling) {
            duration *= .3;
        }

        this.moveTowards.progress += delta / duration;

        if (this.moveTowards.progress >= 1) {

            this.position = this.moveTowards.endPos;

            this.moveTowards.active = false;

            if (this.moveTowards.onComplete) this.moveTowards.onComplete();

            return;
        }

        const t = this.moveTowards.progress;
        const start = this.moveTowards.startPos;
        const end = this.moveTowards.endPos;

        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;

        this.position = new Vector2(x, y);
    }

    startJumpArc() {
        if (!this.jumpArc.active) {
            this.jumpArc = {
                active: true,
                startPos: this.position,
                endPos: this.targetPosition,
                progress: 0,
                duration: 500,
                height: this.spriteHeight / 2,
                fallDampening: 10000000,
                onComplete: () => {
                    this.isJumping = false;
                    this.targetPosition = null;
                    this.isMoving = false;
                    this.delay = constants.KEY_DELAY;
                    this.breakFall(this.tileBelow);
                }
            };
        } else {
            console.warn('Jump arc already active');
        }
    }

    updateJumpArc(delta) {
        // check
        if (!this.jumpArc.active) return;

        this.jumpArc.progress += delta / this.jumpArc.duration;

        if (this.jumpArc.progress >= 1) {
            // Finish jump
            this.position = this.jumpArc.endPos;
            this.jumpArc.active = false;
            if (this.jumpArc.onComplete) this.jumpArc.onComplete();
            return;
        }

        // Calculate arc position
        const t = this.jumpArc.progress;
        const start = this.jumpArc.startPos;
        const end = this.jumpArc.endPos;

        // Horizontal linear interpolation
        const x = start.x + (end.x - start.x) * t;

        // Vertical quadratic curve for arc
        const arcHeight = this.jumpArc.height * (4 * t * (1 - t));
        const y = start.y + (end.y - start.y) * t - arcHeight;

        this.position = new Vector2(x, y);


        // Calculate falling damage
        const fallDistance = Math.abs(end.y - start.y);
        const fallDampening = this.jumpArc.fallDampening;
        const fallDamage = fallDistance / fallDampening; // Adjust the divisor to control damage sensitivity
        this.fallingDamage += fallDamage;


        // Emit particles during jump
        if (t % 0.1 < 0.016) { // Emit every ~100ms
            events.emit("PARTICLE_EMIT", {
                x: this.position.x + 32,
                y: this.position.y + 64,
                color: 'rgba(255, 255, 255, 0.3)',
                size: 2,
                duration: 300,
                shape: 'square',
                count: 1,
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: Math.random() * 1
                }
            });
        }
    }

    findSafeReturnPosition(world) {
        // TODO Use a graph search instead of brute force

        const pushDistance = 64;
        const pushX = this.position.x - (this.lastMovementDirection.x * pushDistance);
        const pushY = this.position.y - (this.lastMovementDirection.y * pushDistance);


        const tile = world.getTileAtCoordinates(pushX, pushY);
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
            const checkTile = world.getTileAtCoordinates(checkX, checkY);
            if (checkTile && (checkTile.type === 'air' || checkTile.type === 'water') && checkTile.passable) {
                return {
                    x: checkX,
                    y: checkY
                };
            }
        }

        return null;
    }

    calculateExtendedMooreNeighbors(world) {

        this.extendedMooreNeighbors = [];

        extendedMooreNeighbors.forEach(neighbor => {
            const neighborX = this.position.x + neighbor.x * this.world.tileSize;

            const neighborY = this.position.y + neighbor.y * this.world.tileSize;

            const neighborTile = world.getTileAtCoordinates(neighborX, neighborY);

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

    calculateMooreNeighbors(world) {

        this.mooreNeighbors = [];

        mooreNeighborOffsets.forEach(neighbor => {
            const neighborX = this.position.x + neighbor.x * this.world.tileSize;
            const neighborY = this.position.y + neighbor.y * this.world.tileSize;

            const neighborTile = world.getTileAtCoordinates(neighborX, neighborY);

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
        this.position = new Vector2(this.startingposition.x, this.startingposition.y);

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

        this.calculateMooreNeighbors(this.world);

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

        this.calculateMooreNeighbors(this.world);

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
        this.isJumping = false;
        this.isIdling = false;
        this.isCollecting = false;

        this.targetPosition = null;

        this.fallingDamage = 0;

        this.delay = constants.PLAYER_RESPAWN_TIME; // respawn timer

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

        this.calculateMooreNeighbors(this.world);

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
        const world = this.parent.parent.world;
        const tile = world.getTileAtCoordinates(x, y);
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
        this.delay = constants.BREAK_BLOCK_DELAY;

        events.emit('BLOCK_BREAK', target);

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
        const tileSize = this.parent.parent.world.tileSize;
        for (let dx = -this.maxDistance; dx <= this.maxDistance; dx += tileSize) {
            for (let dy = -this.maxDistance; dy <= this.maxDistance; dy += tileSize) {
                const targetX = this.initialX + dx;
                const targetY = this.initialY + dy;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance <= this.maxDistance &&
                    targetX >= 0 && targetX < this.world.width &&
                    targetY >= 0 && targetY < this.world.height) {
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
        const tileSize = this.parent.parent.world.tileSize;
        const attackRange = this.selectedAttack ? this.selectedAttack.range : 0;

        for (let dx = -attackRange; dx <= attackRange; dx += tileSize) {
            for (let dy = -attackRange; dy <= attackRange; dy += tileSize) {
                const targetX = this.position.x + dx;
                const targetY = this.position.y + dy;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance <= attackRange &&
                    targetX >= 0 && targetX < this.world.width &&
                    targetY >= 0 && targetY < this.world.height) {
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

    set position(position) {
        this.x = position.x;
        this.y = position.y;
    }

    get position() {
        return new Vector2(this.x, this.y);
    }

    get world() {
        return this.parent.parent.world;
    }

    get currentTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y);
    }

    get tileBelow() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y + this.world.tileSize);
    }

    get tileLeftFour() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x - this.world.tileSize * 4, this.position.y);
    }

    get tileRightFour() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x + this.world.tileSize * 4, this.position.y);
    }

    get tileUpOneLeftThree() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x - this.world.tileSize * 3, this.position.y - this.world.tileSize);
    }

    get tileUpOneRightThree() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x + this.world.tileSize * 3, this.position.y - this.world.tileSize);
    }

    get tileUpFour() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world.tileSize * 4);
    }

    get tileUpThree() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world.tileSize * 3);
    }

    get tileUpTwo() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world.tileSize * 2);
    }

    get tileUpOne() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world.tileSize);
    }

    get totalMass() {
        // plus encumberance
        // return this._mass + this?.inventory?.items?.length * this.scale ** 2;
        return this._mass;
    }
}