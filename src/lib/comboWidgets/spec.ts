/*
 * What a combo widget needs to know, as plain data: the decision in `chooseComboWidget` builds it from
 * a variant, and the calculators turn it into inputs and answers. Nothing here refers to a variant,
 * so the same specs could later come from the backend instead.
 */

export type WidgetKind =
  | 'storm-life-loop'
  | 'storm-threshold'
  | 'life-to-x'
  | 'lethal-check'
  | 'drain-loop'
  | 'stat-scaled-cost'
  | 'count-scaled-cost'
  | 'finite-output'
  | 'opponent-count'
  | 'commander-tax'
  | 'random-chance';

/* A number the player knows at the table and types in. */
export interface Quantity {
  key: string;
  label: string;
  min: number;
  max: number;
  initial: number;
}

/* ---------- Life loops: storm-life-loop and drain-loop ---------- */

export type LifeStep =
  /* pay or lose a fixed amount of life */
  | { kind: 'pay'; life: number }
  /* pay life equal to the loop's variable, e.g. the mana value of the creature */
  | { kind: 'pay-x' }
  /* pay half your life, rounded up */
  | { kind: 'pay-half' }
  /* pay life when you can afford it, mana otherwise ("if needed, activate Treasonous Ogre…") */
  | { kind: 'pay-or-mana'; life: number; mana: number }
  /* the first time, one of several ways to pay; every later loop pays the most expensive one */
  | { kind: 'pay-choice'; options: { label: string; life: number }[] }
  | { kind: 'gain'; life: number }
  /* a spell is cast, so the storm count grows */
  | { kind: 'cast' }
  /* gain life equal to the number of spells cast this turn, like Aetherflux Reservoir */
  | { kind: 'storm-gain' }
  /* each opponent loses this much, and you gain the total */
  | { kind: 'drain'; perOpponent: number | 'devotion' }
  /* every creature with extort pays this much life to drain each opponent for 1 */
  | { kind: 'extort'; life: number };

export interface LifeLoopSpec {
  widget: 'storm-life-loop' | 'drain-loop';
  model: 'life-loop';
  /* done once, before the repeated steps */
  setup: LifeStep[];
  loop: LifeStep[];
  /* what pay-x steps pay */
  variable?: Quantity;
  /* the card that turns a big life total into damage */
  payoff?: { name: string; life: number; damage: number };
}

/* ---------- Storm thresholds ---------- */

export interface StormThresholdSpec {
  widget: 'storm-threshold';
  model: 'storm-threshold';
  counting: 'spells' | 'instants and sorceries';
  /* the storm count needed: base, plus perCast or casts / castDivisor (rounded up) per command zone cast */
  base: number;
  perCast?: number;
  castDivisor?: number;
  commander?: string;
  /* what the storm count buys instead of a threshold, e.g. the largest spell the loop can copy */
  capacity?: { label: string; base: number; perSpell: number };
}

/* ---------- Life into X ---------- */

export type ChannelEffect =
  /* each opponent loses X and you gain the total (Exsanguinate) */
  | 'drain'
  /* each opponent loses X (Ribbons) */
  | 'lose'
  /* each opponent loses twice X (Debt to the Deathless) */
  | 'lose-twice'
  /* X times, each opponent loses 3 unless they sacrifice or discard (Torment of Hailfire) */
  | 'torment'
  /* {X}{X}{X}: 5X damage to each of up to X targets (Crackle with Power) */
  | 'crackle'
  /* multikicked: X damage to each of kicks + 1 targets (Comet Storm) */
  | 'comet'
  /* X damage to each of up to three targets (Jaya's Immolating Inferno) */
  | 'jaya'
  /* X damage divided evenly, {1} more per extra target (Fireball) */
  | 'fireball';

export type LifeToXSpec =
  | { widget: 'life-to-x'; model: 'channel'; spell: string; effect: ChannelEffect }
  /* Storm Herd makes a Pegasus per life point */
  | { widget: 'life-to-x'; model: 'storm-herd-crusade'; partner: string }
  | { widget: 'life-to-x'; model: 'storm-herd-count'; partner: string; target: number }
  | { widget: 'life-to-x'; model: 'storm-herd-sunborn'; partner: string };

/* ---------- Lethal checks ---------- */

