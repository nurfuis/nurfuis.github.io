// ANIMATION
// textFillAnimation fills text into a container 1 character
// at a time. It clickFastFillhas an adjustable rate of fire and will stop 
// playing the sound and animation if the screens are changed.
let clickArea = "main-menu-text-box";
let fillText = "Welcome to the battle tower, where tough competitors await your challenge! Choose your character, select your power, and start battling. But be warned, there are strong opponents around every corner. Can you survive the melee and become a champion?";
let textIsPlaying = false;

function textFillAnimation(elementId, screenId) {
	const textElement = document.getElementById(elementId);

	if (textIsPlaying) {
		return;
	}
	textIsPlaying = true;
	const animationScreen = document.getElementById(screenId);
	const screenDisplay = getComputedStyle(animationScreen) 
	const characterLimit = 190;
	var i = 0;
	var delay = 50;

	// Sound
	const textFillSoundEffect = "effect7";
	gameSound.playEffect(textFillSoundEffect);
	
	// Clear Text Box
	textElement.innerHTML = "";
	
	// Fast fill
	
	textElement.addEventListener("click", () => { delay = 0 });
	
	// Fill Text
	function addNextLetterToTextBox(){
		if (i < fillText.length){
			if ( screenDisplay.display === "none" ) {
				// Sound
				gameSound.stopEffect(textFillSoundEffect);
			}
			if (textElement.innerText.length >= characterLimit) {
				textElement.innerText = "-" + textElement.innerText.substring(characterLimit / 5);
			}	
			textElement.innerHTML += fillText[i];
			i+= 1;
			// Get a random number between 100 and 300 milliseconds
			// delay = Math.floor(Math.random() * (70 - 35) + 36);
			setTimeout(addNextLetterToTextBox, delay);
			if (i === fillText.length) {
				gameSound.stopEffect(textFillSoundEffect);
				textIsPlaying = false;
			}			
		}
	}
	addNextLetterToTextBox();
};

