import { propertyHandlers } from "./propertyHandlers.js";

const debug = true;

export function handleProperty(propertyName, propertyValue, newEntity) {
  const handler = propertyHandlers[propertyName];
  if (handler) {
    if (debug) {
      console.log(propertyName, propertyValue);
    }
    handler(newEntity, propertyValue);
  } else {
    console.warn(
      "warn",
      `${newEntity.name}`,
      `Unknown property: ${propertyName}`
    );
  }
}
