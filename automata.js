class Automata {
    constructor() {
        gameEngine.automata = this;
        gameEngine.addEntity(this);

        this.rows = PARAMETERS.numRows; // Number of rows in the grid
        this.cols = PARAMETERS.numCols; // Number of columns in the grid
        this.generation = 0;

        // Initialize current and next grids
        this.grid = [];

        this.initializeAutomata();

        gameEngine.addEntity(new DataManager(this));
    }

    initializeAutomata() {

    }

    update() {
 
    }

    // Draw the entire grid of populations
    draw(ctx) {

    }
}
