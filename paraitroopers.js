const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const COLORS = {
    bg: '#0a0a1a',
    player: '#ff6b35',
    playerLight: '#ff8c5a',
    enemy: '#e0e0e0',
    enemyDark: '#a0a0a0',
    ground: '#1a1a2e',
    groundLine: '#ff6b35',
    special: '#ffcc00',
    explosion: '#ff6b35',
    cannonBody: '#4a4a4a',
    cannonBase: '#2a2a2a'
};

const GROUND_Y = canvas.height - 40;
const CANNON_X = canvas.width / 2;
const CANNON_Y = GROUND_Y - 30;

const keys = {};
const LEFT_ANGLE = 190;
const RIGHT_ANGLE = 350;

let gameOver = false;
let paused = false;
let score = 0;

const cannon = {
    angle: 270,
    rotationSpeed: 3,
    cooldown: 0,
    cooldownTime: 15
};

const specialAmmo = {
    active: false,
    armed: false,
    projectile: null,
    cooldown: 0,
    maxCooldown: 300,
    speed: 4,
    radius: 80,
    maxHeight: canvas.height * 0.8
};

const planes = [];
const paratroopers = [];
const projectiles = [];
const explosions = [];

let leftLanded = 0;
let rightLanded = 0;
let planeTimer = 0;
let planeInterval = 480;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') e.preventDefault();
    
    if (e.key === 'Escape' && !gameOver) {
        paused = !paused;
    }
    
    if (e.key.toLowerCase() === 'q' && !gameOver) {
        if (specialAmmo.projectile) {
            createExplosion(specialAmmo.projectile.x, specialAmmo.projectile.y, specialAmmo.radius);
            checkExplosionCollisions(specialAmmo.projectile.x, specialAmmo.projectile.y, specialAmmo.radius);
            specialAmmo.projectile = null;
            specialAmmo.active = false;
            specialAmmo.cooldown = specialAmmo.maxCooldown;
        } else if (specialAmmo.cooldown <= 0) {
            specialAmmo.active = true;
            const rad = cannon.angle * Math.PI / 180;
            specialAmmo.projectile = {
                x: CANNON_X + Math.cos(rad) * 40,
                y: CANNON_Y + Math.sin(rad) * 40,
                vx: Math.cos(rad) * specialAmmo.speed,
                vy: Math.sin(rad) * specialAmmo.speed
            };
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function createExplosion(x, y, radius) {
    explosions.push({
        x, y, radius: 0, maxRadius: radius, alpha: 1
    });
}

function checkExplosionCollisions(x, y, radius) {
    for (let i = paratroopers.length - 1; i >= 0; i--) {
        const p = paratroopers[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius + 20) {
            paratroopers.splice(i, 1);
            score += 10;
        }
    }
}

function spawnPlane() {
    const fromLeft = Math.random() < 0.5;
    planes.push({
        x: fromLeft ? -60 : canvas.width + 60,
        y: 60 + Math.random() * 100,
        width: 60,
        height: 30,
        fromLeft,
        speed: fromLeft ? 2 + Math.random() : -(2 + Math.random()),
        dropTimer: 0,
        dropInterval: 60 + Math.random() * 60,
        dropsLeft: 1 + Math.floor(Math.random() * 3)
    });
}

function fireProjectile(isSpecial = false) {
    const rad = cannon.angle * Math.PI / 180;
    projectiles.push({
        x: CANNON_X + Math.cos(rad) * 45,
        y: CANNON_Y + Math.sin(rad) * 45,
        vx: Math.cos(rad) * (isSpecial ? specialAmmo.speed : 12),
        vy: Math.sin(rad) * (isSpecial ? specialAmmo.speed : 12),
        isSpecial: isSpecial
    });
}

function dropParatrooper(plane) {
    paratroopers.push({
        x: plane.x,
        y: plane.y + plane.height,
        vx: plane.fromLeft ? 0.3 : -0.3,
        vy: 0,
        hasParachute: true,
        fromLeft: plane.fromLeft,
        landed: false
    });
}

function update() {
    if (gameOver || paused) return;
    
    if (keys['a']) {
        cannon.angle -= cannon.rotationSpeed;
        if (cannon.angle < LEFT_ANGLE) cannon.angle = LEFT_ANGLE;
    }
    if (keys['d']) {
        cannon.angle += cannon.rotationSpeed;
        if (cannon.angle > RIGHT_ANGLE) cannon.angle = RIGHT_ANGLE;
    }
    
    if (cannon.cooldown > 0) cannon.cooldown--;
    
    if (keys[' '] && cannon.cooldown <= 0) {
        fireProjectile(false);
        cannon.cooldown = cannon.cooldownTime;
    }
    
    if (specialAmmo.cooldown > 0) specialAmmo.cooldown--;
    
    if (specialAmmo.projectile) {
        specialAmmo.projectile.x += specialAmmo.projectile.vx;
        specialAmmo.projectile.y += specialAmmo.projectile.vy;
        
        if (specialAmmo.projectile.vy > 0) {
            specialAmmo.projectile.vy += 0.05;
        }
        
        if (specialAmmo.projectile.x < -50 || specialAmmo.projectile.x > canvas.width + 50 ||
            specialAmmo.projectile.y > canvas.height + 50) {
            specialAmmo.projectile = null;
            specialAmmo.active = false;
            specialAmmo.armed = false;
        }
    }
    
    planeTimer++;
    if (planeTimer >= planeInterval) {
        spawnPlane();
        planeTimer = 0;
        planeInterval = 480 + Math.random() * 240;
    }
    
    for (let i = planes.length - 1; i >= 0; i--) {
        const plane = planes[i];
        plane.x += plane.speed;
        
        plane.dropTimer++;
        if (plane.dropTimer >= plane.dropInterval && plane.dropsLeft > 0) {
            dropParatrooper(plane);
            plane.dropsLeft--;
            plane.dropTimer = 0;
            plane.dropInterval = 40 + Math.random() * 40;
        }
        
        if ((plane.fromLeft && plane.x > canvas.width + 100) ||
            (!plane.fromLeft && plane.x < -100)) {
            planes.splice(i, 1);
        }
    }
    
    for (let i = paratroopers.length - 1; i >= 0; i--) {
        const p = paratroopers[i];
        
        if (p.landed) continue;
        
        p.x += p.vx;
        p.vy += p.hasParachute ? 0.02 : 0.15;
        p.y += p.vy;
        
        if (p.y >= GROUND_Y - 15) {
            p.y = GROUND_Y - 15;
            p.vy = 0;
            p.vx = 0;
            p.landed = true;
            if (p.fromLeft) leftLanded++;
            else rightLanded++;
            
            if (leftLanded >= 5 || rightLanded >= 5) {
                gameOver = true;
            }
        }
    }
    
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.vy += 0.1;
        
        if (proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
            projectiles.splice(i, 1);
            continue;
        }
        
        for (let j = paratroopers.length - 1; j >= 0; j--) {
            const p = paratroopers[j];
            const dx = p.x - proj.x;
            const dy = p.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 25) {
                if (!p.hasParachute) {
                    paratroopers.splice(j, 1);
                    score += 10;
                } else {
                    paratroopers.splice(j, 1);
                    score += 10;
                }
                projectiles.splice(i, 1);
                break;
            }
        }
    }
    
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.radius += 8;
        exp.alpha -= 0.05;
        if (exp.alpha <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function drawCannon() {
    ctx.save();
    ctx.translate(CANNON_X, CANNON_Y);
    
    ctx.fillStyle = COLORS.cannonBase;
    ctx.fillRect(-25, 0, 50, 20);
    
    ctx.fillStyle = COLORS.ground;
    ctx.beginPath();
    ctx.arc(0, 0, 25, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = COLORS.cannonBase;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 25, Math.PI, 0);
    ctx.stroke();
    
    ctx.rotate(cannon.angle * Math.PI / 180);
    
    ctx.fillStyle = COLORS.cannonBody;
    ctx.beginPath();
    ctx.arc(0, 0, 6, Math.PI / 2, -Math.PI / 2);
    ctx.lineTo(45, -6);
    ctx.lineTo(45, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

function drawPlane(plane) {
    ctx.save();
    ctx.translate(plane.x, plane.y);
    if (!plane.fromLeft) ctx.scale(-1, 1);
    
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = COLORS.enemy;
    ctx.beginPath();
    ctx.ellipse(5, -5, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-45, -15);
    ctx.lineTo(-35, 0);
    ctx.lineTo(-45, 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(25, -2, 15, 4);
    
    ctx.restore();
}

function drawParatrooper(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    
    if (p.hasParachute) {
        ctx.fillStyle = COLORS.enemy;
        ctx.beginPath();
        ctx.arc(0, -15, 12, Math.PI, 0);
        ctx.lineTo(12, 0);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = COLORS.enemyDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(0, 5);
        ctx.lineTo(10, -5);
        ctx.stroke();
    }
    
    ctx.fillStyle = COLORS.enemyDark;
    ctx.fillRect(-4, -4, 8, 14);
    
    ctx.fillStyle = COLORS.enemy;
    ctx.fillRect(-4, -4, 8, 6);
    
    ctx.restore();
}

function drawProjectile(proj) {
    ctx.fillStyle = proj.isSpecial ? COLORS.special : COLORS.playerLight;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.isSpecial ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawExplosion(exp) {
    ctx.save();
    ctx.globalAlpha = exp.alpha;
    ctx.fillStyle = COLORS.explosion;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = COLORS.special;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawGround() {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    ctx.strokeStyle = COLORS.groundLine;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();
    
    ctx.strokeStyle = COLORS.playerLight;
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    const indicatorWidth = 80;
    const indicatorHeight = 8;
    
    ctx.fillStyle = leftLanded >= 5 ? COLORS.explosion : COLORS.player;
    ctx.fillRect(20, GROUND_Y + 10, indicatorWidth * (leftLanded / 5), indicatorHeight);
    ctx.strokeStyle = COLORS.playerLight;
    ctx.strokeRect(20, GROUND_Y + 10, indicatorWidth, indicatorHeight);
    
    ctx.fillStyle = rightLanded >= 5 ? COLORS.explosion : COLORS.player;
    ctx.fillRect(canvas.width - 20 - indicatorWidth * (rightLanded / 5), GROUND_Y + 10, indicatorWidth * (rightLanded / 5), indicatorHeight);
    ctx.strokeStyle = COLORS.playerLight;
    ctx.strokeRect(canvas.width - 20 - indicatorWidth, GROUND_Y + 10, indicatorWidth, indicatorHeight);
    
    ctx.fillStyle = COLORS.enemy;
    ctx.font = '12px Courier New';
    ctx.fillText('LEFT: ' + leftLanded + '/5', 20, GROUND_Y + 35);
    ctx.fillText('RIGHT: ' + rightLanded + '/5', canvas.width - 90, GROUND_Y + 35);
}

function drawUI() {
    ctx.fillStyle = COLORS.player;
    ctx.font = '20px Courier New';
    ctx.fillText('SCORE: ' + score, 20, 30);
    
    let ammoStatus = 'READY';
    let ammoColor = COLORS.player;
    if (specialAmmo.cooldown > 0) {
        ammoStatus = 'COOLDOWN ' + Math.ceil(specialAmmo.cooldown / 60);
        ammoColor = COLORS.enemyDark;
    } else if (specialAmmo.active) {
        ammoStatus = 'FLYING - Q TO DETONATE';
        ammoColor = COLORS.special;
    }
    
    ctx.fillStyle = ammoColor;
    ctx.fillText('SPECIAL: ' + ammoStatus, 20, 55);
    
    ctx.fillStyle = COLORS.playerLight;
    ctx.font = '14px Courier New';
    ctx.fillText('CONTROLS: A/D rotate | SPACE shoot | Q special | ESC pause', 20, 80);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.explosion;
    ctx.font = '48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = COLORS.player;
    ctx.font = '24px Courier New';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.fillStyle = COLORS.enemy;
    ctx.font = '16px Courier New';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.textAlign = 'left';
}

function drawPaused() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.player;
    ctx.font = '48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    
    ctx.fillStyle = COLORS.enemy;
    ctx.font = '16px Courier New';
    ctx.fillText('Press ESC to resume', canvas.width / 2, canvas.height / 2 + 40);
    
    ctx.textAlign = 'left';
}

function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGround();
    
    planes.forEach(drawPlane);
    paratroopers.forEach(drawParatrooper);
    projectiles.forEach(drawProjectile);
    
    if (specialAmmo.projectile) {
        ctx.fillStyle = COLORS.playerLight;
        ctx.beginPath();
        ctx.arc(specialAmmo.projectile.x, specialAmmo.projectile.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        if (specialAmmo.active) {
            ctx.strokeStyle = COLORS.special;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(specialAmmo.projectile.x, specialAmmo.projectile.y, specialAmmo.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    explosions.forEach(drawExplosion);
    drawCannon();
    drawUI();
    
    if (gameOver) {
        drawGameOver();
    }
    
    if (paused && !gameOver) {
        drawPaused();
    }
}

function gameLoop() {
    update();
    draw();
    
    if (keys['r'] && gameOver) {
        resetGame();
    }
    
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    gameOver = false;
    paused = false;
    score = 0;
    leftLanded = 0;
    rightLanded = 0;
    planes.length = 0;
    paratroopers.length = 0;
    projectiles.length = 0;
    explosions.length = 0;
    cannon.angle = 0;
    cannon.cooldown = 0;
    specialAmmo.active = false;
    specialAmmo.armed = false;
    specialAmmo.projectile = null;
    specialAmmo.cooldown = 0;
    planeTimer = 0;
    planeInterval = 480;
}

gameLoop();
