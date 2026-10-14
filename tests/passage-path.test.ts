import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraPose, dampProgress } from '../src/demos/passage/path.ts';
test('camera stays inside the passage and looks ahead for the complete scroll range', () => {
  let previousZ = Infinity;
  for (let i = 0; i <= 1000; i++) {
    const pose = cameraPose(i / 1000);
    assert.ok(Math.abs(pose.x) < 1.2);
    assert.ok(pose.y > 1 && pose.y < 3);
    assert.ok(pose.targetZ < pose.z - 4);
    assert.ok(pose.z <= previousZ);
    previousZ = pose.z;
  }
  assert.deepEqual(cameraPose(-1), cameraPose(0));
  assert.deepEqual(cameraPose(2), cameraPose(1));
});
test('damping is independent of frame subdivision and does not overshoot', () => {
  const once = dampProgress(0, 1, 1 / 30);
  const twice = dampProgress(dampProgress(0, 1, 1 / 60), 1, 1 / 60);
  assert.ok(Math.abs(once - twice) < 1e-12);
  assert.ok(once > 0 && once < 1);
  assert.equal(dampProgress(.4, 1, 0), .4);
});
