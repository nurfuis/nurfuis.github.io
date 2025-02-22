        moveButton.addEventListener('click', () => {
            if (this.unloaded) return; // Prevent moving while unloaded
            this.game.movePending = !this.game.movePending; // Toggle movePending state

            if (this.game.movePending) {
                moveButton.classList.add('active'); // Highlight the move button
            } else {
                moveButton.classList.remove('active'); // Remove highlight
            }
            toggleActionBarButtons(this.game.movePending, this.game.attackPending);
        });

        attackButton.addEventListener('click', () => {
            const currentUnit = game.turnOrder[game.currentTurnIndex];
            const attackMenu = document.getElementById('attack-menu');
            if (currentUnit.isLoaded) return; // Prevent attacking from a vehicle
            if (currentUnit.remainingAttacks > 0) {

                this.game.attackPending = !this.game.attackPending;

                if (this.game.attackPending) {
                    attackButton.classList.add('active');
                    populateAttackMenu(currentUnit); // Populate the attack menu
                    attackMenu.style.display = 'flex'; // Show the attack menu
                } else {
                    attackButton.classList.remove('active');
                    attackMenu.style.display = 'none'; // Hide the attack menu
                    currentUnit.selectedAttack = null;
                }
                toggleActionBarButtons(this.game.movePending, this.game.attackPending);
            } else {
                console.log(`${currentUnit.name} has no remaining attacks.`);
            }
        });