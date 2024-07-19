export class Battery {
  constructor() {
    this.storedEnergy = 120000;
    this.storedCapacity = 120000; // mHa
    this.floatStage = 0.95;
    this.absorptionStage = 0.8;
    this.lowStage = 0.5;
    this.criticalStage = 0.2;
    this.dischargeRate = 40; // Amps
    this.voltage = 6; // Volts
    this.dropoff = {
      float: 1,
      absorb: 0.9,
      bulk: 0.8,
      low: 0.8,
      critical: 0.5,
      discharged: 0,
    };
  }
  drawPower(acceleration) {
    if (acceleration.x != 0 || acceleration.y != 0) {
      const cost = Math.abs(acceleration.x + acceleration.y);
      this.storedEnergy -= cost;
    }
  }
  checkState() {
    if (
      this.storedEnergy >=
      this.storedCapacity * this.floatStage
    ) {
      this.storedCharge = "float";
    } else if (
      this.storedEnergy < this.storedCapacity &&
      this.storedEnergy >=
        this.storedCapacity * this.absorptionStage
    ) {
      this.storedCharge = "absorb";
    } else if (
      this.storedEnergy <
        this.storedCapacity * this.absorptionStage &&
      this.storedEnergy >
        this.storedCapacity * this.lowStage
    ) {
      this.storedCharge = "bulk";
    } else if (
      this.storedEnergy <
        this.storedCapacity * this.lowStage &&
      this.storedEnergy >
        this.storedCapacity * this.criticalStage
    ) {
      this.storedCharge = "low";
    } else if (
      this.storedEnergy <
        this.storedCapacity * this.criticalStage &&
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
}
