const debug = false;

function loadResources() {
  let images = {};
  let imageList = {
    keg: "/fey/assets/sprites/woodenKeg.png",
    grainBag: "/fey/assets/sprites/grainBag.png",
    air: "/fey/assets/sprites/air.png",
    tileSet: "/fey/assets/sprites/base.png",
    player: "/fey/assets/sprites/player.png",
    shadow: "/fey/assets/sprites/shadow.png",
  };

  Object.keys(imageList).forEach((key) => {
    const img = new Image();
    img.src = imageList[key];

    if (debug) {
      console.log("Loading image:", imageList[key]);
    }

    images[key] = {
      image: img,
      isLoaded: false,
      width: null,
      height: null,
    };

    img.onload = () => {
      images[key].isLoaded = true;
      if (Object.values(images).every((image) => image.isLoaded)) {
      }
    };
  });
  return { images: images, sounds: null };
}
export const resources = new loadResources();
