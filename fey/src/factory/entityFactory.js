import { handleProperty } from "./handleProperty.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { resources } from "../utils/loadResources.js";
function findMatchingTileset(tileSets, gid) {
  for (let i = 0; i < tileSets.length; i++) {
    const data = tileSets[i];

    if (
      gid >= data["firstgid"] &&
      (i + 1 === tileSets.length || gid < tileSets[i + 1]["firstgid"])
    ) {
      return data["source"];
    }
  }
  return null;
}
export function entityFactory(pkg, newEntity) {
  const newPosition = new Vector2(pkg.data.x, pkg.data.y);
  // console.log(pkg);
  newEntity.position = newPosition;
  newEntity.gid = pkg.data.gid;
  newEntity.name = pkg.data.name;
  newEntity.width = pkg.data.width;
  newEntity.height = pkg.data.height;
  newEntity.visible = pkg.data.visible;
  newEntity.rotation = pkg.data.rotation;

  const shadow = new Sprite({
    resource: resources.images.shadow,
    frameSize: new Vector2(32, 32),
    position: new Vector2(1, -16),
    scale: 2,
  });
  newEntity.shadow = shadow;
  
  const tileSet = findMatchingTileset(pkg.tileSets, pkg.data.gid);
  const body = new Sprite({
    resource: tileSet,
    frameSize: new Vector2(pkg.data.width, pkg.data.height),
    hFrames: tileSet.width / pkg.data.width,
    vFrames: tileSet.height / pkg.data.height,
  });
  newEntity.body = body;

  if (pkg.data.properties) {
    for (let i = 0; i < pkg.data.properties.length; i++) {
      const property = pkg.data.properties[i];
      const propertyName = property.name;
      const propertyValue = property.value;
      handleProperty(propertyName, propertyValue, newEntity);
    }
  }

  newEntity.addChild(shadow);

  newEntity.body.buildFrameMap();
  newEntity.addChild(newEntity.body);
  // console.log(newEntity);
  return newEntity;
}
