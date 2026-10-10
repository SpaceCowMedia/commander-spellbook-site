import { formatMana, parseMana, scaleMana } from 'lib/symbols/mana';
import { formatSwept, sweptDots } from './shared/charts';
import { formatNumber } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { MANA, allText, findInSteps, has } from './parse/variant';

/* The doublings that take `power` to at least `target`. */
export function doublings(power: number, target: number): number {
  if (power >= target) {
    return 0;
  }
  let n = Math.max(1, Math.ceil(Math.log2(target / power)));
  while (n > 1 && power * 2 ** (n - 1) >= target) {
    n--;
  }
  while (power * 2 ** n < target) {
    n++;
  }
  return n;
}

export const mayaelsAriaDoubling = defineWidget('mayaels-aria-doubling', {
  detect(variant) {
    const activation =
      has(variant, "Mayael's Aria") &&
      findInSteps(
        variant,
        new RegExp(
          `^(?:holding priority, )?activate (.+?)(?:'s \\w+ ability)? by paying ${MANA}.*(?:doubl|\\+X/\\+X)`,
          'i',
        ),
      );
    /* the win needs the most power the text mentions; smaller ones are about other creatures */
    const target = Math.max(
      ...[...allText(variant).matchAll(/power (\d+) or greater/gi)].map((match) => Number(match[1])),
    );
    return activation && target > 0 && { creature: activation[1], activation: activation[2], target };
  },
  calculator({ creature, activation, target }) {
    const cost = parseMana(activation)!;
    const power = numberInput('power', `${creature}'s power`, 4, { min: 1 });
    return {
      category: 'stats',
      title: `How much mana ${creature} needs`,
      summary: `Each activation of ${creature} doubles its power. Mayael's Aria puts a +1/+1 counter on it first, so ${target} power is enough.`,
      inputs: [power],
      compute(values) {
        const n = doublings(values.numbers.power, target);
        const mana = scaleMana(cost, n);
        return {
          headline: { label: 'Mana needed', value: formatMana(mana), mana },
          stats: [
            { label: 'Activations', value: formatNumber(n) },
            ...(n > 0 ? [{ label: 'Power reached', value: formatNumber(values.numbers.power * 2 ** n) }] : []),
          ],
          charts: [
            {
              kind: 'dots',
              title: 'Activations by starting power',
              xLabel: 'Starting power',
              yLabel: 'Activations',
              selects: power.key,
              steadyFrom: target,
              ...sweptDots(
                power,
                values.numbers.power,
                (start) => ({
                  y: doublings(start, target),
                  label: `Power ${formatSwept(start, target)}: ${formatMana(scaleMana(cost, doublings(start, target)))}`,
                }),
                target,
              ),
            },
          ],
        };
      },
    };
  },
});
