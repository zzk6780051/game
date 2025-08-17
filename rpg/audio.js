// 音频管理器
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.music = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
        this.currentMusic = null;
    }

    // 初始化音频上下文
    init() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('音频系统初始化成功');
        } catch (e) {
            console.error('无法初始化音频系统:', e);
        }
    }

    // 加载音效
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            request.onload = () => {
                this.audioContext.decodeAudioData(request.response)
                    .then(buffer => {
                        this.sounds[name] = buffer;
                        resolve();
                    })
                    .catch(reject);
            };

            request.onerror = reject;
            request.send();
        });
    }

    // 播放音效
    playSound(name) {
        if (!this.audioContext || !this.sounds[name]) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[name];
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.sfxVolume;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
    }

    // 加载音乐
    loadMusic(name, url) {
        this.music[name] = new Audio(url);
        this.music[name].loop = true;
        this.music[name].volume = this.musicVolume;
    }

    // 播放音乐
    playMusic(name) {
        if (this.currentMusic) {
            this.stopMusic();
        }

        if (this.music[name]) {
            this.currentMusic = name;
            this.music[name].play().catch(e => console.error('播放音乐失败:', e));
        }
    }

    // 停止音乐
    stopMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].pause();
            this.music[this.currentMusic].currentTime = 0;
            this.currentMusic = null;
        }
    }

    // 设置音乐音量
    setMusicVolume(volume) {
        this.musicVolume = volume;
        for (let name in this.music) {
            this.music[name].volume = volume;
        }
    }

    // 设置音效音量
    setSfxVolume(volume) {
        this.sfxVolume = volume;
    }
}

// 创建音频管理器实例
const audioManager = new AudioManager();

// 在DOM加载完成后初始化音频系统
document.addEventListener('DOMContentLoaded', () => {
    // 初始化音频系统
    audioManager.init();
    
    // 为设置界面的音量控制添加事件监听器
    document.getElementById('music-volume').addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        audioManager.setMusicVolume(volume);
    });
    
    document.getElementById('sfx-volume').addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        audioManager.setSfxVolume(volume);
    });
    
    // 添加一些示例音效（使用数据URI避免外部依赖）
    // 点击音效
    try {
        const clickSound = createClickSound();
        audioManager.sounds['click'] = clickSound;
        
        // 为按钮添加点击音效
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                audioManager.playSound('click');
            });
        });
    } catch (e) {
        console.warn('无法创建点击音效:', e);
    }
});

// 创建简单的点击音效
function createClickSound() {
    if (!audioManager.audioContext) return null;
    
    const context = audioManager.audioContext;
    const sampleRate = context.sampleRate;
    const duration = 0.1; // 100ms
    const numSamples = Math.floor(sampleRate * duration);
    
    const buffer = context.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    // 生成简单的点击声音
    for (let i = 0; i < numSamples; i++) {
        // 指数衰减的正弦波
        const t = i / sampleRate;
        const frequency = 800;
        const amplitude = Math.exp(-t * 20); // 快速衰减
        data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
    }
    
    return buffer;
}

// 在游戏事件中添加音效
// 在GameState类中添加音效播放方法
GameState.prototype.playSound = function(soundName) {
    audioManager.playSound(soundName);
};

// 在BattleSystem类中添加音效
BattleSystem.playerAttack = function() {
    if (!gameState.battle.inBattle) return;
    
    // 播放攻击音效
    audioManager.playSound('click');
    
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
};

// 添加背景音乐（使用简单的生成音乐作为示例）
document.addEventListener('DOMContentLoaded', () => {
    // 创建简单的背景音乐
    try {
        const bgMusic = createBackgroundMusic();
        audioManager.music['bgm'] = bgMusic;
        
        // 当游戏开始时播放背景音乐
        document.getElementById('start-game').addEventListener('click', () => {
            audioManager.playMusic('bgm');
        });
    } catch (e) {
        console.warn('无法创建背景音乐:', e);
    }
});

// 创建简单的背景音乐
function createBackgroundMusic() {
    const audio = new Audio();
    // 使用数据URI创建简单的背景音乐（实际项目中应该使用真实的音频文件）
    // 这里只是一个示例，实际项目中应该使用真实的音频文件
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFf3t8fHx9fX1+fn5/f3+AgICBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=';
    audio.loop = true;
    return audio;
}