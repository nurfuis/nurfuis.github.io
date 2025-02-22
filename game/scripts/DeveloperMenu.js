class DeveloperMenu {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.isVisible = false;
        this.sections = new Map(); // Store section references
        this.controls = new Map(); // Store control references

        // Initialize menu container
        this.debugElement = this.createMenuContainer();

        const header = this.createHeader();

        MenuDraggable.makeDraggable(this.debugElement, header, { right: '20px', top: '20px' });

        
        // Initialize layer controls
        this.initializeLayerControls();
        
        // Create menu sections
        this.createMenuSections();

        // Add keyboard listener
        this.bindKeyboardEvents();

        this.refreshAllControls();
    }
    createHeader() {
        const header = document.createElement('div');
        header.className = 'dev-menu-header';

        const title = document.createElement('h3');
        title.textContent = '🔧 DEV CONSOLE';

        header.appendChild(title);

        this.debugElement.appendChild(header);

        return header;
    }

    createMenuContainer() {
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'developer-menu';
        if (this.isVisible) {
            this.menuElement.className = 'developer-menu';
        } else {
            this.menuElement.className = 'developer-menu hidden';
        }
        document.body.appendChild(this.menuElement);

        return this.menuElement;
    }

    initializeLayerControls() {
        this.layerControls = {
            muslin: {
                instance: this.game.muslin,
                settings: {
                    colorTheme: {
                        type: 'select',  // Changed from toggle to select
                        label: 'Color Theme',
                        options: ['Warm', 'Cool'],
                        getValue: () => this.game.muslin.isWarm ? 'Warm' : 'Cool',
                        setValue: (value) => {
                            this.game.muslin.isWarm = value === 'Warm';
                            // Update color palette when theme changes
                            const palette = this.game.muslin.isWarm ?
                                this.game.muslin.colors.warm :
                                this.game.muslin.colors.cool;
                            this.game.muslin.targetColor = palette[0];

                            // Force refresh of the color palette control
                            this.refreshColorPalette();
                        }
                    },
                    colorPalette: {
                        type: 'colorPalette',
                        label: 'Color Selection',
                        getValue: () => this.game.muslin.currentColor,
                        getColors: () => this.game.muslin.isWarm ?
                            this.game.muslin.colors.warm :
                            this.game.muslin.colors.cool,
                        setValue: (color) => {
                            this.game.muslin.targetColor = color;
                            this.game.muslin.transitionProgress = 0;
                        }
                    },
                    cycleColors: {
                        type: 'button',  // Added button type
                        label: 'Cycle Colors',
                        getValue: () => 'Cycle',
                        setValue: () => {
                            this.game.muslin.cycleColors();
                            const input = this.menuElement.querySelector('.color-palette');
                            if (input) {
                                input.querySelectorAll('.color-swatch').forEach(s =>
                                    s.classList.remove('active')
                                );
                            }
                        }
                    },
                    transitionSpeed: {
                        type: 'range',
                        label: 'Transition Speed',
                        min: 0.001,
                        max: 0.01,
                        step: 0.001,
                        getValue: () => this.game.muslin.transitionSpeed,
                        setValue: (value) => this.game.muslin.transitionSpeed = value
                    }
                }
            },
            curtain: {
                instance: this.game.curtain,
                settings: {
                    preset: {
                        type: 'select',
                        label: 'Preset',
                        options: ['world', 'wide', 'open', 'sides', 'top-bottom', 'closed', 'tight'],
                        getValue: () => this.game.curtain.currentPreset,
                        setValue: (value) => this.game.curtain.setPreset(value)
                    }
                }
            },
            darkness: {
                instance: this.game.darkness,
                settings: {
                    level: {
                        type: 'range',
                        label: 'Level',
                        min: -10,
                        max: 10,
                        step: 1,
                        getValue: () => this.game.darkness.darknessLevel,
                        setValue: (value) => this.game.darkness.darknessLevel = value
                    }
                }
            }
        };
    }

    createMenuSections() {
        Object.entries(this.layerControls).forEach(([layerName, layer]) => {
            const section = this.createCollapsibleSection(
                layerName.charAt(0).toUpperCase() + layerName.slice(1),
                layer.settings
            );
            this.sections.set(layerName, section);
            this.menuElement.appendChild(section);
        });
    }

    createCollapsibleSection(title, settings) {
        const section = document.createElement('div');
        section.className = 'dev-menu-section';

        const header = document.createElement('div');
        header.className = 'dev-menu-header';
        header.innerHTML = `
            <h3>${title}</h3>
            <button class="collapse-btn">▼</button>
        `;

        const content = document.createElement('div');
        content.className = 'dev-menu-content';

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
        control.className = 'dev-menu-control';
        const controlId = `control-${setting.label.toLowerCase().replace(/\s+/g, '-')}`;
        control.id = controlId;

        const label = document.createElement('label');
        label.textContent = setting.label;
        control.appendChild(label);

        const input = this.createInputElement(setting);
        control.appendChild(input);

        // Store reference to control
        this.controls.set(controlId, { control, setting, input });

        return control;
    }

    createInputElement(setting) {
        switch (setting.type) {
            case 'toggle':
                return this.createToggle(setting);
            case 'range':
                return this.createRange(setting);
            case 'select':
                return this.createSelect(setting);
            case 'colorPalette':
                return this.createColorPalette(setting);
            case 'button':  // Add button case
                return this.createButton(setting);
            case 'fileUpload':
                return this.createFileUpload(setting);
            default:
                return document.createElement('div');
        }
    }

    createToggle(setting) {
        const toggle = document.createElement('button');
        toggle.className = 'dev-menu-toggle';
        toggle.textContent = setting.getValue() ? 'ON' : 'OFF';
        toggle.onclick = () => {
            const newValue = !setting.getValue();
            setting.setValue(newValue);
            toggle.textContent = newValue ? 'ON' : 'OFF';
            toggle.classList.toggle('active', newValue);
        };
        return toggle;
    }

    createRange(setting) {
        const container = document.createElement('div');
        container.className = 'range-container';

        const range = document.createElement('input');
        range.type = 'range';
        range.min = setting.min;
        range.max = setting.max;
        range.step = setting.step;
        range.value = setting.getValue();

        const value = document.createElement('span');
        value.className = 'range-value';
        value.textContent = range.value;

        range.oninput = (e) => {
            const newValue = parseFloat(e.target.value);
            setting.setValue(newValue);
            value.textContent = newValue;
        };

        container.appendChild(range);
        container.appendChild(value);
        return container;
    }

    createSelect(setting) {
        const select = document.createElement('select');
        select.className = 'dev-menu-select';

        setting.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });

        select.value = setting.getValue();

        // Add focus/blur handlers for the blur effect
        select.onfocus = () => {
            this.menuElement.classList.add('selector-active');
        };

        select.onblur = () => {
            this.menuElement.classList.remove('selector-active');
        };

        select.onchange = (e) => setting.setValue(e.target.value);
        return select;
    }

    createColorPalette(setting) {
        const container = document.createElement('div');
        container.className = 'color-palette';

        const colors = setting.getColors();
        colors.forEach(color => {
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;

            if (color === setting.getValue()) {
                swatch.classList.add('active');
            }

            swatch.onclick = () => {
                container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                setting.setValue(color);
            };

            container.appendChild(swatch);
        });

        return container;
    }

    createButton(setting) {
        const button = document.createElement('button');
        button.className = 'dev-menu-button';
        button.textContent = setting.getValue();
        button.onclick = () => setting.setValue();
        return button;
    }

    createFileUpload(setting) {
        const container = document.createElement('div');
        container.className = 'file-upload-container';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = setting.accept;
        input.style.display = 'none';

        const button = document.createElement('button');
        button.className = 'dev-menu-button';
        button.textContent = setting.getValue();

        button.onclick = () => input.click();

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                button.textContent = file.name;
                setting.setValue(file);
            }
        };

        container.appendChild(button);
        container.appendChild(input);
        return container;
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.menuElement.classList.toggle('hidden');
        if (this.isVisible) {
            this.refreshAllControls();
        }
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F7') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    refreshColorPalette() {
        const muslinSection = this.menuElement.querySelector('.dev-menu-section');
        const colorPaletteControl = muslinSection.querySelector('.color-palette');
        if (colorPaletteControl) {
            const parent = colorPaletteControl.parentElement;
            const setting = this.layerControls.muslin.settings.colorPalette;
            const newPalette = this.createColorPalette(setting);
            parent.replaceChild(newPalette, colorPaletteControl);
        }
    }

    refreshAllControls() {
        if (!this.menuElement || !this.controls.size) return;

        this.controls.forEach(({ control, setting, input }) => {
            this.updateControlValue(input, setting);
        });
    }

    updateControlValue(input, setting) {
        const value = setting.getValue();

        switch (setting.type) {
            case 'toggle':
                input.textContent = value ? 'ON' : 'OFF';
                input.classList.toggle('active', value);
                break;

            case 'range':
                input.value = value;
                const valueDisplay = input.parentElement.querySelector('.range-value');
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                break;

            case 'select':
                if (setting.label === 'Preset') {
                    // Special handling for curtain preset
                    const preset = this.game.curtain.currentPreset || 'world';
                    input.value = preset;
                    if (!this.game.curtain.currentPreset) {
                        this.game.curtain.setPreset(preset);
                    }
                } else {
                    input.value = value;
                }
                break;

            case 'colorPalette':
                this.updateColorPalette(input, setting);
                break;
        }
    }

    updateColorPalette(input, setting) {
        const currentColor = this.game.muslin.currentColor; // Get actual current color
        const colors = setting.getColors();

        // Clear existing swatches
        while (input.firstChild) {
            input.removeChild(input.firstChild);
        }

        // Create new swatches with current colors
        colors.forEach(color => {
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;

            // Compare actual colors for active state
            if (color === currentColor) {
                swatch.classList.add('active');
            }

            swatch.onclick = () => {
                input.querySelectorAll('.color-swatch').forEach(s =>
                    s.classList.remove('active')
                );
                swatch.classList.add('active');
                setting.setValue(color);
            };

            input.appendChild(swatch);
        });
    }
}