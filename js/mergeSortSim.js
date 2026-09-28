/**
 * Divide and Conquer: Merge Sort Interactive Simulation
 * Animates: Original Array -> Divide -> Subarrays -> Recursive sorting -> Merge -> Sorted Array
 */

class MergeSortSimulation {
  constructor() {
    this.initialArray = [38, 27, 43, 3, 9, 82, 10];
    this.currentArray = [...this.initialArray];
    this.steps = [];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1000; // ms per step

    // DOM References
    this.treeContainer = document.getElementById('merge-tree-display');
    this.stepCounterEl = document.getElementById('merge-step-num');
    this.comparisonsEl = document.getElementById('merge-comparisons');
    this.arraySizeEl = document.getElementById('merge-array-size');
    this.narrativeEl = document.getElementById('merge-narrative-text');
    this.leftValEl = document.getElementById('merge-left-val');
    this.rightValEl = document.getElementById('merge-right-val');
    this.arenaDescEl = document.getElementById('merge-arena-desc');

    this.init();
  }

  init() {
    this.generateSteps();
    this.reset();
  }

  setArray(newArray) {
    if (newArray && newArray.length > 0) {
      this.initialArray = [...newArray];
      this.currentArray = [...newArray];
      this.generateSteps();
      this.reset();
    }
  }

  generateSteps() {
    this.steps = [];
    let comparisons = 0;

    // Step 0: Initial Array
    this.steps.push({
      desc: `Initial array received: [${this.initialArray.join(', ')}]. Beginning Divide & Conquer strategy.`,
      comparisons: 0,
      phase: 'INIT',
      levels: [
        [{ values: [...this.initialArray], status: 'active', id: '0-0' }]
      ],
      compareLeft: null,
      compareRight: null,
      arenaText: 'Ready to divide array into halves.'
    });

    // We simulate the divide passes first to construct the full tree levels
    // Level 0: [38, 27, 43, 3, 9, 82, 10]
    // Level 1: [38, 27, 43, 3], [9, 82, 10]
    // Level 2: [38, 27], [43, 3], [9, 82], [10]
    // Level 3: [38], [27], [43], [3], [9], [82], [10]

    const splitTree = (arr) => {
      const levels = [[arr]];
      let currentLevel = [arr];
      while (currentLevel.some(group => group.length > 1)) {
        const nextLevel = [];
        for (const group of currentLevel) {
          if (group.length > 1) {
            const mid = Math.ceil(group.length / 2);
            nextLevel.push(group.slice(0, mid));
            nextLevel.push(group.slice(mid));
          } else {
            nextLevel.push(group);
          }
        }
        levels.push(nextLevel);
        currentLevel = nextLevel;
      }
      return levels;
    };

    const treeLevels = splitTree(this.initialArray);

    // Record divide steps
    for (let l = 1; l < treeLevels.length; l++) {
      const stateLevels = [];
      for (let i = 0; i <= l; i++) {
        stateLevels.push(treeLevels[i].map((g, idx) => ({
          values: [...g],
          status: i === l ? 'active' : 'idle',
          id: `${i}-${idx}`
        })));
      }

      this.steps.push({
        desc: `DIVIDE PHASE (Level ${l}): Splitting arrays into smaller subarrays until base size of 1.`,
        comparisons: 0,
        phase: 'DIVIDE',
        levels: stateLevels,
        compareLeft: null,
        compareRight: null,
        arenaText: `Divided into ${treeLevels[l].length} smaller subproblems.`
      });
    }

    // Now record bottom-up merge steps
    // We will perform actual mergeSort while recording each comparison and partial merge
    const workTree = treeLevels.map(lvl => lvl.map(arr => [...arr]));

    const recordMergeStep = (leftArr, rightArr, mergedSoFar, leftIdx, rightIdx, desc, lIdx, gIdx) => {
      // Update workTree at appropriate level
      const snapshot = workTree.map(lvl => lvl.map(arr => ({ values: [...arr], status: 'idle' })));
      if (snapshot[lIdx] && snapshot[lIdx][gIdx]) {
        snapshot[lIdx][gIdx].values = [...mergedSoFar];
        snapshot[lIdx][gIdx].status = 'merged';
      }

      this.steps.push({
        desc,
        comparisons,
        phase: 'MERGE',
        levels: snapshot,
        compareLeft: leftIdx !== null ? leftArr[leftIdx] : null,
        compareRight: rightIdx !== null ? rightArr[rightIdx] : null,
        arenaText: desc
      });
    };

    // Recursive merge tracking
    const merge = (left, right, targetLevel, targetGroupIdx) => {
      const result = [];
      let i = 0, j = 0;

      while (i < left.length && j < right.length) {
        comparisons++;
        const isLeftSmaller = left[i] <= right[j];
        const chosen = isLeftSmaller ? left[i] : right[j];

        this.steps.push({
          desc: `COMPARE: ${left[i]} vs ${right[j]}. Since ${chosen} is smaller or equal, it is placed next into the merged subarray.`,
          comparisons,
          phase: 'COMPARE',
          levels: workTree.map(lvl => lvl.map(arr => ({ values: [...arr], status: 'idle' }))),
          compareLeft: left[i],
          compareRight: right[j],
          arenaText: `${left[i]} vs ${right[j]} → Pick ${chosen}`
        });

        if (isLeftSmaller) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }

        // Update target array in workTree
        workTree[targetLevel][targetGroupIdx] = [...result, ...left.slice(i), ...right.slice(j)];
      }

      while (i < left.length) {
        result.push(left[i++]);
        workTree[targetLevel][targetGroupIdx] = [...result];
      }
      while (j < right.length) {
        result.push(right[j++]);
        workTree[targetLevel][targetGroupIdx] = [...result];
      }

      recordMergeStep(left, right, result, null, null, `MERGE COMPLETE: Subarray [${result.join(', ')}] is now sorted.`, targetLevel, targetGroupIdx);
      return result;
    };

