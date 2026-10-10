import type { Variant } from '@space-cow-media/spellbook-client';
import pluralize from 'pluralize';
import { numberInput } from './shared/inputs';
import { paybackCalculator } from './shared/payback';
import { defineWidget } from './shared/widget';
import { creaturesSharing, typesOf } from './parse/creatureTypes';
import { NUMBER, findInSteps, has, shortName, statedNumber, usesAny } from './parse/variant';

/* Each new creature makes Mana Echoes add {C} for each creature you control sharing a type with it */
interface Counting {
  types: string[];
  /* the creatures you add to the count, in a label */
  others: string;
  /* creatures counted that aren't among the combo's cards, like the token being copied */
  copied?: boolean;
}

interface Line {
  /* the cards besides Mana Echoes */
  cards: string[];
  costs: string[];
  stacks: boolean;
  counting(variant: Variant): Counting | undefined;
  made?: number;
  /* a card flickered every loop, which Mana Echoes counts too */
  flickers?: string;
  /* a prerequisite stating how many creatures already count, matched by the first group */
  stated?: RegExp;
  /* every loop also casts a Sliver you search for */
  castsSlivers?: boolean;
}

const making = (type: string) => (): Counting => ({ types: [type], others: `Other ${pluralize(type)} you control` });

const copying = (what: string) => (): Counting => ({
  types: [],
  others: `Other creatures that share a type with ${what}`,
  copied: true,
});

/* "creating a token copy of Zealous Conscripts with haste" */
const copyingNamed = (variant: Variant): Counting | undefined => {
  const name = findInSteps(variant, /creating a token copy of (.+?)(?: with haste)?(?: that|[.,]|$)/i)?.[1];
  return name
    ? { types: typesOf(variant, name), others: `Other creatures that share a type with ${shortName(name)}` }
    : undefined;
};

const IMPROVISED_ARSENAL = '{4}{R}';
/* Prismite, Urn of Godfire and the like turn {2} into one mana of any color, while Chromatic Orrery
   and Mycosynth Lattice let any mana pay for colored costs */
const MANA_TO_A_COLOR = 2;
const ANY_MANA_AS_A_COLOR = ['Chromatic Orrery', 'Mycosynth Lattice'];

const DRAGONS = new RegExp(`^You control ${NUMBER} or more Dragons$`, 'i');
const SLIVERS = new RegExp(`^There are at least ${NUMBER} Slivers on the battlefield$`, 'i');
const SHARING_WITH_THE_TOKEN = new RegExp(
  `^You control at least ${NUMBER} creatures that share a creature type with the creature token$`,
  'i',
);

