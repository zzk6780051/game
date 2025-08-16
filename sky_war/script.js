// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const invincibilityElement = document.getElementById('invincibility');

// Set canvas size based on window size
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth * 0.95, 800);
    const maxHeight = Math.min(window.innerHeight * 0.8, 600);
    
    // Maintain aspect ratio
    const aspectRatio = 800 / 600;
    let width = maxWidth;
    let height = maxWidth / aspectRatio;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

// Initialize canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let player = null;
let enemies = [];
let bullets = [];
let particles = [];
let keys = {};
let lastTime = 0;
let enemySpawnTimer = 0;

// Invincibility mode
let invincibilityMode = false;
let invincibilityCode = "";
const INVINCIBILITY_CODE = "6780051";

// Background stars for parallax effect
let stars = [];
const STAR_COUNT = 100;

// Audio elements (would load actual sound files in a complete implementation)
// const laserSound = new Audio('sounds/laser.mp3');
// const explosionSound = new Audio('sounds/explosion.mp3');
// const backgroundMusic = new Audio('sounds/background.mp3');
// const gameOverSound = new Audio('sounds/gameover.mp3');

// Constants
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1; // Reduced by 50% from 2 to 1
const ENEMY_SPAWN_RATE = 1000; // milliseconds

// Player class
class Player {
    constructor() {
        this.width = 50;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.color = '#00f0ff';
    }

    draw() {
        ctx.fillStyle = this.color;
        // Draw a simple spaceship shape
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw engine glow
        ctx.fillStyle = '#ff5500';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 - 10, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height + 15);
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Move player based on key presses
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= PLAYER_SPEED;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += PLAYER_SPEED;
        }
        if (keys['ArrowUp'] && this.y > 0) {
            this.y -= PLAYER_SPEED;
        }
        if (keys['ArrowDown'] && this.y < canvas.height - this.height) {
            this.y += PLAYER_SPEED;
        }
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.color = '#ff5555';
        this.speed = ENEMY_SPEED + Math.random() * 1; // Reduced random speed component
    }

    draw() {
        ctx.fillStyle = this.color;
        // Draw enemy ship
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.y += this.speed;
        return this.y > canvas.height; // Return true if enemy is off screen
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.width = 4;
        this.height = 15;
        this.x = x;
        this.y = y;
        this.color = '#00f0ff';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= BULLET_SPEED;
        return this.y + this.height < 0; // Return true if bullet is off screen
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.life = 30;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        return this.life <= 0;
    }
}

// Initialize stars for background
function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

// Draw stars for background
function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update stars for parallax effect
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = `得分: ${score}`;
    livesElement.textContent = `生命: ${lives}`;
    
    // Show/hide invincibility indicator
    if (invincibilityMode) {
        invincibilityElement.style.display = 'block';
    } else {
        invincibilityElement.style.display = 'none';
    }
}

// Initialize game
function initGame() {
    // Reinitialize canvas size
    resizeCanvas();
    
    player = new Player();
    enemies = [];
    bullets = [];
    particles = [];
    score = 0;
    lives = 3;
    invincibilityMode = false; // Reset invincibility mode
    invincibilityCode = ""; // Reset invincibility code
    initStars();
    updateUI();
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = `得分: ${score}`;
    livesElement.textContent = `生命: ${lives}`;
}

// Create explosion particles
function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y));
    }
    // explosionSound.currentTime = 0;
    // explosionSound.play().catch(e => console.log("Audio play failed:", e));
}

// Check collisions
function checkCollisions() {
    // Player bullets vs enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y
            ) {
                // Collision detected
                createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2);
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 100;
                updateUI();
                break;
            }
        }
    }

    // Enemies vs player
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (
            player.x < enemies[i].x + enemies[i].width &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemies[i].height &&
            player.y + player.height > enemies[i].y
        ) {
            // Player hit by enemy
            if (!invincibilityMode) {
                // Only take damage if not in invincibility mode
                createExplosion(player.x + player.width / 2, player.y + player.height / 2);
                enemies.splice(i, 1);
                lives--;
                updateUI();
                
                if (lives <= 0) {
                    gameOver();
                }
            } else {
                // In invincibility mode, just remove the enemy without taking damage
                enemies.splice(i, 1);
                // Add a life if below 3
                if (lives < 3) {
                    lives++;
                    updateUI();
                }
            }
            break;
        }
    }
}

// Game over function
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    // gameOverSound.play().catch(e => console.log("Audio play failed:", e));
    // backgroundMusic.pause();
}

// Start game function
function startGame() {
    startScreen.classList.add('hidden');
    gameRunning = true;
    initGame();
    // backgroundMusic.loop = true;
    // backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp) {
    // Calculate delta time for smooth animation
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        // Update and draw background
        updateStars();
        drawStars();
        
        // Update player
        player.update();
        
        // Spawn enemies
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer > ENEMY_SPAWN_RATE) {
            enemies.push(new Enemy());
            enemySpawnTimer = 0;
        }
        
        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].update()) {
                enemies.splice(i, 1);
            }
        }
        
        // Update bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i].update()) {
                bullets.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].update()) {
                particles.splice(i, 1);
            }
        }
        
        // Check collisions
        checkCollisions();
        
        // Draw everything
        player.draw();
        
        enemies.forEach(enemy => {
            enemy.draw();
        });
        
        bullets.forEach(bullet => {
            bullet.draw();
        });
        
        particles.forEach(particle => {
            particle.draw();
        });
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Spacebar to shoot
    if (e.key === ' ' && gameRunning) {
        bullets.push(new Bullet(
            player.x + player.width / 2 - 2,
            player.y
        ));
        // laserSound.currentTime = 0;
        // laserSound.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Check for invincibility code
    if (e.key >= '0' && e.key <= '9') {
        invincibilityCode += e.key;
        // Check if the code matches
        if (invincibilityCode === INVINCIBILITY_CODE) {
            invincibilityMode = true;
            console.log("无敌模式已启用！");
            invincibilityCode = ""; // Reset the code
        }
        // If the current code doesn't match the beginning of the target code, reset
        else if (!INVINCIBILITY_CODE.startsWith(invincibilityCode)) {
            invincibilityCode = "";
        }
    } else {
        // Reset if any non-digit key is pressed
        invincibilityCode = "";
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    gameOverElement.classList.add('hidden');
    startGame();
});

// Initialize the start screen
initGame();