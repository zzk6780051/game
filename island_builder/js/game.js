// 游戏状态管理
class GameState {
    constructor() {
        this.day = 1;
        this.season = '春季';
        this.resources = {
            wood: 0,
            stone: 0,
            food: 0,
            gold: 0
        };
        this.maxResources = {
            wood: 100,
            stone: 100,
            food: 100,
            gold: 100
        };
        this.buildings = [];
        this.tasks = [
            '建造你的第一个住宅',
            '收集10个木材',
            '探索岛屿的北部区域'
        ];
        this.completedTasks = [];
        this.exploredAreas = {
            north: false,
            south: false,
            east: false,
            west: false
        };
        this.events = [];
        this.puzzles = {
            // 解谜游戏状态
            ancientRuins: {
                solved: false,
                clues: []
            }
        };
        
        // 性能优化：缓存DOM元素
        this.domCache = {};
    }

    // 缓存DOM元素以提高性能
    getDomElement(id) {
        if (!this.domCache[id]) {
            this.domCache[id] = document.getElementById(id);
        }
        return this.domCache[id];
    }

    // 收集资源
    collectResource(type, amount) {
        if (!type || typeof amount !== 'number' || amount <= 0) {
            console.warn('无效的资源收集参数');
            return false;
        }
        
        if (this.resources[type] !== undefined) {
            // 检查是否超过最大容量
            const newAmount = this.resources[type] + amount;
            this.resources[type] = Math.min(newAmount, this.maxResources[type]);
            this.updateUI();
            
            // 播放收集资源音效
            if (window.soundSystem) {
                window.soundSystem.playCollectSound();
            }
            
            return true;
        }
        return false;
    }

