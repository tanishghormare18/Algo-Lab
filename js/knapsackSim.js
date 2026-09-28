/**
 * Dynamic Programming: 0/1 Knapsack Interactive Simulation
 * Animates: Table filling cell-by-cell -> Traceback -> Interactive Cell Inspector on click
 */

class KnapsackSimulation {
  constructor() {
    this.defaultItems = [
      { id: 1, name: 'Item 1 (Laptop)', weight: 2, value: 3 },
      { id: 2, name: 'Item 2 (Camera)', weight: 3, value: 4 },
      { id: 3, name: 'Item 3 (Tablet)', weight: 4, value: 5 },
      { id: 4, name: 'Item 4 (Drone)', weight: 5, value: 8 }
    ];
    this.capacity = 7;
    this.items = JSON.parse(JSON.stringify(this.defaultItems));

    this.steps = [];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 800;

    // Full computed DP table matrix for inspector lookups: dp[i][w]
    this.dpMatrix = [];

    // DOM References
    this.tableContainer = document.getElementById('dp-table-container');
    this.stepCounterEl = document.getElementById('dp-step-num');
    this.currentCellEl = document.getElementById('dp-current-cell');
    this.maxValueEl = document.getElementById('dp-max-value');
    this.subproblemPhaseEl = document.getElementById('dp-subproblem-phase');
    this.narrativeEl = document.getElementById('dp-narrative-text');

    // Inspector DOM
    this.inspectorCard = document.getElementById('dp-inspector-card');
    this.inspCoordEl = document.getElementById('insp-coord');
    this.inspCapacityEl = document.getElementById('insp-capacity');
    this.inspItemsEl = document.getElementById('insp-items');
    this.inspPrevStateEl = document.getElementById('insp-prev-state');
    this.inspFormulaEl = document.getElementById('insp-formula');
    this.inspValEl = document.getElementById('insp-val');
    this.inspDecisionEl = document.getElementById('insp-decision');

    this.init();
  }

  init() {
    this.computeFullMatrix();
    this.generateSteps();
    this.reset();
  }

  setCapacity(newW) {
    const val = parseInt(newW, 10);
    if (!isNaN(val) && val >= 3 && val <= 10) {
      this.capacity = val;
      this.computeFullMatrix();
      this.generateSteps();
      this.reset();
    }
  }

  setItems(newItems) {
    if (newItems && newItems.length > 0) {
      this.items = JSON.parse(JSON.stringify(newItems));
      this.computeFullMatrix();
      this.generateSteps();
      this.reset();
    }
  }

  computeFullMatrix() {
    const N = this.items.length;
    const W = this.capacity;
    this.dpMatrix = Array.from({ length: N + 1 }, () => Array(W + 1).fill(0));

    for (let i = 1; i <= N; i++) {
      const item = this.items[i - 1];
      for (let w = 1; w <= W; w++) {
        if (item.weight > w) {
          this.dpMatrix[i][w] = this.dpMatrix[i - 1][w];
        } else {
          const excludeVal = this.dpMatrix[i - 1][w];
          const includeVal = this.dpMatrix[i - 1][w - item.weight] + item.value;
          this.dpMatrix[i][w] = Math.max(excludeVal, includeVal);
        }
      }
    }
  }

