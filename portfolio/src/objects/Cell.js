// **Cell Class**
//
// Represents a single cell within a cellular automaton simulation.
//
// **Key Properties:**
//
// - position: Vector2 representing the cell's position in the grid.
// - cellId: Unique identifier for the cell.
// - gridWidth: Width of the grid world.
// - gridArrayLength: Total number of cells in the world.
// - neighborIds: Array of IDs for neighboring cells.
// - interval: Time interval between applying cellular automaton rules.
// - lastUpdateTime: Time since last rule application.
// - respawnDelay: Time it takes for a depleted cell to respawn.
// - resourceRespawnTimer: Timer for resource respawning.
// - growth: Probability of cell growth and reproduction.
// - capacity: Maximum number of generations a cell can produce.
// - generations: Number of generations the cell has already produced.
// - canMutate: Whether the cell can randomly change its type.
// - cellType: Integer representing the cell's type (0-15).
// - state: Integer representing the cell's current state (0=depleted, 1=resource, 2-9=alive).
// - body: Sprite object for visual representation.
//
// **Key Methods:**
//
// - getNeighborIds(): Calculates and returns IDs of neighboring cells.
// - setCellFrame(): Sets the cell's visual frame based on type and state.
// - ready(): Initializes a new cell's state and frame.
// - cellRestore(delta): Handles resource respawn timer for depleted cells.
// - mutation(): Randomly changes cell type if mutation is enabled.
// - repopulate(): Attempts to create a new cell based on growth probability.
// - depleteCell(): Sets cell to a depleted state and starts the respawn timer.
// - createDeadSpot(): Depletes neighboring cells and triggers their mutation.
// - applyRules(): Applies cellular automaton rules to determine the cell's next state.
// - workOnRules(delta): Manages timing for rule application.
// - step(delta): Handles cell updates based on their state and timers.
//
// **Additional Notes:**
//
// - The code supports keyboard events for adjusting cell properties (growth, mutation, etc.).
// - The `frameLookupTable` constant maps cell types to animation frames.
// - The `growthDenominator` constant controls growth probability.

