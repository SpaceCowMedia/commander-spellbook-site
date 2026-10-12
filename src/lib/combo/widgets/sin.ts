import type { Dot } from './shared/calculator';
import { stepDots, stepPage } from './shared/charts';
import { formatNumber } from './shared/format';
import { castsInput, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { NUMBER, has, statedNumber, usesAny } from './parse/variant';

const CASTS = castsInput('Sin');
/* Sin costs {5}{G}{U} */
const COST = 7;
const LOOPS = 4;
/* steps on a page of the chart: casting Sin, untapping Kami if it costs anything, the altar and Kami */
const pageOf = (untap: number) => LOOPS * (untap > 0 ? 4 : 3);

/* Sin enters with twice the counters it removes, plus one from Kami of Whispered Hopes, and dying puts
   them on Kami, plus one again: Kami taps for 1 + 2c + 2 and keeps 2c + 2 counters for the next Sin.
   Phyrexian Altar adds one mana for the other color. So the first recast is the hardest to pay for:
   from then on the counters double. */
export const countersNeeded = (casts: number, untap: number) => Math.ceil((COST - 2 + 2 * casts + untap) / 2);

/* Your mana for the first `steps` steps: down to cast Sin and untap Kami, up as Sin is sacrificed and
   Kami taps, to the cast you can't pay for. */
export function stepByStep(counters: number, casts: number, untap: number, steps = 1 + pageOf(untap)): Dot[] {
  const { dots, add } = stepDots();
  let c = counters;
  let mana = COST + 2 * casts + untap;
  add(mana, `To start: {${formatNumber(mana)}}`);
  for (let n = 0; dots.length < steps; n++) {
    const cost = COST + 2 * (casts + n);
    if (mana < cost + untap) {
      dots[dots.length - 1] = {
        ...dots[dots.length - 1],
        label: `${dots[dots.length - 1].label}, too little to cast Sin again`,
        tone: 'bad',
      };
      return dots;
    }
    mana -= cost;
    add(
      mana,
      `Cast Sin for {${formatNumber(cost - 2)}}{G}{U}, it enters with ${formatNumber(2 * c + 1)} counters: {${formatNumber(mana)}} left`,
    );
    if (untap > 0) {
      mana -= untap;
      add(mana, `Untap Kami of Whispered Hopes for {${formatNumber(untap)}}: {${formatNumber(mana)}} left`);
    }
    mana += 1;
    add(mana, `Sacrifice Sin to Phyrexian Altar: {${formatNumber(mana)}}`);
    const tap = 2 * c + 3;
    mana += tap;
    add(mana, `Kami taps for ${formatNumber(tap)}: {${formatNumber(mana)}}`);
    c = 2 * c + 2;
  }
  return dots.slice(0, steps);
}

export const sin = defineWidget('sin', {
  detect(variant) {
    const untapper = usesAny(variant, ['Intruder Alarm', 'Aura of Dominion']);
    return (
      has(variant, 'Sin, Unending Cataclysm', 'Kami of Whispered Hopes', 'Phyrexian Altar') &&
      untapper && {
        untap: untapper === 'Aura of Dominion' ? 1 : 0,
        stated: statedNumber(variant, new RegExp(`where X is ${NUMBER} plus the number of times`, 'i')),
      }
    );
  },
  calculator({ untap, stated }) {
    const counters = numberInput(
      'counters',
      'Counters on your artifacts, creatures and enchantments',
      stated ?? countersNeeded(0, untap),
    );
    return {
      category: 'commander-tax',
      title: 'Does the Sin loop grow?',
      summary: `Sin enters with twice the counters it removes, and Kami of Whispered Hopes adds one more each time counters go on Sin and back on Kami. Kami then taps for its power, which with Phyrexian Altar's mana pays for the next Sin, {2} dearer every time${untap > 0 ? ', and for the {1} that untaps Kami' : ''}. The counters double every loop.`,
      inputs: [counters, CASTS],
      compute(values) {
        const now = values.numbers.counters;
        const { casts } = values.numbers;
        const needed = countersNeeded(casts, untap);
        return {
          headline: {
            label: 'Counters needed',
            value: formatNumber(needed),
            caption: `with {${formatNumber(2 * casts)}} commander tax`,
          },
          verdict:
            now >= needed
              ? { tone: 'good', title: 'The loop grows every time', detail: 'The counters double each loop.' }
              : { tone: 'bad', title: 'The loop stops in loop 2', detail: 'Kami makes too little to cast Sin again.' },
          meter: { have: now, need: needed, unit: 'counters' },
          charts: [
            {
              title: 'Your mana, step by step',
              xLabel: 'Step',
              ...stepPage((steps) => stepByStep(now, casts, untap, steps), values.page ?? 0, pageOf(untap)),
            },
          ],
        };
      },
    };
  },
});
