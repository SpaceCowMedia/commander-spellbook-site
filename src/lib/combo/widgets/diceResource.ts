import { manaValue, parseMana } from 'lib/symbols/mana';
import { chanceTone, sweep, sweptDots } from './shared/charts';
import { decimalsToTellApart, formatNumber, formatPercent, plural } from './shared/format';
import { numberInput } from './shared/inputs';
import { walkSurvival } from './shared/randomWalk';
import { defineWidget } from './shared/widget';
import { MANA, findInSteps } from './parse/variant';

export const diceResource = defineWidget('dice-resource', {
  detect(variant) {
    const roll = findInSteps(variant, /\broll a d(\d+) and create that many (.+?) tokens?\b/i);
    const spender = roll && findInSteps(variant, new RegExp(`^activate (.+?) by paying ${MANA}`, 'i'));
    return (
      spender && {
        die: Number(roll[1]),
        resource: roll[2],
        spender: spender[1],
        cost: spender[2],
        /* what going around once more gets you */
        iteration: /\badditional combat\b/i.test(spender.input ?? '') ? 'combat phase' : 'iteration',
      }
    );
  },
  calculator({ die, resource, spender, cost, iteration }) {
    const price = manaValue(parseMana(cost) ?? { generic: 5, pips: {} });
    const walk = { low: 1 - price, high: die - price };
    const start = numberInput('start', `${resource}s or mana you have before the first roll`, 0);
    const target = numberInput('target', `Extra ${iteration}s you need`, 5, { min: 1 });
    return {
      category: 'chance',
      title: `Will the ${resource}s keep ${spender} going?`,
      summary: `Each ${iteration} rolls a d${die} for that many ${resource}s, and ${spender} costs ${cost}. ${resource}s you don't spend carry over, so one bad roll only ends the loop if the leftovers can't cover it.`,
      inputs: [start, target],
      compute(values) {
        const wanted = values.numbers.target;
        const swept = sweep(target, wanted);
        const last = Math.max(wanted, ...swept);
        const survival = walkSurvival(walk, values.numbers.start, last + 1);
        /* the decimals the dots shown differ in, where they are more than an estimate */
        const decimals = last <= survival.exactFor ? decimalsToTellApart(swept.map((n) => survival.at(n))) : 0;
        return {
          headline: {
            label: `Chance of ${plural(wanted, `extra ${iteration}`)}`,
            value: formatPercent(survival.at(wanted), decimals),
          },
          stats: [
            {
              label: 'Chance it never stops',
              value: formatPercent(survival.forever, Number.isFinite(survival.exactFor) ? 0 : decimals),
            },
            {
              label: `Each ${iteration}`,
              value: `${formatNumber((die + 1) / 2)} on average`,
              caption: `against ${cost}`,
            },
          ],
          charts: [
            {
              kind: 'dots',
              title: `Chance of at least this many extra ${iteration}s`,
              xLabel: `Extra ${iteration}s`,
              yLabel: 'Chance',
              percent: true,
              selects: target.key,
              ...sweptDots(target, wanted, (n) => {
                const chance = survival.at(n);
                return {
                  y: chance * 100,
                  label: `${formatNumber(n)}: ${formatPercent(chance, decimals)}`,
                  tone: chanceTone(chance),
                };
              }),
            },
          ],
        };
      },
    };
  },
});
