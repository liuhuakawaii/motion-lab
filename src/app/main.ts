import './style.css';
import { demos } from './catalog';
import type { Category } from './catalog';
import { artwork } from './artwork';

const app = document.querySelector<HTMLDivElement>('#app')!;
const brand = '<span class="brand-symbol" aria-hidden="true">m<span>↗</span></span><span>MOTION LAB</span>';
const path = window.location.pathname.replace(/\/+$/, '') || '/';

function renderCatalog() {
  app.innerHTML = `<div class="catalog"><header class="catalog-header"><a class="brand" href="/" aria-label="Motion Lab 首页">${brand}</a><span class="edition">INDEPENDENT MOTION STUDIES<br>VOL. 001 — 2026</span><a class="about-link" href="#about">关于实验室 <span>↗</span></a></header>
    <main><section class="catalog-intro"><div><p class="eyebrow"><span class="live-dot"></span> 网页动效实验室</p><h1>Made to<br><span>move.</span><i>↗</i></h1></div><div class="intro-aside"><span class="asterisk" aria-hidden="true">✳</span><p>让交互，<br>成为值得停留的瞬间。</p><p class="intro-note">关于滚动、材质与空间的原创实验。<br>选择一件作品，亲手感受它的变化。</p><a href="#studies">探索全部作品 <span>↓</span></a></div></section>
    <section id="studies" class="studies"><div class="studies-heading"><h2>Selected studies <span>精选实验</span></h2><span class="study-total">01 — ${String(demos.length).padStart(2, '0')}</span></div><div class="filters" role="group" aria-label="作品分类">${([['all','全部'],['scroll','滚动叙事'],['shader','Shader'],['three','Three.js'],['css','CSS']] as [Category,string][]).map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}<span class="result-count" aria-live="polite">${demos.length} 件作品</span></div><div class="study-grid">${demos.map(demo=>`<a class="study-card" data-demo="${demo.id}" href="/demos/${demo.id}/"><div class="study-art study-art--${demo.id}">${artwork(demo.id)}<span class="study-number">STUDY / ${demo.number}</span><span class="study-enter" aria-hidden="true">↗</span></div><div class="study-meta"><div><h3>${demo.title}<span>${demo.chinese}</span></h3><p>${demo.description}</p></div><span class="study-tags">${demo.tags.join(' / ')}</span></div></a>`).join('')}</div></section>
    <section id="about" class="catalog-about"><p class="eyebrow">A SMALL LAB. AN OPEN CANVAS.</p><h2>交互有形，<br><em>想象无界。</em></h2><div><p>这里收集可以触摸、滚动和探索的网页动效。每件作品都是独立实验，也是可以继续发展的起点。</p><p>新增四件作品的代码与程序化图形按 ISC 许可提供；原有作品保留各自来源与许可，图片素材不包含在新增作品的商用授权中。</p></div></section></main><footer><span>© 2026 MOTION LAB</span><span>DESIGNED FOR CURIOSITY.</span><a href="#">回到顶部 ↑</a></footer></div>`;
  const buttons = app.querySelectorAll<HTMLButtonElement>('[data-filter]');
  buttons.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter as Category;
    let count = 0;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const demo of demos) {
      const visible = category === 'all' || demo.categories.includes(category);
      app.querySelector<HTMLElement>(`[data-demo="${demo.id}"]`)!.hidden = !visible;
      if (visible) count++;
    }
    app.querySelector('.result-count')!.textContent = `${count} 件作品`;
  }));
}

async function renderDemo(id: string) {
  const demo = demos.find(item => item.id === id);
  if (!demo) { renderNotFound(); return; }
  document.title = `${demo.title} — Motion Lab`;
  document.body.classList.add('is-demo');
  app.innerHTML = `<header class="demo-toolbar"><a href="/" class="demo-back">← <span>MOTION LAB</span></a><span class="demo-name">${demo.number} / ${demo.title}</span><div class="demo-toolbar-actions"><button class="motion-toggle" type="button" aria-pressed="false">减少动态</button><a href="/demos/${demos[(demos.indexOf(demo)+1)%demos.length].id}/" class="demo-next">下一件 <span>↗</span></a></div></header><main id="demo-host"><div class="demo-loading" role="status">正在准备 ${demo.title}…</div></main>`;
  const host = app.querySelector<HTMLElement>('#demo-host')!;
  if (demo.framePath !== undefined) {
    app.querySelector('.motion-toggle')!.remove();
    const frame = document.createElement('iframe');
    frame.className = 'original-demo-frame';
    frame.title = `${demo.chinese} · 原有作品`;
    frame.src = demo.framePath;
    host.replaceChildren(frame);
    return;
  }
  try {
    const module = await demo.load();
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggle = app.querySelector<HTMLButtonElement>('.motion-toggle')!;
    let userReduced = false;
    try { userReduced = sessionStorage.getItem('motion-lab:reduce') === 'true'; } catch { /* Session preferences are optional when storage is unavailable. */ }
    let dispose: (() => void) | undefined;
    const mount = () => {
      dispose?.();
      host.replaceChildren();
      const reducedMotion = motionMedia.matches || userReduced;
      toggle.setAttribute('aria-pressed', String(reducedMotion));
      toggle.disabled = motionMedia.matches;
      toggle.textContent = motionMedia.matches ? '系统减少动态' : '减少动态';
      dispose = module.mount(host, { reducedMotion });
    };
    const update = () => { window.scrollTo({top:0,behavior:'instant'}); mount(); };
    toggle.addEventListener('click', () => {
      userReduced = !userReduced;
      try { sessionStorage.setItem('motion-lab:reduce', String(userReduced)); } catch { /* The current page still honors the requested preference. */ }
      update();
    });
    motionMedia.addEventListener('change', update);
    mount();
    window.addEventListener('pagehide', event => { if (!event.persisted) { dispose?.(); motionMedia.removeEventListener('change',update); } });
  } catch (error) {
    console.error(`Unable to mount ${demo.id}`, error);
    host.innerHTML = '<div class="demo-loading" role="alert"><h1>这个实验暂时无法打开</h1><p>请刷新重试，或返回目录探索其他作品。</p><a href="/">返回作品目录 ↗</a></div>';
  }
}

function renderNotFound() {
  app.innerHTML = '<main class="demo-loading"><p>404 / NOT FOUND</p><h1>这件作品还没有诞生。</h1><a href="/">返回 Motion Lab ↗</a></main>';
}

if (path === '/') renderCatalog();
else if (/^\/demos\/[^/]+$/.test(path)) void renderDemo(path.split('/')[2]);
else renderNotFound();

if (import.meta.env.DEV) void import('./diagnostics').then(({observeFrames})=>observeFrames(app));
