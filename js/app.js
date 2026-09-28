/**
 * ALGO·LAB Main Application Coordinator
 * Controls tab switching, global event routing, simulation controls, and explanation panel sync
 */

class AlgoApp {
  constructor() {
    this.currentAlgo = 'merge-sort'; // 'merge-sort' | 'greedy' | 'knapsack' | 'nqueens'
    this.simulations = {};
    this.learningData = {
      'merge-sort': {
        title: 'Divide and Conquer (Merge Sort)',
        keyIdea: 'Break a complex problem down into independent, identical smaller subproblems, solve each recursively, and combine their solutions.',
        howItWorks: [
          'Divide: Split the unsorted array of size n into two halves of size n/2.',
          'Conquer: Recursively sort each half until reaching subarrays of single elements (base case).',
          'Combine: Merge the two sorted halves back together in linear time by comparing leading elements.'
        ],
        whereUseful: 'External sorting of large datasets that do not fit in RAM, stable sorting pipelines, Linked List sorting, and distributed parallel computations (MapReduce).',
        example: 'Sorting [38, 27, 43, 3, 9, 82, 10] into [3, 9, 10, 27, 38, 43, 82].',
        complexity: 'Time: O(n log n) in all cases (Best, Average, Worst). Space: O(n) auxiliary space for merging.'
      },
      'greedy': {
        title: 'Greedy Method (Activity Selection)',
        keyIdea: 'Build up a solution piece by piece, always choosing the immediate next piece that offers the most obvious and immediate benefit (locally optimal choice) without ever reconsidering past choices.',
        howItWorks: [
          'Order: Sort candidate activities by their finish time (f1 ≤ f2 ≤ ... ≤ fn).',
          'Initial Choice: Greedily pick the activity that finishes earliest, leaving the maximum remaining time for subsequent activities.',
          'Filter: Iterate through remaining activities and reject any whose start time overlaps with the previously selected activity finish boundary.'
        ],
        whereUseful: 'Resource scheduling, Huffman data compression, Dijkstra shortest path, Prim and Kruskal Minimum Spanning Tree algorithms.',
        example: 'Selecting maximal non-overlapping tasks from 6 events: {A1 (1-3), A3 (4-7), A5 (8-10)} yielding 3 events.',
        complexity: 'Time: O(n log n) due to initial sorting, followed by O(n) linear scan. Space: O(1) auxiliary space.'
      },
      'knapsack': {
        title: 'Dynamic Programming (0/1 Knapsack)',
        keyIdea: 'Solve complex problems by breaking them down into overlapping subproblems, solving each subproblem once, storing its solution in a table (memoization/tabulation), and reusing it to avoid recomputation.',
        howItWorks: [
          'Characterize Subproblems: Define DP[i][w] as the maximum value achievable using a subset of the first i items with weight capacity w.',
          'Recurrence Relation: If item i fits (w ≥ wi), choose max(DP[i-1][w], DP[i-1][w-wi] + vi). Otherwise, inherit DP[i-1][w].',
          'Tabulation: Fill table row-by-row from bottom-up.',
          'Traceback: Walk backwards from DP[N][W] to extract the exact items included.'
        ],
        whereUseful: 'Financial portfolio budget allocation, cargo flight loading, DNA sequence alignment (Needleman-Wunsch), and network packet routing.',
        example: 'Maximizing value from {Laptop ($3, 2kg), Camera ($4, 3kg), Tablet ($5, 4kg), Drone ($8, 5kg)} with knapsack capacity 7kg.',
        complexity: 'Time: O(n·W) pseudo-polynomial time. Space: O(n·W) table or O(W) space-optimized.'
      },
      'nqueens': {
        title: 'Backtracking (N-Queens)',
        keyIdea: 'Systematically explore the solution space depth-first, placing candidate components one-by-one. Whenever a constraint is violated, immediately abandon the current candidate (prune the subtree) and backtrack to try alternative paths.',
        howItWorks: [
          'Try: Place a queen tentatively in the current row at column c.',
          'Check: Verify if any previously placed queen attacks the candidate along column or diagonals.',
          'Valid: If safe, place queen permanently and advance to the next row.',
          'Backtrack: If no column in current row is valid, undo previous queen placement and return to preceding row.'
        ],
        whereUseful: 'Constraint satisfaction problems, Sudoku solvers, circuit layout optimization, robot path planning through mazes, and compiler register allocation.',
        example: 'Arranging 4 queens on a 4x4 chessboard so no two queens attack each other (2 distinct solutions exist).',
        complexity: 'Time: O(N!) worst-case upper bound (drastically pruned by bounding checks). Space: O(N) recursion stack.'
      }
    };
  }

