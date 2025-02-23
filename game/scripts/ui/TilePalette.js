class TilePalette {
    constructor(parent) {
        this.parent = parent;
        this.id = 'tile-palette';
        this.selectedTiles = new Array(10).fill(null);
        this.currentSlot = 0;
        this.isVisible = PanelStateManager.getVisibilityState(this.id);
        this.isCollapsed = false;

        this.activeTab = localStorage.getItem('lastActiveTab') || null;

        // Create selector panel first
        this.selectorPanel = this.createTileSelector();

        // Set initial visibility
        if (!this.isVisible) {
            this.selectorPanel.style.display = 'none';
        }

        // Create and append header
        const header = this.createHeader();
        this.selectorPanel.insertBefore(header, this.selectorPanel.firstChild);

        MenuDraggable.makeDraggable(this.selectorPanel, header, { bottom: '20px', left: '20px' });

        this.createActionBar();
        this.bindHotkeys();

        // Load saved state before selecting last slot
        this.loadState();

        const lastSlot = localStorage.getItem('lastSelectedSlot');
        if (lastSlot) {
            this.selectSlot(parseInt(lastSlot));
        }

        // Initialize the active tab if one was saved
        if (this.activeTab) {
            const savedTab = this.selectorPanel.querySelector(`[data-type="${this.activeTab}"]`);
            if (savedTab) {
                savedTab.classList.add('active');
                this.showVariants(this.activeTab);
            }
        }
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'tile-palette-header';
        header.style.cursor = 'grab';

        const title = document.createElement('h3');
        title.textContent = '🎨 TILE PALETTE (F4)';

        // Add collapse button
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'collapse-btn';
        collapseBtn.textContent = '▼';
        collapseBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleCollapse();
        };

        header.appendChild(title);
        header.appendChild(collapseBtn);

        return header;
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        const content = this.selectorPanel.querySelector('.tile-selector-content');
        content.style.display = this.isCollapsed ? 'none' : 'block';

        const collapseBtn = this.selectorPanel.querySelector('.collapse-btn');
        collapseBtn.textContent = this.isCollapsed ? '▶' : '▼';
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.selectorPanel.style.display = this.isVisible ? 'block' : 'none';
        this.actionBar.style.display = this.isVisible ? 'block' : 'none';

        PanelStateManager.setVisibilityState(this.id, this.isVisible);
    }

    bindHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Number keys 1-0
            if (e.key >= '1' && e.key <= '9' || e.key === '0') {
                const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
                this.selectSlot(index);
            }

            if (e.key === 'F4') {
                e.preventDefault();
                this.toggleVisibility();
            }
        });
    }

    createTileSelector() {
        // Create tile selector panel
        this.selectorPanel = document.createElement('div');
        this.selectorPanel.className = 'tile-selector-panel';

        // Create content container for collapsible elements
        const content = document.createElement('div');
        content.className = 'tile-selector-content';

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
        viewerCanvas.width = viewerCanvas.height = 96;
        this.tileViewer.appendChild(viewerCanvas);

        // Create variant grid
        this.variantGrid = document.createElement('div');
        this.variantGrid.className = 'variant-grid';

        // Add all elements to content container
        content.appendChild(this.tileViewer);
        content.appendChild(tabContainer);
        content.appendChild(this.variantGrid);

        this.selectorPanel.appendChild(content);
        document.body.appendChild(this.selectorPanel);

        return this.selectorPanel;
    }

    createActionBar() {
        this.actionBar = document.createElement('div');
        this.actionBar.className = 'tile-palette-toolbar';

        if (!this.isVisible) {
            this.actionBar.style.display = 'none';
        }

        const slots = document.createElement('div');
        slots.className = 'action-bar';

        for (let i = 0; i < 10; i++) {
            const slot = this.createActionSlot(i);
            slots.appendChild(slot);
        }

        const tips = document.createElement('div');
        tips.innerHTML = `
            <div>Shift + Click to pan</div>
            <div>1-0 keys to select slots</div>
            <div>Right-click to remove tile</div>
        `;

        this.actionBar.appendChild(slots);
        // this.actionBar.appendChild(tips);
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
            this.saveState(); // Save state when slot is cleared
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

            this.updateViewer(tileData.type, tileData.variant);

            if (this.activeTab === tileData.type) {
                const variantTiles = this.variantGrid.querySelectorAll('.variant-tile');
                if (variantTiles[tileData.variant]) {
                    this.highlightVariant(variantTiles[tileData.variant]);
                }
            } else {
                // If different type, clear all highlights
                this.variantGrid.querySelectorAll('.variant-tile').forEach(tile =>
                    tile.classList.remove('selected')
                );
            }
        } else {

            this.parent.selectedTile = null;
            this.parent.selectedVariant = 0;

            const viewerCtx = this.tileViewer.querySelector('canvas').getContext('2d');
            viewerCtx.clearRect(0, 0, 96, 96);

            this.variantGrid.querySelectorAll('.variant-tile').forEach(tile =>
                tile.classList.remove('selected')
            );

        }


        localStorage.setItem('lastSelectedSlot', index);
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


            // if the variant tab is the same type as the selected tile, highlight it
            slot.appendChild(preview);

            // Update variant highlighting if this is the current tab
            if (this.activeTab === data.type) {
                const variantTiles = this.variantGrid.querySelectorAll('.variant-tile');
                variantTiles.forEach((tile, index) => {
                    tile.classList.toggle('selected', index === data.variant);
                });
            }
        } else {
            if (this.activeTab) {
                const hasActiveTypeSelected = this.selectedTiles.some(tile =>
                    tile && tile.type === this.activeTab
                );
                if (!hasActiveTypeSelected) {
                    this.variantGrid.querySelectorAll('.variant-tile').forEach(tile =>
                        tile.classList.remove('selected')
                    );
                }
            }
        }
    }

    saveState() {
        // Save palette and tab state
        localStorage.setItem('paletteState', JSON.stringify(this.selectedTiles));
        localStorage.setItem('lastActiveTab', this.activeTab);
    }

    loadState() {
        const state = localStorage.getItem('paletteState');
        if (state) {
            this.selectedTiles = JSON.parse(state);

            // Update all slots
            this.actionBar.querySelectorAll('.action-slot').forEach((slot, index) => {
                this.updateSlot(slot, this.selectedTiles[index]);
            });

            // Update viewer with last selected tile
            const lastSelectedSlot = localStorage.getItem('lastSelectedSlot');
            if (lastSelectedSlot) {
                const tileData = this.selectedTiles[parseInt(lastSelectedSlot)];
                if (tileData) {
                    this.updateViewer(tileData.type, tileData.variant);
                }
            }
        }
    }

    createTypeTab(type) {
        const tab = document.createElement('button');
        tab.className = 'tile-type-tab';
        tab.dataset.type = type;
        tab.textContent = type.charAt(0).toUpperCase() + type.slice(1);

        tab.onclick = () => {
            this.selectorPanel.querySelectorAll('.tile-type-tab').forEach(t =>
                t.classList.remove('active')
            );
            tab.classList.add('active');
            this.activeTab = type;
            this.showVariants(type);
            this.saveState(); // Save state when tab changes

            // Clear viewer if no tile is selected
            if (!this.selectedTiles[this.currentSlot]) {
                const viewerCtx = this.tileViewer.querySelector('canvas').getContext('2d');
                viewerCtx.clearRect(0, 0, 96, 96);
            }

            this.variantGrid.querySelectorAll('.variant-tile').forEach(tile =>
                tile.classList.remove('selected')
            );

            // Highlight the variant if it matches the current slot
            const currentTile = this.selectedTiles[this.currentSlot];
            if (currentTile && currentTile.type === type) {
                const variantTiles = this.variantGrid.querySelectorAll('.variant-tile');
                if (variantTiles[currentTile.variant]) {
                    this.highlightVariant(variantTiles[currentTile.variant]);
                }
            }

        };

        // Set initial active state if this is the saved tab
        if (type === this.activeTab) {
            tab.classList.add('active');
        }

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

            // Check if this variant should be highlighted
            const shouldHighlight = this.selectedTiles.some(tile =>
                tile && tile.type === type && tile.variant === index
            );
            if (shouldHighlight) {
                variantTile.classList.add('selected');
            }

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
            this.saveState(); // Save state when variant is selected
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
