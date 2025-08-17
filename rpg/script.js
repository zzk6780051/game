// 性能监控
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // 在控制台显示FPS（仅在开发模式下）
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                console.log(`FPS: ${this.fps}`);
            }
        }
    }
}

// 游戏状态管理
class GameState {
    constructor() {
        this.currentScreen = 'main-menu';
        this.player = {
            name: '勇者',
            level: 1,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            exp: 0,
            expToNextLevel: 100,
            attack: 10,
            defense: 5,
            inventory: [],
            skills: [],
            quests: [],
            equipment: {
                weapon: null,
                armor: null
            }
        };
        this.gameWorld = {
            map: null,
            enemies: [],
            npcs: []
        };
        this.battle = {
            inBattle: false,
            enemy: null
        };
        this.settings = {
            musicVolume: 50,
            sfxVolume: 50
        };
    }

    // 切换屏幕
    switchScreen(screenId) {
        // 隐藏当前屏幕
        document.getElementById(this.currentScreen).classList.remove('active');
        // 显示新屏幕
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    // 更新玩家状态显示
    updatePlayerStats() {
        document.getElementById('health').textContent = this.player.health;
        document.getElementById('mana').textContent = this.player.mana;
        document.getElementById('exp').textContent = this.player.exp;
        document.getElementById('level').textContent = this.player.level;
        
        // 角色界面更新
        document.getElementById('char-health').textContent = this.player.health;
        document.getElementById('char-mana').textContent = this.player.mana;
        document.getElementById('char-attack').textContent = this.player.attack;
        document.getElementById('char-defense').textContent = this.player.defense;
        document.getElementById('char-level').textContent = this.player.level;
        document.getElementById('char-exp').textContent = this.player.exp;
        document.getElementById('weapon').textContent = this.player.equipment.weapon || '无';
        document.getElementById('armor').textContent = this.player.equipment.armor || '无';
    }

    // 玩家获得经验值
    gainExp(amount) {
        this.player.exp += amount;
        if (this.player.exp >= this.player.expToNextLevel) {
            this.levelUp();
        }
        this.updatePlayerStats();
    }

    // 玩家升级
    levelUp() {
        this.player.level++;
        this.player.exp -= this.player.expToNextLevel;
        this.player.expToNextLevel = Math.floor(this.player.expToNextLevel * 1.5);
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth;
        this.player.maxMana += 10;
        this.player.mana = this.player.maxMana;
        this.player.attack += 2;
        this.player.defense += 1;
        console.log(`恭喜升级！当前等级：${this.player.level}`);
    }

    // 玩家受到伤害
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.player.defense);
        this.player.health = Math.max(0, this.player.health - actualDamage);
        this.updatePlayerStats();
        return actualDamage;
    }

    // 玩家恢复生命值
    heal(amount) {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
        this.updatePlayerStats();
    }

    // 添加物品到背包
    addToInventory(item) {
        this.player.inventory.push(item);
        this.updateInventory();
    }

    // 更新背包显示
    updateInventory() {
        const inventoryContainer = document.getElementById('inventory-items');
        inventoryContainer.innerHTML = '';
        
        this.player.inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.textContent = item.name;
            itemElement.addEventListener('click', () => {
                this.useItem(index);
            });
            inventoryContainer.appendChild(itemElement);
        });
    }

    // 使用物品
    useItem(index) {
        const item = this.player.inventory[index];
        if (item.type === 'healing') {
            this.heal(item.value);
            this.player.inventory.splice(index, 1);
            this.updateInventory();
            console.log(`使用了${item.name}，恢复了${item.value}点生命值`);
        }
    }

    // 更新技能显示
    updateSkills() {
        const skillsContainer = document.getElementById('skills-list');
        skillsContainer.innerHTML = '';
        
        this.player.skills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill';
            skillElement.innerHTML = `
                <h3>${skill.name}</h3>
                <p>消耗魔法: ${skill.manaCost}</p>
                <p>${skill.description}</p>
            `;
            skillsContainer.appendChild(skillElement);
        });
    }

    // 更新任务显示
    updateQuests() {
        const questsContainer = document.getElementById('quests-list');
        questsContainer.innerHTML = '';
        
        this.player.quests.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'quest';
            questElement.innerHTML = `
                <h3>${quest.name}</h3>
                <p>${quest.description}</p>
                <p>进度: ${quest.progress}/${quest.goal}</p>
            `;
            questsContainer.appendChild(questElement);
        });
    }
}

