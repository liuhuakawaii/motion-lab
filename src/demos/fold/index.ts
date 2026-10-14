import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

function print(index: number): string {
  const top = `<span class="fold-print-top">MOTION LAB<br>PRINT STUDY / 0${index+1}</span>`;
  if(index===0) return `${top}<svg viewBox="0 0 200 330" aria-hidden="true">${Array.from({length:14},(_,i)=>`<ellipse cx="100" cy="164" rx="${9+i*6.4}" ry="${18+i*9}" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-15 100 164)"/>`).join('')}</svg><strong class="fold-print-bottom">Lines<br><em>in motion.</em></strong>`;
  if(index===1) return `${top}<svg viewBox="0 0 200 330" aria-hidden="true"><path d="M25 240V145A75 75 0 0 1 175 145V240H147V145A47 47 0 0 0 53 145V240Z" fill="currentColor"/><circle cx="100" cy="195" r="26" fill="currentColor"/></svg><strong class="fold-print-bottom">A quiet<br><em>structure.</em></strong>`;
  if(index===2) return `${top}<div class="fold-type-art">Pa<br>per<span>&</span><em>Space.</em></div><span class="fold-print-bottom fold-print-small">FORM FOLLOWS FEELING.</span>`;
  if(index===3) return `${top}<svg viewBox="0 0 200 330" aria-hidden="true"><circle cx="100" cy="165" r="75" fill="currentColor"/><g stroke="#d55638" stroke-width="3">${Array.from({length:14},(_,i)=>`<path d="M25 ${95+i*10}H175"/>`).join('')}</g><path d="M100 65V265" stroke="#d55638" stroke-width="4"/></svg><strong class="fold-print-bottom">Sun<br><em>studies.</em></strong>`;
  return `${top}<svg viewBox="0 0 200 330" aria-hidden="true">${Array.from({length:10},(_,i)=>`<rect x="${25+i*5}" y="${90+i*9}" width="${150-i*10}" height="${150-i*10}" rx="${i*2}" transform="rotate(${i*5} 100 165)" fill="none" stroke="currentColor" stroke-width="2"/>`).join('')}</svg><strong class="fold-print-bottom">Another<br><em>dimension.</em></strong>`;
}

export function mount(container: HTMLElement, options = { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }): () => void {
  const host=document.createElement('div');host.className='fold-demo';
  let chain='';
  for(let i=4;i>=0;i--) chain=`<div class="fold-panel fold-panel--${i}"><article class="fold-print">${print(i)}<i class="fold-shade" aria-hidden="true"></i></article>${chain}</div>`;
  host.innerHTML=`<section class="fold-journey" aria-label="CSS 三维折叠画廊"><div class="fold-stage"><header class="fold-heading"><div><span>04 / THE BEAUTY OF A FOLD</span><h1>Paper,<br><em>Space.</em></h1></div><p>一张纸的厚度，<br>也可以容纳一个空间。</p></header><div class="fold-perspective"><div class="fold-assembly">${chain}</div></div><div class="fold-ground" aria-hidden="true"></div><div class="fold-caption"><span class="fold-chapter">01 / IN THE FOLDS</span><p>向下滚动，展开另一种秩序。</p><span class="fold-cue" aria-hidden="true">↓</span></div><div class="fold-meter" aria-hidden="true"><span></span></div></div></section><section class="fold-outro"><p>EVERY SURFACE HAS ANOTHER SIDE.</p><h2>平面之上，<br><em>还有想象。</em></h2><a href="/">回到实验室 <span>↗</span></a></section>`;
  container.append(host);
  host.classList.toggle('is-reduced',options.reducedMotion);
  const stage=host.querySelector<HTMLElement>('.fold-stage')!;
  const panels=[...host.querySelectorAll<HTMLElement>('.fold-panel')];
  const shades=[...host.querySelectorAll<HTMLElement>('.fold-shade')];
  const assembly=host.querySelector<HTMLElement>('.fold-assembly')!;
  const chapter=host.querySelector('.fold-chapter')!;
  const caption=host.querySelector('.fold-caption p')!;
  const meter=host.querySelector<HTMLElement>('.fold-meter span')!;
  const state={angle:112,tilt:-7,progress:0};
  let panelWidth=0,panelCount=5;
  function measure() {
    const mobile=stage.clientWidth<620;
    panelCount=mobile?3:5;
    panelWidth=Math.min(stage.clientWidth*(mobile?.275:.16),240);
    host.style.setProperty('--fold-width',`${panelWidth}px`);
    host.style.setProperty('--fold-height',`${panelWidth*(mobile?2.35:1.65)}px`);
    panels[3].style.display=mobile?'none':'';
    render();
  }
  function render() {
    const angle=state.angle;
    // Equal and opposite hinge angles keep the paper connected as its projected width changes.
    const projectedWidth=panelWidth*panelCount*Math.cos(angle*Math.PI/360);
    assembly.style.transform=`translate3d(${-projectedWidth/2}px,-50%,0) rotateZ(${state.tilt}deg)`;
    panels.forEach((panel,i)=>{panel.style.transform=`rotateY(${i===0?-angle/2:(i%2===1?angle:-angle)}deg)`;});
    shades.forEach((shade,i)=>{shade.style.opacity=String(Math.abs(angle)/130*(i%2===0?.09:.28));});
    meter.style.transform=`scaleX(${state.progress})`;
  }
  measure();
  const mm=gsap.matchMedia();
  if (!options.reducedMotion) mm.add('(min-width: 0px)',()=>{
    state.angle=112;state.tilt=-7;state.progress=0;render();
    const tl=gsap.timeline({defaults:{ease:'sine.inOut'},onUpdate:render,scrollTrigger:{trigger:host.querySelector('.fold-journey'),start:'top top',end:'bottom bottom',scrub:.65,onUpdate:self=>{
      state.progress=self.progress;
      const section=self.progress<.35?0:self.progress<.72?1:2;
      chapter.textContent=['01 / IN THE FOLDS','02 / OPEN POSSIBILITIES','03 / A NEW PERSPECTIVE'][section];
      caption.textContent=['向下滚动，展开另一种秩序。','折痕舒展，印刷语言在此相遇。','改变角度，也改变观看的方式。'][section];
    }}});
    tl.to(state,{angle:0,tilt:0,duration:.46},0)
      .to(state,{angle:-30,tilt:3,duration:.24},.46)
      .to(state,{angle:-105,tilt:7,duration:.30},.70);
    return()=>tl.kill();
  });
  if (options.reducedMotion) {
    state.angle=22;state.tilt=0;state.progress=0;render();
    chapter.textContent='PRINT COLLECTION / 静态展览';caption.textContent='减少动态效果已开启。';
  }
  let previousWidth=stage.clientWidth;
  const observer=new ResizeObserver(()=>{if(stage.clientWidth===previousWidth)return;previousWidth=stage.clientWidth;measure();ScrollTrigger.refresh();});
  observer.observe(stage);
  return()=>{observer.disconnect();mm.revert();host.remove();};
}
