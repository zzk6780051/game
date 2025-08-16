// 音效系统
class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicPlaying = false;
        this.initSounds();
    }

    // 初始化音效
    initSounds() {
        // 创建音频上下文
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser");
        }
    }

    // 创建音效
    createSound(name, frequency, type = 'sine', duration = 0.5) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        // 设置音量渐弱效果
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        this.sounds[name] = {
            oscillator: oscillator,
            gainNode: gainNode,
            duration: duration
        };
    }

    // 播放音效
    playSound(name) {
        if (!this.sounds[name] || !this.audioContext) return;

        // 重新创建振荡器（因为它们只能使用一次）
        this.createSound(name, 
                         this.sounds[name].oscillator.frequency.value,
                         this.sounds[name].oscillator.type,
                         this.sounds[name].duration);

        const sound = this.sounds[name];
        sound.oscillator.start();
        
        // 停止振荡器以释放资源
        setTimeout(() => {
            sound.oscillator.stop();
        }, sound.duration * 1000);
    }

    // 初始化游戏音效
    initGameSounds() {
        // 跳跃音效
        this.createSound('jump', 300, 'sine', 0.3);
        
        // 收集金币音效
        this.createSound('coin', 800, 'sine', 0.2);
        
        // 敌人被击败音效
        this.createSound('enemy', 200, 'square', 0.4);
        
        // 玩家受伤音效
        this.createSound('hurt', 150, 'sawtooth', 0.5);
        
        // 关卡完成音效
        this.createSound('levelComplete', 500, 'sine', 1.0);
        
        // 成就解锁音效
        this.createSound('achievement', 1000, 'sine', 0.8);
    }

    // 播放背景音乐
    playBackgroundMusic() {
        if (!this.audioContext || this.musicPlaying) return;

        this.musicPlaying = true;
        
        // 创建简单的背景音乐
        const createNote = (frequency, startTime, duration) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0.1, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        // 简单的旋律循环
        const now = this.audioContext.currentTime;
        const notes = [
            { freq: 261.63, time: 0 },    // C4
            { freq: 329.63, time: 0.5 },  // E4
            { freq: 392.00, time: 1 },    // G4
            { freq: 523.25, time: 1.5 },  // C5
            { freq: 392.00, time: 2 },    // G4
            { freq: 329.63, time: 2.5 },  // E4
            { freq: 261.63, time: 3 },    // C4
        ];
        
        notes.forEach(note => {
            createNote(note.freq, now + note.time, 0.4);
        });
        
        // 循环播放
        setTimeout(() => {
            if (this.musicPlaying) {
                this.playBackgroundMusic();
            }
        }, 4000);
    }

    // 停止背景音乐
    stopBackgroundMusic() {
        this.musicPlaying = false;
    }
}

// 创建全局音效管理器实例
const soundManager = new SoundManager();

// 初始化游戏音效
soundManager.initGameSounds();