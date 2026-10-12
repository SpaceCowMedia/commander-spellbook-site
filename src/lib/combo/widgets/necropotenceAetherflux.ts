import type { Verdict } from './shared/calculator';
import { chanceTone, formatSwept, sweep, sweptDots } from './shared/charts';
import { formatNumber, formatPercent, plural } from './shared/format';
import { LIBRARY, LIFE, STORM, numberInput } from './shared/inputs';
import { Dig, deathChances, lifeAtTheEnd } from './shared/lifeDig';
import { defineWidget } from './shared/widget';
import { has, usesAny } from './parse/variant';

/* Cards that let you play the top card of your library, paying life equal to a spell's mana value, and
   when they do */
const ENGINES: Record<string, string> = {
  'Gwenom, Remorseless': 'Once Gwenom has attacked, it',
  "Bolas's Citadel": "Bolas's Citadel",
};
const RESERVOIR_COST = 50;

const LANDS = numberInput('lands', 'Lands in your library', 22, {
  hint: "Count spells you can't cast, like ones without a legal target, too",
});
const MANA_VALUE = numberInput('manaValue', 'Average mana value of your spells', 3, { max: 16, step: 0.1 });
const STARTING = { ...LIFE, initial: 20 };
const LAND_DROPS = numberInput('landDrops', 'Land drops left this turn', 0, {
  hint: 'A land on top is played instead of exiled',
});

export const necropotenceAetherflux = defineWidget('necropotence-aetherflux', {
  detect(variant) {
    const engine = usesAny(variant, Object.keys(ENGINES));
    return engine && has(variant, 'Necropotence', 'Aetherflux Reservoir') && { engine: ENGINES[engine] };
  },
  calculator: ({ engine }) => ({
    category: 'storm-life',
    title: 'How much life is left at the end of your library?',
    summary: `${engine} lets you play the top card of your library, paying life equal to a spell's mana value, while Necropotence exiles anything else for 1 life and Aetherflux Reservoir gains 1 life for each spell cast this turn. Your spells' mana values spread around their average like a Poisson curve, and each card is played the way that gives the best odds of living through the library.`,
    inputs: [LIBRARY, LANDS, MANA_VALUE, STARTING, STORM, LAND_DROPS],
    compute(values) {
      const { library, manaValue, life, storm, landDrops } = values.numbers;
      const lands = Math.min(values.numbers.lands, library);
      const dig: Dig = { cards: library, lands, manaValue, life, storm, freeLands: landDrops };
      const end = Math.max(0, Math.round(lifeAtTheEnd(dig)));
      const lives = sweep(STARTING, life);
      const deaths = deathChances(dig, [life, lives[0] - 1, ...lives, lives[lives.length - 1] + 1]);
      const died = deaths.get(life)!;
      return {
        headline: {
          label: 'Life at the end of your library',
          value: formatNumber(end),
          caption: died > 0 ? 'on average, if you live through it' : 'on average',
        },
        verdict: firing(end),
        stats: [{ label: 'Chance you run out of life on the way', value: formatPercent(died) }],
        charts: [
          {
            title: 'Life at the end by lands in your library',
            xLabel: 'Lands in your library',
            selects: LANDS.key,
            steadyFrom: library,
            ...sweptDots(
              LANDS,
              lands,
              (count) => {
                const left = Math.max(0, Math.round(lifeAtTheEnd({ ...dig, lands: count })));
                return { y: left, label: `${formatSwept(count, library)} lands: ${formatNumber(left)} life` };
              },
              library,
            ),
          },
          {
            title: 'Chance you run out of life by your life total',
            xLabel: 'Your life total',
            percent: true,
            selects: STARTING.key,
            ...sweptDots(STARTING, life, (x) => {
              const chance = deaths.get(x)!;
              return {
                y: chance * 100,
                label: `${formatNumber(x)} life: ${formatPercent(chance)}`,
                tone: chanceTone(1 - chance),
              };
            }),
          },
        ],
      };
    },
  }),
});

/* How many times the life at the end fires Aetherflux Reservoir, each leaving at least 1 life, and what
   is left after */
function firing(life: number): Verdict {
  if (life < 1) {
    return { tone: 'bad', title: 'You run out of life before the end of your library' };
  }
  const times = Math.floor((life - 1) / RESERVOIR_COST);
  const left = life - times * RESERVOIR_COST;
  const detail = Number.isSafeInteger(life) ? `That leaves you at ${formatNumber(left)} life.` : undefined;
  return times > 0
    ? {
        tone: 'neutral',
        title: `Enough to fire Aetherflux Reservoir ${plural(times, 'time')}`,
        ...(detail && { detail }),
      }
    : {
        tone: 'neutral',
        title: 'Not enough to fire Aetherflux Reservoir',
        detail: `It takes ${RESERVOIR_COST + 1} life.`,
      };
}
