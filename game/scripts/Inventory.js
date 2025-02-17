class Inventory {
    constructor() {
        this.items = [];
        this.isVisible = true;

        events.on('INVENTORY_OPENED', this, async () => {
            await this.openInventory();
        });

        events.on('INVENTORY_CLOSED', this, () => {
            this.closeInventory();
        });
    }

    async openInventory() {
        console.log('Opening inventory...');
        const inventory = document.getElementById('inventory-menu');
        inventory.innerHTML = '';

        // Create promises for all image loads
        const imageLoadPromises = this.items.map(item => {
            const image = item.getImage();
            if (!image) return Promise.resolve(); // Resolve immediately if no image

            return new Promise((resolve) => {
                if (image.complete) {
                    resolve();
                } else {
                    image.addEventListener('load', () => resolve());
                    image.addEventListener('error', () => resolve()); // Handle load failures
                }
            });
        });

        // Wait for all images to load or fail
        await Promise.all(imageLoadPromises);

        // Now create inventory items with loaded images
        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';

            const image = item.getImage();
            if (image && image.complete) {
                itemElement.innerHTML = `<img src="${image.src}" alt="${item.getName()}">`;
            } else {
                itemElement.innerHTML = `<div class="placeholder">${item.getName()}</div>`;
            }

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `
                ${image && image.complete ? 
                    `<img src="${image.src}" alt="${item.getName()}">` : 
                    `<div class="placeholder">${item.getName()}</div>`}
                <p><strong>${item.getName()}</strong></p>
                <p>${item.getDescription()}</p>
                <p>Value: ${item.getValue()}</p>
            `;
            itemElement.appendChild(tooltip);

            itemElement.addEventListener('mouseover', () => {
                tooltip.style.display = 'block';
            });

            itemElement.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });

            inventory.appendChild(itemElement);
        });

        inventory.style.display = 'flex';
        this.isVisible = true;
    }

    closeInventory() {
        const inventory = document.getElementById('inventory-menu');
        inventory.innerHTML = ''; // Clear the inventory menu
        inventory.style.display = 'none';
        this.isVisible = false;
    }

    addItem(item) {
        this.items.push(item);
        if (this.isVisible) {
            this.closeInventory(); // Close the inventory display when a new item is added
            this.openInventory(); // Refresh the inventory display when a new item is added
        } 
    }

    removeItem(item) {
        this.items = this.items.filter(i => i !== item);
    }

    getItems() {
        return this.items;
    }
}