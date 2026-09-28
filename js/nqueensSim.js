/**
 * Backtracking: N-Queens Problem Interactive Simulation
 * Animates: Try -> Check -> Valid -> Place -> Next Row OR Conflict -> Backtrack -> Try Next
 */

class NQueensSimulation {
  constructor() {
    this.n = 4; // default N = 4
    this.steps = [];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 700;

    // DOM References
    this.boardContainer = document.getElementById('nqueens-board');
    this.stepCounterEl = document.getElementById('nqueens-step-num');
    this.currentRowEl = document.getElementById('nqueens-current-row');
    this.queensPlacedEl = document.getElementById('nqueens-placed-count');
    this.backtracksEl = document.getElementById('nqueens-backtrack-count');
    this.solutionsEl = document.getElementById('nqueens-solutions-count');
    this.narrativeEl = document.getElementById('nqueens-narrative-text');
    this.phaseBadgeEl = document.getElementById('nqueens-phase-badge');
    this.conflictAlertEl = document.getElementById('nqueens-conflict-alert');

    this.init();
  }

  init() {
    this.generateSteps();
    this.reset();
  }

  setN(newN) {
    const val = parseInt(newN, 10);
    if (!isNaN(val) && val >= 4 && val <= 8) {
      this.n = val;
      this.generateSteps();
      this.reset();
    }
  }

  generateSteps() {
    this.steps = [];
    const N = this.n;

    let backtracks = 0;
    let solutionsFound = 0;
    const boardState = Array(N).fill(-1); // boardState[row] = col of queen or -1

    // Step 0: Init
    this.steps.push({
      desc: `Chessboard initialized for N = ${N}. Beginning Backtracking exploration to place ${N} non-attacking queens.`,
      board: [...boardState],
      currentRow: 0,
      candidate: null,
      conflictWith: null,
      conflictType: null,
      phase: 'TRY',
      queensPlaced: 0,
      backtracks: 0,
      solutions: 0,
      isSolution: false
    });

    const isSafe = (row, col) => {
      for (let prevRow = 0; prevRow < row; prevRow++) {
        const prevCol = boardState[prevRow];
        // Same column
        if (prevCol === col) {
          return { safe: false, conflictRow: prevRow, conflictCol: prevCol, type: 'Same Column' };
        }
        // Diagonal
        if (Math.abs(prevRow - row) === Math.abs(prevCol - col)) {
          return { safe: false, conflictRow: prevRow, conflictCol: prevCol, type: 'Diagonal Threat' };
        }
      }
      return { safe: true };
    };

    const maxSolutionsToFind = N >= 6 ? 1 : 2;
    const maxStepBudget = N >= 7 ? 600 : 1500;

    const solve = (row) => {
      if (solutionsFound >= maxSolutionsToFind || this.steps.length >= maxStepBudget) {
        return;
      }

      if (row === N) {
        solutionsFound++;
        const placedCount = boardState.filter(c => c !== -1).length;
        this.steps.push({
          desc: `SOLUTION FOUND! Successfully placed all ${N} queens without any conflicts. Solution #${solutionsFound}.`,
          board: [...boardState],
          currentRow: row,
          candidate: null,
          conflictWith: null,
          conflictType: null,
          phase: 'SOLUTION',
          queensPlaced: placedCount,
          backtracks,
          solutions: solutionsFound,
          isSolution: true
        });
        return;
      }

      for (let col = 0; col < N; col++) {
        if (solutionsFound >= maxSolutionsToFind || this.steps.length >= maxStepBudget) {
          return;
        }

        // TRY step
        const placedSoFar = boardState.filter(c => c !== -1).length;
        this.steps.push({
          desc: `TRY: Tentatively placing candidate Queen at Row ${row + 1}, Col ${col + 1}.`,
          board: [...boardState],
          currentRow: row,
          candidate: { r: row, c: col },
          conflictWith: null,
          conflictType: null,
          phase: 'TRY',
          queensPlaced: placedSoFar,
          backtracks,
          solutions: solutionsFound,
          isSolution: false
        });

        // CHECK step
        const checkResult = isSafe(row, col);

        if (checkResult.safe) {
          // VALID -> PLACE QUEEN
          boardState[row] = col;
          this.steps.push({
            desc: `VALID: Square (${row + 1}, ${col + 1}) is safe from all attacking vectors. Firmly placing Queen at Row ${row + 1}. Transitioning to Row ${row + 2}.`,
            board: [...boardState],
            currentRow: row,
            candidate: { r: row, c: col },
            conflictWith: null,
            conflictType: null,
            phase: 'PLACE QUEEN',
            queensPlaced: placedSoFar + 1,
            backtracks,
            solutions: solutionsFound,
            isSolution: false
          });

          // Recurse to next row
          solve(row + 1);

          // Undo choice for backtracking (if search continues)
          if (solutionsFound < maxSolutionsToFind && this.steps.length < maxStepBudget) {
            boardState[row] = -1;
            backtracks++;
            this.steps.push({
              desc: `BACKTRACK: Reverting Queen from Row ${row + 1}, Col ${col + 1} to search for alternative configurations.`,
              board: [...boardState],
              currentRow: row,
              candidate: null,
              conflictWith: null,
              conflictType: null,
              phase: 'BACKTRACK',
              queensPlaced: boardState.filter(c => c !== -1).length,
              backtracks,
              solutions: solutionsFound,
              isSolution: false
            });
          }
        } else {
          // CONFLICT -> BACKTRACK
          backtracks++;
          this.steps.push({
            desc: `CONFLICT DETECTED: Queen at (${row + 1}, ${col + 1}) violates constraints! Attacked by Queen at (${checkResult.conflictRow + 1}, ${checkResult.conflictCol + 1}) along ${checkResult.type}. Backtracking and testing next column.`,
            board: [...boardState],
            currentRow: row,
            candidate: { r: row, c: col },
            conflictWith: { r: checkResult.conflictRow, c: checkResult.conflictCol },
            conflictType: checkResult.type,
            phase: 'BACKTRACK',
            queensPlaced: placedSoFar,
            backtracks,
            solutions: solutionsFound,
            isSolution: false
          });
        }
      }
    };

    solve(0);

    // Final completion step
    this.steps.push({
      desc: `EXPLORATION COMPLETE: Search space exhaustively traversed. Found ${solutionsFound} valid solution(s) with ${backtracks} backtrack operations. Time Complexity: O(N!).`,
      board: Array(N).fill(-1),
      currentRow: N,
      candidate: null,
      conflictWith: null,
      conflictType: null,
      phase: 'DONE',
      queensPlaced: 0,
      backtracks,
      solutions: solutionsFound,
      isSolution: false
    });
  }

  renderStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    const step = this.steps[index];

    // Update stats
    if (this.stepCounterEl) this.stepCounterEl.textContent = `${index + 1} / ${this.steps.length}`;
    if (this.currentRowEl) this.currentRowEl.textContent = step.currentRow < this.n ? `Row ${step.currentRow + 1} / ${this.n}` : 'Finished';
    if (this.queensPlacedEl) this.queensPlacedEl.textContent = step.queensPlaced;
    if (this.backtracksEl) this.backtracksEl.textContent = step.backtracks;
    if (this.solutionsEl) this.solutionsEl.textContent = step.solutions;
    if (this.narrativeEl) this.narrativeEl.textContent = step.desc;

    // Update Phase Badge
    if (this.phaseBadgeEl) {
      this.phaseBadgeEl.textContent = step.phase;
      this.phaseBadgeEl.className = 'badge ';
      if (step.phase === 'TRY') this.phaseBadgeEl.classList.add('badge-amber');
      else if (step.phase === 'PLACE QUEEN' || step.phase === 'SOLUTION') this.phaseBadgeEl.classList.add('badge-emerald');
      else if (step.phase === 'BACKTRACK') this.phaseBadgeEl.classList.add('badge-rose');
      else this.phaseBadgeEl.classList.add('badge-blue');
    }

    // Conflict Alert Box
    if (this.conflictAlertEl) {
      if (step.conflictWith) {
        this.conflictAlertEl.style.display = 'flex';
        this.conflictAlertEl.innerHTML = `⚠️ <strong>Constraint Conflict:</strong> Threat along ${step.conflictType} with Queen at [Row ${step.conflictWith.r + 1}, Col ${step.conflictWith.c + 1}].`;
      } else {
        this.conflictAlertEl.style.display = 'none';
      }
    }

    // Render Chessboard
    if (this.boardContainer) {
      this.boardContainer.innerHTML = '';
      this.boardContainer.style.gridTemplateColumns = `repeat(${this.n}, 1fr)`;
      this.boardContainer.style.gridTemplateRows = `repeat(${this.n}, 1fr)`;

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.n; c++) {
          const cell = document.createElement('div');
          const isLight = (r + c) % 2 === 0;
          cell.className = `chess-cell ${isLight ? 'light' : 'dark'}`;

          // Check if queen is placed on this row
          const isPlaced = step.board[r] === c;
          const isCandidate = step.candidate && step.candidate.r === r && step.candidate.c === c;
          const isConflictSource = step.conflictWith && step.conflictWith.r === r && step.conflictWith.c === c;

          if (isPlaced) {
            cell.classList.add('placed');
            cell.innerHTML = '<span class="queen-glow">♛</span>';
          } else if (isCandidate) {
            if (step.conflictWith) {
              cell.classList.add('conflict');
              cell.innerHTML = '<span style="color: #ef4444;">♛</span>';
            } else {
              cell.classList.add('candidate');
              cell.innerHTML = '<span style="color: #f59e0b;">♛</span>';
            }
          } else if (isConflictSource) {
            cell.classList.add('conflict');
            cell.innerHTML = '<span class="queen-glow">♛</span>';
          }

          this.boardContainer.appendChild(cell);
        }
      }
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.currentStepIndex = -1;
    }
    this.tick();
  }

  tick() {
    if (!this.isPlaying) return;
    if (this.currentStepIndex < this.steps.length - 1) {
      this.stepForward();

      // Pause automatically when a complete solution is reached so user can admire it
      if (this.steps[this.currentStepIndex].isSolution) {
        this.pause();
        return;
      }

      this.timer = setTimeout(() => this.tick(), this.speed);
    } else {
      this.pause();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  stepForward() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.renderStep(this.currentStepIndex);
    }
  }

  stepBackward() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderStep(this.currentStepIndex);
    }
  }

  reset() {
    this.pause();
    this.currentStepIndex = 0;
    this.renderStep(0);
  }

  setSpeed(speedVal) {
    const speedMap = {
      1: 1500,
      2: 1000,
      3: 650,
      4: 350,
      5: 150
    };
    this.speed = speedMap[speedVal] || 650;
  }
}

window.NQueensSimulation = NQueensSimulation;
