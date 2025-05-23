class Fish {
    constructor(automata, row, col, parameters = {}) {
        this.automata = automata;
        this.row = row;
        this.col = col;
        
        // Add the fish to the cell
        this.automata.grid[row][col].fish.push(this);
        
        // Fish parameters with defaults
        this.minFoodNeeded = parameters.minFoodNeeded !== undefined ? 
            parameters.minFoodNeeded : PARAMETERS.minFoodNeeded;
        this.maxEggsPerDay = parameters.maxEggsPerDay !== undefined ? 
            parameters.maxEggsPerDay : PARAMETERS.maxEggsPerDay;
        this.feedingThreshold = parameters.feedingThreshold !== undefined ? 
            parameters.feedingThreshold : PARAMETERS.fishFeedingThresholdMean;
        
        // Current state
        this.phase = "egg_laying"; // egg_laying, feeding, dormant
        this.foodConsumed = 0;
        this.eggsToLay = 0; // Calculated at beginning of day
        this.eggsLaid = 0;
        this.age = 0; // In days
        
        // Movement and action planning
        this.targetCell = null;
        this.plannedAction = null; // "move", "lay_egg", "feed", "rest"
    }
    
    update() {
        // Update based on current phase
        switch(this.phase) {
            case "egg_laying":
                this.updateEggLaying();
                break;
            case "feeding":
                this.updateFeeding();
                break;
            case "dormant":
                this.updateDormant();
                break;
        }
        
        // Execute planned action
        this.executeAction();
    }
    
    updateEggLaying() {
        // First tick of the day: calculate eggs to lay based on yesterday's food
        if (this.automata.currentTick === 0) {
            // Calculate excess food after meeting minimum needs
            const excessFood = Math.max(0, this.foodConsumed - this.minFoodNeeded);
            this.eggsToLay = Math.min(Math.floor(excessFood)*PARAMETERS.eggsPerFood, this.maxEggsPerDay);
            this.eggsLaid = 0;
            this.foodConsumed = 0; // Reset for the new day
            this.age++;
        }
        
        // If we have eggs to lay, plan to lay them
        if (this.eggsLaid < this.eggsToLay) {
            // Find best cell to lay egg
            this.targetCell = this.findBestEggLayingCell();
            
            if (this.targetCell === this.getCurrentCell()) {
                this.plannedAction = "lay_egg";
            } else {
                this.plannedAction = "move";
            }
        } else {
            // All eggs laid, move to feeding phase
            this.phase = "feeding";
            // Plan first feeding action
            this.plannedAction = this.planFeedingAction();
        }
    }
    
    updateFeeding() {
        // Check if we should move to dormant phase
        if (this.foodConsumed >= this.minFoodNeeded + this.maxEggsPerDay) {
            this.phase = "dormant";
            this.plannedAction = "rest";
            return;
        }
        
        // Continue feeding
        this.plannedAction = this.planFeedingAction();
    }
    
    updateDormant() {
        // Stay dormant until next day's egg laying phase
        if (this.automata.currentTick === this.automata.ticksPerDay - 1) {
            this.phase = "egg_laying";
        }
        this.plannedAction = "rest";
    }
    
    executeAction() {
        switch (this.plannedAction) {
            case "move":
                this.moveToCell(this.targetCell);
                break;
            case "lay_egg":
                this.layEgg();
                break;
            case "feed":
                this.feed();
                break;
            case "rest":
                // Do nothing - resting
                break;
        }
    }
    
    moveToCell(targetCell) {
        // Remove from current cell
        const currentCell = this.getCurrentCell();
        const index = currentCell.fish.indexOf(this);
        if (index > -1) {
            currentCell.fish.splice(index, 1);
        }
        
        // Add to target cell
        targetCell.fish.push(this);
        
        // Update position
        this.row = targetCell.row;
        this.col = targetCell.col;
    }
    
    layEgg() {
        // Create a new egg in the current cell
        this.eggsLaid++;
        
        const currentCell = this.getCurrentCell();
        const hatchTime = (this.automata.currentTick + PARAMETERS.eggHatchingTime) % this.automata.ticksPerDay;
        
        // Create parameters for offspring based on parent
        const parentParameters = {
            minFoodNeeded: this.minFoodNeeded,
            maxEggsPerDay: this.maxEggsPerDay,
            feedingThreshold: this.feedingThreshold,
        };
        
        const egg = new Egg(this.automata, currentCell.row, currentCell.col, hatchTime, parentParameters);
        this.automata.eggs.push(egg);
    }
    
    feed() {
        const cell = this.getCurrentCell();
        // Feeding success is proportional to food available
        const feedingProbability = cell.foodAmount / this.automata.maxFoodPerCell;
        
        if (Math.random() < feedingProbability) {
            // Successful feeding - consume some food
            const foodConsumed = this.automata.consumeFood(this.row, this.col, 1);
            this.foodConsumed += foodConsumed;
        }
    }
    
    // Helper methods
    getCurrentCell() {
        return this.automata.grid[this.row][this.col];
    }
    
    getMooreNeighborhood() {
        const neighbors = [];
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const cell = this.automata.getCell(this.row + r, this.col + c);
                if (cell) {
                    neighbors.push(cell);
                }
            }
        }
        return neighbors;
    }
    
    findBestEggLayingCell() {
        // Look for cells with fewer fish/eggs to spread out reproduction
        const neighbors = this.getMooreNeighborhood();
        let pondNeighbors = neighbors.filter(cell => cell.type === "pond");
        
        if (pondNeighbors.length === 0) {
            return this.getCurrentCell();
        }
        
        // Sort by number of fish (ascending)
        pondNeighbors.sort((a, b) => a.eggs.length - b.eggs.length);
        pondNeighbors = pondNeighbors.filter((cell => cell.eggs.length === pondNeighbors[0].eggs.length));
        return pondNeighbors[randomInt(pondNeighbors.length)];
    }
    
    planFeedingAction() {
        // Look for cells with most food
        const neighbors = this.getMooreNeighborhood();
        let pondNeighbors = neighbors.filter(cell => cell.type === "pond");
        
        if (pondNeighbors.length === 0) {
            return "rest"; // No valid cells to move to
        }
        
        // Sort by food amount (descending)
        pondNeighbors.sort((a, b) => b.foodAmount - a.foodAmount);
        pondNeighbors = pondNeighbors.filter((cell => Math.abs(cell.foodAmount - pondNeighbors[0].foodAmount) <= PARAMETERS.feedSelectionDifference));

        // If current cell has food, may choose to stay and feed
        const currentCell = this.getCurrentCell();
        if (currentCell.type === "pond" && currentCell.foodAmount > 0) {
            if (currentCell.foodAmount >= pondNeighbors[0].foodAmount * 0.8) {
                this.targetCell = currentCell;
                return "feed";
            }
        }
        
        // Move to cell with most food
        this.targetCell = pondNeighbors[randomInt(pondNeighbors.length)];
        
        if (this.targetCell === currentCell) {
            return "feed";
        } else {
            return "move";
        }
    }
    
    die() {
        // Remove from current cell
        const currentCell = this.getCurrentCell();
        const index = currentCell.fish.indexOf(this);
        if (index > -1) {
            currentCell.fish.splice(index, 1);
        }
        
        // Fish is already removed from the automata.fish array in the update method
        this.removeFromWorld = true;
    }
}