import { onslaughtWidget } from './devastatingOnslaught';

export const devastatingOnslaughtTerror = onslaughtWidget(
  'devastating-onslaught-terror',
  {
    copied: 'Terror of the Peaks',
    summary:
      'Devastating Onslaught makes X copies of Terror of the Peaks. Each Terror sees every other one enter: X² triggers of 5 damage to any target.',
    triggers: (copies) => ({ triggers: copies * copies, each: 5 }),
    countsOtherDragons: false,
  },
  () => true,
);
