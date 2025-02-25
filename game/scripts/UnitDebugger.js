class UnitDebugger extends GameObject {
    constructor(unit) {
        super();
        this.unit = unit;
        this.isVisible = false
        this.isCollapsed = false;
        this.showTileOverlay = false;

        // Create debug container
        this.debugElement = document.createElement('div');
        this.debugElement.id = 'unit-debugger';
        this.debugElement.className = 'unit-debugger hidden';

        // Create header first
        const header = this.createHeader();

        MenuDraggable.makeDraggable(this.debugElement, header, { left: '420px', top: '20px' });


        // Create content container for collapsible section
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'unit-debugger-content';
        this.debugElement.appendChild(this.contentElement);



        // Create debug info elements
        this.setupDebugInfo();

        // Add to document
        document.body.appendChild(this.debugElement);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    setupDebugInfo() {
        // Debug info configuration
        this.debugInfo = [
            { label: 'Position', getValue: () => `X: ${this.unit.position.x.toFixed(2)}, Y: ${this.unit.position.y.toFixed(2)}` },
            { label: 'Direction', getValue: () => this.unit.direction },
            { label: 'Facing', getValue: () => this.unit.facingDirection },
            { label: 'Body Tile Type', getValue: () => this.unit.bodyTile.type },
            { label: 'Legs Tile Type', getValue: () => this.unit.legsTile.type },
            { label: 'Feet Tile Type', getValue: () => this.unit.feetTile.type },
            // Add physics info
            { label: 'Thrust', getValue: () => `X: ${this.unit._currentThrust.x.toFixed(2)}, Y: ${this.unit._currentThrust.y.toFixed(2)}`},
            { label: 'Acceleration', getValue: () => `X: ${this.unit._acceleration.x.toFixed(2)}, Y: ${this.unit._acceleration.y.toFixed(2)}` },
            { label: 'Velocity', getValue: () => `X: ${this.unit._velocity.x.toFixed(2)}, Y: ${this.unit._velocity.y.toFixed(2)}` },
            // Add jump info
            { 
                label: 'Jump State', 
                getValue: () => this.unit.jumpProperties.isJumping ? 'Jumping' : 'Grounded',
                style: () => this.unit.jumpProperties.isJumping ? 'color: #FFC107' : 'color: #4CAF50'
            },
            { 
                label: 'Jumps Left', 
                getValue: () => `${this.unit.jumpProperties.jumpsLeft}/${this.unit.jumpProperties.maxJumps}`,
                style: () => this.unit.jumpProperties.jumpsLeft > 0 ? 'color: #4CAF50' : 'color: #F44336'
            },
            { 
                label: 'Jump Timer', 
                getValue: () => `${(this.unit.jumpProperties.jumpTimer / 1000).toFixed(2)}s`,
                style: () => this.unit.jumpProperties.jumpTimer > 0 ? 'color: #FFC107' : 'color: #4CAF50'
            },
            { 
                label: 'Jump Power', 
                getValue: () => this.unit.jumpProperties.jumpPower.toFixed(2)
            },
            { 
                label: 'Jump Direction', 
                getValue: () => this.unit.jumpProperties.jumpDirection || 'None'
            },
            // Add movement state info
            { 
                label: 'NoClip', 
                getValue: () => this.unit.noClip ? 'ON' : 'OFF',
                style: () => this.unit.noClip ? 'color: #4CAF50' : 'color: #F44336'
            },
        ];

        // Create debug elements
        this.debugElements = this.debugInfo.map(info => {
            const row = document.createElement('div');
            row.className = 'unit-debugger-row';

            const label = document.createElement('span');
            label.className = 'unit-debugger-label';
            label.textContent = info.label;

            const value = document.createElement('span');
            value.className = 'unit-debugger-value';

            row.appendChild(label);
            row.appendChild(value);
            this.contentElement.appendChild(row);

            return { row, valueSpan: value };
        });
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'unit-debugger-header';

        const title = document.createElement('h3');
        title.textContent = '🎮 UNIT DEBUG INFO (F2)';

        // Add noClip toggle button
        const noClipBtn = document.createElement('button');
        noClipBtn.className = 'noclip-btn';
        noClipBtn.textContent = '🛸';
        noClipBtn.title = 'Toggle NoClip';
        noClipBtn.onclick = (e) => {
            e.stopPropagation();
            this.unit.noClip = !this.unit.noClip;
            noClipBtn.classList.toggle('active', this.unit.noClip);
        };



        // Add overlay toggle button
        const overlayBtn = document.createElement('button');
        overlayBtn.className = 'overlay-btn';
        overlayBtn.textContent = '🎯';
        overlayBtn.title = 'Toggle Tile Overlay';
        overlayBtn.onclick = (e) => {
            e.stopPropagation();
            this.showTileOverlay = !this.showTileOverlay;
            overlayBtn.classList.toggle('active', this.showTileOverlay);
            console.log('Tile overlay:', this.showTileOverlay ? 'ON' : 'OFF');
        };

        header.appendChild(title);
        header.appendChild(noClipBtn);
        header.appendChild(overlayBtn);

        this.debugElement.appendChild(header);

        return header;
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.debugElement.classList.toggle('hidden');
    }

    step(delta, root) {
        if (!this.isVisible) return;

        // Update each debug element
        this.debugElements.forEach((element, index) => {
            const info = this.debugInfo[index];
            element.valueSpan.textContent = info.getValue();

            // Update value color based on state
            if (info.label === 'Health' || info.label === 'Energy' || info.label === 'Oxygen') {
                const value = parseFloat(info.getValue());
                element.valueSpan.style.color = value < 30 ? '#ff4444' :
                    value < 70 ? '#ffaa44' : '#44ff44';
            }
        });
    }

    drawImage(ctx, drawPosX, drawPosY) {
        // Draw tile overlay
        if (this.unit.extendedMooreNeighbors) {
            let index = 0;
            this.unit.calculateExtendedMooreNeighbors(this.unit.world);

            this.unit.extendedMooreNeighbors.forEach(neighbor => {
                // Skip if neighbor doesn't exist
                if (!neighbor) return;

                let overlayColor;
                if (index === 12 || index === 17) {
                    // Unit's current tile
                    overlayColor = 'rgba(0, 255, 0, 0.3)';
                } else if (neighbor.solid) {
                    overlayColor = 'rgba(255, 0, 0, 0.3)';
                } else if (neighbor.passable) {
                    overlayColor = 'rgba(0, 255, 255, 0.3)';
                } else if (neighbor.type === 'water') {
                    overlayColor = 'rgba(0, 0, 255, 0.3)';
                }
                const tileSize = this.unit.world.tileSize;
                // Draw tile overlay
                ctx.fillStyle = overlayColor;
                ctx.fillRect(neighbor.x, neighbor.y, tileSize, tileSize);

                // Draw tile index
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(`${index}`, neighbor.x + 4, neighbor.y + 12);

                // Draw tile type
                ctx.fillText(neighbor.type, neighbor.x + 4, neighbor.y + 24);

                index++;
            });
        }
    }
    // Clean up when destroyed
    destroy() {
        this.debugElement.remove();
        super.destroy();
    }
}