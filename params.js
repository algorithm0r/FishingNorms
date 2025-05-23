var PARAMETERS = {
    // graph settings
    graphWidth: 400,
    graphHeight: 100,
    
    // Environment Settings
    numRows: 16,
    numCols: 16,
    pixelDimension: 800,
    borderWidth: 3,
    ticksPerDay: 96,  // 96 ticks per day (4 ticks per hour)
    updatesPerDraw: 1,
    
    // Food Settings
    foodGrowthRate: 0.2,
    maxFoodPerCell: 10,
    initialFoodAmount: 3,
    
    // Fish Population Settings
    initialFishCount: 10,
    eggHatchingTime: 96, // Ticks until an egg hatches (1 day)
    eggDeathChance: 0.01, // per tick
    eggsPerFood: 1,
    
    // Fish Parameter Distributions
    minFoodNeeded: 10,
    fishMinFoodNeededStdDev: 0,
    maxEggsPerDay: 10,
    fishMaxEggsPerDayStdDev: 0,
    feedSelectionDifference: 1,
    fishDeathChance: 0.5, // per day

    // Reporting
    reportingPeriod: 96,
    
    // Database
    db: "fishingNormsDB",
    collection: "test",
    ip: 'https://73.19.38.112:8888'
};

function loadParameters() {
    // Environment parameters
    PARAMETERS.numRows = parseInt(document.getElementById("numRows").value);
    PARAMETERS.numCols = parseInt(document.getElementById("numCols").value);
    PARAMETERS.borderWidth = parseInt(document.getElementById("borderWidth").value);
    
    // Food parameters
    PARAMETERS.foodGrowthRate = parseFloat(document.getElementById("foodGrowthRate").value);
    PARAMETERS.maxFoodPerCell = parseInt(document.getElementById("maxFoodPerCell").value);
    PARAMETERS.initialFoodAmount = parseFloat(document.getElementById("initialFoodAmount").value);
    
    // Fish parameters
    PARAMETERS.eggDeathChance = parseFloat(document.getElementById("eggDeathChance").value);
    PARAMETERS.minFoodNeeded = parseFloat(document.getElementById("minFoodNeeded").value);
    PARAMETERS.maxEggsPerDay = parseInt(document.getElementById("maxEggsPerDay").value);
    PARAMETERS.fishDeathChance = parseFloat(document.getElementById("fishDeathChance").value);
    
    console.log("Parameters loaded:", PARAMETERS);
}