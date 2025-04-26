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
    foodGrowthRate: 0.05,
    maxFoodPerCell: 10,
    initialFoodAmount: 3,
    
    // Fish Population Settings
    initialFishCount: 100,
    eggHatchingTime: 96, // Ticks until an egg hatches (1/4 day)
    
    // Fish Parameter Distributions
    fishMinFoodNeededMean: 5,
    fishMinFoodNeededStdDev: 0,
    fishMaxEggsPerDayMean: 10,
    fishMaxEggsPerDayStdDev: 0,
    fishFeedingThresholdMean: 0.1, // Probability to stop feeding and go dormant when min food is met
    fishFeedingThresholdStdDev: 0,
    feedSelectionDifference: 1,
    
    // Reporting
    reportingPeriod: 96,
    
    // Database
    db: "fishingNormsDB",
    collection: "test",
    ip: 'https://73.19.38.112:8888'
};

function loadParameters() {
    console.log(PARAMETERS);
}