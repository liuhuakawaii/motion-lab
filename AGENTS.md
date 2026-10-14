# Motion Lab 工作约定

## 项目定位

本项目为原创 CSS、滚动叙事、Shader 和 Three.js 动效库。站点/包名为 motion-lab，本地目录名及 Git remote 不决定产品名称。面向用户的解释使用简体中文，含中文文件使用 UTF-8。

## 职责边界

- `src/app`：目录、元数据、动态导入、页面外壳。目录禁止同时启动所有 WebGL demo。
- `src/demos/<slug>`：每件作品自己的图形、输入、动画生命周期和样式。统一导出 `mount(container, { reducedMotion }): dispose`，作品遵循传入的布尔值。根应用统一解析系统和工具栏偏好，并在偏好变化时销毁、重新挂载作品。
- `src/templates`：原有作品。仅第 2 个 SVG 路径和第 6 个鼠标擦除通过 Vite 多页面入口打包、由目录路由以 iframe 承载，保留原作。其余模板与 `src/shadertest` 不纳入构建；不能将原作素材统一标为新增作品的商用授权。
- `public`：只放确定可发布的资源，不能当作旧素材目录。

## 验证与资产

命令和目录以 README、package.json 为准。先 `pnpm build`，再 `pnpm test`；Cloudflare 预演为 `pnpm cf:check`，该命令不等于已发布。只有用户明确要求线上发布时再部署。

新作品以原创程序化图形为主，新增外部素材须记录来源与许可。原始第 4 个卡片模板禁止商用，新站 ISC 许可不覆盖它。

视觉修改必须实际检查桌面和移动端、正反向滚动/输入、viewport resize、减少动态效果模式；WebGL 还需检查编译错误、背景暂停和资源清理。不要只用截图或成功构建宣称流畅。报告设备相关测量范围，不保证所有设备 60fps。

优先 transform / opacity，控制像素比和离屏纹理上限。避免同一视觉状态有多个所有者。每件作品必须返回完整 dispose。异步加载失败应给出可见错误并保留控制台信息。
