import {
  BracketTagEnum,
  ClassifiedCard,
  ClassifiedVariant,
  EstimateBracketResult,
} from '@space-cow-media/spellbook-client';

export const COMMANDER_BRACKETS = ['Exhibition', 'Core', 'Upgraded', 'Optimized', 'cEDH'];

export const BRACKET_NAME_MAP = {
  R: 'Ruthless',
  S: 'Spicy',
  P: 'Powerful',
  O: 'Oddball',
  C: 'Core',
  E: 'Exhibition',
  B: 'Not Legal',
};

export const BRACKET_RANGE_MAP = {
  R: '4+',
  S: '3-4+',
  P: '3+',
  O: '2-3+',
  C: '2+',
  E: '1+',
  B: 'N/A',
};

export const BRACKET_DESCRIPTION_MAP = {
  R: 'For competitive decks at brackets 4+',
  S: 'Probably 3 or 4, but hard to classify',
  P: 'For strong decks in bracket 3+',
  O: 'Probably 2 or 3, but hard to classify',
  C: 'For unoptimized decks in bracket 2+',
  E: 'For any deck',
  B: 'Not legal in any bracket',
};

export const BRACKET_CRITERIA_MAP = {
  R: 'Relevant two-card combo that is probably very fast or results in infinite turns or mass land denial or infinite control of opponents turns or contains four or more game changers',
  S: "Combos that could be ruthless but may require a third card or don't produce a relevant result, or stall the game in some way",
  P: 'Combos with a game changer or a slow but relevant two-card combo',
  O: "Combos that could be powerful but may require a third card or don't produce a relevant result",
  C: 'Combos that contains an extra turn card but no extra turn result, or a two-card combo too fast for bracket 1',
  E: "Combos that don't fit the other categories",
  B: 'Combos that are not legal in any bracket',
};

/* The lowest bracket a tag fits, and the lowest one it surely fits when the ones in between are borderline. */
export const BRACKET_FIT_MAP = {
  R: { lowest: 4, sure: 4 },
  S: { lowest: 3, sure: 4 },
  P: { lowest: 3, sure: 3 },
  O: { lowest: 2, sure: 3 },
  C: { lowest: 2, sure: 2 },
  E: { lowest: 1, sure: 1 },
  B: null,
};

export type BracketFit = 'fits' | 'borderline' | 'excluded';

export function bracketFit(tag: BracketTagEnum, bracket: number): BracketFit {
  const fit = BRACKET_FIT_MAP[tag];
  if (!fit || bracket < fit.lowest) {
    return 'excluded';
  }
  return bracket < fit.sure ? 'borderline' : 'fits';
}

function isComboGameWinning(combo: ClassifiedVariant) {
  return combo.relevant && !combo.combo.produces.some((result) => result.feature.name === 'Draw the game');
}

function isComboGameEnding(combo: ClassifiedVariant) {
  return combo.relevant;
}

export function totalQuantity(entries: { quantity: number }[]) {
  return entries.reduce((total, entry) => total + entry.quantity, 0);
}

