import type { Variant } from '@space-cow-media/spellbook-client';
import { findCard } from './variant';

/* Creature types a card gets from its rules text rather than its type line */
const ALSO: Record<string, string[]> = {
  'Stonework Packbeast': ['Cleric', 'Rogue', 'Warrior', 'Wizard'],
};

/* The creature types of a card's front face, none if it isn't a creature */
export function creatureTypes(name: string, typeLine: string): string[] {
  const front = typeLine.split(' // ')[0];
  if (!/\bCreature\b/.test(front)) {
    return [];
  }
  const subtypes = front.split(' — ')[1] ?? '';
  return [...subtypes.split(' ').filter(Boolean), ...(ALSO[name] ?? [])];
}

export function typesOf(variant: Variant, name: string): string[] {
  const card = findCard(variant, name);
  return card ? creatureTypes(card.name, card.typeLine) : [];
}

/* How many of the variant's creatures share a creature type with any of these */
export function creaturesSharing(variant: Variant, types: string[]): number {
  const shares = (name: string, typeLine: string) => creatureTypes(name, typeLine).some((type) => types.includes(type));
  return variant.uses.filter(({ card }) => shares(card.name, card.typeLine)).length;
}
