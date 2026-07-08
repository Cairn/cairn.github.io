interface FlowerData {
  name: string;
  latin: string;
  meaning: string;
  petalsColor: string;
  centerColor: string;
  petalCount: number;
  petalShape: 'oval' | 'pointed' | 'heart' | 'rose';
  poem: string;
  poet: string;
}

const flowersDb: FlowerData[] = [
  {
    name: 'Red Rose',
    latin: 'Rosa rubiginosa',
    meaning: 'Love, Passion, and Respect',
    petalsColor: '#ef4444',
    centerColor: '#facc15',
    petalCount: 8,
    petalShape: 'rose',
    poem: 'O my Luve is like a red, red rose<br>That’s newly sprung in June;<br>O my Luve is like the melody<br>That’s sweetly played in tune.',
    poet: 'Robert Burns'
  },
  {
    name: 'Lavender',
    latin: 'Lavandula angustifolia',
    meaning: 'Devotion, Tranquility, and Grace',
    petalsColor: '#a78bfa',
    centerColor: '#c084fc',
    petalCount: 16,
    petalShape: 'pointed',
    poem: 'Here’s flowers for you;<br>Hot lavender, mints, savoury, marjoram;<br>The marigold, that goes to bed wi’ the sun<br>And with him rises weeping.',
    poet: 'William Shakespeare'
  },
  {
    name: 'Forget-Me-Not',
    latin: 'Myosotis sylvatica',
    meaning: 'True Love and Memories',
    petalsColor: '#60a5fa',
    centerColor: '#fef08a',
    petalCount: 5,
    petalShape: 'oval',
    poem: 'The forget-me-not, that beautiful flower<br>Of memory\'s hope, that blooms in the bower;<br>It whispers of love that can never decay,<br>And memories sweet that will ne\'er fade away.',
    poet: 'Anonymous'
  },
  {
    name: 'Yellow Daffodil',
    latin: 'Narcissus pseudonarcissus',
    meaning: 'New Beginnings and Rebirth',
    petalsColor: '#fbbf24',
    centerColor: '#f59e0b',
    petalCount: 6,
    petalShape: 'heart',
    poem: 'I wandered lonely as a cloud<br>That floats on high o\'er vales and hills,<br>When all at once I saw a crowd,<br>A host, of golden daffodils.',
    poet: 'William Wordsworth'
  },
  {
    name: 'White Lily',
    latin: 'Lilium candidum',
    meaning: 'Purity, Majesty, and Rebirth',
    petalsColor: '#f3f4f6',
    centerColor: '#eab308',
    petalCount: 6,
    petalShape: 'pointed',
    poem: 'I stood in the garden of Lilies,<br>Where the white ones grow so tall;<br>And the wind blew over the Lilies,<br>And shook the dew from them all.',
    poet: 'Emily Dickinson'
  },
  {
    name: 'Sweet Violet',
    latin: 'Viola odorata',
    meaning: 'Modesty, Faithfulness, and Affection',
    petalsColor: '#8b5cf6',
    centerColor: '#fcd34d',
    petalCount: 5,
    petalShape: 'heart',
    poem: 'A violet by a mossy stone<br>Half hidden from the eye!<br>—Fair as a star, when only one<br>Is shining in the sky.',
    poet: 'William Wordsworth'
  }
];

