function loadGameSound() {
	gameSound = new GameSound();
	gameSound.addAudioAssets();
	console.log("audio loaded");
}

function toggleFullScreen() {
	const isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitIsFullScreen;
	if (isFullscreen) {
	    document.exitFullscreen();
		console.log("full screen exited");
	} else {	
		document.documentElement.requestFullscreen(); 
		console.log("full screen entered");
	
	}
}
function exitFullScreen() {		
	const isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitIsFullScreen;
	if (isFullscreen) {
	    document.exitFullscreen();
		console.log("full screen exited");
	}	
}

function hideSplashScreen() {
	document.getElementById("splash-screen").style.display = "none";	
	document.getElementById("header").style.display = "none"; 
	document.getElementById("footer").style.display = "none"; 	
}
function displaySplashScreen() {
	document.getElementById("splash-screen").style.display = "block"; 
	document.getElementById("header").style.display = "block"; 
	document.getElementById("footer").style.display = "block";		
	console.log("splash screen displayed");	
}

function displayMenuScreen() {
	document.getElementById("main-menu").style.display = "block";
	
	const menuAnimation = textFillAnimation;
	menuAnimation("main-menu-text", "main-menu");
	console.log("main menu screen rendered");
	
}	
function hideMenuScreen() {
	document.getElementById("main-menu").style.display = "none";
}

var player = null;
const playableCharacters = [
	{ id: 0, type: "fighter", name: "Jimbo", icon: "./images/fighter.png", lore1: "&plus; Defense", lore2: "&plus; Stamina",
	  maxHealth: "100", health: "100" 
	  }, 
	{ id: 1, type: "monk", name: "Mark", icon: "./images/monk.png", lore1: "&plus; Srength", lore2: "&plus; Speed" },
	{ id: 2, type: "ranger", name: "Wyatt", icon: "./images/ranger.png", lore1: "&plus; Strength", lore2: "&plus; Charisma" },
	{ id: 3, type: "wizard", name: "Melvin", icon: "./images/wizard.png", lore1: "&plus; Charisma", lore2: "&plus; Speed" },
	{ id: 4, type: "sage", name: "Timothy", icon: "./images/sage.png", lore1: "&plus; Wisdom", lore2: "&plus; Stamina" },
	];	

function displayCharacterSelectionScreen() {
	document.getElementById("character-selection").style.display = "block";
	document.getElementById("character-selection-menu").appendChild(createCharacterSelectionMenu( playableCharacters ));
	if (player === null) {
		playIdleSprite(5);
	}		
	console.log("character-selection screen displayed");	
}
function hideCharacterSelectionScreen() {	
	document.getElementById("character-selection").style.display = "none"; 
}
function updateCharacterSelectionPreview(chosenCharacter) {
	playIdleSprite(chosenCharacter);
	//document.getElementById("character-selection-icon").src = playableCharacters[chosenCharacter].icon;	
	document.getElementById("character-selection-heading").innerHTML = playableCharacters[chosenCharacter].name;
	document.getElementById("character-selection-lore-item-one").innerHTML = playableCharacters[chosenCharacter].lore1;
	document.getElementById("character-selection-lore-item-two").innerHTML = playableCharacters[chosenCharacter].lore2;
	document.getElementById("accept-character-selection-button").style.backgroundColor = "#bcd9f9";
}
function selectCharacter(chosenCharacter) {
	player = playableCharacters[chosenCharacter];
}
function createCharacterSelectionMenu(menuItems) {
	const characterSelectionMenu = document.getElementById("character-selection-menu");
	const children = characterSelectionMenu.children;
	for (let i = 0; i < children.length; i++) {
		characterSelectionMenu.removeChild(children[i]);
	}	
	const ul = document.createElement("ul");
	
	menuItems.forEach((item) => {
		const li = document.createElement("li");
		const anchor = document.createElement("a");

		anchor.textContent = item.type;
		anchor.id = `character-selection-${item.id}`; // unique ID for each anchor		
		anchor.addEventListener("click", () => {
			console.log("user clicked character:" + `${item.id}`);
			gameSound.playEffect("effect2");
			updateCharacterSelectionPreview(`${item.id}`);
			selectCharacter(`${item.id}`);
		});		
		li.appendChild(anchor);
		ul.appendChild(li);
	});
	return ul;
}	
function acceptCharacterSelection() {
	if (player !== null) {
		gameSound.playEffect("effect3");
		hideCharacterSelectionScreen();
		loadPowerSelectionScreenButtons();
		displayPowerSelectionScreen();
	}
	else if (player == null) {
		gameSound.playEffect("effect6");
		console.log("select a character to proceed");
	}	
}

