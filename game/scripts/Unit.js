class Unit extends GameObject {
    constructor(x, y, size, colorClass, speed, name, world, level = 1, experience = 0, health = 100) {
        super();

        this.debug = false;


        this.useAutoInput = false;

        document.addEventListener('keydown', (event) => {
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

        this.facingDirection = 'RIGHT';

        this.maxDistance = world.tileSize * 2;

        this.targetPosition = null;

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
        this.physics = {
            velocity: new Vector2(0, 0),
            acceleration: new Vector2(0, 0),
            maxSpeed: 8,
            jumpForce: -8, // Initial upward force
            jumpCooldown: 500, // Time in ms between jumps
            currentCooldown: 0, // Current cooldown timer
            maxJumpHeight: 128, // Maximum height in pixels
            initialJumpY: 0, // Track jump start position
            gravity: 0.3,
            friction: 0.85,
            airResistance: 0.95,
            airControl: 0.5
        };
        this.movementState = {
            isGrounded: false,
            isInWater: false,
            headInWater: false,
            canJump: true,
            isJumping: false
        };

        // this.colliders = {
        //     head: {
        //         offset: new Vector2(16, 0),
        //         width: 32,
        //         height: 32
        //     },
        //     body: {
        //         offset: new Vector2(16, 32),
        //         width: 32,
        //         height: 64
        //     }
        // };
        const unitDebugger = new UnitDebugger(this);
        this.unitDebugger = unitDebugger;
        this.addChild(unitDebugger);


        this.noClip = false;

        this.powerSupply = new Battery(this);
        this.powerSupply.storedEnergy = 1200000;
        this.powerSupply.storedCapacity = 1200000;
        this.powerSupply.dischargeRate = 5; // Amps

        this.motor = new Motor();
        this.motor.KV = 1;

        this.transmission = new Transmission();
        this.transmission.gear = 1;

        this.jumpCapacitor = new Capacitor(this.powerSupply);
        this.jumpCapacitor.capacitance = 300;  // Adjust for desired jump duration
        this.jumpCapacitor.maxVoltage = 12;
        this.jumpCapacitor.chargeRate = 20;     // Charge rate in W/s
        this.jumpCapacitor.dischargeRate = 300; // Discharge rate in W/s

        this._maxTorque = this.motor.KV;
        this._maxSpeed = this.powerSupply.dischargeRate;
        this._mass = 220;
        this._gravity = 0.3;
        this._buoyancy = 0.3;
        this._drag = 0.95;
        this._currentThrust = new Vector2(0, 0);
        this._acceleration = new Vector2(0, 0);
        this._velocity = new Vector2(0, 0);

        this.jumpProperties = {
            jumpPower: 0.5,      // Base jump force
            maxJumps: 1,         // Number of jumps allowed (2 for double jump)
            jumpsLeft: 1,        // Jumps remaining
            jumpCooldown: 1500,   // Time between jumps in ms
            jumpTimer: 0,        // Current cooldown
            isJumping: false,
            jumpDirection: null,
            maxJumpHeight: 64,   // Maximum height of jump
        };

        this.componentPanel = new ComponentPanel(this);
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

    }

    step(delta, root) {
        // UPDATE PARTICLE COOLDOWNS
        Object.values(this.particleCooldowns).forEach(cooldown => {
            cooldown.current = Math.max(0, cooldown.current - delta);
        });

        // OBSERVE ENVIRONMENT

        const body = this.currentTile;

        if (body !== this.tile) {
            this.previousTile = this.tile;

            this.tile = body;

            this.calculateMooreNeighbors(this.world);
        }

        // CHECK VITALS
        this.handleOrganFunctions(delta);

        // CHECK COMPONENTS
        this.handleComponents(delta);


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
        // input/action delay
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
        if (this.facingDirection != 'RIGHT' && direction === 'RIGHT') {

            this.facingDirection = 'RIGHT';

            if (!this.isJumping) {

                this.delay = constants.KEY_DELAY;
            }
            return;
        } else if (this.facingDirection != 'LEFT' && direction === 'LEFT') {

            this.facingDirection = 'LEFT';

            if (!this.isJumping) {
                this.delay = constants.KEY_DELAY;
            }
            return;
        }

        if (this.jumpProperties.jumpTimer > 0) {
            this.jumpProperties.jumpTimer -= delta;
        }

        // check footing
        if (this.feetTile.solid) {
            this.jumpProperties.jumpsLeft = this.jumpProperties.maxJumps;
            this.jumpProperties.isJumping = false;
        }

        // TRY MOVE
        if (direction) {
            switch (direction) {
                case 'UP':
                case 'UP_LEFT':
                case 'UP_RIGHT':
                // Check if we're still jumping
                // if (this.jumpCapacitor.storedEnergy <= 0) {
                //     // End jump if capacitor is empty
                //     this.isJumping = false;
                //     this._velocity.y *= 0.5; // Smooth transition
                // }
                default:
                    this.calculateThrust(direction);
            }
        }

        // UPDATE PHYSICS
        this.updatePhysics(delta);

        // TRANSMIT SIGNALS
        this.tryEmitPosition();

    }
    handleComponents(delta) {
        this.powerSupply.update(delta);
        this.jumpCapacitor.update(delta);

        this.componentPanel.update(delta);
    }
    updatePhysics(delta) {
        // gravity
        const gravity = roundTo(this._gravity, 8); // Round gravity

        // friction
        const drag = roundTo(this._drag, 8); // Round drag

        // mass
        const mass = roundTo(this._mass, 8); // Round mass

        let thrustX = roundTo(this._currentThrust.x, 8); // Round initial accelerationX
        let thrustY = roundTo(this._currentThrust.y, 8); // Round initial accelerationY

        let accelerationX = this._acceleration.x;
        let accelerationY = this._acceleration.y;


        // accelerate x
        accelerationX += thrustX;

        accelerationX *= gravity;
        accelerationX *= drag;

        if (this.jumpProperties.isJumping) {
            accelerationX *= 0.5; // Reduced air control while jumping
        }

        accelerationX = roundTo(accelerationX, 8); // Round final accelerationX


        // accelerate y
        accelerationY += thrustY;

        accelerationY *= gravity;
        accelerationY *= drag;

        accelerationY = roundTo(accelerationY, 8); // Round final accelerationY


        // set acceleration
        this._acceleration = new Vector2(accelerationX, accelerationY);

        // calculate force
        const forceX = roundTo(accelerationX * mass, 8); // Round forceX
        const forceY = roundTo(accelerationY * mass, 8); // Round forceY

        let velocityX = this._velocity.x + forceX;

        //     if (this._isGrounded) {
        //         this._velocity.x *= this._friction;
        //     } else {
        //         this._velocity.x *= this._drag;
        //     }
        velocityX *= drag;

        // Clamp velocity

        const maxJumpSpeed = constants.JUMP_SPEED;

        velocityX = Math.min(Math.max(velocityX, -constants.JUMP_SPEED), constants.JUMP_SPEED);


        let velocityY = this._velocity.y + forceY;
        // Apply gravity and water physics
        velocityY += this._mass * this._gravity;

        // if (!this._isInWater) {
        //     velocityY += this._gravity;
        // } else {
        //     velocityY += this._gravity * this._buoyancy;
        //     velocityY *= this._drag;
        // }


        // clamp velocity
        velocityY = Math.min(Math.max(velocityY, -constants.JUMP_SPEED), constants.JUMP_SPEED);


        if (approximatelyEqual(velocityX, 0, 1)) {
            velocityX = 0;
        }
        if (approximatelyEqual(velocityY, 0, 1)) {
            velocityY = 0;
        }

        // set velocity
        this._velocity = new Vector2(velocityX, velocityY);


        // todo move with collision, fow now just go though with it and set position

        let positionX = this.position.x + velocityX;
        let positionY = this.position.y + velocityY;

        // clamp position to world boundaries though
        positionX = clamp(positionX, 0, this.world.width - this.spriteWidth);
        positionY = clamp(positionY, 0, this.world.height - this.spriteHeight / 2);

        // set position
        this.position = new Vector2(positionX, positionY);

    }

    calculateThrust(direction) {
        // Calculate desired torque based on direction and gear ratio
        function getTorque() {
            // Get power delivery from battery through motor
            const powerRequest = this.motor.calculatePowerDraw(
                this._maxTorque,
                this.powerSupply.voltage
            );

            const powerDelivered = this.powerSupply.requestPower(
                powerRequest.power,
                this.powerSupply.voltage
            );

            // Calculate actual torque with transmission
            const gearRatio = this.transmission.gearBox[this.transmission.gear];
            const baseMotorTorque = (powerDelivered.power * this.motor.efficiency);

            // Apply gear ratios - higher gear = less torque but more speed
            const finalTorque = baseMotorTorque * (gearRatio.motor / gearRatio.drive);

            return roundTo(finalTorque, 8);
        }

        let thrustX = 0; // Round initial accelerationX
        let thrustY = 0; // Round initial accelerationY

        let torque = 0;
        const maxTorque = roundTo(this._maxTorque, 8);

        // If has direction get torque / draw power
        if (direction !== 'CENTER') {
            torque = getTorque.call(this);
        }

        // Only request power if we're not in CENTER direction

        if (direction.includes('UP') && this.jumpProperties.jumpsLeft > 0 && this.jumpProperties.jumpTimer <= 0) {

            const jumpPowerNeeded = 200; // Base power needed for jump
            const capacitorPower = this.jumpCapacitor.discharge(jumpPowerNeeded);

            if (capacitorPower >= 0) {

                this.jumpProperties.isJumping = true;
                this.jumpProperties.jumpsLeft--;
                this.jumpProperties.jumpTimer = this.jumpProperties.jumpCooldown;
                this.jumpProperties.jumpDirection = direction;

                const jumpMultiplier = capacitorPower / jumpPowerNeeded;

                switch (direction) {
                    case "UP":
                        thrustY = jumpMultiplier;
                        break;
                    case "UP_LEFT":
                        thrustY = jumpMultiplier * torque;
                        thrustX = -jumpMultiplier * torque;
                        break;
                    case "UP_RIGHT":
                        thrustY = jumpMultiplier * torque;
                        thrustX = jumpMultiplier * torque;
                        break;
                }
            }
        } else {
            switch (direction) {
                case "LEFT":
                    if (Math.abs(thrustX) < maxTorque) {
                        thrustX -= torque;
                        thrustX = roundTo(thrustX, 8); // Round after calculation
                    }
                    break;
                case "RIGHT":
                    if (Math.abs(thrustX) < maxTorque) {
                        thrustX += torque;
                        thrustX = roundTo(thrustX, 8); // Round after calculation
                    }
                    break;
                case "UP":
                    if (Math.abs(thrustY) < maxTorque) {
                        thrustY -= torque;
                        thrustY = roundTo(thrustY, 8); // Round after calculation
                    }
                    break;
                case "DOWN":
                    if (Math.abs(thrustY) < maxTorque) {
                        thrustY += torque;
                        thrustY = roundTo(thrustY, 8); // Round after calculation
                    }
                    break;
                case "UP_LEFT":
                    if (Math.abs(thrustX) < maxTorque / 2 && Math.abs(thrustY) < maxTorque / 2) {
                        thrustX -= torque / Math.sqrt(2);
                        thrustY -= torque / Math.sqrt(2);
                        thrustX = roundTo(thrustX, 8); // Round after calculation
                        thrustY = roundTo(thrustY, 8); // Round after calculation
                    }
                    break;
                case "UP_RIGHT":
                    if (Math.abs(thrustX) < maxTorque / 2 && Math.abs(thrustY) < maxTorque / 2) {
                        thrustX += torque / Math.sqrt(2);
                        thrustY -= torque / Math.sqrt(2);
                        thrustX = roundTo(thrustX, 8); // Round after calculation
                        thrustY = roundTo(thrustY, 8); // Round after calculation
                    }
                    break;
                case "DOWN_LEFT":
                    if (Math.abs(thrustX) < maxTorque && Math.abs(thrustY) < maxTorque / 2) {
                        thrustX -= torque / Math.sqrt(2);
                        thrustY += torque / Math.sqrt(2);
                        thrustX = roundTo(thrustX, 8); // Round after calculation
                        thrustY = roundTo(thrustY, 8); // Round after calculation
                    }
                    break;
                case "DOWN_RIGHT":
                    if (Math.abs(thrustX) < maxTorque && Math.abs(thrustY) < maxTorque / 2) {
                        thrustX += torque / Math.sqrt(2);
                        thrustY += torque / Math.sqrt(2);
                        thrustX = roundTo(thrustX, 8); // Round after calculation
                        thrustY = roundTo(thrustY, 8); // Round after calculation
                    }
                    break;
                case "CENTER":

                    // can change the release rate here or have it come up instantly
                    thrustX = 0;
                    thrustY = 0;
                    break;
            }
        }


        // Set the final thrust vector
        this._currentThrust = new Vector2(
            roundTo(thrustX, 8),
            roundTo(thrustY, 8)
        );
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

        if (this.facingDirection === 'LEFT') {
            ctx.drawImage(
                this.imageLeft,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'RIGHT') {
            ctx.drawImage(
                this.image,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth,
                scaledHeight
            );
        } else if (this.facingDirection === 'DOWN') {
            ctx.drawImage(
                this.imageDown,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        } else if (this.facingDirection === 'UP') {
            ctx.drawImage(
                this.imageDown,
                drawX + offsetX,
                drawY + offsetY,
                scaledWidth + (32 * scale),
                scaledHeight
            );
        }

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
                        'UP': 7,
                        'UP-RIGHT': 8,
                        'RIGHT': 13,
                        'DOWN-RIGHT': 18,
                        'DOWN': 17,
                        'DOWN-LEFT': 16,
                        'LEFT': 11,
                        'UP-LEFT': 6,
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
        if (this.unitDebugger.showTileOverlay) {
            this.unitDebugger.drawImage(ctx, drawX, drawY);
        }
        if (this.powerSupply.storedCapacity > 0) {
            this.powerSupply.drawManaBar(ctx, drawX, drawY);
        }
        ctx.restore();
    }
    getDirectionFromInput(keysPressed) {
        let direction = 'CENTER';
        const numKeysPressed = keysPressed.length;

        if (keysPressed.includes('w') && numKeysPressed === 1) {

            direction = 'UP';

        }
        if (keysPressed.includes('s') && numKeysPressed === 1) {

            direction = 'DOWN';

        } else if (keysPressed.includes('a') && numKeysPressed === 1) {

            direction = 'LEFT';


        } else if (keysPressed.includes('d') && numKeysPressed === 1) {

            direction = 'RIGHT';

        } else if (keysPressed.includes('w') && keysPressed.includes('a') && numKeysPressed === 2) {

            direction = 'UP_LEFT';


        } else if (keysPressed.includes('w') && keysPressed.includes('d') && numKeysPressed === 2) {

            direction = 'UP_RIGHT';


        } else if (keysPressed.includes('s') && keysPressed.includes('a') && numKeysPressed === 2) {

            direction = 'DOWN_LEFT';

        } else if (keysPressed.includes('s') && keysPressed.includes('d') && numKeysPressed === 2) {

            direction = 'DOWN_RIGHT';


        } else if (keysPressed.includes('ArrowUp') && numKeysPressed === 1) {

            direction = 'UP';

        } else if (keysPressed.includes('ArrowDown') && numKeysPressed === 1) {

            direction = 'DOWNn';

        } else if (keysPressed.includes('ArrowLeft') && numKeysPressed === 1) {

            direction = 'LEFT';

        } else if (keysPressed.includes('ArrowRight') && numKeysPressed === 1) {

            direction = 'RIGHT';

        } else if (keysPressed.includes('ArrowUp') && keysPressed.includes('ArrowLeft') && numKeysPressed === 2) {

            direction = 'UP_LEFT';

        } else if (keysPressed.includes('ArrowUp') && keysPressed.includes('ArrowRight') && numKeysPressed === 2) {

            direction = 'UP_RIGHT';

        } else if (keysPressed.includes('ArrowDown') && keysPressed.includes('ArrowLeft') && numKeysPressed === 2) {

            direction = 'DOWN_LEFT';

        } else if (keysPressed.includes('ArrowDown') && keysPressed.includes('ArrowRight') && numKeysPressed ===
            2) {

            direction = 'DOWN_RIGHT';


        } else if (keysPressed.includes(' ') && numKeysPressed === 1) {

            direction = 'UP';

        } else if (keysPressed.includes('Shift') && numKeysPressed === 1) {

            direction = 'DOWN';

        }

        return direction;

    }
    // tryMove(direction) {
    //     if (this.isMoving || this.isJumping) return;

    //     this.targetPosition = null;

    //     let selectedTile = null;

    //     let jumping = false;

    //     let dX = 0;
    //     let dY = 0;

    //     switch (direction) {
    //         case 'UP': {

    //             selectedTile = this.mooreNeighbors[1];

    //             dX = 0;
    //             dY = -1;

    //             jumping = true;

    //             break;
    //         }
    //         case 'DOWN': {

    //             selectedTile = this.mooreNeighbors[7];

    //             dX = 0;
    //             dY = 1;

    //             break;
    //         }
    //         case 'LEFT': {

    //             selectedTile = this.mooreNeighbors[3];

    //             dX = -1;
    //             dY = 0;

    //             break;
    //         }
    //         case 'RIGHT': {

    //             selectedTile = this.mooreNeighbors[5];

    //             dX = 1;
    //             dY = 0;

    //             break;
    //         }
    //         case 'UP-LEFT': {

    //             selectedTile = this.mooreNeighbors[0];

    //             dX = -1;
    //             dY = -1;

    //             if (!this.mooreNeighbors[3].solid && !this.mooreNeighbors[6].solid) {
    //                 this.calculateExtendedMooreNeighbors(this.world);
    //                 selectedTile = this.extendedMooreNeighbors[10];
    //             }

    //             jumping = true;

    //             break;
    //         }
    //         case 'UP-RIGHT': {

    //             selectedTile = this.mooreNeighbors[2];

    //             dX = 1;
    //             dY = -1;

    //             if (!this.mooreNeighbors[5].solid && !this.mooreNeighbors[8].solid) {
    //                 this.calculateExtendedMooreNeighbors(this.world);
    //                 selectedTile = this.extendedMooreNeighbors[14];
    //             }

    //             jumping = true;

    //             break;
    //         }
    //         case 'DOWN-LEFT': {

    //             selectedTile = this.mooreNeighbors[6];

    //             dX = -1;
    //             dY = 1;

    //             jumping = true;

    //             break;
    //         }
    //         case 'DOWN-RIGHT': {

    //             selectedTile = this.mooreNeighbors[8];

    //             dX = 1;
    //             dY = 1;

    //             jumping = true;

    //             break;
    //         }
    //         case 'UP-two': {

    //             this.calculateExtendedMooreNeighbors(this.world);

    //             selectedTile = this.extendedMooreNeighbors[2];

    //             dX = 0;
    //             dY = -2;

    //             jumping = true;

    //             break;
    //         }
    //         case 'UP-two-RIGHT-one': {

    //             this.calculateExtendedMooreNeighbors(this.world);

    //             selectedTile = this.extendedMooreNeighbors[3];

    //             dX = 1;
    //             dY = -2;

    //             jumping = true;

    //             break;
    //         }
    //         case 'UP-two-left-one': {

    //             this.calculateExtendedMooreNeighbors(this.world);

    //             selectedTile = this.extendedMooreNeighbors[1];

    //             dX = -1;
    //             dY = -2;

    //             jumping = true;

    //             break;
    //         }
    //         case 'UP-left-two': {

    //             this.calculateExtendedMooreNeighbors(this.world);

    //             selectedTile = this.extendedMooreNeighbors[0];

    //             dX = -2;
    //             dY = -2;

    //             jumping = true;

    //             break;
    //         }
    //         case 'UP-RIGHT-two': {

    //             this.calculateExtendedMooreNeighbors(this.world);

    //             selectedTile = this.extendedMooreNeighbors[4];

    //             dX = 2;
    //             dY = -2;

    //             jumping = true;

    //             break;
    //         }
    //     }

    //     const checkRightBorder = this.position.x + this.size >= this.world.width;
    //     const checkLeftBorder = this.position.x <= 0;

    //     if (selectedTile) {

    //         if (selectedTile.passable) {
    //             if (jumping) {
    //                 this.isJumping = jumping;

    //                 const jumpDownRange = 3;

    //                 const targetJumpLocation = this.world.getJumpTarget(selectedTile.x, selectedTile.y,
    //                     jumpDownRange);

    //                 // here
    //                 if (!!targetJumpLocation) {
    //                     this.targetPosition = new Vector2(targetJumpLocation.x, targetJumpLocation.y);
    //                 } else {
    //                     this.handleDeath();
    //                     return;
    //                 }
    //             } else {
    //                 this.isMoving = true;
    //                 this.targetPosition = new Vector2(selectedTile.x, selectedTile.y);
    //             }

    //         } else if (selectedTile.breakable) {

    //             this.tryBreakTile(selectedTile);


    //         } else if (selectedTile.type === 'border') {
    //             if (checkLeftBorder) {
    //                 // go back
    //                 if (world != 'underworld') {
    //                     events.emit('RETREAT_MAP');
    //                 }
    //             } else if (checkRightBorder) {
    //                 // go forward
    //                 events.emit('ADVANCE_MAP');
    //             }
    //         }
    //     }
    // }
    // trySwim(direction) {

    //     this.targetPosition = null;

    //     let selectedTile = null;

    //     switch (direction) {
    //         case 'UP': {

    //             selectedTile = this.mooreNeighbors[1];

    //             break;

    //         }
    //         case 'DOWN': {

    //             selectedTile = this.mooreNeighbors[7];

    //             break;

    //         }
    //         case 'LEFT': {

    //             selectedTile = this.mooreNeighbors[3];

    //             break;

    //         }

    //         case 'RIGHT': {

    //             selectedTile = this.mooreNeighbors[5];

    //             break;

    //         }

    //         case 'UP-LEFT': {

    //             selectedTile = this.mooreNeighbors[0];

    //             break;

    //         }

    //         case 'UP-RIGHT': {

    //             selectedTile = this.mooreNeighbors[2];

    //             break;

    //         }

    //         case 'DOWN-LEFT': {

    //             selectedTile = this.mooreNeighbors[6];

    //             break;

    //         }

    //         case 'DOWN-RIGHT': {

    //             selectedTile = this.mooreNeighbors[8];

    //             break;

    //         }

    //         default: {
    //             selectedTile = this.mooreNeighbors[7];
    //             break;

    //         }
    //     }

    //     if (selectedTile.passable) {
    //         this.isMoving = true;
    //         this.targetPosition = new Vector2(selectedTile.x, selectedTile.y);

    //     }
    // }
    // tryFall(direction) {
    //     if (this.isFalling) return;

    //     this.targetPosition = null;

    //     let selectedTile = null;

    //     let dX = 0;
    //     let dY = 0;

    //     switch (direction) {
    //         case 'UP':

    //             selectedTile = this.mooreNeighbors[1];

    //             dX = 0;
    //             dY = -1;

    //             break;

    //         case 'DOWN':

    //             selectedTile = this.mooreNeighbors[7];

    //             dX = 0;
    //             dY = 1;

    //             break;

    //         case 'LEFT':

    //             selectedTile = this.mooreNeighbors[3];

    //             dX = -1;
    //             dY = 0;

    //             break;

    //         case 'RIGHT':

    //             selectedTile = this.mooreNeighbors[5];

    //             dX = 1;
    //             dY = 0;

    //             break;

    //         default:
    //             break;
    //     }
    //     const checkRightBorder = this.position.x + this.size >= this.world.width;
    //     const checkLeftBorder = this.position.x <= 0;
    //     const checkTopBorder = this.position.y <= 0;
    //     const checkBottomBorder = this.position.y + this.size >= this.world.height;

    //     if (selectedTile.passable) {
    //         this.isFalling = true;


    //         const landingTile = this.world.getSolidTileBelow(selectedTile.x, selectedTile.y);

    //         if (!landingTile) {

    //             this.handleDeath();

    //             return;
    //             // throw new Error('No landing tile found');
    //         }

    //         const emptyTile = this.world.getEmptyTileAbove(landingTile.x, landingTile.y);

    //         const waterTile = this.world.getWaterTileBelow(selectedTile.x, selectedTile.y);

    //         // compare the y values of the landingTile and waterTile
    //         if (!!waterTile && !!landingTile && waterTile.y < landingTile.y) {
    //             this.targetPosition = new Vector2(waterTile.x, waterTile.y);
    //         } else if (!!emptyTile) {
    //             this.targetPosition = new Vector2(emptyTile.x, emptyTile.y);
    //         }
    //     }
    // }
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
            tileBelow.color = 'red';
            tileBelow.solid = false;
            tileBelow.passable = true;
            tileBelow.durability = 100;
            tileBelow.breakable = false;
            this.fallingDamage = 0; // freebies for breaking tiles
        }
    }
    // startFallTowards() {
    //     if (!this.fallTowards.active) {
    //         this.fallTowards = {
    //             active: true,
    //             startPos: this.position,
    //             endPos: this.targetPosition,
    //             progress: 0,
    //             duration: 300, // milliseconds
    //             height: 0,
    //             fallDampening: 1000, // increase to reduce damage
    //             onComplete: () => {
    //                 this.isFalling = false;
    //                 this.targetPosition = null;
    //                 this.delay = constants.KEY_DELAY;
    //                 this.breakFall(this.tileBelow);
    //             }
    //         };
    //     } else {
    //         console.warn('Fall towards already active');
    //     }
    // }
    // updateFallTowards(delta) {
    //     if (!this.fallTowards.active) return;

    //     this.fallTowards.progress += delta / this.fallTowards.duration;

    //     if (this.fallTowards.progress >= 1) {
    //         this.position = this.fallTowards.endPos;
    //         this.fallTowards.active = false;
    //         if (this.fallTowards.onComplete) this.fallTowards.onComplete();
    //         return;
    //     }

    //     // Calculate fall position with downward acceleration
    //     const t = this.fallTowards.progress;
    //     const start = this.fallTowards.startPos;
    //     const end = this.fallTowards.endPos;

    //     // Horizontal linear interpolation
    //     const x = start.x + (end.x - start.x) * t;

    //     // Vertical movement with acceleration
    //     const fallCurve = t * t; // Quadratic acceleration
    //     const y = start.y + (end.y - start.y) * fallCurve;

    //     this.position = new Vector2(x, y);


    //     // Calculate falling damage
    //     const fallDistance = Math.abs(end.y - start.y);
    //     const fallDampening = this.fallTowards.fallDampening;
    //     const fallDamage = fallDistance / fallDampening; // Adjust the divisor to control damage sensitivity
    //     this.fallingDamage += fallDamage;


    //     // Emit falling particles
    //     if (t % 0.1 < 0.016) {
    //         events.emit("PARTICLE_EMIT", {
    //             x: this.position.x + 32,
    //             y: this.position.y + 64,
    //             color: 'rgba(128, 128, 128, 0.3)',
    //             size: 2,
    //             duration: 300,
    //             shape: 'circle',
    //             count: 1,
    //             velocity: {
    //                 x: (Math.random() - 0.5) * 2,
    //                 y: Math.random() * 2
    //             }
    //         });
    //     }
    // }
    lookAround() {

        if (this.useAutoInput) return;

        const lookDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
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
    // startMoveTowards() {
    //     if (!this.moveTowards.active) {
    //         this.moveTowards = {
    //             active: true,
    //             startPos: this.position,
    //             endPos: this.targetPosition,
    //             progress: 0,
    //             duration: this.speed,
    //             onComplete: () => {
    //                 this.isMoving = false;
    //                 this.targetPosition = null;
    //                 this.delay = 0;
    //             }
    //         };
    //     } else {
    //         console.warn('Move towards already active');
    //     }
    // }
    // updateMoveTowards(delta) {
    //     if (!this.moveTowards.active) return;

    //     let duration = this.moveTowards.duration;

    //     if (this.tile.type === 'water') {
    //         duration *= 3;
    //     }

    //     if (this.isFalling) {
    //         duration *= .3;
    //     }

    //     this.moveTowards.progress += delta / duration;

    //     if (this.moveTowards.progress >= 1) {

    //         this.position = this.moveTowards.endPos;

    //         this.moveTowards.active = false;

    //         if (this.moveTowards.onComplete) this.moveTowards.onComplete();

    //         return;
    //     }

    //     const t = this.moveTowards.progress;
    //     const start = this.moveTowards.startPos;
    //     const end = this.moveTowards.endPos;

    //     const x = start.x + (end.x - start.x) * t;
    //     const y = start.y + (end.y - start.y) * t;

    //     this.position = new Vector2(x, y);
    // }
    // startJumpArc() {
    //     if (!this.jumpArc.active) {
    //         this.jumpArc = {
    //             active: true,
    //             startPos: this.position,
    //             endPos: this.targetPosition,
    //             progress: 0,
    //             duration: 500,
    //             height: this.spriteHeight / 2,
    //             fallDampening: 10000000,
    //             onComplete: () => {
    //                 this.isJumping = false;
    //                 this.targetPosition = null;
    //                 this.isMoving = false;
    //                 this.delay = constants.KEY_DELAY;
    //                 this.breakFall(this.tileBelow);
    //             }
    //         };
    //     } else {
    //         console.warn('Jump arc already active');
    //     }
    // }
    // updateJumpArc(delta) {
    //     // check
    //     if (!this.jumpArc.active) return;

    //     this.jumpArc.progress += delta / this.jumpArc.duration;

    //     if (this.jumpArc.progress >= 1) {
    //         // Finish jump
    //         this.position = this.jumpArc.endPos;
    //         this.jumpArc.active = false;
    //         if (this.jumpArc.onComplete) this.jumpArc.onComplete();
    //         return;
    //     }

    //     // Calculate arc position
    //     const t = this.jumpArc.progress;
    //     const start = this.jumpArc.startPos;
    //     const end = this.jumpArc.endPos;

    //     // Horizontal linear interpolation
    //     const x = start.x + (end.x - start.x) * t;

    //     // Vertical quadratic curve for arc
    //     const arcHeight = this.jumpArc.height * (4 * t * (1 - t));
    //     const y = start.y + (end.y - start.y) * t - arcHeight;

    //     this.position = new Vector2(x, y);


    //     // Calculate falling damage
    //     const fallDistance = Math.abs(end.y - start.y);
    //     const fallDampening = this.jumpArc.fallDampening;
    //     const fallDamage = fallDistance / fallDampening; // Adjust the divisor to control damage sensitivity
    //     this.fallingDamage += fallDamage;


    //     // Emit particles during jump
    //     if (t % 0.1 < 0.016) { // Emit every ~100ms
    //         events.emit("PARTICLE_EMIT", {
    //             x: this.position.x + 32,
    //             y: this.position.y + 64,
    //             color: 'rgba(255, 255, 255, 0.3)',
    //             size: 2,
    //             duration: 300,
    //             shape: 'square',
    //             count: 1,
    //             velocity: {
    //                 x: (Math.random() - 0.5) * 2,
    //                 y: Math.random() * 1
    //             }
    //         });
    //     }
    // }
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

        this.facingDirection = 'RIGHT';

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

        this.facingDirection = 'RIGHT';

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
    showDustParticles() {
        if (this.particleCooldowns.dust.current > 0) {
            return;
        }

        for (let i = 0; i < this.particleCooldowns.dust.burstCount; i++) {
            let adjustedX = this.position.x;
            if (this.facingDirection === 'LEFT') {
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
    breakTile(target) {
        this.delay = constants.BREAK_BLOCK_DELAY;

        events.emit('BLOCK_BREAK', target);

        target.type = 'air';
        target.color = 'red';
        target.solid = false;
        target.passable = true;
        target.durability = 100;
        target.breakable = false;

    }
    attackTile(target) {
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
    tryBreakTile(target) {
        if (target.durability > 0 && target.breakable && this.stomach.energy > 0) {
            this.attackTile(target);
        } else if (target.durability <= 0) {
            this.breakTile(target);
        } else if (target.durability > 0 && !target.breakable) {
            this.showDustParticles();
        }
    }
    handleOrganFunctions(delta) {
        this.lungs.step(delta);
        this.stomach.step(delta);
        this.heart.step(delta);
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
    get airTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world
            .tileSize * 2);
    }
    get headTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world
            .tileSize);
    }
    get bodyTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y);
    }
    get legsTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y + this.world
            .tileSize);
    }
    get feetTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y + this.world
            .tileSize * 2);
    }
    get currentTile() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y);
    }
    get tileBelow() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y + this.world
            .tileSize);
    }
    get tileBelowTwo() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y + this.world
            .tileSize * 2);
    }
    get tileLeftFour() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x - this.world.tileSize * 4, this
            .position.y);
    }
    get tileRightFour() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x + this.world.tileSize * 4, this
            .position.y);
    }
    get tileUpOneLeftThree() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x - this.world.tileSize * 3, this
            .position.y - this.world.tileSize);
    }
    get tileUpOneRightThree() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x + this.world.tileSize * 3, this
            .position.y - this.world.tileSize);
    }
    get tileUpFour() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world
            .tileSize * 4);
    }
    get tileUpThree() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world
            .tileSize * 3);
    }
    get tileUpTwo() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world
            .tileSize * 2);
    }
    get tileUpOne() {
        return this.parent.parent.world.getTileAtCoordinates(this.position.x, this.position.y - this.world
            .tileSize);
    }
    get totalMass() {
        // plus encumberance
        // return this._mass + this?.inventory?.items?.length * this.scale ** 2;
        return this._mass;
    }
}