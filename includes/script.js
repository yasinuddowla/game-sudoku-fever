/**
 * Sudoku Game - Professional Implementation
 * Modern vanilla JavaScript with clean architecture
 */

class SudokuGame {
    constructor() {
        this.selected = null;
        this.selectedElement = null;
        this.errors = 0;
        this.emptyLeft = 0;
        this.musicEnabled = true;
        this.seconds = 0;
        this.minutes = 0;
        this.intervalHandle = null;
        this.difficulty = 'easy';
        
        // Predefined Sudoku puzzles for different difficulties
        this.puzzles = {
            easy: [
                [5,3,0,0,7,0,0,0,0],
                [6,0,0,1,9,5,0,0,0],
                [0,9,8,0,0,0,0,6,0],
                [8,0,0,0,6,0,0,0,3],
                [4,0,0,8,0,3,0,0,1],
                [7,0,0,0,2,0,0,0,6],
                [0,6,0,0,0,0,2,8,0],
                [0,0,0,4,1,9,0,0,5],
                [0,0,0,0,8,0,0,7,9]
            ],
            medium: [
                [0,0,0,6,0,0,4,0,0],
                [7,0,0,0,0,3,6,0,0],
                [0,0,0,0,9,1,0,8,0],
                [0,0,0,0,0,0,0,0,0],
                [0,5,0,1,8,0,0,0,3],
                [0,0,0,3,0,6,0,4,5],
                [0,4,0,2,0,0,0,6,0],
                [9,0,3,0,0,0,0,0,0],
                [0,2,0,0,0,0,1,0,0]
            ],
            hard: [
                [0,0,0,0,0,0,6,8,0],
                [0,0,0,0,4,6,0,0,0],
                [7,0,0,0,0,0,0,0,9],
                [0,5,0,0,0,0,0,0,0],
                [0,0,0,1,0,6,0,0,0],
                [3,0,0,0,0,0,0,0,0],
                [0,4,0,0,0,0,0,0,2],
                [0,0,0,5,2,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ]
        };
        
        this.solution = [
            [5,3,4,6,7,8,9,1,2],
            [6,7,2,1,9,5,3,4,8],
            [1,9,8,3,4,2,5,6,7],
            [8,5,9,7,6,1,4,2,3],
            [4,2,6,8,5,3,7,9,1],
            [7,1,3,9,2,4,8,5,6],
            [9,6,1,5,3,7,2,8,4],
            [2,8,7,4,1,9,6,3,5],
            [3,4,5,2,8,6,1,7,9]
        ];
        
        this.initializeGame();
    }

    initializeGame() {
        this.createParticles();
        this.buildSudokuGrid();
        this.buildNumberPad();
        this.startTimer();
        this.playMusic();
        this.newGame();
    }

    createParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = (Math.random() * 5 + 2) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    buildSudokuGrid() {
        const tbody = document.querySelector('#sudoku_tab tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < 9; col++) {
                const td = document.createElement('td');
                td.className = 'sudoku-cell w-12 h-12 text-center font-bold text-xl cursor-pointer border-2 border-white/30';
                
                // Add thicker borders for 3x3 sections
                if ((col + 1) % 3 === 0 && col < 8) {
                    td.classList.add('border-r-4', 'border-r-white/50');
                }
                if ((row + 1) % 3 === 0 && row < 8) {
                    td.classList.add('border-b-4', 'border-b-white/50');
                }
                
                td.setAttribute('row', row);
                td.setAttribute('col', col);
                td.onclick = () => this.selectCell(td);
                
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    buildNumberPad() {
        const choiceDiv = document.getElementById('choice');
        if (!choiceDiv) return;
        
        choiceDiv.innerHTML = '';
        
        for (let i = 1; i <= 9; i++) {
            const button = document.createElement('button');
            button.className = 'number-pad-btn w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xl rounded-lg transition-all duration-200';
            button.textContent = i;
            button.value = i;
            button.onclick = () => this.selectNumber(i);
            choiceDiv.appendChild(button);
        }
    }

    selectCell(cell) {
        // Remove previous selection
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }
        
        // Select new cell
        this.selectedElement = cell;
        this.selected = cell;
        cell.classList.add('selected');
        
        // Highlight related cells
        this.highlightRelatedCells(cell);
    }

    highlightRelatedCells(cell) {
        // Clear previous highlights
        document.querySelectorAll('.sudoku-cell').forEach(c => {
            c.classList.remove('bg-white/20');
        });
        
        const row = parseInt(cell.getAttribute('row'));
        const col = parseInt(cell.getAttribute('col'));
        
        // Highlight row, column, and 3x3 box
        document.querySelectorAll('.sudoku-cell').forEach(c => {
            const cRow = parseInt(c.getAttribute('row'));
            const cCol = parseInt(c.getAttribute('col'));
            
            if (cRow === row || cCol === col || 
                (Math.floor(cRow / 3) === Math.floor(row / 3) && 
                 Math.floor(cCol / 3) === Math.floor(col / 3))) {
                c.classList.add('bg-white/20');
            }
        });
    }

    selectNumber(number) {
        if (!this.selectedElement) {
            this.showMessage('Please select a cell first!', 'warning');
            return;
        }
        
        if (this.selectedElement.classList.contains('given')) {
            this.showMessage('Cannot modify given numbers!', 'error');
            this.playErrorSound();
            return;
        }
        
        const row = parseInt(this.selectedElement.getAttribute('row'));
        const col = parseInt(this.selectedElement.getAttribute('col'));
        
        // Check if move is valid
        if (this.isValidMove(row, col, number)) {
            this.selectedElement.textContent = number;
            this.selectedElement.classList.remove('error');
            this.selectedElement.classList.add('user-filled');
            
            // Play success sound
            this.playSuccessSound();
            
            // Check if puzzle is complete
            this.checkWin();
        } else {
            this.errors++;
            this.updateStats();
            this.selectedElement.classList.add('error');
            this.playErrorSound();
            this.showMessage('Invalid move!', 'error');
            
            // Remove error class after animation
            setTimeout(() => {
                if (this.selectedElement) {
                    this.selectedElement.classList.remove('error');
                }
            }, 500);
        }
    }

    isValidMove(row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                const cell = document.querySelector(`[row="${row}"][col="${c}"]`);
                if (cell && cell.textContent == num) return false;
            }
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                const cell = document.querySelector(`[row="${r}"][col="${col}"]`);
                if (cell && cell.textContent == num) return false;
            }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) {
                    const cell = document.querySelector(`[row="${r}"][col="${c}"]`);
                    if (cell && cell.textContent == num) return false;
                }
            }
        }
        
        return true;
    }

    checkWin() {
        const cells = document.querySelectorAll('.sudoku-cell');
        let filled = 0;
        
        cells.forEach(cell => {
            if (cell.textContent.trim() !== '') {
                filled++;
            }
        });
        
        if (filled === 81) {
            this.showVictory();
        }
    }

    showVictory() {
        this.stopTimer();
        this.playVictorySound();
        
        // Update victory modal
        const finalTime = document.getElementById('finalTime');
        const finalErrors = document.getElementById('finalErrors');
        const finalDifficulty = document.getElementById('finalDifficulty');
        
        if (finalTime) finalTime.textContent = this.getFormattedTime();
        if (finalErrors) finalErrors.textContent = this.errors;
        if (finalDifficulty) finalDifficulty.textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        
        // Add celebration effect
        this.celebrateWin();
        
        // Show modal
        setTimeout(() => {
            const modal = document.getElementById('victoryModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }, 1000);
    }

    celebrateWin() {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.animation = 'bounce 0.6s ease';
            }, index * 50);
        });
    }

    newGame() {
        this.clearBoard();
        this.loadPuzzle();
        this.resetStats();
        this.startTimer();
    }

    clearBoard() {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'sudoku-cell w-12 h-12 text-center font-bold text-xl cursor-pointer border-2 border-white/30';
            
            // Re-add border classes
            const row = parseInt(cell.getAttribute('row'));
            const col = parseInt(cell.getAttribute('col'));
            
            if ((col + 1) % 3 === 0 && col < 8) {
                cell.classList.add('border-r-4', 'border-r-white/50');
            }
            if ((row + 1) % 3 === 0 && row < 8) {
                cell.classList.add('border-b-4', 'border-b-white/50');
            }
        });
    }

    loadPuzzle() {
        const puzzle = this.puzzles[this.difficulty];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.querySelector(`[row="${row}"][col="${col}"]`);
                const value = puzzle[row][col];
                
                if (cell && value !== 0) {
                    cell.textContent = value;
                    cell.classList.add('given');
                }
            }
        }
    }

    setDifficulty(level) {
        this.difficulty = level;
        const difficultyElement = document.getElementById('difficulty');
        if (difficultyElement) {
            difficultyElement.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        }
        
        // Update button states
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white/50');
        });
        const selectedBtn = document.querySelector(`[data-difficulty="${level}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('ring-4', 'ring-white/50');
        }
        
        this.newGame();
    }

    clearCell() {
        if (!this.selectedElement || this.selectedElement.classList.contains('given')) {
            this.showMessage('Select a user-filled cell to clear!', 'warning');
            return;
        }
        
        this.selectedElement.textContent = '';
        this.selectedElement.classList.remove('user-filled', 'error');
    }

    showHint() {
        if (!this.selectedElement) {
            this.showMessage('Select a cell to get a hint!', 'warning');
            return;
        }
        
        const row = parseInt(this.selectedElement.getAttribute('row'));
        const col = parseInt(this.selectedElement.getAttribute('col'));
        const correctValue = this.solution[row][col];
        
        this.selectedElement.textContent = correctValue;
        this.selectedElement.classList.add('user-filled');
        this.selectedElement.style.background = 'linear-gradient(135deg, #06b6d4, #0891b2)';
        
        this.showMessage(`Hint: ${correctValue}`, 'info');
        this.checkWin();
    }

    // Timer functions
    startTimer() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        
        this.seconds = 0;
        this.minutes = 0;
        this.intervalHandle = setInterval(() => this.tick(), 1000);
    }

    stopTimer() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    tick() {
        this.seconds++;
        if (this.seconds >= 60) {
            this.seconds = 0;
            this.minutes++;
        }
        
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = this.getFormattedTime();
        }
    }

    getFormattedTime() {
        const mins = this.minutes.toString().padStart(2, '0');
        const secs = this.seconds.toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    resetStats() {
        this.errors = 0;
        this.updateStats();
    }

    updateStats() {
        const errorsElement = document.getElementById('errors');
        if (errorsElement) {
            errorsElement.textContent = this.errors;
        }
    }

    // Audio functions
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const music = document.getElementById('music');
        const btn = document.getElementById('musicBtn');
        
        if (this.musicEnabled) {
            if (music) music.play().catch(() => {});
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'volume-2');
                    lucide.createIcons();
                }
                btn.title = 'Music On - Click to turn off';
                btn.classList.remove('bg-red-600');
                btn.classList.add('bg-primary');
            }
        } else {
            if (music) music.pause();
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'volume-x');
                    lucide.createIcons();
                }
                btn.title = 'Music Off - Click to turn on';
                btn.classList.remove('bg-primary');
                btn.classList.add('bg-red-600');
            }
        }
    }

    playMusic() {
        if (this.musicEnabled) {
            const music = document.getElementById('music');
            if (music) music.play().catch(() => {});
        }
    }

    playSuccessSound() {
        if (!this.musicEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    playErrorSound() {
        if (!this.musicEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    playVictorySound() {
        if (!this.musicEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
            
            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + index * 0.2;
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        } catch (e) {
            console.log('Audio not available');
        }
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `fixed top-4 right-4 p-4 rounded-lg text-white font-bold z-50 animate-slide-in`;
        
        switch (type) {
            case 'success':
                message.classList.add('bg-green-500');
                break;
            case 'error':
                message.classList.add('bg-red-500');
                break;
            case 'warning':
                message.classList.add('bg-yellow-500');
                break;
            default:
                message.classList.add('bg-blue-500');
        }
        
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Global functions for HTML event handlers
function newGame() {
    if (game) game.newGame();
}

function clearCell() {
    if (game) game.clearCell();
}

function showHint() {
    if (game) game.showHint();
}

function toggleMusic() {
    if (game) game.toggleMusic();
}

function setDifficulty(level) {
    if (game) game.setDifficulty(level);
}

function hideVictoryModal() {
    const modal = document.getElementById('victoryModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new SudokuGame();
    
    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            game.selectNumber(parseInt(e.key));
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            game.clearCell();
        } else if (e.key === 'Escape') {
            if (game.selectedElement) {
                game.selectedElement.classList.remove('selected');
                game.selectedElement = null;
            }
            hideVictoryModal();
        }
    });

    // Handle click outside modal to close
    const victoryModal = document.getElementById('victoryModal');
    if (victoryModal) {
        victoryModal.addEventListener('click', (e) => {
            if (e.target.id === 'victoryModal') {
                hideVictoryModal();
            }
        });
    }
});