export type LethalCheckSpec = { widget: 'lethal-check' } & (
  | /* Peer into the Abyss with a draw punisher */ { model: 'peer'; punisher: string; perCard: number }
  | /* Maddening Cacophony with Duskmantle Guildmage */ { model: 'mill-drain' }
  | /* Windfall with a draw punisher that has infect */ { model: 'windfall-poison' }
  | /* every card you draw drains 1 */ { model: 'draw-drain' }
  | /* Malcolm and Glint-Horn Buccaneer */ { model: 'malcolm' }
  | /* Debt to the Deathless with X from life gained or lost this turn */ {
      model: 'debt';
      via: 'revenge' | 'beacon' | 'life-lost';
    }
  | /* Angel of Destiny's end step check */ { model: 'angel-destiny'; myriad: boolean }
  | /* Ojer Axonil pinging everyone through Pyrohemia or Warmonger */ { model: 'ojer'; outlet: string; mana: string }
  | /* Heartless Hidetsugu with infect */ { model: 'hidetsugu' }
  | /* Twenty-Toed Toad needs 20 cards in hand */ { model: 'toad'; via: 'peer' | 'enter-the-infinite' }
  | /* every loop deals damage to every player, plus 1 damage pings you aim */ {
      model: 'everyone-pinged';
      source: string;
      damage: number;
      pings: number;
    }
  | /* Be'lakor copies: 6 damage per Demon trigger, then draws if that isn't enough */ { model: 'belakor' }
  | /* Hive Mind copies of Revenge halve your life once per opponent */ { model: 'hive-revenge' }
  | /* Tireless Tribe gets +4 power per discarded card */ { model: 'tireless-tribe' }
  | /* charge counters turned into damage to one opponent */ { model: 'charge-counters' }
  | /* Ingris Stingerquill: one ping per attacker, Rats paid with life */ { model: 'ingris' }
  | /* Hallar gives poison equal to its power */ { model: 'hallar' }
  | /* one damage to each opponent per card left in your library */ { model: 'library-ping' }
);

/* ---------- Costs and thresholds written as formulas ---------- */

export type ScalingWidget = 'stat-scaled-cost' | 'count-scaled-cost' | 'opponent-count' | 'commander-tax';

/* amount(q) = max(0, slope × q + offset) copies of `per`, added (sign 1) or removed (sign -1) */
export interface ManaTerm {
  quantity: Quantity;
  per: string;
  sign: 1 | -1;
  slope: 1 | -1;
  offset: number;
}

export interface ManaFormulaSpec {
  widget: ScalingWidget;
  model: 'mana-formula';
  base: string;
  terms: ManaTerm[];
  /* e.g. "each turn" */
  suffix?: string;
  /* the sentence the formula was read from */
  source?: string;
}

/* need = base + Σ coefficient × quantity, compared with what you have */
export interface ThresholdSpec {
  widget: ScalingWidget;
  model: 'threshold';
  have: Quantity;
  compare: '>=' | '>' | '<=';
  base: number;
  terms: { quantity: Quantity; coefficient: number }[];
  /* the sentence the threshold was read from */
  source?: string;
}

export type ScalingSpec =
  | ManaFormulaSpec
  | ThresholdSpec
  /* Greven needs 21 power, from life paid in chunks */
  | { widget: 'stat-scaled-cost'; model: 'greven'; outlet: string; lifePerActivation: number }
  /* Mayael's Aria with a creature whose power doubles per activation */
  | { widget: 'stat-scaled-cost'; model: 'power-doubling'; creature: string; activation: string; target: number }
  /* Krenko doubles the Goblins that pay for its own recast */
  | { widget: 'commander-tax'; model: 'krenko' }
  /* each opponent dies if their library holds at least their life (Duskmantle Guildmage and Mindcrank) */
  | { widget: 'opponent-count'; model: 'mill-each'; base: string; perOpponent: string }
  /* attacking artifact creatures needed: ⌈5 / (opponents - 1)⌉ (Time Sieve) */
  | { widget: 'opponent-count'; model: 'time-sieve' }
  /* devotion × opponents against a target */
  | { widget: 'opponent-count'; model: 'devotion-times-opponents'; target: number };

/* ---------- Finite results ---------- */

export type FiniteOutputSpec = { widget: 'finite-output' } & (
  | /* Blasphemous Act with Repercussion */ { model: 'repercussion' }
  | /* Dragon Tempest with Ancient Gold Dragon */ { model: 'dragon-tempest' }
  | /* Devastating Onslaught copying a creature */ { model: 'onslaught'; copied: string }
  | /* tokens that multiply every iteration */ { model: 'token-growth'; creature: string; perToken: number }
  | /* Mirrorform turning everything into Omnath */ { model: 'mirrorform' }
  | /* Eternity Vessel's counters turned into extra turns, three each */ { model: 'scepter-turns' }
);

/* ---------- Chances of success ---------- */

export type RandomChanceSpec = { widget: 'random-chance' } & (
  | /* a die roll pays for the next iteration and leftovers carry over (Ancient Copper Dragon and Aggravated Assault) */ {
      model: 'dice-resource';
      die: number;
      resource: string;
      spender: string;
      cost: string;
    }
  | /* as many free coin flips as you like, with something on every win (Frenetic Efreet) */ {
      model: 'coin-flips';
      source: string;
      onWin: string;
    }
  | /* each instant or sorcery flips a coin per Krark: a loss returns it to hand, a win copies it */ {
      model: 'krark';
      krarks: number;
    }
);

export type ComboWidgetSpec =
  LifeLoopSpec | StormThresholdSpec | LifeToXSpec | LethalCheckSpec | ScalingSpec | FiniteOutputSpec | RandomChanceSpec;
