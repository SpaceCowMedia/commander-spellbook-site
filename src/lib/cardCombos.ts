import { Card, CardInVariant, Variant } from '@space-cow-media/spellbook-client';

export interface CardPartner {
  card: Card;
  count: number;
}

export interface CardResult {
  name: string;
  count: number;
}

function ranked<T>(entries: Map<string, { value: T; count: number; popularity: number }>, limit: number) {
  return [...entries.values()]
    .sort((a, b) => b.count - a.count || b.popularity - a.popularity)
    .slice(0, limit)
    .map(({ value, count }) => ({ value, count }));
}

export function topPartners(card: { id: number | null }, variants: Variant[], limit: number): CardPartner[] {
  const partners = new Map<string, { value: Card; count: number; popularity: number }>();
  for (const variant of variants) {
    const others = new Map(variant.uses.filter((use) => use.card.id !== card.id).map((use) => [use.card.id, use.card]));
    for (const [id, other] of others) {
      const entry = partners.get(String(id)) ?? { value: trimmedCard(other), count: 0, popularity: 0 };
      entry.count++;
      entry.popularity += variant.popularity ?? 0;
      partners.set(String(id), entry);
    }
  }
  return ranked(partners, limit).map(({ value, count }) => ({ card: value, count }));
}

export function topResults(variants: Variant[], limit: number): CardResult[] {
  const results = new Map<string, { value: string; count: number; popularity: number }>();
  for (const variant of variants) {
    for (const name of new Set(variant.produces.map((produced) => produced.feature.name))) {
      const entry = results.get(name) ?? { value: name, count: 0, popularity: 0 };
      entry.count++;
      entry.popularity += variant.popularity ?? 0;
      results.set(name, entry);
    }
  }
  return ranked(results, limit).map(({ value, count }) => ({ name: value, count }));
}

function trimmedCard(card: Card): Card {
  return {
    ...card,
    imageUriFrontPng: null,
    imageUriFrontLarge: null,
    imageUriFrontSmall: null,
    imageUriBackPng: null,
    imageUriBackLarge: null,
    imageUriBackSmall: null,
    imageUriFrontArtCrop: null,
    imageUriBackArtCrop: null,
  };
}

function trimmedUse(use: CardInVariant): CardInVariant {
  return { ...use, card: trimmedCard(use.card) };
}

export function toListedVariant(variant: Variant): Variant {
  return {
    ...variant,
    description: '',
    notes: '',
    of: [],
    includes: [],
    uses: variant.uses.map(trimmedUse),
  };
}
