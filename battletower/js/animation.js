// ANIMATION

// textFillAnimation fills text into a container 1 character
// at a time. It has an adjustable rate of fire and will stop 
// playing the sound and animation if the screens are changed.
let fillText = null;
function textFillAnimation(elementId, screenId) {
	const animationBox = document.getElementById(elementId);
	if (fillText === null) {
		fillText = animationBox.textContent;		
	}
	const animationScreen = document.getElementById(screenId);
	const screenDisplay = getComputedStyle(animationScreen) 
	const characterLimit = 190;
	var i = 0;
	var delay = 5;

	// Sound
	const textFillSoundEffect = "effect7";
	gameSound.playEffect(textFillSoundEffect);
	
	// Clear Text Box
	animationBox.innerHTML = "";
	
	// Fill Text
	function addNextLetterToTextBox(){
		if (i < fillText.length){
			if ( screenDisplay.display === "none" ) {
				// Sound
				gameSound.stopEffect(textFillSoundEffect);
				return;
			}
			if (animationBox.innerText.length >= characterLimit) {
				animationBox.innerText = "-" + animationBox.innerText.substring(characterLimit / 5);
			}	
			animationBox.innerHTML += fillText[i];
			i+= 1;
			// Get a random number between 100 and 300 milliseconds
			delay = Math.floor(Math.random() * (70 - 35) + 36);
			setTimeout(addNextLetterToTextBox, delay);
			if (i === fillText.length) {
				gameSound.stopEffect(textFillSoundEffect);
			}			
		}
	}
	addNextLetterToTextBox();
};

