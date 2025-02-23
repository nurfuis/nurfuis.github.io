
            // Toggle menu display on Escape key press
            // if (event.key === 'Escape') {
            //     // ...
            // }
            // if (event.key === 'i') {
            //     const inventoryMenu = document.getElementById('inventory-menu');
            //     if (inventoryMenu.style.display === 'none') {
            //         inventoryMenu.style.display = 'block';
            //         events.emit("INVENTORY_OPENED"); // Emit the event to open the inventory menu
            //     } else {
            //         inventoryMenu.style.display = 'none';   
            //         events.emit("INVENTORY_CLOSED"); // Emit the event to close the inventory menu
            //     }

            // }

            // Recenter world to active unit on numpad 0 key press
            // if (event.key === '0' && event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
            //     const currentUnit = this.turnOrder[this.currentTurnIndex];
            //     this.camera.position.x = Math.round(currentunit.position.x - this.canvas.width / 2 + currentUnit.size / 2);
            //     this.camera.position.y = Math.round(currentunit.position.y - this.camera.height / 2 + currentUnit.size / 2);
            // }



            // Toggle UI visibility on F1 key press
            // if (event.key === 'F1') {
            //     event.preventDefault(); // Prevent the default F1 action
            //     uiHidden = !uiHidden;
            //     toggleUIVisibility(uiHidden);
            // }

            // Toggle movePending state on 'v' key press
            // if (event.key === 'v' && !this.game.attackPending) {
            //     if (this.unloaded) return; // Prevent moving while unloaded

            //     this.game.movePending = !this.game.movePending;
            //     if (this.game.movePending) {
            //         moveButton.classList.add('active'); // Highlight the move button
            //     } else {
            //         moveButton.classList.remove('active'); // Remove highlight
            //     }
            //     toggleActionBarButtons(this.game.movePending, this.game.attackPending);
            // }

            // if (event.key === 't' && !this.game.movePending) {
            //     const currentUnit = this.game.turnOrder[this.game.currentTurnIndex];
            //     const attackMenu = document.getElementById('attack-menu');
            //     if (currentUnit.isLoaded) return; // Prevent attacking from a vehicle
            //     if (currentUnit.remainingAttacks > 0) {

            //         this.game.attackPending = !this.game.attackPending;
            //         if (this.game.attackPending) {
            //             attackButton.classList.add('active');
            //             populateAttackMenu(currentUnit); // Populate the attack menu
            //             attackMenu.style.display = 'flex'; // Show the attack menu
            //         } else {
            //             attackButton.classList.remove('active');
            //             attackMenu.style.display = 'none'; // Hide the attack menu
            //             currentUnit.selectedAttack = null;
            //         }
            //         toggleActionBarButtons(this.game.movePending, this.game.attackPending);
            //     } else {
            //         console.log(`${currentUnit.name} has no remaining attacks.`);
            //     }
            // }
            // if (event.key ==='e') {
            //     events.emit("EDIT_TILES"); // Emit the event to toggle tile editing mode
            // }
            // if (event.key === 'q') {
            //     //
            // }
