const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const SCREEN_WIDTH = 450;
const SCREEN_HEIGHT = 700;
const WHITE = 'white';
const BLACK = 'black';
const FONT_SIZE = 30;
const PIPE_WIDTH = 120;
const PIPE_GAP = 180;
const PIPE_SPEED = 6;

// Load images
const backgroundImg = new Image();
backgroundImg.src = 'assets/BG2.png';

const birdImg = new Image();
birdImg.src = 'assets/mamata.jpg';

const pipeImg = new Image();
pipeImg.src = 'assets/chair2.PNG';

// Load sounds
const hitSound = new Audio('assets/hit.wav');
const scoreSound = new Audio('assets/score.wav');
const celebrationSound = new Audio('assets/celebration.wav');

// Ensure assets are loaded before starting the game loop
backgroundImg.onload = () => {
    birdImg.onload = () => {
        pipeImg.onload = () => {
            hitSound.oncanplaythrough = () => {
                scoreSound.oncanplaythrough = () => {
                    celebrationSound.oncanplaythrough = () => {
                        gameLoop();
                    };
                };
            };
        };
    };
};

// Game state
let bird = { x: 50, y: SCREEN_HEIGHT / 2, width: 80, height: 45, dy: 0 };
let pipes = [];
let score = 0;
let highScore = 0;
let gameActive = false;
let startGame = false;

// Text rendering function
function renderText(text, x, y, fontSize, color) {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

// Pipe generation
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (400 - 200 + 1)) + 200;
    return {
        top: { x: SCREEN_WIDTH + 50, y: pipeHeight - PIPE_GAP / 2, width: PIPE_WIDTH, height: pipeHeight - PIPE_GAP / 2 },
        bottom: { x: SCREEN_WIDTH + 50, y: pipeHeight + PIPE_GAP / 2, width: PIPE_WIDTH, height: SCREEN_HEIGHT - (pipeHeight + PIPE_GAP / 2) }
    };
}

// Move pipes
function movePipes() {
    pipes.forEach(pipe => {
        pipe.top.x -= PIPE_SPEED;
        pipe.bottom.x -= PIPE_SPEED;
    });
    pipes = pipes.filter(pipe => pipe.top.x + PIPE_WIDTH > 0);
}

// Check for collisions
function checkCollision() {
    return pipes.every(pipe => {
        const hitPipeTop = bird.x + bird.width > pipe.top.x &&
                           bird.x < pipe.top.x + PIPE_WIDTH &&
                           bird.y < pipe.top.y;
        const hitPipeBottom = bird.x + bird.width > pipe.bottom.x &&
                              bird.x < pipe.bottom.x + PIPE_WIDTH &&
                              bird.y + bird.height > pipe.bottom.y;
        const hitGroundOrCeiling = bird.y <= 0 || bird.y + bird.height >= SCREEN_HEIGHT;
        if (hitPipeTop || hitPipeBottom || hitGroundOrCeiling) {
            hitSound.play();
            return false;
        }
        return true;
    });
}

// Update score
function updateScore() {
    pipes.forEach(pipe => {
        if (pipe.top.x + PIPE_WIDTH < bird.x && pipe.top.x + PIPE_WIDTH + PIPE_SPEED >= bird.x) {
            score++;
            scoreSound.play();
        }
    });
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.drawImage(backgroundImg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (startGame) {
        bird.dy += 0.25;
        bird.y += bird.dy;
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        movePipes();
        pipes.forEach(pipe => {
            ctx.drawImage(pipeImg, pipe.top.x, pipe.top.y, pipe.width, pipe.height);
            ctx.drawImage(pipeImg, pipe.bottom.x, pipe.bottom.y, pipe.width, pipe.height);
        });

        if (!checkCollision()) {
            gameActive = false;
            highScore = Math.max(score, highScore);
            displayGameOver();
            return;
        }
        updateScore();
        renderText(`Crimes: ${score}`, SCREEN_WIDTH / 2, 50, FONT_SIZE, WHITE);
    } else {
        displayMainMenu();
    }

    requestAnimationFrame(gameLoop);
}

// Display Game Over screen
function displayGameOver() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderText('Game Over', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30, FONT_SIZE, WHITE);
    renderText(`Most Crimes: ${highScore}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 30, FONT_SIZE, WHITE);
    renderText('Press SPACE to Restart', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 90, FONT_SIZE, WHITE);
    celebrationSound.play();
}

// Display Main Menu
function displayMainMenu() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderText('The Lady Hitler', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100, FONT_SIZE, WHITE);
    renderText('Press SPACE to Start', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50, FONT_SIZE, WHITE);
}

// Handle user input
window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        if (!startGame) {
            startGame = true;
            gameActive = true;
            pipes = [createPipe()];
        } else if (gameActive) {
            bird.dy = -7;
        } else {
            score = 0;
            bird.y = SCREEN_HEIGHT / 2;
            bird.dy = 0;
            pipes = [createPipe()];
            gameActive = true;
            startGame = true;
        }
    }
});
