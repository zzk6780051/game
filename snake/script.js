// Game variables
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = false;
let gameSpeed = 240; // milliseconds between updates (slower speed)

// Initialize game
function initGame() {
    // Initialize snake
    snake = [
        {x: 10, y: 10}, // Head
    ];
    
    // Generate first food
    generateFood();
    
    // Reset direction
    dx = 0;
    dy = 0;
    
    // Reset score
    score = 0;
    scoreDisplay.textContent = score;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw initial state
    drawSnake();
    drawFood();
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// Draw snake on canvas
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#2E8B57' : '#3CB371'; // Head is darker
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

// Draw food on canvas
function drawFood() {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Move snake
function moveSnake() {
    // Create new head
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Add new head to beginning of snake
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreDisplay.textContent = score;
        
        // Generate new food
        generateFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move snake
    moveSnake();
    
    // Check for collisions
    if (checkCollision()) {
        gameRunning = false;
        alert(`游戏结束! 最终得分: ${score}`);
        return;
    }
    
    // Draw everything
    drawSnake();
    drawFood();
    
    // Continue game loop
    setTimeout(gameLoop, gameSpeed);
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    // Prevent direction reversal
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// Start button event
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
});

// Reset button event
resetBtn.addEventListener('click', () => {
    gameRunning = false;
    initGame();
});

// Initialize game on load
window.onload = initGame;