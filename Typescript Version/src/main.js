"use strict";
exports.__esModule = true;
var gsap_1 = require("gsap");
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');
var startGameBTN = document.querySelector('#startGameBTN');
var bannerEl = document.querySelector('#bannerEl');
var scoreEl = document.querySelector('#scoreEl');
var bigscoreEl = document.querySelector('#bigscoreEl');
canvas.width = innerWidth;
canvas.height = innerHeight;
var Player = /** @class */ (function () {
    function Player(x, y, radius, color) {
        this.x = x,
            this.y = y,
            this.radius = radius,
            this.color = color;
    }
    Player.prototype.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    };
    return Player;
}());
var Projectile = /** @class */ (function () {
    function Projectile(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    Projectile.prototype.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    };
    Projectile.prototype.update = function () {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    };
    return Projectile;
}());
var Enemy = /** @class */ (function () {
    function Enemy(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    Enemy.prototype.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    };
    Enemy.prototype.update = function () {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    };
    return Enemy;
}());
var Particle = /** @class */ (function () {
    function Particle(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha;
    }
    Particle.prototype.draw = function () {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    };
    Particle.prototype.update = function () {
        this.draw();
        this.velocity.x = this.velocity.x * friction;
        this.velocity.y = this.velocity.y * friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    };
    return Particle;
}());
// spawn enemies randomly
function spawnEnemies() {
    setInterval(function () {
        var radius = Math.random() * (30 - 4) + 4;
        var enemyX;
        var enemyY;
        if (Math.random() < 0.5) {
            enemyX = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            enemyY = Math.random() * canvas.height;
        }
        else {
            enemyY = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
            enemyX = Math.random() * canvas.width;
        }
        var color = "hsl(" + Math.random() * 360 + ", 50%, 50%)";
        var angle = Math.atan2(canvas.height / 2 - enemyY, canvas.width / 2 - enemyX);
        var velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity));
    }, 2000);
}
window.addEventListener('click', function (event) {
    // Calculate angle for the projectile.
    var angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }));
});
function animate() {
    animationId = requestAnimationFrame(animate);
    // refill the screen so you draw over the screen once objects are updated
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    // Check whether particles alpha value = 0 if it does remove them from the array
    particles.forEach(function (particle, index) {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
        else {
            particle.update();
        }
    });
    // draw projectiles and remove if out of bounds
    projectiles.forEach(function (projectile, index) {
        projectile.update();
        if (projectile.x + projectile.radius < 0 ||
            projectile.y + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y - projectile.radius > canvas.height) {
            projectiles.splice(index, 1);
        }
    });
    //draw and update enemies
    enemies.forEach(function (enemy, enemyindex) {
        enemy.update();
        // check if enemy has hit our player
        var playerEnemyDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (playerEnemyDist - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId);
            bannerEl.style.display = 'flex';
            bigscoreEl.innerHTML = score;
        }
        //check if projectile has hit our enemy
        projectiles.forEach(function (projectile, projectileindex) {
            var projectileEnemyDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            //check for collision
            if (projectileEnemyDist - enemy.radius - projectile.radius < 1) {
                // add particles when enemy hit
                for (var i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }));
                }
                if ((enemy.radius - 10) > 5) {
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap_1["default"].to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(function () {
                        projectiles.splice(projectileindex, 1);
                    });
                }
                else {
                    score += 250;
                    scoreEl.innerHTML = score;
                    setTimeout(function () {
                        enemies.splice(enemyindex, 1);
                        projectiles.splice(projectileindex, 1);
                    });
                }
            }
        });
    });
}
var x = canvas.width / 2;
var y = canvas.height / 2;
var player = new Player(canvas.width / 2, canvas.height / 2, 20, 'white');
var animationId;
var projectiles = [];
var particles = [];
var enemies = [];
var score;
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
startGameBTN.addEventListener("click", function () {
    init();
    spawnEnemies(),
        animate(),
        bannerEl.style.display = 'none';
});
