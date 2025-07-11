// 游戏主类
class TankGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        
        // 游戏数据
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.playerTank = null;
        this.enemyTanks = [];
        this.bullets = [];
        this.obstacles = [];
        this.explosions = [];
        
        // 输入处理
        this.keys = {};
        this.lastShot = 0;
        this.shotCooldown = 300; // 300ms射击冷却
        
        // 游戏设置
        this.enemyCount = 3;
        this.enemySpawnDelay = 2000;
        this.lastEnemySpawn = 0;
        
        this.initializeEventListeners();
        this.generateObstacles();
    }
    
    initializeEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 菜单按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('instructionsBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.getElementById('gameMenu').classList.remove('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('instructions').classList.add('hidden');
        this.removePauseOverlay();
    }
    
    showInstructions() {
        document.getElementById('gameMenu').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // 隐藏菜单
        document.getElementById('gameMenu').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('instructions').classList.add('hidden');
        this.removePauseOverlay();
        
        // 初始化游戏对象
        this.playerTank = new PlayerTank(400, 550);
        this.enemyTanks = [];
        this.bullets = [];
        this.explosions = [];
        this.lastEnemySpawn = Date.now();
        
        // 生成初始敌人
        this.spawnEnemies();
        
        // 开始游戏循环
        this.gameLoop();
        this.updateUI();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showPauseOverlay();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.removePauseOverlay();
            this.gameLoop();
        }
    }
    
    showPauseOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'pause-overlay';
        overlay.id = 'pauseOverlay';
        overlay.textContent = '游戏暂停';
        document.querySelector('.game-area').appendChild(overlay);
    }
    
    removePauseOverlay() {
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    spawnEnemies() {
        const spawnPositions = [
            {x: 100, y: 50},
            {x: 350, y: 50},
            {x: 600, y: 50}
        ];
        
        for (let i = 0; i < Math.min(this.enemyCount + this.level - 1, spawnPositions.length); i++) {
            const pos = spawnPositions[i];
            this.enemyTanks.push(new EnemyTank(pos.x, pos.y));
        }
    }
    
    generateObstacles() {
        this.obstacles = [];
        
        // 创建砖块障碍物
        const brickPatterns = [
            {x: 150, y: 200, width: 100, height: 60},
            {x: 550, y: 200, width: 100, height: 60},
            {x: 100, y: 350, width: 60, height: 100},
            {x: 640, y: 350, width: 60, height: 100},
            {x: 300, y: 400, width: 200, height: 40},
            {x: 350, y: 250, width: 100, height: 40}
        ];
        
        brickPatterns.forEach(pattern => {
            this.obstacles.push(new Obstacle(pattern.x, pattern.y, pattern.width, pattern.height, 'brick'));
        });
        
        // 创建钢铁障碍物（不可摧毁）
        const steelPatterns = [
            {x: 0, y: 0, width: 800, height: 20}, // 顶部边界
            {x: 0, y: 0, width: 20, height: 600}, // 左边界
            {x: 780, y: 0, width: 20, height: 600}, // 右边界
            {x: 0, y: 580, width: 800, height: 20}, // 底部边界
            {x: 370, y: 500, width: 60, height: 60} // 基地保护
        ];
        
        steelPatterns.forEach(pattern => {
            this.obstacles.push(new Obstacle(pattern.x, pattern.y, pattern.width, pattern.height, 'steel'));
        });
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        const now = Date.now();
        
        // 更新玩家坦克
        if (this.playerTank) {
            this.handlePlayerInput();
            this.playerTank.update();
        }
        
        // 更新敌方坦克
        this.enemyTanks.forEach(tank => {
            tank.update(this.obstacles, this.playerTank);
            
            // 敌方坦克射击
            if (now - tank.lastShot > tank.shotCooldown) {
                const bullet = tank.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }
        });
        
        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });
        
        // 更新爆炸效果
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            return explosion.active;
        });
        
        // 碰撞检测
        this.checkCollisions();
        
        // 检查游戏状态
        this.checkGameState();
        
        // 生成新敌人
        if (this.enemyTanks.length < this.enemyCount && now - this.lastEnemySpawn > this.enemySpawnDelay) {
            this.spawnEnemies();
            this.lastEnemySpawn = now;
        }
    }
    
    handlePlayerInput() {
        if (!this.playerTank) return;
        
        // 移动控制
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.playerTank.move('up', this.obstacles);
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.playerTank.move('down', this.obstacles);
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.playerTank.move('left', this.obstacles);
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.playerTank.move('right', this.obstacles);
        }
        
        // 射击控制
        if (this.keys['Space'] && Date.now() - this.lastShot > this.shotCooldown) {
            const bullet = this.playerTank.shoot();
            if (bullet) {
                this.bullets.push(bullet);
                this.lastShot = Date.now();
            }
        }
    }
    
    checkCollisions() {
        // 子弹与坦克碰撞
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            
            // 子弹与玩家坦克
            if (bullet.owner !== 'player' && this.playerTank && 
                this.checkCollision(bullet, this.playerTank)) {
                bullet.active = false;
                this.playerHit();
            }
            
            // 子弹与敌方坦克
            this.enemyTanks.forEach((tank, index) => {
                if (bullet.owner !== 'enemy' && this.checkCollision(bullet, tank)) {
                    bullet.active = false;
                    this.enemyTanks.splice(index, 1);
                    this.addExplosion(tank.x, tank.y);
                    this.score += 100;
                    this.updateUI();
                }
            });
            
            // 子弹与障碍物
            this.obstacles.forEach((obstacle, index) => {
                if (this.checkCollision(bullet, obstacle)) {
                    bullet.active = false;
                    if (obstacle.type === 'brick') {
                        this.obstacles.splice(index, 1);
                        this.addExplosion(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
                    }
                }
            });
        });
        
        // 坦克与坦克碰撞
        if (this.playerTank) {
            this.enemyTanks.forEach(tank => {
                if (this.checkCollision(this.playerTank, tank)) {
                    this.playerHit();
                }
            });
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    playerHit() {
        if (!this.playerTank) return;
        
        this.addExplosion(this.playerTank.x, this.playerTank.y);
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // 重置玩家位置
            this.playerTank.x = 400;
            this.playerTank.y = 550;
        }
    }
    
    addExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
    }
    
    checkGameState() {
        if (this.enemyTanks.length === 0 && Date.now() - this.lastEnemySpawn > this.enemySpawnDelay) {
            this.nextLevel();
        }
    }
    
    nextLevel() {
        this.level++;
        this.enemyCount = Math.min(this.enemyCount + 1, 6);
        this.spawnEnemies();
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    render() {
        // 清除画布
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.drawGrid();
        
        // 绘制障碍物
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
        
        // 绘制坦克
        if (this.playerTank) {
            this.playerTank.render(this.ctx);
        }
        this.enemyTanks.forEach(tank => tank.render(this.ctx));
        
        // 绘制子弹
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        
        // 绘制爆炸效果
        this.explosions.forEach(explosion => explosion.render(this.ctx));
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}

// 坦克基类
class Tank {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = color;
        this.direction = 'up';
        this.speed = 2;
        this.health = 1;
        this.lastShot = 0;
        this.shotCooldown = 500;
    }
    
    move(direction, obstacles) {
        const oldX = this.x;
        const oldY = this.y;
        this.direction = direction;
        
        switch (direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }
        
        // 边界检测
        if (this.x < 20 || this.x + this.width > 780 || 
            this.y < 20 || this.y + this.height > 580) {
            this.x = oldX;
            this.y = oldY;
            return;
        }
        
        // 障碍物碰撞检测
        for (let obstacle of obstacles) {
            if (this.x < obstacle.x + obstacle.width &&
                this.x + this.width > obstacle.x &&
                this.y < obstacle.y + obstacle.height &&
                this.y + this.height > obstacle.y) {
                this.x = oldX;
                this.y = oldY;
                return;
            }
        }
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return null;
        
        this.lastShot = now;
        
        let bulletX = this.x + this.width / 2;
        let bulletY = this.y + this.height / 2;
        
        return new Bullet(bulletX, bulletY, this.direction, this.constructor.name === 'PlayerTank' ? 'player' : 'enemy');
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制坦克炮管
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x + 12, this.y + 12, 6, 6);
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        
        switch (this.direction) {
            case 'up':
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX, this.y - 8);
                break;
            case 'down':
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX, this.y + this.height + 8);
                break;
            case 'left':
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(this.x - 8, centerY);
                break;
            case 'right':
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(this.x + this.width + 8, centerY);
                break;
        }
        ctx.stroke();
    }
    
    update() {
        // 基础更新逻辑
    }
}

