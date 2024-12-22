class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        this.grid = [];
        this.isFirstClick = true;
        this.isGamesOver = false;
        this.setDifficulty('beginner');
        this.setupDifficultyButtons();
    }

    setupDifficultyButtons() {
        const buttons = document.querySelectorAll('.controls button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.setDifficulty(difficulty);
            });
        });
    }

    setDifficulty(level) {
        const config = this.difficulties[level];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mines = config.mines;
        this.isFirstClick = true;
        this.isGamesOver = false;
        this.createGrid();
    }

    createGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        this.grid = [];

        for (let i = 0; i < this.rows; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            const gridRow = [];

            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', (e) => this.handleClick(e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));

                row.appendChild(cell);
                gridRow.push({
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }

            gridElement.appendChild(row);
            this.grid.push(gridRow);
        }
    }

    placeMines(firstClickRow, firstClickCol) {
        // Keep track of how many mines we've placed
        let minesPlaced = 0;

        // Create a "safe zone" around the first click
        const safeZone = this.getSafeZone(firstClickRow, firstClickCol);

        while (minesPlaced < this.mines) {
            // Generate random coordinates
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // Check if this cell is in the safe zone
            const isSafeCell = safeZone.some(([safeRow, safeCol]) =>
                safeRow === row && safeCol === col
            );

            // Place mine if cell is not in safe zone and doesn't already have a mine
            if (!isSafeCell && !this.grid[row][col].isMine) {
                this.grid[row][col].isMine = true;
                minesPlaced++;
            }
        }

        // After placing mines, calculate neighbor counts
        this.calculateNeighborCounts();
    }

    getSafeZone(row, col) {
        // Returns array of coordinates that should not contain mines
        const safeZone = [];

        // Include clicked cell and all adjacent cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;

                // Check if cell is within grid boundaries
                if (newRow >= 0 && newRow < this.rows &&
                    newCol >= 0 && newCol < this.cols) {
                    safeZone.push([newRow, newCol]);
                }
            }
        }

        return safeZone;
    }

    calculateNeighborCounts() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.grid[row][col].isMine) {
                    let count = 0;

                    // Check all adjacent cells
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const newRow = row + i;
                            const newCol = col + j;

                            // Check if cell is within grid boundaries
                            if (newRow >= 0 && newRow < this.rows &&
                                newCol >= 0 && newCol < this.cols) {
                                if (this.grid[newRow][newCol].isMine) {
                                    count++;
                                }
                            }
                        }
                    }
                    this.grid[row][col].neighborMines = count;
                }
            }
        }
    }

    handleClick(e) {
        if (this.isGamesOver)
            return;
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // On first click, place mines
        if (this.isFirstClick) {
            this.placeMines(row, col);
            this.isFirstClick = false;
        }

        // Rest of click handling to be implemented
        console.log(`Clicked cell at ${row}, ${col}`);
        if (this.grid[row][col].isMine) {
            this.isGamesOver = true;
            this.revealAllMines()
            console.log('💥BOOM! It was a mine!💥');
            // cell.textContent = '💣'
            cell.innerHTML = '<img src="./bomb.png" class="grid-image">';
            cell.classList.add('mine');
        } else if (this.grid[row][col].neighborMines === 0) {
            this.revealCells(row, col);
        } else {
            this.revealNeighborCell(row, col)
        }
    }

    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].isMine) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    // cell.textContent = '💣'
                    cell.innerHTML = '<img src="./bomb.png" class="grid-image">';

                    cell.classList.add('mine');
                }
            }
        }
    }

    revealNeighborCell(row, col) {
        const neighborMinesCount = this.grid[row][col].neighborMines;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('big-bold-text');
        cell.textContent = neighborMinesCount
        cell.classList.add('revealed');
        if (neighborMinesCount === 1)
            cell.classList.add('number1')
        if (neighborMinesCount === 2)
            cell.classList.add('number2')
        if (neighborMinesCount === 3)
            cell.classList.add('number3')
        this.grid[row][col].isRevealed = true;
        console.log(`This cell has ${neighborMinesCount} neighboring mines at ${row}, ${col}`);
    }

    revealCells(currentRow, currentCol) {
        if ((currentRow < 0 || currentRow >= this.rows ||
            currentCol < 0 || currentCol >= this.cols) ||
            (this.grid[currentRow][currentCol].isRevealed)) {
            return;
        }
        if (this.grid[currentRow][currentCol].neighborMines !== 0) {
            this.revealNeighborCell(currentRow, currentCol);
            return;
        }
        const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
        cell.classList.add('revealed');
        this.grid[currentRow][currentCol].isRevealed = true;
        console.log(`No neighboring mines at ${currentRow}, ${currentCol}`);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                this.revealCells(currentRow + i, currentCol + j)
            }
        }
        return;
    }

    handleRightClick(e) {
        e.preventDefault();
        if (this.isGamesOver)
            return;
        const cell = e.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        // Flagging logic to be implemented
        if (!this.grid[row][col].isFlagged && !this.grid[row][col].isRevealed) {
            // cell.textContent = '⛳'
            cell.innerHTML = '<img src="./flag.png" class="grid-image">';
            // const image = document.createElement('img');
            // image.src = './bomb.png'; // replace with your image path
            // image.alt = 'Your image alt text';
            // cell.appendChild(image);
            cell.classList.add('flag');
        } else if (!this.grid[row][col].isRevealed) {
            console.log('else');
            cell.innerHTML = ''
            cell.classList.remove('flag');
        }
        this.grid[row][col].isFlagged = !this.grid[row][col].isFlagged
        console.log(`Right clicked cell at ${row}, ${col}`);
    }
}
new Minesweeper();