import { expect, test } from 'vitest';
import { fakeVariant } from '../testing/fakeVariant';
import {
  allText,
  commanderName,
  findCard,
  findInSteps,
  has,
  prerequisites,
  shortName,
  statedNumber,
  steps,
  toNumber,
  uses,
  usesAny,
  usesMatching,
} from 'lib/combo/widgets/parse/variant';

const variant = fakeVariant({
  uses: [{ name: 'Krenko, Mob Boss', mustBeCommander: true }, 'Cut // Ribbons', 'Skirk Prospector'],
  easyPrerequisites: 'Krenko is on the battlefield. You have at least one other Goblin',
  notablePrerequisites: 'Your storm count is 2.\nYou have {R} available',
  description: 'Activate Krenko.\n\nSacrifice Goblins.\n',
  notes: 'A note.',
});

test('finds cards by their whole name or the name of a face', () => {
  expect(uses(variant, 'Ribbons')).toBe(true);
  expect(uses(variant, 'cut // ribbons')).toBe(true);
  expect(uses(variant, 'Cut')).toBe(true);
  expect(uses(variant, 'Krenko')).toBe(false);
  expect(has(variant, 'Skirk Prospector', 'Ribbons')).toBe(true);
  expect(usesAny(variant, ['Channel', 'Ribbons'])).toBe('Ribbons');
  expect(usesMatching(variant, /^Skirk\b/)).toBe('Skirk Prospector');
});

test('reads numbers written as words', () => {
  expect(toNumber('Twelve')).toBe(12);
  expect(toNumber('7')).toBe(7);
});

test('names legendary cards and commanders the way the texts do', () => {
  expect(shortName('Krenko, Mob Boss')).toBe('Krenko');
  expect(shortName('Jace, Vryn’s Prodigy // Jace, Telepath Unbound')).toBe('Jace');
  expect(commanderName(variant)).toBe('Krenko');
  expect(commanderName(fakeVariant({ description: 'Cast Rograkh, Son of Rohgahh from the command zone.' }))).toBe(
    undefined,
  );
  expect(commanderName(fakeVariant({ description: 'Cast Krenko from the command zone.' }))).toBe('Krenko');
});

test('splits prerequisites into sentences and steps into lines', () => {
  expect(prerequisites(variant)).toEqual([
    'Krenko is on the battlefield',
    'You have at least one other Goblin',
    'Your storm count is 2',
    'You have {R} available',
  ]);
  expect(steps(variant)).toEqual(['Activate Krenko.', 'Sacrifice Goblins.']);
  expect(findInSteps(variant, /^sacrifice (\w+)/i)?.[1]).toBe('Goblins');
  expect(allText(variant)).toContain('A note.');
});

test('finds the card itself, and numbers the prerequisites state', () => {
  expect(findCard(variant, 'Ribbons')?.name).toBe('Cut // Ribbons');
  expect(findCard(variant, 'Krenko')).toBeUndefined();
  expect(statedNumber(variant, /^You have at least (\w+) other Goblin$/)).toBe(1);
  expect(statedNumber(variant, /^Your storm count is (\w+)$/)).toBe(2);
  expect(statedNumber(variant, /^You have (\S+) available$/)).toBeUndefined();
});