// 玩家坦克类
class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, '#3498db');
        this.speed = 3;
    }
}

// 敌方坦克类
class EnemyTank extends Tank {
    constructor(x, y) {
        super(x, y, '#e74c3c');
        this.speed = 1;
        this.moveTimer = 0;
        this.moveInterval = 2000; // 2秒改变一次方向
        this.currentDirection = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
        this.shotCooldown = 1500;
    }
    
    update(obstacles, playerTank) {
        const now = Date.now();
        
        // AI移动逻辑
        if (now - this.moveTimer > this.moveInterval) {
            this.currentDirection = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
            this.moveTimer = now;
        }
        
        this.move(this.currentDirection, obstacles);
        
        // 有概率朝向玩家
        if (playerTank && Math.random() < 0.1) {
            const dx = playerTank.x - this.x;
            const dy = playerTank.y - this.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.direction = dy > 0 ? 'down' : 'up';
            }
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 4;
        this.direction = direction;
        this.speed = 5;
        this.active = true;
        this.owner = owner;
    }
    
    update() {
        switch (this.direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }
        
        // 边界检测
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.owner === 'player' ? '#f39c12' : '#ff6b6b';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 障碍物类
class Obstacle {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'brick' 或 'steel'
    }
    
    render(ctx) {
        if (this.type === 'brick') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 绘制砖块纹理
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.width; i += 10) {
                for (let j = 0; j < this.height; j += 10) {
                    ctx.strokeRect(this.x + i, this.y + j, 10, 10);
                }
            }
        } else if (this.type === 'steel') {
            ctx.fillStyle = '#34495e';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 绘制钢铁纹理
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

// 爆炸效果类
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.maxSize = 40;
        this.active = true;
        this.alpha = 1;
    }
    
    update() {
        this.size += 2;
        this.alpha -= 0.05;
        
        if (this.size >= this.maxSize || this.alpha <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#ffa500');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new TankGame();
});