class WorldEditMenu extends ToolPane {
    async initialize() {
        this.loadMapState();
    }

    constructor(canvas, game) {
        super();
        this.canvas = canvas;
        this.game = game;
        this.id = 'world-edit';
        this.isVisible = PanelStateManager.getVisibilityState(this.id);
        this.isEditing = false;
        this.selectedTile = null;
        this.selectedVariant = 0;
        this.showGrid = false;
        this.hoverTile = { x: 0, y: 0 }; // Add this to track hovered tile
        this.showTileStats = false;
        this.isDrawing = false;
        this.isErasing = false;

        // Initialize menu container
        this.debugElement = this.createMenuContainer();

        const header = this.createHeader();

        MenuDraggable.makeDraggable(this.debugElement, header, { right: '20px', top: '20px' });

        this.initializeControls();
        this.createMenuSections();
        this.bindEvents();

        // Initialize asynchronously
        this.initialize();
        this.updateCursor();
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
        title.textContent = '📝 WORLD EDIT (F2)';

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
                            // events.emit('TOGGLE_GAME_LOOP', { isRunning: !value });
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
                            events.emit('REQUEST_REDRAW');

                        }
                    },
                    showTileStats: {
                        type: 'toggle',
                        label: 'Show Tile Stats',
                        getValue: () => this.showTileStats,
                        setValue: (value) => {
                            this.showTileStats = value;
                            events.emit('REQUEST_REDRAW');
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
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Mouse interaction for tile editing
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.isEditing) return;

            // Handle pan start
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                this.startPanning(e);
                return;
            }

            // Left click for painting
            if (e.button === 0 && !e.shiftKey) {
                this.isDrawing = true;
                this.paintTile(e);
            }

            // Right click for erasing
            if (e.button === 2) {
                e.preventDefault();
                this.isErasing = true;
                this.eraseTile(e);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isEditing) return;

            // Update hover tile position
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const worldX = mouseX - this.game.camera.position.x;
            const worldY = mouseY - this.game.camera.position.y;
            
            this.hoverTile.x = Math.floor(worldX / this.game.world.tileSize);
            this.hoverTile.y = Math.floor(worldY / this.game.world.tileSize);

            // Handle panning
            if (this.isPanning) {
                this.handlePanning(e);
                return;
            }

            // Handle painting while dragging
            if (this.isDrawing && this.selectedTile) {
                this.paintTile(e);
            }

            // Handle erasing while dragging
            if (this.isErasing) {
                this.eraseTile(e);
            }

            events.emit('REQUEST_REDRAW');
        });

        document.addEventListener('mouseup', (e) => {
            // Reset all action flags
            this.isDrawing = false;
            this.isErasing = false;
            if (this.isPanning) {
                this.stopPanning();
            }
        });

        // Prevent context menu from showing on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
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

        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.isEditing) return;

            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                this.isPanning = true;
                this.updateCursor();
                return;
            }

            if (e.button === 0 && !e.shiftKey) {
                this.isDrawing = true;
                this.updateCursor();
                this.paintTile(e);
            }

            if (e.button === 2) {
                e.preventDefault();
                this.isErasing = true;
                this.updateCursor();
                this.eraseTile(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            this.isDrawing = false;
            this.isErasing = false;
            if (this.isPanning) {
                this.isPanning = false;
            }
            this.updateCursor();
        });

        // Add cursor update when edit mode changes
        this.controls.editor.settings.toggleEdit.setValue = (value) => {
            this.isEditing = value;
            this.updateCursor();
            events.emit('WORLD_EDIT_MODE', { isEditing: value });
        };

        // Update cursor when tile selection changes
        events.on('TILE_SELECTED', () => {
            this.updateCursor();
        });

        // Add T key toggle for edit state when menu is visible
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 't' && this.isVisible) {
                e.preventDefault();
                const toggleEdit = this.controls.editor.settings.toggleEdit;
                const newValue = !toggleEdit.getValue();
                toggleEdit.setValue(newValue);
                
                // Update any UI elements
                const toggleButton = this.menuElement.querySelector('.world-edit-toggle');
                if (toggleButton) {
                    toggleButton.textContent = newValue ? 'ON' : 'OFF';
                    toggleButton.classList.toggle('active', newValue);
                }
            }
        });
    }

    paintTile(e) {
        if (!this.selectedTile) return;
        
        const tile = createTile(
            this.selectedTile, 
            this.hoverTile.x, 
            this.hoverTile.y, 
            this.selectedVariant,
            this.selectedRotation || 0
        );

        this.game.world.setTile(this.hoverTile.x, this.hoverTile.y, tile);
        events.emit('REQUEST_REDRAW');
    }

    eraseTile(e) {
        const airTile = createTile(
            'air', 
            this.hoverTile.x, 
            this.hoverTile.y, 
            0
        );

        this.game.world.setTile(this.hoverTile.x, this.hoverTile.y, airTile);
        events.emit('REQUEST_REDRAW');
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.menuElement.classList.toggle('hidden');
        PanelStateManager.setVisibilityState(this.id, this.isVisible);

    }

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

    drawTileStats(ctx) {
        if (!this.showTileStats) return;

        const { width, height, tileSize } = this.game.world;
        ctx.save();
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        this.game.world.tiles.forEach(tile => {
            if (!tile) return;

            const screenX = (tile.x);
            const screenY = (tile.y);

            // Skip if off screen
            if (screenX + tileSize < 0 || screenX > width ||
                screenY + tileSize < 0 || screenY > height) {
                return;
            }

            // set fillStyle to tile.color but at reduced opacity
            ctx.fillStyle = `rgba(${tile.color.r}, ${tile.color.g}, ${tile.color.b}, 0.4)`;

            // Draw stats background
            ctx.fillRect(screenX, screenY, tileSize, 30);

            // Draw text
            ctx.fillStyle = 'white';
            ctx.fillText(`${tile.type}`, screenX + 2, screenY + 10);
            ctx.fillText(`${tile.variant}`, screenX + 2, screenY + 20);
            
            // Reset fill style for next background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        });

        ctx.restore();
    }

    updateCursor() {
        if (!this.isEditing) {
            this.canvas.style.cursor = 'default';
            return;
        }

        if (this.isPanning) {
            this.canvas.style.cursor = 'grabbing';
        } else if (this.isDrawing) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.isErasing) {
            this.canvas.style.cursor = 'not-allowed';
        } else {
            // Default edit mode cursor
            this.canvas.style.cursor = this.selectedTile ? 'cell' : 'default';
        }
    }
}
