

class Flying extends GameObject {
    constructor(unit) {
        super();
        this.scale = 1;
        this.radius = 16;

        this.debug = false;

        this.unit = unit;
        this.powerSupply = new Battery(unit);
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

        this.spriteWidth = 144;
        this.spriteHeight = 128;

        this.image = new Image();
        this.image.src = 'images/flying_dragon-gold.png';

        this.frameX = 0;
        this.frameY = 0;

        this.frameTimer = 0;

        this.frameInterval = 100;

        this.position = new Vector2(0, 0);
        this.playerPosition = new Vector2(0, 0);
        this.facingDirection = 'down';

        // Update sprite sheet settings for 4 directions
        this.spriteWidth = 144;
        this.spriteHeight = 128;
        this.frameX = 0;  // Column in sprite sheet
        this.frameY = 0;  // Row in sprite sheet (0=down, 1=up, 2=right, 3=left)

        // Add patrol and following properties
        this.followDistance = 512; // Pixels to maintain from player
        this.followHeight = 96; // New property for hovering height
        this.patrolRadius = 512; // Radius of patrol circle
        this.patrolSpeed = 0.001; // Speed of circular motion
        this.patrolAngle = 0;
        this.patrolHeight = 128; // Height above player during patrol
        this.lastPlayerMoveTime = Date.now();
        this.idleThreshold = 2500; // Time before starting patrol
        this.isPatrolling = false;

        // Add smooth movement properties
        this.targetPosition = new Vector2(0, 0);
        this.moveSpeed = 0.1;

        // Add patrol direction property
        this.patrolClockwise = true;
        this.isPatrolling = false;

        // Add search pattern properties
        this.patrolLoopCount = 0;
        this.isSearching = false;
        this.searchDirection = 1; // 1 for right, -1 for left
        this.searchProgress = 0;
        this.searchWidth = 2000; // Increased width to cover more area
        this.searchSpeed = 0.0004; // Slower movement
        this.searchSegments = {
            forward: 6, // More forward segments
            back: 3    // More back segments
        };
        this.searchRowHeight = 64; // Increased height between rows
        this.searchMaxHeight = 1028; // Maximum height for search pattern
        this.searchStartHeight = this.unit.position.y + this.spriteHeight; // Starting height above player
        this.lastSearchDirection = 1; // Track last search direction
        this.searchOffset = new Vector2(0, 0); // Store random offset

        // Add edge hover properties
        this.isEdgeHovering = false;
        this.edgeHoverSide = 'right'; // or 'left'
        this.edgeHoverDistance = 2000; // Distance from player when at edge
        this.edgeHoverHeight = 256; // Height above player while hovering
        this.edgeHoverDuration = 10000; // Time to hover before returning to patrol
        this.edgeHoverStartTime = 0;

        // Listen for player movement
        events.on('PLAYER_POSITION', this, (data) => {
            if (data.x !== this.playerPosition.x || data.y !== this.playerPosition.y) {
                this.lastPlayerMoveTime = Date.now();
                this.isPatrolling = false;
            }
            this.playerPosition.x = data.x;
            this.playerPosition.y = data.y;
            this.updateFacingDirection();
        });
    }

    startSearch() {
        this.isSearching = true;
        this.searchProgress = 0;
        this.currentSearchRow = 0;

        // Alternate initial direction
        this.searchDirection = -this.lastSearchDirection;
        this.lastSearchDirection = this.searchDirection;

        // Random offset from player position
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100; // Random distance up to 100 pixels
        this.searchOffset.x = Math.cos(angle) * distance;
        this.searchOffset.y = Math.sin(angle) * distance;
    }

