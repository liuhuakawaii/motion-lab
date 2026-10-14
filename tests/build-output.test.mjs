import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

test('publishable build includes selected originals and excludes unselected reference assets', () => {
  assert.ok(existsSync('dist/index.html'), 'Run pnpm build: a deployable entry must exist');
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<title>Motion Lab/);
  const notices = readFileSync('dist/THIRD_PARTY_NOTICES.txt', 'utf8');
  assert.ok(notices.includes(readFileSync('node_modules/three/LICENSE', 'utf8').trim()), 'The complete Three.js permission notice must ship');
  assert.match(notices, /Copyright 2008-2026, GreenSock/);
  assert.match(notices, /https:\/\/gsap.com\/standard-license/);
  assert.equal(readFileSync('dist/LICENSE.txt', 'utf8'), readFileSync('LICENSE', 'utf8'));
  assert.doesNotMatch(html, /(?:src|href)=["']https?:/);
  const files = readdirSync('dist', { recursive: true }).map(String);
  assert.ok(files.some(file => /\.js$/.test(file)), 'Executable demo modules are included');
  const originals = ['src/templates/2. 基础沿路径滚动/index.html', 'src/templates/6. threejs鼠标滑动擦除图片效果/index.html'];
  for (const entry of originals) {
    assert.ok(existsSync(path.join('dist', entry)), `Original demo must ship: ${entry}`);
  }
  assert.equal(files.some(file => /notion_calendar|Image\d+\.jpg|卡片穿梭|图片无限/.test(file)), false, 'Unselected reference assets must never ship');
  assert.ok(files.some(file => /portrait_top-.*\.jpg$/.test(file)), 'Original reveal top image must ship');
  assert.ok(files.some(file => /portrait_bottom-.*\.jpg$/.test(file)), 'Original reveal bottom image must ship');
  for (const file of files.filter(file => /\.(?:js|css|html)$/.test(file))) {
    const source = readFileSync(path.join('dist', file), 'utf8');
    assert.doesNotMatch(source, /(?:cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com)\//, 'Runtime dependencies must be bundled');
  }
});
