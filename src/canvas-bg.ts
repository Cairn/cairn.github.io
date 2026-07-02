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

  const particles: Particle[] = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 25000));

  const colors = [
    'rgba(192, 132, 252, 0.4)', // purple/purple-400
    'rgba(56, 189, 248, 0.4)',  // sky/sky-400
    'rgba(139, 92, 246, 0.3)',  // violet/violet-500
    'rgba(244, 114, 182, 0.3)', // pink/pink-400
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

    // Subtle dark gradient background overlay
    const gradient = ctx!.createRadialGradient(
      width / 2,
      height / 2,
      10,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    gradient.addColorStop(0, 'rgba(15, 17, 23, 0.95)');
    gradient.addColorStop(1, 'rgba(10, 11, 15, 1)');
    ctx!.fillStyle = gradient;
    ctx!.fillRect(0, 0, width, height);

    // Update and draw particles
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
      ctx!.shadowBlur = 0; // reset
    });

    // Draw lines between nearby particles and mouse
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
