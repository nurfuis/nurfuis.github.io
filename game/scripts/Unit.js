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

    }

    canMoveTo(x, y) {

        return true; // Return true if the tile is walkable, false otherwise
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
            this.facingDirection = 'left'; // Update facing direction to left
        }
        if (keysPressed.includes('d')) {
            dx += this.mapSize.tileSize; // Move right one tile
            this.facingDirection = 'right'; // Update facing direction to right
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
        if (this.delay > 0) { // If there is a delay, decrement it by the delta time    
            this.delay -= delta; // Decrement the delay by the delta time
            return; // Return early to prevent moving while changing direction
        }
        const tile = root.map.getTileAtCoordinates(this.x, this.y); // Get the tile the unit is currently on
        const tileBelow = root.map.getTileAtCoordinates(this.x, this.y + 64) || { walkable: true }; // Check the tile below the unit

        if (!tile.walkable && !tileBelow.walkable && !this.isMoving) { // If the tile below is not walkable and the unit is not moving and no keys are pressed, move the unit down by 64 pixels
            this.isFalling = true; // Set the isFalling flag to true
        }

        if (tileBelow.walkable || tile.walkable) { // If the tile below is walkable or the unit has reached the ground level, stop falling and set the isFalling flag to false
            this.isFalling = false; // Set the isFalling flag to false
        }

        if (this.isFalling) { // If the unit is falling, move it down by 64 pixels per second until it reaches the ground level or a walkable tile below it
            if (root.input.keysPressed.includes('w')) { // If the up key is pressed, stop falling and move the unit up by 64 pixels
                return; // Return early to prevent moving while jumping
            } 
            this.y += 8;
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