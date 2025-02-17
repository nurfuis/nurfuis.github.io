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
            this.parent.removeChild(this); // Remove from parent's children list
            this.parent.particles.splice(this.parent.particles.indexOf(this), 1); // Remove from particles array in ParticleSystem
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

    // Add clone method to Particle class
    clone() {
        const cloned = new Particle(
            this.position.x,
            this.position.y,
            this.size,
            this.duration,
            this.color,
            this.shape
        );
        return cloned;
    }

    // Add reset method to reuse particles
    reset(x, y, size, duration, color, shape) {
        this.position = new Vector2(x, y);
        this.size = size;
        this.duration = duration;
        this.color = color;
        this.shape = shape;
        this.age = 0;
        this.destroyed = false;
        
        // Reset velocity and trajectory
        const angle = Math.random() * Math.PI * 2;
        const speed = shape === 'square' ? 
            Math.random() * 8 + 4 : 
            Math.random() * 4 + 2;
        
        this.velocity = new Vector2(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        this.gravity = shape === 'square' ? 0.3 : -0.05;
        this.friction = 0.98;
    }
}

class ParticleSystem extends GameObject {
    constructor() {
        super();
        this.particles = [];
        this.particlePool = [];
        
        // Create prototype particles
        this.prototypeParticles = {
            circle: new Particle(0, 0, 1, 1000, 'rgba(255,255,255,1)', 'circle'),
            square: new Particle(0, 0, 1, 1000, 'rgba(255,255,255,1)', 'square')
        };

        events.on('PARTICLE_EMIT', this, (data) => {
            const { x, y, size, duration, color, shape, count = 1 } = data;
            
            for (let i = 0; i < count; i++) {
                let particle;
                
                // Try to get a particle from the pool first
                if (this.particlePool.length > 0) {
                    particle = this.particlePool.pop();
                } else {
                    // If pool is empty, clone from prototype
                    particle = Object.create(this.prototypeParticles[shape]);
                }

                // Reset the particle with new properties
                particle.reset(
                    x + (Math.random() - 0.5) * 4,
                    y + (Math.random() - 0.5) * 4,
                    size * (Math.random() * 0.5 + 0.75),
                    duration * (Math.random() * 0.3 + 0.85),
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
        // Move destroyed particles to the pool instead of filtering them out
        this.particles = this.particles.filter(particle => {
            if (particle.destroyed) {
                this.particlePool.push(particle);
                return false;
            }
            return true;
        });
        super.step(delta);
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}