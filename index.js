function drawHealthBar() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 105, 35);
    ctx.fillStyle = "#ec273f";
    ctx.fillRect(0, 0, Player.health, 30);
}

class Level {
    static width = 3000;
    static height = 3000;
}

class Player {
    static x = Level.width / 2;
    static y = Level.height / 2;
    static w = 50;
    static h = 80;
    static speed = 5;

    static health = 100;
}

class Enemy {
    speed;
    color;
    health;
    damage;
    cooldown = 10;
    x;
    y;
    width = 50;
    height = 70;

    constructor(x, y, speed, color, health, damage) {
        this.speed = speed;
        this.color = color;
        this.health = health;
        this.damage = damage;
        this.x = x;
        this.y = y;
    }

    moveTowardsPlayer() {
        const playerX = Player.x - Player.w / 2;
        const playerY = Player.y - Player.h / 2;

        const distToPlayerX = this.x - playerX;
        const distToPlayerY = this.y - playerY;

        const distance = Math.sqrt(distToPlayerX * distToPlayerX + distToPlayerY * distToPlayerY);
        
        const normalX = distToPlayerX / distance;
        const normalY = distToPlayerY / distance;
        if (distance > 2000) {
            this.x -= this.speed * normalX * 5;
            this.y -= this.speed * normalY * 5;
        } else {
            this.x -= this.speed * normalX;
            this.y -= this.speed * normalY;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    attackPlayer() {
        const playerX = Player.x - Player.w/2;
        const playerY = Player.y;

        const distToPlayerX = this.x - playerX;
        const distToPlayerY = this.y - playerY;

        const distance = Math.sqrt(distToPlayerX * distToPlayerX + distToPlayerY * distToPlayerY);

        if (this.cooldown <= 0 && distance < 80) {
            Player.health -= this.damage;
            this.cooldown = 60;
        } else {
            this.cooldown--;
        }
    }

    drawEnemy(sx, sy) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - sx, this.y - sy, this.width, this.height);
    }
}

function spawnEnemies(roundNumber, screenX, screenY, screenWidth, screenHeight) {
    let credits = 10 * roundNumber;
    while (credits > 0) {
        const randomX = Math.random() * Level.width;
        const randomY = Math.random() * Level.height;
    
        if (!doAABBColission(screenX, screenY, screenWidth, screenHeight, randomX, randomY, this.width, this.height)) {
            const randomEnemyType = Math.random();
            if(randomEnemyType < 0.5) {
                enemies.push(new Enemy(randomX, randomY, 2, '#00ff00', 2, 1))
                credits -= 1;
            }
            else if(randomEnemyType < 0.8) {
                enemies.push(new Enemy(randomX, randomY, 3, '#0000FF', 2, 1))
                credits -= 2;
            }
            else {
                enemies.push(new Enemy(randomX, randomY, 1, '#FF0000', 5, 1))
                credits -= 3;
            }
        }
    }
}

const enemies = [];

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const Keys = {};

const images = [];

function doAABBColission(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        y1 + h1 > y2);
}

class GunPellet {
    x;
    y;
    dx;
    dy;
    dead = false;
    static radius = 10;

    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }
    
    update() {
        for (let itr = 0; itr < 5; itr++) {
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                if (doAABBColission(
                    this.x - GunPellet.radius, this.y - GunPellet.radius, GunPellet.radius * 2, GunPellet.radius * 2,
                    enemy.x, enemy.y, enemy.width, enemy.height
                ) && !this.dead) {
                    enemy.health--;
                    this.dead = true;
                    return;
                }
            }

            
            this.x += this.dx / 5;
            this.y += this.dy / 5;
        }

        if (!doAABBColission(this.x, this.y, GunPellet.radius * 2, GunPellet.radius * 2, 0, 0, Level.width, Level.height)) {
            this.dead = true;
        }
    }

    draw(tx, ty) {
        ctx.beginPath();
        ctx.arc(this.x - tx - Player.w / 2, this.y - ty - Player.h / 2, GunPellet.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#6dead6';
        ctx.fill();
    }
}

class VerticalLaser {
    x;
    width = 100;
    countdown = 120;
  
    constructor(x) {
      this.x = x;
    }

    update() {
        this.countdown--;
        if (this.countdown <= 0) {
            for (let i = 0; i < enemies.length; i++) {
                if (doAABBColission(
                    this.x - this.width, 0, this.width * 2, Level.height,
                    enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height
                )) {
                    enemies[i].health = 0;
                    console.log('here')
                }
            }

            if (doAABBColission(
                this.x - this.width, 0, this.width * 2, Level.height,
                Player.x, Player.y, Player.w, Player.h
            )) {
                Player.health = 0
            }
        } else if (this.cooldown < -20) {
            laser = null;
        }
    }
  
    draw(tx, ty) {
        ctx.fillStyle = `rgba(109, 234, 214, ${1 - this.countdown / 120})`;
        ctx.fillRect(this.x - tx - this.width, 0, 2 * this.width, canvas.height);
    }
  }
  
  class HorisontalLaser {
    y;
    height = 100;
    countdown = 120;
  
    constructor(y) {
      this.y = y;
    }

    update() {
        this.countdown--;
        if (this.countdown <= 0) {
            for (let i = 0; i < enemies.length; i++) {
                if (doAABBColission(
                    0, this.y - this.height, Level.width, this.height * 2,
                    enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height
                )) {
                    enemies[i].health = 0;
                    console.log('here')
                }
            }

            if (doAABBColission(
                this.x - this.width, 0, this.width * 2, Level.height,
                Player.x, Player.y, Player.w, Player.h
            )) {
                Player.health = 0
            }
        } else if (this.cooldown < -20) {
            laser = null;
        }
    }

    draw(tx, ty) {
        ctx.fillStyle = `rgba(109, 234, 214, ${1 - this.countdown / 120})`;
        ctx.fillRect(0, this.y - ty - this.height, canvas.width, 2 * this.height);
    }
}