    // Simulate bottom-up merge passes across levels
    let currentLevelIdx = treeLevels.length - 1;
    while (currentLevelIdx > 0) {
      const upperLevelIdx = currentLevelIdx - 1;
      const lower = workTree[currentLevelIdx];
      const upper = workTree[upperLevelIdx];

      let targetIdx = 0;
      let lowerIdx = 0;
      while (lowerIdx < lower.length) {
        if (lowerIdx + 1 < lower.length && upper[targetIdx].length === lower[lowerIdx].length + lower[lowerIdx + 1].length) {
          const merged = merge(lower[lowerIdx], lower[lowerIdx + 1], upperLevelIdx, targetIdx);
          workTree[upperLevelIdx][targetIdx] = merged;
          lowerIdx += 2;
        } else {
          workTree[upperLevelIdx][targetIdx] = [...lower[lowerIdx]];
          lowerIdx += 1;
        }
        targetIdx++;
      }
      currentLevelIdx--;
    }

    // Final Step
    const finalSorted = workTree[0][0];
    this.steps.push({
      desc: `SUCCESS: Divide and Conquer complete! Final sorted array: [${finalSorted.join(', ')}].`,
      comparisons,
      phase: 'DONE',
      levels: workTree.map((lvl, l) => lvl.map(arr => ({
        values: [...arr],
        status: l === 0 ? 'merged' : 'idle'
      }))),
      compareLeft: null,
      compareRight: null,
      arenaText: `Sorted Array: [${finalSorted.join(', ')}] in O(n log n) time.`
    });
  }

  renderStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    const step = this.steps[index];

    // Update stats
    if (this.stepCounterEl) this.stepCounterEl.textContent = `${index + 1} / ${this.steps.length}`;
    if (this.comparisonsEl) this.comparisonsEl.textContent = step.comparisons;
    if (this.arraySizeEl) this.arraySizeEl.textContent = this.initialArray.length;
    if (this.narrativeEl) this.narrativeEl.textContent = step.desc;

    // Update compare arena
    if (this.leftValEl) this.leftValEl.textContent = step.compareLeft !== null ? step.compareLeft : '—';
    if (this.rightValEl) this.rightValEl.textContent = step.compareRight !== null ? step.compareRight : '—';
    if (this.arenaDescEl) this.arenaDescEl.textContent = step.arenaText;

    // Render tree
    if (this.treeContainer) {
      this.treeContainer.innerHTML = '';
      step.levels.forEach((lvl, lvlIdx) => {
        const levelRow = document.createElement('div');
        levelRow.className = 'tree-level';

        const label = document.createElement('span');
        label.className = 'tree-level-label';
        label.textContent = lvlIdx === 0 && index === this.steps.length - 1 ? 'SORTED' : `LEVEL ${lvlIdx}`;
        levelRow.appendChild(label);

        lvl.forEach(group => {
          const groupEl = document.createElement('div');
          groupEl.className = `array-group ${group.status}`;

          group.values.forEach(val => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'array-node';
            nodeEl.textContent = val;

            if (val === step.compareLeft) nodeEl.classList.add('compare-left');
            if (val === step.compareRight) nodeEl.classList.add('compare-right');
            if (step.phase === 'DONE' && lvlIdx === 0) nodeEl.classList.add('sorted');

            groupEl.appendChild(nodeEl);
          });

          levelRow.appendChild(groupEl);
        });

        this.treeContainer.appendChild(levelRow);
      });
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
  }

  setSpeed(speedVal) {
    // 1 to 5 mapping to 1600ms down to 250ms
    const speedMap = {
      1: 1600,
      2: 1100,
      3: 750,
      4: 450,
      5: 250
    };
    this.speed = speedMap[speedVal] || 750;
  }
}

window.MergeSortSimulation = MergeSortSimulation;
