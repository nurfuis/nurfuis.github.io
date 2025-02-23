class Lungs {
    constructor(unit) {
        this.unit = unit;
        this.oxygen = 100;
        this.maxOxygen = 100;


        this.oxygenBar = document.getElementsByClassName('oxygen-bar')[0];

        this.oxygenDetails = document.getElementsByClassName('oxygen-details')[0];

        this.oxygenContainer = document.getElementsByClassName('oxygen-container')[0];



        this.oxygenIconContainer = document.getElementsByClassName('oxygen-icon-container')[0];

        this.oxygenLungsIcon = document.getElementsByClassName('lungs-icon')[0];

        this.oxygenLevel = document.getElementById('oxygen');
        this.updateOxygenBar(0);

        this.image = new Image();
        this.image.src = 'images/lungs.png';

        this.fadeTimer = 10000;
        this.fadeDelay = 2000;  // 1 second
        this.isAtMaxOxygen = false;

    }
    updateOxygenBar(delta) {

        const oxygenPercentage = (this.oxygen / this.maxOxygen) * 100;
        this.oxygenLevel.style.width = `${oxygenPercentage}%`;

        if (this.oxygen >= this.maxOxygen) {
            if (!this.isAtMaxOxygen) {
                this.isAtMaxOxygen = true;
                this.fadeTimer = this.fadeDelay;
                this.oxygenDetails.style.display = 'none';
                this.oxygenLungsIcon.style.display = 'block';
                this.oxygenLungsIcon.style.opacity = 1;

            } else {
                if (this.fadeTimer > 0) {
                    this.fadeTimer -= delta;
                } else {
                    this.oxygenLungsIcon.style.opacity = 0.5;
                }
            }
        } else {
            this.isAtMaxOxygen = false;
            this.fadeTimer = this.fadeDelay;
            this.oxygenDetails.style.display = 'block';
            this.oxygenLungsIcon.style.display = 'none';
            this.oxygenLungsIcon.style.opacity = 1;
        }
        events.emit("OXYGEN_CHANGED", { unit: this });


    }

    takeBreath(amount) {
        if (this.oxygenDetails.style.display === 'none') {
            this.oxygenDetails.style.display = 'block';
            this.oxygenLungsIcon.style.display = 'none';
        }


        this.oxygen -= amount;

        
        if (this.oxygen < 0) {
            this.oxygen = 0;
        } else if (this.oxygen > this.maxOxygen) {
            this.oxygen = this.maxOxygen;
        } else {
            this.updateOxygenBar(this.oxygen, this.maxOxygen);
        }
    }

    restoreBreath(amount) {
        this.oxygen += amount;
        if (this.oxygen > this.maxOxygen) {
            this.oxygen = this.maxOxygen;
        } else {
            this.updateOxygenBar(this.oxygen, this.maxOxygen);
        }
    }

    emitWaterBubbles() {
        if (this.unit.particleCooldowns.water.current > 0) {
            return;
        }

        const oxygenRatio = this.oxygen / this.maxOxygen;
        const baseBurstCount = this.unit.particleCooldowns.water.burstCount;
        const actualBurstCount = Math.ceil(baseBurstCount * (1 + (1 - oxygenRatio) * 3));

        for (let i = 0; i < actualBurstCount; i++) {
            setTimeout(() => {
                events.emit("PARTICLE_EMIT", {
                    x: this.unit.position.x + 32 + (Math.random() - 0.5) * 16,
                    y: this.unit.position.y + 8 + (Math.random() - 0.5) * 16,
                    color: 'rgba(0, 0, 255, 0.5)',
                    size: 4 + (1 - oxygenRatio) * 2,
                    duration: 1000,
                    shape: 'circle',
                    count: 1,
                });
            }, i * this.unit.particleCooldowns.water.burstDelay);
        }


        const cooldownMultiplier = 0.5 + oxygenRatio * 0.5;
        this.unit.particleCooldowns.water.current = this.unit.particleCooldowns.water.max * cooldownMultiplier;
    }
    step(delta) {
        if (this.unit.isAlive) {
            if (this.unit.tile.type === 'water') {

                this.takeBreath(1);

                this.emitWaterBubbles();

            } else if (this.unit.tile.type === 'air') {

                if (this.oxygen < this.maxOxygen) {
                    this.oxygen += 0.1;
                } else if (this.oxygen >= this.maxOxygen) {
                    this.oxygen = this.maxOxygen;
                }
            }
        }

        this.updateOxygenBar(delta);

    }
    draw(ctx) {

    }
}
class Heart {
    constructor(unit) {
        this.unit = unit;
        this.health = 100;
        this.maxHealth = 100;

        // DOM elements
        this.healthBar = document.getElementsByClassName('health-bar')[0];
        this.healthDetails = document.getElementsByClassName('heart-details')[0];
        this.healthContainer = document.getElementsByClassName('health-container')[0];
        this.healthIconContainer = document.getElementsByClassName('health-icon-container')[0];
        this.healthHeartIcon = document.getElementsByClassName('heart-icon')[0];
        this.healthLevel = document.getElementById('health');
        
        this.image = new Image();
        this.image.src = 'images/heart.png';

        this.fadeTimer = 10000;
        this.fadeDelay = 2000;
        this.isAtMaxHealth = false;
        
        this.updateHealthBar(0);
    }

