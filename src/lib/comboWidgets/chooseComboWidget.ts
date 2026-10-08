import type { Variant } from '@space-cow-media/spellbook-client';
import { ChannelEffect, ComboWidgetSpec, LifeLoopSpec } from './spec';
import { NUMBER, allText, prerequisites, steps, toNumber, uses, usesAny, usesMatching } from './read';
import { parseLifeLoop } from './parseLifeLoop';
import { parseManaFormula, parseThreshold } from './parseFormula';
import { hasStep, minimumLife } from './lifeLoop';

/*
 * Which widget, if any, helps with a variant. The first rule that recognizes it wins: rules read the
 * cards a variant uses by name and the wording of its texts, never ids, so that new variants of the
 * same combos get the same widget.
 */
export function chooseComboWidget(variant: Variant): ComboWidgetSpec | null {
  for (const rule of RULES) {
    const spec = rule(variant);
    if (spec) {
      return spec;
    }
  }
  return null;
}

/* A rule answers with a spec, or with anything falsy when it doesn't recognize the variant. */
type Rule = (variant: Variant) => ComboWidgetSpec | false | null | undefined | '';

const MANA = '((?:\\{[^}]+\\})+)';

const has = (variant: Variant, ...names: string[]) => names.every((name) => uses(variant, name));
const says = (variant: Variant, pattern: RegExp) => pattern.test(allText(variant));
const findInSteps = (variant: Variant, pattern: RegExp) =>
  steps(variant)
    .map((step) => step.match(pattern))
    .find(Boolean);

const PAYMENTS: LifeLoopSpec['loop'][number]['kind'][] = [
  'pay',
  'pay-x',
  'pay-half',
  'pay-or-mana',
  'pay-choice',
  'extort',
];

/* Loops paid with life: Aetherflux Reservoir gaining the storm count, drains like Gray Merchant. */
const lifeLoop: Rule = (variant) => {
  const parsed = parseLifeLoop(variant.description);
  if (!parsed || !parsed.loop.some((step) => PAYMENTS.includes(step.kind))) {
    return undefined;
  }
  const storm = hasStep(parsed, 'storm-gain');
  const drain = hasStep(parsed, 'drain') || hasStep(parsed, 'extort');
  if (storm === drain) {
    return undefined;
  }
  const spec: LifeLoopSpec = { widget: storm ? 'storm-life-loop' : 'drain-loop', model: 'life-loop', ...parsed };
  if (storm) {
    const inputs = {
      storm: 0,
      devotion: 0,
      extorters: 0,
      x: parsed.variable?.initial ?? 0,
      choice: 0,
      opponents: [],
      mana: 0,
    };
    if (minimumLife(spec, inputs, 60) === Infinity) {
      return undefined;
    }
    if (uses(variant, 'Aetherflux Reservoir')) {
      spec.payoff = { name: 'Aetherflux Reservoir', life: 50, damage: 50 };
    }
  }
  return spec;
};

const CHANNEL_SPELLS: Record<string, ChannelEffect> = {
  Exsanguinate: 'drain',
  Ribbons: 'lose',
  'Debt to the Deathless': 'lose-twice',
  'Torment of Hailfire': 'torment',
  'Crackle with Power': 'crackle',
  'Comet Storm': 'comet',
  "Jaya's Immolating Inferno": 'jaya',
  Fireball: 'fireball',
};

const DRAW_PUNISHERS: Record<string, number> = {
  'Underworld Dreams': 1,
  'Ob Nixilis, the Hate-Twisted': 2,
  'Sheoldred, the Apocalypse': 2,
};

