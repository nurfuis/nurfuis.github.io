class Console extends ToolPane {
    constructor(game) {
        super({
            id: 'game-console',
            title: 'CONSOLE (F1)',
            icon: '⌨️',
            position: { top: '20px', left: '360px' },
            hotkey: 'F1',
            visible: PanelStateManager.getVisibilityState('game-console')
        });
        
        this.game = game;
        this.history = [];
        this.historyIndex = -1;
        this.commands = this.initializeCommands();
        
        this.setupConsole();
    }

    setupConsole() {
        const inputSection = this.addSection('Input');
        
        // Create input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'console-input-wrapper';
        
        // Create input element
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'console-input';
        this.input.placeholder = 'Type a command...';
        
        // Add input handlers
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        
        inputWrapper.appendChild(this.input);
        inputSection.content.appendChild(inputWrapper);
        
        // Create output section
        const outputSection = this.addSection('Output');
        this.output = document.createElement('div');
        this.output.className = 'console-output';
        outputSection.content.appendChild(this.output);
    }

    initializeCommands() {
        return {
            'reset': {
                description: 'Reset game state to default',
                execute: () => {
                    localStorage.removeItem('gameState');
                    this.log('Game state reset. Reloading...');                   
                    setTimeout(() => window.location.reload(), 1000);

                }
            },
            'help': {
                description: 'Show available commands',
                execute: () => {
                    const commands = Object.entries(this.commands)
                        .map(([name, cmd]) => `${name}: ${cmd.description}`)
                        .join('\n');
                    this.log('Available commands:\n' + commands);
                }
            },
            'debug': {
                description: 'Toggle debug mode settings',
                execute: (setting, value) => {
                    if (!setting) {
                        this.log('Current debug settings:');
                        Object.entries(DEBUG).forEach(([key, value]) => {
                            this.log(`${key}: ${value}`);
                        });
                        return;
                    }
                    
                    if (setting in DEBUG) {
                        DEBUG[setting] = value === 'true';
                        this.log(`Set ${setting} to ${DEBUG[setting]}`);
                        if (setting === 'BYPASS_SAVE') {
                            this.log('Reload page to apply changes');
                        }
                    } else {
                        this.log(`Unknown debug setting: ${setting}`);
                    }
                }
            }
        };
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const input = this.input.value.trim();
            if (!input) return;

            // Add to history
            this.history.push(input);
            this.historyIndex = this.history.length;

            // Process command
            this.executeCommand(input);
            
            // Clear input
            this.input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    }

    executeCommand(input) {
        const [command, ...args] = input.split(' ');
        
        if (this.commands[command]) {
            this.log(`> ${input}`);
            try {
                this.commands[command].execute(...args);
            } catch (error) {
                this.log(`Error: ${error.message}`, 'error');
            }
        } else {
            this.log(`Unknown command: ${command}. Type 'help' for available commands.`, 'error');
        }
    }

    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `console-entry console-${type}`;
        entry.textContent = message;
        this.output.appendChild(entry);
        this.output.scrollTop = this.output.scrollHeight;
    }
}