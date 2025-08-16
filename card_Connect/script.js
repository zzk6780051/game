// Game state variables
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;

// Emoji symbols for card pairs (keeping these as they are visual elements)
const symbols = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🍑', '🍍'];

// DOM elements
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart');
const winMessage = document.getElementById('win-message');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');
const playAgainButton = document.getElementById('play-again');

// Initialize the game
function initGame() {
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    gameStarted = false;
    
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Update displays
    movesDisplay.textContent = moves;
    timerDisplay.textContent = timer;
    
    // Hide win message
    winMessage.classList.remove('show');
    
    // Create card pairs
    let gameSymbols = [...symbols, ...symbols];
    
    // Shuffle the cards
    gameSymbols = shuffleArray(gameSymbols);
    
    // Create card elements
    gameSymbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${symbol}</div>
                <div class="card-back">?</div>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
        cards.push(card);
    });
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Flip a card
function flipCard() {
    // Don't flip if already flipped or matched
    if (this.classList.contains('flipped') || this.classList.contains('matched') || flippedCards.length === 2) {
        return;
    }
    
    // Start timer on first move
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Flip the card
    this.classList.add('flipped');
    flippedCards.push(this);
    
    // Check for match when two cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        
        setTimeout(checkForMatch, 500);
    }
}

// Check if flipped cards match
function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.symbol === card2.dataset.symbol;
    
    if (isMatch) {
        // Mark as matched
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        
        // Check for win
        if (matchedPairs === symbols.length) {
            endGame();
        }
    } else {
        // Flip cards back
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    
    // Reset flipped cards array
    flippedCards = [];
}

// Start the game timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = timer;
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    
    // Show win message
    finalMoves.textContent = moves;
    finalTime.textContent = timer;
    winMessage.classList.add('show');
}

// Event listeners
restartButton.addEventListener('click', initGame);
playAgainButton.addEventListener('click', initGame);

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', initGame);