    updateHealthBar(delta) {
        const healthPercentage = (this.health / this.maxHealth) * 100;
        this.healthLevel.style.width = `${healthPercentage}%`;

        if (this.health >= this.maxHealth) {
            if (!this.isAtMaxHealth) {
                this.isAtMaxHealth = true;
                this.fadeTimer = this.fadeDelay;
                this.healthDetails.style.display = 'none';
                this.healthHeartIcon.style.display = 'block';
                this.healthHeartIcon.style.opacity = 1;
            } else {
                if (this.fadeTimer > 0) {
                    this.fadeTimer -= delta;
                } else {
                    this.healthHeartIcon.style.opacity = 0.5;
                }
            }
        } else {
            this.isAtMaxHealth = false;
            this.fadeTimer = this.fadeDelay;
            this.healthDetails.style.display = 'block';
            this.healthHeartIcon.style.display = 'none';
            this.healthHeartIcon.style.opacity = 1;
        }
        events.emit("UNIT_HEALTH_CHANGED", { unit: this });

    }

    takeDamage(amount) {
        if (this.healthDetails.style.display === 'none') {
            this.healthDetails.style.display = 'block';
            this.healthHeartIcon.style.display = 'none';
        }

        this.health -= amount;

        if (this.health > 0) {

            events.emit("PARTICLE_EMIT", {
                x: this.unit.position.x + 32,
                y: this.unit.position.y + 32,
                color: 'rgba(255, 0, 0, 1)',
                size: 3 + Math.random() * 2,
                duration: 2000,
                shape: 'circle',
                count: amount,
            });
        } else
            if (this.health < 0) {
                this.health = 0;
            } else {
                this.updateHealthBar(this.health, this.maxHealth);
            }
    }
    heal(amount) {
        this.health += amount;

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
            this.updateHealthBar(this.health, this.maxHealth);

        } else {
            this.updateHealthBar(this.health, this.maxHealth);
        }
    }
    step(delta) {

        // out of breath
        if (this.unit.lungs.oxygen <= 0) {
            this.takeDamage(1);
        }

        // starving to death
        if (this.unit.stomach.energy <= 0) {
            this.takeDamage(1);
        }

        // death by heart failure or starvation
        if (this.health <= 0) {
            // deplete all organs before death
            this.unit.lungs.takeBreath(this.unit.lungs.maxOxygen);
            this.unit.stomach.consumeEnergy(this.unit.stomach.maxEnergy);
            this.takeDamage(this.maxHealth);

            if (this.unit.isAlive) {
                this.unit.handleDeath();
            }
        }
        this.updateHealthBar(delta);
    }
}
class Stomach {

    constructor(unit) {
        this.unit = unit;
        this.energy = 100;
        this.maxEnergy = 100;

        // DOM elements
        this.energyBar = document.getElementsByClassName('stomach-bar')[0];
        this.energyDetails = document.getElementsByClassName('stomach-details')[0];
        this.energyContainer = document.getElementsByClassName('stomach-container')[0];
        this.energyIconContainer = document.getElementsByClassName('stomach-icon-container')[0];
        this.energyStomachIcon = document.getElementsByClassName('stomach-icon')[0];
        this.energyLevel = document.getElementById('stomach');
        
        this.image = new Image();
        this.image.src = 'images/stomach.png';

        this.fadeTimer = 10000;
        this.fadeDelay = 2000;
        this.isAtMaxEnergy = false;
        
        this.updateEnergyBar(0);
    }

    updateEnergyBar(delta) {
        const energyPercentage = (this.energy / this.maxEnergy) * 100;
        this.energyLevel.style.width = `${energyPercentage}%`;

        if (this.energy >= this.maxEnergy) {
            if (!this.isAtMaxEnergy) {
                this.isAtMaxEnergy = true;
                this.fadeTimer = this.fadeDelay;
                this.energyDetails.style.display = 'none';
                this.energyStomachIcon.style.display = 'block';
                this.energyStomachIcon.style.opacity = 1;
            } else {
                if (this.fadeTimer > 0) {
                    this.fadeTimer -= delta;
                } else {
                    this.energyStomachIcon.style.opacity = 0.5;
                }
            }
        } else {
            this.isAtMaxEnergy = false;
            this.fadeTimer = this.fadeDelay;
            this.energyDetails.style.display = 'block';
            this.energyStomachIcon.style.display = 'none';
            this.energyStomachIcon.style.opacity = 1;
        }
        events.emit("ENERGY_CHANGED", { unit: this });

    }

    consumeEnergy(amount) {
        if (this.energyDetails.style.display === 'none') {
            this.energyDetails.style.display = 'block';
            this.energyStomachIcon.style.display = 'none';
        }


        this.energy -= amount;

        if (this.energy < 0) {
            this.energy = 0;

        } else {
            this.updateEnergyBar(this.energy, this.maxEnergy);
        }
    }
    restoreEnergy(amount) {
        this.energy += amount;

        if (this.energy > this.maxEnergy) {
            this.energy = this.maxEnergy;
        } else {
            this.updateEnergyBar(this.energy, this.maxEnergy);
        }
    }
    step(delta) {
        this.updateEnergyBar(delta);
    }
}