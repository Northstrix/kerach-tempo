// From https://easings.net/
export const easingFunctions = {
  linear: (x: number): number => x,
  easeInQuad: (x: number): number => x * x,
  easeOutQuad: (x: number): number => 1 - (1 - x) * (1 - x),
  easeInOutQuad: (x: number): number => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
};
