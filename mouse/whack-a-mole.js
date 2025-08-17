// 游戏变量
let score = 0;
let timeLeft = 30;
let gameActive = false;
let timer;
let moleTimer;
let lastMole;
let audioContext;
let soundEnabled = true;

// 获取DOM元素
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const moles = document.querySelectorAll('.mole');
const soundToggle = document.getElementById('sound-toggle');

// 初始化音频上下文
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API is not supported in this browser');
    }
}

// 播放音效
function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // 设置音量渐变以避免爆音
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// 初始化游戏
function initGame() {
    score = 0;
    timeLeft = 30;
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    gameOverElement.style.display = 'none';
    
    // 隐藏所有地鼠
    moles.forEach(mole => {
        mole.classList.remove('up');
        mole.classList.remove('whacked');
    });
}

// 开始游戏
function startGame() {
    // 如果是第一次点击，初始化音频
    if (!audioContext) {
        initAudio();
    }
    
    // 清除之前的定时器
    if (timer) clearInterval(timer);
    if (moleTimer) clearTimeout(moleTimer);
    
    gameActive = true;
    initGame();
    
    // 播放开始音效
    playSound(523.25, 200); // C5
    
    // 开始计时器
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // 开始随机出现地鼠
    popUpRandomMole();
}

// 随机出现地鼠
function popUpRandomMole() {
    if (!gameActive) return;
    
    // 隐藏所有地鼠
    moles.forEach(mole => {
        mole.classList.remove('up');
    });
    
    // 随机选择一个地鼠，确保不连续选择同一个
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * moles.length);
    } while (randomIndex === lastMole && moles.length > 1);
    
    lastMole = randomIndex;
    const mole = moles[randomIndex];
    
    // 显示地鼠
    mole.classList.add('up');
    
    // 播放地鼠出现音效
    playSound(350, 100);
    
    // 设置地鼠出现的时间（随机500ms到1500ms）
    const popupTime = Math.random() * 1000 + 500;
    
    // 在随机时间后再次调用此函数
    moleTimer = setTimeout(() => {
        mole.classList.remove('up');
        if (gameActive) {
            popUpRandomMole();
        }
    }, popupTime);
}

// 点击地鼠
function whackMole() {
    if (!gameActive) return;
    
    if (this.classList.contains('up')) {
        // 增加分数
        score++;
        scoreElement.textContent = score;
        
        // 隐藏地鼠
        this.classList.remove('up');
        
        // 播放击中音效
        playSound(784, 150); // G5
        
        // 添加点击效果
        this.classList.add('whacked');
        setTimeout(() => {
            this.classList.remove('whacked');
        }, 300);
    }
}

// 结束游戏
function endGame() {
    gameActive = false;
    clearInterval(timer);
    clearTimeout(moleTimer);
    
    // 隐藏所有地鼠
    moles.forEach(mole => {
        mole.classList.remove('up');
    });
    
    // 播放结束音效
    playSound(392, 300); // G4
    playSound(329.63, 600, 'triangle'); // E4
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 切换音效
function toggleSound() {
    soundEnabled = soundToggle.checked;
}

// 事件监听器
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
soundToggle.addEventListener('change', toggleSound);

// 为每个地鼠添加点击事件
moles.forEach(mole => {
    mole.addEventListener('click', whackMole);
    // 添加触摸事件支持移动端
    mole.addEventListener('touchstart', function(e) {
        e.preventDefault();
        whackMole.call(this);
    });
});

// 初始化游戏
initGame();