// 音效系统
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支持:', e);
        }
    }

    // 播放音效
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        try {
            // 创建振荡器
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            // 设置音量渐变以避免爆音
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('播放音效时出错:', e);
        }
    }

    // 建造音效
    playBuildSound() {
        this.playSound(330, 0.3, 'square'); // E音
        setTimeout(() => {
            this.playSound(392, 0.3, 'square'); // G音
        }, 150);
    }

    // 收集资源音效
    playCollectSound() {
        this.playSound(523.25, 0.2, 'sine'); // C音
        setTimeout(() => {
            this.playSound(659.25, 0.2, 'sine'); // E音
        }, 100);
        setTimeout(() => {
            this.playSound(783.99, 0.2, 'sine'); // G音
        }, 200);
    }

    // 探索音效
    playExploreSound() {
        this.playSound(220, 0.5, 'sawtooth'); // A音
    }

    // 解谜成功音效
    playPuzzleSolvedSound() {
        // 上升音阶
        [261.63, 329.63, 392.00, 523.25].forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 0.3, 'sine');
            }, index * 200);
        });
    }

    // 错误音效
    playErrorSound() {
        this.playSound(110, 0.5, 'square'); // 低音
    }
}

// 导出音效系统实例
window.soundSystem = new SoundSystem();