// 游戏常量
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;

// 游戏状态
let gameState = {
    score: 0,
    lives: 3,
    currentLevel: 1,
    gameRunning: false,
    player: {
        x: 50,
        y: 300,
        width: 30,
        height: 50,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        facingRight: true
    },
    keys: {},
    platforms: [],
    coins: [],
    enemies: [],
    achievements: [
        { id: 1, name: "首次跳跃", description: "完成第一次跳跃", unlocked: false },
        { id: 2, name: "收集10个金币", description: "收集10个金币", unlocked: false },
        { id: 3, name: "完成第一关", description: "完成第一关", unlocked: false },
        { id: 4, name: "无伤通关", description: "在不失去生命的情况下完成关卡", unlocked: false },
        { id: 5, name: "征服者", description: "完成所有关卡", unlocked: false }
    ],
    // 无敌模式状态
    godMode: false,
    // 用于检测作弊码的输入缓冲区
    cheatCodeBuffer: ""
};

// 关卡数据
const levels = [
    {
        id: 1,
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 200, y: 450, width: 100, height: 20 },
            { x: 400, y: 350, width: 100, height: 20 },
            { x: 600, y: 250, width: 100, height: 20 }
        ],
        coins: [
            { x: 250, y: 400, collected: false },
            { x: 450, y: 300, collected: false },
            { x: 650, y: 200, collected: false }
        ],
        enemies: [
            { x: 300, y: 520, width: 40, height: 30, speed: 2, direction: 1 }
        ],
        playerStart: { x: 50, y: 300 }
    },
    {
        id: 2,
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 100, y: 450, width: 80, height: 20 },
            { x: 300, y: 350, width: 80, height: 20 },
            { x: 500, y: 250, width: 80, height: 20 },
            { x: 650, y: 400, width: 80, height: 20 }
        ],
        coins: [
            { x: 150, y: 400, collected: false },
            { x: 350, y: 300, collected: false },
            { x: 550, y: 200, collected: false },
            { x: 700, y: 350, collected: false }
        ],
        enemies: [
            { x: 200, y: 520, width: 40, height: 30, speed: 2, direction: 1 },
            { x: 400, y: 520, width: 40, height: 30, speed: 2, direction: -1 }
        ],
        playerStart: { x: 50, y: 300 }
    },
    {
        id: 3,
        platforms: [
            // 地面平台
            { x: 0, y: 550, width: 200, height: 50 },
            { x: 300, y: 550, width: 200, height: 50 },
            { x: 600, y: 550, width: 200, height: 50 },
            
            // 中层平台
            { x: 150, y: 450, width: 80, height: 20 },
            { x: 350, y: 400, width: 80, height: 20 },
            { x: 550, y: 350, width: 80, height: 20 },
            { x: 700, y: 300, width: 80, height: 20 },
            
            // 高层平台
            { x: 100, y: 250, width: 60, height: 20 },
            { x: 250, y: 200, width: 60, height: 20 },
            { x: 400, y: 150, width: 60, height: 20 },
            { x: 550, y: 100, width: 60, height: 20 },
            
            // 移动平台
            { x: 200, y: 350, width: 80, height: 20, moving: true, speed: 2, direction: 1, minX: 200, maxX: 350 },
            { x: 500, y: 250, width: 80, height: 20, moving: true, speed: 3, direction: -1, minX: 450, maxX: 600 }
        ],
        coins: [
            // 地面金币
            { x: 100, y: 500, collected: false },
            { x: 400, y: 500, collected: false },
            { x: 700, y: 500, collected: false },
            
            // 中层金币
            { x: 190, y: 400, collected: false },
            { x: 390, y: 350, collected: false },
            { x: 590, y: 300, collected: false },
            { x: 740, y: 250, collected: false },
            
            // 高层金币
            { x: 130, y: 200, collected: false },
            { x: 280, y: 150, collected: false },
            { x: 430, y: 100, collected: false },
            { x: 580, y: 50, collected: false },
            
            // 隐藏金币（需要特殊技巧获取）
            { x: 300, y: 300, collected: false },
            { x: 600, y: 200, collected: false }
        ],
        enemies: [
            // 地面敌人
            { x: 100, y: 520, width: 40, height: 30, speed: 2, direction: 1 },
            { x: 400, y: 520, width: 40, height: 30, speed: 2, direction: -1 },
            { x: 700, y: 520, width: 40, height: 30, speed: 3, direction: 1 },
            
            // 中层敌人
            { x: 200, y: 420, width: 40, height: 30, speed: 2, direction: 1 },
            { x: 500, y: 370, width: 40, height: 30, speed: 2, direction: -1 },
            
            // 高层敌人
            { x: 300, y: 170, width: 40, height: 30, speed: 3, direction: 1 },
            { x: 600, y: 120, width: 40, height: 30, speed: 3, direction: -1 }
        ],
        playerStart: { x: 50, y: 300 }
    }
];

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const achievementsList = document.getElementById('achievementsList');
const levelSelect = document.getElementById('levelSelect');
const levelButtons = document.getElementById('levelButtons');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const rulesButton = document.getElementById('rulesButton');
const rulesModal = document.getElementById('rulesModal');
const closeButton = document.querySelector('.closeButton');

