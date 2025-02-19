let direction = 'center';

       
       let sinking = this.isSinking;
        let floating = this.isFloating;
        let falling = this.isFalling;

        let fallDamage = this.fallingDamage;


        const input = { direction: this.getDirectionFromInput(root.input.keysPressed) };
        const automatedInput = root.automatedInput;


        // UPDATE GRID MOVEMENT
        if (this.isMoving && this.targetPosition) {

            const distance = this.moveTowards();

            if (tile.type === 'water') {
                root.map.disturbWater(this.position.x, this.position.y);
            }
            return;
        }

        // CHECK FALLING AND SINKING

        // WATER CHECKS

        // Unit is above water - force player to fall
        if (tileBelow && tileBelow.type === 'water') {
            falling = false;
            sinking = true;
            floating = false;

            direction = 'down';
        }

        // unit fell into water
        if (tile.type === 'water' && falling) {
            falling = false;
            sinking = true;
            floating = false;

            direction = 'down';

            if (this.fallingDamage > 5) {
                this.heart.takeDamage(this.fallingDamage);
                this.fallingDamage = 0;
            }
        }

        // unit is in water - cause to sink 
        if (tile.type === 'water') {
            if (input.length === 0) {
                falling = false;
                sinking = true;
                floating = false;

                direction = 'down';
            }

        }

        // cancel sinking
        if (sinking) {
            if (input.length > 0) {
                sinking = false;
                falling = false;
                floating = false;
            }
            if (tile.type != 'water') {
                sinking = false;
                falling = false;
                floating = false;
            }
            if (tileBelow.solid) {
                sinking = false;
                falling = false;
                floating = false;
            }
        }

        // AIR CHECKS

        // unit is in air - force player to fall
        if (tile.type === 'air' && tileBelow.type === 'air' && !floating) {
            falling = true;
            sinking = false;
            floating = false;

            direction = 'down';

            fallDamage += 1;
        }
        // unit is in air but floating - force player down   
        else if (tile.type === 'air' && tileBelow.type === 'air' && floating) {
            falling = false;
            sinking = false;
            floating = true;

            direction = 'down';

            this.fallingDamage = 0;
        }


        // GROUND CHECKS
        // unit is on solid ground and falling - stop falling & take damage
        if (tile.type === 'air' && tileBelow.solid && falling) {

            this.breakFall(tileBelow);

            if (fallDamage > 0) {
                this.heart.takeDamage(fallDamage);
                this.fallingDamage = 0;

            }

            falling = false;
            sinking = false;
            floating = false;
        }

        // unit is on solid ground after floating down - stop floating
        else if (tile.type === 'air' && tileBelow.solid && floating) {
            falling = false;
            sinking = false;
            floating = false;
        }

        
        // SET DIRECTION
        if (!!input.direction && !falling) {
            direction = input.direction;
        } else if (this.useAutoInput && !falling) {
            direction = input.direction || automatedInput.direction;
        }

        // SET FACING DIRECTION
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

        this.lastDirection = this.direction;
        this.direction = direction;

        this.isSinking = sinking;
        this.isFalling = falling;
        this.isFloating = floating;


        // this.move(direction);

        this.tryMove(direction);