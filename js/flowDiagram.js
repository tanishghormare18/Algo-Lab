/**
 * Algorithm Flow Visualization Handler
 * Interactive flowchart with jump-to-simulation actions and visual highlights
 */

document.addEventListener('DOMContentLoaded', () => {
  const flowCards = document.querySelectorAll('.flow-card-choice');

  flowCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetAlgo = card.dataset.algo;
      if (targetAlgo && window.App) {
        window.App.switchTab(targetAlgo);

        // Smooth scroll to simulation section
        const simSection = document.getElementById('simulations');
        if (simSection) {
          simSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
