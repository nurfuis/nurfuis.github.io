        // Check Falling
        if (tile.type == 'air' && tileBelow.type == 'air') {
            if (this.hangtime > 0) {
                this.hangtime -= delta;
            } else {
                fall(this);
                function fall(unit) {
                    unit.isFalling = true;
                    unit.fallingDamage += 0.25;
                    unit.targetPosition = {
                        x: tileBelow.x,
                        y: tileBelow.y
                    };
                    unit.isMoving = true;
                }
            }
        }
        // Check Water Walking
        if (tile.type == 'air' && tileBelow.type == 'water') {
            if (this.hangtime > 0) {
                this.hangtime -= delta;
            } else {
                sink(this);
                function sink(unit) {
                    unit.isSinking = true;
                    unit.isFalling = false;

                    unit.targetPosition = {
                        x: tileBelow.x,
                        y: tileBelow.y
                    }

                    unit.isMoving = true;
                }
            }
        }
        // Check Sinking
        if (!root.input.keysPressed.includes('w') && tile.type == 'water' && tileBelow.type == 'water') {
            if (this.hangtime > 0) {
                this.hangtime -= delta;
            } else {
                sink(this);
                function sink(unit) {
                    unit.isSinking = true;
                    unit.isFalling = false;

                    unit.targetPosition = {
                        x: tileBelow.x,
                        y: tileBelow.y
                    };

                    unit.isMoving = true;
                }
            }
        }
        // Break Fall
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
                tileBelow.color = 'red';
                tileBelow.solid = false;
                tileBelow.passable = true;
                tileBelow.durability = 100;
                tileBelow.breakable = false;
                this.fallingDamage = 0; // freebies for breaking tiles
            }
            this.isFalling = false;

        }
        // Swim
        if (tile.type == 'water' && this.isSinking) {
            if (root.input.keysPressed.includes('w')) {
                this.hangtime =
                    350;

                const newX = tile.x;
                const newY = tile.y;

                this.targetPosition = {
                    x: newX,
                    y: newY
                };
                
                this.isMoving = true;
                this.isSinking = false;
            }

            if (tileBelow.solid) {
                const newX = tile.x;
                const newY = tile.y;
                this.targetPosition = {
                    x: newX,
                    y: newY
                };
                this.isMoving = true;
                this.isSinking = false;
            }
        }