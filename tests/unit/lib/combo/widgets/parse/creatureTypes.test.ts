import { expect, test } from 'vitest';
import { creatureTypes, creaturesSharing, typesOf } from 'lib/combo/widgets/parse/creatureTypes';
import { fakeVariant } from '../testing/fakeVariant';

test("reads a creature's types from the front face, and the ones its rules text adds", () => {
  expect(creatureTypes('Zealous Conscripts', 'Creature — Human Warrior')).toEqual(['Human', 'Warrior']);
  expect(creatureTypes("Inspired Skypainter // Maestro's Gift", 'Creature — Lizard Wizard // Sorcery')).toEqual([
    'Lizard',
    'Wizard',
  ]);
  expect(creatureTypes('Mana Echoes', 'Enchantment')).toEqual([]);
  expect(creatureTypes('Stonework Packbeast', 'Artifact Creature — Beast')).toEqual([
    'Beast',
    'Cleric',
    'Rogue',
    'Warrior',
    'Wizard',
  ]);
});

test('counts the creatures of a combo that share a type', () => {
  const variant = fakeVariant({
    uses: [
      { name: "Saheeli, the Sun's Brilliance", typeLine: 'Legendary Creature — Human Artificer' },
      { name: 'Zealous Conscripts', typeLine: 'Creature — Human Warrior' },
      { name: 'Prismite', typeLine: 'Artifact Creature — Golem' },
      { name: 'Mana Echoes', typeLine: 'Enchantment' },
    ],
  });
  expect(typesOf(variant, 'Zealous Conscripts')).toEqual(['Human', 'Warrior']);
  expect(creaturesSharing(variant, ['Human', 'Warrior'])).toBe(2);
  expect(creaturesSharing(variant, ['Golem'])).toBe(1);
  expect(creaturesSharing(variant, [])).toBe(0);
});
