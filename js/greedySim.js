/**
 * Greedy Method: Activity Selection Problem Interactive Simulation
 * Animates: Sort by finish time -> Select earliest -> Reject overlaps -> Optimal set on timeline
 */

class GreedySimulation {
  constructor() {
    this.defaultActivities = [
      { id: 'A1', start: 1, finish: 3 },
      { id: 'A2', start: 2, finish: 5 },
      { id: 'A3', start: 4, finish: 7 },
      { id: 'A4', start: 6, finish: 9 },
      { id: 'A5', start: 8, finish: 10 },
      { id: 'A6', start: 9, finish: 11 }
    ];

    this.activities = JSON.parse(JSON.stringify(this.defaultActivities));
    this.steps = [];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1000;
    this.maxTime = 12; // timeline range 0 to 12

    // DOM Elements
    this.listContainer = document.getElementById('greedy-activities-list');
    this.timelineTracks = document.getElementById('greedy-timeline-tracks');
    this.timeCursor = document.getElementById('greedy-time-cursor');
    this.stepCounterEl = document.getElementById('greedy-step-num');
    this.selectedCountEl = document.getElementById('greedy-selected-count');
    this.selectedListEl = document.getElementById('greedy-selected-list');
    this.rejectedCountEl = document.getElementById('greedy-rejected-count');
    this.narrativeEl = document.getElementById('greedy-narrative-text');

    this.init();
  }

  init() {
    this.generateSteps();
    this.reset();
  }

  resetActivities() {
    this.activities = JSON.parse(JSON.stringify(this.defaultActivities));
    this.generateSteps();
    this.reset();
  }

  generateSteps() {
    this.steps = [];
    const sorted = [...this.activities].sort((a, b) => a.finish - b.finish);

    // Initial state: Unchecked
    const initialStates = {};
    this.activities.forEach(a => {
      initialStates[a.id] = 'unchecked';
    });

    // Step 0: Initial
    this.steps.push({
      desc: 'Initial activities loaded. Greedy choice requires sorting all activities in ascending order of finishing times.',
      activityStates: { ...initialStates },
      currentEvalId: null,
      selectedIds: [],
      rejectedIds: [],
      finishBoundary: 0,
      phase: 'INIT'
    });

    // Step 1: Sorted
    this.steps.push({
      desc: 'Activities sorted by finishing time (f1 ≤ f2 ≤ ... ≤ fn). This establishes the greedy ordering.',
      activityStates: { ...initialStates },
      currentEvalId: null,
      selectedIds: [],
      rejectedIds: [],
      finishBoundary: 0,
      phase: 'SORTED'
    });

    // Step-by-step evaluation
    let lastFinish = 0;
    const selected = [];
    const rejected = [];
    const states = { ...initialStates };

    sorted.forEach((act, idx) => {
      // Step: Inspecting act
      this.steps.push({
        desc: `Evaluating activity ${act.id} (${act.start}–${act.finish}). Current finish boundary F = ${lastFinish}.`,
        activityStates: { ...states },
        currentEvalId: act.id,
        selectedIds: [...selected],
        rejectedIds: [...rejected],
        finishBoundary: lastFinish,
        phase: 'EVALUATING'
      });

      if (act.start >= lastFinish) {
        // Selected!
        selected.push(act.id);
        lastFinish = act.finish;
        states[act.id] = 'selected';
        this.steps.push({
          desc: `SELECT ${act.id}: Start time ${act.start} ≥ ${lastFinish - (act.finish - act.start)}. No conflict! Greedy choice selects ${act.id}. New finish boundary F = ${lastFinish}.`,
          activityStates: { ...states },
          currentEvalId: null,
          selectedIds: [...selected],
          rejectedIds: [...rejected],
          finishBoundary: lastFinish,
          phase: 'SELECTED'
        });
      } else {
        // Rejected!
        rejected.push(act.id);
        states[act.id] = 'rejected';
        this.steps.push({
          desc: `REJECT ${act.id}: Start time ${act.start} < previous finish time ${lastFinish}. Overlap detected!`,
          activityStates: { ...states },
          currentEvalId: null,
          selectedIds: [...selected],
          rejectedIds: [...rejected],
          finishBoundary: lastFinish,
          phase: 'REJECTED'
        });
      }
    });

    // Final completion step
    this.steps.push({
      desc: `GREEDY SELECTION COMPLETE: Selected optimal set {${selected.join(', ')}} (Total: ${selected.length} activities). No other combination can achieve more non-overlapping activities.`,
      activityStates: { ...states },
      currentEvalId: null,
      selectedIds: [...selected],
      rejectedIds: [...rejected],
      finishBoundary: lastFinish,
      phase: 'COMPLETE'
    });
  }

  renderStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    const step = this.steps[index];

    // Update stats
    if (this.stepCounterEl) this.stepCounterEl.textContent = `${index + 1} / ${this.steps.length}`;
    if (this.selectedCountEl) this.selectedCountEl.textContent = step.selectedIds.length;
    if (this.selectedListEl) this.selectedListEl.textContent = step.selectedIds.length > 0 ? `{ ${step.selectedIds.join(', ')} }` : 'None';
    if (this.rejectedCountEl) this.rejectedCountEl.textContent = step.rejectedIds.length;
    if (this.narrativeEl) this.narrativeEl.textContent = step.desc;

    // Render list
    if (this.listContainer) {
      this.listContainer.innerHTML = '';
      this.activities.forEach(act => {
        const item = document.createElement('div');
        const state = step.activityStates[act.id] || 'unchecked';
        const isCurrent = step.currentEvalId === act.id;

        item.className = `activity-item ${state} ${isCurrent ? 'current' : ''}`;

        let badgeText = 'Unchecked';
        let badgeClass = 'badge-blue';
        if (state === 'selected') { badgeText = 'Selected ✓'; badgeClass = 'badge-emerald'; }
        else if (state === 'rejected') { badgeText = 'Rejected ✗'; badgeClass = 'badge-rose'; }
        else if (isCurrent) { badgeText = 'Evaluating...'; badgeClass = 'badge-amber'; }

        item.innerHTML = `
          <div>
            <span class="activity-id">${act.id}</span>
            <div class="activity-times">${act.start}:00 – ${act.finish}:00</div>
          </div>
          <span class="badge ${badgeClass}">${badgeText}</span>
        `;
        this.listContainer.appendChild(item);
      });
    }

    // Render Gantt Timeline
    if (this.timelineTracks) {
      this.timelineTracks.innerHTML = '';
      this.activities.forEach((act, idx) => {
        const row = document.createElement('div');
        row.className = 'timeline-track-row';

        const bar = document.createElement('div');
        const state = step.activityStates[act.id] || 'unchecked';
        const isCurrent = step.currentEvalId === act.id;

        bar.className = `activity-bar ${state} ${isCurrent ? 'current' : ''}`;

        // Positioning: percentage of timeline (0 to 12)
        const leftPct = (act.start / this.maxTime) * 100;
        const widthPct = ((act.finish - act.start) / this.maxTime) * 100;

        bar.style.left = `${leftPct}%`;
        bar.style.width = `${widthPct}%`;

        let icon = '';
        if (state === 'selected') icon = '✓';
        if (state === 'rejected') icon = '✕';
        if (isCurrent) icon = '⏳';

        bar.innerHTML = `
          <span>${act.id}</span>
          <span>${act.start}–${act.finish} ${icon}</span>
        `;

        row.appendChild(bar);
        this.timelineTracks.appendChild(row);
      });

      // Update time cursor line
      if (this.timeCursor) {
        if (step.finishBoundary > 0) {
          this.timeCursor.style.display = 'block';
          this.timeCursor.style.left = `${(step.finishBoundary / this.maxTime) * 100}%`;
        } else {
          this.timeCursor.style.display = 'none';
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
      1: 1600,
      2: 1100,
      3: 750,
      4: 450,
      5: 250
    };
    this.speed = speedMap[speedVal] || 750;
  }
}

window.GreedySimulation = GreedySimulation;
