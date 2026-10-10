import type { Variant } from '@space-cow-media/spellbook-client';
import { sweptDots } from './shared/charts';
import { totalDamage } from './shared/damage';
import { formatNumber } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const ONSLAUGHT_MANA = numberInput('mana', 'Mana you spend on Devastating Onslaught', 11, { min: 3 });

/* Devastating Onslaught costs {X}{X}{R} */
export const copiesFor = (mana: number) => Math.max(0, Math.floor((mana - 1) / 2));

function copies(variant: Variant, copied: string): boolean {
  return has(variant, 'Devastating Onslaught', copied);
}

interface Dragon {
  copied: string;
  summary: string;
  triggers(copies: number, otherDragons: number): { triggers: number; each: number };
  countsOtherDragons: boolean;
}

/* The X copies of a Dragon trigger off each other, for damage to any target. */
export function onslaughtWidget<Id extends string>(id: Id, dragon: Dragon, detect: (variant: Variant) => boolean) {
  const otherDragons = numberInput('dragons', 'Other Dragons you control', 0);
  return defineWidget(id, {
    detect: (variant) => copies(variant, dragon.copied) && detect(variant) && {},
    calculator: () => ({
      category: 'finite',
      title: 'How much damage Devastating Onslaught deals',
      summary: dragon.summary,
      inputs: [ONSLAUGHT_MANA, ...(dragon.countsOtherDragons ? [otherDragons] : [])],
      compute(values) {
        const mana = values.numbers.mana;
        const others = values.numbers.dragons ?? 0;
        const x = copiesFor(mana);
        const { triggers, each } = dragon.triggers(x, others);
        return {
          headline: totalDamage(triggers, each),
          stats: [{ label: 'X', value: formatNumber(x), caption: `{${x}}{${x}}{R}` }],
          charts: [
            {
              kind: 'dots',
              title: 'Damage by mana spent',
              xLabel: 'Mana',
              yLabel: 'Damage',
              selects: ONSLAUGHT_MANA.key,
              /* two mana at a time, one more X each */
              ...sweptDots(
                ONSLAUGHT_MANA,
                mana,
                (spent) => {
                  const hit = dragon.triggers(copiesFor(spent), others);
                  return {
                    y: hit.triggers * hit.each,
                    label: `{${spent}}: ${formatNumber(hit.triggers * hit.each)} damage`,
                  };
                },
                ONSLAUGHT_MANA.max,
                2,
              ),
            },
          ],
        };
      },
    }),
  });
}
