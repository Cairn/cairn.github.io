import './style.css';
import { initCanvasBackground } from './canvas-bg.ts';
import { initCairnCodeShowcase } from './cairn-code-showcase.ts';
import { initFloriography } from './floriography-visual.ts';
import { initStackVisualizer } from './stack-visualizer.ts';
import { initProjectsPortal } from './projects-portal.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Navigation Header -->
  <header class="navbar">
    <a href="#" class="logo-container">
      <div class="logo-text">Cairn <span>Software</span></div>
    </a>
    <nav class="nav-links">
      <a href="#showcase-section">Cairn Code</a>
      <a href="#floriography-section">Floriography</a>
      <a href="#projects-section">Projects</a>
      <a href="#stack-section">Architecture</a>
      <a href="#philosophy-section">Philosophy</a>
      <a href="https://github.com/Cairn" target="_blank">GitHub</a>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="hero-section">
    <span class="badge">Next Generation Software</span>
    <h1 class="hero-title">Building the Future,<br>AI-First.</h1>
    <p class="hero-subtitle">
      We bridge the gap between complex AI capabilities and intuitive, human-centric design. From autonomous agents to procedural art, we shape the algorithms that shape our lives.
    </p>
  </section>

  <!-- Cairn Code Showcase Section -->
  <section class="grid-container" id="showcase-section">
    <div class="glass-card grid-full-width">
      <div id="cairn-code-showcase"></div>
    </div>
  </section>

  <!-- Floriography Section -->
  <section class="grid-container" id="floriography-section">
    <div class="glass-card grid-full-width">
      <div id="floriography-card"></div>
    </div>
  </section>

  <!-- Projects Portal Section -->
  <section class="grid-container" id="projects-section">
    <div class="glass-card grid-full-width">
      <div id="projects-portal-card"></div>
    </div>
  </section>

  <!-- Node Graph Visualizer Section -->
  <section class="grid-container" id="stack-section">
    <div class="glass-card grid-full-width">
      <div class="visualizer-container">
        <div class="visualizer-header">
          <h3>Interactive Agent Architecture</h3>
          <p>Real-time visual node connections mapping models to filesystem tools and test runners.</p>
        </div>
        <div class="canvas-container">
          <canvas id="stack-canvas"></canvas>
        </div>
      </div>
    </div>
  </section>

  <!-- Human-written About us / Story Section -->
  <section class="grid-container" id="philosophy-section">
    <div class="glass-card grid-full-width">
      <div class="about-section">
        <div class="about-header">
          <h2>Our Philosophy: AI-First, Not AI-After</h2>
        </div>
        <p class="about-p">
          We don't view AI as a simple chatbot in a side panel or a feature checklist item. For us, intelligence is the fundamental design primitive. When you build software starting from the model capability, the entire interface shifts. Applications transition from passive request-response cycles to active, collaborative agents that work alongside you.
        </p>
        <p class="about-p">
          Our projects reflect this duality. <strong>Cairn Code</strong> is an autonomous CLI loop that automates terminal operations, reads files, and edits your code directly with validation checks. On the other hand, <strong>Floriography</strong> is a playful study in combining classic poetry with mathematics and botany, showcasing that artificial intelligence can also grow beautiful, procedural experiences.
        </p>
        <div class="quote-block">
          "Software shouldn't just wait for instructions; it should understand context, act autonomously with permission, and design solutions that feel natural to humans."
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/Cairn/cairn-code" target="_blank">Cairn Code</a>
      <a href="https://github.com/Cairn/floriography" target="_blank">Floriography</a>
      <a href="https://github.com/Cairn" target="_blank">GitHub</a>
    </div>
    <div>&copy; 2026 Cairn Software. Built with care for the future of agentic coding.</div>
  </footer>
`;

// Initialize Background Canvas
const bgCanvas = document.createElement('canvas');
bgCanvas.id = 'bg-canvas';
document.body.prepend(bgCanvas);
initCanvasBackground(bgCanvas);

// Initialize Components
initCairnCodeShowcase(document.getElementById('cairn-code-showcase')!);
initFloriography(document.getElementById('floriography-card')!);
initProjectsPortal(document.getElementById('projects-portal-card')!);
initStackVisualizer(document.getElementById('stack-canvas') as HTMLCanvasElement);
