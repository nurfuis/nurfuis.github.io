
const gameItems = [{
    itemName: 'Briar Shortblade',
    description: 'A short, wickedly sharp blade crafted from enchanted briar. Whispers on the wind guide its strikes.',
    image: 'images/short-sword-2.png',
    value: 15,
    rarity: 4
},
{
    itemName: 'Feywind Rope',
    description: 'A coil of rope spun from feywild vines, strong enough to hold a griffin and light as a breeze.',
    image: 'images/rope-coil.png',
    value: 10,
    rarity: 4
},
{
    itemName: 'Moonpetal Lamp',
    description: 'A delicate lamp fueled by pressed moonpetal oil, favored by hedge witches for its soft, guiding glow.',
    image: 'images/lamp.png',
    value: 20,
    rarity: 3
},
{
    itemName: 'Glyph-Bound Grimoire',
    description: 'A leather-bound journal filled with cryptic symbols that pulse with a faint, inner light. Best deciphered by moonlight.',
    image: 'images/journal.png',
    value: 5,
    rarity: 3
},
{
    itemName: 'Dewdrop Ring',
    description: 'A ring crafted to hold a single, shimmering dewdrop. Said to grant fleeting glimpses into the spirit realm.',
    image: 'images/diamond-ring.png',
    value: 1,
    rarity: 2
},
{
    itemName: 'Hearthwitch Kettle',
    description: 'A copper kettle imbued with the warmth of a hearth spirit. Perfect for brewing potent potions and comforting teas.',
    image: 'images/copper-kettle.png',
    value: 25,
    rarity: 2
},
{
    itemName: 'Dreamglass Phial',
    description: 'An ornate glass bottle, stoppered with enchanted cork. Once held potent dream-brews, now awaits a new concoction.',
    image: 'images/empty-bottle.png',
    value: 10,
    rarity: 4
},
{
    itemName: 'Whisperwood Spoon',
    description: 'A stirring spoon carved from whisperwood, its handle humming with forgotten recipes and brewing secrets.',
    image: 'images/wooden-spoon.png',
    value: 15,
    rarity: 5
},
{
    itemName: 'Spriggan Striders',
    description: 'Leather boots blessed by a mischievous spriggan, granting the wearer uncanny speed and sure footing on wild paths.',
    image: 'images/leather-boots.png',
    value: 50,
    rarity: 3
},
{
    itemName: 'Tapestry of Trails',
    description: 'A woven rug depicting the ever-shifting paths of the feywild. Those who sleep upon it may find their dreams lead them astray.',
    image: 'images/woven-rug.png',
    value: 250,
    rarity: 1
},
{
    itemName: 'Seasong Amulet',
    description: 'A large abalone shell, polished to a pearlescent sheen. It whispers secrets of the tides and the turning of the seasons.',
    image: 'images/abalone-shell.png',
    value: 3,
    rarity: 5
},
{
    itemName: 'Groaning Cask',
    description: 'A sturdy oak barrel bound with iron, its wood groaning with the echoes of potent brews and forgotten fermentations.',
    image: 'images/wooden-barrel.png',
    value: 20,
    rarity: 4
},
];

class GameItem extends GameObject {
    constructor(name, description, image, value, rarity) {
        super();
        this.name = name;
        this.description = description;
        this.source = image;
        this.value = value;
        this.position = new Vector2(0, 0);
        this.size = constants.ITEM_SIZE;

        this.rarity = rarity; // Add rarity property to the item object
        
        events.on('PLAYER_POSITION', this, (data) => { // Listen for player position updates
            this.playerPosition = data; // Update the player position in the sap object

            // Check if the player is within range of the sap (e.g., 1 tile away)
            const distance = Math.sqrt(
                (this.position.x - this.playerPosition.x) ** 2 +
                (this.position.y - this.playerPosition.y) ** 2
            );

            if (distance <= constants.ITEM_COLLECT_RANGE) { // If the player is within range, emit a sap event
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
        ctx.drawImage(this.image, drawPosX, drawPosY, this.size, this.size); 

    }
}