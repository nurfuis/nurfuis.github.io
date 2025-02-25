    // updatePhysics(delta) {
    //     // Apply gravity and water physics
    //     if (!this.movementState.isInWater) {
    //         this.physics.velocity.y += this.physics.gravity;
    //     } else {
    //         this.physics.velocity.y += this.physics.gravity * 0.3;
    //         this.physics.velocity.multiply(0.95);
    //     }

    //     // Apply movement and friction
    //     this.physics.velocity.x += this.physics.acceleration.x;

    //     if (this.movementState.isGrounded) {
    //         this.physics.velocity.x *= this.physics.friction;
    //     } else {
    //         this.physics.velocity.x *= this.physics.airResistance;
    //     }

    //     // Clamp velocity
    //     this.physics.velocity.x = Math.min(Math.max(this.physics.velocity.x, -this.physics.maxSpeed), this.physics.maxSpeed);

    //     // Calculate movement vector
    //     const movement = new Vector2(
    //         this.physics.velocity.x * delta,
    //         this.physics.velocity.y * delta
    //     );

    //     // Apply movement with collision checks
    //     this.moveWithCollisions(movement);

    //     // Update movement states after position change
    //     this.movementState.isInWater = this.isInWater(this.position.y + this.colliders.body.offset.y);
    //     this.movementState.headInWater = this.isInWater(this.position.y + this.colliders.head.offset.y);

    //     // Reset states when landing
    //     if (this.physics.velocity.y === 0 && !this.movementState.isInWater) {
    //         this.movementState.canJump = true;
    //         this.movementState.isGrounded = true;
    //     }

    //     // Emit position update event
    //     this.tryEmitPosition();
    // }