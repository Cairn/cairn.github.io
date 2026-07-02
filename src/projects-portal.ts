interface Project {
  name: string;
  description: string;
  category: 'ai' | 'systems' | 'creative' | 'other';
  tags: string[];
  repoUrl: string;
  isPrivate: boolean;
  icon: string;
}

const projects: Project[] = [
  {
    name: 'floriography',
    description: 'Floriography — a random flower growth generator, its Latin name, its Victorian meaning, and a matching verse from a real English poem.',
    category: 'creative',
    tags: ['TypeScript', 'Canvas', 'Botany', 'Poetry'],
    repoUrl: 'https://github.com/Cairn/floriography',
    isPrivate: false,
    icon: '🌸'
  },
  {
    name: 'cairn.github.io',
    description: 'The official, highly interactive static site portal for Cairn Software, built with procedural backgrounds, flow diagrams, and project catalogs.',
    category: 'creative',
    tags: ['TypeScript', 'Vite', 'HTML5 Canvas', 'CSS3'],
    repoUrl: 'https://github.com/Cairn/cairn.github.io',
    isPrivate: false,
    icon: '🌐'
  },
  {
    name: 'mneme',
    description: 'A zero-dependency semantic caching library for Python. Replaces complex database setups with an embedded SQLite vector cache and local model inference to cut LLM costs and latency.',
    category: 'ai',
    tags: ['Python', 'LLM Cache', 'SQLite', 'Local-first'],
    repoUrl: 'https://github.com/Cairn/mneme',
    isPrivate: false,
    icon: '🧠'
  },
  {
    name: 'cairn-code',
    description: 'An autonomous software engineering assistant designed to execute terminal commands, read files, and patch code directly inside your workspace with multi-turn reasoning.',
    category: 'ai',
    tags: ['Rust', 'CLI', 'LLM Agent', 'Local-first'],
    repoUrl: 'https://github.com/Cairn/cairn-code',
    isPrivate: true,
    icon: '⚙️'
  },
  {
    name: 'synapse-crm',
    description: 'AI-native CRM system built for intelligent relationship management, automatic email/meeting summarization, and predictive sales loops.',
    category: 'ai',
    tags: ['React', 'Node.js', 'FastAPI', 'ML'],
    repoUrl: 'https://github.com/Cairn/synapse-crm',
    isPrivate: true,
    icon: '💼'
  },
  {
    name: 'linux-protect',
    description: 'A lightweight, local-first security daemon for Ubuntu environments. Delivers real-time filesystem monitoring and automated threat signature containment.',
    category: 'systems',
    tags: ['C', 'Linux', 'Security', 'Local-first'],
    repoUrl: 'https://github.com/Cairn/linux-protect',
    isPrivate: true,
    icon: '🛡️'
  },
  {
    name: 'router',
    description: 'A high-throughput networking router engine engineered for low-latency packet processing across distributed private cloud architectures.',
    category: 'systems',
    tags: ['Go', 'Networking', 'TCP/IP', 'Performance'],
    repoUrl: 'https://github.com/Cairn/router',
    isPrivate: true,
    icon: '🔌'
  },
  {
    name: 'bizzareum',
    description: 'Every refresh, generates a new oil painting style graphic and description of the weirdest historical event from a random year in history.',
    category: 'creative',
    tags: ['Dall-E', 'Python', 'History', 'API'],
    repoUrl: 'https://github.com/Cairn/bizzareum',
    isPrivate: true,
    icon: '🎨'
  },
  {
    name: 'ProductivEx',
    description: 'A simple yet powerful Android application designed to help you stay focused and productive by managing tasks and restricting distracting apps.',
    category: 'other',
    tags: ['Android', 'Kotlin', 'Compose', 'Productivity'],
    repoUrl: 'https://github.com/Cairn/ProductivEx',
    isPrivate: true,
    icon: '⚡'
  },
  {
    name: 'cairn-stickers',
    description: 'Premium die-cut vinyl stickers and decals. Designed with love by the Cairn team and shipped to developers worldwide.',
    category: 'creative',
    tags: ['Design', 'Merch', 'SVG', 'Vector'],
    repoUrl: 'https://github.com/Cairn/cairn-stickers',
    isPrivate: true,
    icon: '🏷️'
  }
];

export function initProjectsPortal(container: HTMLElement) {
  container.innerHTML = `
    <div class="portal-header">
      <span class="badge">Studio Projects</span>
      <h2>Our Repository Ecosystem</h2>
      <p class="portal-subtitle">Explore the list of open-source and internal software applications built by Cairn Software.</p>
      
      <div class="filter-bar">
        <button class="filter-tab active" data-filter="all">All Projects (${projects.length})</button>
        <button class="filter-tab" data-filter="ai">🤖 AI & Agents</button>
        <button class="filter-tab" data-filter="systems">🛡️ Systems & Security</button>
        <button class="filter-tab" data-filter="creative">🎨 Art & Creative</button>
      </div>
    </div>

    <div class="projects-grid" id="catalog-grid"></div>
  `;

  const grid = container.querySelector('#catalog-grid') as HTMLDivElement;
  const filterTabs = container.querySelectorAll('.filter-tab');

  function renderProjects(filter: string) {
    grid.innerHTML = '';
    const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

    filtered.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'project-portal-card animate-fade-in';
      card.innerHTML = `
        <div class="card-icon-row">
          <span class="project-icon">${p.icon}</span>
          <span class="project-visibility-badge ${p.isPrivate ? 'private' : 'public'}">
            ${p.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
        <h3 class="project-card-name">${p.name}</h3>
        <p class="project-card-desc">${p.description}</p>
        <div class="project-card-tags">
          ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <a href="${p.repoUrl}" target="_blank" class="project-card-link">
          View Repository 
          <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      `;
      grid.appendChild(card);
    });
  }

  // Initial render
  renderProjects('all');

  // Set up filter click events
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter') || 'all';
      renderProjects(filter);
    });
  });
}
