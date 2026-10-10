import { expect, test } from 'vitest';
import { logNormalCdf, normalCdf } from 'lib/combo/widgets/shared/probability';

test('the normal distribution, also deep in its tail', () => {
  expect(normalCdf(0)).toBeCloseTo(0.5, 7);
  expect(normalCdf(1.959964)).toBeCloseTo(0.975, 6);
  expect(normalCdf(-3)).toBeCloseTo(0.0013499, 6);
  expect(logNormalCdf(-40)).toBeCloseTo(-804.608, 2);
});
