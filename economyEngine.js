// Economic engine: Core logic
let gameState = {
    mode: 'beginner',
    turn: 0,
    population: 100000, // Initial population: 100,000
    taxRate: 0.1,
    categories: ['housing'], // Beginner mode: Housing only
    demands: { housing: 100000, employment: 0, resources: 0 },
    supplies: { housing: 100000, employment: 0, resources: 0 },
    prices: { housing: 1, employment: 1, resources: 1 },
    inflation: 0,
    history: { population: [], balances: [], prices: [] },
    goalPopulation: 10000000 // Beginner: 10 million
};

function initGame(mode) {
    gameState.mode = mode;
    if (mode === 'advanced') {
        gameState.categories = ['housing', 'employment', 'resources'];
        gameState.demands = { housing: 100000, employment: 100000, resources: 100000 };
        gameState.supplies = { housing: 100000, employment: 100000, resources: 100000 };
        gameState.prices = { housing: 1, employment: 1, resources: 1 };
        gameState.goalPopulation = 100000000; // Advanced: 100 million
    }
    resetGame();
}

function resetGame() {
    gameState.turn = 0;
    gameState.population = 100000;
    gameState.taxRate = 0.1;
    Object.keys(gameState.demands).forEach(cat => {
        gameState.demands[cat] = 100000;
        gameState.supplies[cat] = 100000;
        gameState.prices[cat] = 1;
    });
    gameState.inflation = 0;
    gameState.history = { population: [], balances: [], prices: [] };
    addLog('Game reset: A new city begins.');
}

function nextTurn() {
    gameState.turn++;
    calculateDemands();
    adjustSupplies();
    updatePrices();
    updatePopulation();
    checkWinLose();
    updateHistory();
    addLog(`Turn ${gameState.turn}: Population ${gameState.population.toLocaleString()}`);
    updateUI(); // Ensure UI refreshes after each turn
}

function calculateDemands() {
    gameState.categories.forEach(cat => {
        gameState.demands[cat] = gameState.population * (1 - gameState.taxRate); // Lower taxes boost demand
        if (gameState.mode === 'advanced' && Math.random() < 0.05) {
            const event = Math.random() < 0.5 ? 'Immigration Boom' : 'Disaster';
            if (event === 'Immigration Boom') {
                gameState.demands[cat] *= 1.1;
                addLog(`Event: ${event} - Demand +10%`);
            } else {
                gameState.supplies[cat] *= 0.8;
                addLog(`Event: ${event} - Supply -20%`);
            }
        }
    });
}

function adjustSupplies() {
    gameState.categories.forEach(cat => {
        const adjustmentFactor = (gameState.demands[cat] - gameState.supplies[cat]) / gameState.supplies[cat] || 0;
        gameState.supplies[cat] *= (1 + adjustmentFactor * 0.5); // Automatic adjustment
    });
}

function updatePrices() {
    let totalInflation = 0;
    gameState.categories.forEach(cat => {
        if (gameState.demands[cat] > gameState.supplies[cat]) {
            gameState.prices[cat] *= 1.1;
            addLog(`${cat.charAt(0).toUpperCase() + cat.slice(1)}: Demand excess - Price +10%`);
        } else {
            gameState.prices[cat] *= 0.9;
            addLog(`${cat.charAt(0).toUpperCase() + cat.slice(1)}: Supply surplus - Price -10%`);
        }
        totalInflation += (gameState.prices[cat] - 1);
    });
    gameState.inflation = totalInflation / gameState.categories.length;
}

function updatePopulation() {
    let fulfillment = 1;
    gameState.categories.forEach(cat => {
        fulfillment *= (gameState.supplies[cat] / gameState.demands[cat] || 1);
    });
    const stability = 1 - Math.abs(gameState.inflation);
    const growthRate = fulfillment * stability * 0.05; // Population growth rate
    gameState.population = Math.max(0, gameState.population * (1 + growthRate));
}

function checkWinLose() {
    if (gameState.population >= gameState.goalPopulation) {
        alert('Congratulations! Your city has grown into a megacity.');
    } else if (gameState.population <= 0 || gameState.turn >= 120) {
        alert('Defeat: Economic collapse or time limit reached.');
        resetGame();
    }
}

function updateHistory() {
    gameState.history.population.push(gameState.population);
    const balances = gameState.categories.map(cat => gameState.supplies[cat] - gameState.demands[cat]);
    gameState.history.balances.push(balances);
    const prices = gameState.categories.map(cat => gameState.prices[cat]);
    gameState.history.prices.push(prices);
}

function invest(category) {
    if (gameState.categories.includes(category)) {
        gameState.supplies[category] *= 1.2; // Investment boosts supply by 20%
        addLog(`${category.charAt(0).toUpperCase() + category.slice(1)} Investment: Supply +20%`);
    }
}

function boostEconomy() {
    gameState.categories.forEach(cat => {
        gameState.demands[cat] *= 1.15; // Temporary demand boost +15%
    });
    addLog('Economy Boost: Demand increased across categories, but watch for inflation!');
}

function stabilizeMarket() {
    gameState.categories.forEach(cat => {
        gameState.prices[cat] = (gameState.prices[cat] + 1) / 2; // Average prices toward 1 for stability
    });
    gameState.inflation *= 0.5; // Halve inflation
    addLog('Market Stabilized: Prices moderated, growth may slow.');
}

function setTaxRate(rate) {
    gameState.taxRate = rate / 100;
}

function addLog(message) {
    const logEvent = new CustomEvent('addLog', { detail: message });
    document.dispatchEvent(logEvent);
}

function saveGame() {
    localStorage.setItem('economySim', JSON.stringify(gameState));
    addLog('Game saved.');
}

function loadGame() {
    const saved = localStorage.getItem('economySim');
    if (saved) {
        gameState = JSON.parse(saved);
        addLog('Game loaded.');
        updateUI();
    }
}