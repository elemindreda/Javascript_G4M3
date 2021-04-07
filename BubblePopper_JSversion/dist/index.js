// Canvas Setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;


let score = 0;
let gameFrame = 0;
let gameSpeed = 1;
ctx.font = '50px Georgia';

// Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click:false
}


canvas.addEventListener('mousedown', function(event){
    //why does mouse.x & mouse.y never return negative value??
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
})
//check if window has been resized
window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect()
})


canvas.addEventListener('mouseup', function(){
    mouse.click = false;
})

//Player
class Player{
    constructor(){
        this.x = 0;
        this.y = canvas.height/2
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update(){
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        let theta = Math.atan2(dy, dx);
        this.angle = theta
        if (mouse.x != this.x){
            this.x-= dx/20;
        }
        if (mouse.y != this.y){
            this.y -= dy/20;
        }
    }
    draw(){
        if (mouse.click){
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.stroke();
        }
        ctx.fillStyle = 'clear';
        // ctx.beginPath();
        // // ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.fillRect(this.x, this.y, this.radius, 10)

        //if Fish is moving Left
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)
        
        if (this.x < mouse.x){
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
                this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4)
        } else {
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
                this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4)
        }
        
        ctx.restore();
    }
}

    //deckare Player image Asset
    const playerLeft = new Image();
    playerLeft.src = './Assets/Images/fish_swim_left.png';
    const playerRight = new Image();
    playerRight.src = './Assets/Images/fish_swim_right.png';

const player = new Player();

//Bubbles
const bubblesArray = [];
const bubblesEffects = [];
const enemiesArray = [];
const bubbleImage = new Image();
bubbleImage.src = './Assets/Images/bubble_pop_frame_01.png';

const bubblePoppedImage = new Image();
bubblePoppedImage.src = './Assets/Images/bubble_pop_under_water_02.png'

class Bubble {
    constructor(){
        this.radius = 50;
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + this.radius*2 + canvas.height * Math.random();
        this.velocity = Math.random() * 5 + 1
        this.distance;
        this.sound = Math.random() <= 0.75 ? 'sound1' : 'sound2'
    }
    update(){
        this.y -= this.velocity;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.hypot(dx, dy)
    }
    draw(){
        // ctx.fillStyle = 'blue';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.stroke();
        ctx.drawImage(bubbleImage, this.x-65, this.y-65, this.radius * 2.6, this.radius*2.6)
    }
}

class BubblesEffects {
    constructor(x, y, velocity,){
        this.radius = 50;
        this.x = x
        this.y = y;
        this.velocity = velocity
    }
    update(){
        this.y -= this.velocity;

    }
    draw(){
        // ctx.fillStyle = 'blue';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.stroke();
        ctx.drawImage(bubblePoppedImage, this.x-65, this.y-65, this.radius * 2.6, this.radius*3)
    }
}

//declare Sound asssets
const bubblePopSound1 = document.createElement('audio');
bubblePopSound1.src = './Assets/Sounds/pop.ogg';
const bubblePopSound2 = document.createElement('audio');
bubblePopSound2.src = './Assets/Sounds/pop3.ogg'

function spawnBubbles(){
    if (gameFrame % 50 == 0){
        bubblesArray.push(new Bubble());
        // console.log('bubble spawned')
    }

    bubblesEffects.forEach((bubbleseffect, index) => {
        bubbleseffect.update()
        bubbleseffect.draw()
        if (bubbleseffect.y < 0){
            setTimeout(() => {
                bubblesEffects.splice(index, 1)
            })
        }
    })

    bubblesArray.forEach((bubble, index) => {
        bubble.update();
        bubble.draw()
        //remove the bubble if it goes offscreen
        if (bubble.y < 0){
            setTimeout(() => {
                bubblesArray.splice(index, 1)
            })
        }
        //remove bubble if collides with player
        if (bubble.distance < bubble.radius + player.radius){
            // create new bubble effects when bubble is popped
            bubblesEffects.push(new BubblesEffects(bubble.x, bubble.y, bubble.velocity))

            if (bubble.sound == 'sound1'){
                bubblePopSound1.play();
            } else {
                bubblePopSound2.play();
            }
            setTimeout(() => {
                bubblesArray.splice(index, 1)
            })
            score++;
        }
    })
}

//Repeating Backgrounds
const background = new Image();
background.src = './Assets/Images/background1.png';

const BG = {
    x1: 0,
    x2:canvas.width,
    y:0,
    width: canvas.width,
    height: canvas.height,
}

function drawBackground(){
    BG.x1 -= gameSpeed;
    if (BG.x1 < -BG.width) BG.x1 = BG.width;
    BG.x2 -= gameSpeed;
    if (BG.x2 < -BG.width) BG.x2 = BG.width;
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height)
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height)
}

// Enemies
const enemyImageLeft = new Image();
const enemyImageRight = new Image();
enemyImageLeft.src = './Assets/Images/enemy_swim_to_left_sheet.png'
enemyImageRight.src = './Assets/Images/enemy_swim_to_right_sheet.png'

class Enemy {
    constructor(){
        this.direction = Math.random() < 0.5 ? 'Left' : 'Right'
        this.radius = 50
        this.x = this.direction === 'Left' ? canvas.width + this.radius : 0 - this.radius
        this.y = Math.random() * canvas.height
        this.velocity = {
            x: this.direction === 'Left' ? Math.random()*2 + 3 *-1 : Math.random()*2 + 3,
            y: Math.random() - 0.5
        }
        this.distance = 100
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 256;
        this.spriteHeight = 256;
    }
    update(){
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.hypot(dx, dy)
    }
    draw(){
        // ctx.fillStyle = 'red';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.stroke();
        

////////////////////////////////////////////////
//// Figure out how to do Sprite Animation ////
//////////////////////////////////////////////

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)

        if (this.direction === 'Left'){
        ctx.drawImage(enemyImageLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
        this.spriteWidth, this.spriteHeight, 0 - 75, 0 - 70, this.spriteWidth/1.80, this.spriteHeight/1.80)
        } else{
            ctx.drawImage(enemyImageRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
                this.spriteWidth, this.spriteHeight, 0 - 75, 0 - 70 , this.spriteWidth/1.8, this.spriteHeight/1.8)
        }
        ctx.restore();
    }
}

function spawnEnemies(){
    if (gameFrame % 500 == 0 ){
        enemiesArray.push(new Enemy());
        console.log(enemiesArray)
    }
    enemiesArray.forEach((enemy, index) =>{
        // console.log(enemy.x)
        enemy.update();
        enemy.draw();

        if (enemy.direction == 'Left' && enemy.x < 0 - enemy.radius ){
            enemiesArray.splice(index, 1)
        }
        if (enemy.direction == 'Right' && enemy.x > canvas. width + enemy.radius){
            enemiesArray.splice(index, 1)
        }
        
    })

    // console.log(enemiesArray)
    // enemiesArray.forEach((enemy, index) => {
    //     enemy.update()
    //     enemy.draw()
    // })
}


//Animation Loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.width);
    drawBackground();
    spawnBubbles();
    spawnEnemies();
    player.update();
    player.draw();
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 10, 50);
    gameFrame++;
    animation = requestAnimationFrame(animate);
}



animate();