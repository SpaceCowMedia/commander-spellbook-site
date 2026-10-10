import { describe, expect, test } from 'vitest';
import { parseLifeLoop } from 'lib/combo/widgets/parse/lifeLoop';

describe('parseLifeLoop', () => {
  test('reads payments, casts and Aetherflux gains, with every cast gaining the storm count', () => {
    expect(
      parseLifeLoop(
        [
          "Cast Leshrac's Sigil by paying 4 life.",
          "K'rrik and Aetherflux Reservoir triggers.",
          'Resolve the Aetherflux Reservoir triggers, gaining you life equal to the number of spells that you have cast this turn.',
          "Activate Leshrac Sigil's second ability by paying 4 life, returning it to your hand.",
          'Repeat for infinite life.',
        ].join('\n'),
      ),
    ).toEqual({
      setup: [],
      loop: [{ kind: 'pay', life: 4 }, { kind: 'cast' }, { kind: 'storm-gain' }, { kind: 'pay', life: 4 }],
    });
  });

  test('finds the repeated steps', () => {
    const lines = ['Pay 2 life.', 'Gain 1 life.', 'Pay 3 life.'];
    const loopOf = (repeat: string) => parseLifeLoop([...lines, repeat].join('\n'));
    expect(loopOf('Repeat.')).toMatchObject({ setup: [], loop: [{ life: 2 }, { life: 1 }, { life: 3 }] });
    expect(loopOf('Repeat from step 2.')).toMatchObject({ setup: [{ life: 2 }], loop: [{ life: 1 }, { life: 3 }] });
    expect(loopOf('Repeat step 2.')).toMatchObject({ setup: [{ life: 2 }], loop: [{ life: 1 }] });
    expect(loopOf('Repeat steps 1 through 2.')).toMatchObject({ setup: [], loop: [{ life: 2 }, { life: 1 }] });
    expect(loopOf('Repeat from step 2 for each remaining trigger.')).toBeUndefined();
    expect(parseLifeLoop(lines.join('\n'))).toBeUndefined();
  });

  test('ignores life that someone else loses', () => {
    expect(
      parseLifeLoop('Activate the ability, causing each opponent to lose 1 life and you to gain that much.\nRepeat.')
        ?.loop,
    ).toEqual([{ kind: 'drain', perOpponent: 1 }]);
  });

  test('reads choices, variables, phyrexian mana and optional payments', () => {
    expect(
      parseLifeLoop(
        'Cast Timeline Culler from your hand by paying {B}{B} or from your graveyard for its warp cost by paying {B} and 2 life.\nRepeat.',
      )?.loop[0],
    ).toEqual({
      kind: 'pay-choice',
      options: [
        { label: 'From your hand by paying {B}{B}', life: 0 },
        { label: 'From your graveyard for its warp cost by paying {B} and 2 life', life: 2 },
      ],
    });
    expect(
      parseLifeLoop("Cast the creature, paying X life, where X is the creature's mana value.\nRepeat."),
    ).toMatchObject({
      loop: [{ kind: 'pay-x' }, { kind: 'cast' }],
      variable: { key: 'x', label: "The creature's mana value" },
    });
    expect(parseLifeLoop('Activate Hex Parasite by paying {1}{B/P}{B/P}.\nRepeat.')?.loop).toEqual([
      { kind: 'pay', life: 4 },
    ]);
    expect(parseLifeLoop('If needed, activate Treasonous Ogre by paying 3 life, adding {R}.\nRepeat.')?.loop).toEqual([
      { kind: 'pay-or-mana', life: 3, mana: 1 },
    ]);
  });

  test('counts the first extort payment for every creature with extort', () => {
    expect(
      parseLifeLoop(
        [
          'Cast Mourning by paying 2 life if able, or {B} otherwise.',
          "Each creature you control's extort ability triggers.",
          'Resolve the first extort trigger, causing you to pay 2 life if able, or {W/B} otherwise, causing each opponent to lose 1 life and you to gain that much life.',
          'Repeat step 3 for each remaining extort trigger.',
          'Activate Mourning by paying 2 life, returning it from the battlefield to your hand.',
          'Repeat until an opponent loses the game due to having 0 or less life.',
        ].join('\n'),
      )?.loop,
    ).toEqual([{ kind: 'pay', life: 2 }, { kind: 'cast' }, { kind: 'extort', life: 2 }, { kind: 'pay', life: 2 }]);
  });

  test('drains equal to your devotion when Gray Merchant enters', () => {
    expect(parseLifeLoop('Gray Merchant of Asphodel enters, draining each opponent.\nRepeat.')?.loop).toEqual([
      { kind: 'drain', perOpponent: 'devotion' },
    ]);
  });
});
