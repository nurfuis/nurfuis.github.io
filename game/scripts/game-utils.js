class AutomatedInput {
    constructor(directions = [
        { direction: "left", weight: 2 },
        { direction: "right", weight: 2 },
        { direction: "up", weight: 1 },
        { direction: "down", weight: 1 },
        { direction: "up-left", weight: 0.5 },
        { direction: "up-right", weight: 0.5 },
        { direction: "down-left", weight: 0.5 },
        { direction: "down-right", weight: 0.5 },
        { direction: "up-two", weight: 0.3 },
        { direction: "up-left-two", weight: 0.2 },
        { direction: "up-right-two", weight: 0.2 },
        { direction: "up-three-left-one", weight: 0.1 },
        { direction: "up-three-right-one", weight: 0.1 }
    ], interval = 1000) {
        this.directions = directions;
        this.interval = interval;
        this.currentDirection = null;
        this.heldKeys = [];

        // Calculate total weight
        this.totalWeight = this.directions.reduce((sum, dir) => sum + dir.weight, 0);

        this.scheduleNextInput();
    }

    get direction() {
        return this.currentDirection;
    }

    scheduleNextInput() {
        setTimeout(() => {
            this.chooseRandomDirection();
            this.scheduleNextInput();
        }, this.interval);
    }

    chooseRandomDirection() {
        // Get random value between 0 and total weight
        const random = Math.random() * this.totalWeight;
        let weightSum = 0;

        // Find the direction based on weight
        for (const dir of this.directions) {
            weightSum += dir.weight;
            if (random <= weightSum) {
                this.currentDirection = dir.direction;
                return;
            }
        }

        // Fallback to center
        this.currentDirection = 'center';
    }
}

class MenuDraggable {
    static makeDraggable(element, headerElement, initialPosition = { right: '20px', top: '20px' }) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Set initial position
        if (initialPosition.right) {
            element.style.right = initialPosition.right;
            element.style.left = 'auto';
            // Calculate initial X offset from right
            const rect = element.getBoundingClientRect();
            xOffset = window.innerWidth - rect.right;
        } else {
            element.style.left = initialPosition.left || '20px';
        }
        element.style.top = initialPosition.top;

        headerElement.style.cursor = 'grab';

        headerElement.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target === headerElement || headerElement.contains(e.target)) {
                const rect = element.getBoundingClientRect();
                xOffset = e.clientX - rect.left;
                yOffset = e.clientY - rect.top;
                initialX = rect.left;
                initialY = rect.top;
                isDragging = true;
                headerElement.style.cursor = 'grabbing';
            }
        }

        function drag(e) {
            if (!isDragging) return;

            e.preventDefault();
            
            // Calculate new position
            let newX = e.clientX - xOffset;
            let newY = e.clientY - yOffset;

            // Get window and element boundaries
            const rect = element.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            // Constrain to window bounds with padding
            const padding = 10;
            newX = Math.min(Math.max(padding, newX), maxX - padding);
            newY = Math.min(Math.max(padding, newY), maxY - padding);

            setTranslate(newX, newY, element);
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            headerElement.style.cursor = 'grab';
        }

        function setTranslate(xPos, yPos, el) {
            // Reset right position when dragging
            el.style.right = 'auto';
            el.style.left = `${xPos}px`;
            el.style.top = `${yPos}px`;
        }
    }
}