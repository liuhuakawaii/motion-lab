import * as THREE from 'three';
import { cameraPose, dampProgress } from './path';
import './style.css';

const chapters = [
  ['01', 'Threshold', '光的入口', 'A study in rhythm, light & space.'],
  ['02', 'Interlude', '留白之间', 'Objects give silence a sense of scale.'],
  ['03', 'Beyond', '向深处去', 'Every threshold opens another perspective.'],
];
export function mount(container: HTMLElement, options: { reducedMotion: boolean } = { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }): () => void {
  const root = document.createElement('section');
  root.className = 'passage';
  root.innerHTML = `<div class="passage-stage"><div class="passage-canvas"></div><header class="passage-heading"><p>Motion Lab / Spatial study No. 03</p><h1>Passage<span>行进之间</span></h1></header><div class="passage-note">ARCHITECTURE IN MOTION<br><span>光 · 秩序 · 空间</span></div><div class="passage-caption"><span class="passage-number">01</span><div><h2>Threshold <span>光的入口</span></h2><p>A study in rhythm, light & space.</p></div></div><div class="passage-bottom"><span>SCROLL TO EXPLORE <b>↓</b></span><div class="passage-track"><i></i></div><span>THREE CHAPTERS / 一条路径</span></div></div>`;
  container.append(root);
  const stage = root.querySelector<HTMLElement>('.passage-stage')!;
  const canvasHost = root.querySelector<HTMLElement>('.passage-canvas')!;
  const number = root.querySelector<HTMLElement>('.passage-number')!;
  const title = root.querySelector<HTMLElement>('.passage-caption h2')!;
  const description = root.querySelector<HTMLElement>('.passage-caption p')!;
  const track = root.querySelector<HTMLElement>('.passage-track i')!;
  const isReduced = options.reducedMotion;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch { root.classList.add('passage-static'); canvasHost.innerHTML = '<div class="passage-fallback"><strong>空间，由光塑造。</strong><p>此设备暂时无法呈现 3D 展廊。<br>Passage — a study in rhythm, light & space.</p></div>'; return () => root.remove(); }
  canvasHost.append(renderer.domElement);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor('#d8d3c8');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#d8d3c8', 26, 70);
  const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const material = (color: string, roughness = .8) => { const m = new THREE.MeshStandardMaterial({ color, roughness }); materials.add(m); return m; };
  const ivory = material('#ddd4c1'), floorMat = material('#c9bfae'), terra = material('#a94a32'), blue = material('#183d85'), dark = material('#665b4a');
  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
    geometries.add(geometry); const m = new THREE.Mesh(geometry, mat); m.position.set(x, y, z); scene.add(m); return m;
  }
  mesh(new THREE.BoxGeometry(20, .25, 90), floorMat, 0, -.15, -19);
  mesh(new THREE.BoxGeometry(.45, 8, 82), ivory, -6.2, 3.9, -19);
  // Wide open arcade: paired pillars with a semicircular vault and uninterrupted walking clearance.
  const archShape = new THREE.Shape();
  const outer = 4.9, inner = 3.9, spring = 2.2;
  archShape.moveTo(-outer, 0); archShape.lineTo(-outer, spring);
  archShape.absarc(0, spring, outer, Math.PI, 0, true);
  archShape.lineTo(outer, 0); archShape.lineTo(inner, 0); archShape.lineTo(inner, spring);
  archShape.absarc(0, spring, inner, 0, Math.PI, false);
  archShape.lineTo(-inner, 0); archShape.closePath();
  const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: .85, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .06, bevelThickness: .06, curveSegments: 36 });
  geometries.add(archGeo);
  const arcade = new THREE.InstancedMesh(archGeo, ivory, 10);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 10; i++) { matrix.makeTranslation(0, 0, 7 - i * 5.5); arcade.setMatrixAt(i, matrix); }
  scene.add(arcade);
  // Low-cost architectural shadows are static translucent floor silhouettes, not realtime maps.
  const shadowMat = new THREE.MeshBasicMaterial({ color: '#66553e', transparent: true, opacity: .13, depthWrite: false }); materials.add(shadowMat);
  for (let i = 0; i < 10; i++) {
    const s = mesh(new THREE.PlaneGeometry(8.3, .75), shadowMat, .7, -.012, 8 - i * 5.5); s.rotation.x = -Math.PI / 2; s.rotation.z = -.2;
  }
  const sculptures = [{ x: 2.65, z: 1.2, mat: terra }, { x: -2.55, z: -15, mat: blue }, { x: 2.55, z: -32, mat: terra }];
  sculptures.forEach(({ x, z, mat }, i) => {
    mesh(new THREE.BoxGeometry(1.6, .28, 1.6), ivory, x, .14, z);
    if (i === 1) {
      const ring = mesh(new THREE.TorusGeometry(1.03, .27, 16, 64), mat, x, 1.62, z); ring.rotation.y = -.38;
      mesh(new THREE.BoxGeometry(.4, .7, .45), mat, x, .6, z);
    } else {
      const sculpture = mesh(new THREE.TorusKnotGeometry(.72, .24, 96, 14, 2, 3), mat, x, 1.48, z); sculpture.rotation.set(.3, .3, .3);
    }
  });
  // Repeated bronze inlays make camera travel perceptible without visual noise.
  const inlayGeo = new THREE.BoxGeometry(.022, .009, 65); geometries.add(inlayGeo);
  [-1.55, 1.55].forEach(x => mesh(inlayGeo, dark, x, .001, -18));
  scene.add(new THREE.HemisphereLight('#fff6df', '#817464', 2.1));
  const sun = new THREE.DirectionalLight('#fff3d8', 3.4); sun.position.set(6, 11, 8); scene.add(sun);
  const fill = new THREE.DirectionalLight('#dce8ff', .7); fill.position.set(-6, 4, -20); scene.add(fill);
  let progress = 0, target = 0, frame = 0, lastTime = 0, chapter = -1, disposed = false;
  const render = () => {
    const pose = cameraPose(progress); camera.position.set(pose.x, pose.y, pose.z); camera.lookAt(pose.targetX, pose.targetY, pose.targetZ);
    renderer.render(scene, camera);
    const next = Math.min(2, Math.floor(progress * 3));
    if (next !== chapter) { chapter = next; const c = chapters[next]!; number.textContent = c[0]!; title.replaceChildren(document.createTextNode(c[1]! + ' ')); const zh = document.createElement('span'); zh.textContent = c[2]!; title.append(zh); description.textContent = c[3]!; }
    track.style.transform = `scaleX(${progress})`;
  };
  const settleEpsilon = .0001;
  function tick(time: number) {
    frame = 0;
    if (disposed || document.hidden || isReduced) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .1) : 1 / 60;
    lastTime = time;
    progress = dampProgress(progress, target, delta);
    const settled = Math.abs(target - progress) <= settleEpsilon;
    if (settled) progress = target;
    render();
    if (!settled) frame = requestAnimationFrame(tick);
  }
  function start() {
    if (disposed || frame || document.hidden || isReduced || progress === target) return;
    if (Math.abs(target - progress) <= settleEpsilon) { progress = target; render(); return; }
    lastTime = 0;
    frame = requestAnimationFrame(tick);
  }
  const updateScroll = () => { const rect = root.getBoundingClientRect(); target = Math.max(0, Math.min(1, -rect.top / Math.max(1, root.offsetHeight - stage.offsetHeight))); start(); };
  const resize = () => { const width = stage.clientWidth, height = stage.clientHeight; renderer.setSize(width, height); camera.aspect = width / Math.max(1, height); camera.fov = width < 600 ? 68 : 55; camera.updateProjectionMatrix(); updateScroll(); render(); };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { updateScroll(); start(); } };
  const observer = new ResizeObserver(resize); observer.observe(stage);
  window.addEventListener('scroll', updateScroll, { passive: true }); document.addEventListener('visibilitychange', visibility);
  root.classList.toggle('passage-static', isReduced);
  resize();
  return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', updateScroll); document.removeEventListener('visibilitychange', visibility); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); arcade.dispose(); renderer.dispose(); renderer.forceContextLoss(); root.remove(); };
}

