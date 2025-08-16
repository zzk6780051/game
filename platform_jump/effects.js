// 粒子系统
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // 添加粒子
    addParticle(x, y, color, velocityX, velocityY, size, life) {
        this.particles.push({
            x: x,
            y: y,
            color: color,
            velocityX: velocityX,
            velocityY: velocityY,
            size: size,
            life: life,
            maxLife: life
        });
    }

    // 更新粒子
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新位置
            p.x += p.velocityX;
            p.y += p.velocityY;
            
            // 应用重力
            p.velocityY += 0.1;
            
            // 减少生命值
            p.life--;
            
            // 如果粒子生命结束，移除它
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // 绘制粒子
    draw(ctx) {
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;
    }

    // 创建金币收集效果
    createCoinEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const size = 2 + Math.random() * 3;
            const life = 20 + Math.random() * 20;
            
            this.addParticle(x, y, '#FFD700', velocityX, velocityY, size, life);
        }
    }

    // 创建跳跃尘土效果
    createJumpEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            const velocityX = -1 + Math.random() * 2;
            const velocityY = -Math.random() * 2;
            const size = 3 + Math.random() * 4;
            const life = 15 + Math.random() * 10;
            
            this.addParticle(x, y, '#8B4513', velocityX, velocityY, size, life);
        }
    }
}

// 创建全局粒子系统实例
const particleSystem = new ParticleSystem();