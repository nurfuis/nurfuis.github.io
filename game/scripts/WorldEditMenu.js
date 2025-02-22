class WorldEditMenu {
    async initialize() {
        await TileSheetConfig.initialize();
        this.tilePalette = new TilePalette(this);
        this.loadMapState();
    }

    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.isVisible = true;
        this.isEditing = false;
        this.selectedTile = null;
        this.selectedVariant = 0;
        this.showGrid = false;
        this.hoverTile = { x: 0, y: 0 }; // Add this to track hovered tile


        // Initialize menu container
        this.debugElement = this.createMenuContainer();

        const header = this.createHeader();

        MenuDraggable.makeDraggable(this.debugElement, header, { right: '20px', top: '20px' });

        this.initializeControls();
        this.createMenuSections();
        this.bindEvents();

        // Initialize asynchronously
        this.initialize();

    }
    saveMapState() {
        const mapState = {
            tiles: this.game.world.tiles.map(tile => ({
                type: tile.type,
                variant: tile.variant,
                x: tile.x,
                y: tile.y
            })),
            actionBar: this.palette.selectedTiles
        };
        localStorage.setItem('mapEditorState', JSON.stringify(mapState));
    }

    loadMapState() {
        const savedState = localStorage.getItem('mapEditorState');
        if (savedState) {
            const state = JSON.parse(savedState);
            state.tiles.forEach(tileData => {
                const tile = createTile(tileData.type, tileData.x, tileData.y, tileData.variant);
                this.game.world.setTile(tileData.x, tileData.y, tile);
            });
            this.palette.selectedTiles = state.actionBar;
        }
    }
    createHeader() {
        const header = document.createElement('div');
        header.className = 'world-edit-header';

        const title = document.createElement('h3');
        title.textContent = '🔧 WORLD EDIT';

        header.appendChild(title);

        this.debugElement.appendChild(header);

        return header;
    }
    initializeControls() {
        this.controls = {
            editor: {
                settings: {
                    toggleEdit: {
                        type: 'toggle',
                        label: 'Edit Mode',
                        getValue: () => this.isEditing,
                        setValue: (value) => {
                            this.isEditing = value;
                            // Emit event instead of directly modifying game loop
                            events.emit('TOGGLE_GAME_LOOP', { isRunning: !value });
                            // Optionally emit edit mode state for other components
                            events.emit('WORLD_EDIT_MODE', { isEditing: value });
                        }
                    },
                    showGrid: {
                        type: 'toggle',
                        label: 'Show Grid',
                        getValue: () => this.showGrid,
                        setValue: (value) => {
                            this.showGrid = value;
                        }
                    }
                }
            },
            background: {
                settings: {
                    showBackground: {
                        type: 'toggle',
                        label: 'Show Background',
                        getValue: () => this.game.farBackground.visible,
                        setValue: (value) => {
                            this.game.farBackground.visible = value;
                            events.emit('REQUEST_REDRAW');
                        }
                    },
                    imageUpload: {
                        type: 'fileUpload',
                        label: 'Background Image',
                        accept: '.png',
                        getValue: () => 'Choose Image',
                        setValue: (file) => {
                            const url = URL.createObjectURL(file);
                            this.game.farBackground.setBackgroundImage(url);
                        }
                    },
                    scaleFactor: {
                        type: 'range',
                        label: 'Scale',
                        min: 0.5,
                        max: 2.0,
                        step: 0.1,
                        getValue: () => this.game.farBackground.scaleFactor,
                        setValue: (value) => this.game.farBackground.setScaleFactor(value)
                    }
                }
            }
        };
    }

    createMenuContainer() {
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'world-edit-menu';
        if (this.isVisible) {
            this.menuElement.className = 'world-edit-menu';
        } else {
            this.menuElement.className = 'world-edit-menu hidden';
        }
        document.body.appendChild(this.menuElement);

        return this.menuElement;
    }

    createMenuSections() {
        Object.entries(this.controls).forEach(([name, section]) => {
            const sectionElement = this.createCollapsibleSection(
                name.charAt(0).toUpperCase() + name.slice(1),
                section.settings
            );
            this.menuElement.appendChild(sectionElement);
        });
    }

    createCollapsibleSection(title, settings) {
        const section = document.createElement('div');
        section.className = 'world-edit-section';

        const header = document.createElement('div');
        header.className = 'world-edit-header';
        header.innerHTML = `
            <h3>${title}</h3>
            <button class="collapse-btn">▼</button>
        `;

        const content = document.createElement('div');
        content.className = 'world-edit-content';

        Object.entries(settings).forEach(([key, setting]) => {
            content.appendChild(this.createControl(setting));
        });

        header.onclick = () => {
            content.classList.toggle('collapsed');
            section.classList.toggle('collapsed');
            header.querySelector('.collapse-btn').textContent =
                content.classList.contains('collapsed') ? '▶' : '▼';
        };

        section.appendChild(header);
        section.appendChild(content);
        return section;
    }

    createControl(setting) {
        const control = document.createElement('div');
        control.className = 'world-edit-control';

        const label = document.createElement('label');
        label.textContent = setting.label;
        control.appendChild(label);

        let input;
        switch (setting.type) {
            case 'toggle':
                input = document.createElement('button');
                input.className = 'world-edit-toggle';
                input.textContent = setting.getValue() ? 'ON' : 'OFF';
                input.onclick = () => {
                    const newValue = !setting.getValue();
                    setting.setValue(newValue);
                    input.textContent = newValue ? 'ON' : 'OFF';
                    input.classList.toggle('active', newValue);
                };
                break;

            case 'select':
                input = document.createElement('select');
                input.className = 'world-edit-select';
                setting.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = option;
                    input.appendChild(opt);
                });
                input.value = setting.getValue();

                // Add focus/blur handlers for selector-active state
                input.onfocus = () => {
                    this.menuElement.classList.add('selector-active');
                };
                input.onblur = () => {
                    this.menuElement.classList.remove('selector-active');
                };

                input.onchange = (e) => setting.setValue(e.target.value);
                break;

            case 'range':
                input = document.createElement('input');
                input.type = 'range';
                input.min = setting.min;
                input.max = setting.max;
                input.step = setting.step;
                input.value = setting.getValue();
                input.className = 'world-edit-range';
                input.oninput = (e) => setting.setValue(parseFloat(e.target.value));
                break;

            case 'fileUpload':
                input = document.createElement('div');
                input.className = 'file-upload-container';

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = setting.accept;
                fileInput.style.display = 'none';

                const button = document.createElement('button');
                button.className = 'world-edit-button';
                button.textContent = setting.getValue();

                button.onclick = () => fileInput.click();

                fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        button.textContent = file.name;
                        setting.setValue(file);
                    }
                };

                input.appendChild(button);
                input.appendChild(fileInput);
                break;
        }

        control.appendChild(input);
        return control;
    }

    bindEvents() {
        // Toggle menu with F6
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F6') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Mouse interaction for tile editing
        this.canvas.addEventListener('click', (e) => {
            if (!this.isEditing || !this.selectedTile) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Convert screen coordinates to world coordinates
            const worldX = mouseX - this.game.camera.position.x;
            const worldY = mouseY - this.game.camera.position.y;
            
            // Calculate tile coordinates
            const tileX = Math.floor(worldX / this.game.world.tileSize);
            const tileY = Math.floor(worldY / this.game.world.tileSize);
            
            const tile = createTile(this.selectedTile, tileX, tileY, this.selectedVariant);
            this.game.world.setTile(tileX, tileY, tile);
            console.log(`Placed tile ${this.selectedTile} at (${tileX}, ${tileY})`);
            events.emit('REQUEST_REDRAW');
        });

        // Add mousemove handler for hover effects
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isEditing) return;

            if (isPanning) {
                // ...existing panning code...
            }

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Convert screen coordinates to world coordinates
            const worldX = mouseX - this.game.camera.position.x;
            const worldY = mouseY - this.game.camera.position.y;
            
            // Calculate tile coordinates
            this.hoverTile.x = Math.floor(worldX / this.game.world.tileSize);
            this.hoverTile.y = Math.floor(worldY / this.game.world.tileSize);
            
            events.emit('REQUEST_REDRAW');
        });

        let isPanning = false;
        let lastX = 0;
        let lastY = 0;
        const PAN_SPEED = 10; // Adjust this value to change keyboard pan speed

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isEditing && (
                (e.button === 1) || // Middle mouse button
                (e.button === 0 && e.shiftKey) // Left click + Shift
            )) {
                e.preventDefault(); // Prevent default behaviors
                isPanning = true;
                lastX = e.clientX;
                lastY = e.clientY;
                this.canvas.classList.add('panning');
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isEditing) return;

            if (isPanning) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;

                this.game.camera.position.x -= deltaX;
                this.game.camera.position.y -= deltaY;

                lastX = e.clientX;
                lastY = e.clientY;

                events.emit('REQUEST_REDRAW');
            }

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.hoverTile.x = Math.floor((x - this.game.camera.position.x) / this.game.world.tileSize);
            this.hoverTile.y = Math.floor((y - this.game.camera.position.y) / this.game.world.tileSize);
            
            events.emit('REQUEST_REDRAW');
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 1 || (e.button === 0 && isPanning)) {
                isPanning = false;
                this.canvas.classList.remove('panning');
            }
        });

        // Add numpad controls for panning
        document.addEventListener('keydown', (e) => {
            if (!this.isEditing) return;

            switch (e.code) {
                case 'Numpad4': // Left
                    this.game.camera.position.x -= PAN_SPEED;
                    break;
                case 'Numpad6': // Right
                    this.game.camera.position.x += PAN_SPEED;
                    break;
                case 'Numpad8': // Up
                    this.game.camera.position.y -= PAN_SPEED;
                    break;
                case 'Numpad2': // Down
                    this.game.camera.position.y += PAN_SPEED;
                    break;
                case 'Numpad7': // Up-Left
                    this.game.camera.position.x -= PAN_SPEED;
                    this.game.camera.position.y -= PAN_SPEED;
                    break;
                case 'Numpad9': // Up-Right
                    this.game.camera.position.x += PAN_SPEED;
                    this.game.camera.position.y -= PAN_SPEED;
                    break;
                case 'Numpad1': // Down-Left
                    this.game.camera.position.x -= PAN_SPEED;
                    this.game.camera.position.y += PAN_SPEED;
                    break;
                case 'Numpad3': // Down-Right
                    this.game.camera.position.x += PAN_SPEED;
                    this.game.camera.position.y += PAN_SPEED;
                    break;
                case 'Numpad5': // Reset to player
                    if (this.game.playerTeam && this.game.playerTeam.playerOne) {
                        this.game.camera.position.x = this.game.playerTeam.playerOne.position.x;
                        this.game.camera.position.y = this.game.playerTeam.playerOne.position.y;
                    }
                    break;
            }

            if (e.code.startsWith('Numpad')) {
                events.emit('REQUEST_REDRAW');
            }
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.menuElement.classList.toggle('hidden');
    }

    // Call this in game's render loop
    drawGrid(ctx) {
        if (!this.showGrid) return;

        const { width, height, tileSize } = this.game.world;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= width; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Add this method to draw the hover effect
    drawHoverTile(ctx) {
        if (!this.isEditing || !this.showGrid) return;

        const tileSize = this.game.world.tileSize;
        
        // Convert tile coordinates back to screen coordinates
        const screenX = (this.hoverTile.x * tileSize);
        const screenY = (this.hoverTile.y * tileSize);

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        // Add semi-transparent fill
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(screenX, screenY, tileSize, tileSize);
        ctx.restore();
    }
}


class TileSheetConfig {
    static sheets = {};

    static async initialize() {
        this.sheets = await TileSheetLoader.loadTileSheets();
        events.emit('TILE_SHEETS_LOADED');
    }

    static getVariantCoords(type, variant) {
        const sheet = this.sheets[type];
        return sheet?.variants[variant] || null;
    }
}

class TilePalette {
    constructor(parent) {
        this.parent = parent;
        this.selectedTiles = new Array(10).fill(null);
        this.currentSlot = 0;
        
        // Create selector panel first
        this.selectorPanel = this.createTileSelector();
        
        // Create and append header
        const header = this.createHeader();
        this.selectorPanel.insertBefore(header, this.selectorPanel.firstChild);

        // Make panel draggable & place in bottom-right corner
        MenuDraggable.makeDraggable(this.selectorPanel, header, { top: '20px', left: '20px' });

        this.createActionBar();
        this.bindHotkeys();
        
        const lastSlot = localStorage.getItem('lastSelectedSlot');
        if (lastSlot) {
            this.selectSlot(parseInt(lastSlot));
        }
    }

    createTileSelector() {
        // Create tile selector panel
        this.selectorPanel = document.createElement('div');
        this.selectorPanel.className = 'tile-selector-panel';

        // Create type tabs
        const tabContainer = document.createElement('div');
        tabContainer.className = 'tile-type-tabs';
        Object.keys(TileSheetConfig.sheets).forEach(type => {
            const tab = this.createTypeTab(type);
            tabContainer.appendChild(tab);
        });

        // Create tile viewer
        this.tileViewer = document.createElement('div');
        this.tileViewer.className = 'tile-viewer';
        const viewerCanvas = document.createElement('canvas');
        viewerCanvas.width = viewerCanvas.height = 96; // 3x tile size
        this.tileViewer.appendChild(viewerCanvas);

        // Create variant grid
        this.variantGrid = document.createElement('div');
        this.variantGrid.className = 'variant-grid';

        this.selectorPanel.appendChild(tabContainer);
        this.selectorPanel.appendChild(this.tileViewer);
        this.selectorPanel.appendChild(this.variantGrid);
        document.body.appendChild(this.selectorPanel);

        return this.selectorPanel;
    }
    createHeader() {
        const header = document.createElement('div');
        header.className = 'tile-palette-header';
        header.style.cursor = 'grab';

        const title = document.createElement('h3');
        title.textContent = '🎨 TILE PALETTE';
        header.appendChild(title);

        return header;
    }
    createActionBar() {
        this.actionBar = document.createElement('div');
        this.actionBar.className = 'tile-palette-toolbar';

        const slots = document.createElement('div');
        slots.className = 'action-bar';
        
        for (let i = 0; i < 10; i++) {
            const slot = this.createActionSlot(i);
            slots.appendChild(slot);
        }

        const tips = document.createElement('div');
        tips.className = 'toolbar-tips';
        tips.innerHTML = `
            <div>Shift + Click to pan</div>
            <div>1-0 keys to select slots</div>
            <div>Right-click to remove tile</div>
        `;

        this.actionBar.appendChild(slots);
        this.actionBar.appendChild(tips);
        document.body.appendChild(this.actionBar);
    }

    createActionSlot(index) {
        const slot = document.createElement('div');
        slot.className = 'action-slot';
        slot.dataset.index = index;
        
        // Add key hint
        const keyNumber = (index + 1) % 10;
        const keyHint = document.createElement('span');
        keyHint.className = 'key-hint';
        keyHint.textContent = keyNumber;
        slot.appendChild(keyHint);

        // Add click handler
        slot.onclick = () => this.selectSlot(index);
        
        // Add right-click handler to clear slot
        slot.oncontextmenu = (e) => {
            e.preventDefault();
            this.selectedTiles[index] = null;
            this.updateSlot(slot, null);
            this.saveState();
        };

        return slot;
    }

    selectSlot(index) {
        // Remove selected class from all slots
        this.actionBar.querySelectorAll('.action-slot').forEach(slot => 
            slot.classList.remove('selected')
        );
        
        // Add selected class to clicked slot
        const slot = this.actionBar.querySelector(`[data-index="${index}"]`);
        slot.classList.add('selected');
        
        this.currentSlot = index;
        const tileData = this.selectedTiles[index];
        
        if (tileData) {
            this.parent.selectedTile = tileData.type;
            this.parent.selectedVariant = tileData.variant;
        } else {
            this.parent.selectedTile = null;
            this.parent.selectedVariant = 0;
        }

        localStorage.setItem('lastSelectedSlot', index);
    }

    bindHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Number keys 1-0
            if (e.key >= '1' && e.key <= '9' || e.key === '0') {
                const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
                this.selectSlot(index);
            }
        });
    }

    updateSlot(slot, data) {
        // Clear existing content except key hint
        const keyHint = slot.querySelector('.key-hint');
        slot.innerHTML = '';
        slot.appendChild(keyHint);
        
        if (data) {
            const preview = document.createElement('canvas');
            preview.width = preview.height = 32;
            const ctx = preview.getContext('2d');
            
            const variant = TileSheetConfig.sheets[data.type].variants[data.variant];
            const img = new Image();
            img.onload = () => {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img,
                    variant.x, variant.y, variant.w, variant.h,
                    0, 0, 32, 32
                );
            };
            img.src = TileSheetConfig.sheets[data.type].src;
            
            slot.appendChild(preview);
        }
    }

    saveState() {
        localStorage.setItem('paletteState', JSON.stringify(this.selectedTiles));
    }

    loadState() {
        const state = localStorage.getItem('paletteState');
        if (state) {
            this.selectedTiles = JSON.parse(state);
            this.actionBar.querySelectorAll('.action-slot').forEach((slot, index) => {
                this.updateSlot(slot, this.selectedTiles[index]);
            });
        }
    }

    createTypeTab(type) {
        const tab = document.createElement('button');
        tab.className = 'tile-type-tab';
        tab.dataset.type = type;
        tab.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        
        tab.onclick = () => {
            // Remove active class from all tabs
            this.selectorPanel.querySelectorAll('.tile-type-tab').forEach(t => 
                t.classList.remove('active')
            );
            tab.classList.add('active');
            this.showVariants(type);
            this.updateViewer(type, 0); // Show first variant in viewer
        };
        
        return tab;
    }

    showVariants(type) {
        // Clear existing variants
        this.variantGrid.innerHTML = '';
        
        const sheet = TileSheetConfig.sheets[type];
        if (!sheet) return;

        sheet.variants.forEach((variant, index) => {
            const variantTile = document.createElement('div');
            variantTile.className = 'variant-tile';
            
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img,
                    variant.x, variant.y, variant.w, variant.h,
                    0, 0, 32, 32
                );
            };
            img.src = sheet.src;
            
            variantTile.appendChild(canvas);
            variantTile.onclick = () => {
                this.selectVariant(type, index);
                this.highlightVariant(variantTile);
            };
            
            this.variantGrid.appendChild(variantTile);
        });
    }

    selectVariant(type, variantIndex) {
        this.parent.selectedTile = type;
        this.parent.selectedVariant = variantIndex;
        this.updateViewer(type, variantIndex);
        
        // If we have a current slot selected, update it
        if (this.currentSlot !== null) {
            this.selectedTiles[this.currentSlot] = { type, variant: variantIndex };
            const slot = this.actionBar.querySelector(`[data-index="${this.currentSlot}"]`);
            this.updateSlot(slot, this.selectedTiles[this.currentSlot]);
            this.saveState();
        }
    }

    updateViewer(type, variantIndex) {
        const viewerCtx = this.tileViewer.querySelector('canvas').getContext('2d');
        viewerCtx.clearRect(0, 0, 96, 96);
        
        const sheet = TileSheetConfig.sheets[type];
        if (!sheet) return;
        
        const variant = sheet.variants[variantIndex];
        const img = new Image();
        img.onload = () => {
            viewerCtx.imageSmoothingEnabled = false;
            viewerCtx.drawImage(img,
                variant.x, variant.y, variant.w, variant.h,
                0, 0, 96, 96
            );
        };
        img.src = sheet.src;
    }

    highlightVariant(selectedTile) {
        this.variantGrid.querySelectorAll('.variant-tile').forEach(tile => 
            tile.classList.remove('selected')
        );
        selectedTile.classList.add('selected');
    }
}

