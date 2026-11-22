(() => {
  'use strict';
  const root = document.documentElement;
  const dialog = document.querySelector('#swarm-intro');
  const replay = document.querySelector('[data-replay-intro]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
  const storageKey = 'specific-architectural-intro-v6';
  let engine, bridge, frame = 0, watchdog = 0, closingTimer = 0;
  let started = 0, deadline = 9800, elapsed = 0, lastTick = 0;
  let running = false, leaving = false, returnFocus = null, phase = '';
  const clearPending = () => root.classList.remove('swarm-pending');
  if (!dialog || !window.SpecificSwarm || !dialog.showModal) { clearPending(); return; }
  const canvas = dialog.querySelector('canvas');
  const phaseLabel = dialog.querySelector('[data-swarm-phase]');
  const phaseNumber = dialog.querySelector('[data-swarm-number]');

  function fit() {
    if (!engine || !running) return;
    engine.resize(dialog.clientWidth || innerWidth, dialog.clientHeight || innerHeight, devicePixelRatio || 1);
  }

  function cleanup() {
    clearTimeout(watchdog);
    clearTimeout(closingTimer);
    cancelAnimationFrame(frame);
    running = false;
    leaving = false;
    dialog.classList.remove('is-leaving');
    if (dialog.open) dialog.close();
    root.classList.remove('swarm-running', 'swarm-pending');
    engine?.destroy();
    engine = null;
    bridge?.remove?.();
    bridge = null;
    window.dispatchEvent(new Event('specific:intro-end'));
    if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
  }

  function finish(immediate = false) {
    if (!running || leaving) return;
    leaving = true;
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    root.classList.remove('swarm-pending');
    if (immediate || reduced.matches) { cleanup(); return; }
    dialog.classList.add('is-leaving');
    root.classList.add('swarm-revealing');
    closingTimer = setTimeout(cleanup, 660);
    setTimeout(() => root.classList.remove('swarm-revealing'), 900);
  }

  function tick(now) {
    if (!running || leaving || document.hidden) return;
    try {
      elapsed += Math.min(50, now - lastTick);
      lastTick = now;
      engine.render(elapsed);
      const reveal = engine.reveal || 0;
      dialog.style.setProperty('--swarm-reveal', String(reveal));
      dialog.style.background = `rgba(16,42,34,${1 - reveal})`;
      const topBar = dialog.querySelector('.swarm-top');
      const bottomBar = dialog.querySelector('.swarm-bottom');
      if (topBar) topBar.style.opacity = String(1 - reveal);
      if (bottomBar) bottomBar.style.opacity = String(1 - reveal);
      if (bridge) bridge.style.opacity = String(reveal);
      dialog.style.setProperty('--swarm-progress', String(Math.min(1, elapsed / deadline)));
      const nextPhase = engine.status(elapsed);
      if (phase !== nextPhase[0]) {
        phase = nextPhase[0];
        phaseLabel.textContent = phase;
        phaseNumber.textContent = nextPhase[1];
      }
      if (elapsed >= deadline) finish();
      else frame = requestAnimationFrame(tick);
    } catch { finish(true); }
  }

  function start() {
    if (running || reduced.matches) { clearPending(); return; }
    try {
      returnFocus = document.activeElement;
      if (document.createElement && dialog.insertBefore) {
        const sourceHeader = document.querySelector('body > header');
        const sourceOpening = document.querySelector('.opening-founders');
        if (sourceHeader && sourceOpening) {
          bridge = document.createElement('div');
          bridge.className = 'swarm-hero-bridge';
          bridge.setAttribute('aria-hidden', 'true');
          Object.assign(bridge.style, { position:'absolute', inset:'0', zIndex:'0', overflow:'hidden', opacity:'0', pointerEvents:'none', background:'#22352d' });
          bridge.append(sourceHeader.cloneNode(true), sourceOpening.cloneNode(true));
          dialog.insertBefore(bridge, canvas);
          Object.assign(canvas.style, { zIndex:'1' });
          for (const bar of dialog.querySelectorAll?.('.swarm-top,.swarm-bottom') || []) bar.style.zIndex = '2';
        }
      }
      engine = new window.SpecificSwarm(canvas, { compact });
      running = true;
      leaving = false;
      elapsed = 0;
      deadline = engine.duration;
      phase = '';
      dialog.showModal();
      root.classList.add('swarm-running');
      const opening = document.querySelector('.opening-founders');
      if (opening) { opening.style.opacity = '1'; opening.style.transform = 'none'; opening.style.visibility = 'visible'; }
      clearPending();
      fit();
      started = lastTick = performance.now();
      try { sessionStorage.setItem(storageKey, '1'); } catch { /* Storage may be unavailable. */ }
      window.dispatchEvent(new Event('specific:intro-start'));
      // The real website remains available even if animation frames are interrupted.
      watchdog = setTimeout(() => finish(true), 12000);
      frame = requestAnimationFrame(tick);
    } catch { cleanup(); }
  }

  dialog.querySelector('.swarm-enter').addEventListener('click', () => finish());
  canvas.addEventListener('pointermove', event => {
    if (!running || leaving) return;
    engine.move(event.clientX, event.clientY);
  }, { passive: true });
  dialog.addEventListener('wheel', event => {
    if (running && !leaving) engine.wheel(event.deltaY);
  }, { passive: true });
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  dialog.addEventListener('close', () => { if (running) cleanup(); });
  replay?.addEventListener('click', start);
  window.addEventListener('resize', () => { try { fit(); } catch { finish(true); } }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!running || leaving) return;
    cancelAnimationFrame(frame);
    if (!document.hidden) {
      if (performance.now() - started > 12000) finish(true);
      else { lastTick = performance.now(); frame = requestAnimationFrame(tick); }
    }
  });
  reduced.addEventListener('change', () => { if (reduced.matches) finish(true); });
  window.addEventListener('pagehide', () => { if (running) finish(true); });

  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === '1'; } catch { /* Intro can still run. */ }
  async function preloadAndStart() {
    if (!document.querySelectorAll) { start(); return; }
    const images = [...document.querySelectorAll('.opening-founders img')];
    const ready = [document.fonts?.ready, ...images.map(image => image.decode?.().catch(() => {}))].filter(Boolean);
    await Promise.race([Promise.all(ready), new Promise(resolve => setTimeout(resolve, 4500))]);
    start();
  }
  if (!seen && !location.hash && !reduced.matches) preloadAndStart();
  else clearPending();
})();