var playerPower = null;
const playablePowers = [
	{ id: 0, type: "wood", name: "Jupiter", icon: "./images/wood.png", lore1: "&gt; Earth", lore2: "&lt; Metal" },
	{ id: 1, type: "fire", name: "Mars", icon: "./images/fire.png", lore1: "&gt; Metal", lore2: "&lt; Water" }, 
	{ id: 2, type: "earth", name: "Saturn", icon: "./images/earth.png", lore1: "&gt; Water", lore2: "&lt; Wood" }, 
	{ id: 3, type: "metal", name: "Venus", icon: "./images/metal.png", lore1: "&gt; Wood", lore2: "&lt; Fire" }, 
	{ id: 4, type: "water", name: "Mercury", icon: "./images/water.png", lore1: "&gt; Fire", lore2: "&lt; Earth" },
	];

function displayPowerSelectionScreen() {
	document.getElementById("power-selection").style.display = "block";
	document.getElementById("power-selection-menu").appendChild(createPowerSelectionMenu( playablePowers ));
	console.log("power-selection screen displayed");	
}
function hidePowerSelectionScreen() {
	document.getElementById("power-selection").style.display = "none"; 		
}
function updatePowerSelectionPreview(chosenPower) {
	document.getElementById("power-selection-icon").src = playablePowers[chosenPower].icon;	
	document.getElementById("power-selection-heading").innerHTML = playablePowers[chosenPower].name;
	document.getElementById("power-selection-lore-item-one").innerHTML = playablePowers[chosenPower].lore1;
	document.getElementById("power-selection-lore-item-two").innerHTML = playablePowers[chosenPower].lore2;	
	document.getElementById("accept-power-selection-button").style.backgroundColor = "#bcd9f9";
	console.log("power-selection-preview updated");
}	
function selectPower(chosenPower) {
	playerPower = chosenPower;			
}
function createPowerSelectionMenu(menuItems) {
	const powerSelectionMenu = document.getElementById("power-selection-menu");
	const children = powerSelectionMenu.children;
	for (let i = 0; i < children.length; i++) {
		powerSelectionMenu.removeChild(children[i]);
	}	
	const ul = document.createElement("ul");

	menuItems.forEach((item) => {
		const li = document.createElement("li");
		const anchor = document.createElement("a");

		anchor.textContent = item.type;
		anchor.id = `power-selection-${item.id}`; // unique ID for each anchor
		anchor.addEventListener("click", () => {
		    console.log("user clicked power:" + `${item.id}`);
		    gameSound.playEffect("effect2");
		    updatePowerSelectionPreview(`${item.id}`);
		    selectPower(`${item.id}`);
		});
		li.appendChild(anchor);
		ul.appendChild(li);
	});
  
	return ul;
}
function acceptPowerSelection() {
	if (playerPower !== null) {
		gameSound.playEffect("effect3");
		gameSound.stopTheme("theme2");
		gameSound.playTheme("theme3");
		hidePowerSelectionScreen();
		loadBattlePreviewScreenButtons();
		displayBattlePreviewScreen();
	}
	else if (playerPower == null) {
		gameSound.playEffect("effect6");
		console.log("select a power to proceed");
			
	}		
}

