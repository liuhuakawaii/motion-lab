export function layerBounds(viewportHeight: number, travel: number) {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0 || !Number.isFinite(travel) || travel < 0) {
    throw new RangeError('Layer dimensions require a positive viewport and non-negative finite travel.');
  }
  return { top: -travel, height: viewportHeight + travel * 2 };
}