let laser = null;

const gunAttackPellets = [];
let gunAttackCooldown = 60;
let laserCooldown = 300;

const mouse = {
    x: 0,
    y: 0
};

let round = 0;

window.onresize = resize;

/**
 * @param {KeyboardEvent} e 
 */
function keydownEvent(e) {
    Keys[e.key.toLowerCase()] = true;
}

/**
 * @param {MouseEvent} e 
 */
function onMouseMove(e) {
    mouse.x = e.x;
    mouse.y = e.y;
}

/**
 * @param {KeyboardEvent} e 
 */
function keyupEvent(e) {
    Keys[e.key.toLowerCase()] = undefined;
}

function resize(e = undefined) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onkeydown = keydownEvent;
window.onkeyup = keyupEvent;
window.onmousemove = onMouseMove;

function drawFrame(deltaTime) {
    console.log(Player.health)
    if (Player.health <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        document.querySelector('div').innerHTML += ' ' + round;
        canvas.style.display = 'none';
        return;
    }
    window.requestAnimationFrame(dt => drawFrame(dt + deltaTime));
    if (deltaTime < 15.5) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let dx = 0;
    let dy = 0;

    if (Keys.w) {
        dy -= Player.speed;
    }
    if (Keys.s) {
        dy += Player.speed;
    }
    if (Keys.a) {
        dx -= Player.speed;
    }
    if (Keys.d) {
        dx += Player.speed;
    }

    Player.x += dx;
    Player.y += dy;
    Player.x = Math.max(Player.x, Player.w/2);
    Player.y = Math.max(Player.y, Player.h/2);
    Player.x = Math.min(Player.x, Level.width - Player.w/2);
    Player.y = Math.min(Player.y, Level.height - Player.h/2);

    const playerScreenX = Math.max(Math.min(Player.x, canvas.width / 2), Math.max(0, Player.x - (Level.width - canvas.width)));
    const playerScreenY = Math.max(Math.min(Player.y, canvas.height / 2), Math.max(0, Player.y - (Level.height - canvas.height)));

    const screenX = Math.max(Math.max(
        Player.x + canvas.width / 2, canvas.width) - canvas.width,
        Math.min(Player.x - canvas.width / 2, Level.width - canvas.width));
    const screenY = Math.max(Math.max(
        Player.y + canvas.height / 2, canvas.height) - canvas.height,
        Math.min(Player.y - canvas.height / 2, Level.height - canvas.height));

    if (laserCooldown <= 0) {
        laserCooldown = 300;
        if (Math.random() < 0.5) {
            laser = new HorisontalLaser(Player.y);
        } else {
            laser = new VerticalLaser(Player.x);
        }
    } else {
        laserCooldown--;
    }
        
    const mouseAngle = Math.atan2(mouse.y - (Player.y - screenY), mouse.x - (Player.x - screenX));

    const bgWidth = images[0].width;
    const bgHeight = images[0].height;
    const bgXOffset = Player.x - playerScreenX;
    const bgYOffset = Player.y - playerScreenY;

    for (let x = 0; x <= Math.ceil(canvas.width / bgWidth); x++) {
        for (let y = 0; y <= Math.ceil(canvas.height / bgHeight); y++) {
            const bgXIndex = Math.floor(bgXOffset / bgWidth) + x;
            const bgYIndex = Math.floor(bgYOffset / bgHeight) + y;

            ctx.drawImage(images[0], bgXIndex*bgWidth-bgXOffset, bgYIndex*bgHeight-bgYOffset);
        }
    }

    if (gunAttackCooldown <= 0) {
        gunAttackPellets.push(new GunPellet(
            Player.x + Player.w/2, Player.y + Player.h/2,
            Math.cos(mouseAngle) * 20, Math.sin(mouseAngle) * 20));
        gunAttackCooldown = 60;
    } else {
        gunAttackCooldown--;
    }

    

    for (let i = 0; i < gunAttackPellets.length; i++) {
        if (gunAttackPellets[i].dead) {
            gunAttackPellets.splice(i, 1);
        }
    }

    gunAttackPellets.forEach(e => {e.update()})
    gunAttackPellets.forEach(e => (e.draw(screenX, screenY)));

    enemies.forEach(e => {e.moveTowardsPlayer()});
    enemies.forEach(e => {e.attackPlayer()})
    enemies.forEach(e => {e.drawEnemy(screenX, screenY)});

    if (laser !== null) {
        laser.update()
        laser.draw(screenX, screenY);
    };

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].health <= 0) {
            enemies.splice(i, 1);
        }
    }

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(playerScreenX - Player.w/2, playerScreenY - Player.h/2, Player.w, Player.h);

    if (enemies.length === 0) {
        round++;

        spawnEnemies(round, screenX, screenY, canvas.width, canvas.height);
        console.log(enemies.length)
    }

    drawHealthBar();
}

images.push(new Image());

images[0].addEventListener('load', () => {
    drawFrame(100);
});

images[0].src = 'background.png';

resize();