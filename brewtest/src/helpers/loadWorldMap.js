// loadWorldMap.js
import {checkFileExists } from "./checkFileExists.js";
import { events } from "../Events.js";

export function loadWorldMap() {
    const worldPath = `./src/levels/1/world.world`;
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
              events.emit("WORLD_LOADED", worldMap)                 
            });
        } else {
          // File doesn't exist, handle missing file scenario
          console.warn(`World not found: ${worldPath}`);
        }
      });    
}