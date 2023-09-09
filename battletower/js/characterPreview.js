const idleSpriteList = [ "./sprites/dwarf.png", "./sprites/dwarf1.png","./sprites/dwarf2.png","./sprites/dwarf3.png","./sprites/dwarf4.png", "./sprites/waitingInput.png",];

let img = new Image();
let canvas = document.getElementById("character-selection-icon");
let ctx = canvas.getContext('2d');

const scale = 1;
const width = 128;
const height = 128;
const scaledWidth = scale * width;
const scaledHeight = scale * height;

const cycleLoop = [0, 1];
let currentLoopIndex = 0;
let frameCount = 0;

let isPlaying = false;	

function drawFrame(frameX, frameY, canvasX, canvasY) {
  ctx.drawImage(img,
                frameX * width, frameY * height, width, height,
                canvasX, canvasY, scaledWidth, scaledHeight);
}

function charPreview() {
  frameCount++;

  if (frameCount < 30) {
    window.requestAnimationFrame(charPreview);
    return;
  }
  frameCount = 0;

  if (isPlaying) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrame(cycleLoop[currentLoopIndex], 0, 0, 0);
    currentLoopIndex++;
    if (currentLoopIndex >= cycleLoop.length) {
      currentLoopIndex = 0;
    }
    window.requestAnimationFrame(charPreview);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	currentLoopIndex = 0;
	frameCount = 0;
  }
}

function playIdleSprite(characterId) {
	if (isPlaying) {
	  img.src = idleSpriteList[characterId];
		
	} else {
	  img.src = idleSpriteList[characterId];
	  isPlaying = true;
      window.requestAnimationFrame(charPreview);
	}
}