const RULES: Rule[] = [
  lifeLoop,

  // Commander tax and power, loop by loop
  (v) => has(v, 'Krenko, Mob Boss') && says(v, /commander tax/i) && { widget: 'commander-tax', model: 'krenko' },
  (v) => {
    const outlet =
      has(v, 'Greven, Predator Captain') &&
      findInSteps(v, new RegExp(`^(activate|cast) (.+?) by paying .*?${NUMBER} life`, 'i'));
    return (
      outlet && {
        widget: 'stat-scaled-cost',
        model: 'greven',
        outlet: outlet[2],
        // a spell like Fire Covenant pays any amount at once
        lifePerActivation: outlet[1].toLowerCase() === 'cast' ? 1 : toNumber(outlet[3]),
      }
    );
  },
  (v) => {
    const activation =
      has(v, "Mayael's Aria") &&
      findInSteps(
        v,
        new RegExp(
          `^(?:holding priority, )?activate (.+?)(?:'s \\w+ ability)? by paying ${MANA}.*(?:doubl|\\+X/\\+X)`,
          'i',
        ),
      );
    const target = allText(v).match(/power (\d+) or greater/i);
    return (
      activation &&
      target && {
        widget: 'stat-scaled-cost',
        model: 'power-doubling',
        creature: activation[1],
        activation: activation[2],
        target: Number(target[1]),
      }
    );
  },

  // Will it kill?
  (v) => {
    const via = has(v, 'Twenty-Toed Toad') && usesAny(v, ['Peer into the Abyss', 'Enter the Infinite']);
    return (
      via && {
        widget: 'lethal-check',
        model: 'toad',
        via: via === 'Peer into the Abyss' ? 'peer' : 'enter-the-infinite',
      }
    );
  },
  (v) => {
    const punisher = has(v, 'Peer into the Abyss') && usesAny(v, Object.keys(DRAW_PUNISHERS));
    return punisher && { widget: 'lethal-check', model: 'peer', punisher, perCard: DRAW_PUNISHERS[punisher] };
  },
  (v) => has(v, 'Maddening Cacophony', 'Duskmantle Guildmage') && { widget: 'lethal-check', model: 'mill-drain' },
  (v) => has(v, 'Windfall') && says(v, /poison counter/i) && { widget: 'lethal-check', model: 'windfall-poison' },
  (v) =>
    (says(
      v,
      /(?:deck|library) size is greater than (?:or equal to )?(?:your opponents' combined life totals|the sum of your opponents' life totals)/i,
    ) ||
      (has(v, 'Drogskol Reaver') && usesAny(v, ['Queza, Augur of Agonies', 'Starving Revenant']))) && {
      widget: 'lethal-check',
      model: 'draw-drain',
    },
  (v) =>
    has(v, "Be'lakor, the Dark Master") &&
    says(v, /collective life total/i) && { widget: 'lethal-check', model: 'belakor' },
  (v) => has(v, 'Malcolm, Keen-Eyed Navigator', 'Glint-Horn Buccaneer') && { widget: 'lethal-check', model: 'malcolm' },
  (v) => {
    if (!has(v, 'Debt to the Deathless') || uses(v, 'Channel')) {
      return undefined;
    }
    const via = uses(v, 'Revival // Revenge')
      ? 'revenge'
      : uses(v, 'Beacon of Immortality')
        ? 'beacon'
        : says(v, /life you've lost this turn/i)
          ? 'life-lost'
          : undefined;
    return via && { widget: 'lethal-check', model: 'debt', via };
  },
  (v) =>
    has(v, 'Angel of Destiny') &&
    says(v, /starting life total|\d+ minus \d+ for each opponent/i) && {
      widget: 'lethal-check',
      model: 'angel-destiny',
      myriad: says(v, /myriad/i),
    },
  (v) => {
    const outlet =
      has(v, 'Ojer Axonil, Deepest Might') &&
      says(v, /dealing 1 damage to each creature/i) &&
      findInSteps(v, new RegExp(`^activate (.+?) by paying ${MANA}`, 'i'));
    return outlet && { widget: 'lethal-check', model: 'ojer', outlet: outlet[1], mana: outlet[2] };
  },
  (v) => has(v, 'Heartless Hidetsugu') && says(v, /poison/i) && { widget: 'lethal-check', model: 'hidetsugu' },
  // Hammerfist Giant or Ashcloud Phoenix hitting every player each loop, sometimes with pings to aim on top
  (v) => {
    const hit = findInSteps(
      v,
      new RegExp(
        `^(?:resolve the |activate )?(.+?)(?:'s second ability)?(?: triggers?| by tapping it)?, dealing ${NUMBER} damage to each (?:creature without flying and each )?player`,
        'i',
      ),
    );
    const raced = prerequisites(v).some((p) =>
      /\bgreater than (?:each opponent's life total|the largest life total among your opponents)/i.test(p),
    );
    const pings = steps(v).filter((step) => /dealing 1 damage to any target/i.test(step)).length;
    return (
      hit &&
      raced && { widget: 'lethal-check', model: 'everyone-pinged', source: hit[1], damage: toNumber(hit[2]), pings }
    );
  },
  (v) => has(v, 'Hive Mind', 'Revival // Revenge') && { widget: 'lethal-check', model: 'hive-revenge' },
  (v) => has(v, 'Tireless Tribe', 'Inside Out') && { widget: 'lethal-check', model: 'tireless-tribe' },
  (v) => has(v, 'Eternity Vessel', 'Dragonspark Reactor') && { widget: 'lethal-check', model: 'charge-counters' },
  (v) => has(v, 'Ingris Stingerquill', 'Plague of Vermin') && { widget: 'lethal-check', model: 'ingris' },
  (v) => has(v, 'Hallar, the Firefletcher') && says(v, /poison/i) && { widget: 'lethal-check', model: 'hallar' },
  (v) =>
    prerequisites(v).some((p) =>
      /number of cards in (?:your )?library is greater than each opponent's life total/i.test(p),
    ) && { widget: 'lethal-check', model: 'library-ping' },

  // Life into X
  (v) => {
    const spell = uses(v, 'Channel') && usesAny(v, Object.keys(CHANNEL_SPELLS));
    return spell && { widget: 'life-to-x', model: 'channel', spell, effect: CHANNEL_SPELLS[spell] };
  },
  (v) =>
    has(v, 'Storm Herd', "Cathars' Crusade") && {
      widget: 'life-to-x',
      model: 'storm-herd-crusade',
      partner: "Cathars' Crusade",
    },
  (v) =>
    has(v, 'Storm Herd', 'Exalted Sunborn') && {
      widget: 'life-to-x',
      model: 'storm-herd-sunborn',
      partner: 'Exalted Sunborn',
    },
  (v) => {
    const target =
      has(v, 'Storm Herd') &&
      prerequisites(v)
        .map((p) =>
          p.match(
            new RegExp(
              `^your life total plus the number of creatures you control is (?:equal to or greater than|at least) ${NUMBER}$`,
              'i',
            ),
          ),
        )
        .find(Boolean);
    const partner = v.uses.map((card) => card.card.name).find((name) => name !== 'Storm Herd');
    return (
      target && {
        widget: 'life-to-x',
        model: 'storm-herd-count',
        partner: partner ?? 'Storm Herd',
        target: toNumber(target[1]),
      }
    );
  },

  // Chances of success
  (v) =>
    has(v, 'Krark, the Thumbless') &&
    (usesMatching(v, /^Sakashima\b/) || says(v, /\bcopy of Krark\b/i)) && {
      widget: 'random-chance',
      model: 'krark',
      krarks: 2,
    },
  (v) => {
    const roll = findInSteps(v, /\broll a d(\d+) and create that many (.+?) tokens?\b/i);
    const spender = roll && findInSteps(v, new RegExp(`^activate (.+?) by paying ${MANA}`, 'i'));
    return (
      spender && {
        widget: 'random-chance',
        model: 'dice-resource',
        die: Number(roll[1]),
        resource: roll[2],
        spender: spender[1],
        cost: spender[2],
      }
    );
  },
  (v) => {
    const win =
      !says(v, /will be heads/i) &&
      says(v, /arbitrarily large/i) &&
      findInSteps(v, /(?:if you win the flip|each coin flip you win|if you won the flip), ([^.]+)/i);
    // the free activation that flips the coins
    const source =
      win &&
      findInSteps(
        v,
        /^activate (.+?)(?:'s ability)?(?: an arbitrarily large (?:amount|number) of times)? by paying (?:a total of )?\{0\}/i,
      );
    return source && { widget: 'random-chance', model: 'coin-flips', source: source[1], onWin: win[1] };
  },

  // Finite results
  (v) => has(v, 'Blasphemous Act', 'Repercussion') && { widget: 'finite-output', model: 'repercussion' },
  (v) => has(v, 'Dragon Tempest', 'Ancient Gold Dragon') && { widget: 'finite-output', model: 'dragon-tempest' },
  (v) => {
    const copied =
      has(v, 'Devastating Onslaught') && usesAny(v, ['Terror of the Peaks', 'Scourge of Valkas', 'Exalted Sunborn']);
    return copied && { widget: 'finite-output', model: 'onslaught', copied };
  },
  (v) => {
    const growth = findInSteps(
      v,
      new RegExp(`triggers, creating ${NUMBER} \\d+/\\d+ (\\w+) creature tokens for each \\2\\b`, 'i'),
    );
    return (
      growth && { widget: 'finite-output', model: 'token-growth', creature: growth[2], perToken: toNumber(growth[1]) }
    );
  },
  (v) => has(v, 'Mirrorform', 'Omnath, Locus of Rage') && { widget: 'finite-output', model: 'mirrorform' },
  (v) => has(v, 'Eternity Vessel', "Magistrate's Scepter") && { widget: 'finite-output', model: 'scepter-turns' },

  // The size of the table
  (v) => {
    const mana =
      has(v, 'Duskmantle Guildmage') &&
      v.manaNeeded.match(new RegExp(`^${MANA} plus an additional ${MANA} for each opponent you have$`, 'i'));
    return mana && { widget: 'opponent-count', model: 'mill-each', base: mana[1], perOpponent: mana[2] };
  },
  (v) =>
    has(v, 'Time Sieve') &&
    says(v, /divided by the number of opponents you have minus one/i) && {
      widget: 'opponent-count',
      model: 'time-sieve',
    },
  (v) => {
    const target = allText(v).match(
      new RegExp(`devotion to black times the number of opponents you have is greater than or equal to ${NUMBER}`, 'i'),
    );
    return target && { widget: 'opponent-count', model: 'devotion-times-opponents', target: toNumber(target[1]) };
  },

  // Anything else written as a formula: storm counts, commander tax, power, counters, permanents, opponents
  (v) => parseManaFormula(v.manaNeeded),
  (v) =>
    prerequisites(v)
      .map((p) => parseThreshold(p) ?? parseManaFormula(p))
      .find(Boolean),
  (v) =>
    v.notes
      .split(/(?<=\.)\s+/)
      .filter((note) => /\bis equal to \{/i.test(note))
      .map(parseManaFormula)
      .find(Boolean),
];