    // 消耗资源
    consumeResource(type, amount) {
        if (!type || typeof amount !== 'number' || amount <= 0) {
            console.warn('无效的资源消耗参数');
            return false;
        }
        
        if (this.resources[type] !== undefined && this.resources[type] >= amount) {
            this.resources[type] -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }

    // 建造建筑
    build(buildingType) {
        if (!buildingType) {
            console.warn('无效的建筑类型');
            return false;
        }
        
        const buildingCosts = {
            house: { wood: 10 },
            warehouse: { wood: 20, stone: 10 },
            farm: { wood: 15 },
            workshop: { wood: 25, stone: 15 },
            mine: { wood: 30, stone: 20 }
        };

        const cost = buildingCosts[buildingType];
        if (!cost) {
            console.warn('未知的建筑类型:', buildingType);
            return false;
        }

        // 检查是否有足够资源
        for (const resource in cost) {
            if (this.resources[resource] < cost[resource]) {
                alert(`资源不足！需要 ${cost[resource]} ${resource}`);
                
                // 播放错误音效
                if (window.soundSystem) {
                    window.soundSystem.playErrorSound();
                }
                
                return false;
            }
        }

        // 消耗资源
        for (const resource in cost) {
            this.consumeResource(resource, cost[resource]);
        }

        // 添加建筑到列表
        const building = {
            type: buildingType,
            id: Date.now(),
            level: 1
        };
        this.buildings.push(building);

        // 更新任务
        if (buildingType === 'house' && this.tasks.includes('建造你的第一个住宅')) {
            this.completeTask('建造你的第一个住宅');
        }

        // 如果是仓库，增加资源容量
        if (buildingType === 'warehouse') {
            this.increaseResourceCapacity();
        }

        this.updateUI();
        
        // 播放建造音效
        if (window.soundSystem) {
            window.soundSystem.playBuildSound();
        }
        
        return true;
    }

    // 升级建筑
    upgradeBuilding(buildingId) {
        if (!buildingId) {
            console.warn('无效的建筑ID');
            return false;
        }
        
        const building = this.buildings.find(b => b.id === buildingId);
        if (!building) {
            console.warn('未找到建筑:', buildingId);
            return false;
        }

        // 升级成本（基于当前等级）
        const upgradeCost = {
            wood: 5 * building.level,
            stone: 3 * building.level
        };

        // 检查资源
        for (const resource in upgradeCost) {
            if (this.resources[resource] < upgradeCost[resource]) {
                alert(`资源不足！需要 ${upgradeCost[resource]} ${resource}`);
                
                // 播放错误音效
                if (window.soundSystem) {
                    window.soundSystem.playErrorSound();
                }
                
                return false;
            }
        }

        // 消耗资源
        for (const resource in upgradeCost) {
            this.consumeResource(resource, upgradeCost[resource]);
        }

        // 升级建筑
        building.level++;
        this.updateUI();
        
        // 播放建造音效
        if (window.soundSystem) {
            window.soundSystem.playBuildSound();
        }
        
        return true;
    }

    // 增加资源容量
    increaseResourceCapacity() {
        for (const resource in this.maxResources) {
            this.maxResources[resource] += 50;
        }
        this.updateUI();
    }

    // 完成任务
    completeTask(task) {
        const index = this.tasks.indexOf(task);
        if (index > -1) {
            this.tasks.splice(index, 1);
            this.completedTasks.push(task);
            this.updateUI();
            
            // 根据完成的任务添加新任务
            this.addNewTasks(task);
        }
    }

    // 添加新任务
    addNewTasks(completedTask) {
        switch(completedTask) {
            case '建造你的第一个住宅':
                if (!this.tasks.includes('建造仓库以增加存储容量')) {
                    this.tasks.push('建造仓库以增加存储容量');
                }
                break;
            case '收集10个木材':
                if (!this.tasks.includes('建造农场以稳定食物来源')) {
                    this.tasks.push('建造农场以稳定食物来源');
                }
                break;
            case '探索岛屿的北部区域':
                if (!this.tasks.includes('解开古代遗迹的谜题')) {
                    this.tasks.push('解开古代遗迹的谜题');
                }
                break;
        }
    }

    // 探索区域
    explore(direction) {
        if (!direction) {
            console.warn('无效的方向');
            return;
        }
        
        if (this.exploredAreas[direction]) {
            alert(`你已经探索过${this.getDirectionName(direction)}了！`);
            
            // 播放错误音效
            if (window.soundSystem) {
                window.soundSystem.playErrorSound();
            }
            
            return;
        }

        // 消耗一些资源进行探索
        if (this.resources.food >= 2) {
            this.consumeResource('food', 2);
            this.exploredAreas[direction] = true;
            
            // 随机获得资源奖励
            const rewardType = ['wood', 'stone', 'food', 'gold'][Math.floor(Math.random() * 4)];
            const rewardAmount = Math.floor(Math.random() * 5) + 1;
            this.collectResource(rewardType, rewardAmount);
            
            // 随机事件
            if (Math.random() > 0.7) {
                this.triggerRandomEvent();
            }
            
            alert(`探索${this.getDirectionName(direction)}成功！获得 ${rewardAmount} ${this.getResourceName(rewardType)}`);
            
            // 更新任务
            if (direction === 'north' && this.tasks.includes('探索岛屿的北部区域')) {
                this.completeTask('探索岛屿的北部区域');
            }
            
            this.updateUI();
            
            // 播放探索音效
            if (window.soundSystem) {
                window.soundSystem.playExploreSound();
            }
        } else {
            alert('食物不足！探索需要消耗2个食物。');
            
            // 播放错误音效
            if (window.soundSystem) {
                window.soundSystem.playErrorSound();
            }
        }
    }

    // 触发随机事件
    triggerRandomEvent() {
        const events = [
            { name: '暴风雨', description: '暴风雨摧毁了一些建筑', effect: () => { 
                if (this.buildings.length > 0) {
                    const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
                    building.level = Math.max(1, building.level - 1);
                    alert('暴风雨来袭！一座建筑受损');
                }
            }},
            { name: '丰收', description: '农场大丰收', effect: () => { 
                this.collectResource('food', 10);
                alert('农场大丰收！获得额外食物');
            }},
            { name: '发现矿藏', description: '发现新的矿藏', effect: () => { 
                this.collectResource('stone', 15);
                alert('发现矿藏！获得大量石材');
            }}
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event.effect();
        this.events.push(event);
    }

    // 解谜游戏 - 古代遗迹
    solveAncientRuinsPuzzle(answer) {
        if (!answer) {
            console.warn('无效的答案');
            return false;
        }
        
        // 简单的解谜逻辑（实际游戏中可以更复杂）
        const correctAnswers = ['太阳', '海洋', '生命'];
        
        if (correctAnswers.includes(answer)) {
            this.puzzles.ancientRuins.solved = true;
            this.collectResource('gold', 50);
            this.completeTask('解开古代遗迹的谜题');
            alert('解谜成功！获得50金币奖励');
            
            // 播放解谜成功音效
            if (window.soundSystem) {
                window.soundSystem.playPuzzleSolvedSound();
            }
            
            return true;
        } else {
            alert('答案不正确，请再试一次');
            
            // 播放错误音效
            if (window.soundSystem) {
                window.soundSystem.playErrorSound();
            }
            
            return false;
        }
    }

    // 获取方向名称
    getDirectionName(direction) {
        const names = {
            north: '北部',
            south: '南部',
            east: '东部',
            west: '西部'
        };
        return names[direction] || direction;
    }

    // 获取资源名称
    getResourceName(resource) {
        const names = {
            wood: '木材',
            stone: '石材',
            food: '食物',
            gold: '金币'
        };
        return names[resource] || resource;
    }

    // 更新UI
    updateUI() {
        try {
            // 更新资源显示
            const woodElement = this.getDomElement('wood-value');
            if (woodElement) {
                woodElement.textContent = `${this.resources.wood}/${this.maxResources.wood}`;
            }
            
            const stoneElement = this.getDomElement('stone-value');
            if (stoneElement) {
                stoneElement.textContent = `${this.resources.stone}/${this.maxResources.stone}`;
            }
            
            const foodElement = this.getDomElement('food-value');
            if (foodElement) {
                foodElement.textContent = `${this.resources.food}/${this.maxResources.food}`;
            }
            
            const goldElement = this.getDomElement('gold-value');
            if (goldElement) {
                goldElement.textContent = `${this.resources.gold}/${this.maxResources.gold}`;
            }
            
            // 更新天数和季节
            const dayElement = this.getDomElement('game-day');
            if (dayElement) {
                dayElement.textContent = `第${this.day}天`;
            }
            
            const seasonElement = this.getDomElement('game-season');
            if (seasonElement) {
                seasonElement.textContent = this.season;
            }
            
            // 更新任务列表
            const taskList = this.getDomElement('task-list');
            if (taskList) {
                taskList.innerHTML = '';
                this.tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task;
                    
                    // 如果是解谜任务，添加输入框
                    if (task === '解开古代遗迹的谜题') {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.placeholder = '输入答案...';
                        input.style.display = 'block';
                        input.style.marginTop = '5px';
                        
                        const button = document.createElement('button');
                        button.textContent = '提交';
                        button.style.display = 'block';
                        button.style.marginTop = '5px';
                        
                        button.addEventListener('click', () => {
                            if (window.game && window.game.state) {
                                window.game.state.solveAncientRuinsPuzzle(input.value);
                            }
                        });
                        
                        li.appendChild(input);
                        li.appendChild(button);
                    }
                    
                    taskList.appendChild(li);
                });
            }
        } catch (e) {
            console.error('更新UI时出错:', e);
        }
    }