    updateFacingDirection() {
        let dx, dy;

        if (this.isEdgeHovering) {
            // Always face player during edge hover
            this.facingDirection = this.edgeHoverSide === 'right' ? 'left' : 'right';
        } else if (this.isSearching) {
            // Use search direction for facing
            this.facingDirection = this.searchDirection > 0 ? 'right' : 'left';
        } else if (this.isPatrolling) {
            // For patrol, use rate of change of position
            dx = this.targetPosition.x - this.position.x;
            dy = this.targetPosition.y - this.position.y;

            // Use sin/cos of patrol angle with 90-degree offset (PI/2)
            const sinAngle = Math.sin(this.patrolAngle + Math.PI / 2);
            const cosAngle = Math.cos(this.patrolAngle + Math.PI / 2);

            // Determine direction based on position in the circle
            if (Math.abs(sinAngle) > Math.abs(cosAngle)) {
                // Vertical movement is dominant
                this.facingDirection = sinAngle > 0 ? 'down' : 'up';
            } else {
                // Horizontal movement is dominant
                this.facingDirection = cosAngle > 0 ? 'right' : 'left';
            }
        } else {
            // Regular following behavior
            dx = this.playerPosition.x - this.position.x;
            dy = this.playerPosition.y - this.position.y;

            // Determine primary direction based on larger delta
            if (Math.abs(dx) > Math.abs(dy)) {
                this.facingDirection = dx > 0 ? 'right' : 'left';
            } else {
                this.facingDirection = dy > 0 ? 'down' : 'up';
            }
        }

        // Update frameY based on direction
        switch (this.facingDirection) {
            case 'down':
                this.frameY = 2;
                break;
            case 'up':
                this.frameY = 0;
                break;
            case 'right':
                this.frameY = 1;
                break;
            case 'left':
                this.frameY = 3;
                break;
        }
    }

    updateMovement(delta) {
        const now = Date.now();
        const idleTime = now - this.lastPlayerMoveTime;

        // if this.unit.isJumping cause the dragon to swoosh down in an arc and shoot forward some distance
        if (this.unit.isJumping) {
            const dX = this.unit.position.x - this.position.x;
            const dY = this.unit.position.y - this.position.y;
            const distance = Math.sqrt(dX * dX + dY * dY);

            // Only swoop if within reasonable range
            const maxSwoopDistance = 400; // Maximum distance to initiate swoop
            if (distance <= maxSwoopDistance) {
                const angle = Math.atan2(dY, dX);
                const swoopSpeed = 20;

                // Limit movement based on distance
                const speedMultiplier = Math.min(1, distance / maxSwoopDistance);
                this._velocity.x = Math.cos(angle) * swoopSpeed * speedMultiplier;
                this._velocity.y = Math.sin(angle) * swoopSpeed * speedMultiplier;

                // Apply movement with distance decay
                const movementDecay = 0.95; // Reduce movement over time
                this._velocity.x *= movementDecay;
                this._velocity.y *= movementDecay;

                this.position.x += this._velocity.x;
                this.position.y += this._velocity.y;
            }
        }

        if (idleTime > this.idleThreshold) {
            if (!this.isPatrolling && !this.isSearching && !this.isEdgeHovering) {
                this.isPatrolling = true;
                this.patrolAngle = 0;
            }

            if (this.isEdgeHovering) {
                // Check if edge hover duration is complete
                if (now - this.edgeHoverStartTime > this.edgeHoverDuration) {
                    this.isEdgeHovering = false;
                    this.isPatrolling = true;
                    this.patrolLoopCount = 0;
                    return;
                }

                // Calculate edge hover position
                const xOffset = this.edgeHoverSide === 'right' ?
                    this.edgeHoverDistance : -this.edgeHoverDistance;

                this.targetPosition.x = this.playerPosition.x + xOffset;
                this.targetPosition.y = this.playerPosition.y - this.edgeHoverHeight;

            } else if (this.isPatrolling) {
                this.patrolAngle += this.patrolSpeed * delta;

                // Check for patrol loop completion
                if (this.patrolAngle >= Math.PI * 2) {
                    this.patrolLoopCount++;
                    this.patrolAngle = 0;

                    // Switch to search pattern after 3 loops
                    if (this.patrolLoopCount >= 1) {
                        this.isPatrolling = false;
                        this.startSearch(); // Use new search initialization
                    }
                }

                // Calculate patrol position
                this.targetPosition.x = this.playerPosition.x + Math.cos(this.patrolAngle) * this.patrolRadius;
                this.targetPosition.y = this.playerPosition.y + Math.sin(this.patrolAngle) * this.patrolRadius - this.patrolHeight;
            } else if (this.isSearching) {
                // Update search pattern
                this.searchProgress += this.searchSpeed * delta * this.searchDirection;

                // Calculate search position with expanded range
                const rowOffset = this.currentSearchRow * this.searchRowHeight;
                const maxHeight = Math.min(
                    this.searchMaxHeight,
                    this.world?.height || this.searchMaxHeight
                );

                // Center search pattern on player plus offset
                this.targetPosition.x = this.playerPosition.x + this.searchOffset.x +
                    (this.searchProgress * this.searchWidth - this.searchWidth / 2);

                // Limit vertical position to map bounds
                this.targetPosition.y = Math.max(
                    64, // Minimum height from ground
                    Math.min(
                        maxHeight,
                        this.playerPosition.y + this.searchOffset.y -
                        this.searchStartHeight - rowOffset
                    )
                );

                // Check for direction change
                if (Math.abs(this.searchProgress) >= 1) {
                    // Complete current row
                    this.searchProgress = this.searchDirection > 0 ? 1 : -1;
                    this.searchDirection *= -1;
                    this.currentSearchRow++;

                    // Reset pattern when reaching max height or completing segments
                    const totalRows = this.searchSegments.forward + this.searchSegments.back;
                    if (this.currentSearchRow >= totalRows) {
                        this.isSearching = false;
                        this.isEdgeHovering = true;
                        // Use final search direction to determine hover side
                        this.edgeHoverSide = this.searchDirection > 0 ? 'left' : 'right';
                        this.edgeHoverStartTime = now;
                    }
                }
            }
            this.updateFacingDirection();
        } else {
            // Reset pattern states when player moves
            this.isSearching = false;
            this.patrolLoopCount = 0;
            // Follow player with height offset
            const angle = Math.atan2(
                this.playerPosition.y - this.position.y,
                this.playerPosition.x - this.position.x
            );

            this.targetPosition.x = this.playerPosition.x - Math.cos(angle) * this.followDistance;
            this.targetPosition.y = this.playerPosition.y - Math.sin(angle) * this.followDistance - this.followHeight;
        }

        // Smooth movement towards target
        this.position.x += (this.targetPosition.x - this.position.x) * this.moveSpeed;
        this.position.y += (this.targetPosition.y - this.position.y) * this.moveSpeed;

        // Update game object position
        this.x = this.position.x;
        this.y = this.position.y;
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth,
            this.spriteHeight,
            this.position.x - this.radius,
            this.position.y - this.radius,
            this.spriteWidth * this.scale,
            this.spriteHeight * this.scale
        );

