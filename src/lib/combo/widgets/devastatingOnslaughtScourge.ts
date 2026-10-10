import { onslaughtWidget } from './devastatingOnslaught';
import { uses } from './parse/variant';

/* Copies of Scourge of Valkas entering together: each Scourge, the first one included, triggers for
   each copy, every trigger dealing damage equal to the Dragons you control */
const scourgeTriggers = (copies: number, otherDragons: number) => ({
  triggers: copies * (copies + 1),
  each: copies + 1 + otherDragons,
});

export const devastatingOnslaughtScourge = onslaughtWidget(
  'devastating-onslaught-scourge',
  {
    copied: 'Scourge of Valkas',
    summary:
      'Devastating Onslaught makes X copies of Scourge of Valkas, X(X + 1) triggers in all, each dealing damage equal to the Dragons you control to any target.',
    triggers: scourgeTriggers,
    countsOtherDragons: true,
  },
  (variant) => !uses(variant, 'Terror of the Peaks'),
);
