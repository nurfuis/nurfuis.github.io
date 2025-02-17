            // Update and draw particles
            particles.forEach(particle => particle.update());
            particles.forEach(particle => particle.draw(ctx));
            // Remove particles that have expired
            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].size === 0) {
                    particles.splice(i, 1);
                }
            }