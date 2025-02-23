
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