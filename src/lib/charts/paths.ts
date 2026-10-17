export interface Point {
  x: number;
  y: number;
}

const round = (value: number) => Number(value.toFixed(2));
const spot = ({ x, y }: Point) => `${round(x)} ${round(y)}`;

/* The SVG path of a line through the points, in the order given. */
export function linePath(points: Point[]): string {
  return points.length > 0 ? `M${points.map(spot).join(' L')}` : '';
}

/* The same line closed down to the baseline, to shade what lies under it. */
export function areaPath(points: Point[], baseline: number): string {
  if (points.length < 2) {
    return '';
  }
  const ends = [points[points.length - 1], points[0]].map(({ x }) => spot({ x, y: baseline }));
  return `${linePath(points)} L${ends.join(' L')} Z`;
}
