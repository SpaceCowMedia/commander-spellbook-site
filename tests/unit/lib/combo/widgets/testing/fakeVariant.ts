import type { Variant } from '@space-cow-media/spellbook-client';
import fixtures from './variants.json';

type Card = string | { name: string; mustBeCommander?: boolean; typeLine?: string };

export interface FakeVariant {
  id?: string;
  uses?: Card[];
  manaNeeded?: string;
  easyPrerequisites?: string;
  notablePrerequisites?: string;
  description?: string | string[];
  notes?: string;
}

/* A variant with only the parts the widgets read filled in. */
export function fakeVariant(fake: FakeVariant): Variant {
  return {
    id: fake.id ?? 'fake',
    uses: (fake.uses ?? []).map((card) => {
      const { name, mustBeCommander = false, typeLine = '' } = typeof card === 'string' ? { name: card } : card;
      return { card: { name, faces: name.split(' // ').length, typeLine }, mustBeCommander, quantity: 1 };
    }),
    requires: [],
    manaNeeded: fake.manaNeeded ?? '',
    easyPrerequisites: fake.easyPrerequisites ?? '',
    notablePrerequisites: fake.notablePrerequisites ?? '',
    description: Array.isArray(fake.description) ? fake.description.join('\n') : (fake.description ?? ''),
    notes: fake.notes ?? '',
  } as unknown as Variant;
}

/* A real variant from the database, trimmed to the texts the widgets read. */
export function fixtureVariant(id: keyof typeof fixtures): Variant {
  return fakeVariant({ id, ...fixtures[id] });
}
