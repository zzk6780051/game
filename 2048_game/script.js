document.addEventListener("DOMContentLoaded", function() {
    // 游戏状态
    let grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    let score = 0;
    let gameOver = false;

    // 获取DOM元素
    const gridContainer = document.querySelector('.grid-container');
    const tileContainer = document.querySelector('.tile-container');
    const scoreDisplay = document.querySelector('.score');
    const restartButton = document.querySelector('.restart-button');
    const gameMessage = document.querySelector('.game-message');

    // 初始化游戏
    function initGame() {
        // 清空网格
        grid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        score = 0;
        gameOver = false;
        scoreDisplay.textContent = '0';
        gameMessage.textContent = '';
        
        // 清空tile容器
        tileContainer.innerHTML = '';
        
        // 添加两个初始数字
        addRandomTile();
        addRandomTile();
        
        // 渲染游戏
        render();
    }

    // 添加随机数字块
    function addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // 渲染游戏界面
    function render() {
        // 清空tile容器
        tileContainer.innerHTML = '';
        
        // 创建tile元素
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    tile.style.top = `${row * 121.25}px`;
                    tile.style.left = `${col * 121.25}px`;
                    tileContainer.appendChild(tile);
                }
            }
        }
        
        // 更新分数
        scoreDisplay.textContent = score;
    }

    // 移动方块
    function move(direction) {
        if (gameOver) return;
        
        let moved = false;
        const originalGrid = JSON.parse(JSON.stringify(grid));
        
        // 根据方向移动
        switch (direction) {
            case 'up':
                moved = moveUp();
                break;
            case 'down':
                moved = moveDown();
                break;
            case 'left':
                moved = moveLeft();
                break;
            case 'right':
                moved = moveRight();
                break;
        }
        
        // 如果移动了，添加新方块并重新渲染
        if (moved) {
            addRandomTile();
            render();
            
            // 检查游戏是否结束
            if (isGameOver()) {
                gameOver = true;
                gameMessage.textContent = '游戏结束! 最终得分: ' + score;
            } else if (hasWon()) {
                gameMessage.textContent = '恭喜你达到2048! 当前得分: ' + score;
            }
        }
    }

    // 向左移动
    function moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const rowArray = grid[row].filter(val => val !== 0);
            for (let i = 0; i < rowArray.length - 1; i++) {
                if (rowArray[i] === rowArray[i + 1]) {
                    rowArray[i] *= 2;
                    score += rowArray[i];
                    rowArray.splice(i + 1, 1);
                }
            }
            while (rowArray.length < 4) {
                rowArray.push(0);
            }
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] !== rowArray[col]) {
                    moved = true;
                }
                grid[row][col] = rowArray[col];
            }
        }
        return moved;
    }

    // 向右移动
    function moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const rowArray = grid[row].filter(val => val !== 0);
            for (let i = rowArray.length - 1; i > 0; i--) {
                if (rowArray[i] === rowArray[i - 1]) {
                    rowArray[i] *= 2;
                    score += rowArray[i];
                    rowArray.splice(i - 1, 1);
                    i--;
                }
            }
            const newRow = Array(4).fill(0);
            for (let i = 0; i < rowArray.length; i++) {
                newRow[4 - rowArray.length + i] = rowArray[i];
            }
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] !== newRow[col]) {
                    moved = true;
                }
                grid[row][col] = newRow[col];
            }
        }
        return moved;
    }

    // 向上移动
    function moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const colArray = [];
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== 0) {
                    colArray.push(grid[row][col]);
                }
            }
            for (let i = 0; i < colArray.length - 1; i++) {
                if (colArray[i] === colArray[i + 1]) {
                    colArray[i] *= 2;
                    score += colArray[i];
                    colArray.splice(i + 1, 1);
                }
            }
            while (colArray.length < 4) {
                colArray.push(0);
            }
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== colArray[row]) {
                    moved = true;
                }
                grid[row][col] = colArray[row];
            }
        }
        return moved;
    }

    // 向下移动
    function moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const colArray = [];
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== 0) {
                    colArray.push(grid[row][col]);
                }
            }
            for (let i = colArray.length - 1; i > 0; i--) {
                if (colArray[i] === colArray[i - 1]) {
                    colArray[i] *= 2;
                    score += colArray[i];
                    colArray.splice(i - 1, 1);
                    i--;
                }
            }
            const newCol = Array(4).fill(0);
            for (let i = 0; i < colArray.length; i++) {
                newCol[4 - colArray.length + i] = colArray[i];
            }
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== newCol[row]) {
                    moved = true;
                }
                grid[row][col] = newCol[row];
            }
        }
        return moved;
    }

    // 检查游戏是否结束
    function isGameOver() {
        // 检查是否有空格
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否可以合并
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                if (grid[row][col] === grid[row][col + 1]) {
                    return false;
                }
            }
        }
        
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 3; row++) {
                if (grid[row][col] === grid[row + 1][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // 检查是否获胜
    function hasWon() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    // 键盘事件监听
    document.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'ArrowUp':
                move('up');
                break;
            case 'ArrowDown':
                move('down');
                break;
            case 'ArrowLeft':
                move('left');
                break;
            case 'ArrowRight':
                move('right');
                break;
        }
    });

    // 重新开始按钮事件
    restartButton.addEventListener('click', initGame);

    // 初始化游戏
    initGame();
});