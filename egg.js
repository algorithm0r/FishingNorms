class Egg {
    constructor(automata, row, col, hatchTime, parentParameters) {
        this.automata = automata;
        this.row = row;
        this.col = col;
        this.hatchTime = hatchTime;
        this.parentParameters = parentParameters;
        
        // Add egg to cell
        this.automata.grid[row][col].eggs = this.automata.grid[row][col].eggs || [];
        this.automata.grid[row][col].eggs.push(this);
    }
    
    update() {
        // Check if it's time to hatch
        if (this.automata.currentTick === this.hatchTime) {
            this.hatch();
            this.hatched = true;
        }

        if(this.hatched || Math.random() < PARAMETERS.eggDeathChance)  {
            // Remove from cell
            const cell = this.automata.grid[this.row][this.col];
            const index = cell.eggs.indexOf(this);
            if (index > -1) {
                cell.eggs.splice(index, 1);
            }
            
            return true; // Return true to indicate the egg should be removed
        }
        
        return false;
    }
    
    hatch() {        
        const newFish = new Fish(this.automata, this.row, this.col);
        // const newFish = new Fish(this.automata, this.row, this.col, this.parentParameters); // for evolving
        this.automata.fish.push(newFish);
    }
}