    // 游戏时间推进
    advanceDay() {
        this.day++;
        // 每季90天
        const seasons = ['春季', '夏季', '秋季', '冬季'];
        this.season = seasons[Math.floor((this.day - 1) / 90) % 4];
        
        // 建筑产生资源（简化版）
        this.buildings.forEach(building => {
            switch(building.type) {
                case 'farm':
                    this.collectResource('food', 2 * building.level);
                    break;
                case 'warehouse':
                    // 仓库增加存储容量，这里简化处理
                    break;
                case 'workshop':
                    this.collectResource('wood', 1 * building.level);
                    this.collectResource('stone', 1 * building.level);
                    break;
                case 'mine':
                    this.collectResource('stone', 3 * building.level);
                    break;
            }
        });
        
        // 随机事件（20%概率）
        if (Math.random() > 0.8) {
            this.triggerRandomEvent();
        }
        
        this.updateUI();
    }
}

// 游戏主类
class IslandBuilderGame {
    constructor() {
        this.state = new GameState();
        this.autoSaveInterval = null;
        this.buildingElements = []; // 存储建筑元素的引用
        this.init();
    }

    init() {
        // 初始化UI事件
        this.bindEvents();
        
        // 初始资源
        this.state.collectResource('wood', 5);
        this.state.collectResource('food', 3);
        
        // 更新UI
        this.state.updateUI();
        
        // 启动游戏循环
        this.startGameLoop();
        
        // 启动自动保存（每5分钟保存一次）
        this.startAutoSave();
        
        // 尝试加载已保存的游戏
        this.loadGame();
    }

