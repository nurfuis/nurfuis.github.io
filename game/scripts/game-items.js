const gameItems = [
    {name: 'Sword', description: 'A sharp sword.', image: 'images/sword.png', value: 10},
    {name: 'Shield', description: 'A sturdy shield.', image: 'images/shield.png', value: 15},
    {name: 'Potion', description: 'A healing potion.', image: 'images/potion.png', value: 20},
    {name: 'Key', description: 'A rusty key.', image: 'images/key.png', value: 5},
    {name: 'Coin', description: 'A shiny coin.', image: 'images/coin.png', value: 1},
    {name: 'Map', description: 'A detailed map.', image: 'images/map.png', value: 25},
    {name: 'Torch', description: 'A burning torch.', image: 'images/torch.png', value: 10},
    {name: 'Book', description: 'A mysterious book.', image: 'images/book.png', value: 30},
    {name: 'Gem', description: 'A sparkling gem.', image: 'images/gem.png', value: 50},
    {name: 'Ring', description: 'A golden ring.', image: 'images/ring.png', value: 40},
    {name: 'Amulet', description: 'A silver amulet.', image: 'images/amulet.png', value: 35},
    {name: 'Crown', description: 'A golden crown.', image: 'images/crown.png', value: 100},
    {name: 'Cloak', description: 'A dark cloak.', image: 'images/cloak.png', value: 20},
    {name: 'Boots', description: 'A pair of leather boots.', image: 'images/boots.png', value: 15},
    {name: 'Bow', description: 'A wooden bow.', image: 'images/bow.png', value: 25},
    {name: 'Arrow', description: 'A wooden arrow.', image: 'images/arrow.png', value: 5},
    {name: 'Crossbow', description: 'A wooden crossbow.', image: 'images/crossbow.png', value: 30},
    {name: 'Bolt', description: 'A wooden bolt.', image: 'images/bolt.png', value: 10},
    {name: 'Dagger', description: 'A sharp dagger.', image: 'images/dagger.png', value: 10},
    {name: 'Mace', description: 'A heavy mace.', image: 'images/mace.png', value: 20},
    {name: 'Axe', description: 'A sharp axe.', image: 'images/axe.png', value: 25},
    {name: 'Hammer', description: 'A heavy hammer.', image: 'images/hammer.png', value: 30},
    {name: 'Spear', description: 'A long spear.', image: 'images/spear.png', value: 20},
    {name: 'Staff', description: 'A wooden staff.', image: 'images/staff.png', value: 15},
    {name: 'Wand', description: 'A magical wand.', image: 'images/wand.png', value: 35}
];


class GameItem extends GameObject {
    constructor(name, description, image, value) {
        super();
        this.name = name;
        this.description = description;
        this.source = image;
        this.value = value;
        this.position = new Vector2(0, 0);
        this.size = 32;
        
        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the sap object

            // Check if the player is within range of the sap (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= 64) { // If the player is within range, emit a sap event
                events.emit('ITEM_COLLECTED', this); // Emit the sap collected event with the sap object as data
                this.destroy(); // Remove the sap from the game world

            }
        });



    }
    ready() {
        this.image = new Image(); // Create a new Image object for the sap image
        this.image.src = this.source; // Set the source of the sap image
    }

    getName() {
        return this.name;
    }
    
    getDescription() {
        return this.description;
    }
    
    getImage() {
        return this.image;
    }
    
    getValue() {
        return this.value;
    }

    draw(ctx) {
        const drawPosX = this.position.x;
        const drawPosY = this.position.y;
        ctx.drawImage(this.image, drawPosX, drawPosY, 64, 64); 

    }
}