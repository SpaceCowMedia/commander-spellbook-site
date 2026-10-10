import { expect, test } from 'vitest';
import { totalDamage } from 'lib/combo/widgets/shared/damage';

test('adds up triggers that go wherever you like', () => {
  expect(totalDamage(42, 3)).toEqual({ label: 'Total damage', value: '126', caption: '42 triggers of 3' });
  expect(totalDamage(1, 5).caption).toBe('1 trigger of 5');
});
