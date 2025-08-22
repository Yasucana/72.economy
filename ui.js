// UI updates and chart rendering
let charts = {};

function initUI() {
    initCharts();
    document.getElementById('tax-slider').addEventListener('input', (e) => {
        document.getElementById('tax-value').textContent = `${e.target.value}%`;
        setTaxRate(e.target.value);
    });
    document.getElementById('invest-housing').addEventListener('click', () => invest('housing'));
    document.getElementById('invest-employment').addEventListener('click', () => invest('employment'));
    document.getElementById('invest-resources').addEventListener('click', () => invest('resources'));
    document.getElementById('boost-economy').addEventListener('click', boostEconomy);
    document.getElementById('stabilize-market').addEventListener('click', stabilizeMarket);
    document.getElementById('next-turn').addEventListener('click', nextTurn);
    document.getElementById('reset').addEventListener('click', resetGame);
    document.getElementById('save').addEventListener('click', saveGame);
    document.getElementById('load').addEventListener('click', loadGame);
    document.addEventListener('addLog', (e) => {
        const li = document.createElement('li');
        li.textContent = e.detail;
        document.getElementById('logs').appendChild(li);
        document.getElementById('log-area').scrollTop = document.getElementById('log-area').scrollHeight;
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') nextTurn();
    });
    if (gameState.mode === 'beginner') {
        document.getElementById('invest-employment').style.display = 'none';
        document.getElementById('invest-resources').style.display = 'none';
    }
    updateUI(); // Initial UI update
}

function initCharts() {
    charts.population = new Chart(document.getElementById('population-chart'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Population Trend', data: [], borderColor: 'green', fill: false }] },
        options: { responsive: true, interaction: { mode: 'index', intersect: false } }
    });
    charts.balance = new Chart(document.getElementById('balance-chart'), {
        type: 'bar',
        data: { labels: gameState.categories, datasets: [{ label: 'Supply-Demand Balance', data: [], backgroundColor: ['green', 'blue', 'orange'] }] },
        options: { responsive: true }
    });
    charts.price = new Chart(document.getElementById('price-chart'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true, elements: { line: { fill: true } } } // Area fill for better visuals
    });
}

function updateUI() {
    // Safeguard for empty history
    const turnLabels = Array.from({ length: gameState.history.population.length || 1 }, (_, i) => i + 1);
    charts.population.data.labels = turnLabels;
    charts.population.data.datasets[0].data = gameState.history.population.length ? gameState.history.population : [gameState.population];
    charts.population.update();

    const balances = gameState.categories.map(cat => gameState.supplies[cat] - gameState.demands[cat]);
    charts.balance.data.labels = gameState.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
    charts.balance.data.datasets[0].data = balances;
    charts.balance.data.datasets[0].backgroundColor = balances.map(b => b >= 0 ? 'green' : 'red');
    charts.balance.update();

    charts.price.data.labels = turnLabels;
    gameState.categories.forEach((cat, i) => {
        if (!charts.price.data.datasets[i]) {
            charts.price.data.datasets.push({ label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Price`, data: [], borderColor: ['green', 'blue', 'orange'][i], fill: true });
        }
        charts.price.data.datasets[i].data = gameState.history.prices.length ? gameState.history.prices.map(p => p[i]) : [gameState.prices[cat]];
    });
    charts.price.update();
}