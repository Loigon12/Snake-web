    const GRID_SIZE = 25;
    const BOARD_SIZE = 600;
    const COLUMNS = BOARD_SIZE / GRID_SIZE;
    const ROWS = BOARD_SIZE / GRID_SIZE;
    const TIMER_DELAY = 120;

    const canvas = document.getElementById('snakeGame');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score-text');
    const highScoreElement = document.getElementById('high-score-text');
    const startupScreen = document.getElementById('startup-screen');
    const beginButton = document.getElementById('begin-button');
    const loadingText = document.getElementById('loading-text');

    let snake = [], appleX, appleY, applesEaten = 0;
    let direction = 'R', running = false, gameTimer;
    let highScore = localStorage.getItem('snakeHighScore') || 0;

    // --- Lógica de la Pantalla de Carga ---
    window.onload = () => {
        // Simular carga de 3 segundos
        setTimeout(() => {
            loadingText.style.display = 'none';
            beginButton.style.display = 'block';
        }, 3000);
    };

    beginButton.onclick = () => {
        startupScreen.style.opacity = '0';
        setTimeout(() => {
            startupScreen.style.display = 'none';
            startGame();
        }, 500);
    };

    function startGame() {
        snake = [];
        for (let i = 0; i < 6; i++) {
            snake.push({ x: (Math.floor(COLUMNS / 2) - i) * GRID_SIZE, y: (Math.floor(ROWS / 2)) * GRID_SIZE });
        }
        applesEaten = 0;
        direction = 'R';
        running = true;
        document.getElementById('game-over-overlay').style.display = 'none';
        updateScore();
        spawnApple();
        if (gameTimer) clearInterval(gameTimer);
        gameTimer = setInterval(gameLoop, TIMER_DELAY);
    }

    // (La lógica de spawnApple, gameLoop, move y collisions se mantiene igual que el código anterior)
    function spawnApple() {
        let overlaps;
        do {
            overlaps = false;
            appleX = Math.floor(Math.random() * COLUMNS) * GRID_SIZE;
            appleY = Math.floor(Math.random() * ROWS) * GRID_SIZE;
            snake.forEach(p => { if(p.x === appleX && p.y === appleY) overlaps = true; });
        } while (overlaps);
    }

    function gameLoop() {
        if (running) {
            const head = { ...snake[0] };
            if (direction === 'U') head.y -= GRID_SIZE;
            else if (direction === 'D') head.y += GRID_SIZE;
            else if (direction === 'L') head.x -= GRID_SIZE;
            else if (direction === 'R') head.x += GRID_SIZE;

            if (head.x === appleX && head.y === appleY) {
                applesEaten++;
                updateScore();
                spawnApple();
            } else {
                snake.pop();
            }

            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE ||
                snake.some(p => p.x === head.x && p.y === head.y)) {
                endGame();
                return;
            }
            snake.unshift(head);
        }
        render();
    }

    function endGame() {
        running = false;
        clearInterval(gameTimer);
        if (applesEaten > highScore) {
            highScore = applesEaten;
            localStorage.setItem('snakeHighScore', highScore);
        }
        document.getElementById('final-score').innerText = `Puntuación: ${applesEaten}`;
        document.getElementById('game-over-overlay').style.display = 'flex';
        updateScore();
    }

    function updateScore() {
        scoreElement.innerText = `Manzanas: ${applesEaten}`;
        highScoreElement.innerText = `Record: ${highScore}`;
    }

    function render() {
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

        ctx.strokeStyle = '#1e1e1e';
        for(let i=0; i<=BOARD_SIZE; i+=GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,BOARD_SIZE); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(BOARD_SIZE,i); ctx.stroke();
        }

        ctx.strokeStyle = '#501414';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, BOARD_SIZE-2, BOARD_SIZE-2);

        if (running) {
            ctx.fillStyle = 'red';
            ctx.beginPath(); ctx.arc(appleX+GRID_SIZE/2, appleY+GRID_SIZE/2, GRID_SIZE/2.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(appleX+GRID_SIZE/3, appleY+GRID_SIZE/4, GRID_SIZE/8, 0, Math.PI*2); ctx.fill();

            snake.forEach((p, i) => {
                ctx.fillStyle = (i === 0) ? '#32CD32' : '#228B22';
                ctx.fillRect(p.x, p.y, GRID_SIZE, GRID_SIZE);
                ctx.strokeStyle = '#222';
                ctx.strokeRect(p.x, p.y, GRID_SIZE, GRID_SIZE);
            });
        }
    }

    // Controles (WASD + Flechas + Swipe)
    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        if (key === 'r') startGame();
        if (!running) return;
        if ((key === 'arrowup' || key === 'w') && direction !== 'D') direction = 'U';
        else if ((key === 'arrowdown' || key === 's') && direction !== 'U') direction = 'D';
        else if ((key === 'arrowleft' || key === 'a') && direction !== 'R') direction = 'L';
        else if ((key === 'arrowright' || key === 'd') && direction !== 'L') direction = 'R';
    });

    // Swipe para móviles
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    canvas.addEventListener('touchend', e => {
        if (!running) return;
        let diffX = e.changedTouches[0].screenX - touchStartX;
        let diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 30) {
                if (diffX > 0 && direction !== 'L') direction = 'R';
                else if (diffX < 0 && direction !== 'R') direction = 'L';
            }
        } else {
            if (Math.abs(diffY) > 30) {
                if (diffY > 0 && direction !== 'U') direction = 'D';
                else if (diffY < 0 && direction !== 'D') direction = 'U';
            }
        }
    }, false);

    document.getElementById('restart-button').onclick = startGame;