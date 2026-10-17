import { expect, test } from 'vitest';
import { doublings, mayaelsAriaDoubling } from 'lib/combo/widgets/mayaelsAriaDoubling';
import { fakeVariant } from './testing/fakeVariant';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

test('counts doublings exactly', () => {
  for (let power = 1; power <= 64; power++) {
    let n = 0;
    while (power * 2 ** n < 20) {
      n++;
    }
    expect(doublings(power, 20)).toBe(n);
  }
  expect(doublings(1, 1_000_000_000)).toBe(30);
});

test('pays the activation once per doubling', () => {
  const calculator = calculatorFor(mayaelsAriaDoubling, '3858-6864');
  const result = run(calculator, { numbers: { power: 4 } });
  expect(result.stats).toContainEqual({ label: 'Activations', value: expect.any(String) });
  expect(result.headline.mana).toBeDefined();
  expectSaneAtExtremes(calculator);
});

test('needs nothing from the power the win asks for on', () => {
  expectSteadyFrom(calculatorFor(mayaelsAriaDoubling, '3858-6864'), 'power', 20);
});

test('aims for the most power the combo mentions', () => {
  const variant = fakeVariant({
    uses: ["Mayael's Aria", 'Junk Jet'],
    easyPrerequisites: 'Junk Jet attached to a creature with power 1 or greater.',
    description: [
      'Activate Junk Jet by paying {3}, doubling the power of the equipped creature.',
      'Repeat until the creature with Junk Jet attached has power 19 or greater.',
    ],
  });
  expect(mayaelsAriaDoubling.detect(variant)).toMatchObject({ target: 19 });
});
