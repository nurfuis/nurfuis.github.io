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

const groundLevel = 100; 

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
        this.maxDistance = 128; 
        this.initialX = x; 
        this.initialY = y; 
        this.attacks = this.getRandomAttacks(2); 
        this.selectedAttack = null;
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
        this.isMoving = false; 
        this.isFalling = false; 
        this.facingDirection = 'right'; 
        this.image = new Image();
        this.image.src = 'images/guy.png';
        this.fallingDamage = 0; 
        const oxygen = 800;
        this.oxygen = oxygen; 
        this.maxOxygen = oxygen; 
        this.isAlive = true; 
        this.inventory = new Inventory(); 
        this.isSinking = false; 

        events.on('SAP_COLLECTED', this, (sap) => { 
            heal(this, 10); 
        });
        events.on('AIR_COLLECTED', this, (airBubble) => { 
            this.oxygen += 100; 
            if (this.oxygen > this
                .maxOxygen
            ) { 
                this.oxygen = this
                    .maxOxygen; 
            }
            updateOxygenBar(this.oxygen, this
                .maxOxygen); 

        });
        events.on('ITEM_COLLECTED', this, (item) => { 
            this.inventory.addItem(item); 

        });
    }
    ready() {
        this.startingposition = new Vector2(this.x, this.y); 
    }
    die() {
        this.isAlive = false; 
        this.isFalling = false; 
        this.isMoving = false; 
        this.targetPosition = null; 
        this.health = 0; 
        this.oxygen = 0; 
        this.fallingDamage = 0; 
        this.x = this.startingposition.x; 
        this.y = this.startingposition.y; 
        updateOxygenBar(this.oxygen, this.maxOxygen); 
        this.delay = 5000;

    }
    spawn() {
        heal(this, this.maxHealth); 
        this.oxygen = this.maxOxygen; 
        updateOxygenBar(this.oxygen, this.maxOxygen); 
        this.isAlive =
            true; 
        events.emit("PLAYER_POSITION", {
            x: this.x,
            y: this.y,
            cause: "spawn"
        }); 
    }

    canMoveTo(x, y) {
        const map = this.parent.parent; 
        const tile = map.getTileAtCoordinates(x, y); 
        if (!tile) return false; 

        return tile; 

    }

    getRandomAttacks(count) {
        const availableAttacks = [...attackTypes]; 
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
            this.attackReady = false; 

            this.attackPending = false; 
            root.attackPending = false;
            attackButton.classList.remove('active'); 
            toggleActionBarButtons(this.movePending, this.attackPending);
            attackMenu.style.display = 'none'; 

            this.selectedAttack = null; 
            this.remainingAttacks--;
            return;
        }
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
        });
    }
    move(keysPressed) {
        if (this.isMoving) return; 
        let dx = 0;
        let dy = 0;

        if (keysPressed.includes('w')) {
            dy -= this.mapSize.tileSize;
        }
        if (keysPressed.includes('s')) {
            dy += this.mapSize.tileSize;
        }
        if (keysPressed.includes('a')) {
            dx -= this.mapSize.tileSize;
            this.facingDirection = 'left';
        }
        if (keysPressed.includes('d')) {
            dx += this.mapSize.tileSize;
            this.facingDirection = 'right';
        }

        const targetX = Math.floor(this.x + dx);
        const targetY = Math.floor(this.y + dy);

        const target = this.canMoveTo(targetX, targetY);
        const canMove = target.passable;

        if (targetX >= 0 && targetY >= 0 && targetY < this.mapSize.height && canMove) {
            this.targetPosition = {
                x: targetX,
                y: targetY
            };
            this.isMoving = true;
        } else if (!canMove) {
            if (target.durability > 0 && target.breakable) {
                const randomNumber = Math.random();
                target.durability -= randomNumber * 2;
            } else if (target.durability <= 0) {
                target.type = 'air';
                target.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                target.solid = false;
                target.passable = true;
                target.durability = 0;
            }
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
                unit.lastX = unit.x; 
                unit.x = newX;
            }
            if (newY > 0) {
                unit.lastY = unit.y; 
                unit.y = newY;
            }

        }
        return distance;
    }

    step(delta, root) {
        if (this.delay > 0) { 
            this.delay -= delta; 
            return; 
        }

        if (!this.isAlive) {
            this.spawn(); 
        }

        this.tryEmitPosition(); 

        const tile = root.map.getTileAtCoordinates(this.x, this.y); 

        if (!tile) return; 

        const tileBelow = root.map.getTileAtCoordinates(this.x, this.y + 64) || {
            solid: true
        }; 

        if (tile.type ===
            'water'
        ) { 
            takeBreath(this, 1); 
            if (this.oxygen <=
                0
            ) { 
                takeDamage(this, 0.35); 
            }
        }

        if (tile.type === 'air') {
            if (this.oxygen < this
                .maxOxygen
            ) { 
                this.oxygen += 1; 
                updateOxygenBar(this.oxygen, this
                    .maxOxygen); 
            }

            if (this.oxygen >= this
                .maxOxygen
            ) { 
                this.oxygen = this
                    .maxOxygen; 
            }

            if (this.health < this.maxHealth && this.oxygen >= this.maxOxygen / 2 && root.input.keysPressed ==
                0
            ) { 
                heal(this, 0.02); 
            }
        }


        if (!tile.solid && !tileBelow.solid && !this
            .isMoving
        ) { 
            if (!tile
                .climbable
            ) { 
                this.isFalling = true; 
            } else if (!root.input.keysPressed.includes('w') && tile
                .climbable
            ) { 
                if (this.hangtime > 0) { 
                    this.hangtime -= delta; 
                } else { 
                    this.isSinking = true; 
                }
            }
        }

        if (tileBelow
            .solid
        ) { 
            if (this
                .isFalling
            ) { 
                console.log(
                    "Unit has reached the ground level or a solid tile below it"); 
                events.emit("CAMERA_SHAKE", {
                    position: {
                        x: this.x,
                        y: this.y
                    },
                    destinationPosition: {
                        x: this.x,
                        y: this.y - 32
                    }
                }); 

                if (tileBelow.durability >
                    0
                ) { 

                    if (tileBelow.breakable) {
                        tileBelow.durability -= 35;
                    }

                    if (this.fallingDamage > 3) {
                        takeDamage(this, this
                            .fallingDamage); 
                    };
                    this.fallingDamage = 0; 

                } else if (tileBelow.durability <=
                    0
                ) { 
                    tileBelow.type = 'air';
                    tileBelow.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                    tileBelow.solid = false;
                    tileBelow.passable = true;
                    tileBelow.durability = 0; 
                    this.fallingDamage = 0;
                }
                this.isFalling = false; 


            }
            this.isFalling = false; 
        }

        if (this
            .isSinking) {
            if (root.input.keysPressed.includes('w')) {
                if (tile
                    .climbable
                ) {
                    this.hangtime =
                        350;
                }
            }
            if (tile
                .climbable
            ) { 
                if (root.input.keysPressed.includes('s')) {
                    this.y +=
                        8; 
                    return; 
                }
                this.y +=
                    1; 
                return; 
            }
        }


        if (this
            .isFalling
        ) { 
            this.y += 8;
            this.fallingDamage +=
                0.25; 
            return; 
        }


        if (root.input.keysPressed.length > 0 && !this.isMoving) {
            if (this.facingDirection === 'left' && root.input.keysPressed.includes(
                'd'
            )) { 
                this.facingDirection = 'right'; 
                this.delay = 200;
                return; 
            } else if (this.facingDirection === 'right' && root.input.keysPressed.includes(
                'a'
            )) { 
                this.facingDirection = 'left'; 
                this.delay = 200;
                return; 
            }
            const keysPressed = root.input.keysPressed;
            this.move(keysPressed); 
        }

        if (this.isMoving && this.targetPosition) {
            const distance = this.moveTowards(this, this.targetPosition, this.speed);
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
        let offsetX = -32;
        let offsetY = -18; 

        const scaleFactor = 2; 

        ctx.save(); 

        if (this.facingDirection === 'left') {
            ctx.scale(-1, 1); 
            ctx.drawImage(this.image, -this.x - offsetX - this.size * scaleFactor, this.y + offsetY, this.size *
                scaleFactor, this.size * scaleFactor);
        } else {
            ctx.drawImage(this.image, this.x + offsetX, this.y + offsetY, this.size * scaleFactor, this.size *
                scaleFactor);
        }

        ctx.restore(); 
    }
}