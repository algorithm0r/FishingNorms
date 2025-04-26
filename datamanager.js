class DataManager {
    constructor(automata) {
        this.automata = automata;

        // population data
        this.fish = [];
        this.eggs = [];

        gameEngine.addGraph(new Graph(800, 0, [this.fish, this.eggs], "Fish and Eggs", 0, 0));

    }

    updateData() {
        this.fish.push(this.automata.fish.length);
        this.eggs.push(this.automata.eggs.length);
    }

    logData() {
        const data = {
            db: PARAMETERS.db,
            collection: PARAMETERS.collection,
            data: {
                PARAMS: PARAMETERS,
                geneticHistogramData: this.geneticHistogramData
            }
        };

        if (socket) socket.emit("insert", data);
    }

    update() {
        // Update data each frame
        if (this.automata.currentTick % PARAMETERS.reportingPeriod === 0) this.updateData();
    }

    draw(ctx) {
        // Draw the histogram, handled by the Histogram class in the game engine
    }
}
