function initializeEventListeners() {
    



    document.getElementById('damage-button').addEventListener('click', () => {
        const currentUnit = turnOrder[currentTurnIndex];
        takeDamage(currentUnit, 10);
    });

    document.getElementById('heal-button').addEventListener('click', () => {
        const currentUnit = turnOrder[currentTurnIndex];
        heal(currentUnit, 10);
    });

    document.getElementById('menu-button').addEventListener('click', () => {
        gameInterface.style.display = 'none';
        menu.style.display = 'flex';
        if (gameStarted) {
            startButton.textContent = 'Resume Game';
        }
    });






    document.getElementById('exit-button').addEventListener('click', () => {
        menu.style.display = 'none';
        splashScreen.style.display = 'flex';
        introAudio.pause();
        introAudio.currentTime = 0;
    });


    startButton.addEventListener('click', () => {
        menu.style.display = 'none';
        gameInterface.style.display = 'flex';
        introAudio.play();
        if (!gameStarted) {
            startGameLoop();
            gameStarted = true;
        }
    });

    // Hide options menu and show main menu on back button click
    document.getElementById('back-button').addEventListener('click', () => {
        optionsMenu.style.display = 'none';
        menu.style.display = 'flex';
    });

    // Show options menu on options button click
    document.getElementById('options-button').addEventListener('click', () => {
        menu.style.display = 'none';
        optionsMenu.style.display = 'flex';
    });



    splashScreen.addEventListener('click', () => {
        splashScreen.style.display = 'none';
        menu.style.display = 'flex';
        introAudio.play();
    });

    window.addEventListener('resize', resizeCanvas);
}