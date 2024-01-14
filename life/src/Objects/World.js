// **World Class**
//
// Represents the overall simulation world, managing cells and their interactions.
//
// **Key Properties:**
//
// - position: Vector2 representing the world's position in the game space.
// - cellsSnapshot: Array of Cell objects representing individual cells.
// - populationStats: Object containing population statistics (mean, mode, min, max, total, percentAlive).
// - stage: Integer indicating the current simulation stage (0 for initial setup).
// - worldSize: Integer specifying the total number of cells in the world.
// - statsRefreshRate: Time interval in milliseconds between updating population statistics.
// - statsRefreshTimer: Timer for tracking the next stats update.
//
// **Key Methods:**
//
// - constructor(x, y): Initializes the world with the given position.
// - createArray(): Creates the grid of cells based on the world size and 16:9 aspect ratio.
// - stats(): Calculates and updates population statistics asynchronously.
// - step(delta): Handles world updates, including cell behavior and periodic statistics calculation.
//
// **Method Breakdown:**
//
// - **constructor:**
//     - Creates a new GameObject as the base for the world.
//     - Sets position, cellsSnapshot, populationStats, stage, worldSize, statsRefreshRate, and statsRefreshTimer properties.
//     - Listens for the "START_SIM" event to trigger cell creation.
//
// - **createArray:**
//     - Calculates grid dimensions to maintain a 16:9 aspect ratio while accommodating the worldSize.
//     - Iterates through grid positions and creates Cell objects, adding them as children of the world.
//
// - **stats:**
//     - Creates a Promise for asynchronous processing of generation data.
//     - Collects generation values, age counts, and total age for living cells.
//     - Resolves the Promise with collected data.
//     - (Outside the Promise) Waits for Promise resolution and calculates remaining statistics:
//         - Living cell count
//         - Mode generation
//         - Mean generation
//         - Minimum and maximum generations
//         - Percentage of alive cells
//     - Updates the populationStats object with calculated values.
//
// - **step:**
//     - Decrements the statsRefreshTimer if active.
//     - If the timer reaches zero:
//         - Resets the timer to the statsRefreshRate.
//         - Calls the stats() method to update population statistics.
import { Vector2 } from "../Vector2.js";
import { events } from "../Events.js";
import { GameObject } from "../GameObject.js";
import { gridSize } from "../helpers/grid.js";
import { Cell } from "./Cell.js"; 
export class World extends GameObject { 
  constructor(x, y) {
    super({});
    this.position = new Vector2(x, y);
    this.cellsSnapshot = [];
    this.populationStats = [];
    this.stage = 0;
    this.worldSize = 3600;
    this.statsRefreshRate = 901;
    this.statsRefreshTimer = 0;
        
    events.on("START_SIM", this, () => {
      this.createArray();
    })    
    
  }
  createArray() {
    // Calculate grid dimensions for a 16:9 aspect ratio
    const size = this.worldSize;
    const width = Math.floor(Math.sqrt(size * 16 / 9)); // Prioritize width for 16:9
    const height = Math.floor(size / width);

    let cellId = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const posX = x * gridSize;
        const posY = y * gridSize;
        this.addChild(new Cell(posX, posY, cellId, width, size));
        cellId++;
      }
    }
  };
  async stats() {
    const generationPromise = new Promise((resolve) => {
      const generationValues = [];
      const ageCounts = {};
      let ageSum = 0;
      
      for (const child of this.cellsSnapshot) {
        const state = child.state;
        if (state > 1) {
          const age = state -1;
          generationValues.push(age);
          ageCounts[age] = (ageCounts[age] || 0) + 1;
          ageSum += age;
        }
      }
      resolve({ generationValues, ageCounts, ageSum });
    });

    // Perform other tasks while generationPromise is being processed
    // ... (do other things here)

    // Wait for generation data and calculate remaining stats
    const { generationValues, ageCounts, ageSum } = await generationPromise;
    const living = generationValues.length;
    const modeGeneration = Object.entries(ageCounts).reduce((maxAge, [age, count]) => count > maxAge[1] ? [age, count] : maxAge, [0, 0])[0];
    const meanGeneration = ageSum / living;
    const minGeneration = Math.min(...generationValues);
    const maxGeneration = Math.max(...generationValues);
    const percentAlive = (living / this.worldSize) * 100;
    this.populationStats = {
      mean: meanGeneration,
      mode: modeGeneration,
      min: minGeneration,
      max: maxGeneration,
      total: living,
      percent: percentAlive,
    };
  }
  step(delta, root) {
    if (this.statsRefreshTimer > 0) {
      this.statsRefreshTimer -= delta
    } else {
      this.statsRefreshTimer += this.statsRefreshRate;
      this.stats();
    }
  }  
}