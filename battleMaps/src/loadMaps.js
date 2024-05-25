import { checkFileExists } from "./checkFileExists.js";
import { events } from "./Events.js";

export function loadMaps(array) {
  let mapsData = [];
  for (let i = 0; i < array.length; i++) {
    const mapName = array[i];
    const mapPath = `../assets/maps/${mapName}.tmj`;

    checkFileExists(mapPath).then((exists) => {
      if (exists) {
        fetch(mapPath)
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            const mapData = json;
            const details = { name: mapName, data: mapData };
            events.emit("WORLD_LOADED", details);
            mapsData.push(details);
          });
      } else {
        console.warn(`world not found: ${mapPath}`);
      }
    });
  }
  return mapsData;
}