class TileSheetLoader {
    static async loadTileSheets() {
        const tileSheets = {};
        
        try {
            // Define the base tile types and their files

            for (const [type, filename] of Object.entries(tileTypes)) {
                const sheet = await this.analyzeTileSheet(`assets/tiles/${filename}`);
                tileSheets[type] = {
                    src: `assets/tiles/${filename}`,
                    variants: sheet.variants
                };
            }
            events.emit('TILE_SHEETS_LOADED', tileSheets);
            console.log('Tile sheets loaded:', tileSheets);
            return tileSheets;
        } catch (error) {
            console.error('Error loading tile sheets:', error);
            return null;
        }
    }

    static analyzeTileSheet(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const variants = [];
                const baseSize = 32; // Base tile size
                
                // Calculate number of tiles in the sheet
                const tilesX = Math.floor(img.width / baseSize);
                const tilesY = Math.floor(img.height / baseSize);

                // Generate variant data
                for (let y = 0; y < tilesY; y++) {
                    for (let x = 0; x < tilesX; x++) {
                        variants.push({
                            x: x * baseSize,
                            y: y * baseSize,
                            w: baseSize,
                            h: baseSize
                        });
                    }
                }

                resolve({
                    width: img.width,
                    height: img.height,
                    variants
                });
            };

            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    get world() {
        return this.game.world;
    }   
}