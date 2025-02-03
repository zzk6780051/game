const grid = document.querySelector('.grid-container');
const cells = document.querySelectorAll('.grid-cell');
const scoreContainer = document.querySelector('.score-container');
const restartButton = document.getElementById('restart-button');

let score = 0;
let hasWon = false;

const matrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

const winNumber = 2048;

function getRandomEmptyCell() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (matrix[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }
    return null;
}

function addRandomTile() {
    const cell = getRandomEmptyCell();
    if (cell) {
        const value = Math.random() < 0.9 ? 2 : 4;
        matrix[cell.row][cell.col] = value;
        updateGrid();
    }
}

function updateGrid() {
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const value = matrix[row][col];
        cell.textContent = value || '';
        cell.classList.remove('number-2', 'number-4', 'number-8', 'number-16', 'number-32', 'number-64', 'number-128', 'number-256', 'number-512', 'number-1024', 'number-2048');
        if (value !== 0) {
            cell.classList.add(`number-${value}`);
        }
    });
}

function moveUp() {
    for (let col = 0; col < 4; col++) {
        let tempCol = [];
        for (let row = 0; row < 4; row++) {
            if (matrix[row][col] !== 0) {
                tempCol.push(matrix[row][col]);
            }
        }
        tempCol = mergeTiles(tempCol);
        for (let row = 0; row < 4; row++) {
            matrix[row][col] = tempCol[row] || 0;
        }
    }
    addRandomTile();
    checkGameOver();
}

function moveDown() {
    for (let col = 0; col < 4; col++) {
        let tempCol = [];
        for (let row = 3; row >= 0; row--) {
            if (matrix[row][col] !== 0) {
                tempCol.push(matrix[row][col]);
            }
        }
        tempCol = mergeTiles(tempCol);
        for (let row = 3; row >= 0; row--) {
            matrix[row][col] = tempCol[3 - row] || 0;
        }
    }
    addRandomTile();
    checkGameOver();
}

function moveLeft() {
    for (let row = 0; row < 4; row++) {
        let tempRow = [];
        for (let col = 0; col < 4; col++) {
            if (matrix[row][col] !== 0) {
                tempRow.push(matrix[row][col]);
            }
        }
        tempRow = mergeTiles(tempRow);
        for (let col = 0; col < 4; col++) {
            matrix[row][col] = tempRow[col] || 0;
        }
    }
    addRandomTile();
    checkGameOver();
}

function moveRight() {
    for (let row = 0; row < 4; row++) {
        let tempRow = [];
        for (let col = 3; col >= 0; col--) {
            if (matrix[row][col] !== 0) {
                tempRow.push(matrix[row][col]);
            }
        }
        tempRow = mergeTiles(tempRow);
        for (let col = 3; col >= 0; col--) {
            matrix[row][col] = tempRow[3 - col] || 0;
        }
    }
    addRandomTile();
    checkGameOver();
}

function mergeTiles(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] === tiles[i + 1]) {
            tiles[i] *= 2;
            tiles.splice(i + 1, 1);
            score += tiles[i];
            scoreContainer.textContent = score;
            if (tiles[i] === winNumber && !hasWon) {
                alert('You Win!');
                hasWon = true;
            }
        }
    }
    while (tiles.length < 4) {
        tiles.push(0);
    }
    return tiles;
}

function checkGameOver() {
    let gameOver = true;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (matrix[i][j] === 0 ||
                (i < 3 && matrix[i][j] === matrix[i + 1][j]) ||
                (j < 3 && matrix[i][j] === matrix[i][j + 1])) {
                gameOver = false;
                break;
            }
        }
        if (!gameOver) break;
    }
    if (gameOver) {
        alert('Game Over!');
    }
}

function restartGame() {
    matrix.forEach(row => row.fill(0));
    score = 0;
    hasWon = false;
    scoreContainer.textContent = score;
    addRandomTile();
    addRandomTile();
    updateGrid();
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
    }
});

restartButton.addEventListener('click', restartGame);

// Initialize the game
restartGame();