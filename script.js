const board = document.querySelector('.board');
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
let highScoreElement = document.querySelector("#high-score");
let scoreElement = document.querySelector("#score");
let timeElement = document.querySelector("#time");

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00:00`;
let timerIntervalId = null;
let intervalId = null;

highScoreElement.innerText = highScore;

// Dynamic Grid Handling
let cols, rows;
const blocks = {};

function initGrid() {
    board.innerHTML = "";
    const blockSize = window.innerWidth < 600 ? 20 : 25; 
    cols = Math.floor(board.clientWidth / blockSize);
    rows = Math.floor(board.clientHeight / blockSize);
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const block = document.createElement('div');
            block.classList.add('block');
            board.appendChild(block);
            blocks[`${r}-${c}`] = block;
        }
    }
}

window.addEventListener('load', initGrid);
window.addEventListener('resize', initGrid);

let snake = [];
let food = { x: 0, y: 0 };
let direction = "right";

function startTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
        let [min, sec] = time.split(":").map(Number);
        if (sec === 59) { min++; sec = 0; } else { sec++; }
        time = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        timeElement.innerText = time;
    }, 1000);
}

function render() {
    let head = { ...snake[0] };
    if (direction === "left") head.y--;
    else if (direction === "right") head.y++;
    else if (direction === "down") head.x++;
    else if (direction === "up") head.x--;

    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }

    snake.forEach(s => blocks[`${s.x}-${s.y}`]?.classList.remove("fill"));

    if (head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        score += 10;
        scoreElement.innerText = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreElement.innerText = highScore;
        }
        spawnFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
    snake.forEach(s => blocks[`${s.x}-${s.y}`]?.classList.add("fill"));
    blocks[`${food.x}-${food.y}`]?.classList.add("food");
}

function spawnFood() {
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
    if (snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

function gameOver() {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
}

function restartGame() {
    Object.values(blocks).forEach(b => b.classList.remove("fill", "food"));
    score = 0;
    time = `00:00`;
    scoreElement.innerText = score;
    timeElement.innerText = time;
    direction = "right";
    snake = [{ x: Math.floor(rows/2), y: 3 }];
    spawnFood();
    modal.style.display = "none";
    clearInterval(intervalId);
    intervalId = setInterval(render, 200);
    startTimer();
}

startButton.addEventListener("click", restartGame);
restartButton.addEventListener("click", restartGame);

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && direction !== "down") direction = "up";
    if (e.key === "ArrowDown" && direction !== "up") direction = "down";
    if (e.key === "ArrowRight" && direction !== "left") direction = "right";
    if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
});

// Mobile Controls
document.getElementById("ctrl-up").addEventListener("click", () => { if(direction!=="down") direction="up" });
document.getElementById("ctrl-down").addEventListener("click", () => { if(direction!=="up") direction="down" });
document.getElementById("ctrl-left").addEventListener("click", () => { if(direction!=="right") direction="left" });
document.getElementById("ctrl-right").addEventListener("click", () => { if(direction!=="left") direction="right" });