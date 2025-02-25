class Battery {
    constructor(unit) {
        this.unit = unit;
        this.storedEnergy = 80000;
        this.storedCapacity = 80000; // mHa

        this.floatStage = 0.95;
        this.absorptionStage = 0.8;
        this.lowStage = 0.5;
        this.criticalStage = 0.2;

        this.dischargeRate = 20; // Amps
        this.voltage = 6; // Volts

        this.dropoff = {
            float: 1,
            absorb: 0.9,
            bulk: 0.8,
            low: 0.8,
            critical: 0.5,
            discharged: 0,
        };
        this.storedCharge = "bulk";
        this.isDisabled = false;
    }
    drawManaBar(ctx, posX, posY) {
        const width = 32; // Assuming 'this.width' represents the total width for the bar
        const height = 4;
        let fillColor = "blue";
        const emptyColor = "gray";
        const percentFull = Math.min(
            this.storedEnergy / this.storedCapacity,
            1
        ); // Clamp percentage between 0 and 1
        switch (this.storedCharge) {
            case "discharged":
                fillColor = "gray";
                break;
            case "critical":
                fillColor = "red";
                break;
            case "low":
                fillColor = "orange";
                break;
            case "bulk":
                fillColor = "purple";
                break;
            case "absorb":
                fillColor = "blue";
                break;
            case "float":
                fillColor = "gold";
                break;
            default:
                break;
        }
        // Draw the empty bar outline
        const offsetX = -16; // Adjust this value to move the bar horizontally
        const offsetY = -42; // Adjust this value to move the bar vertically

        ctx.beginPath();
        ctx.rect(posX + offsetX, posY + offsetY, width, height);
        ctx.strokeStyle = emptyColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw the filled portion of the bar
        ctx.beginPath();
        ctx.rect(posX + offsetX, posY + offsetY, width * percentFull, height); // Fill based on percentage
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.closePath();
    }
    requestPower(requestedPower, requestedVoltage) {
        if (this.isDisabled || this.storedCharge === "discharged") {
            return {
                power: 0,
                voltage: 0,
                current: 0
            };
        }

        // Calculate available current based on voltage
        const maxCurrent = Math.min(
            this.dischargeRate,
            requestedPower / requestedVoltage
        );

        // Apply voltage sag based on charge state
        const actualVoltage = this.voltage * this.dropoff[this.storedCharge];

        // Calculate actual power that can be delivered
        const availablePower = Math.min(
            requestedPower,
            maxCurrent * actualVoltage,
            this.storedEnergy
        );

        if (availablePower > 0) {
            this.storedEnergy -= availablePower;
            this.checkState();
        }

        return {
            power: availablePower,
            voltage: actualVoltage,
            current: availablePower / actualVoltage
        };
    }
    update() {
        this.checkState();
        // this.drawPower(this.unit._acceleration);

        if (this.storedCharge == "discharged") {
            this.isDisabled = true;
        }
        if (this.isDisabled) {
            this.recoverEnergy();
            return;
        }

        if (this.unit.direction === 'center') {
            if (this.storedEnergy < this.storedCapacity) {
                switch (this.storedCharge) {
                    case "absorb":
                        this.storedEnergy += 2;

                        break;
                    case "bulk":
                        this.storedEnergy += 3;

                        break;
                    case "low":
                        this.storedEnergy += 4;

                        break;
                    default:
                        this.storedEnergy += 1;

                        break;
                }
            }
        }

    }
    checkState() {
        if (this.storedEnergy >= this.storedCapacity * this.floatStage) {
            this.storedCharge = "float";
        } else if (
            this.storedEnergy < this.storedCapacity &&
            this.storedEnergy >= this.storedCapacity * this.absorptionStage
        ) {
            this.storedCharge = "absorb";
        } else if (
            this.storedEnergy < this.storedCapacity * this.absorptionStage &&
            this.storedEnergy > this.storedCapacity * this.lowStage
        ) {
            this.storedCharge = "bulk";
        } else if (
            this.storedEnergy < this.storedCapacity * this.lowStage &&
            this.storedEnergy > this.storedCapacity * this.criticalStage
        ) {
            this.storedCharge = "low";
        } else if (
            this.storedEnergy < this.storedCapacity * this.criticalStage &&
            this.storedEnergy > 0
        ) {
            this.storedCharge = "critical";
        } else if (this.storedEnergy <= 0) {
            this.storedCharge = "discharged";
        }
    }
    recharge() {
        this.storedEnergy = this.storedCapacity;
    }
    recoverEnergy() {
        // this.body.animations.play("spin");
        this.storedEnergy += 10;
        if (this.storedEnergy > this.storedCapacity / 3) {
            this.isDisabled = false;
        }
    }
}

