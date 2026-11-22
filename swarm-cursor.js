/* A small, non-blocking echo of the intro. Sleeps when the cursor is idle. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.className = 'swarm-cursor';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const motes = Array.from({ length: 24 }, (_, i) => ({ x: -100, y: -100, vx: 0, vy: 0,
    angle: i / 24 * Math.PI * 2, radius: 8 + (i % 5) * 3 }));
  let frame = 0, last = 0, moved = -Infinity, x = -100, y = -100;
  let interactive = false;
  const blocked = () => reduced.matches || !fine.matches || document.hidden || document.documentElement.classList.contains('swarm-running');
  function stop() { cancelAnimationFrame(frame); frame = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); moved = -Infinity; }
  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(now) {
    frame = 0;
    if (blocked() || now - moved > 1100) { stop(); return; }
    const dt = Math.min(2, (now - last) / 16.667 || 1);
    last = now;
    const fade = Math.max(0, Math.min(1, (1100 - (now - moved)) / 650));
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalAlpha = fade * .7;
    ctx.fillStyle = '#d8f34e';
    ctx.strokeStyle = '#50613c';
    ctx.lineWidth = .5;
    ctx.beginPath();
    for (const p of motes) {
      const angle = p.angle + now * .0003;
      const radius = p.radius * (interactive ? 1.35 : 1);
      p.vx = (p.vx + (x + Math.cos(angle) * radius - p.x) * .1 * dt) * Math.pow(.65, dt);
      p.vy = (p.vy + (y + Math.sin(angle) * radius - p.y) * .1 * dt) * Math.pow(.65, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.rect(p.x, p.y, 1.6, 1.6);
    }
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener('pointermove', event => {
    if (blocked() || event.pointerType === 'touch') return;
    const now = performance.now();
    if (now - moved > 1100) motes.forEach(p => { p.x = event.clientX; p.y = event.clientY; p.vx = p.vy = 0; });
    x = event.clientX; y = event.clientY; moved = now;
    interactive = Boolean(event.target.closest?.('a, button, input, textarea, select'));
    if (!frame) { last = now; frame = requestAnimationFrame(draw); }
  }, { passive: true });
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) stop(); });
  window.addEventListener('specific:intro-start', stop);
  window.addEventListener('resize', fit, { passive: true });
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', stop);
  reduced.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  fit();
})();
