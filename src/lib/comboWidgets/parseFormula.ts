import pluralize from 'pluralize';
import { ManaFormulaSpec, ManaTerm, Quantity, ScalingWidget, StormThresholdSpec, ThresholdSpec } from './spec';
import { NUMBER, capitalize, shortName, toNumber } from './read';
import { parseMana } from './mana';

/*
 * Costs and thresholds that the texts spell out as formulas, e.g.
 *   "{4} minus {1} for each +1/+1 counter on Workhorse"
 *   "You control a number of Goblins that is equal to or greater than six plus Krenko's commander tax"
 * Only the shapes below are understood; anything else is left alone rather than guessed.
 */

type Kind = ScalingWidget | 'storm';

interface Measured {
  kind: Kind;
  quantity: Quantity;
}

const MANA = '((?:\\{[^}]+\\})+)';
const N = NUMBER;

function quantity(key: string, label: string, min: number, max: number, initial: number): Quantity {
  return { key, label, min, max, initial };
}

export function castsQuantity(commander: string): Quantity {
  return quantity('casts', `Times ${commander} was cast from the command zone`, 0, 12, 0);
}

export const OPPONENTS: Quantity = quantity('opponents', 'Opponents', 1, 7, 3);

/* "creature and artifact you control" reads as "Creatures and artifacts you control" */
function pluralPhrase(phrase: string): string {
  return capitalize(
    phrase.replace(
      /^(.*?)( you control.*)?$/i,
      (_, things: string, rest = '') =>
        things.replace(/\b([A-Za-z][\w'-]*)(?=(?: and| or|,|\/|$))/g, (word) => pluralize(word)) + rest,
    ),
  );
}

/* What a phrase like "+1/+1 counter on Workhorse" or "opponent you have" counts. */
export function measure(phrase: string): Measured | undefined {
  const text = phrase
    .trim()
    .replace(/[.,]$/, '')
    .replace(/\s+(?:each turn|available|this game)$/i, '');
  let match;
  if (/^poison counters? (?:your opponents have|among your opponents)$/i.test(text)) {
    return { kind: 'count-scaled-cost', quantity: quantity('poison', 'Poison counters your opponents have', 0, 40, 0) };
  }
  // "+1/+1 counter on Workhorse", "filibuster counters on Azor's Elocutors"
  if ((match = text.match(/^(\+1\/\+1|[a-z-]+) counters? on (.+)$/i))) {
    return {
      kind: 'stat-scaled-cost',
      quantity: quantity('counters', `${capitalize(match[1])} counters on ${match[2]}`, 0, 20, 0),
    };
  }
  if ((match = text.match(/^(.+?)'s? (power|toughness)$/i))) {
    const stat = match[2].toLowerCase();
    return { kind: 'stat-scaled-cost', quantity: quantity(stat, capitalize(`${match[1]}'s ${stat}`), 0, 40, 2) };
  }
  if (/^the (?:highest|greatest) power among creatures you control$/i.test(text)) {
    return { kind: 'stat-scaled-cost', quantity: quantity('power', 'Greatest power among your creatures', 0, 40, 2) };
  }
  if (/^(?:other )?planeswalkers? you control$/i.test(text)) {
    return {
      kind: 'stat-scaled-cost',
      quantity: quantity('planeswalkers', 'Other planeswalkers you control', 0, 10, 2),
    };
  }
  if ((match = text.match(/^opponents?(?: you have)?(.*)$/i))) {
    const condition = match[1].trim();
    return condition && !/^with\b/i.test(condition)
      ? undefined
      : { kind: 'opponent-count', quantity: { ...OPPONENTS, label: `Opponents${condition ? ` ${condition}` : ''}` } };
  }
  if ((match = text.match(/^(?:each )?times? you've cast (.+?) from the command zone$/i))) {
    return { kind: 'commander-tax', quantity: castsQuantity(shortName(match[1])) };
  }
  if ((match = text.match(/^(.+?)'s commander tax(?:, if applicable)?$/i))) {
    return { kind: 'commander-tax', quantity: castsQuantity(match[1]) };
  }
  if (/^your storm count$/i.test(text)) {
    return { kind: 'storm', quantity: quantity('storm', 'Spells cast this turn', 0, 30, 0) };
  }
  // "artifacts you control that share a name with the artifact that has Mechanized Production attached"
  if (
    (match = text.match(/^(.+? you control)( that share a name with .+)?$/i)) &&
    !/\b(?:life|if|that|with|which|have|for each)\b/i.test(match[1])
  ) {
    return {
      kind: 'count-scaled-cost',
      quantity: quantity('count', pluralPhrase(match[1]) + (match[2] ?? ''), 0, 60, 5),
    };
  }
  return undefined;
}

/* The widget a formula belongs to: the most telling thing it depends on. */
function widgetFor(kinds: Kind[]): Kind {
  const order: Kind[] = ['storm', 'commander-tax', 'opponent-count', 'stat-scaled-cost', 'count-scaled-cost'];
  return order.find((kind) => kinds.includes(kind)) ?? 'count-scaled-cost';
}

/* ---------- Mana ---------- */

/* "for each omen counter on Celestial Convergence beyond the first" counts one less than there are */
function manaTerm(sign: 1 | -1, per: string, phrase: string, slope: 1 | -1 = 1, offset = 0) {
  const beyondFirst = /\s+beyond the first$/i.test(phrase);
  const measured = measure(phrase.replace(/\s+beyond the first$/i, ''));
  const shift = beyondFirst ? offset - slope : offset;
  return measured && { kind: measured.kind, term: { quantity: measured.quantity, per, sign, slope, offset: shift } };
}

function manaSpec(base: string, terms: ({ kind: Kind; term: ManaTerm } | undefined)[], suffix?: string) {
  if (!parseMana(base) || terms.some((term) => !term || !parseMana(term.term.per))) {
    return undefined;
  }
  const found = terms as { kind: Kind; term: ManaTerm }[];
  const widget = widgetFor(found.map((term) => term.kind));
  if (widget === 'storm') {
    return undefined;
  }
  const spec: ManaFormulaSpec = { widget, model: 'mana-formula', base, terms: found.map((term) => term.term) };
  return suffix ? { ...spec, suffix } : spec;
}

function addBases(first: string, second?: string): string {
  return second ? first + second : first;
}

/* "Mana needed" written as a formula, or a note saying what the mana needed is equal to. Commander
   tax on top of a formula that counts command zone casts is two more per cast. */
export function parseManaFormula(text: string): ManaFormulaSpec | undefined {
  const spec = manaFormula(text);
  return spec && { ...spec, source: text.trim() };
}

function manaFormula(text: string): ManaFormulaSpec | undefined {
  const sentence = text
    .trim()
    .replace(/\.$/, '')
    .replace(/^.*?\b(?:mana needed(?: to start)?|amount of mana needed(?: to start)?) is equal to /i, '');
  const withoutTax = sentence.replace(/,? plus commander tax(?:,)? if applicable$/i, '');
  const spec = parseManaSentence(withoutTax);
  if (withoutTax === sentence || !spec) {
    return spec;
  }
  const casts = spec.terms.find((term) => term.quantity.key === 'casts');
  return casts && { ...spec, terms: [...spec.terms, { ...casts, per: '{2}', sign: 1, slope: 1, offset: 0 }] };
}

function parseManaSentence(sentence: string): ManaFormulaSpec | undefined {
  const suffix = /\beach turn\b/i.test(sentence) ? 'each turn' : undefined;
  let match;
  // "You have an amount of {R} available equal to three minus the number of +1/+1 counters on Runaway Steam-Kin"
  if (
    (match = sentence.match(
      new RegExp(
        `^you have an amount of (${MANA.slice(1, -1)}|mana) available equal to ${N} minus the number of (.+)$`,
        'i',
      ),
    ))
  ) {
    const per = match[1].toLowerCase() === 'mana' ? '{1}' : match[1];
    return manaSpec('{0}', [manaTerm(1, per, match[3], -1, toNumber(match[2]))]);
  }
  // "{3} plus {X} each turn, where X is 14 minus the greatest power among creatures you control"
  if ((match = sentence.match(new RegExp(`^${MANA} plus \\{X\\}(?: each turn)?, where X is ${N} minus (.+)$`, 'i')))) {
    return manaSpec(match[1], [manaTerm(1, '{1}', match[3], -1, toNumber(match[2]))], suffix);
  }
  // "{2}{R} plus an additional amount of {R} available equal to three minus the number of +1/+1 counters on Runaway Steam-Kin"
  if (
    (match = sentence.match(
      new RegExp(
        `^${MANA} plus an additional amount of ${MANA} (?:available )?equal to ${N} minus the number of (.+)$`,
        'i',
      ),
    ))
  ) {
    return manaSpec(match[1], [manaTerm(1, match[2], match[4], -1, toNumber(match[3]))]);
  }
  // "{5} minus {X}, where X is Devoted Druid's toughness minus one"
  if ((match = sentence.match(new RegExp(`^${MANA} minus \\{X\\}, where X is (.+?) minus ${N}$`, 'i')))) {
    return manaSpec(match[1], [manaTerm(-1, '{1}', match[2], 1, -toNumber(match[3]))]);
  }
  // "{20} minus {1} for each creature and artifact you control each turn", "{1}{U}{B} plus an additional {2}{U}{B} for each opponent you have"
  if (
    (match = sentence.match(
      new RegExp(
        `^${MANA},?(?: plus (?:an additional )?${MANA})?,? (minus|plus)(?: an additional)? ${MANA} (?:available )?(?:for each|per) (.+?)(?: each turn)?(?: available)?$`,
        'i',
      ),
    ))
  ) {
    const sign = match[3].toLowerCase() === 'minus' ? -1 : 1;
    return manaSpec(addBases(match[1], match[2]), [manaTerm(sign, match[4], match[5])], suffix);
  }
  // "{6} for each opponent you have each turn"
  if ((match = sentence.match(new RegExp(`^${MANA} (?:for each|per) (.+?)(?: each turn)?$`, 'i')))) {
    return manaSpec('{0}', [manaTerm(1, match[1], match[2])], suffix);
  }
  // "{3} minus Topiary Lecturer's power", "{2}{G/W}{G/W} minus an amount of {G} equal to Mona Lisa's power"
  if (
    (match = sentence.match(
      new RegExp(`^${MANA} minus (?:an amount of ${MANA} equal to )?([^{}]+?'s (?:power|toughness))$`, 'i'),
    ))
  ) {
    return manaSpec(match[1], [manaTerm(-1, match[2] ?? '{1}', match[3])]);
  }
  return undefined;
}

/* ---------- Thresholds ---------- */

interface Term {
  kind: Kind;
  quantity: Quantity;
  coefficient: number;
}

/* One added or removed part of a requirement: "Krenko's commander tax", "twice the number of other
   planeswalkers you control", "an additional artifact or creature for each time you've cast Dargo…",
   or "one for each poison counter your opponents have and for each other creature you control",
   which is two parts sharing a coefficient. */
function parseTerms(text: string, sign: 1 | -1): Term[] | undefined {
  const phrase = text.trim().replace(/[.,]$/, '');
  const one = (measured: Measured | undefined, coefficient: number) => measured && [{ ...measured, coefficient }];
  let match;
  if ((match = phrase.match(/^(.+?)'s commander tax(?:, if applicable)?$/i))) {
    return [{ kind: 'commander-tax', quantity: castsQuantity(match[1]), coefficient: 2 * sign }];
  }
  if ((match = phrase.match(new RegExp(`^(?:an additional )?(?:${N} )?.*?\\bfor each (.+)$`, 'i')))) {
    const coefficient = sign * (match[1] ? toNumber(match[1]) : 1);
    const measured = match[2].split(/,? and for each /i).map(measure);
    return measured.every(Boolean) ? (measured as Measured[]).map((m) => ({ ...m, coefficient })) : undefined;
  }
  if ((match = phrase.match(/^(twice |two times )?the number of (.+)$/i))) {
    return one(measure(match[2].replace(/ this game$/i, '')), sign * (match[1] ? 2 : 1));
  }
  if ((match = phrase.match(new RegExp(`^${N} times (.+)$`, 'i')))) {
    return one(measure(match[2]), sign * toNumber(match[1]));
  }
  return one(measure(phrase), sign);
}

/* "six plus Krenko's commander tax", "eleven minus twice the number of …" */
function parseRequirement(text: string): { base: number; terms: Term[] } | undefined {
  const parts = text.trim().split(/,?\s+\b(plus|minus)\b\s+/i);
  const first = parts[0].match(new RegExp(`^${N}$`, 'i'));
  const terms: Term[] = [];
  let base = 0;
  if (first) {
    base = toNumber(first[1]);
  } else {
    // A requirement can open with what it depends on: "greater than the indestructible creature's toughness"
    const opening = parseTerms(parts[0], 1);
    if (!opening) {
      return undefined;
    }
    terms.push(...opening);
  }
  for (let i = 1; i < parts.length; i += 2) {
    const term = parseTerms(parts[i + 1] ?? '', parts[i].toLowerCase() === 'minus' ? -1 : 1);
    if (!term) {
      return undefined;
    }
    terms.push(...term);
  }
  return { base, terms };
}

const COMPARE: [RegExp, ThresholdSpec['compare']][] = [
  [
    /^(?:is |are |that is )?(?:at least|equal to or (?:greater|higher) than|(?:greater|higher) than or equal to)\s+/i,
    '>=',
  ],
  [/^(?:is |are |that is )?(?:greater|higher) than\s+/i, '>'],
  [/^(?:is |are |that is )?(?:at most|no greater than|less than or equal to|equal to or less than)\s+/i, '<='],
  [/^(?:is |are |that is )?equal to\s+/i, '>='],
];

/* `have` compared with what `rest` asks for; `extra` are terms the sentence put next to `have`, like
   "the number of creature cards in all graveyards" in "the number of creatures you control plus …". */
function threshold(
  have: Quantity,
  haveKind: Kind,
  rest: string,
  extra: Term[] = [],
): ThresholdSpec | StormThresholdSpec | undefined {
  for (const [pattern, compare] of COMPARE) {
    const match = rest.match(pattern);
    if (!match) {
      continue;
    }
    const requirement = parseRequirement(rest.slice(match[0].length));
    if (!requirement) {
      return undefined;
    }
    const allTerms = [...requirement.terms, ...extra];
    // Storm counts, commander tax and opponents say the most; otherwise it's about what you have,
    // unless that's your life, which is about what the life pays for
    const telling = widgetFor([haveKind, ...allTerms.map((term) => term.kind)]);
    const widget =
      ['storm', 'commander-tax', 'opponent-count'].includes(telling) || have.key === 'life' ? telling : haveKind;
    const terms = allTerms.map(({ quantity, coefficient }) => ({ quantity, coefficient }));
    if (widget === 'storm') {
      return stormThreshold(requirement.base, terms);
    }
    // A fixed number needs no calculator
    return terms.length > 0 ? { widget, model: 'threshold', have, compare, base: requirement.base, terms } : undefined;
  }
  return undefined;
}

function stormThreshold(base: number, terms: ThresholdSpec['terms']): StormThresholdSpec | undefined {
  const casts = terms.find((term) => term.quantity.key === 'casts');
  if (terms.length > (casts ? 1 : 0)) {
    return undefined;
  }
  const commander = casts?.quantity.label.match(/^Times (.+) was cast/)?.[1];
  return {
    widget: 'storm-threshold',
    model: 'storm-threshold',
    counting: 'spells',
    base,
    ...(casts && { perCast: casts.coefficient, commander }),
  };
}

const LIFE: Quantity = quantity('life', 'Your life total', 1, 200, 40);

/* A prerequisite that says how much of something you need, worked out from other numbers. */
export function parseThreshold(sentence: string): ThresholdSpec | StormThresholdSpec | undefined {
  const spec = thresholdOf(sentence);
  return spec?.model === 'threshold' ? { ...spec, source: sentence.trim() } : spec;
}

function thresholdOf(sentence: string): ThresholdSpec | StormThresholdSpec | undefined {
  const text = sentence.trim().replace(/\.$/, '');
  let match;
  // What the storm count buys: "… can be cast using X or less colored mana, where X is equal to four plus twice
  // the number of instants and sorceries you've cast this turn"
  if (
    (match = text.match(
      new RegExp(
        `using X or less colored mana, where X is equal to ${N} plus (twice )?the number of (instants and sorceries|spells) you've cast this turn$`,
        'i',
      ),
    ))
  ) {
    return {
      widget: 'storm-threshold',
      model: 'storm-threshold',
      counting: match[3].toLowerCase() === 'spells' ? 'spells' : 'instants and sorceries',
      base: 0,
      capacity: {
        label: 'Most colored mana the other spell can cost',
        base: toNumber(match[1]),
        perSpell: match[2] ? 2 : 1,
      },
    };
  }
  // Storm counts: "You have a storm count of at least three", "Storm count at least 4"
  if (
    (match = text.match(
      new RegExp(
        `^(?:you have a |your )?storm count (?:is )?(?:of )?(?:at least )?${N}(?: or (?:higher|greater|more))?$`,
        'i',
      ),
    ))
  ) {
    return stormThreshold(toNumber(match[1]), []);
  }
  if (
    (match = text.match(
      new RegExp(
        `^your storm count is equal to or (?:greater|higher) than the number of times you've cast (.+?) this game divided by ${N}, rounded up$`,
        'i',
      ),
    ))
  ) {
    return {
      widget: 'storm-threshold',
      model: 'storm-threshold',
      counting: 'spells',
      base: 0,
      castDivisor: toNumber(match[2]),
      commander: shortName(match[1]),
    };
  }
  if ((match = text.match(/^your storm count (.+)$/i))) {
    return threshold(quantity('storm', 'Spells cast this turn', 0, 30, 0), 'storm', match[1]);
  }
  // "You control a number of Goblins that is equal to or greater than six plus Krenko's commander tax"
  if (
    (match = text.match(
      /^you control a number of (.+?) ((?:that is |which is )?(?:equal to|greater than|at least).+)$/i,
    ))
  ) {
    const have = measure(`${match[1]} you control`);
    return have && threshold(have.quantity, have.kind, match[2]);
  }
  // "You have sacrificed at least three artifacts and/or creatures this turn, plus an additional … for each time you've cast Dargo …"
  if (
    (match = text.match(
      new RegExp(`^you have sacrificed at least ${N} (.+?) this turn((?:,? (?:plus|minus) .+)?)$`, 'i'),
    ))
  ) {
    const have = quantity('sacrificed', `${capitalize(match[2])} sacrificed this turn`, 0, 60, toNumber(match[1]));
    return threshold(have, 'count-scaled-cost', `at least ${match[1]}${match[3]}`);
  }
  // "There have been a number of permanents sacrificed this turn equal to five plus The Balrog's commander tax"
  if ((match = text.match(/^there have been a number of (.+?) sacrificed this turn (equal to .+)$/i))) {
    return threshold(
      quantity('sacrificed', `${capitalize(match[1])} sacrificed this turn`, 0, 60, 5),
      'count-scaled-cost',
      match[2],
    );
  }
  // "There are at least X counters on …, where X is three plus the number of times you've cast …"
  if ((match = text.match(/^there are at least X (.+?), where X is (.+)$/i))) {
    return threshold(quantity('count', capitalize(match[1]), 0, 60, 3), 'count-scaled-cost', `at least ${match[2]}`);
  }
  // "Elenda has at least three +1/+1 counters on it, plus an additional +1/+1 counter for each time …"
  if ((match = text.match(new RegExp(`^(.+?) has at least ${N} \\+1/\\+1 counters? on it((?:,? plus .+)?)$`, 'i')))) {
    const have = measure(`+1/+1 counters on ${match[1]}`);
    return have && threshold(have.quantity, have.kind, `at least ${match[2]}${match[3]}`);
  }
  // "Teferi has an amount of loyalty counters on it equal to eleven minus twice the number of other planeswalkers you control"
  if ((match = text.match(/^(.+?) has an amount of loyalty counters on it (equal to .+)$/i))) {
    return threshold(quantity('loyalty', `Loyalty counters on ${match[1]}`, 0, 20, 5), 'stat-scaled-cost', match[2]);
  }
  // "Your life total is at least twenty minus the highest power among creatures you control"
  if (
    (match = text.match(
      /^your life total is ((?:at least|greater than or equal to|equal to or greater than|greater than) .+)$/i,
    ))
  ) {
    return threshold(LIFE, 'count-scaled-cost', match[1]);
  }
  // "Your life total plus the number of creatures you control is equal to or greater than twenty"
  if ((match = text.match(/^your life total plus the number of (.+?) (is .+)$/i))) {
    const other = measure(match[1]);
    return other && threshold(LIFE, other.kind, match[2], [{ ...other, coefficient: -1 }]);
  }
  // "The number of nontoken creatures you control plus the number of creature cards in all graveyards is at least nine",
  // "The number of creatures you control plus 2 times the number of other planeswalkers you control is at least 11"
  if (
    (match = text.match(
      new RegExp(`^the number of (.+?) plus (?:${N} times |twice )?the number of (.+?) (is .+)$`, 'i'),
    ))
  ) {
    const have = measure(match[1]);
    const other = measure(match[3]) ?? {
      kind: 'count-scaled-cost' as Kind,
      quantity: quantity('other', capitalize(match[3]), 0, 60, 3),
    };
    const times = match[2] ? toNumber(match[2]) : /\btwice the number\b/i.test(text) ? 2 : 1;
    return have && threshold(have.quantity, have.kind, match[4], [{ ...other, coefficient: -times }]);
  }
  // "The number of creatures on the battlefield is equal to or greater than eight minus the number of Clue tokens you control"
  if ((match = text.match(/^the number of (.+?) (is .+)$/i))) {
    return threshold(quantity('count', capitalize(match[1]), 0, 60, 5), 'count-scaled-cost', match[2]);
  }
  // "Obeka's power is greater than or equal to 8 minus the number of artifacts you control that share a name with …",
  // "Elenda's power is at least 4 plus its commander tax", "Elenda has power equal to or greater than 2 plus …"
  if ((match = text.match(/^(.+?)(?:'s (power|toughness) | has (power|toughness) (?=equal|greater|at least))(.+)$/i))) {
    const have = measure(`${match[1]}'s ${match[2] ?? match[3]}`);
    const rest = match[4]
      .replace(/,? minus an additional .+$/i, '')
      .replace(/\bits commander tax\b/i, `${match[1]}'s commander tax`);
    return have && threshold(have.quantity, have.kind, rest);
  }
  // "The total power of creatures you control is at least 10 plus Ghalta's commander tax"
  if ((match = text.match(/^the total (power|toughness) of (.+?) (is .+)$/i))) {
    return threshold(quantity('total', `Total ${match[1]} of ${match[2]}`, 0, 100, 10), 'stat-scaled-cost', match[3]);
  }
  // "You control at least two additional artifacts for each time you've cast The Cyber-Controller …"
  if ((match = text.match(new RegExp(`^you control at least ${N} (?:additional )?(.+?) for each (.+)$`, 'i')))) {
    const per = measure(match[3]);
    return (
      per && {
        widget: widgetFor([per.kind]) as ScalingWidget,
        model: 'threshold',
        have: quantity('count', `${pluralPhrase(match[2])} you control`, 0, 60, 2),
        compare: '>=',
        base: 0,
        terms: [{ quantity: per.quantity, coefficient: toNumber(match[1]) }],
      }
    );
  }
  // "You have at least one additional card in your graveyard for each opponent you have"
  if ((match = text.match(new RegExp(`^you have (?:at least )?(?:${N} |an )?additional (.+?) for each (.+)$`, 'i')))) {
    const per = measure(match[3]);
    return (
      per && {
        widget: widgetFor([per.kind]) as ScalingWidget,
        model: 'threshold',
        have: quantity('count', `Additional ${match[2].replace(/^(\w+)/, (word) => pluralize(word))}`, 0, 60, 3),
        compare: '>=',
        base: 0,
        terms: [{ quantity: per.quantity, coefficient: match[1] ? toNumber(match[1]) : 1 }],
      }
    );
  }
  return undefined;
}
