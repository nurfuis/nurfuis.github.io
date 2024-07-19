const debug = true;

export async function loadMap() {
  const mapPath = "./world.tmj";

  if (debug) {
    console.log("Loading map:", mapPath);
  }

  try {
    const response = await fetch(mapPath);
    if (!response.ok) {
      throw new Error(`Error fetching map: ${response.statusText}`);
    }
    const mapData = await response.json();
    return mapData;
  } catch (error) {
    console.error("Error loading map:", error);
    return null;
  }
}
