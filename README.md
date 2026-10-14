# Motion Lab

网页动效实验室。收集具有空间、材质和叙事感的原创交互作品，使用 Vite、原生 TypeScript、GSAP 和 Three.js。

## 本地运行

推荐 Node.js 24，使用项目声明的 pnpm 10.18.3。

```sh
pnpm install
pnpm dev
```

首页提供分类目录，每个作品可以通过独立地址直接访问或刷新：

| 地址 | 作品 | 交互 |
| --- | --- | --- |
| `/demos/strata/` | Strata · 地貌之间 | 多层图形、差速视差、滚动章节 |
| `/demos/ink/` | Liquid Memory · 液态记忆 | 指针/触摸绘制、反馈纹理、衰减与折射 |
| `/demos/passage/` | Passage · 空间漫游 | Three.js 建筑与雕塑、滚动镜头 |
| `/demos/fold/` | Paper, Space · 折叠的秩序 | CSS 3D 连续折面、滚动展开 |
| `/demos/svg-scroll/` | 原作 · SVG 沿路径滚动 | 滚动曲线、图标转向与缩放 |
| `/demos/mouse-reveal/` | 原作 · 鼠标擦除 | 人像图片擦除、渐隐轨迹 |

新增作品在系统开启“减少动态效果”时，滚动作品提供静态构图，避免强制长距离运动；液态作品保留主动输入交互，无自动播放。WebGL 不可用时，WebGL 作品显示可读的降级内容。

## 目录与新增作品

```text
src/app/        # 目录、路由组合、站点外壳
src/demos/      # 原创作品；每件作品独立负责视觉、交互和清理
src/templates/  # 原有作品，第 2、6 个纳入构建；其余保留参考
src/shadertest/ # 旧 Shader 学习文件，不纳入默认构建
public/         # 仅可公开发布的全站静态资源
tests/          # 行为/构建边界检查
```

新增 `src/demos/<slug>/index.ts`，导出 `mount(container: HTMLElement, { reducedMotion }: { reducedMotion: boolean }): () => void`，在 `src/app/catalog.ts` 注册元数据和动态导入；目录预览图在 `src/app/artwork.ts` 添加。根应用统一解析系统和工具栏的动态效果偏好，作品遵循传入的布尔值；偏好变化时由根应用销毁并重新挂载作品。样式限定在作品自己的 class 下。返回函数必须移除监听器、动画、观察器和 GPU 资源。不要在目录页同时运行所有作品。

渲染循环按时间增量推进，限制像素比和离屏纹理尺寸；隐藏标签页暂停绘制。动画优先使用 transform / opacity。图层移动必须留足覆盖范围，尺寸变化时重新测量。不能用高频 React 状态或持续创建 tween 驱动逐帧动画。

## 检查

```sh
pnpm typecheck
pnpm build
pnpm test
pnpm preview
pnpm cf:check
```

`pnpm test` 中包含构建产物检查，因此先运行 `pnpm build`。构建边界测试确保第 2、6 个原作及其素材完整发布，其余参考素材不被发布，入口存在且不依赖运行时 CDN。视觉验收还需检查桌面、移动端、正向/反向滚动、快速输入、窗口调整、后台恢复及减少动态效果模式。

## Cloudflare

已配置 Workers Static Assets，使用 `dist/` 发布，SPA fallback 支持作品地址直接访问。首次发布：

```sh
pnpm exec wrangler login
pnpm deploy
```

`pnpm cf:check` 只构建并 dry-run，不发布。实际发布使用当前 Wrangler 登录的账号，默认 Worker 名为 `motion-lab`，可在 `wrangler.jsonc` 修改。绑定自定义域名在 Cloudflare Worker 的 Domains & Routes 中完成。仓库名、Worker 名和本地文件夹名互不依赖。

若使用 Cloudflare Git 构建，设置构建命令 `pnpm build`，部署命令 `pnpm exec wrangler deploy`。不要上传整个仓库作为静态资源目录。

## 商用范围

新站 `src/app`、`src/demos` 内的原创代码及程序化图形按仓库 [ISC License](LICENSE) 提供，可用于商业项目，复制或分发时保留许可声明。新增四件作品没有复用旧示例的人像、插画、品牌 logo、外部模型或网络字体。恢复的原作保留原素材，不归入新增作品的商用授权。

依赖保留各自许可：Three.js 使用 MIT；GSAP 使用其标准许可证，允许普通网站和应用的商业使用，但对与 Webflow 竞争的可视化动画构建工具有特定限制。见 [Three.js LICENSE](https://github.com/mrdoob/three.js/blob/dev/LICENSE)、[GSAP Standard License](https://gsap.com/community/standard-license/)。

旧 `src/templates`、`src/shadertest` **不属于本次原创作品授权范围**。其中第 4 个模板的 README 明确标注“禁止商用”，其他素材也不能仅凭根目录 `package.json` 的 ISC 字段推定授权。第 2、6 个按用户要求接回展示目录，其余保留用于参考、不进入构建。原有素材仍需按原许可使用。

技术参考：[Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)。

构建脚本从已安装依赖提取版权声明，生成 `dist/THIRD_PARTY_NOTICES.txt`，并复制本站许可为 `dist/LICENSE.txt`。复制或分发作品时一并保留这些文件。

## 原作路由

`src/app/catalog.ts` 中的 `framePath` 注册原作独立 HTML 地址，根应用提供统一返回与下一件导航。`vite.config.ts` 显式列出要发布的 HTML 入口，Vite 打包其脚本和图片。原作在 iframe 内运行，避免原有全局样式、滚动监听与新站相互干扰；退出页面时浏览器销毁该文档。原作不显示尚未接入的减少动态开关。新增原作入口时同时补充构建白名单和素材许可说明。
