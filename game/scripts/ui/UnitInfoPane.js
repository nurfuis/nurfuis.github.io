class UnitInfoPane extends ToolPane {
    constructor(unit) {
        super({
            id: 'unit-info',
            title: 'UNIT INFO',
            icon: '👤',
            position: { right: '20px', bottom: '20px' },
            hotkey: 'F3',
            visible: true
        });

        this.unit = unit;
        this.setupInfoSections();
        this.bindEvents();
    }

    setupInfoSections() {
        // Position info
        const positionSection = this.addSection('Position');
        this.addControl('Position', {
            id: 'coordinates',
            type: 'display',
            label: 'Coords',
            getValue: () => `X: ${this.unit?.position?.x?.toFixed(0)}, Y: ${this.unit?.position?.y?.toFixed(0)}`
        });

        // Status info
        const statusSection = this.addSection('Status');
        const statusInfo = [
            {
                id: 'health',
                label: 'Health',
                getValue: () => `${this.unit?.heart?.health?.toFixed(0)}/${this.unit?.heart?.maxHealth}`
            },
            {
                id: 'energy',
                label: 'Energy',
                getValue: () => `${this.unit?.stomach?.energy?.toFixed(0)}/${this.unit?.stomach?.maxEnergy}`
            },
            {
                id: 'oxygen',
                label: 'Oxygen',
                getValue: () => `${this.unit?.lungs?.oxygen?.toFixed(0)}/${this.unit?.lungs?.maxOxygen}`
            }
        ];

        statusInfo.forEach(info => {
            this.addControl('Status', {
                ...info,
                type: 'display'
            });
        });

        // Inventory info
        const inventorySection = this.addSection('Inventory');
        this.addControl('Inventory', {
            id: 'items',
            type: 'display',
            label: 'Items',
            getValue: () => `${this.unit?.inventory?.items?.length || 0} items`
        });

        // Resources
        const resourcesSection = this.addSection('Resources');
        const resourceInfo = [
            {
                id: 'lumina',
                label: 'Lumina',
                getValue: () => this.unit?.luminaSpheres || 0
            },
            {
                id: 'acorns',
                label: 'Acorns',
                getValue: () => this.unit?.acorns || 0
            },
            {
                id: 'feylight',
                label: 'Fey Light',
                getValue: () => this.unit?.feyLight || 0
            }
        ];

        resourceInfo.forEach(info => {
            this.addControl('Resources', {
                ...info,
                type: 'display'
            });
        });
    }

    bindEvents() {
        events.on('PLAYER_POSITION', this, (data) => {
            if (data.unit === this.unit) {
                this.updateDisplay();
            }
        });

        // Additional event listeners for other unit changes
        const updateEvents = ['UNIT_HEALTH_CHANGED', 'INVENTORY_CHANGED', 
                            'RESOURCE_COLLECTED', 'ENERGY_CHANGED', 
                            'OXYGEN_CHANGED'];
        
        updateEvents.forEach(event => {
            events.on(event, this, () => this.updateDisplay());
        });
    }

    updateDisplay() {
        if (!this.isVisible) return;

        this.sections.forEach((section, sectionName) => {
            section.controls.forEach((element, id) => {
                const valueSpan = element.querySelector('.tool-pane-value');
                if (!valueSpan) return;

                const control = section.controls.get(id);
                if (!control?.getValue) return;

                const value = control.getValue();
                valueSpan.textContent = value;

                // Add color coding for status values
                if (sectionName === 'Status') {
                    const [current, max] = value.split('/').map(Number);
                    const percentage = (current / max) * 100;
                    valueSpan.style.color = percentage > 70 ? '#44ff44' :
                                          percentage > 30 ? '#ffaa44' : '#ff4444';
                }
            });
        });
    }
}