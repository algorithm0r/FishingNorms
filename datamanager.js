class DataManager {
    constructor(automata) {
        this.automata = automata;

        // population data
      
    }

    updateData() {
    
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
        if (this.automata.generation % PARAMETERS.reportingPeriod === 0) this.updateData();
    }

    draw(ctx) {
        // Draw the histogram, handled by the Histogram class in the game engine
    }
}
