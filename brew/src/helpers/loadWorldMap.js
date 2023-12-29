// loadWorldMap.js
import {checkFileExists } from "./checkFileExists.js";
import { events } from "../Events.js";

export function loadWorldMap(worlds) {
  for (let i = 0; i < worlds.length; i++) {
    const worldName = worlds[i];
    const worldPath = `./src/levels/${worldName}/world.world`;
    checkFileExists(worldPath)
      .then(exists => {
        if (exists) {
          // File exists, go ahead with fetch
          fetch(worldPath)
            .then((response) => {
              return response.json();
            })
            .then((json) => {
              const worldMap = json;
              events.emit("WORLD_LOADED", {map: worldMap, world: worldName})                 
            });
        } else {
          // File doesn't exist, handle missing file scenario
          console.warn(`world not found: ${worldPath}`);
        }
      });
  }        
}