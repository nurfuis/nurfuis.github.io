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

const groundLevel = 100; // Define the ground level for units

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
        this.isFalling = false; // Add a flag to indicate if the unit is falling
        this.facingDirection = 'right'; // Add a property to track the facing direction
        this.image = new Image();
        this.image.src = 'images/guy.png';
        this.fallingDamage = 0; // Initialize falling damage to 0
        const oxygen = 800;
        this.oxygen = oxygen; // Initialize oxygen to 1000
        this.maxOxygen = oxygen; // Set the maximum oxygen to 1000
    }

    canMoveTo(x, y) {
        const map = this.parent.parent; // Access the map object through the parent chain
        const tile = map.getTileAtCoordinates(x, y); // Get the tile at the target position
        if (!tile) return false; // If the tile is not found, return false to prevent errors

        return tile; // Return true if the tile is passable, false otherwise

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
            this.facingDirection = 'left'; // Update facing direction to left
        }
        if (keysPressed.includes('d')) {
            dx += this.mapSize.tileSize; // Move right one tile
            this.facingDirection = 'right'; // Update facing direction to right
        }

        const targetX = Math.floor(this.x + dx);
        const targetY = Math.floor(this.y + dy);

        const target = this.canMoveTo(targetX, targetY);
        const canMove = target.passable; // Check if the target tile is passable
        // Ensure the target position is within the map boundaries and solid

        if (targetX >= 0 && targetY >= 0 && targetY < this.mapSize.height && canMove) {
            this.targetPosition = { x: targetX, y: targetY };
            this.isMoving = true;
        } else if (!canMove) {
            if (target.durability > 0) { // If the durability of the tile below the unit is greater than 0, decrease the durability of the tile below the unit by 10
                const randomNumber = Math.random(); // Generate a random number between 0 and 1
                target.durability -= randomNumber * 2; // Decrease the durability of the tile below the unit by a random number between 0 and 10
            } else if (target.durability <= 0) { // If the durability of the tile below the unit is less than or equal to 0, remove the tile below the unit from the map and move the unit down by 64 pixels until it reaches the ground level or a solid tile below it    
                target.type = 'air';
                target.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                target.solid = false;
                target.passable = true;
                target.durability = 0; // Set the durability of the tile below the unit to 0
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
                unit.lastX = unit.x; // Store the last position before moving
                unit.x = newX;
            }
            if (newY > 0) {
                unit.lastY = unit.y; // Store the last position before moving
                unit.y = newY;
            }

        }
        return distance;
    }

    step(delta, root) {
        this.tryEmitPosition(); // Emit the position of the unit to the server
        if (this.delay > 0) { // If there is a delay, decrement it by the delta time    
            this.delay -= delta; // Decrement the delay by the delta time
            return; // Return early to prevent moving while changing direction
        }
        const tile = root.map.getTileAtCoordinates(this.x, this.y); // Get the tile the unit is currently on
        if (!tile) return; // If the tile is not found, return early to prevent errors

        const tileBelow = root.map.getTileAtCoordinates(this.x, this.y + 64) || { solid: true }; // Check the tile below the unit

        if (tile.type === 'water') { // If the tile the unit is on is water, move the unit down by 64 pixels until it reaches the ground level or a solid tile below it 
            takeBreath(this, 1); // Deal damage to the unit based on the falling damage value
            if (this.oxygen <= 0) { // If the oxygen is less than or equal to 0, deal damage to the unit based on the falling damage value
                takeDamage(this, 0.35); // Deal damage to the unit based on the falling damage value
            }
        }

        if (tile.type === 'air') {
            if (this.oxygen < this.maxOxygen) { // If the oxygen is less than the maximum oxygen, increment it by 1 per second until it reaches the maximum oxygen value
                this.oxygen += 1; // Increment the oxygen by 1 per second until it reaches the maximum oxygen value
                updateOxygenBar(this.oxygen, this.maxOxygen); // Update the oxygen bar to reflect the current oxygen value
            }

            if (this.oxygen >= this.maxOxygen) { // If the oxygen is greater than or equal to the maximum oxygen, set it to the maximum oxygen value and stop incrementing it by 1 per second until it reaches the maximum oxygen value
                this.oxygen = this.maxOxygen; // Set the oxygen to the maximum oxygen value and stop incrementing it by 1 per second until it reaches the maximum oxygen value
            }

            if (this.health < this.maxHealth && this.oxygen >= this.maxOxygen / 2 && root.input.keysPressed == 0) { // If the health is less than the maximum health, increment it by 1 per second until it reaches the maximum health value
                heal(this, 0.02); // Increment the health by 1 per second until it reaches the maximum health value
            }
        }


        if (!tile.solid && !tileBelow.solid && !this.isMoving) { // If the tile below is not solid and the unit is not moving and no keys are pressed, move the unit down by 64 pixels
            if (!tile.climbable) { // If the tile below is not climbable, move the unit down by 64 pixels until it reaches the ground level or a solid tile below it
                this.isFalling = true; // Set the isFalling flag to true
            } else if (!root.input.keysPressed.includes('w') && tile.climbable) { // If the tile below is climbable, move the unit up by 64 pixels until it reaches the ground level or a solid tile below it
                if (this.hangtime > 0) { // If the hangtime is greater than 0, decrement it by the delta time
                    this.hangtime -= delta; // Decrement the hangtime by the delta time
                } else { // If the hangtime is less than or equal to 0, move the unit down by 64 pixels until it reaches the ground level or a solid tile below it
                    this.isFalling = true; // Set the isFalling flag to true
                }
            }
        }

        if (tileBelow.solid) { // If the tile below is solid or the unit has reached the ground level, stop falling and set the isFalling flag to false
            if (this.isFalling) { // If the unit is falling, move it down by 64 pixels until it reaches the ground level or a solid tile below it
                console.log("Unit has reached the ground level or a solid tile below it"); // Log a message to the console
                events.emit("CAMERA_SHAKE", { position: { x: this.x, y: this.y }, destinationPosition: { x: this.x, y: this.y - 32 } }); // Emit the camera shake event to the server
                if (tileBelow.durability > 0) { // If the durability of the tile below the unit is greater than 0, decrease the durability of the tile below the unit by 10
                    tileBelow.durability -= 35;
                    if (tileBelow.type === 'earth') { // If the tile below the unit is earth, deal damage to the unit based on the falling damage value
                        this.fallingDamage = 0; 
                    }
                    if (this.fallingDamage > 3) {
                        takeDamage(this, this.fallingDamage); // Deal damage to the unit based on the falling damage value
                    };
                    this.fallingDamage = 0; // Reset the falling damage value to 0 after dealing damage to the unit
                
                } else if (tileBelow.durability <= 0) { // If the durability of the tile below the unit is less than or equal to 0, remove the tile below the unit from the map and move the unit down by 64 pixels until it reaches the ground level or a solid tile below it    
                    tileBelow.type = 'air';
                    tileBelow.color = getComputedStyle(document.querySelector('.light-grey')).backgroundColor;
                    tileBelow.solid = false;
                    tileBelow.passable = true;
                    tileBelow.durability = 0; // Set the durability of the tile below the unit to 0
                    this.fallingDamage = 0;
                }
                this.isFalling = false; // Set the isFalling flag to false


            }
            this.isFalling = false; // Set the isFalling flag to false
        }

        if (this.isFalling) { // If the unit is falling, move it down by 64 pixels per second until it reaches the ground level or a solid tile below it
            if (root.input.keysPressed.includes('w')) {
                if (tile.climbable) { // If the tile below is climbable, move the unit up by 64 pixels until it reaches the ground level or a solid tile below it
                    this.hangtime = 350; // Reset the hangtime to 0 when the unit reaches the ground level or a solid tile below it
                    this.isFalling = false; // Set the isFalling flag to false
                    this.fallingDamage = 0; // Reset the falling damage value to 0 after dealing damage to the unit
                }
            }
            if (tile.climbable) { // If the tile below is climbable, move the unit up by 64 pixels until it reaches the ground level or a solid tile below it
                if (root.input.keysPressed.includes('s')) {
                    this.y += 8; // Move the unit up by 64 pixels per second until it reaches the ground level or a solid tile below it
                    return; // Return early to prevent other actions while falling
                }
                this.y += 1; // Move the unit up by 64 pixels per second until it reaches the ground level or a solid tile below it
                return; // Return early to prevent other actions while falling
            }

            this.y += 8;
            this.fallingDamage += 0.25; // Increase the falling damage by 1 per second until the unit reaches the ground level or a solid tile below it
            return; // Return early to prevent other actions while falling
        }


        if (root.input.keysPressed.length > 0 && !this.isMoving) {
            if (this.facingDirection === 'left' && root.input.keysPressed.includes('d')) { // If the unit is facing left and the right key is pressed, update the facing direction to right
                this.facingDirection = 'right'; // Update facing direction to right
                this.delay = 250;
                return; // Return early to prevent moving while changing direction
            } else if (this.facingDirection === 'right' && root.input.keysPressed.includes('a')) { // If the unit is facing right and the left key is pressed, update the facing direction to left   
                this.facingDirection = 'left'; // Update facing direction to left
                this.delay = 250;
                return; // Return early to prevent moving while changing direction
            }
            const keysPressed = root.input.keysPressed;
            this.move(keysPressed); // Move the unit based on input keys
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
        let offsetX = -32;
        let offsetY = -18; // Adjust these values to center the image on the unit's position

        const scaleFactor = 2; // Adjust this value to scale the image

        ctx.save(); // Save the current state of the canvas

        if (this.facingDirection === 'left') {
            ctx.scale(-1, 1); // Flip the image horizontally
            ctx.drawImage(this.image, -this.x - offsetX - this.size * scaleFactor, this.y + offsetY, this.size * scaleFactor, this.size * scaleFactor);
        } else {
            ctx.drawImage(this.image, this.x + offsetX, this.y + offsetY, this.size * scaleFactor, this.size * scaleFactor);
        }

        ctx.restore(); // Restore the canvas state
    }
}