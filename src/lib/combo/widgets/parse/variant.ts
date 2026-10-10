import type { Variant } from '@space-cow-media/spellbook-client';
import { getFaceNames } from 'lib/card/faces';

/* Reading a variant the way a player would: by its card names and the wording of its texts. */

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
};

/* A number written with digits or as a word, for use inside a larger pattern */
export const NUMBER = `(\\d+|${Object.keys(NUMBER_WORDS).join('|')})`;

/* A mana cost made of symbols, like {2}{U}{U} */
export const MANA = '((?:\\{[^}]+\\})+)';

export function toNumber(word: string): number {
  const lower = word.toLowerCase();
  return lower in NUMBER_WORDS ? NUMBER_WORDS[lower] : Number(lower);
}

function namesOf(name: string): string[] {
  const faces = getFaceNames(name);
  return faces.length > 1 ? [name, ...faces] : [name];
}

/* The card the variant uses by that name, or by that name for one of its faces. */
export function findCard(variant: Variant, name: string): Variant['uses'][number]['card'] | undefined {
  const wanted = name.toLowerCase();
  return variant.uses.find((card) => namesOf(card.card.name).some((n) => n.toLowerCase() === wanted))?.card;
}

export function uses(variant: Variant, name: string): boolean {
  return findCard(variant, name) !== undefined;
}

export function has(variant: Variant, ...names: string[]): boolean {
  return names.every((name) => uses(variant, name));
}

/* The first of the names that the variant uses. */
export function usesAny(variant: Variant, names: string[]): string | undefined {
  return names.find((name) => uses(variant, name));
}

export function usesMatching(variant: Variant, pattern: RegExp): string | undefined {
  return variant.uses.map((card) => card.card.name).find((name) => pattern.test(name));
}

/* How the texts refer to a card: legendary names by the part before the comma, like "Krenko". */
export function shortName(name: string): string {
  const face = getFaceNames(name)[0];
  return face.includes(', ') ? face.split(', ')[0] : face;
}

/* The card that must be your commander, or the one the steps cast from the command zone. */
export function commanderName(variant: Variant): string | undefined {
  const required = variant.uses.find((card) => card.mustBeCommander);
  if (required) {
    return shortName(required.card.name);
  }
  const cast = variant.description.match(/\bcast ([^.,]+?) from the command zone/i);
  return cast ? shortName(cast[1]) : undefined;
}

/* Prerequisites come as sentences, sometimes on separate lines. */
export function prerequisites(variant: Variant): string[] {
  return [variant.easyPrerequisites, variant.notablePrerequisites]
    .join('\n')
    .split(/\.\s+|\n/)
    .map((sentence) => sentence.trim().replace(/\.$/, ''))
    .filter((sentence) => sentence.length > 0);
}

/* A number a prerequisite states, captured by the pattern's first group: the "two" of "Animar has
   at least two +1/+1 counters on it" */
export function statedNumber(variant: Variant, pattern: RegExp): number | undefined {
  const match = prerequisites(variant)
    .map((sentence) => sentence.match(pattern))
    .find((found) => found !== null);
  const number = match ? toNumber(match[1]) : NaN;
  return Number.isNaN(number) ? undefined : number;
}

export function steps(variant: Variant): string[] {
  return variant.description
    .split('\n')
    .map((step) => step.trim())
    .filter((step) => step.length > 0);
}

export function allText(variant: Variant): string {
  return [
    variant.manaNeeded,
    variant.easyPrerequisites,
    variant.notablePrerequisites,
    variant.description,
    variant.notes,
  ].join('\n');
}

export function says(variant: Variant, pattern: RegExp): boolean {
  return pattern.test(allText(variant));
}

export function findInSteps(variant: Variant, pattern: RegExp): RegExpMatchArray | undefined {
  return steps(variant)
    .map((step) => step.match(pattern))
    .find((match) => match !== null) as RegExpMatchArray | undefined;
}
