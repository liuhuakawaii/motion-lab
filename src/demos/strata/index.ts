import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { layerBounds } from './geometry';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

function contours(base: number, color: string, count: number, drift: number): string {
  return Array.from({length:count},(_,i)=>`<path d="M-200 ${base+i*14} C180 ${base-160+i*19},530 ${base+90+i*11},850 ${base-40+i*13} S1400 ${base-170+i*17},1800 ${base+drift+i*12}" fill="none" stroke="${color}" stroke-width="1.2" opacity=".35"/>`).join('');
}

export function mount(container: HTMLElement, options = { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }): () => void {
  const host = document.createElement('div'); host.className = 'strata-demo';
  host.innerHTML = `<section class="strata-journey" aria-label="多层地貌视差旅程"><div class="strata-stage"><div class="strata-sky"></div><div class="strata-dusk"></div><div class="strata-grain"></div>
  <div class="strata-sun" aria-hidden="true"></div>
  <svg class="strata-layer strata-far" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-100 660 40 518 130 550 245 392 320 465 420 450 530 570 700 490 825 557 930 425 1040 485 1125 458 1240 560 1340 460 1510 525 1700 430V1200H-100Z" fill="#a47e78"/><path d="m245 392 22 142 153-84-100 15Zm685 33 35 182 160-149-85 27Z" fill="#b99487"/><path d="M-100 720 130 610 235 654 418 567 600 680 780 591 930 660 1200 540 1380 600 1700 520V1200H-100Z" fill="#9c736b"/></svg>
  <div class="strata-copy strata-copy--intro"><span>01 / A STUDY IN DEPTH</span><h1>A slower<br><em>world.</em></h1><p>地貌之间，时间慢下来。</p></div>
  <svg class="strata-layer strata-middle" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-200 770C100 480 430 555 720 700S1280 420 1800 650V1200H-200Z" fill="#bb704c"/><path d="M-200 770C100 480 430 555 720 700S1280 420 1800 650" fill="none" stroke="#e2a27b" stroke-width="3"/>${contours(730,'#e8b58e',21,40)}</svg>
  <svg class="strata-layer strata-near" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-200 950C70 640 330 775 620 847S1100 655 1420 725 1700 700 1800 680V1300H-200Z" fill="#7e4436"/>${contours(910,'#c38463',18,40)}<path d="M1160 860 1202 540 1241 503 1274 590 1291 836 1320 920Z" fill="#694036"/><path d="m1202 540 18 278 54-228-33-87Z" fill="#8c5841"/></svg>
  <svg class="strata-layer strata-front" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-150 1100 10 790 90 803 117 662 148 649 184 728 224 893 340 871 520 1005 820 975 1070 1040 1280 899 1550 921 1750 830V1300H-150Z" fill="#412d29"/><path d="m117 662 24 202 43-136-36-79Z" fill="#614135"/></svg>
  <div class="strata-copy strata-copy--arrival"><span>02 / CHANGE YOUR PERSPECTIVE</span><h2>Distance<br>changes<br><em>everything.</em></h2><p>远近交错，风景有了呼吸。</p></div>
  <aside class="strata-coordinate"><span>STRATA / 地貌之间</span><span>25° 18′ N &nbsp; 13° 42′ E<br>AN IMAGINED LANDSCAPE</span></aside>
  <div class="strata-scroll"><span>向下滚动，走进风景</span><i aria-hidden="true">↓</i></div><div class="strata-progress" aria-hidden="true"><i></i></div><span class="strata-distance" aria-hidden="true">000 / 100</span>
  </div></section><section class="strata-outro"><span>NOT ALL JOURNEYS NEED A DESTINATION.</span><h2>慢一点，<em>再远一点。</em></h2><p>不同距离的图层，以不同速度移动。<br>这就是滚动中的空间感。</p><a href="/demos/ink/">探索液态记忆 <span>↗</span></a></section>`;
  container.append(host);
  host.classList.toggle('is-reduced',options.reducedMotion);
  const stage = host.querySelector<HTMLElement>('.strata-stage')!;
  const journey = host.querySelector<HTMLElement>('.strata-journey')!;
  const sun = host.querySelector<HTMLElement>('.strata-sun')!;
  const distance = host.querySelector('.strata-distance')!;
  const layers = ['far','middle','near','front'].map(name=>host.querySelector<SVGElement>(`.strata-${name}`)!);
  const measure = () => {
    const bounds = layerBounds(stage.clientHeight, stage.clientHeight * .2);
    layers.forEach(layer => { layer.style.top = `${bounds.top}px`; layer.style.height = `${bounds.height}px`; });
  };
  measure();
  const mm = gsap.matchMedia();
  if (!options.reducedMotion) mm.add('(min-width: 0px)', () => {
    const timeline = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:journey,start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true,onUpdate: self => { distance.textContent = `${String(Math.round(self.progress*100)).padStart(3,'0')} / 100`; }}});
    const height = () => stage.clientHeight;
    timeline.to(layers[0],{y:()=>-height()*.035,xPercent:-2,duration:1},0)
      .to(layers[1],{y:()=>-height()*.09,xPercent:3,duration:1},0)
      .to(layers[2],{y:()=>-height()*.15,xPercent:-5,duration:1},0)
      .to(layers[3],{y:()=>-height()*.2,xPercent:7,duration:1},0)
      .to(sun,{y:()=>height()*.17,x:()=>stage.clientWidth*-.13,scale:.7,duration:1},0)
      .to(host.querySelector('.strata-copy--intro'),{y:()=>-height()*.2,autoAlpha:0,duration:.3},.02)
      .to(host.querySelector('.strata-scroll'),{autoAlpha:0,duration:.1},0)
      .fromTo(host.querySelector('.strata-copy--arrival'),{y:55,autoAlpha:0},{y:0,autoAlpha:1,duration:.3},.55)
      .to(host.querySelector('.strata-dusk'),{opacity:.7,duration:.8},.2)
      .fromTo(host.querySelector('.strata-progress i'),{scaleX:0},{scaleX:1,duration:1},0);
    return () => timeline.kill();
  });
  let lastHeight=stage.clientHeight,lastWidth=stage.clientWidth;
  const observer = new ResizeObserver(() => {
    if (lastHeight===stage.clientHeight && lastWidth===stage.clientWidth) return;
    lastHeight=stage.clientHeight;lastWidth=stage.clientWidth;measure();ScrollTrigger.refresh();
  });
  observer.observe(stage);
  return () => { observer.disconnect(); mm.revert(); host.remove(); };
}