// 初始化游戏
function initGame() {
    // 设置键盘事件监听器
    window.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;
        
        // 检测作弊码输入
        if (e.key >= '0' && e.key <= '9') {
            gameState.cheatCodeBuffer += e.key;
            
            // 保持缓冲区长度为7位
            if (gameState.cheatCodeBuffer.length > 7) {
                gameState.cheatCodeBuffer = gameState.cheatCodeBuffer.substring(1);
            }
            
            // 检查是否输入了作弊码
            if (gameState.cheatCodeBuffer === "6780051") {
                toggleGodMode();
                gameState.cheatCodeBuffer = ""; // 清空缓冲区
            }
        } else if (e.key !== "Backspace") {
            // 如果输入了非数字键，清空缓冲区（除了退格键）
            gameState.cheatCodeBuffer = "";
        }
    });
    
    window.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });
    
    // 重新开始按钮事件
    restartButton.addEventListener('click', startGame);
    
    // 玩法规则按钮事件
    rulesButton.addEventListener('click', () => {
        rulesModal.classList.remove('hidden');
    });
    
    // 关闭玩法规则模态框事件
    closeButton.addEventListener('click', () => {
        rulesModal.classList.add('hidden');
    });
    
    // 点击模态框外部关闭
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.classList.add('hidden');
        }
    });
    
    // 初始化成就列表
    initAchievements();
    
    // 初始化关卡选择
    initLevelSelect();
    
    // 显示关卡选择界面
    showLevelSelect();
}

// 初始化成就列表
function initAchievements() {
    achievementsList.innerHTML = '';
    gameState.achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.textContent = achievement.name;
        li.className = achievement.unlocked ? 'unlocked' : 'locked';
        li.id = `achievement-${achievement.id}`;
        
        // 为特殊成就添加图标
        if (achievement.id === 5) { // 征服者成就
            li.innerHTML = `🏆 ${li.innerHTML}`;
        }
        
        achievementsList.appendChild(li);
    });
}

// 初始化关卡选择
function initLevelSelect() {
    levelButtons.innerHTML = '';
    levels.forEach(level => {
        const button = document.createElement('button');
        button.textContent = `关卡 ${level.id}`;
        button.className = 'levelButton';
        // 如果是第三关，添加特殊样式
        if (level.id === 3) {
            button.style.background = 'linear-gradient(to bottom, #FF5722, #E64A19)';
        }
        button.addEventListener('click', () => startLevel(level.id));
        levelButtons.appendChild(button);
    });
}

// 显示关卡选择界面
function showLevelSelect() {
    levelSelect.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
}

// 开始游戏
function startGame() {
    gameState.gameRunning = true;
    gameState.lives = 3; // 重置生命值为3
    gameState.score = 0; // 重置分数
    gameState.currentLevel = 1; // 重置到第一关
    gameState.godMode = false; // 关闭无敌模式
    
    // 重置背景颜色
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)';
    
    levelSelect.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    loadLevel(gameState.currentLevel);
    
    // 更新UI以反映重置的生命值和分数
    updateUI();
    
    // 开始背景音乐
    soundManager.playBackgroundMusic();
    
    gameLoop();
}

// 开始特定关卡
function startLevel(levelId) {
    gameState.currentLevel = levelId;
    startGame();
}

// 加载关卡
function loadLevel(levelId) {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;
    
    // 重置玩家位置
    gameState.player.x = level.playerStart.x;
    gameState.player.y = level.playerStart.y;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    
    // 加载平台
    gameState.platforms = [...level.platforms];
    
    // 加载金币
    gameState.coins = level.coins.map(coin => ({ ...coin }));
    
    // 加载敌人
    gameState.enemies = level.enemies.map(enemy => ({ ...enemy }));
    
    // 更新UI
    updateUI();
}

// 更新UI
function updateUI() {
    scoreElement.textContent = `分数: ${gameState.score}`;
    livesElement.textContent = `生命: ${gameState.lives}`;
    levelElement.textContent = `关卡: ${gameState.currentLevel}`;
}

