const input = root.input;

const keysPressed = input.keysPressed;

if (this.delay > 0) {
    this.delay -= delta; // Decrease the delay by the delta time
    return; // Exit the function if the delay is still active
}

if (this.editMode) {
    const editRange = this.tileSize * 2;

    // Handle arrow key presses
    if (keysPressed.length > 0 && !!this.selectedTile) {
        this.delay = constants.KEY_DELAY; // Delay in milliseconds (e.g., 200ms = 0.25 seconds)
        let newX = this.selectedTile.x;
        let newY = this.selectedTile.y;

        if (input.keysPressed.includes('ArrowUp')) {
            newY -= this.tileSize;
        } else if (input.keysPressed.includes('ArrowDown')) {
            newY += this.tileSize;
        } else if (input.keysPressed.includes('ArrowLeft')) {
            newX -= this.tileSize;
        } else if (input.keysPressed.includes('ArrowRight')) {
            newX += this.tileSize;
        }

        const distance = Math.sqrt(
            (newX - this.playerPosition.x) ** 2 +
            (newY - this.playerPosition.y) ** 2
        );

        // Check if the new position is within the edit range and world boundaries
        if (distance <= editRange &&
            newX >= 0 && newX < this.width &&
            newY >= 0 && newY < this.height) {
            this.useArrowKeys = true;
            this.selectedTile = this.getTileAtCoordinates(newX, newY);
        } else {
            this.useArrowKeys = false;
            return; // Return early if the updated position is outside the edit range or world boundaries
        }
    }



    // Handle 'q' key press to change the selected tile to air or earth
    if (input.keysPressed.includes('q') && this.selectedTile) {
        const distance = Math.sqrt(
            (this.selectedTile.x - this.playerPosition.x) ** 2 +
            (this.selectedTile.y - this.playerPosition.y) ** 2
        );

        if (distance <= editRange) {
            if (this.selectedTile.type != 'earth') {
                this.selectedTile.type = 'earth';
                this.selectedTile.color = 'red';
                this.selectedTile.solid = true;
                this.selectedTile.passable = false; // Earth is not passable
                this.selectedTile.breakable = false
                this.selectedTile.durability = 200; // Earth has durability
            } else if (this.selectedTile.type != 'air') {
                this.selectedTile.type = 'air';
                this.selectedTile.color = 'red';
                this.selectedTile.solid = false;
                this.selectedTile.passable = true; // Air is passable

                this.selectedTile.durability = -2; // Air has no durability
                // TODO sort htis out into an ablity system
            }
        }

    }
}



toggleEditMode() {
    this.editMode = !this.editMode;
    this.selectedTile = this.getTileAtCoordinates(this.playerPosition.x, this.playerPosition.y);
}




highlightEditRange(ctx) {
    const tilesInRange = [];
    const tileSize = this.tileSize;
    const editRange = tileSize * 2; // Adjust the range as needed

    for (let dx = -editRange; dx <= editRange; dx += tileSize) {
        for (let dy = -editRange; dy <= editRange; dy += tileSize) {
            const targetX = this.playerPosition.x + dx;
            const targetY = this.playerPosition.y + dy;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance <= editRange &&
                targetX >= 0 && targetX < this.width &&
                targetY >= 0 && targetY < this.height) {
                tilesInRange.push({
                    x: targetX,
                    y: targetY
                });
            }
        }
    }

    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Semi-transparent red for edit range
    tilesInRange.forEach(tile => {
        ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
    });
}

highlightSelectedTile(ctx) {
    if (this.selectedTile) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'; // Semi-transparent green for selected tile
        ctx.fillRect(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize);
    }
}