class Motor {
    constructor() {
        this.KV = 5;                // Motor velocity constant (RPM per volt)
        this.resistance = 0.1;      // Motor internal resistance (ohms)
        this.minVoltage = 3;        // Minimum voltage to operate
        this.maxVoltage = 12;       // Maximum rated voltage
        this.maxCurrent = 20;       // Maximum rated current (amps)
        this.temperature = 25;      // Temperature in Celsius
        this.maxTemperature = 80;   // Maximum safe temperature
        this.efficiency = 0.85;     // Motor efficiency
    }

    calculatePowerDraw(requestedTorque, voltage) {
        // Check if voltage is sufficient
        if (voltage < this.minVoltage) {
            return {
                current: 0,
                power: 0,
                torque: 0,
                efficiency: 0
            };
        }

        // Calculate current draw based on torque request
        const current = Math.min(
            (requestedTorque / this.KV) * (voltage / this.resistance),
            this.maxCurrent
        );

        // Calculate actual power and torque delivered
        const power = voltage * current;
        const actualTorque = (power * this.efficiency) / this.KV;

        // Temperature increase based on power loss
        const powerLoss = power * (1 - this.efficiency);
        this.temperature += powerLoss * 0.01;

        return {
            current: current,
            power: power,
            torque: actualTorque,
            efficiency: this.efficiency * (1 - Math.max(0, (this.temperature - 60) / 40))
        };
    }
}

class Transmission {
    constructor() {
        this.gearBox = {
            1: {
                drive: 1,
                motor: 2
            }, // low
            2: {
                drive: 1,
                motor: 1
            }, // direct
            3: {
                drive: 2,
                motor: 1
            }, // overdrive
        };
        this.gear = 2;
    }
}

class Capacitor {
    constructor(battery) {
        this.capacitance = 100000;      // Farads
        this.maxVoltage = 12;           // V
        this.currentVoltage = 0;        // V
        this.storedEnergy = 0;          // Joules
        this.chargeRate = 1000;         // W/s
        this.dischargeRate = 2000;      // W/s
        this.efficiency = 0.95;         // Transfer efficiency
        this.battery = battery;
        this.lastChargeTime = Date.now();
        this.isDischarging = false;
        this.dischargeCooldown = 100; // ms to wait after discharge before charging
        this.lastDischargeTime = 0;
    }

    update(delta) {
        // Don't charge if currently discharging or in cooldown
        if (this.isDischarging || Date.now() - this.lastDischargeTime < this.dischargeCooldown) {
            return;
        }

        // Try to charge from battery if not full
        if (this.currentVoltage < this.maxVoltage) {
            const requestedPower = this.chargeRate;
            const powerDelivered = this.battery.requestPower(
                requestedPower,
                this.battery.voltage
            );

            if (powerDelivered.power > 0) {
                // Calculate energy gained from power delivered
                const energyGained = powerDelivered.power * this.efficiency;
                this.storedEnergy += energyGained;

                // Calculate new voltage based on stored energy
                // Using E = ½CV²
                this.currentVoltage = Math.sqrt((2 * this.storedEnergy) / this.capacitance);
                this.lastChargeTime = Date.now();
            }
        }
    }

    discharge(requestedPower) {
        if (this.storedEnergy <= 0) return 0;

        this.isDischarging = true;
        const maxDischarge = Math.min(
            this.dischargeRate,
            this.storedEnergy,
            requestedPower
        );

        if (maxDischarge > 0) {
            this.storedEnergy -= maxDischarge;
            // Recalculate voltage after discharge
            this.currentVoltage = Math.sqrt((2 * this.storedEnergy) / this.capacitance);
            this.lastDischargeTime = Date.now();
            this.isDischarging = false;
            return maxDischarge * this.efficiency;
        }

        this.isDischarging = false;
        return 0;
    }

