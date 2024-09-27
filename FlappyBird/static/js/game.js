const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const birdImg = new Image();
const pipeImg = new Image();
birdImg.src = 'static/images/bird.png';  // Path to your bird image
pipeImg.src = 'static/images/pipe.png';  // Path to your pipe image

// Load sound files
const jumpSound = new Audio('static/sounds/jump.mp3');
const scoreSound = new Audio('static/sounds/score.mp3');
const gameOverSound = new Audio('static/sounds/gameover.mp3');

let bird = {
    x: 50,
    y: 150,
    width: 100,
    height: 80,
    gravity: 0.006,
    lift: -15,
    velocity: 0,
    jump: function() {
        this.velocity += this.lift;
        jumpSound.play(); // Play jump sound when bird jumps
    },
    descend: function() {
        this.velocity += 5;  // Make the bird descend faster when down arrow is pressed
    },
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0; // Reset velocity if hit ground
        }
        if (this.y < 0) {
            this.y = 0; // Prevent from going above the canvas
            this.velocity = 0; // Reset velocity if hit top
        }
    },
    show: function() {
        ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
    }
};

let pipes = [];
let frame = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Retrieve high score from localStorage
let gameOver = false;
let difficulty = 1; // Default difficulty level

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height / 2));
    pipes.push({
        x: canvas.width,
        top: pipeHeight,
        bottom: canvas.height - pipeHeight - 150, // Gap
        width: 40
    });
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2 + difficulty; // Pipe speed increases with difficulty
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            score++; // Increase score
            scoreSound.play(); // Play score sound
        }
        // Check for collision
        if (
            bird.x < pipes[i].x + pipes[i].width &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].top || bird.y + bird.height > canvas.height - pipes[i].bottom)
        ) {
            gameOver = true;
            gameOverSound.play(); // Play game over sound
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.show();
    bird.update();
    
    if (frame % (75 - difficulty * 10) === 0) { // Create pipes based on difficulty
        createPipe();
    }
    
    updatePipes();
    
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, 0, pipe.width, pipe.top);
        ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
    
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("High Score: " + highScore, 10, 50); // Display high score

    if (gameOver) {
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('restart').style.display = 'block';
        
        // Update high score in localStorage if the current score is higher
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore); // Save high score to localStorage
        }
        
        clearInterval(gameLoop);
    }
    
    frame++;
}

// Click anywhere on the screen to make the bird jump
canvas.addEventListener("click", function() {
    if (!gameOver) {
        bird.jump();
    }
});

// Keyboard controls for up and down arrow keys
document.addEventListener('keydown', function(event) {
    if (!gameOver) {
        if (event.key === 'ArrowUp') {
            bird.jump();  // Bird jumps when the up arrow is pressed
        } else if (event.key === 'ArrowDown') {
            bird.descend();  // Bird descends faster when the down arrow is pressed
        }
    }
});

// Change difficulty level based on user selection
document.getElementById('difficulty').addEventListener("change", function() {
    difficulty = parseInt(this.value);
});

// Restart game
document.getElementById('restart').addEventListener("click", function() {
    pipes = [];
    score = 0;
    bird.y = 150;
    bird.velocity = 0;
    gameOver = false;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('restart').style.display = 'none';
    gameLoop = setInterval(drawGame, 1000 / 60); // 60 FPS
});

// Start the game loop
let gameLoop = setInterval(drawGame, 1000 / 60); // 60 FPS