        // Debug visualization
        if (this.debug) {
            ctx.save();

            // Draw patrol/follow circle
            ctx.strokeStyle = this.isPatrolling ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            if (this.isPatrolling) {
                ctx.arc(
                    this.playerPosition.x,
                    this.playerPosition.y - this.patrolHeight,
                    this.patrolRadius,
                    0,
                    Math.PI * 2
                );
            } else {
                ctx.arc(
                    this.playerPosition.x,
                    this.playerPosition.y,
                    this.followDistance,
                    0,
                    Math.PI * 2
                );
            }
            ctx.stroke();

            // Draw facing direction info
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                this.position.x - 60,
                this.position.y - 60,
                120,
                50
            );

            ctx.font = '12px Consolas';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.fillText(
                `Facing: ${this.facingDirection}`,
                this.position.x,
                this.position.y - 45
            );
            ctx.fillText(
                `Frame Y: ${this.frameY}`,
                this.position.x,
                this.position.y - 30
            );

            // Draw direction arrow
            const arrowLength = 40;
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            switch (this.facingDirection) {
                case 'up':
                    ctx.lineTo(this.position.x, this.position.y - arrowLength);
                    break;
                case 'down':
                    ctx.lineTo(this.position.x, this.position.y + arrowLength);
                    break;
                case 'left':
                    ctx.lineTo(this.position.x - arrowLength, this.position.y);
                    break;
                case 'right':
                    ctx.lineTo(this.position.x + arrowLength, this.position.y);
                    break;
            }
            ctx.stroke();

            ctx.restore();
        }
    }

    step(delta, root) {
        // this.powerSupply.update();

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < 2) this.frameX++;
            else this.frameX = 0;
        }
        else {
            this.frameTimer += delta;
        }

        // Update position if needed
        this.position.x = this.x;
        this.position.y = this.y;

        // Update movement
        this.updateMovement(delta);

        // Update power systems
        this.powerSupply.update();
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
}



