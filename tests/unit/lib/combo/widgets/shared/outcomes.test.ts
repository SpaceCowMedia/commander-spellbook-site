import { expect, test } from 'vitest';
import { compare, killedHeadline, lifeOutcome, moreLife, tableVerdict } from 'lib/combo/widgets/shared/outcomes';

test('says who dies and who survives, in words', () => {
  expect(lifeOutcome(0)).toEqual({ tone: 'good', text: 'Dies' });
  expect(lifeOutcome(1234)).toEqual({ tone: 'bad', text: 'Survives at 1,234' });
});

test('sums up the table', () => {
  const outcomes = [lifeOutcome(0), lifeOutcome(3), lifeOutcome(-2)];
  expect(tableVerdict(outcomes)).toEqual({ tone: 'warn', title: '2 of 3 opponents die' });
  expect(tableVerdict([lifeOutcome(0)])).toEqual({ tone: 'good', title: 'Every opponent dies' });
  expect(tableVerdict([lifeOutcome(5)])).toEqual({ tone: 'bad', title: 'No opponent dies' });
  expect(killedHeadline(outcomes)).toEqual({ label: 'Opponents killed', value: '2 of 3' });
});

test('compares what you have with what you need', () => {
  expect(compare(40, 33, { unit: 'life', enough: 'You can go off' })).toEqual({
    verdict: { tone: 'good', title: 'You can go off', detail: '7 to spare.' },
    meter: { have: 40, need: 33, unit: 'life' },
  });
  expect(compare(5, 8, { unit: 'cards', enough: 'Enough' }).verdict).toEqual({ tone: 'bad', title: '3 cards short' });
  expect(moreLife(12)).toEqual({ tone: 'bad', title: 'You need 12 more life' });
});
