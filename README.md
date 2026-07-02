# Cairn Software — Corporate Hub

The official static website and repository catalog for **Cairn Software** (hosted live at [https://cairn.github.io](https://cairn.github.io)). Built using a lightweight, performant, and visual-first design approach.

## 🚀 Features

*   **Interactive Particle & Helix Background:** A responsive HTML5 Canvas animation featuring floating double helices (DNA structures) and active node meshes that drift, rotate, and interact with the user's cursor.
*   **Active Pipeline Showcase:** A read-only visual timeline demonstrating how the **Cairn Code** agentic loop discovers, refactors, and verifies codebases using tools and LLMs.
*   **Projects Catalog:** An interactive portfolio showcasing all public and private repositories under the Cairn organization (e.g. `cairn-code`, `mneme`, `floriography`), complete with category filtering tabs and tags.
*   **Architecture Visualizer:** A node-graph showing real-time flowing connections between large language models, the core agent runtime, local filesystem tools, and compiler targets.
*   **Dark Mode Scrollbars & Spacing:** Pixel-perfect dark styling supporting system theme preferences and custom scrollbar tracking.

## 🧬 Tech Stack

*   **Core:** Vanilla TypeScript (HTML5 Canvas + DOM)
*   **Build Tool & Bundler:** Vite
*   **Styling:** Vanilla CSS (Outfit & JetBrains Mono typography, dark glassmorphism)
*   **Deployment:** GitHub Actions + GitHub Pages

## 🛠️ Local Development

### Prerequisites

*   [Bun](https://bun.sh/) (v1.0+) — Recommended for ultra-fast installs, bundling, and local compilation.

### Setup & Run

1.  Clone the repository:
    ```bash
    git clone https://github.com/Cairn/cairn.github.io.git
    cd cairn.github.io
    ```

2.  Install dependencies:
    ```bash
    bun install
    ```

3.  Start the local development server:
    ```bash
    bun run dev
    ```

4.  Compile TypeScript checks and build static distribution bundles:
    ```bash
    bun run build
    ```

## 📦 Deployment Workflow

The site utilizes GitHub Actions for automated building and hosting. Every time code is pushed to the `main` branch, the workflow file in `.github/workflows/deploy.yml` triggers to:
1.  Check out the repository.
2.  Set up the latest stable version of **Bun** (via `oven-sh/setup-bun`).
3.  Install dependencies using `bun install --frozen-lockfile`.
4.  Compile and build the Vite static package (`bun run build`).
5.  Publish the compiled assets (`dist/`) directly to GitHub Pages.

---

*Built with care by the Cairn Team.*
