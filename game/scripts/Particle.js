class Particle extends GameObject {
    constructor(x, y, size, duration, color, shape) {
        super();
        this.position = new Vector2(x, y);
        this.size = size;
        this.duration = duration;
        this.color = color;
        this.shape = shape;
        this.age = 0;
        
        // Add velocity and trajectory properties
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const speed = shape === 'square' ? 
            Math.random() * 8 + 4 : // Squares move faster
            Math.random() * 4 + 2;  // Circles move slower
        
        this.velocity = new Vector2(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        this.gravity = shape === 'square' ? 0.3 : -0.05; // Positive for squares (fall down), negative for circles (float up)
        this.friction = 0.98; // Add slight friction
    }

    step(delta) {
        this.age += delta;
        if (this.age >= this.duration) {
            this.destroy();
            return;
        }

        // Update position based on velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply gravity
        this.velocity.y += this.gravity;

        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        // Add some randomness to bubble movement
        if (this.shape === 'circle') {
            this.velocity.x += (Math.random() - 0.5) * 0.2;
            this.velocity.y += (Math.random() - 0.5) * 0.2;
        }
    }

    draw(ctx) {
        // Calculate opacity based on lifetime
        const opacity = 1 - (this.age / this.duration);
        const rgba = this.color.replace(/[\d.]+\)$/g, `${opacity})`);
        
        ctx.fillStyle = rgba;
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'square') {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.age * 0.1); // Add rotation for squares
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }
}

class ParticleSystem extends GameObject {
    constructor() {
        super();
        this.particles = [];

        events.on('PARTICLE_EMIT', this, (data) => {
            const { x, y, size, duration, color, shape, count = 1 } = data;
            // Emit multiple particles
            for (let i = 0; i < count; i++) {
                const particle = new Particle(
                    x + (Math.random() - 0.5) * 4, // Add slight position variation
                    y + (Math.random() - 0.5) * 4,
                    size * (Math.random() * 0.5 + 0.75), // Vary size between 75% and 125%
                    duration * (Math.random() * 0.3 + 0.85), // Vary duration
                    color,
                    shape
                );
                this.addParticle(particle);
            }
        });
    }

    addParticle(particle) {
        this.particles.push(particle);
        this.addChild(particle);
    }

    step(delta) {
        this.particles = this.particles.filter(particle => !particle.destroyed);
        super.step(delta);
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}