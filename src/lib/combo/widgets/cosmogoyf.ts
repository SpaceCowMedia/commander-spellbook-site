import { addMana, formatMana, parseMana } from 'lib/symbols/mana';
import { formatNumber } from './shared/format';
import { HIGHEST_LIFE, LIBRARY, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const EXILED = numberInput('exiled', 'Cards you own in exile', 0);
const EXILED_EACH_TIME = 10;
const JARAD = parseMana('{1}{B}{G}')!;

/* Arc-Slogger exiles ten cards a time while there are ten to exile, and each one is a point of
   Cosmogoyf's power: as many times as the opponent with the most life needs. */
export function arcSloggerActivations(library: number, exiled: number, highestLife: number): number {
  const needed = Math.max(0, Math.ceil((highestLife - exiled) / EXILED_EACH_TIME));
  return Math.min(needed, Math.floor(library / EXILED_EACH_TIME));
}

export const cosmogoyf = defineWidget('cosmogoyf', {
  detect: (variant) => has(variant, 'Cosmogoyf', 'Jarad, Golgari Lich Lord', 'Arc-Slogger') && {},
  calculator: () => ({
    category: 'lethal',
    title: 'How much {R} does Cosmogoyf need?',
    summary:
      "Each {R} makes Arc-Slogger exile the top ten cards of your library, ten more power for Cosmogoyf, and Jarad sacrifices it to make each opponent lose that much life. Arc-Slogger's 2 damage each time is on top.",
    inputs: [LIBRARY, EXILED, HIGHEST_LIFE],
    compute(values) {
      const { library, exiled, highestLife } = values.numbers;
      const activations = arcSloggerActivations(library, exiled, highestLife);
      const power = exiled + EXILED_EACH_TIME * activations;
      const mana = addMana(JARAD, { generic: 0, pips: activations > 0 ? { R: activations } : {} });
      return {
        headline: { label: 'Mana needed', value: formatMana(mana), mana },
        verdict:
          power >= highestLife
            ? { tone: 'good', title: 'Every opponent dies' }
            : {
                tone: 'bad',
                title: `${formatNumber(highestLife - power)} life short`,
                detail: 'Your library runs out of cards to exile.',
              },
        stats: [{ label: "Cosmogoyf's power", value: formatNumber(power) }],
      };
    },
  }),
});
