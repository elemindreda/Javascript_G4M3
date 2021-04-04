const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const startGameBTN = document.querySelector('#startGameBTN');
const restartGameBTN = document.querySelector('#restartGameBTN');
const startbannerEl = document.querySelector('#startbannerEl')
const restartbannerEl = document.querySelector('#restartbannerEl');
const scoreEl = document.querySelector('#scoreEl');
const bigscoreEl = document.querySelector('#bigscoreEl');
const friction = 0.98;
canvas.width = innerWidth;
canvas.height = innerHeight;
class Player {
    constructor(x, y, radius, color) {
        this.x = x,
            this.y = y,
            this.radius = radius,
            this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update() {
        this.draw();
        this.velocity.x = this.velocity.x * friction;
        this.velocity.y = this.velocity.y * friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}
// spawn enemies randomly
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let enemyX;
        let enemyY;
        if (Math.random() < 0.5) {
            enemyX = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            enemyY = Math.random() * canvas.height;
        }
        else {
            enemyY = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
            enemyX = Math.random() * canvas.width;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - enemyY, canvas.width / 2 - enemyX);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity));
    }, 1000);

}
window.addEventListener('click', (event) => {
    // Calculate angle for the projectile.
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }));
});
function animate() {
    console.log(enemies)
    animationId = requestAnimationFrame(animate);
    // refill the screen so you draw over the screen once objects are updated
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    // Check whether particles alpha value = 0 if it does remove them from the array
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
        else {
            particle.update();
        }
    });
    // draw projectiles and remove if out of bounds
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.x + projectile.radius < 0 ||
            projectile.y + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y - projectile.radius > canvas.height) {
            projectiles.splice(index, 1);
        }
    });
    //draw and update enemies
    enemies.forEach((enemy, enemyindex) => {
        enemy.update();
        // check if enemy has hit our player
        const playerEnemyDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (playerEnemyDist - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);
            restartbannerEl.style.display = 'flex';
            bigscoreEl.innerHTML = score;
        }
        //check if projectile has hit our enemy
        projectiles.forEach((projectile, projectileindex) => {
            const projectileEnemyDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            //check for collision
            if (projectileEnemyDist - enemy.radius - projectile.radius < 1) {
                // add particles when enemy hit
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }));
                }
                if ((enemy.radius - 10) > 5) {
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileindex, 1);
                    });
                }
                else {
                    score += 250;
                    scoreEl.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(enemyindex, 1);
                        projectiles.splice(projectileindex, 1);
                    });
                }
            }
        });
    });
}
const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(canvas.width / 2, canvas.height / 2, 20, 'white');
let animationId;
let projectiles = [];
let particles = [];
let enemies = [];
let score;
score = 0;
function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 20, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigscoreEl.innerHTML = score;
}

startGameBTN.addEventListener("click", () => {
    init();
    spawnEnemies(),
    animate(),
    startbannerEl.style.display = 'none';
});

restartGameBTN.addEventListener("click", () => {
    init();
    animate(),
    restartbannerEl.style.display = 'none';
});
