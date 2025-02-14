class Inventory {
    constructor() {
        this.items = [];

        events.on('INVENTORY_OPENED', this, (data) => { // Listen for player position updates
            this.openInventory(); // Update the player position in the sap object
        });

        events.on('INVENTORY_CLOSED', this, (data) => { // Listen for player position updates
            this.closeInventory(); // Update the player position in the sap object
        });
    }
    openInventory() {
        console.log('Inventory opened');
        const inventory = document.getElementById('inventory-menu');
        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerHTML = `<img src="${item.getImage().src}" alt="${item.getName()}">`;

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `
                <img src="${item.getImage().src}" alt="${item.getName()}">
                <p><strong>${item.getName()}</strong></p>
                <p>${item.getDescription()}</p>
                <p>Value: ${item.getValue()}</p>
            `;
            itemElement.appendChild(tooltip);

            // Show tooltip on hover
            itemElement.addEventListener('mouseover', () => {
                tooltip.style.display = 'block';
            });

            // Hide tooltip when not hovering
            itemElement.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });

            inventory.appendChild(itemElement);
        });
    }
    closeInventory() {
        console.log('Inventory closed');
        const inventory = document.getElementById('inventory-menu');
        inventory.innerHTML = ''; // Clear the inventory menu
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        this.items = this.items.filter(i => i !== item);
    }

    getItems() {
        return this.items;
    }
}