export function computeBracketInfo(bracketEstimate: EstimateBracketResult) {
  const bannedCards = bracketEstimate.cards.filter((card) => card.banned);
  const gameChangerCards = bracketEstimate.cards.filter((card) => card.gameChanger);
  const extraTurnCards = bracketEstimate.cards.filter((card) => card.extraTurn);
  const massLandDenialCards = bracketEstimate.cards.filter((card) => card.massLandDenial);
  const extraTurnsCombos = bracketEstimate.combos.filter((combo) => combo.extraTurn).map((combo) => combo.combo);
  const massLandDenialCombos = bracketEstimate.combos
    .filter((combo) => combo.massLandDenial)
    .map((combo) => combo.combo);
  const controlAllOpponentsCombos = bracketEstimate.combos
    .filter((combo) => combo.controlAllOpponents)
    .map((combo) => combo.combo);
  const lockCombos = bracketEstimate.combos.filter((combo) => combo.lock).map((combo) => combo.combo);
  const skipTurnsCombos = bracketEstimate.combos.filter((combo) => combo.skipTurns).map((combo) => combo.combo);
  const controlSomeOpponentsCombos = bracketEstimate.combos
    .filter((combo) => combo.controlSomeOpponents)
    .map((combo) => combo.combo);
  let other = bracketEstimate.combos.filter((combo) => combo.arguablyTwoCard);
  const fastGameWinningTwoCardCombos = other.filter(
    (combo) => combo.speed >= 4 && combo.definitelyTwoCard && isComboGameWinning(combo),
  );
  other = other.filter((combo) => combo.speed < 4 || !combo.definitelyTwoCard || !isComboGameWinning(combo));
  const fastGameEndingTwoCardCombos = other.filter(
    (combo) => combo.speed >= 4 && combo.definitelyTwoCard && isComboGameEnding(combo),
  );
  other = other.filter((combo) => combo.speed < 4 || !combo.definitelyTwoCard || !isComboGameEnding(combo));
  const fastGameWinningCombos = other.filter((combo) => combo.speed >= 4 && isComboGameWinning(combo));
  other = other.filter((combo) => combo.speed < 4 || !isComboGameWinning(combo));
  const fastGameEndingCombos = other.filter((combo) => combo.speed >= 4 && isComboGameEnding(combo));
  other = other.filter((combo) => combo.speed < 4 || !isComboGameEnding(combo));
  const fastPowerfulTwoCardCombos = other.filter(
    (combo) => combo.speed >= 4 && combo.definitelyTwoCard && combo.borderlineRelevant,
  );
  other = other.filter((combo) => combo.speed < 4 || !combo.definitelyTwoCard || !combo.borderlineRelevant);
  const normalGameWinningTwoCardCombos = other.filter(
    (combo) => combo.speed >= 3 && combo.definitelyTwoCard && isComboGameWinning(combo),
  );
  other = other.filter((combo) => combo.speed < 3 || !combo.definitelyTwoCard || !isComboGameWinning(combo));
  const normalGameEndingTwoCardCombos = other.filter(
    (combo) => combo.speed >= 3 && combo.definitelyTwoCard && isComboGameEnding(combo),
  );
  other = other.filter((combo) => combo.speed < 3 || !combo.definitelyTwoCard || !isComboGameEnding(combo));
  const normalPowerfulTwoCardCombos = other.filter((combo) => combo.speed >= 3 && combo.borderlineRelevant);
  other = other.filter((combo) => combo.speed < 3 || !combo.borderlineRelevant);
  const slowGameWinningTwoCardCombos = other.filter(
    (combo) => combo.speed >= 2 && combo.definitelyTwoCard && isComboGameWinning(combo),
  );
  other = other.filter((combo) => combo.speed < 2 || !combo.definitelyTwoCard || !isComboGameWinning(combo));
  const slowGameEndingTwoCardCombos = other.filter(
    (combo) => combo.speed >= 2 && combo.definitelyTwoCard && isComboGameEnding(combo),
  );
  return {
    bannedCards,
    gameChangerCards,
    extraTurnCards,
    massLandDenialCards,
    bannedCardCount: totalQuantity(bannedCards),
    gameChangerCardCount: totalQuantity(gameChangerCards),
    extraTurnCardCount: totalQuantity(extraTurnCards),
    massLandDenialCardCount: totalQuantity(massLandDenialCards),
    extraTurnsCombos,
    massLandDenialCombos,
    controlAllOpponentsCombos,
    controlSomeOpponentsCombos,
    lockCombos,
    skipTurnsCombos,
    fastGameWinningTwoCardCombos,
    fastGameEndingTwoCardCombos,
    fastGameWinningCombos,
    fastGameEndingCombos,
    fastPowerfulTwoCardCombos,
    normalGameWinningTwoCardCombos,
    normalGameEndingTwoCardCombos,
    normalPowerfulTwoCardCombos,
    slowGameWinningTwoCardCombos,
    slowGameEndingTwoCardCombos,
  };
}

export type BracketFactorKind =
  | 'banned'
  | 'gameChanger'
  | 'extraTurn'
  | 'massLandDenial'
  | 'control'
  | 'lock'
  | 'skipTurns'
  | 'winning'
  | 'ending'
  | 'powerful';

export interface BracketFactor {
  kind: BracketFactorKind;
  text: string;
  cards?: ClassifiedCard[];
}

