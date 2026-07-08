export function initCanvasBackground(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    pulse: number;
    pulseSpeed: number;
  }

  interface Helix {
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    amplitude: number;
    angle: number;
    rotationSpeed: number;
    cycles: number;
    phase: number;
    phaseSpeed: number;
    color: string;
  }

  const particles: Particle[] = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 25000));

  const colors = [
    'rgba(192, 132, 252, 0.4)', // purple
    'rgba(56, 189, 248, 0.4)',  // sky
    'rgba(139, 92, 246, 0.3)',  // violet
    'rgba(244, 114, 182, 0.3)', // pink
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    });
  }

  // Floating double helices
  const helices: Helix[] = [];
  const helixCount = Math.min(8, Math.floor((width * height) / 160000));

  for (let i = 0; i < helixCount; i++) {
    helices.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12, // drift slower than particles
      vy: (Math.random() - 0.5) * 0.12,
      length: Math.random() * 70 + 70, // 70px to 140px
      amplitude: Math.random() * 8 + 6, // 6px to 14px amplitude
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.003,
      cycles: Math.random() * 1.5 + 1.5, // 1.5 to 3 waves
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.015 + Math.random() * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  let mouseX = -1000;
  let mouseY = -1000;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  function draw() {
    ctx!.clearRect(0, 0, width, height);

    // 1. Draw double helices
    helices.forEach((h) => {
      h.x += h.vx;
      h.y += h.vy;
      h.angle += h.rotationSpeed;
      h.phase += h.phaseSpeed;

      // Wrap around bounds
      const pad = h.length;
      if (h.x < -pad) h.x = width + pad;
      if (h.x > width + pad) h.x = -pad;
      if (h.y < -pad) h.y = height + pad;
      if (h.y > height + pad) h.y = -pad;

      const steps = 20;
      const p1List: { x: number; y: number }[] = [];
      const p2List: { x: number; y: number }[] = [];

      const cos = Math.cos(h.angle);
      const sin = Math.sin(h.angle);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const progressX = t * h.length - h.length / 2;
        
        // Sine wave offsets
        const wave = Math.sin(t * h.cycles * Math.PI * 2 + h.phase);
        const d1 = wave * h.amplitude;
        const d2 = -wave * h.amplitude;

        // Transform local to screen space
        const rx1 = h.x + (progressX * cos - d1 * sin);
        const ry1 = h.y + (progressX * sin + d1 * cos);

        const rx2 = h.x + (progressX * cos - d2 * sin);
        const ry2 = h.y + (progressX * sin + d2 * cos);

        p1List.push({ x: rx1, y: ry1 });
        p2List.push({ x: rx2, y: ry2 });
      }

      // Draw base pairs (rungs)
      for (let i = 0; i <= steps; i += 2) {
        const pt1 = p1List[i];
        const pt2 = p2List[i];

        ctx!.beginPath();
        ctx!.moveTo(pt1.x, pt1.y);
        ctx!.lineTo(pt2.x, pt2.y);
        
        const wave = Math.sin((i / steps) * h.cycles * Math.PI * 2 + h.phase);
        const alpha = 0.05 + Math.abs(wave) * 0.15;
        const cleanColor = h.color.replace('0.4', String(alpha)).replace('0.3', String(alpha));
        
        ctx!.strokeStyle = cleanColor;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();

        // Draw node circles
        ctx!.beginPath();
        ctx!.arc(pt1.x, pt1.y, 1.8, 0, Math.PI * 2);
        ctx!.arc(pt2.x, pt2.y, 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = h.color.replace('0.4', '0.2').replace('0.3', '0.2');
        ctx!.fill();
      }

      // Draw backbone 1
      ctx!.beginPath();
      ctx!.moveTo(p1List[0].x, p1List[0].y);
      for (let i = 1; i <= steps; i++) {
        ctx!.lineTo(p1List[i].x, p1List[i].y);
      }
      ctx!.strokeStyle = h.color.replace('0.4', '0.15').replace('0.3', '0.15');
      ctx!.lineWidth = 1.2;
      ctx!.stroke();

      // Draw backbone 2
      ctx!.beginPath();
      ctx!.moveTo(p2List[0].x, p2List[0].y);
      for (let i = 1; i <= steps; i++) {
        ctx!.lineTo(p2List[i].x, p2List[i].y);
      }
      ctx!.strokeStyle = h.color.replace('0.4', '0.15').replace('0.3', '0.15');
      ctx!.lineWidth = 1.2;
      ctx!.stroke();
    });

    // 2. Update and draw particles
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      // Wrap around bounds
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const size = p.radius + Math.sin(p.pulse) * 0.8;

      ctx!.beginPath();
      ctx!.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx!.fillStyle = p.color;
      ctx!.shadowBlur = 10;
      ctx!.shadowColor = p.color;
      ctx!.fill();
      ctx!.shadowBlur = 0;
    });

    // 3. Draw lines between nearby particles and mouse
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      // Connection to other particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.15;
          ctx!.beginPath();
          ctx!.moveTo(p1.x, p1.y);
          ctx!.lineTo(p2.x, p2.y);
          ctx!.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // Connection to mouse
      if (mouseX !== -1000) {
        const dx = p1.x - mouseX;
        const dy = p1.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          const alpha = (1 - dist / 200) * 0.25;
          ctx!.beginPath();
          ctx!.moveTo(p1.x, p1.y);
          ctx!.lineTo(mouseX, mouseY);
          ctx!.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}
