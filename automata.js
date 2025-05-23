class Cell {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type; // "land" or "pond"
        this.foodAmount = 0; // Only relevant for pond cells
        this.fish = []; // Array to track fish in this cell
        this.fisherfolk = []; // Array to track fisherfolk in this cell
        this.eggs = []; // Array to track eggs in this cell
    }
}

class Automata {
    constructor() {
        gameEngine.automata = this;
        gameEngine.addEntity(this);

        this.rows = PARAMETERS.numRows;
        this.cols = PARAMETERS.numCols;
        this.ticksPerDay = PARAMETERS.ticksPerDay || 96;
        this.currentTick = 0;
        this.day = 0;
        this.borderWidth = PARAMETERS.borderWidth || 3;
        this.foodGrowthRate = PARAMETERS.foodGrowthRate || 0.05;
        this.maxFoodPerCell = PARAMETERS.maxFoodPerCell || 10;
        this.initialFoodAmount = PARAMETERS.initialFoodAmount || 3;

        // Initialize grid and population tracking
        this.grid = [];
        this.fish = []; // All fish in simulation
        this.eggs = []; // All eggs in simulation

        this.initializeAutomata();
        this.initializeFishPopulation();

        gameEngine.addEntity(new DataManager(this));
    }

    initializeAutomata() {
        // Create the grid of cells
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // Determine if this cell is land or pond
                const isLand = row < this.borderWidth || row >= this.rows - this.borderWidth ||
                    col < this.borderWidth || col >= this.cols - this.borderWidth;
                const type = isLand ? "land" : "pond";
                this.grid[row][col] = new Cell(row, col, type);

                // Initialize pond cells with some food
                if (type === "pond") {
                    this.grid[row][col].foodAmount = Math.random() * this.initialFoodAmount;
                }
            }
        }
    }

    initializeFishPopulation() {
        const initialFishCount = PARAMETERS.initialFishCount || 100;
        const pondCells = [];

        // Find all pond cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].type === "pond") {
                    pondCells.push(this.grid[row][col]);
                }
            }
        }

        // Create initial fish population
        for (let i = 0; i < initialFishCount; i++) {
            if (pondCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * pondCells.length);
                const cell = pondCells[randomIndex];

                // Create fish with parameters sampled from normal distributions
                const parameters = {
                    minFoodNeeded: generateNormalSample(PARAMETERS.minFoodNeeded, PARAMETERS.fishMinFoodNeededStdDev),
                    maxEggsPerDay: Math.round(generateNormalSample(PARAMETERS.maxEggsPerDay, PARAMETERS.fishMaxEggsPerDayStdDev)),
                    feedingThreshold: generateNormalSample(PARAMETERS.fishFeedingThresholdMean, PARAMETERS.fishFeedingThresholdStdDev),
                };

                // Cap parameters at reasonable values
                parameters.minFoodNeeded = Math.max(1, parameters.minFoodNeeded);
                parameters.maxEggsPerDay = Math.max(1, parameters.maxEggsPerDay);
                parameters.feedingThreshold = Math.min(1, Math.max(0.1, parameters.feedingThreshold));

                const fish = new Fish(this, cell.row, cell.col, parameters);
                this.fish.push(fish);
            }
        }
    }

    update() {
        this.currentTick = (this.currentTick + 1) % this.ticksPerDay;

        // New day begins
        if (this.currentTick === 0) {
            this.day++;
        }

        // Grow food
        this.growFood();


        // Process eggs before fish so new fish can act
        this.processEggs();

        // Update all fish
        for (let i = this.fish.length - 1; i >= 0; i--) {
            this.fish[i].update();

            // Check for fish death (not enough food at end of day)
            if (this.currentTick === this.ticksPerDay - 1) {
                if (Math.random() < PARAMETERS.fishDeathChance || this.fish[i].foodConsumed < this.fish[i].minFoodNeeded) {
                    this.fish[i].die();
                    this.fish.splice(i, 1);
                }
            }
        }
    }

    growFood() {
        // Grow food in pond cells using logistic growth model
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.type === "pond") {
                    // Logistic growth: food grows faster when scarce, slows as it approaches max
                    const growthFactor = 1 - (cell.foodAmount / this.maxFoodPerCell);
                    const baseGrowth = 0.01; // Small constant growth
                    const logisticGrowth = this.foodGrowthRate * cell.foodAmount * growthFactor;
                    const foodGrowth = cell.foodAmount > 0 ? logisticGrowth : baseGrowth;
                    cell.foodAmount = Math.min(cell.foodAmount + foodGrowth, this.maxFoodPerCell);
                }
            }
        }
    }

    processEggs() {
        // Update all eggs and remove hatched ones
        for (let i = this.eggs.length - 1; i >= 0; i--) {
            if (this.eggs[i].update()) {
                this.eggs.splice(i, 1);
            }
        }
    }

    // Helper methods for cell interactions
    getCell(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    consumeFood(row, col, amount) {
        const cell = this.getCell(row, col);
        if (cell && cell.type === "pond") {
            const consumed = Math.min(cell.foodAmount, amount);
            cell.foodAmount -= consumed;
            return consumed;
        }
        return 0;
    }

    draw(ctx) {
        if (!document.getElementById("drawVisuals").checked) return;

        const cellWidth = PARAMETERS.pixelDimension / this.cols;
        const cellHeight = PARAMETERS.pixelDimension / this.rows;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];

                // Color based on cell type and food amount
                let color;
                if (cell.type === "land") {
                    color = "rgb(139, 69, 19)"; // Brown for land
                } else {
                    // Blue gradient for pond: darker = more food
                    const foodRatio = cell.foodAmount / this.maxFoodPerCell;
                    const blue = Math.floor(105 + 150 * (1 - foodRatio));
                    color = `rgb(0, 105, ${blue})`;
                }

                // Draw cell
                ctx.fillStyle = color;
                ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

                // Draw grid lines
                ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
                ctx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

                // Draw fish
                if (cell.fish.length > 0) {
                    ctx.fillStyle = "white";
                    const fishRadius = Math.min(Math.max(4, cell.fish.length), Math.min(cellWidth, cellHeight) * 0.3);
                    const centerX = col * cellWidth + cellWidth / 2;
                    const centerY = row * cellHeight + cellHeight / 2;

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, fishRadius, 0, 2 * Math.PI);
                    ctx.fill();
                    if (cell.fish.length > 0) {
                        ctx.fillStyle = "black";
                        ctx.textAlign = "center";
                        ctx.fillText(cell.fish.length, centerX, centerY + cellHeight * 0.4);
                    }
                }

                // Draw eggs
                if (cell.eggs && cell.eggs.length > 0) {
                    ctx.fillStyle = "rgba(255, 255, 0, 0.5)"; // Yellow for eggs
                    const eggRadius = Math.min(cellWidth, cellHeight) * 0.15;
                    const centerX = col * cellWidth + cellWidth / 2;
                    const centerY = row * cellHeight + cellHeight / 2;

                    // Draw eggs as small yellow circles
                    for (let i = 0; i < Math.min(cell.eggs.length, 5); i++) {
                        const angle = (i / Math.min(cell.eggs.length, 5)) * 2 * Math.PI;
                        const x = centerX + Math.cos(angle) * cellWidth * 0.25;
                        const y = centerY + Math.sin(angle) * cellHeight * 0.25;

                        ctx.beginPath();
                        ctx.arc(x, y, eggRadius, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                    // If there are many eggs, display a count
                    if (cell.eggs.length > 5) {
                        ctx.fillStyle = "black";
                        ctx.textAlign = "center";
                        ctx.fillText(cell.eggs.length, centerX, centerY - cellHeight * 0.3);
                    }
                }
            }
        }
    }
}