// 检查碰撞
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 更新玩家
function updatePlayer() {
    // 处理输入
    if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
        gameState.player.velocityX = -PLAYER_SPEED;
        gameState.player.facingRight = false;
    } else if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
        gameState.player.velocityX = PLAYER_SPEED;
        gameState.player.facingRight = true;
    } else {
        gameState.player.velocityX = 0;
    }
    
    if ((gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys[' ']) && !gameState.player.isJumping) {
        gameState.player.velocityY = JUMP_FORCE;
        gameState.player.isJumping = true;
        
        // 播放跳跃音效
        soundManager.playSound('jump');
        
        // 创建跳跃粒子效果
        particleSystem.createJumpEffect(
            gameState.player.x + gameState.player.width / 2,
            gameState.player.y + gameState.player.height
        );
        
        // 解锁"首次跳跃"成就
        unlockAchievement(1);
    }
    
    // 应用重力
    gameState.player.velocityY += GRAVITY;
    
    // 更新位置
    gameState.player.x += gameState.player.velocityX;
    gameState.player.y += gameState.player.velocityY;
    
    // 边界检查
    if (gameState.player.x < 0) gameState.player.x = 0;
    if (gameState.player.x > canvas.width - gameState.player.width) {
        gameState.player.x = canvas.width - gameState.player.width;
    }
    
    // 平台碰撞检测
    gameState.player.isJumping = true;
    for (const platform of gameState.platforms) {
        // 更新移动平台位置
        if (platform.moving) {
            platform.x += platform.speed * platform.direction;
            
            // 检查是否需要改变方向
            if (platform.x <= platform.minX || platform.x + platform.width >= platform.maxX) {
                platform.direction *= -1;
            }
        }
        
        if (checkCollision(gameState.player, platform)) {
            // 从上方落下
            if (gameState.player.velocityY > 0 && 
                gameState.player.y < platform.y) {
                gameState.player.y = platform.y - gameState.player.height;
                gameState.player.velocityY = 0;
                gameState.player.isJumping = false;
                
                // 如果站在移动平台上，跟随平台移动
                if (platform.moving) {
                    gameState.player.x += platform.speed * platform.direction;
                }
            }
            // 从下方撞击
            else if (gameState.player.velocityY < 0 && 
                     gameState.player.y > platform.y) {
                gameState.player.y = platform.y + platform.height;
                gameState.player.velocityY = 0;
            }
            // 从左侧撞击
            else if (gameState.player.velocityX > 0 && 
                     gameState.player.x < platform.x) {
                gameState.player.x = platform.x - gameState.player.width;
            }
            // 从右侧撞击
            else if (gameState.player.velocityX < 0 && 
                     gameState.player.x > platform.x) {
                gameState.player.x = platform.x + platform.width;
            }
        }
    }
    
    // 金币收集
    for (let i = 0; i < gameState.coins.length; i++) {
        const coin = gameState.coins[i];
        if (!coin.collected && checkCollision(gameState.player, { 
            x: coin.x - 10, 
            y: coin.y - 10, 
            width: 20, 
            height: 20 
        })) {
            coin.collected = true;
            gameState.score += 100;
            
            // 播放金币收集音效
            soundManager.playSound('coin');
            
            // 创建金币收集粒子效果
            particleSystem.createCoinEffect(coin.x, coin.y);
            
            // 检查是否解锁"收集10个金币"成就
            const collectedCoins = gameState.coins.filter(c => c.collected).length;
            if (collectedCoins >= 10) {
                unlockAchievement(2);
            }
            
            updateUI();
        }
    }
    
    // 敌人碰撞
    for (const enemy of gameState.enemies) {
        if (checkCollision(gameState.player, enemy)) {
            // 如果从上方踩踏敌人
            if (gameState.player.velocityY > 0 && 
                gameState.player.y < enemy.y) {
                // 消灭敌人
                enemy.y = 1000; // 移出屏幕
                gameState.player.velocityY = JUMP_FORCE / 2; // 小跳
                gameState.score += 200;
                
                // 播放敌人被击败音效
                soundManager.playSound('enemy');
                
                // 创建敌人被击败粒子效果
                particleSystem.createCoinEffect(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2
                );
            } else {
                // 玩家受伤
                playerHit();
            }
        }
    }
    
    // 检查是否掉出地图
    if (gameState.player.y > canvas.height) {
        // 如果处于无敌模式，自动传送至关卡原点而不是受伤
        if (gameState.godMode) {
            const level = levels.find(l => l.id === gameState.currentLevel);
            gameState.player.x = level.playerStart.x;
            gameState.player.y = level.playerStart.y;
            gameState.player.velocityX = 0;
            gameState.player.velocityY = 0;
        } else {
            playerHit();
        }
    }
    
    // 检查是否完成关卡（到达右边缘）
    if (gameState.player.x > canvas.width - 50) {
        completeLevel();
    }
}

