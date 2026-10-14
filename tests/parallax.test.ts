import test from 'node:test';
import assert from 'node:assert/strict';
import { layerBounds } from '../src/demos/strata/geometry.ts';

test('the moving layer covers the entire viewport at both scroll extremes', () => {
  for (const height of [320, 720, 844, 1200]) {
    for (const travel of [0, height * .15, height * .35]) {
      const bounds = layerBounds(height, travel);
      for (const movement of [-travel, 0, travel]) {
        assert.ok(bounds.top + movement <= 0);
        assert.ok(bounds.top + bounds.height + movement >= height);
      }
    }
  }
});

test('invalid geometry is rejected rather than producing broken CSS', () => {
  for (const [height, travel] of [[0,10],[-1,10],[720,-1],[NaN,10],[720,Infinity]]) {
    assert.throws(() => layerBounds(height,travel), RangeError);
  }
});
