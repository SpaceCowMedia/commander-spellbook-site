import { expect, test } from 'vitest';
import { fakeVariant } from '../testing/fakeVariant';
import { clonesOf, describeClones } from 'lib/combo/widgets/parse/clones';

const KRARK = 'Krark, the Thumbless';

test('counts what starts on the battlefield as a copy of the creature, and only of that creature', () => {
  /* 670-1619-2719-3908, where both clones copy Radiant Solar */
  const solar = fakeVariant({
    uses: [
      'Sefris of the Hidden Ways',
      'Radiant Solar',
      { name: 'Sakashima of a Thousand Faces', battlefieldCardState: 'as a copy of Radiant Solar' },
      { name: 'Spark Double', battlefieldCardState: 'as a copy of Radiant Solar' },
    ],
  });
  expect(clonesOf(solar, 'Radiant Solar')).toEqual([
    { name: 'Sakashima of a Thousand Faces' },
    { name: 'Spark Double' },
  ]);
  expect(clonesOf(solar, KRARK)).toEqual([]);
});

test('reads the copied card by its name or its short name, but not by the start of another name', () => {
  const copyOf = (state: string) =>
    clonesOf(fakeVariant({ uses: [{ name: 'Dominion Saboteur', battlefieldCardState: state }] }), KRARK).length;
  expect(copyOf('as a copy of Krark, the Thumbless.')).toBe(1);
  expect(copyOf('as a copy of Krark')).toBe(1);
  expect(copyOf('As a copy of Krark and untapped')).toBe(1);
  expect(copyOf('as a copy of Krark-Clan Ironworks')).toBe(0);
  expect(copyOf('tapped')).toBe(0);
});

test('counts a special clone that says nothing of what it copies, once for each copy the combo asks for', () => {
  const variant = fakeVariant({
    uses: [
      KRARK,
      'Mirror Box',
      { name: 'Sakashima of a Thousand Faces', quantity: 2 },
      /* in hand, so not a copy of anything yet */
      'Spark Double',
    ],
  });
  expect(clonesOf(variant, KRARK)).toEqual([
    { name: 'Sakashima of a Thousand Faces' },
    { name: 'Sakashima of a Thousand Faces' },
  ]);
});

test('counts a template the same way, a clone template saying nothing of what it copies as well', () => {
  const variant = fakeVariant({
    uses: [KRARK],
    requires: [
      { name: "Clone — Can Copy Opponent's Creatures", quantity: 2 },
      'Creature that Enters as a Copy of a Creature You Control',
      { name: "Clone — Can Copy Opponent's Creatures", battlefieldCardState: 'as a copy of Storm-Kiln Artist' },
      { name: 'Card That Copies a Creature', battlefieldCardState: 'as a copy of Krark' },
      'Instant or Sorcery that Creates One or More Copies of a Creature You Control',
    ],
  });
  expect(clonesOf(variant, KRARK)).toEqual([{}, {}, {}, {}]);
});

test('names the clones, cards first and the ones left to you after', () => {
  expect(describeClones([{ name: 'Spark Double' }])).toBe('Spark Double');
  expect(describeClones([{ name: 'Spark Double' }, { name: 'Spark Double' }])).toBe('Spark Double');
  expect(describeClones([{}])).toBe('a clone');
  expect(describeClones([{ name: 'Clone' }, { name: 'Spark Double' }, {}, {}])).toBe(
    'Clone, Spark Double and 2 clones',
  );
  expect(describeClones([])).toBe('');
});
