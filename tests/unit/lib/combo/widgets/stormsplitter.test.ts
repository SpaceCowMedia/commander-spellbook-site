import { expect, test } from 'vitest';
import { formatMana, parseMana } from 'lib/symbols/mana';
import { payWith } from 'lib/combo/widgets/stormsplitter';
import { sacrificeStarts, stormsplitterSacrifice } from 'lib/combo/widgets/stormsplitterSacrifice';
import { stormsplitterTapping, tappingStart, tappingSteadyFrom } from 'lib/combo/widgets/stormsplitterTapping';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

const SEETHING_ANGER = parseMana('{3}{R}')!;
const SPROUT_SWARM = parseMana('{4}{G}')!;

test('pays the pips with the sources that make any color first', () => {
  expect(payWith(SPROUT_SWARM, 1, 2)).toEqual({ own: { generic: 2, pips: {} }, anyUsed: 1, genericUsed: 2 });
  expect(payWith(SPROUT_SWARM, 0, 1).own).toEqual({ generic: 3, pips: { G: 1 } });
  expect(payWith(parseMana('{1}{R}')!, 5, 0)).toEqual({ own: { generic: 0, pips: {} }, anyUsed: 2, genericUsed: 0 });
});

test('sacrifices copies only once there are twice the cost of them', () => {
  const { start, steadyFrom } = sacrificeStarts(SEETHING_ANGER);
  expect(formatMana(start(1).mana)).toBe('{9}{R}{R}{R}');
  expect(start(1).casts).toBe(3);
  expect(formatMana(start(6).mana)).toBe('{2}');
  expect(formatMana(start(7).mana)).toBe('{1}');
  expect(start(8).casts).toBe(0);
  expect(steadyFrom).toBe(8);
});

test('reads the buyback spell from the steps', () => {
  expect(specFor(stormsplitterSacrifice, '2609-4050-5851')).toEqual({
    widget: 'stormsplitter-sacrifice',
    cost: '{3}{W}',
  });
  expect(run(calculatorFor(stormsplitterSacrifice, '2871-4050-5851')).headline.value).toBe('{9}{R}{R}{R}');
  expectSaneAtExtremes(calculatorFor(stormsplitterSacrifice, '2871-4050-5851'));
});

test('taps the copies, and with Sprout Swarm its Saprolings pay the {G}', () => {
  expect(formatMana(tappingStart(SEETHING_ANGER, 1, 0, false).mana)).toBe('{8}');
  expect(formatMana(tappingStart(SPROUT_SWARM, 1, 0, true).mana)).toBe('{8}{G}');
  expect(formatMana(tappingStart(SPROUT_SWARM, 1, 4, true).mana)).toBe('{4}{G}');
  expect(formatMana(tappingStart(SPROUT_SWARM, 8, 0, true).mana)).toBe('{G}');
  expect(run(calculatorFor(stormsplitterTapping, '204-3940-5851')).headline.value).toBe('{8}');
  expect(run(calculatorFor(stormsplitterTapping, '3209-5851')).headline.value).toBe('{8}{G}');
  expectSaneAtExtremes(calculatorFor(stormsplitterTapping, '3209-5851'));
});

test('stops at the Stormsplitters from which the start no longer changes', () => {
  expectSteadyFrom(calculatorFor(stormsplitterSacrifice, '2871-4050-5851'), 'stormsplitters', 8);
  expectSteadyFrom(calculatorFor(stormsplitterTapping, '204-3940-5851'), 'stormsplitters', 4);
  expectSteadyFrom(calculatorFor(stormsplitterTapping, '3209-5851'), 'stormsplitters', 4);
  expectSteadyFrom(calculatorFor(stormsplitterTapping, '3209-5851'), 'stormsplitters', 1, { numbers: { others: 9 } });
  for (const [cost, saprolings] of [
    [SEETHING_ANGER, false],
    [SPROUT_SWARM, true],
    [parseMana('{2}{G}{G}')!, true],
  ] as const) {
    for (let others = 0; others < 12; others++) {
      const answer = (stormsplitters: number) => {
        const { mana, casts } = tappingStart(cost, stormsplitters, others, saprolings);
        return `${formatMana(mana)} ${casts}`;
      };
      const steady = tappingSteadyFrom(cost, others, saprolings);
      for (let stormsplitters = steady; stormsplitters < steady + 40; stormsplitters++) {
        expect(answer(stormsplitters)).toBe(answer(steady));
      }
      if (steady > 1) {
        expect(answer(steady - 1)).not.toBe(answer(steady));
      }
    }
  }
});
