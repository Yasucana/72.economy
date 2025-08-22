// Initialization and event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('beginner-mode').addEventListener('click', () => startGame('beginner'));
    document.getElementById('advanced-mode').addEventListener('click', () => startGame('advanced'));
});

function startGame(mode) {
    initGame(mode);
    document.getElementById('mode-selection').style.display = 'none';
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'block';
    // Force a reflow to ensure display change takes effect
    gameContainer.offsetHeight;
    initUI();
}