export type Category = 'all' | 'scroll' | 'shader' | 'three' | 'css';
interface DemoMetadata {
  id: string;
  number: string;
  title: string;
  chinese: string;
  description: string;
  tags: string[];
  categories: Category[];
  cue: string;
}
export type Demo = DemoMetadata & ({
  load: () => Promise<{ mount: (container: HTMLElement, options: { reducedMotion: boolean }) => () => void }>;
  framePath?: never;
} | {
  framePath: string;
  load?: never;
});
export const demos: Demo[] = [
  { id: 'strata', number: '01', title: 'Strata', chinese: '地貌之间', description: '穿过远山、沙丘与前景岩层。让滚动成为一段有纵深的旅程。', tags: ['PARALLAX', 'GSAP'], categories: ['scroll'], cue: '向下滚动 · 探索景深', load: () => import('../demos/strata/index') },
  { id: 'ink', number: '02', title: 'Liquid Memory', chinese: '液态记忆', description: '用指尖拨开表面，让另一幅画面从流动的折射与余波中浮现。', tags: ['SHADER', 'POINTER'], categories: ['shader', 'three'], cue: '移动或拖动指针 · 留下痕迹', load: () => import('../demos/ink/index') },
  { id: 'passage', number: '03', title: 'Passage', chinese: '空间漫游', description: '镜头穿行于建筑与雕塑之间，滚动重写光线、尺度与观看角度。', tags: ['THREE.JS', 'SCROLL'], categories: ['three', 'scroll'], cue: '向下滚动 · 穿行展廊', load: () => import('../demos/passage/index') },
  { id: 'fold', number: '04', title: 'Paper, Space', chinese: '折叠的秩序', description: '平面的印刷作品展开为空间。透视、折痕与错落节奏共同构成一面动态画廊。', tags: ['CSS 3D', 'SCROLL'], categories: ['css', 'scroll'], cue: '向下滚动 · 展开画廊', load: () => import('../demos/fold/index') },
  { id: 'svg-scroll', number: '05', title: 'SVG Path', chinese: '沿路径滚动', description: '原有作品。随页面滚动，图标沿 SVG 曲线前进、转向与缩放。', tags: ['原有作品', 'SVG', 'GSAP'], categories: ['scroll'], cue: '向下滚动 · 沿曲线前进', framePath: '/src/templates/2. 基础沿路径滚动/index.html' },
  { id: 'mouse-reveal', number: '06', title: 'Portrait Reveal', chinese: '鼠标擦除', description: '原有作品。划过人像表面，在渐隐的笔触中显露另一张图片。', tags: ['原有作品', 'SHADER'], categories: ['shader', 'three'], cue: '移动或拖动指针 · 擦除图片', framePath: '/src/templates/6. threejs鼠标滑动擦除图片效果/index.html' },
];