// 初始化游戏状态
const gameState = new GameState();
const performanceMonitor = new PerformanceMonitor();

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化按钮事件
    initButtons();
    
    // 初始化玩家数据
    initPlayerData();
    
    // 初始化地图
    initMap();
});

// 初始化按钮事件
function initButtons() {
    // 主菜单按钮
    document.getElementById('start-game').addEventListener('click', () => {
        gameState.switchScreen('game-world');
    });
    
    document.getElementById('settings-btn').addEventListener('click', () => {
        gameState.switchScreen('settings-screen');
    });
    
    document.getElementById('help-btn').addEventListener('click', () => {
        gameState.switchScreen('help-screen');
    });
    
    // 游戏世界按钮
    document.getElementById('inventory-btn').addEventListener('click', () => {
        gameState.updateInventory();
        gameState.switchScreen('inventory-screen');
    });
    
    document.getElementById('skills-btn').addEventListener('click', () => {
        gameState.updateSkills();
        gameState.switchScreen('skills-screen');
    });
    
    document.getElementById('quests-btn').addEventListener('click', () => {
        gameState.updateQuests();
        gameState.switchScreen('quests-screen');
    });
    
    // 返回按钮
    document.getElementById('back-to-world').addEventListener('click', () => {
        gameState.switchScreen('game-world');
    });
    
    document.getElementById('close-inventory').addEventListener('click', () => {
        gameState.switchScreen('game-world');
    });
    
    document.getElementById('close-skills').addEventListener('click', () => {
        gameState.switchScreen('game-world');
    });
    
    document.getElementById('close-quests').addEventListener('click', () => {
        gameState.switchScreen('game-world');
    });
    
    document.getElementById('close-settings').addEventListener('click', () => {
        gameState.switchScreen('main-menu');
    });
    
    document.getElementById('close-help').addEventListener('click', () => {
        gameState.switchScreen('main-menu');
    });
    
    // 设置界面事件
    document.getElementById('music-volume').addEventListener('input', (e) => {
        gameState.settings.musicVolume = e.target.value;
    });
    
    document.getElementById('sfx-volume').addEventListener('input', (e) => {
        gameState.settings.sfxVolume = e.target.value;
    });
}

// 初始化玩家数据
function initPlayerData() {
    // 添加初始技能
    gameState.player.skills = [
        { name: '火球术', manaCost: 10, damage: 20, description: '发射一个火球攻击敌人' },
        { name: '治疗术', manaCost: 15, heal: 30, description: '恢复生命值' }
    ];
    
    // 添加初始任务
    gameState.player.quests = [
        { name: '新手任务', description: '击败3个哥布林', progress: 0, goal: 3 },
        { name: '收集任务', description: '收集5个药草', progress: 0, goal: 5 }
    ];
    
    // 添加初始物品
    gameState.player.inventory = [
        { name: '生命药水', type: 'healing', value: 50 },
        { name: '魔法药水', type: 'mana', value: 30 }
    ];
    
    // 更新显示
    gameState.updatePlayerStats();
}

// 初始化地图
function initMap() {
    const canvas = document.getElementById('game-map');
    const ctx = canvas.getContext('2d');
    
    // 检查浏览器支持
    if (!ctx) {
        console.error('无法获取Canvas上下文');
        return;
    }
    
    // 绘制简单的地图
    ctx.fillStyle = '#393e46';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#4a5059';
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 绘制玩家角色
    ctx.fillStyle = '#4ecca3';
    ctx.fillRect(380, 280, 40, 40);
    
    // 绘制一些NPC
    ctx.fillStyle = '#e94560';
    ctx.fillRect(200, 150, 30, 30); // 敌人
    ctx.fillRect(600, 400, 30, 30); // 敌人
    
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(100, 400, 30, 30); // NPC
    ctx.fillRect(700, 150, 30, 30); // NPC
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('发生错误:', e.error);
    // 在生产环境中，可以将错误发送到服务器进行记录
});

// Promise错误处理
window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    e.preventDefault(); // 阻止默认的错误处理
});

// 战斗系统
class BattleSystem {
    static startBattle(enemy) {
        gameState.battle.inBattle = true;
        gameState.battle.enemy = enemy;
        gameState.switchScreen('battle-screen');
        
        // 更新战斗界面
        document.getElementById('player-health').textContent = gameState.player.health;
        document.getElementById('enemy-health').textContent = enemy.health;
    }
    
