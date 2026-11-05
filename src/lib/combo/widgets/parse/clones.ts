import type { Variant } from '@space-cow-media/spellbook-client';
import { getFaceNames } from 'lib/card/faces';
import { shortName } from './variant';

/* Clones a combo can use for something else they do, like Sakashima of a Thousand Faces lifting the
   legend rule, so that the combo needn't say what they copy: with nothing said, they can as well copy
   the creature the combo is built on. */
const SPECIAL_CLONES = new Set(['Sakashima of a Thousand Faces']);

/* A template that stands for any clone, like "Clone — Can Copy Opponent's Creatures" */
const CLONE_TEMPLATE = /\bclones?\b|\benters? (the battlefield )?as a copy\b/i;

/* How a combo says a card or template starts out on the battlefield as a copy of another card, like
   "as a copy of Radiant Solar", by the copied card's name or its short name */
const COPY_OF = /\bcopy of\b/i;

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Whether the state says it's a copy of `creature`, and not of some other card whose name starts the same */
function copies(state: string, creature: string): boolean {
  const names = [...new Set([creature, ...getFaceNames(creature), shortName(creature)])].map(escaped);
  return new RegExp(`\\bcopy of (${names.join('|')})(?=$|[\\s,.;])`, 'i').test(state);
}

/* A clone a combo uses: the card, or no name for a template that leaves the card to you */
export interface Clone {
  name?: string;
}

/* The clones a combo starts with as copies of `creature`, one for each copy the combo asks for, cards
   first. A card or template counts when its state on the battlefield says it's a copy of the creature;
   with nothing said of what it copies, a special clone or a clone template counts too. */
export function clonesOf(variant: Variant, creature: string): Clone[] {
  const counts = (state: string, otherwise: boolean) => (COPY_OF.test(state) ? copies(state, creature) : otherwise);
  const special = (name: string) => [name, ...getFaceNames(name)].some((face) => SPECIAL_CLONES.has(face));
  const cards = variant.uses
    .filter(({ card, battlefieldCardState }) => counts(battlefieldCardState ?? '', special(card.name)))
    .flatMap(({ card, quantity }) => Array.from({ length: quantity }, () => ({ name: card.name })));
  const templates = variant.requires
    .filter(({ template, battlefieldCardState }) =>
      counts(battlefieldCardState ?? '', CLONE_TEMPLATE.test(template.name)),
    )
    .flatMap(({ quantity }) => Array.from({ length: quantity }, (): Clone => ({})));
  return [...cards, ...templates];
}

/* The clones as a phrase: the cards by name, then "a clone" or "2 clones" for the templates */
export function describeClones(clones: Clone[]): string {
  const names = [...new Set(clones.flatMap(({ name }) => (name ? [name] : [])))];
  const unnamed = clones.filter(({ name }) => !name).length;
  const parts = [...names, ...(unnamed === 0 ? [] : unnamed === 1 ? ['a clone'] : [`${unnamed} clones`])];
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : (parts[0] ?? '');
}
