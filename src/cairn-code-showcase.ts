export function initCairnCodeShowcase(container: HTMLElement) {
  container.innerHTML = `
    <div class="showcase-card">
      <div class="showcase-header">
        <span class="showcase-badge">Agent Pipeline</span>
        <h3>Cairn Code — Autopilot Execution</h3>
        <p>A look at the self-correcting agentic loop that automates software engineering tasks.</p>
      </div>

      <div class="pipeline-timeline">
        <!-- Step 1 -->
        <div class="pipeline-step active" id="step-1">
          <div class="step-num">01</div>
          <div class="step-content">
            <div class="step-title">
              <h4>Analyze & Discover</h4>
              <span class="step-status">Scanning</span>
            </div>
            <p class="step-desc">Discovers project structures using fast search tools like <code>glob</code> and <code>grep</code>.</p>
            <div class="step-meta">Found 41 files in workspace. Searching for imports...</div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="pipeline-step" id="step-2">
          <div class="step-num">02</div>
          <div class="step-content">
            <div class="step-title">
              <h4>Context Gathering</h4>
              <span class="step-status-waiting">Reading</span>
            </div>
            <p class="step-desc">Inspects file contents with pagination to avoid context window inflation.</p>
            <div class="step-meta">Reading <code>src/auth.ts</code> (Lines 1-8)...</div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="pipeline-step" id="step-3">
          <div class="step-num">03</div>
          <div class="step-content">
            <div class="step-title">
              <h4>Targeted Refactoring</h4>
              <span class="step-status-waiting">Editing</span>
            </div>
            <p class="step-desc">Applies precise, diff-based edits (find-and-replace) to specific lines of code.</p>
            <div class="step-meta">Applying 6 additions and 2 deletions in <code>src/auth.ts</code>...</div>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="pipeline-step" id="step-4">
          <div class="step-num">04</div>
          <div class="step-content">
            <div class="step-title">
              <h4>Local Verification</h4>
              <span class="step-status-waiting">Testing</span>
            </div>
            <p class="step-desc">Runs builds, linters, and test suites locally to ensure zero regressions before finishing.</p>
            <div class="step-meta">Executing: <code>npm run test</code> -> Success (All green)</div>
          </div>
        </div>
      </div>

      <div class="pipeline-footer">
        <div class="pipeline-legend">
          <span class="legend-dot green"></span> Active
          <span class="legend-dot gray"></span> Pending
        </div>
        <div class="pipeline-model">Powered by Claude 3.7 Sonnet & Gemini 2.0 Pro</div>
      </div>
    </div>
  `;

  const steps = container.querySelectorAll('.pipeline-step');
  let activeIndex = 0;

  // Set up looping micro-animation to cycle through the active steps
  setInterval(() => {
    // Remove active state from current step
    steps[activeIndex].classList.remove('active');
    
    // Reset status label of current step
    const prevStatus = steps[activeIndex].querySelector('.step-status');
    if (prevStatus) {
      prevStatus.className = 'step-status-waiting';
      prevStatus.textContent = 'Pending';
    }

    // Move to next step
    activeIndex = (activeIndex + 1) % steps.length;
    
    steps[activeIndex].classList.add('active');
    
    // Update status label of next step
    const nextStatus = steps[activeIndex].querySelector('.step-status-waiting');
    if (nextStatus) {
      nextStatus.className = 'step-status';
      // Set name based on index
      const statuses = ['Scanning', 'Reading', 'Editing', 'Testing'];
      nextStatus.textContent = statuses[activeIndex];
    }
  }, 4000);
}
