export function cameraPose(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const z = 14 - p * 40;
  return { x: Math.sin(p * Math.PI * 2) * .8, y: 2.25 + Math.sin(p * Math.PI) * .2, z, targetX: Math.sin(p * Math.PI * 2 + .4) * .45, targetY: 2.3, targetZ: z - 11 };
}
export function dampProgress(current: number, target: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-7 * Math.max(0, delta)));
}
