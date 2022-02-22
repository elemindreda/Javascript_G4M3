/* eslint-disable no-restricted-properties */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
//  Canvas Setup
const canvas = document.getElementById('canvas1');
const scoreEl = document.getElementById('scoreEl');
const startGameBanner = document.getElementById('startBannerEl');
const ctx = canvas.getContext('2d');

// Global Score Variable
let score = 0;

// Global Enemies Array
const blocks = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keyboard = {
  direction: 'none',
};

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    keyboard.direction = 'right';
  } else if (event.key === 'ArrowLeft') {
    keyboard.direction = 'left';
  }
});

document.addEventListener('keyup', () => {
  keyboard.direction = 'none';
});

class Player {
  constructor() {
    const newLocal = this;
    newLocal.x = canvas.width / 2;
    this.y = canvas.height;
    this.length = 100;
    this.height = 15;
    this.velocity = 10;
    this.friction = 0.9;
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x - this.length / 2, this.y - this.height, this.length, this.height);
    ctx.fill();
  }

  update() {
    if (keyboard.direction === 'right') {
      if (this.x + this.length / 2 < canvas.width) {
        this.x += this.velocity * this.friction;
        // console.log(this.x);
      }
    } else if (keyboard.direction === 'left') {
      if (this.x >= this.length / 2) {
        this.x -= this.velocity * this.friction;
        // console.log(this.x);
      }
    }
  }
}

// Instantiate Player Class
const player = new Player();

class Ball {
  constructor() {
    const newLocal = this;
    newLocal.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 7;
    this.speed = 6;
    this.velocity = {
      x: 0,
      y: 3,
    };
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Instantiate Ball Class
const ball = new Ball();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.y = canvas.height;
});

function ballCollisions() {
  // Check if ball has hit player and bounce back
  if (ball.y + ball.velocity.y > canvas.height - player.height
    && ball.x > player.x - player.length / 2
    && ball.x < player.x + player.length / 2) {
    // apply calculated y velocity to ball
    ball.velocity.y = -ball.velocity.y;
    // Constant defining the x direction bounce
    const paddleFriction = 0.1;
    const epsilon = 0.001;
    // apply calculated x velocity to the ball
    ball.velocity.x = (paddleFriction * (ball.x - player.x)) / 2 + epsilon;
    console.log('ball.velocity.x = ', ball.velocity.x, 'ball.velocity.y = ', ball.velocity.y);
    // calculate vector magnitude
    const magnitude = Math.sqrt(Math.pow(ball.velocity.x, 2) + Math.pow(ball.velocity.y, 2));
    // calculate unit vector
    ball.velocity.y = (ball.velocity.y / magnitude) * ball.speed;
    ball.velocity.x = (ball.velocity.x / magnitude) * ball.speed;
    // console.log('ball.x = ', ball.x, 'player.x =', player.x);
    // console.log('magnitude = ', magnitude);
    // console.log('ball.velocity.x = ', ball.velocity.x, 'ball.velocity.y = ', ball.velocity.y);
  }
  // Check if ball has hit the top boundary
  if (ball.y + ball.velocity.y < 0) {
    ball.velocity.y = -ball.velocity.y;
  }
  // Check if ball has hit the side boundary
  if (ball.x + ball.velocity.x < 0 || ball.x + ball.velocity.x > canvas.width) {
    ball.velocity.x = -ball.velocity.x;
  }

  // Check whether ball has hit block
  blocks.forEach((block, index) => {
    const dx = Math.abs(ball.x - block.x);
    const dy = Math.abs(ball.y - block.y);

    if (dx < ball.radius + block.length / 2 && dy < ball.radius + block.height / 2) {
      ball.velocity.y = -ball.velocity.y;
      if (block.tough <= 1){
        setTimeout(() => {
          blocks.splice(index, 1);
          score += 20;
        });
      } else{
        block.tough--;
        score += 2;
      }
    }
  });
}

class Block {
  constructor(x, y) {
    const newLocal = this;
    newLocal.x = x;
    this.y = y;
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    this.length = canvas.width / 10;
    this.height = 20;
    this.tough = Math.round(Math.random() * 10);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.length / 2, this.y - this.height / 2, this.length, this.height);
    ctx.fill();
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ballCollisions();
  player.draw();
  player.update();
  ball.draw();
  ball.update();
  blocks.forEach((block) => {
    block.draw();
  });
  // console.log(keyboard.direction)
  const animation = requestAnimationFrame(animate);

  scoreEl.innerHTML = score;

  // Check for game end
  if (ball.y >= canvas.height + ball.radius + player.height) {
    cancelAnimationFrame(animation);
    startGameBanner.style.display = 'flex';
  }
}

function spawnBlocks(y) {
  for (let i = 1; i < 11; i++) {
    const centerx = i * (canvas.width / 10) - (canvas.width / 10) / 2;
    blocks.push(new Block(centerx, y));
  }
}

startGameBanner.addEventListener('click', () => {
  spawnBlocks(canvas.height / 3);
  spawnBlocks(canvas.height / 4);
  spawnBlocks(canvas.height / 5);
  console.log(blocks);
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocity.x = 0;
  ball.velocity.y = 3;
  animate();
  startGameBanner.style.display = 'none';
});
