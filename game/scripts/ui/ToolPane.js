class ToolPane {
    constructor(options = {}) {
        const defaults = {
            id: 'tool-pane',
            title: 'Tool Pane',
            icon: '🔧',
            position: { right: '20px', top: '20px' },
            visible: PanelStateManager.getVisibilityState(options.id), // Load saved state
            collapsed: false,
            hotkey: null,
            className: 'tool-pane'
        };

        this.options = { ...defaults, ...options };
        this.isVisible = this.options.visible;
        this.isCollapsed = this.options.collapsed;
        this.sections = new Map();

        this.initialize();
    }

    initialize() {
        this.createContainer();
        this.createHeader();
        this.createContent();
        this.bindEvents();
    }

    createContainer() {
        this.element = document.createElement('div');
        this.element.id = this.options.id;
        this.element.className = `${this.options.className} ${!this.isVisible ? 'hidden' : ''}`;
        Object.entries(this.options.position).forEach(([key, value]) => {
            this.element.style[key] = value;
        });
        document.body.appendChild(this.element);
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = `${this.options.className}-header`;

        const title = document.createElement('h3');
        title.innerHTML = `${this.options.icon} ${this.options.title}`;

        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'collapse-btn';
        collapseBtn.textContent = this.isCollapsed ? '▶' : '▼';
        collapseBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleCollapse();
        };

        header.appendChild(title);
        header.appendChild(collapseBtn);
        this.element.appendChild(header);

        // Make draggable
        MenuDraggable.makeDraggable(this.element, header, this.options.position);
    }

    createContent() {
        this.content = document.createElement('div');
        this.content.className = `${this.options.className}-content`;
        if (this.isCollapsed) this.content.classList.add('collapsed');
        this.element.appendChild(this.content);
    }

    addSection(title, options = {}) {
        const section = this.createSection(title, options);
        this.sections.set(title, section);
        this.content.appendChild(section.element);
        return section;
    }

    createSection(title, options = {}) {
        const section = {
            element: document.createElement('div'),
            content: document.createElement('div'),
            controls: new Map()
        };

        section.element.className = `${this.options.className}-section`;
        
        const header = document.createElement('div');
        header.className = `${this.options.className}-section-header`;
        header.innerHTML = `
            <h4>${title}</h4>
            <button class="collapse-btn">▼</button>
        `;

        section.content.className = `${this.options.className}-section-content`;

        header.onclick = () => {
            section.content.classList.toggle('collapsed');
            header.querySelector('.collapse-btn').textContent = 
                section.content.classList.contains('collapsed') ? '▶' : '▼';
        };

        section.element.appendChild(header);
        section.element.appendChild(section.content);

        return section;
    }

    addControl(sectionTitle, control) {
        const section = this.sections.get(sectionTitle);
        if (!section) return;

        const controlElement = this.createControl(control);
        section.controls.set(control.id, controlElement);
        section.content.appendChild(controlElement);
        return controlElement;
    }

    createControl(setting) {
        const wrapper = document.createElement('div');
        wrapper.className = `${this.options.className}-control`;
        
        const label = document.createElement('label');
        label.textContent = setting.label || '';
        wrapper.appendChild(label);

        // Ensure setting has getValue and setValue functions
        if (!setting.getValue) {
            setting.getValue = () => setting.value || '';
        }
        if (!setting.setValue) {
            setting.setValue = (value) => {
                setting.value = value;
                if (setting.onChange) {
                    setting.onChange(value);
                }
            };
        }

        const control = this.createControlElement(setting);
        wrapper.appendChild(control);

        return wrapper;
    }

    createControlElement(setting) {
        switch (setting.type) {
            case 'toggle':
                return this.createToggle(setting);
            case 'range':
                return this.createRange(setting);
            case 'select':
                return this.createSelect(setting);
            case 'number':
                return this.createNumber(setting);
            case 'button':
                return this.createButton(setting);
            case 'fileUpload':
                return this.createFileUpload(setting);
            case 'display':
                return this.createDisplay(setting);
            default:
                console.warn(`Unknown control type: ${setting.type}`);
                return document.createElement('div');
        }
    }

    createSelect(options) {
        const select = document.createElement('select');
        select.className = `${this.options.className}-select`;

        // Add options to select element
        options.options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            select.appendChild(option);
        });

        // Set initial value
        select.value = options.getValue();

        // Add change handler
        select.addEventListener('change', (e) => {
            if (options.setValue) {
                options.setValue(e.target.value);
            }
        });

        return select;
    }

    createToggle(options) {
        const button = document.createElement('button');
        button.className = `${this.options.className}-toggle`;
        button.classList.toggle('active', options.getValue());
        button.textContent = options.getValue() ? 'ON' : 'OFF';

        button.onclick = () => {
            const newValue = !options.getValue();
            options.setValue(newValue);
            button.classList.toggle('active', newValue);
            button.textContent = newValue ? 'ON' : 'OFF';
        };

        return button;
    }

    createRange(options) {
        const container = document.createElement('div');
        container.className = `${this.options.className}-range-container`;

        const range = document.createElement('input');
        range.type = 'range';
        range.className = `${this.options.className}-range`;
        range.min = options.min || 0;
        range.max = options.max || 100;
        range.step = options.step || 1;
        range.value = options.getValue();

        const value = document.createElement('span');
        value.className = `${this.options.className}-range-value`;
        value.textContent = range.value;

        range.oninput = () => {
            options.setValue(Number(range.value));
            value.textContent = range.value;
        };

        container.appendChild(range);
        container.appendChild(value);
        return container;
    }

    createNumber(setting) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = `${this.options.className}-number`;
        input.min = setting.min ?? 0;
        input.max = setting.max ?? 100;
        input.step = setting.step ?? 1;
        input.value = setting.getValue();

        input.onchange = (e) => {
            setting.setValue(Number(e.target.value));
        };

        return input;
    }

    createDisplay(setting) {
        const display = document.createElement('span');
        display.className = `${this.options.className}-value`;
        display.textContent = setting.getValue();
        return display;
    }

    createButton(setting) {
        const button = document.createElement('button');
        button.className = `${this.options.className}-button`;
        button.textContent = setting.label || 'Button';
        button.onclick = () => {
            if (setting.onClick) {
                setting.onClick();
            }
        };
        return button;
    }

    createFileUpload(setting) {
        const container = document.createElement('div');
        container.className = 'file-upload-container';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = setting.accept || '*';
        fileInput.style.display = 'none';

        const button = document.createElement('button');
        button.className = `${this.options.className}-button`;
        button.textContent = setting.getValue();

        button.onclick = () => fileInput.click();

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                button.textContent = file.name;
                setting.setValue(file);
            }
        };

        container.appendChild(button);
        container.appendChild(fileInput);
        return container;
    }

    bindEvents() {
        if (this.options.hotkey) {
            document.addEventListener('keydown', (e) => {
                if (e.key === this.options.hotkey) {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.element.classList.toggle('hidden', !this.isVisible);
        PanelStateManager.setVisibilityState(this.options.id, this.isVisible);
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.content.classList.toggle('collapsed');
        this.element.querySelector('.collapse-btn').textContent = 
            this.isCollapsed ? '▶' : '▼';
    }

    destroy() {
        this.element.remove();
    }
}

class PanelStateManager {
    static getVisibilityState(panelId) {
        const state = localStorage.getItem(`panel_${panelId}_visible`);
        return state === null ? false : state === 'true';
    }

    static setVisibilityState(panelId, isVisible) {
        localStorage.setItem(`panel_${panelId}_visible`, isVisible);
    }
}