function displayBattlePreviewScreen() {
	document.getElementById("prepare-battle").style.display = "block";	
	console.log("prepare-battle screen displayed");	
	
}
function hideBattlePreviewScreen() {
	document.getElementById("prepare-battle").style.display = "none";	
}

function displayArenaBattleScreen() {
	document.getElementById("battle-screen").style.display = "block";	
	console.log("arena-battle screen displayed");	
}

// BUTTONS
const loadStartGameButton = () => {
  const startGameButton = document.getElementById("start-game-button");

  startGameButton.addEventListener("click", () => {
    loadGameSound();
    loadMainMenuButtons();
    gameSound.playTheme("theme5");
    gameSound.playEffect("effect3");
    hideSplashScreen();
    displayMenuScreen();
    console.log("user clicked: " + "play game");
  });
};

function loadMainMenuButtons() {
  const startTestButton = document.getElementById("start-test-button");
  startTestButton.addEventListener("click", () => {
    console.log("user clicked: " + "startTestButton");
    toggleFullScreen();
  });

  const exitGameButton = document.getElementById("exit-game-button");
  exitGameButton.addEventListener("click", () => {
    console.log("user clicked: " + "exitGameButton");
    gameSound.stopTheme("theme5");
    hideMenuScreen();
    displaySplashScreen();
    exitFullScreen();
  });

  const startArenaButton = document.getElementById("start-arena-button");
  startArenaButton.addEventListener("click", () => {
    console.log("user clicked: " + "startArenaButton");
    gameSound.stopTheme("theme5");
    gameSound.playTheme("theme2");
    gameSound.playEffect("effect3");
    hideMenuScreen();	
    loadCharacterSelectionScreenButtons();
    displayCharacterSelectionScreen();
  });
}

function loadCharacterSelectionScreenButtons() {
  const cancelCharacterSelectionButton = document.getElementById("cancel-character-selection-button");
  cancelCharacterSelectionButton.addEventListener("click", () => {
    console.log("user clicked: " + "cancelCharacterSelectionButton");
    gameSound.stopTheme("theme2");
    gameSound.playTheme("theme5");
    gameSound.playEffect("effect4");
    hideCharacterSelectionScreen();	
    displayMenuScreen();
  });

  const acceptCharacterSelectionButton = document.getElementById("accept-character-selection-button");
  acceptCharacterSelectionButton.addEventListener("click", acceptCharacterSelection); 
  
}

function loadPowerSelectionScreenButtons() {
  const cancelPowerSelectionButton = document.getElementById("cancel-power-selection-button");
  cancelPowerSelectionButton.addEventListener("click", () => {
    console.log("user clicked: " + "cancelPowerSelectionButton");
    gameSound.playEffect("effect4");
    hidePowerSelectionScreen();	
    displayCharacterSelectionScreen();
  });

  const acceptPowerSelectionButton = document.getElementById("accept-power-selection-button");
  acceptPowerSelectionButton.addEventListener("click", acceptPowerSelection);
}

function loadBattlePreviewScreenButtons() {
  const cancelBattlePreviewButton = document.getElementById("cancel-battle-preview-button");
  cancelBattlePreviewButton.addEventListener("click", () => {
    console.log("user clicked: " + "cancelBattlePreviewButton");
    gameSound.stopTheme("theme3");
    gameSound.playTheme("theme2");
    gameSound.playEffect("effect4");
    hidePowerSelectionScreen();    
	displayPowerSelectionScreen();
  });

  const beginArenaBattleButton = document.getElementById("begin-arena-battle-button");
  beginArenaBattleButton.addEventListener("click", () => {
    console.log("user clicked: " + "beginArenaBattleButton");
    gameSound.stopTheme("theme3");
    gameSound.playTheme("theme4");
    gameSound.playEffect("effect3");
    hideBattlePreviewScreen();
    displayArenaBattleScreen();
  });
}
	


