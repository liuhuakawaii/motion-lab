import * as THREE from 'three';
import './style.css';

// Both plates are drawn locally; no network assets or font dependencies.
function plate(night: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 1500;
  const x = c.getContext('2d')!;
  x.fillStyle = night ? '#122f35' : '#ecdac6'; x.fillRect(0, 0, 1200, 1500);
  let seed = 71;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // Etched contours and paper grain create an illustrated, tactile plate.
  for (let i = 0; i < 90; i++) {
    x.beginPath();
    for (let j = 0; j <= 160; j++) {
      const t = j / 160 * Math.PI * 2;
      const r = 165 + i * 4.2 + Math.sin(t * 3 + i * .045) * 48;
      const px = 620 + Math.cos(t) * r, py = 730 + Math.sin(t) * r * 1.35;
      if (!j) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.closePath(); x.strokeStyle = night ? 'rgba(175,206,178,.28)' : 'rgba(141,68,46,.23)'; x.lineWidth = 1.1; x.stroke();
  }
  x.save(); x.translate(night ? 550 : 710, night ? 610 : 720); x.rotate(night ? -.3 : .25);
  x.fillStyle = night ? '#bfd1ac' : '#bc573e';
  x.beginPath(); x.ellipse(0, 0, 215, 390, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = night ? '#16383d' : '#ecdac6';
  x.beginPath(); x.ellipse(70, -80, 166, 312, 0, 0, Math.PI * 2); x.fill();
  x.restore();
  x.fillStyle = night ? '#e8d8bb' : '#653b2d'; x.beginPath(); x.arc(night ? 830 : 365, night ? 370 : 400, 78, 0, Math.PI * 2); x.fill();
  for (let i = 0; i < 110000; i++) {
    x.fillStyle = random() > .5 ? 'rgba(255,255,255,.065)' : 'rgba(0,0,0,.065)';
    x.fillRect(random() * 1200, random() * 1500, 1.5, 1.5);
  }
  x.fillStyle = night ? '#d4dfc7' : '#643d30';
  x.font = '20px monospace'; x.fillText(night ? 'PLATE II  /  NOCTURNE' : 'PLATE I  /  TERRACOTTA', 74, 1385);
  x.font = 'italic 92px Georgia'; x.fillText(night ? 'The other side.' : 'Below the surface.', 70, 1320);
  return c;
}

const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const simulation = `precision highp float; varying vec2 vUv;
uniform sampler2D field; uniform vec2 texel, pointer, previous; uniform float dt, aspect, paint;
void main(){
 vec2 e=texel; float old=texture2D(field,vUv).r;
 float neighbors=(texture2D(field,vUv+vec2(e.x,0.)).r+texture2D(field,vUv-vec2(e.x,0.)).r+texture2D(field,vUv+vec2(0.,e.y)).r+texture2D(field,vUv-vec2(0.,e.y)).r)*.25;
 float f=mix(old,neighbors,1.-exp(-dt*9.))*exp(-dt*.7);
 vec2 p=vUv*vec2(aspect,1.), a=previous*vec2(aspect,1.), b=pointer*vec2(aspect,1.);
 vec2 ab=b-a; float h=clamp(dot(p-a,ab)/max(dot(ab,ab),.000001),0.,1.);
 float d=length(p-a-ab*h); f=max(f,paint*(1.-smoothstep(.028,.11,d)));
 gl_FragColor=vec4(f,0.,0.,1.);
}`;
const display = `precision highp float; varying vec2 vUv;
uniform sampler2D field, day, night; uniform vec2 texel; uniform float aspect;
vec2 cover(vec2 p){float imageAspect=.8; return (p-.5)*vec2(min(1.,aspect/imageAspect),min(1.,imageAspect/aspect))+.5;}
void main(){
 float f=texture2D(field,vUv).r;
 vec2 gradient=vec2(texture2D(field,vUv+vec2(texel.x*2.,0.)).r-texture2D(field,vUv-vec2(texel.x*2.,0.)).r,texture2D(field,vUv+vec2(0.,texel.y*2.)).r-texture2D(field,vUv-vec2(0.,texel.y*2.)).r);
 vec2 bend=gradient*.14; vec2 uv=cover(vUv);
 vec3 a=texture2D(day,uv+bend).rgb, b=texture2D(night,uv-bend*.8).rgb;
 float reveal=smoothstep(.035,.5,f); vec3 color=mix(a,b,reveal);
 float rim=length(gradient); color+=vec3(.72,.84,.71)*rim*.65;
 gl_FragColor=vec4(color,1.);
}`;

export function mount(container: HTMLElement): () => void {
  const host = document.createElement('section'); host.className = 'ink-demo';
  host.innerHTML = `<div class="ink-stage"></div><header class="ink-heading"><span class="ink-label">EXPERIMENT 02 — LIQUID REVEAL</span><h1>触及<br><em>另一面。</em></h1><p>划过表面，让隐秘的颜色浮现。</p></header><footer class="ink-footer"><span>拖动探索 · 痕迹会缓慢消散</span><button type="button">重置画面 <span aria-hidden="true">↺</span></button><span class="ink-number">I / II</span></footer>`;
  container.append(host);
  const stage = host.querySelector<HTMLDivElement>('.ink-stage')!;
  const abort = new AbortController(); const options = { signal: abort.signal };
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false }); }
  catch {
    stage.append(plate(false)); host.classList.add('ink-fallback');
    host.querySelector('p')!.textContent = '当前设备显示静态画作。';
    host.querySelector('button')!.disabled = true;
    return () => { abort.abort(); host.remove(); };
  }
  stage.append(renderer.domElement); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const day = new THREE.CanvasTexture(plate(false)), night = new THREE.CanvasTexture(plate(true));
  const geometry = new THREE.PlaneGeometry(2, 2); const camera = new THREE.Camera(); const scene = new THREE.Scene();
  let front = new THREE.WebGLRenderTarget(1, 1), back = new THREE.WebGLRenderTarget(1, 1);
  const point = new THREE.Vector2(.5, .5), previous = new THREE.Vector2(.5, .5), texel = new THREE.Vector2(1, 1);
  const sim = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: simulation, uniforms: { field: { value: front.texture }, texel: { value: texel }, pointer: { value: point }, previous: { value: previous }, dt: { value: 0 }, aspect: { value: 1 }, paint: { value: 0 } } });
  const output = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: display, uniforms: { field: { value: front.texture }, day: { value: day }, night: { value: night }, texel: { value: texel }, aspect: { value: 1 } } });
  const mesh = new THREE.Mesh(geometry, output); scene.add(mesh);
  let raf = 0, last = 0, activeUntil = 0, dirty = false, disposed = false;
  let activePointerId: number | null = null;
  let hiddenAt: number | null = document.hidden ? performance.now() : null;
  function draw() { mesh.material = output; renderer.setRenderTarget(null); renderer.render(scene, camera); }
  function clear() { cancelAnimationFrame(raf); raf = 0; renderer.setRenderTarget(front); renderer.clear(); renderer.setRenderTarget(back); renderer.clear(); output.uniforms.field.value = front.texture; activeUntil = 0; dirty = false; draw(); }
  function frame(now: number) {
    raf = 0; if (disposed || document.hidden) return;
    const dt = Math.min((now - last) / 1000 || 1 / 60, .05); last = now;
    sim.uniforms.dt.value = dt; sim.uniforms.paint.value = dirty ? 1 : 0; sim.uniforms.field.value = front.texture;
    mesh.material = sim; renderer.setRenderTarget(back); renderer.render(scene, camera);
    const swap = front; front = back; back = swap; output.uniforms.field.value = front.texture;
    previous.copy(point); dirty = false; draw();
    if (now < activeUntil) raf = requestAnimationFrame(frame); else clear();
  }
  function wake() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); const scale = Math.min(512 / w, 512 / h, 1);
    const sw = Math.max(1, Math.round(w * scale)), sh = Math.max(1, Math.round(h * scale));
    front.setSize(sw, sh); back.setSize(sw, sh); texel.set(1 / sw, 1 / sh);
    sim.uniforms.aspect.value = output.uniforms.aspect.value = w / h; clear();
  }
  function paint(event: PointerEvent) {
    if (activePointerId !== null && event.pointerId !== activePointerId) return;
    if (event.pointerType !== 'mouse' && event.pointerId !== activePointerId) return;
    const bounds = stage.getBoundingClientRect();
    if (!dirty) previous.copy(point);
    point.set((event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height);
    dirty = true; activeUntil = performance.now() + 9000; wake();
  }
  stage.addEventListener('pointerdown', event => {
    if (activePointerId !== null) return;
    activePointerId = event.pointerId;
    const bounds = stage.getBoundingClientRect();
    point.set((event.clientX-bounds.left)/bounds.width,1-(event.clientY-bounds.top)/bounds.height);
    previous.copy(point); stage.setPointerCapture(event.pointerId); paint(event);
  }, options);
  stage.addEventListener('pointermove', paint, options);
  function release(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  }
  stage.addEventListener('pointerup', release, options);
  stage.addEventListener('pointercancel', release, options);
  stage.addEventListener('lostpointercapture', release, options);
  stage.addEventListener('pointerenter', event => {
    if (activePointerId !== null || event.pointerType !== 'mouse') return;
    const bounds=stage.getBoundingClientRect(); point.set((event.clientX-bounds.left)/bounds.width,1-(event.clientY-bounds.top)/bounds.height); previous.copy(point);
  }, options);
  host.querySelector('button')!.addEventListener('click', clear, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = performance.now(); cancelAnimationFrame(raf); raf = 0;
    } else {
      // Freeze the field and its remaining lifetime together while hidden.
      if (hiddenAt !== null && activeUntil > 0) activeUntil += performance.now() - hiddenAt;
      hiddenAt = null;
      if (activeUntil > performance.now()) wake(); else clear();
    }
  }, options);
  const observer = new ResizeObserver(resize); observer.observe(stage); resize();
  return () => { disposed = true; abort.abort(); observer.disconnect(); cancelAnimationFrame(raf); geometry.dispose(); sim.dispose(); output.dispose(); day.dispose(); night.dispose(); front.dispose(); back.dispose(); renderer.dispose(); renderer.forceContextLoss(); host.remove(); };
}