export function getBracketFactors(bracketEstimate: EstimateBracketResult, singleCombo: boolean): BracketFactor[] {
  const info = computeBracketInfo(bracketEstimate);
  const factors: BracketFactor[] = [];
  if (info.bannedCardCount > 0) {
    factors.push({
      kind: 'banned',
      cards: info.bannedCards,
      text: singleCombo
        ? `This combo contains ${info.bannedCardCount} banned card${info.bannedCardCount > 1 ? 's' : ''}`
        : `Having banned cards lies outside the bracket classification and thus this card list's bracket is undefined. You have ${info.bannedCardCount} banned cards.`,
    });
  }
  if (info.gameChangerCardCount > 3) {
    factors.push({
      kind: 'gameChanger',
      cards: info.gameChangerCards,
      text: singleCombo
        ? `Having more than 3 game changer cards pushes this combo into bracket 4+. This combo has ${info.gameChangerCardCount}.`
        : `Having more than 3 game changer cards pushes this card list into bracket 4+. You have ${info.gameChangerCardCount}.`,
    });
  } else if (info.gameChangerCardCount > 0) {
    factors.push({
      kind: 'gameChanger',
      cards: info.gameChangerCards,
      text: singleCombo
        ? `Having between 1 and 3 game changer cards pushes this combo into bracket 3+. This combo has ${info.gameChangerCardCount}.`
        : `Having between 1 and 3 game changer cards pushes this card list into bracket 3+. You have ${info.gameChangerCardCount}.`,
    });
  }
  if (info.extraTurnCardCount >= 2) {
    factors.push({
      kind: 'extraTurn',
      cards: info.extraTurnCards,
      text: singleCombo
        ? `Having two or more extra turn cards pushes this combo into bracket 4+. This combo has ${info.extraTurnCardCount}.`
        : `Having two or more extra turn cards pushes this card list into bracket 4+. You have ${info.extraTurnCardCount}.`,
    });
  } else if (info.extraTurnCardCount > 0) {
    factors.push({
      kind: 'extraTurn',
      cards: info.extraTurnCards,
      text: singleCombo
        ? 'Having one extra turn card pushes this combo into bracket 2+.'
        : 'Having one extra turn card pushes this card list into bracket 2+.',
    });
  }
  if (info.extraTurnsCombos.length > 0) {
    factors.push({
      kind: 'extraTurn',
      text: singleCombo
        ? 'Resulting in extra turns pushes this combo into bracket 4+.'
        : `Having extra turn combos pushes this card list into bracket 4+. You have ${info.extraTurnsCombos.length} combos.`,
    });
  }
  if (info.massLandDenialCardCount > 0) {
    factors.push({
      kind: 'massLandDenial',
      cards: info.massLandDenialCards,
      text: singleCombo
        ? 'Having mass land denial cards pushes this combo into bracket 4+.'
        : `Having mass land denial cards pushes this card list into bracket 4+. You have ${info.massLandDenialCardCount}.`,
    });
  }
  if (info.massLandDenialCombos.length > 0) {
    factors.push({
      kind: 'massLandDenial',
      text: singleCombo
        ? 'Resulting in mass land denial pushes this combo into bracket 4+.'
        : `Having mass land denial combos pushes this card list into bracket 4+. You have ${info.massLandDenialCombos.length}.`,
    });
  }
  if (info.controlAllOpponentsCombos.length > 0) {
    factors.push({
      kind: 'control',
      text: singleCombo
        ? 'Resulting in controlling all opponents pushes this combo into bracket 4+.'
        : `Having combos that make you control all opponents pushes this card list into bracket 4+. You have ${info.controlAllOpponentsCombos.length}.`,
    });
  } else if (info.controlSomeOpponentsCombos.length > 0) {
    factors.push({
      kind: 'control',
      text: singleCombo
        ? 'Resulting in controlling some opponents pushes this combo into bracket 3+.'
        : `Having combos that make you control some opponents pushes this card list into bracket 3/4+. You have ${info.controlSomeOpponentsCombos.length}.`,
    });
  }
  if (info.lockCombos.length > 0) {
    factors.push({
      kind: 'lock',
      text: singleCombo
        ? 'Resulting in locking opponents pushes this combo into bracket 4+.'
        : `Having combos locking your opponents from taking relevant game actions pushes this card list into bracket 3/4+. You have ${info.lockCombos.length}.`,
    });
  }
  if (info.skipTurnsCombos.length > 0) {
    factors.push({
      kind: 'skipTurns',
      text: singleCombo
        ? 'Resulting in skipping turns pushes this combo into bracket 3+.'
        : `Having combos that allow you to skip many turns pushes this card list into bracket 3/4+. You have ${info.skipTurnsCombos.length}.`,
    });
  }
  if (info.fastGameWinningTwoCardCombos.length > 0) {
    factors.push({
      kind: 'winning',
      text: singleCombo
        ? 'Being a fast, game-winning, two card combo pushes this combo into bracket 4+.'
        : `Having fast, game-winning, two card combos pushes this card list into bracket 4+. You have ${info.fastGameWinningTwoCardCombos.length}.`,
    });
  }
  if (info.fastGameEndingTwoCardCombos.length > 0) {
    factors.push({
      kind: 'ending',
      text: singleCombo
        ? 'Being a fast, game-ending, two card combo pushes this combo into bracket 3+.'
        : `Having fast, game-ending, two card combos pushes this card list into bracket 3+. You have ${info.fastGameEndingTwoCardCombos.length}.`,
    });
  }
  if (info.fastGameWinningCombos.length > 0) {
    factors.push({
      kind: 'winning',
      text: singleCombo
        ? 'This fast, game-winning combo is likely bracket 3 or 4, depending on how easily your deck can access these cards and fulfill the prerequisites.'
        : `Having fast, game-winning combos involving few cards pushes this card list into bracket 3, or bracket 4+ if your deck can easily assemble those combos with a commander or redundant pieces. You have ${info.fastGameWinningCombos.length}.`,
    });
  }
  if (info.fastGameEndingCombos.length > 0) {
    factors.push({
      kind: 'ending',
      text: singleCombo
        ? 'Being a fast, game-ending combo pushes this combo into bracket 3+.'
        : `Having fast, game-ending combos involving few cards pushes this card list into bracket 3+. You have ${info.fastGameEndingCombos.length}.`,
    });
  }
  if (info.fastPowerfulTwoCardCombos.length > 0) {
    factors.push({
      kind: 'powerful',
      text: singleCombo
        ? 'This fast, powerful, two-card combo is likely bracket 3 or 4+, depending on how easily your deck can turn its results into a game win.'
        : `This card list has fast, two-card combos that require specific evaluation. Depending on how easily your deck can turn their results into a win, they push the list to bracket 3 or 4+. You have ${info.fastPowerfulTwoCardCombos.length}.`,
    });
  }
  if (info.normalGameWinningTwoCardCombos.length > 0) {
    factors.push({
      kind: 'winning',
      text: singleCombo
        ? 'Being a normal, game-winning, two-card combo pushes this combo into bracket 3+.'
        : `Having game-winning combos involving few cards pushes this card list into bracket 3+. You have ${info.normalGameWinningTwoCardCombos.length}.`,
    });
  }
  if (info.normalGameEndingTwoCardCombos.length > 0) {
    factors.push({
      kind: 'ending',
      text: singleCombo
        ? 'Being a normal, game-ending, two-card combo pushes this combo into bracket 2+.'
        : `Having game-ending combos involving few cards pushes this card list into bracket 2+. You have ${info.normalGameEndingTwoCardCombos.length}.`,
    });
  }
  if (info.normalPowerfulTwoCardCombos.length > 0) {
    factors.push({
      kind: 'powerful',
      text: singleCombo
        ? 'This combo is likely bracket 2 or 3+ depending on how easily your deck can assemble it and turn its results into a win.'
        : `This card list has combos that require specific evaluation. Depending on how powerful and easy to assemble they are in your deck, they push the list to bracket 2 or 3+. You have ${info.normalPowerfulTwoCardCombos.length}.`,
    });
  }
  if (info.slowGameWinningTwoCardCombos.length > 0) {
    factors.push({
      kind: 'winning',
      text: singleCombo
        ? 'Being a slow, game-winning, two-card combo pushes this combo into bracket 2+.'
        : `Having late game, game-winning, two-card combos pushes this card list into bracket 2+. You have ${info.slowGameWinningTwoCardCombos.length}.`,
    });
  }
  if (info.slowGameEndingTwoCardCombos.length > 0) {
    factors.push({
      kind: 'ending',
      text: singleCombo
        ? 'Being a slow, game-ending, two-card combo pushes this combo into bracket 2+.'
        : `Having late game, game-ending, two-card combos pushes this card list into bracket 2+. You have ${info.slowGameEndingTwoCardCombos.length}.`,
    });
  }
  return factors;
}
