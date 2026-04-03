import { EstimateBracketResult, Card, Variant, ClassifiedVariant } from '@space-cow-media/spellbook-client';
import React from 'react';
import CardImage from 'components/layout/CardImage/CardImage';
import styles from './DeckBracket.module.scss';
import ComboResults from 'components/search/ComboResults/ComboResults';
import { BRACKET_NAME_MAP, BRACKET_RANGE_MAP } from 'lib/brackets';
import Icon from 'components/layout/Icon/Icon';

interface Props {
  results?: EstimateBracketResult;
}

const DeckBracket = ({ results }: Props) => {
  if (!results) {
    return (
      <div>
        <br />
        <h1 className="heading-subtitle">Loading Bracket Estimate...</h1>
      </div>
    );
  }
  const powerLevelFactors: string[] = [];
  const bannedCards = results.cards.filter((card) => card.banned).map((card) => card.card);
  const gameChangerCards = results.cards.filter((card) => card.gameChanger).map((card) => card.card);
  const extraTurnCards = results.cards.filter((card) => card.extraTurn).map((card) => card.card);
  const massLandDenialCards = results.cards.filter((card) => card.massLandDenial).map((card) => card.card);
  const extraTurnsCombos = results.combos.filter((combo) => combo.extraTurn).map((combo) => combo.combo);
  const massLandDenialCombos = results.combos.filter((combo) => combo.massLandDenial).map((combo) => combo.combo);
  const controlAllOpponentsCombos = results.combos
    .filter((combo) => combo.controlAllOpponents)
    .map((combo) => combo.combo);
  const lockCombos = results.combos.filter((combo) => combo.lock).map((combo) => combo.combo);
  const skipTurnsCombos = results.combos.filter((combo) => combo.skipTurns).map((combo) => combo.combo);
  const controlSomeOpponentsCombos = results.combos
    .filter((combo) => combo.controlSomeOpponents)
    .map((combo) => combo.combo);
  if (bannedCards.length > 0) {
    powerLevelFactors.push(
      `Having banned cards lies outside the bracket classification and thus your deck's bracket is undefined. You have ${bannedCards.length} banned cards.`,
    );
  }
  if (gameChangerCards.length > 3) {
    powerLevelFactors.push(
      `Having more than 3 game changer cards pushes your deck into bracket 4+. You have ${gameChangerCards.length}.`,
    );
  } else if (gameChangerCards.length > 0) {
    powerLevelFactors.push(
      `Having between 1 and 3 game changer cards pushes your deck into bracket 3+. You have ${gameChangerCards.length}.`,
    );
  }
  if (extraTurnCards.length >= 2) {
    powerLevelFactors.push(
      `Having two or more extra turn cards pushes your deck into bracket 4+. You have ${extraTurnCards.length}.`,
    );
  } else if (extraTurnCards.length > 0) {
    powerLevelFactors.push('Having one extra turn card pushes your deck into bracket 2+.');
  }
  if (extraTurnsCombos.length > 0) {
    powerLevelFactors.push(
      `Having extra turn combos pushes your deck into bracket 4+. You have ${extraTurnsCombos.length} combos.`,
    );
  }
  if (massLandDenialCards.length > 0) {
    powerLevelFactors.push(
      `Having mass land denial cards pushes your deck into bracket 4+. You have ${massLandDenialCards.length}.`,
    );
  }
  if (massLandDenialCombos.length > 0) {
    powerLevelFactors.push(
      `Having mass land denial combos pushes your deck into bracket 4+. You have ${massLandDenialCombos.length}.`,
    );
  }
  if (controlAllOpponentsCombos.length > 0) {
    powerLevelFactors.push(
      `Having combos that make you control all opponents pushes your deck into bracket 4+. You have ${controlAllOpponentsCombos.length}.`,
    );
  } else if (controlSomeOpponentsCombos.length > 0) {
    powerLevelFactors.push(
      `Having combos that make you control some opponents pushes your deck into bracket 3/4+. You have ${controlSomeOpponentsCombos.length}.`,
    );
  }
  if (lockCombos.length > 0) {
    powerLevelFactors.push(
      `Having combos locking your opponents from taking relevant game actions pushes your deck into bracket 3/4+. You have ${lockCombos.length}.`,
    );
  }
  if (skipTurnsCombos.length > 0) {
    powerLevelFactors.push(
      `Having combos that allow you to skip many turns pushes your deck into bracket 3/4+. You have ${skipTurnsCombos.length}.`,
    );
  }
  let other = results.combos.filter((combo) => combo.arguablyTwoCard);
  const fastGameWinningTwoCardCombos = other.filter(
    (combo) => combo.speed >= 4 && combo.definitelyTwoCard && combo.relevant,
  );
  other = other.filter((combo) => combo.speed < 4 || !combo.definitelyTwoCard || !combo.relevant);
  const fastGameWinningCombos = other.filter((combo) => combo.speed >= 4 && combo.relevant);
  other = other.filter((combo) => combo.speed < 4 || !combo.relevant || !combo.arguablyTwoCard);
  const fastPowerfulTwoCardCombos = other.filter((combo) => combo.definitelyTwoCard && combo.borderlineRelevant);
  other = other.filter((combo) => !combo.definitelyTwoCard || !combo.borderlineRelevant);
  const normalGameWinningTwoCardCombos = other.filter(
    (combo) => combo.speed >= 3 && combo.definitelyTwoCard && combo.relevant,
  );
  other = other.filter((combo) => combo.speed < 3 || !combo.definitelyTwoCard || !combo.relevant);
  const normalPowerfulTwoCardCombos = other.filter((combo) => combo.speed >= 3 && combo.borderlineRelevant);
  other = other.filter((combo) => combo.speed < 3 || !combo.borderlineRelevant);
  const slowGameWinningTwoCardCombos = other.filter(
    (combo) => combo.speed >= 2 && combo.definitelyTwoCard && combo.relevant,
  );
  if (fastGameWinningTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      `Having fast, game-winning, two card combos pushes your deck into bracket 4+. You have ${fastGameWinningTwoCardCombos.length}.`,
    );
  }
  if (fastGameWinningCombos.length > 0) {
    powerLevelFactors.push(
      `Having fast, game-winning combos involving few cards pushes your deck into brackets 3 or 4+. You have ${fastGameWinningCombos.length}.`,
    );
  }
  if (fastPowerfulTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      `Having fast, powerful, two card combos pushes your deck into brackets 3 or 4+. You have ${fastPowerfulTwoCardCombos.length}.`,
    );
  }
  if (normalGameWinningTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      `Having game-winning combos involving few cards pushes your deck into bracket 3+. You have ${normalGameWinningTwoCardCombos.length}.`,
    );
  }
  if (normalPowerfulTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      `Having powerful, two card combos pushes your deck into brackets 2 or 3+. You have ${normalPowerfulTwoCardCombos.length}.`,
    );
  }
  if (slowGameWinningTwoCardCombos.length > 0) {
    powerLevelFactors.push(
      `Having late game, game-winning, two card combos pushes your deck into bracket 2+. You have ${slowGameWinningTwoCardCombos.length}.`,
    );
  }

  return (
    <div className="py-4">
      <br />
      <h1 className="heading-subtitle">Commander Bracket Info</h1>
      <h1 className="heading-subtitle">
        <b>Our Estimate:</b> {BRACKET_NAME_MAP[results.bracketTag]} (Bracket {BRACKET_RANGE_MAP[results.bracketTag]})
      </h1>
      <ul className="mt-3 mb-12 flex flex-col items-left gap-2 border border-dark rounded-lg bg-pink-400/10 p-4">
        {powerLevelFactors.map((factor, index) => (
          <li key={index}>
            <Icon name="greaterThan" /> {factor}
          </li>
        ))}
      </ul>

      <CardList title="Banned Cards" cards={bannedCards} />
      <CardList title="Game Changers" cards={gameChangerCards} />
      <CardList title="Mass Land Denial Cards" cards={massLandDenialCards} />
      <CardList title="Extra Turn Cards" cards={extraTurnCards} />

      <ComboList title="Fast, Game-Winning, Two Card Combos" combos={fastGameWinningTwoCardCombos} />
      <ComboList title="Fast, Game-Winning Combos Involving Few Cards" combos={fastGameWinningCombos} />
      <ComboList title="Fast, Powerful, Two Card Combos" combos={fastPowerfulTwoCardCombos} />
      <ComboList title="Game-Winning Combos Involving Few Cards" combos={normalGameWinningTwoCardCombos} />
      <ComboList title="Powerful, Two Card Combos" combos={normalPowerfulTwoCardCombos} />
      <ComboList title="Late Game, Game-Winning, Two Card Combos" combos={slowGameWinningTwoCardCombos} />
      <ComboList title="Controll All Opponents Combos" combos={controlAllOpponentsCombos} />
      <ComboList title="Control Some Opponents Combos" combos={controlSomeOpponentsCombos} />
      <ComboList title="Extra Turn Combos" combos={extraTurnsCombos} />
      <ComboList title="Lock Combos" combos={lockCombos} />
      <ComboList title="Mass Land Denial Combos" combos={massLandDenialCombos} />
      <ComboList title="Skip Turn Combos" combos={skipTurnsCombos} />
    </div>
  );
};

interface CardListProps {
  title: React.ReactNode;
  cards: Card[];
}
const CardList = ({ title, cards }: CardListProps) => {
  if (!cards.length) {
    return null;
  }
  return (
    <>
      <h2 className="heading-subtitle mt-4 mb-2">
        {title} ({cards.length})
      </h2>
      <div className="flex justify-center w-full mb-8 flex-wrap gap-4">
        {cards.map((card) => (
          <CardImage className={styles.card} card={card} key={card.id} />
        ))}
      </div>
    </>
  );
};

interface ComboListProps {
  title: React.ReactNode;
  combos: ClassifiedVariant[] | Variant[];
}
const ComboList = ({ title, combos }: ComboListProps) => {
  if (!combos.length) {
    return null;
  }
  return (
    <>
      <h2 className="heading-subtitle mt-4 mb-2">
        {title} ({combos.length})
      </h2>
      <ComboResults results={combos} hideVariants={true} />
    </>
  );
};

export default DeckBracket;
