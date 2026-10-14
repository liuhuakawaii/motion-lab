import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: [
        'index.html',
        'src/templates/2. 基础沿路径滚动/index.html',
        'src/templates/6. threejs鼠标滑动擦除图片效果/index.html',
      ],
    },
  },
});
