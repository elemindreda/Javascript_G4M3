import gsap from "../_snowpack/pkg/gsap.js";
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const startGameBTN = document.querySelector("#startGameBTN");
const bannerEl = document.querySelector("#bannerEl");
const scoreEl = document.querySelector("#scoreEl");
const bigscoreEl = document.querySelector("#bigscoreEl");
const friction = 0.98;
canvas.width = innerWidth;
canvas.height = innerHeight;
class Player {
  constructor(x2, y2, radius, color) {
    this.x = x2, this.y = y2, this.radius = radius, this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}
class Projectile {
  constructor(x2, y2, radius, color, velocity) {
    this.x = x2;
    this.y = y2;
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
  constructor(x2, y2, radius, color, velocity) {
    this.x = x2;
    this.y = y2;
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
  constructor(x2, y2, radius, color, velocity) {
    this.x = x2;
    this.y = y2;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha;
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
function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;
    let enemyX;
    let enemyY;
    if (Math.random() < 0.5) {
      enemyX = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      enemyY = Math.random() * canvas.height;
    } else {
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
  }, 2e3);
}
window.addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }));
});
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (projectile.x + projectile.radius < 0 || projectile.y + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y - projectile.radius > canvas.height) {
      projectiles.splice(index, 1);
    }
  });
  enemies.forEach((enemy, enemyindex) => {
    enemy.update();
    const playerEnemyDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (playerEnemyDist - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
      bannerEl.style.display = "flex";
      bigscoreEl.innerHTML = score;
    }
    projectiles.forEach((projectile, projectileindex) => {
      const projectileEnemyDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (projectileEnemyDist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6)
          }));
        }
        if (enemy.radius - 10 > 5) {
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10
          });
          setTimeout(() => {
            projectiles.splice(projectileindex, 1);
          });
        } else {
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
let player = new Player(canvas.width / 2, canvas.height / 2, 20, "white");
let animationId;
let projectiles = [];
let particles = [];
let enemies = [];
let score;
score = 0;
function init() {
  player = new Player(canvas.width / 2, canvas.height / 2, 20, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  bigscoreEl.innerHTML = score;
}
startGameBTN.addEventListener("click", () => {
  init();
  spawnEnemies(), animate(), bannerEl.style.display = "none";
});