  generateSteps() {
    this.steps = [];
    const N = this.items.length;
    const W = this.capacity;

    // Grid representation of values discovered so far (null = not yet calculated)
    const currentGrid = Array.from({ length: N + 1 }, () => Array(W + 1).fill(null));

    // Step 0: Base cases
    for (let i = 0; i <= N; i++) currentGrid[i][0] = 0;
    for (let w = 0; w <= W; w++) currentGrid[0][w] = 0;

    this.steps.push({
      desc: `Base Cases Initialized: DP[0][w] = 0 (0 items available) and DP[i][0] = 0 (0 capacity). Ready to compute subproblems row-by-row.`,
      grid: currentGrid.map(row => [...row]),
      currentCell: null,
      prevAbove: null,
      prevWithItem: null,
      phase: 'Subproblem: Initialization',
      maxValue: 0
    });

    // Cell by cell iteration
    for (let i = 1; i <= N; i++) {
      const item = this.items[i - 1];
      for (let w = 1; w <= W; w++) {
        const canFit = w >= item.weight;
        const aboveCell = { r: i - 1, c: w };
        const withItemCell = canFit ? { r: i - 1, c: w - item.weight } : null;

        let val = 0;
        let desc = '';
        let formulaText = '';

        if (!canFit) {
          val = currentGrid[i - 1][w];
          desc = `Item ${i} (${item.name}, wt: ${item.weight}) CANNOT fit in capacity ${w} (wt > cap). Carry over optimal value without item: DP[${i-1}][${w}] = ${val}.`;
          formulaText = `Subproblem: DP[${i}][${w}] = DP[${i-1}][${w}]`;
        } else {
          const excludeVal = currentGrid[i - 1][w];
          const includeVal = currentGrid[i - 1][w - item.weight] + item.value;
          val = Math.max(excludeVal, includeVal);
          const picked = includeVal > excludeVal;
          desc = `Evaluate Item ${i} for cap ${w}: Exclude = DP[${i-1}][${w}] (${excludeVal}), Include = DP[${i-1}][${w-item.weight}] + ${item.value} = ${includeVal}. ${picked ? 'Include item (yields higher value)' : 'Exclude item (prior best is better)'}. Max = ${val}.`;
          formulaText = `Subproblem: DP[${i}][${w}] = max(${excludeVal}, ${includeVal}) = ${val}`;
        }

        currentGrid[i][w] = val;

        this.steps.push({
          desc,
          grid: currentGrid.map(row => [...row]),
          currentCell: { r: i, c: w },
          prevAbove: aboveCell,
          prevWithItem: withItemCell,
          phase: canFit ? 'Reuse Result: Compare States' : 'Store Result: Direct Subproblem',
          maxValue: val
        });
      }
    }

    // Traceback Step: Backtracking to find optimal items
    const tracebackCells = [];
    const chosenItems = [];
    let curR = N;
    let curW = W;

    while (curR > 0 && curW > 0) {
      tracebackCells.push({ r: curR, c: curW });
      if (this.dpMatrix[curR][curW] !== this.dpMatrix[curR - 1][curW]) {
        const chosen = this.items[curR - 1];
        chosenItems.push(chosen.name);
        curW -= chosen.weight;
      }
      curR--;
    }
    tracebackCells.push({ r: curR, c: curW });

    const maxVal = this.dpMatrix[N][W];
    this.steps.push({
      desc: `OPTIMAL SOLUTION FOUND: Maximum Value = ${maxVal}. Traceback reveals selected items: [${chosenItems.reverse().join(', ')}]. Time Complexity: O(nW).`,
      grid: currentGrid.map(row => [...row]),
      currentCell: { r: N, c: W },
      prevAbove: null,
      prevWithItem: null,
      tracebackCells,
      phase: 'Optimal Solution: Traceback Complete',
      maxValue: maxVal
    });
  }

  renderStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    const step = this.steps[index];

    // Update stats
    if (this.stepCounterEl) this.stepCounterEl.textContent = `${index + 1} / ${this.steps.length}`;
    if (this.currentCellEl) {
      this.currentCellEl.textContent = step.currentCell
        ? `DP[${step.currentCell.r}][${step.currentCell.c}]`
        : 'DP[0][0]';
    }
    if (this.maxValueEl) this.maxValueEl.textContent = step.maxValue;
    if (this.subproblemPhaseEl) this.subproblemPhaseEl.textContent = step.phase;
    if (this.narrativeEl) this.narrativeEl.textContent = step.desc;

