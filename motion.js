(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const progress=document.createElement('div');progress.className='progress-line';progress.setAttribute('aria-hidden','true');document.body.append(progress);
const layers=[...document.querySelectorAll('[data-depth]')];const sections=[...document.querySelectorAll('main>section')];sections.forEach(el=>el.classList.add('depth-section'));
let raf=0,pointerX=0,pointerY=0;const fine=matchMedia('(pointer: fine)');
function draw(){raf=0;const extent=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--page-progress',extent>0?String(Math.min(1,Math.max(0,scrollY/extent))):'0');if(reduced.matches){layers.forEach(el=>el.style.removeProperty('transform'));return}
const hero=document.querySelector('.founder-hero');if(hero){const rect=hero.getBoundingClientRect();if(rect.bottom>-200&&rect.top<innerHeight+200){const offset=Math.max(-500,Math.min(900,-rect.top));layers.forEach(el=>{const depth=Number(el.dataset.depth)||0;const shift=offset*depth*(innerWidth<800?.32:.75);const turn=fine.matches?pointerX*depth*9:0;const tilt=fine.matches?-pointerY*depth*6:0;el.style.transform=`translate3d(${pointerX*depth*18}px,${shift+pointerY*depth*12}px,0) rotateX(${tilt}deg) rotateY(${turn}deg)`})}}
const y=Math.min(scrollY,5000);document.documentElement.style.setProperty('--grid-shift',`${-y*.025}px`);document.documentElement.style.setProperty('--orbit-shift',`${-y*.055}px`);
}
function request(){if(!raf)raf=requestAnimationFrame(draw)}
window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});window.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches)return;pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5;request()},{passive:true});window.addEventListener('pointerout',e=>{if(!e.relatedTarget){pointerX=0;pointerY=0;request()}},{passive:true});reduced.addEventListener('change',request);request();
})();
