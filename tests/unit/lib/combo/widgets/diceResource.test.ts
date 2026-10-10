import { expect, test } from 'vitest';
import { diceResource } from 'lib/combo/widgets/diceResource';
import { fakeVariant } from './testing/fakeVariant';
import { calculatorFor, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

test('reads the die, what it makes and what spends it', () => {
  expect(specFor(diceResource, '778-3750')).toMatchObject({ die: 20, resource: 'Treasure' });
});

test('names what each time around gets you, when the steps say', () => {
  expect(specFor(diceResource, '778-3750').iteration).toBe('combat phase');
  const calculator = calculatorFor(diceResource, '778-3750');
  const result = run(calculator);
  expect(calculator.inputs[1].label).toBe('Extra combat phases you need');
  expect(calculator.summary).toMatch(/^Each combat phase rolls a d20/);
  expect(result.stats?.[1].label).toBe('Each combat phase');
  expect(result.charts?.[0]).toMatchObject({
    title: 'Chance of at least this many extra combat phases',
    xLabel: 'Extra combat phases',
  });
  expect(run(calculator, { numbers: { target: 1 } }).headline.label).toBe('Chance of 1 extra combat phase');
  const untapper = diceResource.detect(
    fakeVariant({
      description: [
        'Roll a d6 and create that many Treasure tokens.',
        'Activate Staff of Domination by paying {1}, untapping it.',
      ],
    }),
  );
  expect(untapper).toMatchObject({ iteration: 'iteration' });
});

test('gives the chance of going on, and of never stopping', () => {
  const calculator = calculatorFor(diceResource, '778-3750');
  const result = run(calculator, { numbers: { start: 0, target: 5 } });
  expect(result.headline.label).toBe('Chance of 5 extra combat phases');
  const never = Number(result.stats?.[0].value.replace(/[<>%]/g, ''));
  const five = Number(result.headline.value.replace(/[<>%]/g, ''));
  expect(never).toBeLessThanOrEqual(five);
  expect(run(calculator, { numbers: { start: 1_000_000_000, target: 1_000_000_000 } }).headline.value).toBe('100%');
  expectSaneAtExtremes(calculator);
});

test('shows the decimals the chances differ in', () => {
  const calculator = calculatorFor(diceResource, '778-3750');
  const labels = (target: number) => {
    const result = run(calculator, { numbers: { start: 0, target } });
    const chart = result.charts?.[0];
    return {
      headline: result.headline.value,
      never: result.stats?.[0].value,
      dots: chart?.kind === 'dots' ? chart.dots.map((dot) => dot.label) : [],
    };
  };
  expect(labels(4)).toEqual({
    headline: '76.466%',
    never: '76.237%',
    dots: [
      '1: 80%',
      '2: 77.5%',
      '3: 76.75%',
      '4: 76.466%',
      '5: 76.345%',
      '6: 76.289%',
      '7: 76.263%',
      '8: 76.25%',
      '9: 76.244%',
      '10: 76.24%',
    ],
  });
  expect(labels(15)).toMatchObject({ headline: '76.2368%', never: '76.2366%' });
  expect(labels(1_000_000_000)).toMatchObject({ headline: '76.2366%', never: '76.2366%' });
});

test('keeps to whole percents where the chances are estimates', () => {
  const falling = diceResource.calculator({
    die: 6,
    resource: 'Treasure',
    spender: 'the loop',
    cost: '{4}',
    iteration: 'iteration',
  });
  const result = run(falling, { numbers: { start: 100_000, target: 60_000 } });
  const chart = result.charts?.[0];
  expect(result.headline.value).toMatch(/^[<>]?\d+(\.\d)?%$/);
  expect(chart?.kind === 'dots' && chart.dots.every((dot) => /: [<>]?\d+(\.\d)?%$/.test(dot.label))).toBe(true);
});