    static playerAttack() {
        if (!gameState.battle.inBattle) return;
        
        const damage = Math.floor(Math.random() * 10) + gameState.player.attack;
        gameState.battle.enemy.health -= damage;
        document.getElementById('enemy-health').textContent = gameState.battle.enemy.health;
        
        console.log(`玩家造成${damage}点伤害`);
        
        if (gameState.battle.enemy.health <= 0) {
            this.endBattle(true);
            return;
        }
        
        // 敌人反击
        setTimeout(() => {
            this.enemyAttack();
        }, 1000);
    }
    
    static enemyAttack() {
        if (!gameState.battle.inBattle) return;
        
        const damage = Math.floor(Math.random() * 5) + gameState.battle.enemy.attack;
        const actualDamage = gameState.takeDamage(damage);
        
        console.log(`敌人造成${actualDamage}点伤害`);
        
        if (gameState.player.health <= 0) {
            this.endBattle(false);
        }
    }
    
    static useSkill(skillIndex) {
        if (!gameState.battle.inBattle) return;
        
        const skill = gameState.player.skills[skillIndex];
        if (gameState.player.mana < skill.manaCost) {
            console.log('魔法值不足');
            return;
        }
        
        gameState.player.mana -= skill.manaCost;
        gameState.updatePlayerStats();
        
        if (skill.damage) {
            gameState.battle.enemy.health -= skill.damage;
            document.getElementById('enemy-health').textContent = gameState.battle.enemy.health;
            console.log(`使用${skill.name}造成${skill.damage}点伤害`);
        }
        
        if (skill.heal) {
            gameState.heal(skill.heal);
            console.log(`使用${skill.name}恢复${skill.heal}点生命值`);
        }
        
        if (gameState.battle.enemy.health <= 0) {
            this.endBattle(true);
            return;
        }
        
        // 敌人反击
        setTimeout(() => {
            this.enemyAttack();
        }, 1000);
    }
    
    static endBattle(victory) {
        gameState.battle.inBattle = false;
        
        if (victory) {
            console.log('战斗胜利！');
            const expGain = Math.floor(Math.random() * 20) + 10;
            gameState.gainExp(expGain);
            console.log(`获得${expGain}点经验值`);
        } else {
            console.log('战斗失败！');
            gameState.player.health = 1; // 避免完全死亡
            gameState.updatePlayerStats();
        }
        
        // 返回游戏世界
        setTimeout(() => {
            gameState.switchScreen('game-world');
        }, 2000);
    }
}

// 添加战斗按钮事件
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.attack-btn').addEventListener('click', () => {
        BattleSystem.playerAttack();
    });
    
    document.querySelector('.skill-btn').addEventListener('click', () => {
        BattleSystem.useSkill(0); // 使用第一个技能（火球术）
    });
    
    document.querySelector('.item-btn').addEventListener('click', () => {
        if (gameState.player.inventory.length > 0) {
            gameState.useItem(0); // 使用第一个物品（生命药水）
        }
    });
    
    document.querySelector('.flee-btn').addEventListener('click', () => {
        BattleSystem.endBattle(false);
    });
});

// 游戏循环
function gameLoop() {
    // 更新性能监控
    performanceMonitor.update();
    
    // 在这里可以添加其他需要每帧更新的逻辑
    
    // 继续游戏循环
    requestAnimationFrame(gameLoop);
}

// 启动游戏循环
requestAnimationFrame(gameLoop);

// 键盘控制
document.addEventListener('keydown', (e) => {
    // 阻止默认行为以避免页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // 在游戏世界中移动角色
    if (gameState.currentScreen === 'game-world') {
        const canvas = document.getElementById('game-map');
        const ctx = canvas.getContext('2d');
        
        // 这里应该实现角色移动逻辑
        // 为简化起见，我们只记录按键
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                console.log('向上移动');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                console.log('向下移动');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                console.log('向左移动');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                console.log('向右移动');
                break;
            case ' ':
                console.log('与NPC交互');
                // 随机开始一场战斗作为示例
                if (Math.random() > 0.7) {
                    BattleSystem.startBattle({
                        name: '哥布林',
                        health: 80,
                        maxHealth: 80,
                        attack: 8
                    });
                }
                break;
            case 'Escape':
                gameState.switchScreen('character-screen');
                break;
        }
    }
});