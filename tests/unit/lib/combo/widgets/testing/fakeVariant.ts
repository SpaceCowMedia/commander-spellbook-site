import type { Variant } from '@space-cow-media/spellbook-client';
import fixtures from './variants.json';

/* `battlefieldCardState` is how it starts out on the battlefield, like "as a copy of Radiant Solar" */
type Card =
  | string
  | { name: string; mustBeCommander?: boolean; typeLine?: string; quantity?: number; battlefieldCardState?: string };

/* a template by its name, which stands for any card that fits it */
type Template = string | { name: string; quantity?: number; battlefieldCardState?: string };

export interface FakeVariant {
  id?: string;
  uses?: Card[];
  requires?: Template[];
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
      const {
        name,
        mustBeCommander = false,
        typeLine = '',
        quantity = 1,
        battlefieldCardState = '',
      } = typeof card === 'string' ? { name: card } : card;
      return {
        card: { name, faces: name.split(' // ').length, typeLine },
        mustBeCommander,
        quantity,
        battlefieldCardState,
      };
    }),
    requires: (fake.requires ?? []).map((template) => {
      const {
        name,
        quantity = 1,
        battlefieldCardState = '',
      } = typeof template === 'string' ? { name: template } : template;
      return { template: { name }, mustBeCommander: false, quantity, battlefieldCardState };
    }),
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
