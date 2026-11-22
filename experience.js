(()=>{
const header=document.querySelector('header'),toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-navigation');
if(toggle&&nav){const close=()=>{toggle.setAttribute('aria-expanded','false');header.classList.remove('menu-open')};toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open)});nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('menu-open')){close();toggle.focus()}});document.addEventListener('click',e=>{if(!header.contains(e.target))close()});matchMedia('(min-width: 1101px)').addEventListener('change',close)}
const tabs=[...document.querySelectorAll('[data-practice]')];function select(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active});if(focus)tab.focus()}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();select(tabs[index],true)})});
const chapters=[...document.querySelectorAll('.journey-chapters article')];if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.target.classList.toggle('chapter-active',e.isIntersecting))},{rootMargin:'-20% 0px -20% 0px',threshold:.15});chapters.forEach(c=>observer.observe(c))}
})();
document.querySelectorAll('.founder-switch').forEach(section=>{const slides=[...section.querySelectorAll('.founder-slide')];let active=0;section.querySelector('.founder-rotate').addEventListener('click',()=>{active=(active+1)%slides.length;slides.forEach((slide,i)=>slide.hidden=i!==active);section.querySelector('.founder-position').textContent=(active+1)+' / 2 — '+(active?'Ramandeep Singh':'Gurnoor Singh')})});

// Rotate the opening profiles automatically every eight seconds.
document.querySelectorAll('.opening-founders').forEach(opening => {
  const panels = [...opening.querySelectorAll('[data-founder-panel]')];
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'founder-autoplay';
  pause.textContent = 'Pause rotation';
  pause.setAttribute('aria-pressed', 'false');
  opening.append(pause);
  let active = 0, paused = false, timer;
  function schedule() {
    clearTimeout(timer);
    if (!paused && !document.hidden && !document.documentElement.classList.contains('swarm-running')) timer = setTimeout(() => {
      // Do not remove a link or control while someone is using their keyboard.
      if (!panels[active].contains(document.activeElement)) select((active + 1) % panels.length);
      schedule();
    }, 8000);
  }
  function select(index) {
    active = index;
    panels.forEach((panel, i) => { panel.hidden = i !== active; });
  }
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.textContent = paused ? 'Resume rotation' : 'Pause rotation';
    pause.setAttribute('aria-pressed', String(paused));
    schedule();
  });
  function fromHash() {
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index >= 0) select(index);
    schedule();
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('specific:intro-start', schedule);
  window.addEventListener('specific:intro-end', schedule);
});