    getChargeLevel() {
        const maxEnergy = 0.5 * this.capacitance * (this.maxVoltage * this.maxVoltage);
        return Math.min(this.storedEnergy / maxEnergy, 1);
    }
}
class ComponentPanel {
    constructor(unit) {
        this.unit = unit;
        this.isVisible = false;
        this.setupPanel();
    }

    setupPanel() {
        // Create main container
        this.panel = document.createElement('div');
        this.panel.className = 'tool-panel';
        this.panel.style.cssText = `
            position: fixed;
            left: 600px;
            top: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            min-width: 300px;
            display: none;
        `;

        // Create sections
        this.createSection('Battery', [
            { label: 'Charge', getValue: () => `${(this.unit.powerSupply.storedEnergy / this.unit.powerSupply.storedCapacity * 100).toFixed(1)}%` },
            { label: 'State', getValue: () => this.unit.powerSupply.storedCharge },
            { label: 'Voltage', getValue: () => `${this.unit.powerSupply.voltage.toFixed(1)}V` },
            { label: 'Current', getValue: () => `${this.unit.powerSupply.dischargeRate.toFixed(1)}A` }
        ]);

        this.createSection('Motor', [
            { label: 'Temperature', getValue: () => `${this.unit.motor.temperature.toFixed(1)}°C` },
            { label: 'Efficiency', getValue: () => `${(this.unit.motor.efficiency * 100).toFixed(1)}%` },
            { label: 'Current', getValue: () => `${this.unit.motor.maxCurrent.toFixed(1)}A` },
            { label: 'Power', getValue: () => `${(this.unit.motor.maxVoltage * this.unit.motor.maxCurrent).toFixed(0)}W` }
        ]);

        this.createSection('Capacitor', [
            { label: 'Charge', getValue: () => `${(this.unit.jumpCapacitor.getChargeLevel() * 100).toFixed(1)}%` },
            { label: 'Voltage', getValue: () => `${this.unit.jumpCapacitor.currentVoltage.toFixed(1)}V` },
            { label: 'State', getValue: () => this.unit.jumpCapacitor.isDischarging ? 'Discharging' : 'Charging' },
            { label: 'Energy', getValue: () => `${this.unit.jumpCapacitor.storedEnergy.toFixed(0)}J` }
        ]);

        this.createSection('Transmission', [
            { label: 'Gear', getValue: () => this.unit.transmission.gear },
            { label: 'Ratio', getValue: () => {
                const gear = this.unit.transmission.gearBox[this.unit.transmission.gear];
                return `${gear.motor}:${gear.drive}`;
            }}
        ]);

        // Add keyboard toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F7') {
                e.preventDefault();
                this.toggle();
            }
        });

        document.body.appendChild(this.panel);
    }

    createSection(title, items) {
        const section = document.createElement('div');
        section.className = 'tool-panel-section';
        section.style.marginBottom = '10px';

        const header = document.createElement('h3');
        header.textContent = title;
        header.style.margin = '0 0 5px 0';
        header.style.borderBottom = '1px solid #444';
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'auto auto';
        grid.style.gap = '5px';

        items.forEach(item => {
            const label = document.createElement('div');
            label.textContent = item.label + ':';
            label.style.color = '#888';

            const value = document.createElement('div');
            value.style.textAlign = 'right';
            
            // Store elements for updating
            item.element = value;
            
            grid.appendChild(label);
            grid.appendChild(value);
        });

        section.appendChild(grid);
        this.panel.appendChild(section);

        // Store items for updates
        if (!this.sections) this.sections = {};
        this.sections[title] = items;
    }

    update() {
        if (!this.isVisible) return;

        Object.values(this.sections).forEach(items => {
            items.forEach(item => {
                item.element.textContent = item.getValue();
            });
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.panel.style.display = this.isVisible ? 'block' : 'none';
    }
}