export function initFloriography(container: HTMLElement) {
  container.innerHTML = `
    <div class="floriography-card">
      <div class="card-header">
        <h3>Floriography — Language of Flowers</h3>
        <p>Dynamic procedural generation based on historical botany and English poetry.</p>
      </div>

      <div class="garden-workspace">
        <div class="flower-canvas-wrapper">
          <canvas id="flower-canvas" width="360" height="360"></canvas>
          <div class="canvas-overlay-text" id="bloom-status">Ready to Bloom</div>
        </div>

        <div class="flower-details" id="flower-info">
          <div class="details-placeholder">
            <svg class="placeholder-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
            </svg>
            <p>Click "Pluck a Flower" to generate a botanical species and read its secret poetry.</p>
          </div>
        </div>
      </div>

      <div class="garden-controls">
        <button class="garden-btn primary" id="btn-bloom">Pluck a Flower</button>
        <button class="garden-btn secondary" id="btn-water">Tend Garden</button>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#flower-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  // Logical 360x360 drawing space rendered at device resolution for crispness
  const SIZE = 360;
  const pixelScale = ((canvas.clientWidth || SIZE) * (window.devicePixelRatio || 1)) / SIZE;
  canvas.width = SIZE * pixelScale;
  canvas.height = SIZE * pixelScale;
  ctx?.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  const btnBloom = container.querySelector('#btn-bloom') as HTMLButtonElement;
  const btnWater = container.querySelector('#btn-water') as HTMLButtonElement;
  const flowerInfo = container.querySelector('#flower-info') as HTMLDivElement;
  const bloomStatus = container.querySelector('#bloom-status') as HTMLDivElement;

  let animFrameId: number;
  let growthProgress = 0;
  let activeFlower: FlowerData | null = null;
  let isWatering = false;

  function clearCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Draw background
    ctx.fillStyle = '#111319';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < SIZE; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SIZE);
      ctx.stroke();
    }
    for (let y = 0; y < SIZE; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SIZE, y);
      ctx.stroke();
    }
  }

  clearCanvas();

  function drawFlower(progress: number) {
    if (!ctx || !activeFlower) return;
    clearCanvas();

    const cx = SIZE / 2;
    const maxStemHeight = 120;
    const stemY = SIZE - 30;

    // 1. Draw Stem
    ctx.beginPath();
    ctx.moveTo(cx, stemY);
    
    // Draw curved stem growing up
    const currentStemHeight = maxStemHeight * Math.min(progress * 2, 1);
    const topY = stemY - currentStemHeight;
    const ctrlX = cx + Math.sin(progress * Math.PI) * 15;
    const ctrlY = stemY - currentStemHeight / 2;
    
    ctx.quadraticCurveTo(ctrlX, ctrlY, cx, topY);
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Draw Leaves
    if (progress > 0.3) {
      const leafProg = (progress - 0.3) / 0.7;
      const leafSize = 18 * Math.min(leafProg * 1.5, 1);
      
      // Left Leaf
      ctx.save();
      ctx.translate(cx - 5, stemY - 50);
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, leafSize, leafSize / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();
      ctx.restore();

      // Right Leaf
      ctx.save();
      ctx.translate(cx + 5, stemY - 80);
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, leafSize, leafSize / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw Bloom
    if (progress > 0.5) {
      const bloomProg = (progress - 0.5) / 0.5;
      const bloomRadius = 55 * bloomProg;
      const petals = activeFlower.petalCount;

      ctx.save();
      ctx.translate(cx, topY);

      // Rotate bloom slightly based on progress for spinning grow effect
      ctx.rotate(bloomProg * Math.PI * 0.1);

      // Draw Petals
      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petals);

        ctx.fillStyle = activeFlower.petalsColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = activeFlower.petalsColor;

        ctx.beginPath();
        if (activeFlower.petalShape === 'pointed') {
          // Sharp ellipse
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-bloomRadius / 3, -bloomRadius / 2, 0, -bloomRadius);
          ctx.quadraticCurveTo(bloomRadius / 3, -bloomRadius / 2, 0, 0);
        } else if (activeFlower.petalShape === 'heart') {
          // Heart shape petal
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-bloomRadius / 2, -bloomRadius / 3, -bloomRadius / 1.5, -bloomRadius, -bloomRadius / 8, -bloomRadius);
          ctx.bezierCurveTo(bloomRadius / 8, -bloomRadius, bloomRadius / 1.5, -bloomRadius, bloomRadius / 2, -bloomRadius / 3);
          ctx.closePath();
        } else if (activeFlower.petalShape === 'rose') {
          // Layered circular curves
          ctx.arc(0, -bloomRadius / 2, bloomRadius / 2.2, 0, Math.PI * 2);
        } else {
          // Regular Oval
          ctx.ellipse(0, -bloomRadius / 2, bloomRadius / 2.5, bloomRadius / 1.8, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }

      // Draw Center
      ctx.beginPath();
      ctx.arc(0, 0, (bloomRadius / 3.5), 0, Math.PI * 2);
      ctx.fillStyle = activeFlower.centerColor;
      ctx.shadowBlur = 5;
      ctx.shadowColor = activeFlower.centerColor;
      ctx.fill();
      ctx.restore();
    }
  }

  function startBloomAnimation() {
    cancelAnimationFrame(animFrameId);
    growthProgress = 0;
    bloomStatus.style.opacity = '1';
    bloomStatus.textContent = 'Sprouting...';

    const randomIndex = Math.floor(Math.random() * flowersDb.length);
    activeFlower = flowersDb[randomIndex];

    // Show details
    flowerInfo.innerHTML = `
      <div class="flower-details-card animate-fade-in">
        <span class="flower-meaning-badge">${activeFlower.meaning}</span>
        <h4 class="flower-name">${activeFlower.name}</h4>
        <h5 class="flower-latin">${activeFlower.latin}</h5>
        <hr class="flower-hr">
        <blockquote class="flower-poem">
          "${activeFlower.poem}"
          <cite class="flower-poet">— ${activeFlower.poet}</cite>
        </blockquote>
      </div>
    `;

    function tick() {
      if (growthProgress < 1) {
        growthProgress += 0.015;
        drawFlower(growthProgress);
        animFrameId = requestAnimationFrame(tick);
      } else {
        growthProgress = 1;
        drawFlower(1);
        bloomStatus.textContent = 'Fully Bloomed';
        setTimeout(() => {
          bloomStatus.style.opacity = '0';
        }, 1500);
      }
    }

    tick();
  }

  function startWateringAnimation() {
    if (isWatering || !activeFlower) return;
    isWatering = true;
    btnWater.disabled = true;
    bloomStatus.style.opacity = '1';
    bloomStatus.textContent = 'Watering... 💧';

    let shake = 0;
    const startTime = Date.now();

    function waterTick() {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        shake = Math.sin(elapsed * 0.05) * 2;
        if (ctx && activeFlower) {
          clearCanvas();
          // Draw with shake
          ctx.save();
          ctx.translate(shake, 0);
          
          const cx = SIZE / 2;
          const maxStemHeight = 120;
          const stemY = SIZE - 30;

          // Draw stem
          ctx.beginPath();
          ctx.moveTo(cx, stemY);
          ctx.quadraticCurveTo(cx, stemY - 60, cx, stemY - maxStemHeight);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Left leaf
          ctx.save();
          ctx.translate(cx - 5, stemY - 50);
          ctx.rotate(-Math.PI / 4);
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#059669';
          ctx.fill();
          ctx.restore();

          // Right leaf
          ctx.save();
          ctx.translate(cx + 5, stemY - 80);
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#059669';
          ctx.fill();
          ctx.restore();

          // Draw Bloom
          ctx.save();
          ctx.translate(cx, stemY - maxStemHeight);
          const petals = activeFlower.petalCount;
          for (let i = 0; i < petals; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / petals);
            ctx.fillStyle = activeFlower.petalsColor;
            ctx.beginPath();
            if (activeFlower.petalShape === 'pointed') {
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(-55 / 3, -55 / 2, 0, -55);
              ctx.quadraticCurveTo(55 / 3, -55 / 2, 0, 0);
            } else if (activeFlower.petalShape === 'heart') {
              ctx.moveTo(0, 0);
              ctx.bezierCurveTo(-55 / 2, -55 / 3, -55 / 1.5, -55, -55 / 8, -55);
              ctx.bezierCurveTo(55 / 8, -55, 55 / 1.5, -55, 55 / 2, -55 / 3);
              ctx.closePath();
            } else if (activeFlower.petalShape === 'rose') {
              ctx.arc(0, -55 / 2, 55 / 2.2, 0, Math.PI * 2);
            } else {
              ctx.ellipse(0, -55 / 2, 55 / 2.5, 55 / 1.8, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
          }
          // Center
          ctx.beginPath();
          ctx.arc(0, 0, 55 / 3.5, 0, Math.PI * 2);
          ctx.fillStyle = activeFlower.centerColor;
          ctx.fill();
          ctx.restore();
          
          ctx.restore();

          // Draw blue droplets falling
          const droY = 30 + (elapsed * 0.2);
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(cx - 30, droY - 20, 4, 0, Math.PI * 2);
          ctx.arc(cx, droY, 4, 0, Math.PI * 2);
          ctx.arc(cx + 30, droY - 10, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        animFrameId = requestAnimationFrame(waterTick);
      } else {
        isWatering = false;
        btnWater.disabled = false;
        bloomStatus.textContent = 'Nourished! 🌱';
        drawFlower(1);
        setTimeout(() => {
          bloomStatus.style.opacity = '0';
        }, 1500);
      }
    }
    waterTick();
  }

  btnBloom.onclick = startBloomAnimation;
  btnWater.onclick = startWateringAnimation;
}
