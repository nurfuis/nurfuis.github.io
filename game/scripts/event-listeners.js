function initializeEventListeners() {
    document.getElementById('damage-button').addEventListener('click', () => {
        const currentUnit = turnOrder[currentTurnIndex];
        takeDamage(currentUnit, 10);
    });

    document.getElementById('heal-button').addEventListener('click', () => {
        const currentUnit = turnOrder[currentTurnIndex];
        heal(currentUnit, 10);
    });


    window.addEventListener('resize', resizeCanvas);
}