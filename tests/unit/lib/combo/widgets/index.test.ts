import { describe, expect, test } from 'vitest';
import {
  WIDGETS,
  WidgetId,
  WidgetSpec,
  calculatorFor,
  detectWidget,
  hasNothingToChange,
} from 'lib/combo/widgets/index';
import { valuesFor } from 'lib/combo/widgets/shared/values';
import { fakeVariant, fixtureVariant } from './testing/fakeVariant';
import fixtures from './testing/variants.json';

const EXAMPLES: Record<WidgetId, keyof typeof fixtures> = {
  'storm-life-loop': '2903-3260-4740',
  'drain-loop': '328-1377-2292-3211-3260-4078',
  krenko: '38-659-1288',
  'mayaels-aria-doubling': '3858-6864',
  'maddening-cacophony': '5069-5080',
  'angel-of-destiny-combats': '2481-2790',
  'angel-of-destiny-myriad': '2790-4836-5361',
  'ojer-axonil': '2868-4629',
  cosmogoyf: '182-6907-6908',
  'dice-resource': '778-3750',
  repercussion: '2484-4083',
  'dragon-tempest': '2855-5982',
  'devastating-onslaught-terror': '1110-6785',
  'devastating-onslaught-scourge': '2676-6785',
  dragonhawk: '1744-2719-6567',
  'token-growth': '851-4365-7858',
  'scepter-turns': '1870-3609-4153',
  'sage-of-hours': '648-1494-6730',
  'time-sieve': '1558-4711',
  animar: '2-3771',
  'mana-echoes': '2440-6873',
  'simulacrum-synthesizer': '2043-4659-5747',
  'stormsplitter-sacrifice': '2871-4050-5851',
  'stormsplitter-tapping': '204-3940-5851',
  'aatchik-loop': '215-4050-6251',
  'siegebreaker-face-breaker': '2815-3750-6473',
  nadier: '3035-3519',
  'gray-merchant-devotion': '328-791-1494-2334',
  'mana-formula': '2024-7308',
};

describe('the registry', () => {
  test('has one widget per id', () => {
    const ids = WIDGETS.map((widget) => widget.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(EXAMPLES).sort()).toEqual([...ids].sort());
  });

  test.each(Object.entries(EXAMPLES))('recognizes %s in a real combo', (id, example) => {
    const spec = detectWidget(fixtureVariant(example));
    expect(spec?.widget).toBe(id);
    expect(calculatorFor(spec!).title).toBeTruthy();
  });

  test('skips a widget whose every input is pinned where the answer stops changing', () => {
    const pinned = fixtureVariant('1283-1537-2440-4183');
    const spec = WIDGETS.find((widget) => widget.id === 'mana-echoes')!.detect(pinned);
    expect(spec).toBeTruthy();
    expect(hasNothingToChange(calculatorFor({ ...spec, widget: 'mana-echoes' } as WidgetSpec))).toBe(true);
    expect(detectWidget(pinned)).toBeNull();
    expect(detectWidget(fixtureVariant('2440-6873'))?.widget).toBe('mana-echoes');
    expect(detectWidget(fixtureVariant('1170-1812-2440-7528'))?.widget).toBe('mana-echoes');
  });

  test('leaves a yes or no that hangs on a single number to the combo itself', () => {
    const asking = (Object.keys(fixtures) as (keyof typeof fixtures)[]).filter((id) => {
      const spec = detectWidget(fixtureVariant(id));
      const calculator = spec && calculatorFor(spec);
      return (
        calculator &&
        !calculator.opponents &&
        calculator.inputs.length === 1 &&
        calculator.inputs[0].kind === 'number' &&
        calculator.compute(valuesFor(calculator)).verdict !== undefined
      );
    });
    expect(asking).toEqual([]);
  });

  test('routes a spec to its widget by id alone', () => {
    const calculator = calculatorFor({ widget: 'repercussion' });
    expect(calculator.title).toBe('Who dies to Blasphemous Act?');
  });

  test('lets the earlier widget win when two would recognize a combo', () => {
    const both = fakeVariant({
      uses: ['Blasphemous Act', 'Repercussion', 'Dragon Tempest', 'Ancient Gold Dragon'],
    });
    expect(detectWidget(both)?.widget).toBe('repercussion');
  });
});