const LINES: Line[] = [
  { cards: ['Fire Nation Archers'], costs: ['{5}'], stacks: true, counting: making('Soldier') },
  { cards: ['Kiora of Fire and Ashes'], costs: ['{8}'], stacks: true, counting: making('Dragon'), stated: DRAGONS },
  { cards: ['Retrofitter Foundry'], costs: ['{2}', '{5}'], stacks: true, counting: making('Servo') },
  /* Cayth's {2} again after an untap: Staff of Domination's {3}, and {1} more from the second time
     on to untap the Staff */
  {
    cards: ['Cayth, Famed Mechanist', 'Staff of Domination'],
    costs: ['{2}', '{5}', '{6}'],
    stacks: true,
    counting: copying('the token you copy'),
    stated: SHARING_WITH_THE_TOKEN,
  },
  ...[
    { untapper: 'Umbral Mantle', untap: 3 },
    { untapper: 'Sword of the Paruns', untap: 3 },
    { untapper: 'Singing Bell Strike', untap: 6 },
  ].map(({ untapper, untap }) => ({
    cards: ['Cayth, Famed Mechanist', untapper],
    costs: ['{2}', `{${2 + untap}}`],
    stacks: true,
    counting: copying('the token you copy'),
    stated: SHARING_WITH_THE_TOKEN,
  })),
  { cards: ['Chrome Dome'], costs: ['{5}'], stacks: true, counting: copying('the artifact creature you copy') },
  {
    cards: ['Sliver Overlord'],
    costs: ['{3}'],
    stacks: false,
    counting: making('Sliver'),
    stated: SLIVERS,
    castsSlivers: true,
  },
  {
    cards: ['Improvised Arsenal', 'Displaced Dinosaurs'],
    costs: [IMPROVISED_ARSENAL],
    stacks: true,
    counting: making('Dinosaur'),
  },
  {
    cards: ['Improvised Arsenal', 'Chishiro, the Shattered Blade'],
    costs: [IMPROVISED_ARSENAL],
    stacks: true,
    counting: making('Spirit'),
  },
  {
    cards: ['Improvised Arsenal', 'Barret, Avalanche Leader'],
    costs: [IMPROVISED_ARSENAL],
    stacks: true,
    counting: making('Rebel'),
  },
  {
    cards: ['Improvised Arsenal', 'Sokka and Suki'],
    costs: [IMPROVISED_ARSENAL],
    stacks: true,
    counting: making('Ally'),
  },
  {
    cards: ["Inspired Skypainter // Maestro's Gift"],
    costs: ['{3}{U}{R}'],
    stacks: false,
    counting: () => ({ types: ['Lizard', 'Wizard'], others: 'Other Lizards and Wizards you control' }),
  },
  { cards: ["Saheeli, the Sun's Brilliance"], costs: ['{U}{R}'], stacks: true, counting: copyingNamed },
  {
    cards: ['Displacer Kitten', 'Lluwen, Exchange Student // Pest Friend'],
    costs: ['{B/G}'],
    stacks: false,
    counting: making('Pest'),
    flickers: 'Lluwen, Exchange Student // Pest Friend',
  },
  {
    cards: ['Displacer Kitten', 'Campus Composer // Aqueous Aria'],
    costs: ['{4}{U}'],
    stacks: false,
    counting: making('Elemental'),
    flickers: 'Campus Composer // Aqueous Aria',
  },
  {
    cards: ['Displacer Kitten', 'Strife Scholar // Awaken the Ages'],
    costs: ['{5}{R}'],
    stacks: false,
    counting: making('Spirit'),
    made: 2,
    flickers: 'Strife Scholar // Awaken the Ages',
  },
];

const SLIVER_MANA = numberInput('sliver', 'Mana value of each Sliver you cast', 1);

export const manaEchoes = defineWidget('mana-echoes', {
  detect(variant) {
    const line = LINES.find(({ cards }) => has(variant, 'Mana Echoes', ...cards));
    const counting = line?.counting(variant);
    if (!line || !counting) {
      return undefined;
    }
    const base = creaturesSharing(variant, counting.types) + (counting.copied ? 1 : 0);
    const stated = line.stated && statedNumber(variant, line.stated);
    return {
      costs: line.costs,
      stacks: line.stacks,
      made: line.made ?? 1,
      base,
      bonus: line.flickers ? creaturesSharing(variant, typesOf(variant, line.flickers)) : 0,
      others: counting.others,
      initial: stated === undefined ? 0 : Math.max(0, stated - base),
      castsSlivers: line.castsSlivers ?? false,
      colorRate: usesAny(variant, ANY_MANA_AS_A_COLOR) ? 1 : MANA_TO_A_COLOR,
    };
  },
  calculator: (spec) =>
    paybackCalculator(
      { ...spec, rate: 1 },
      {
        category: 'board',
        title: 'How much mana gets Mana Echoes going?',
        summary: [
          'Each new creature makes Mana Echoes add {C} for every creature you control that shares a type with it, so the loop costs less the more of them you have.',
          ...(spec.stacks
            ? ['Activating again before the Mana Echoes triggers resolve makes each of them count more creatures.']
            : []),
          ...(spec.costs.some((cost) => /\{\D/.test(cost)) && spec.colorRate > 1
            ? ["Each colored mana takes {2} of the {C} through the combo's mana converter."]
            : []),
        ].join(' '),
        counted: numberInput('others', spec.others, spec.initial),
        ...(spec.castsSlivers && { extra: SLIVER_MANA }),
      },
    ),
});
