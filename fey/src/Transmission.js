export class Transmission {
  constructor() {
    this.gearBox = {
      1: { drive: 1, motor: 2 }, // low
      2: { drive: 1, motor: 1 }, // direct
      3: { drive: 2, motor: 1 }, // overdrive
    };
    this.gear = 2;
  }
}