    // Render Table
    if (this.tableContainer) {
      this.tableContainer.innerHTML = '';
      const table = document.createElement('table');
      table.className = 'dp-table';

      // Header Row (Capacities 0..W)
      const thead = document.createElement('thead');
      const hRow = document.createElement('tr');
      const thCorner = document.createElement('th');
      thCorner.textContent = 'Items \\ Cap (w)';
      hRow.appendChild(thCorner);

      for (let w = 0; w <= this.capacity; w++) {
        const th = document.createElement('th');
        th.textContent = `${w}`;
        hRow.appendChild(th);
      }
      thead.appendChild(hRow);
      table.appendChild(thead);

      // Body Rows (0..N)
      const tbody = document.createElement('tbody');
      for (let i = 0; i <= this.items.length; i++) {
        const row = document.createElement('tr');

        // Row header
        const rowH = document.createElement('th');
        if (i === 0) {
          rowH.textContent = '0: (No Items)';
        } else {
          const item = this.items[i - 1];
          rowH.textContent = `${i}: ${item.name} (w=${item.weight}, v=${item.value})`;
        }
        row.appendChild(rowH);

        for (let w = 0; w <= this.capacity; w++) {
          const td = document.createElement('td');
          const val = step.grid[i][w];
          td.textContent = val !== null ? val : '—';
          td.dataset.row = i;
          td.dataset.col = w;

          // Click listener for interactive cell inspection
          td.addEventListener('click', () => {
            this.inspectCell(i, w);
          });

          // Visual highlighting
          if (step.currentCell && step.currentCell.r === i && step.currentCell.c === w) {
            td.classList.add('dp-current');
          }
          if (step.prevAbove && step.prevAbove.r === i && step.prevAbove.c === w) {
            td.classList.add('dp-prev-above');
          }
          if (step.prevWithItem && step.prevWithItem.r === i && step.prevWithItem.c === w) {
            td.classList.add('dp-prev-with-item');
          }
          if (step.tracebackCells && step.tracebackCells.some(c => c.r === i && c.c === w)) {
            td.classList.add('dp-traceback');
          }

          row.appendChild(td);
        }
        tbody.appendChild(row);
      }
      table.appendChild(tbody);
      this.tableContainer.appendChild(table);
    }
  }

  /**
   * Interactive Cell Inspection
   * Displays: Current capacity, Items considered, Previous state, Formula used, Current value
   */
  inspectCell(i, w) {
    if (i < 0 || i > this.items.length || w < 0 || w > this.capacity) return;

    const cellVal = this.dpMatrix[i][w];

    if (this.inspCoordEl) this.inspCoordEl.textContent = `DP[${i}][${w}]`;
    if (this.inspCapacityEl) this.inspCapacityEl.textContent = `${w} units`;
    if (this.inspValEl) this.inspValEl.textContent = `${cellVal}`;

    if (i === 0) {
      if (this.inspItemsEl) this.inspItemsEl.textContent = 'None (Base Case)';
      if (this.inspPrevStateEl) this.inspPrevStateEl.textContent = 'N/A (Row 0)';
      if (this.inspFormulaEl) this.inspFormulaEl.textContent = 'DP[0][w] = 0 (Base case)';
      if (this.inspDecisionEl) this.inspDecisionEl.textContent = 'Base Case';
      return;
    }

    const item = this.items[i - 1];
    const consideredList = this.items.slice(0, i).map(it => `${it.name}`).join(', ');
    if (this.inspItemsEl) this.inspItemsEl.textContent = `Items 1 to ${i}: { ${consideredList} }`;

    const excludeVal = this.dpMatrix[i - 1][w];
    if (w < item.weight) {
      if (this.inspPrevStateEl) {
        this.inspPrevStateEl.textContent = `Without Item: DP[${i-1}][${w}] = ${excludeVal} (Item cannot fit)`;
      }
      if (this.inspFormulaEl) {
        this.inspFormulaEl.textContent = `Weight ${item.weight} > Capacity ${w} → DP[${i}][${w}] = DP[${i-1}][${w}] = ${excludeVal}`;
      }
      if (this.inspDecisionEl) {
        this.inspDecisionEl.textContent = `Excluded (${item.name} too heavy)`;
      }
    } else {
      const includeVal = this.dpMatrix[i - 1][w - item.weight] + item.value;
      const subVal = this.dpMatrix[i - 1][w - item.weight];
      const picked = includeVal > excludeVal;

      if (this.inspPrevStateEl) {
        this.inspPrevStateEl.textContent = `Exclude: DP[${i-1}][${w}] = ${excludeVal} | Include: DP[${i-1}][${w - item.weight}] (${subVal}) + ${item.value} = ${includeVal}`;
      }
      if (this.inspFormulaEl) {
        this.inspFormulaEl.textContent = `DP[${i}][${w}] = max(DP[${i-1}][${w}], DP[${i-1}][${w - item.weight}] + ${item.value}) = max(${excludeVal}, ${includeVal}) = ${cellVal}`;
      }
      if (this.inspDecisionEl) {
        this.inspDecisionEl.textContent = picked ? `Included ${item.name} (+${item.value} value)` : `Excluded ${item.name} (Previous optimal is better)`;
      }
    }

    // Highlight clicked cell and parent cells in table
    document.querySelectorAll('.dp-table td').forEach(td => td.classList.remove('dp-current', 'dp-prev-above', 'dp-prev-with-item'));
    const targetTd = document.querySelector(`.dp-table td[data-row="${i}"][data-col="${w}"]`);
    if (targetTd) targetTd.classList.add('dp-current');

    if (i > 0) {
      const aboveTd = document.querySelector(`.dp-table td[data-row="${i - 1}"][data-col="${w}"]`);
      if (aboveTd) aboveTd.classList.add('dp-prev-above');

      if (w >= item.weight) {
        const withItemTd = document.querySelector(`.dp-table td[data-row="${i - 1}"][data-col="${w - item.weight}"]`);
        if (withItemTd) withItemTd.classList.add('dp-prev-with-item');
      }
    }

    // Scroll inspector into view if on mobile
    if (window.innerWidth < 768 && this.inspectorCard) {
      this.inspectorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    // inspect optimal cell by default
    this.inspectCell(this.items.length, this.capacity);
  }

  setSpeed(speedVal) {
    const speedMap = {
      1: 1600,
      2: 1100,
      3: 800,
      4: 450,
      5: 200
    };
    this.speed = speedMap[speedVal] || 800;
  }
}

window.KnapsackSimulation = KnapsackSimulation;
