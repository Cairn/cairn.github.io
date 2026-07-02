export function initStackVisualizer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
  let height = (canvas.height = 360);

  window.addEventListener('resize', () => {
    if (canvas.parentElement) {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
      initNodes();
    }
  });

  interface StackNode {
    id: string;
    label: string;
    x: number;
    y: number;
    size: number;
    color: string;
    pulse: number;
    pulseSpeed: number;
    category: 'model' | 'core' | 'tool' | 'env';
  }

  interface Connection {
    from: string;
    to: string;
    pulsePos: number; // 0 to 1
    pulseSpeed: number;
  }

  let nodes: StackNode[] = [];
  let connections: Connection[] = [];

  function initNodes() {
    nodes = [
      // Models
      { id: 'claude', label: 'Claude Fable 5', x: width * 0.15, y: height * 0.25, size: 28, color: '#f472b6', pulse: 0, pulseSpeed: 0.02, category: 'model' },
      { id: 'gemini', label: 'Gemini 3.5', x: width * 0.15, y: height * 0.5, size: 28, color: '#60a5fa', pulse: Math.PI / 3, pulseSpeed: 0.02, category: 'model' },
      { id: 'gpt4', label: 'GPT 5.6', x: width * 0.15, y: height * 0.75, size: 28, color: '#10b981', pulse: Math.PI * 2 / 3, pulseSpeed: 0.02, category: 'model' },

      // Core Agent Loop
      { id: 'core', label: 'CAIRN CORE AGENT', x: width * 0.45, y: height * 0.5, size: 45, color: '#a855f7', pulse: 0, pulseSpeed: 0.03, category: 'core' },

      // Tools
      { id: 'fileread', label: 'file_read', x: width * 0.75, y: height * 0.15, size: 20, color: '#fbbf24', pulse: 0, pulseSpeed: 0.015, category: 'tool' },
      { id: 'fileedit', label: 'file_edit', x: width * 0.75, y: height * 0.35, size: 20, color: '#f59e0b', pulse: Math.PI / 2, pulseSpeed: 0.015, category: 'tool' },
      { id: 'shell', label: 'shell execute', x: width * 0.75, y: height * 0.55, size: 20, color: '#ec4899', pulse: Math.PI, pulseSpeed: 0.015, category: 'tool' },
      { id: 'git', label: 'git helper', x: width * 0.75, y: height * 0.75, size: 20, color: '#3b82f6', pulse: Math.PI * 1.5, pulseSpeed: 0.015, category: 'tool' },

      // Environment Target
      { id: 'target', label: 'Target Codebase', x: width * 0.92, y: height * 0.5, size: 25, color: '#14b8a6', pulse: 0, pulseSpeed: 0.01, category: 'env' },
    ];

    connections = [
      { from: 'claude', to: 'core', pulsePos: 0, pulseSpeed: 0.005 },
      { from: 'gemini', to: 'core', pulsePos: 0.3, pulseSpeed: 0.006 },
      { from: 'gpt4', to: 'core', pulsePos: 0.7, pulseSpeed: 0.004 },

      { from: 'core', to: 'fileread', pulsePos: 0.1, pulseSpeed: 0.008 },
      { from: 'core', to: 'fileedit', pulsePos: 0.5, pulseSpeed: 0.007 },
      { from: 'core', to: 'shell', pulsePos: 0.2, pulseSpeed: 0.009 },
      { from: 'core', to: 'git', pulsePos: 0.8, pulseSpeed: 0.006 },

      { from: 'fileread', to: 'target', pulsePos: 0, pulseSpeed: 0.007 },
      { from: 'fileedit', to: 'target', pulsePos: 0.4, pulseSpeed: 0.008 },
      { from: 'shell', to: 'target', pulsePos: 0.2, pulseSpeed: 0.009 },
      { from: 'git', to: 'target', pulsePos: 0.6, pulseSpeed: 0.007 },
    ];
  }

  initNodes();

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#0f111a';
    ctx.fillRect(0, 0, width, height);

    // Draw Connection lines first
    connections.forEach((conn) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Flow Pulse Particle
        conn.pulsePos += conn.pulseSpeed;
        if (conn.pulsePos > 1) {
          conn.pulsePos = 0;
        }

        const px = fromNode.x + (toNode.x - fromNode.x) * conn.pulsePos;
        const py = fromNode.y + (toNode.y - fromNode.y) * conn.pulsePos;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = fromNode.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = fromNode.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    });

    // Draw Nodes
    nodes.forEach((node) => {
      node.pulse += node.pulseSpeed;
      const sizeMod = Math.sin(node.pulse) * 1.5;
      const radius = node.size + sizeMod;

      // Glow halo
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.08;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Inner Solid Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#171923';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = node.category === 'core' ? 3 : 2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = node.color;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw text label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = node.category === 'core' ? 'bold 11px system-ui' : '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + (node.category === 'core' ? 4 : 3));
    });

    requestAnimationFrame(draw);
  }

  draw();
}
