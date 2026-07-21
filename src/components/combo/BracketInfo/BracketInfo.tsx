import { EstimateBracketResult } from '@space-cow-media/spellbook-client';
import Icon from 'components/layout/Icon/Icon';
import PlaceholderText from 'components/layout/PlaceholderText/PlaceholderText';
import { computeBracketInfo } from 'lib/brackets';

interface Props {
  bracketEstimate?: EstimateBracketResult;
  singleCombo?: boolean;
}

const BracketInfo = ({ bracketEstimate, singleCombo = false }: Props) => {
  if (!bracketEstimate) {
    return (
      <>
        <PlaceholderText></PlaceholderText>
        <br />
        <PlaceholderText></PlaceholderText>
        <br />
        <PlaceholderText></PlaceholderText>
      </>
    );
  }
  const info = computeBracketInfo(bracketEstimate);

  const powerLevelFactors: string[] = [];
  if (info.bannedCards.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? `This combo contains ${info.bannedCards.length} banned card${info.bannedCards.length > 1 ? 's' : ''}`
        : `Having banned cards lies outside the bracket classification and thus this card list's bracket is undefined. You have ${info.bannedCards.length} banned cards.`,
    );
  }
  if (info.gameChangerCards.length > 3) {
    powerLevelFactors.push(
      singleCombo
        ? `Having more than 3 game changer cards pushes this combo into bracket 4+. This combo has ${info.gameChangerCards.length}.`
        : `Having more than 3 game changer cards pushes this card list into bracket 4+. You have ${info.gameChangerCards.length}.`,
    );
  } else if (info.gameChangerCards.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? `Having between 1 and 3 game changer cards pushes this combo into bracket 3+. This combo has ${info.gameChangerCards.length}.`
        : `Having between 1 and 3 game changer cards pushes this card list into bracket 3+. You have ${info.gameChangerCards.length}.`,
    );
  }
  if (info.extraTurnCards.length >= 2) {
    powerLevelFactors.push(
      singleCombo
        ? `Having two or more extra turn cards pushes this combo into bracket 4+. This combo has ${info.extraTurnCards.length}.`
        : `Having two or more extra turn cards pushes this card list into bracket 4+. You have ${info.extraTurnCards.length}.`,
    );
  } else if (info.extraTurnCards.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Having one extra turn card pushes this combo into bracket 2+.'
        : 'Having one extra turn card pushes this card list into bracket 2+.',
    );
  }
  if (info.extraTurnsCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Resulting in extra turns pushes this combo into bracket 4+.'
        : `Having extra turn combos pushes this card list into bracket 4+. You have ${info.extraTurnsCombos.length} combos.`,
    );
  }

  if (info.massLandDenialCards.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Having mass land denial cards pushes this combo into bracket 4+.'
        : `Having mass land denial cards pushes this card list into bracket 4+. You have ${info.massLandDenialCards.length}.`,
    );
  }
  if (info.massLandDenialCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Resulting in mass land denial pushes this combo into bracket 4+.'
        : `Having mass land denial combos pushes this card list into bracket 4+. You have ${info.massLandDenialCombos.length}.`,
    );
  }
  if (info.controlAllOpponentsCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Resulting in controlling all opponents pushes this combo into bracket 4+.'
        : `Having combos that make you control all opponents pushes this card list into bracket 4+. You have ${info.controlAllOpponentsCombos.length}.`,
    );
  } else if (info.controlSomeOpponentsCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Resulting in controlling some opponents pushes this combo into bracket 3+.'
        : `Having combos that make you control some opponents pushes this card list into bracket 3/4+. You have ${info.controlSomeOpponentsCombos.length}.`,
    );
  }
  if (info.lockCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Resulting in locking opponents pushes this combo into bracket 4+.'
        : `Having combos locking your opponents from taking relevant game actions pushes this card list into bracket 3/4+. You have ${info.lockCombos.length}.`,
    );
  }
  if (info.skipTurnsCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Resulting in skipping turns pushes this combo into bracket 3+.'
        : `Having combos that allow you to skip many turns pushes this card list into bracket 3/4+. You have ${info.skipTurnsCombos.length}.`,
    );
  }
  if (info.fastGameWinningTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a fast, game-winning, two card combo pushes this combo into bracket 4+.'
        : `Having fast, game-winning, two card combos pushes this card list into bracket 4+. You have ${info.fastGameWinningTwoCardCombos.length}.`,
    );
  }
  if (info.fastGameEndingTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a fast, game-ending, two card combo pushes this combo into bracket 3+.'
        : `Having fast, game-ending, two card combos pushes this card list into bracket 3+. You have ${info.fastGameEndingTwoCardCombos.length}.`,
    );
  }
  if (info.fastGameWinningCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'This fast, game-winning combo is likely bracket 3 or 4, depending on how easily your deck can access these cards and fulfill the prerequisites.'
        : `Having fast, game-winning combos involving few cards pushes this card list into bracket 3, or bracket 4+ if your deck can easily assemble those combos with a commander or redundant pieces. You have ${info.fastGameWinningCombos.length}.`,
    );
  }
  if (info.fastGameEndingCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a fast, game-ending combo pushes this combo into bracket 3+.'
        : `Having fast, game-ending combos involving few cards pushes this card list into bracket 3+. You have ${info.fastGameEndingCombos.length}.`,
    );
  }
  if (info.fastPowerfulTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'This fast, powerful, two-card combo is likely bracket 3 or 4+, depending on how easily your deck can turn its results into a game win.'
        : `This card list has fast, two-card combos that require specific evaluation. Depending on how easily your deck can turn their results into a win, they push the list to bracket 3 or 4+. You have ${info.fastPowerfulTwoCardCombos.length}.`,
    );
  }
  if (info.normalGameWinningTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a normal, game-winning, two-card combo pushes this combo into bracket 3+.'
        : `Having game-winning combos involving few cards pushes this card list into bracket 3+. You have ${info.normalGameWinningTwoCardCombos.length}.`,
    );
  }
  if (info.normalGameEndingTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a normal, game-ending, two-card combo pushes this combo into bracket 2+.'
        : `Having game-ending combos involving few cards pushes this card list into bracket 2+. You have ${info.normalGameEndingTwoCardCombos.length}.`,
    );
  }
  if (info.normalPowerfulTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'This combo is likely bracket 2 or 3+ depending on how easily your deck can assemble it and turn its results into a win.'
        : `This card list has combos that require specific evaluation. Depending on how powerful and easy to assemble they are in your deck, they push the list to bracket 2 or 3+. ${info.normalPowerfulTwoCardCombos.length}.`,
    );
  }
  if (info.slowGameWinningTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a slow, game-winning, two-card combo pushes this combo into bracket 2+.'
        : `Having late game, game-winning, two-card combos pushes this card list into bracket 2+. You have ${info.slowGameWinningTwoCardCombos.length}.`,
    );
  }
  if (info.slowGameEndingTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      singleCombo
        ? 'Being a slow, game-ending, two-card combo pushes this combo into bracket 2+.'
        : `Having late game, game-ending, two-card combos pushes this card list into bracket 2+. You have ${info.slowGameEndingTwoCardCombos.length}.`,
    );
  }

  return (
    <ul className="mt-3 mb-12 flex flex-col items-left gap-2 border border-dark rounded-lg bg-pink-400/10 p-4">
      {powerLevelFactors.map((factor, index) => (
        <li key={index}>
          <Icon name="greaterThan" /> {factor}
        </li>
      ))}
      {powerLevelFactors.length === 0 && <li>No factors pushing this combo into a higher bracket were found.</li>}
    </ul>
  );
};

export default BracketInfo;