// 更新敌人
function updateEnemies() {
    for (const enemy of gameState.enemies) {
        enemy.x += enemy.speed * enemy.direction;
        
        // 边界检查，改变方向
        let shouldTurn = false;
        for (const platform of gameState.platforms) {
            if (enemy.y + enemy.height >= platform.y && 
                enemy.y + enemy.height <= platform.y + 10 &&
                ((enemy.direction > 0 && enemy.x + enemy.width >= platform.x + platform.width) ||
                 (enemy.direction < 0 && enemy.x <= platform.x))) {
                shouldTurn = true;
                break;
            }
        }
        
        if (shouldTurn || enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.direction *= -1;
        }
    }
}

// 玩家受伤
function playerHit() {
    // 如果处于无敌模式，不减少生命值
    if (gameState.godMode) {
        return;
    }
    
    gameState.lives--;
    updateUI();
    
    // 播放受伤音效
    soundManager.playSound('hurt');
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // 重置玩家位置
        const level = levels.find(l => l.id === gameState.currentLevel);
        gameState.player.x = level.playerStart.x;
        gameState.player.y = level.playerStart.y;
        gameState.player.velocityX = 0;
        gameState.player.velocityY = 0;
    }
}

// 完成关卡
function completeLevel() {
    gameState.score += 1000;
    
    // 播放关卡完成音效
    soundManager.playSound('levelComplete');
    
    // 解锁"完成第一关"成就
    if (gameState.currentLevel === 1) {
        unlockAchievement(3);
    }
    
    // 检查是否所有金币都收集了
    const allCoinsCollected = gameState.coins.every(coin => coin.collected);
    if (allCoinsCollected) {
        unlockAchievement(4);
    }
    
    // 如果完成第三关，解锁"征服者"成就
    if (gameState.currentLevel === 3) {
        unlockAchievement(5);
    }
    
    // 检查是否有下一关
    if (gameState.currentLevel < levels.length) {
        gameState.currentLevel++;
        loadLevel(gameState.currentLevel);
    } else {
        // 游戏完成
        gameOver();
    }
    
    updateUI();
}

// 解锁成就
function unlockAchievement(id) {
    const achievement = gameState.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        const element = document.getElementById(`achievement-${id}`);
        if (element) {
            element.className = 'unlocked';
        }
        
        // 播放成就解锁音效
        soundManager.playSound('achievement');
        
        // 这里可以添加成就解锁的视觉效果
    }
}

// 切换无敌模式
function toggleGodMode() {
    gameState.godMode = !gameState.godMode;
    
    // 更改背景颜色
    const gameContainer = document.getElementById('gameContainer');
    if (gameState.godMode) {
        gameContainer.style.background = 'linear-gradient(135deg, #008000, #006400, #008000)'; // 绿色背景
        // 播放特殊音效表示激活无敌模式
        soundManager.playSound('achievement');
    } else {
        gameContainer.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)'; // 恢复原始背景
    }
    
    console.log(`无敌模式: ${gameState.godMode ? '激活' : '关闭'}`);
}

// 游戏结束
function gameOver() {
    gameState.gameRunning = false;
    finalScoreElement.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
    
    // 停止背景音乐
    soundManager.stopBackgroundMusic();
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制平台
    for (const platform of gameState.platforms) {
        // 移动平台使用不同颜色
        if (platform.moving) {
            ctx.fillStyle = '#FF6600'; // 橙色表示移动平台
        } else {
            ctx.fillStyle = '#8B4513'; // 棕色表示静态平台
        }
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // 绘制金币
    ctx.fillStyle = '#FFD700';
    for (const coin of gameState.coins) {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 绘制敌人
    ctx.fillStyle = '#FF0000';
    for (const enemy of gameState.enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
    
    // 绘制玩家
    ctx.fillStyle = gameState.player.facingRight ? '#0000FF' : '#00008B';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    // 绘制玩家眼睛
    ctx.fillStyle = '#FFFFFF';
    const eyeX = gameState.player.facingRight ? 
        gameState.player.x + gameState.player.width - 10 : 
        gameState.player.x + 10;
    ctx.fillRect(eyeX, gameState.player.y + 10, 5, 5);
    
    // 绘制粒子效果
    particleSystem.draw(ctx);
}

// 游戏循环
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    updatePlayer();
    updateEnemies();
    particleSystem.update();
    
    // 无敌模式下自动恢复生命值
    if (gameState.godMode && gameState.lives < 3) {
        gameState.lives++;
        updateUI();
    }
    
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// 初始化游戏
initGame();