  init() {
    // Instantiate all 4 simulation controllers
    this.simulations['merge-sort'] = new window.MergeSortSimulation();
    this.simulations['greedy'] = new window.GreedySimulation();
    this.simulations['knapsack'] = new window.KnapsackSimulation();
    this.simulations['nqueens'] = new window.NQueensSimulation();

    this.bindEvents();
    this.switchTab('merge-sort');
  }

  bindEvents() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.sim-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const algo = btn.dataset.algo;
        if (algo) this.switchTab(algo);
      });
    });

    // Hero "Simulate" Buttons
    const heroSimButtons = document.querySelectorAll('.hero-card .btn-simulate');
    heroSimButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.hero-card');
        const targetAlgo = card.dataset.algo;
        if (targetAlgo) {
          this.switchTab(targetAlgo);
          const simSection = document.getElementById('simulations');
          if (simSection) {
            simSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Navigation links smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Setup simulation control buttons for each simulation
    this.setupSimulationControls('merge');
    this.setupSimulationControls('greedy');
    this.setupSimulationControls('dp');
    this.setupSimulationControls('nqueens');

    // Merge sort custom array input & randomize
    const mergeInput = document.getElementById('merge-custom-input');
    const mergeApplyBtn = document.getElementById('merge-apply-btn');
    const mergeRandomBtn = document.getElementById('merge-random-btn');

    if (mergeApplyBtn && mergeInput) {
      mergeApplyBtn.addEventListener('click', () => {
        const raw = mergeInput.value.trim();
        const parsed = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        if (parsed.length >= 3 && parsed.length <= 10) {
          this.simulations['merge-sort'].setArray(parsed);
        } else {
          alert('Please enter between 3 and 10 comma-separated numbers (e.g. 38, 27, 43, 3, 9, 82, 10).');
        }
      });
    }

    if (mergeRandomBtn) {
      mergeRandomBtn.addEventListener('click', () => {
        const len = 7;
        const randomArr = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
        if (mergeInput) mergeInput.value = randomArr.join(', ');
        this.simulations['merge-sort'].setArray(randomArr);
      });
    }

    // Knapsack Capacity change
    const knapCapInput = document.getElementById('knap-capacity-input');
    if (knapCapInput) {
      knapCapInput.addEventListener('change', (e) => {
        this.simulations['knapsack'].setCapacity(e.target.value);
      });
    }

    // Knapsack Preset buttons
    const knapPresets = document.querySelectorAll('.knap-preset-btn');
    knapPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'default') {
          this.simulations['knapsack'].setCapacity(7);
          if (knapCapInput) knapCapInput.value = 7;
          this.simulations['knapsack'].setItems(this.simulations['knapsack'].defaultItems);
        } else if (preset === 'electronics') {
          this.simulations['knapsack'].setCapacity(8);
          if (knapCapInput) knapCapInput.value = 8;
          this.simulations['knapsack'].setItems([
            { id: 1, name: 'Phone', weight: 1, value: 2 },
            { id: 2, name: 'Laptop', weight: 3, value: 5 },
            { id: 3, name: 'Monitor', weight: 4, value: 7 },
            { id: 4, name: 'Console', weight: 5, value: 9 }
          ]);
        }
      });
    });

    // N-Queens N selector buttons
    const nQueensBtns = document.querySelectorAll('.nqueens-n-btn');
    nQueensBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        nQueensBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const n = parseInt(btn.dataset.n, 10);
        this.simulations['nqueens'].setN(n);
      });
    });
  }

  setupSimulationControls(prefix) {
    const playBtn = document.getElementById(`${prefix}-play-btn`);
    const pauseBtn = document.getElementById(`${prefix}-pause-btn`);
    const stepFwdBtn = document.getElementById(`${prefix}-step-fwd-btn`);
    const stepBackBtn = document.getElementById(`${prefix}-step-back-btn`);
    const resetBtn = document.getElementById(`${prefix}-reset-btn`);
    const speedRange = document.getElementById(`${prefix}-speed-range`);

    // Map prefix to simulation key
    const keyMap = {
      'merge': 'merge-sort',
      'greedy': 'greedy',
      'dp': 'knapsack',
      'nqueens': 'nqueens'
    };
    const simKey = keyMap[prefix];

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const sim = this.simulations[simKey];
        if (sim) {
          sim.start();
          playBtn.style.display = 'none';
          if (pauseBtn) pauseBtn.style.display = 'inline-flex';
        }
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        const sim = this.simulations[simKey];
        if (sim) {
          sim.pause();
          pauseBtn.style.display = 'none';
          if (playBtn) playBtn.style.display = 'inline-flex';
        }
      });
    }

    if (stepFwdBtn) {
      stepFwdBtn.addEventListener('click', () => {
        const sim = this.simulations[simKey];
        if (sim) {
          sim.pause();
          if (playBtn) playBtn.style.display = 'inline-flex';
          if (pauseBtn) pauseBtn.style.display = 'none';
          sim.stepForward();
        }
      });
    }

    if (stepBackBtn) {
      stepBackBtn.addEventListener('click', () => {
        const sim = this.simulations[simKey];
        if (sim) {
          sim.pause();
          if (playBtn) playBtn.style.display = 'inline-flex';
          if (pauseBtn) pauseBtn.style.display = 'none';
          sim.stepBackward();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const sim = this.simulations[simKey];
        if (sim) {
          sim.reset();
          if (playBtn) playBtn.style.display = 'inline-flex';
          if (pauseBtn) pauseBtn.style.display = 'none';
        }
      });
    }

    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        const sim = this.simulations[simKey];
        if (sim) {
          sim.setSpeed(parseInt(e.target.value, 10));
        }
      });
    }
  }

  switchTab(algoKey) {
    // Pause any currently playing simulation before switching
    Object.values(this.simulations).forEach(sim => sim.pause());

    // Reset play/pause buttons
    document.querySelectorAll('[id$="-play-btn"]').forEach(btn => btn.style.display = 'inline-flex');
    document.querySelectorAll('[id$="-pause-btn"]').forEach(btn => btn.style.display = 'none');

    this.currentAlgo = algoKey;

    // Update Tab Buttons
    document.querySelectorAll('.sim-tab-btn').forEach(btn => {
      if (btn.dataset.algo === algoKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Viewport Visibility
    document.querySelectorAll('.sim-viewport').forEach(vp => {
      if (vp.id === `viewport-${algoKey}`) {
        vp.classList.add('active');
      } else {
        vp.classList.remove('active');
      }
    });

    // Update flowchart highlight
    document.querySelectorAll('.flow-card-choice').forEach(card => {
      if (card.dataset.algo === algoKey) {
        card.style.borderColor = 'var(--accent-primary)';
        card.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
      } else {
        card.style.borderColor = 'var(--border-medium)';
        card.style.boxShadow = 'var(--shadow-sm)';
      }
    });

    // Update Learning Panel
    this.updateLearningPanel(algoKey);
  }

  updateLearningPanel(algoKey) {
    const data = this.learningData[algoKey];
    if (!data) return;

    const titleEl = document.getElementById('learn-active-title');
    const keyIdeaEl = document.getElementById('learn-key-idea');
    const worksListEl = document.getElementById('learn-how-it-works-list');
    const usefulEl = document.getElementById('learn-where-useful');
    const exampleEl = document.getElementById('learn-example');
    const complexityEl = document.getElementById('learn-complexity');

    if (titleEl) titleEl.textContent = data.title;
    if (keyIdeaEl) keyIdeaEl.textContent = data.keyIdea;
    if (usefulEl) usefulEl.textContent = data.whereUseful;
    if (exampleEl) exampleEl.textContent = data.example;
    if (complexityEl) complexityEl.textContent = data.complexity;

    if (worksListEl) {
      worksListEl.innerHTML = '';
      data.howItWorks.forEach(stepText => {
        const li = document.createElement('li');
        li.className = 'learn-list-item';
        li.innerHTML = `<span class="check">→</span> <span>${stepText}</span>`;
        worksListEl.appendChild(li);
      });
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.App = new AlgoApp();
  window.App.init();
});