import { Vector2 } from "../Vector2.js";
import { events } from "../Events.js";
import { GameObject } from "../GameObject.js";
import { Sprite } from "../Sprite.js";
import { resources } from "../utils/loadResources.js";
const frameLookupTable = {
  0: [0, 1, 2, 12, 13, 14, 24, 25, 26],
  1: [3, 4, 5, 15, 16, 17, 27, 28, 29],
  2: [6, 7, 8, 18, 19, 20, 30, 31, 32],
  3: [9, 10, 11, 21, 22, 23, 33, 34, 35],
  4: [36, 37, 38, 48, 49, 50, 60, 61, 62],
  5: [39, 40, 41, 51, 52, 53, 63, 64, 65],
  6: [42, 43, 44, 54, 55, 56, 66, 67, 68],
  7: [45, 46, 47, 57, 58, 59, 69, 70, 71],
  8: [72, 73, 74, 84, 85, 86, 96, 97, 98],
  9: [75, 76, 77, 87, 88, 89, 99, 100, 101],
  10: [78, 79, 80, 90, 91, 92, 102, 103, 104],
  11: [81, 82, 83, 93, 94, 95, 105, 106, 107],
  12: [108, 109, 110, 120, 121, 122, 132, 133, 134],
  13: [111, 112, 113, 123, 124, 125, 135, 136, 137],
  14: [114, 115, 116, 126, 127, 128, 138, 139, 140],
  15: [117, 118, 119, 129, 130, 131, 141, 142, 143],
};
const growthDenominator = 1000;
export class Cell extends GameObject {
  constructor(x, y, id, worldWidth, worldSize) {
    super({});
    this.position = new Vector2(x, y);
    this.cellId = id;

    this.gridWidth = worldWidth;
    this.gridArrayLength = worldSize;

    this.neighborhood = "moore";
    this.neighborIds = this.getMooreNeighborIds();

    this.canMutate = false;

    this.interval = 1000;
    this.lastUpdateTime = 0;

    this.respawnDelay = 0;
    this.resourceRespawnTimer = 0;

    this.growth = 1;

    this.capacity = -1;
    this.generations = 0;

    this.cellType = 10;
    this.state = 0;

    this.body = new Sprite({
      resource: resources.images.cellsSheet,
      frameSize: new Vector2(16, 16),
      padding: 8,
      hFrames: 12,
      vFrames: 12,
      scale: 1,
      frame: 0,
      position: new Vector2(0, 0),
    });
    this.addChild(this.body);

    events.on("INTERVAL_UP", this, () => {
      this.interval += 10;
    });
    events.on("INTERVAL_DOWN", this, () => {
      if (this.interval > 100) {
        this.interval -= 10;
      }
    });
    events.on("RESPAWN_DELAY_UP", this, () => {
      this.respawnDelay += 10;
    });
    events.on("RESPAWN_DELAY_DOWN", this, () => {
      if (this.respawnDelay > 0) {
        this.respawnDelay -= 10;
      }
    });
    events.on("GROWTH_UP", this, () => {
      if (this.growth < growthDenominator) {
        this.growth += 1;
      }
    });
    events.on("GROWTH_DOWN", this, () => {
      if (this.growth > 0) {
        this.growth -= 1;
      }
    });
    events.on("CAPACITY_UP", this, () => {
      this.capacity += 1;
    });
    events.on("CAPACITY_DOWN", this, () => {
      if (this.capacity > -1) {
        this.capacity -= 1;
      }
    });
    events.on("TOGGLE_MUTATIONS", this, () => {
      this.canMutate = !this.canMutate;
    });
    events.on("CYCLE_NEIGHBORHOODS", this, () => {
      this.handleNeighborhoodCycle();
    });
    events.on("TERMINATE", this, () => {
      this.generations = 0;
      this.depleteCell();
    });
    events.on("CORRUPT", this, () => {
      if (Math.random() < this.growth / growthDenominator) {
        this.depleteCell();
        this.createDeadSpot();
      }
    });
    events.on("SET_CELL_TYPE_ONE", this, () => {
      if (!this.canMutate) {
        this.cellType = 0;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_TWO", this, () => {
      if (!this.canMutate) {
        this.cellType = 1;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_THREE", this, () => {
      if (!this.canMutate) {
        this.cellType = 2;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_FOUR", this, () => {
      if (!this.canMutate) {
        this.cellType = 3;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_FIVE", this, () => {
      if (!this.canMutate) {
        this.cellType = 4;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_SIX", this, () => {
      if (!this.canMutate) {
        this.cellType = 5;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_SEVEN", this, () => {
      if (!this.canMutate) {
        this.cellType = 6;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_EIGHT", this, () => {
      if (!this.canMutate) {
        this.cellType = 7;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_NINE", this, () => {
      if (!this.canMutate) {
        this.cellType = 8;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_TEN", this, () => {
      if (!this.canMutate) {
        this.cellType = 9;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_ELEVEN", this, () => {
      if (!this.canMutate) {
        this.cellType = 10;
        this.setCellFrame();
      }
    });
    events.on("SET_CELL_TYPE_TWELVE", this, () => {
      if (!this.canMutate) {
        this.cellType = 11;
        this.setCellFrame();
      }
    });
  }
  getVonNeumannNeighborIds() {
    const width = this.gridWidth;
    const arrayLength = this.gridArrayLength;

    const offsets = [
      -1, // 0 west
      1, // 1 east
      -width, // 2 north
      width, // 3 south
    ];

    return offsets.map((offset) => this.cellId + offset);
  }
  getMooreNeighborIds() {
    const width = this.gridWidth;
    const arrayLength = this.gridArrayLength;

    const offsets = [
      -1, // 0 west
      1, // 1 east
      -width, // 2 north
      width, // 3 south
      -width - 1, // 4 northeast
      -width + 1, // 5 northwest
      width - 1, // 6 southwest
      width + 1, // 7 southeast
    ];

    return offsets.map((offset) => this.cellId + offset);
  }
  getExtendedNeighborIds() {
    const width = this.gridWidth;
    const arrayLength = this.gridArrayLength;

    const offsets = [
      -1, // 0 west
      1, // 1 east
      -width, // 2 north
      width, // 3 south
      -width - 1, // 4 northeast
      -width + 1, // 5 northwest
      width - 1, // 6 southwest
      width + 1, // 7 southeast
      -2, // 8 two west
      2, // 9 two east
      -width * 2, // 10 two north
      width * 2, // 11 two south
    ];

    return offsets.map((offset) => this.cellId + offset);
  }
  handleNeighborhoodCycle() {
    const methods = ["vonNeumann", "moore", "extended"];
    const currentIndex = methods.indexOf(this.neighborhood);
    const nextIndex = (currentIndex + 1) % methods.length;

    this.neighborhood = methods[nextIndex];
    switch (this.neighborhood) {
      case "vonNeumann":
        this.neighborIds = this.getVonNeumannNeighborIds();
        break;

      case "moore":
        this.neighborIds = this.getMooreNeighborIds();
        break;

      case "extended":
        this.neighborIds = this.getExtendedNeighborIds();
        break;

      default:
        this.neighborIds = this.getMooreNeighborIds();
    }
  }
  setCellFrame() {
    const cellBody = frameLookupTable[this.cellType];
    const frameId = this.state > 8 ? 8 : this.state;
    const cellFrame = cellBody[frameId];
    this.body.frame = cellFrame;
  }
  ready() {
    this.lastUpdateTime = this.interval;
    this.setCellFrame();
  }
  cellRestore(delta) {
    if (this.resourceRespawnTimer > 0) {
      this.resourceRespawnTimer -= delta;
    }
    if (this.resourceRespawnTimer <= 0) {
      this.state = 1;
      this.setCellFrame();
    }
  }
  mutation() {
    if (this.canMutate && Math.random() < this.growth / growthDenominator) {
      this.cellType = (this.cellType + 1) % 12; // Wrap around from 11 to 0
      this.setCellFrame();
    }
  }
  repopulate() {
    this.generations++;

    if (Math.random() < this.growth / growthDenominator) {
      this.state = 2;
      this.setCellFrame();
      this.mutation();
    }
  }
  depleteCell() {
    this.state = 0;
    this.setCellFrame();
    this.resourceRespawnTimer = this.respawnDelay;
  }
  createDeadSpot() {
    const cellsArray = this.parent.cellsSnapshot;
    
    for (const neighborId of this.neighborIds) {
      const neighborCell = cellsArray[neighborId];
      if (neighborCell) {
        neighborCell.depleteCell();
        neighborCell.mutation();
      }
    }
  }
  ageCorrelatedDrift() {
    const cellReference = this.parent.children[neighborId];

    if (
      neighborCell.state === 1 &&
      this.state === 2 &&
      i === 0 &&
      Math.random() < 0.5
    ) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }

    if (
      neighborCell.state === 1 &&
      this.state === 3 &&
      i === 0 &&
      Math.random() < 0.4
    ) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }

    if (
      neighborCell.state === 1 &&
      this.state === 4 &&
      i === 0 &&
      Math.random() < 0.3
    ) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }

    if (
      neighborCell.state === 1 &&
      this.state === 5 &&
      i === 1 &&
      Math.random() < 0.3
    ) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }

    if (
      neighborCell.state === 1 &&
      this.state === 6 &&
      i === 1 &&
      Math.random() < 0.4
    ) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }

    if (
      neighborCell.state === 1 &&
      this.state === 7 &&
      i === 1 &&
      Math.random() < 0.5
    ) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }

    if (neighborCell.cellId === 666) {
      cellReference.createDeadSpot();
    }
    // if (this.state >= 3 && neighbor === 0) {

    // cellReference.state = this.state;
    // cellReference.setCellFrame();

    // this.state = 1;
    // this.setCellFrame();
    // }
    if (neighborCell.state === 1 && this.state >= 4 && i === 2) {
      cellReference.state = this.state;
      cellReference.setCellFrame();

      this.state = 1;
      this.setCellFrame();
    }
  }
  applyRules() {
    this.lastUpdateTime = this.interval;

    const cellsArray = this.parent.cellsSnapshot;
    const numberOfNeighbors = this.neighborIds.length;

    let numberOfAliveNeighbors = 0;

    for (let neighbor = 0; neighbor < numberOfNeighbors; neighbor++) {
      let neighborId = this.neighborIds[neighbor];

      if (neighborId < 0) {
        if (neighborId < -cellsArray.length) {
          neighborId = neighborId + cellsArray.length * 2;
        } else {
          neighborId = neighborId + cellsArray.length;
        }
      }

      if (neighborId > cellsArray.length) {
        if (neighborId > cellsArray.length * 2) {
          neighborId = neighborId - cellsArray.length * 2;
        } else {
          neighborId = neighborId - cellsArray.length;
        }
      }

      if (neighborId > 0 && neighborId < cellsArray.length) {
        const neighborCell = cellsArray[neighborId];

        const cellReference = this.parent.children[neighborId];

        if (neighborCell.state > 1 && neighborCell.cellType === this.cellType) {
          numberOfAliveNeighbors++;
        }
      }
    }

    if (this.state > 1) {
      if (numberOfAliveNeighbors < 2 || numberOfAliveNeighbors > 3) {
        this.depleteCell();
      } else {
        this.state++;
        this.setCellFrame();
      }
    } else {
      if (numberOfAliveNeighbors === 3) {
        this.repopulate();
      }
    }
  }
  workOnRules(delta) {
    this.lastUpdateTime -= delta;
    if (this.lastUpdateTime <= 0) {
      this.applyRules();
    }
  }
  step(delta, root) {
    if (this.state === 0) {
      this.cellRestore(delta);
    }

    if (
      (this.state === 1 && this.generations < this.capacity) ||
      (this.state === 1 && this.capacity === -1)
    ) {
      this.repopulate();
    }

    if (this.lastUpdateTime > 0) {
      this.workOnRules(delta);
    }
  }
}