    bindEvents() {
        // 建筑点击事件
        document.querySelectorAll('.building-item').forEach(item => {
            item.addEventListener('click', () => {
                const buildingType = item.getAttribute('data-building');
                this.state.build(buildingType);
                
                // 在地图上添加建筑元素
                this.addBuildingToMap(buildingType);
            });
        });

        // 探索按钮事件
        document.getElementById('explore-north').addEventListener('click', () => {
            this.state.explore('north');
        });
        
        document.getElementById('explore-south').addEventListener('click', () => {
            this.state.explore('south');
        });
        
        document.getElementById('explore-east').addEventListener('click', () => {
            this.state.explore('east');
        });
        
        document.getElementById('explore-west').addEventListener('click', () => {
            this.state.explore('west');
        });
    }

    startGameLoop() {
        // 每10秒推进一天（用于演示，实际游戏中可以调整）
        setInterval(() => {
            this.state.advanceDay();
        }, 10000);
    }
    
    // 启动自动保存
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 5 * 60 * 1000); // 每5分钟保存一次
    }
    
    // 停止自动保存
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    // 保存游戏状态
    saveGame() {
        try {
            const gameState = {
                day: this.state.day,
                season: this.state.season,
                resources: this.state.resources,
                maxResources: this.state.maxResources,
                buildings: this.state.buildings,
                tasks: this.state.tasks,
                completedTasks: this.state.completedTasks,
                exploredAreas: this.state.exploredAreas,
                puzzles: this.state.puzzles,
                events: this.state.events
            };
            
            localStorage.setItem('islandBuilderSave', JSON.stringify(gameState));
            console.log('游戏已自动保存');
        } catch (e) {
            console.error('保存游戏时出错:', e);
        }
    }
    
    // 加载游戏状态
    loadGame() {
        try {
            const saveData = localStorage.getItem('islandBuilderSave');
            if (saveData) {
                const gameState = JSON.parse(saveData);
                this.state.day = gameState.day;
                this.state.season = gameState.season;
                this.state.resources = gameState.resources;
                this.state.maxResources = gameState.maxResources;
                this.state.buildings = gameState.buildings;
                this.state.tasks = gameState.tasks;
                this.state.completedTasks = gameState.completedTasks;
                this.state.exploredAreas = gameState.exploredAreas;
                this.state.puzzles = gameState.puzzles;
                this.state.events = gameState.events || [];
                
                this.state.updateUI();
                console.log('游戏已加载');
                
                // 播放加载音效
                if (window.soundSystem) {
                    window.soundSystem.playExploreSound();
                }
                
                // 重新创建地图上的建筑
                this.recreateBuildingsOnMap();
            }
        } catch (e) {
            console.error('加载游戏时出错:', e);
            
            // 播放错误音效
            if (window.soundSystem) {
                window.soundSystem.playErrorSound();
            }
        }
    }
    
    // 手动保存（带提示音效）
    manualSave() {
        this.saveGame();
        alert('游戏已保存！');
        
        // 播放保存音效
        if (window.soundSystem) {
            window.soundSystem.playCollectSound();
        }
    }
    
    // 在地图上添加建筑
    addBuildingToMap(buildingType) {
        const islandMap = document.getElementById('island-map');
        if (!islandMap) return;
        
        // 创建建筑元素
        const buildingElement = document.createElement('div');
        buildingElement.className = `building building-${buildingType}`;
        buildingElement.style.position = 'absolute';
        
        // 随机位置（实际游戏中应该有更智能的放置逻辑）
        const x = Math.random() * 80 + 10; // 10%到90%之间
        const y = Math.random() * 80 + 10;
        buildingElement.style.left = `${x}%`;
        buildingElement.style.top = `${y}%`;
        
        // 设置建筑图标
        buildingElement.innerHTML = `
            <img src="assets/${buildingType}.svg" alt="${buildingType}" style="width: 40px; height: 40px;">
            <div class="building-level">1</div>
        `;
        
        // 添加到地图
        islandMap.appendChild(buildingElement);
        
        // 保存建筑元素引用
        const buildingId = this.state.buildings[this.state.buildings.length - 1].id;
        this.buildingElements.push({
            id: buildingId,
            element: buildingElement
        });
        
        // 添加点击事件用于升级
        buildingElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.state.upgradeBuilding(buildingId);
            
            // 更新建筑等级显示
            const levelElement = buildingElement.querySelector('.building-level');
            const building = this.state.buildings.find(b => b.id === buildingId);
            if (levelElement && building) {
                levelElement.textContent = building.level;
            }
        });
    }
    
    // 重新创建地图上的建筑（加载游戏时使用）
    recreateBuildingsOnMap() {
        const islandMap = document.getElementById('island-map');
        if (!islandMap) return;
        
        // 清空现有建筑
        islandMap.innerHTML = '';
        
        // 重新创建建筑
        this.state.buildings.forEach(building => {
            const buildingElement = document.createElement('div');
            buildingElement.className = `building building-${building.type}`;
            buildingElement.style.position = 'absolute';
            
            // 随机位置（实际游戏中应该保存位置信息）
            const x = Math.random() * 80 + 10;
            const y = Math.random() * 80 + 10;
            buildingElement.style.left = `${x}%`;
            buildingElement.style.top = `${y}%`;
            
            // 设置建筑图标
            buildingElement.innerHTML = `
                <img src="assets/${building.type}.svg" alt="${building.type}" style="width: 40px; height: 40px;">
                <div class="building-level">${building.level}</div>
            `;
            
            // 添加到地图
            islandMap.appendChild(buildingElement);
            
            // 保存建筑元素引用
            this.buildingElements.push({
                id: building.id,
                element: buildingElement
            });
            
            // 添加点击事件用于升级
            buildingElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.upgradeBuilding(building.id);
                
                // 更新建筑等级显示
                const levelElement = buildingElement.querySelector('.building-level');
                if (levelElement) {
                    levelElement.textContent = building.level;
                }
            });
        });
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new IslandBuilderGame();
    
    // 添加一些调试功能
    window.game = game; // 便于调试
    
    // 添加保存/加载按钮
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存游戏';
    saveButton.id = 'save-button';
    saveButton.style.position = 'fixed';
    saveButton.style.top = '10px';
    saveButton.style.right = '10px';
    saveButton.style.zIndex = '1000';
    document.body.appendChild(saveButton);
    
    const loadButton = document.createElement('button');
    loadButton.textContent = '加载游戏';
    loadButton.id = 'load-button';
    loadButton.style.position = 'fixed';
    loadButton.style.top = '40px';
    loadButton.style.right = '10px';
    loadButton.style.zIndex = '1000';
    document.body.appendChild(loadButton);
    
    // 绑定保存/加载事件
    saveButton.addEventListener('click', () => {
        game.manualSave();
    });
    
    loadButton.addEventListener('click', () => {
        game.loadGame();
    });
});