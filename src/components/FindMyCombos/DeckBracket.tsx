import {
  EstimateBracketResult,
  Variant,
  ClassifiedCard,
  ClassifiedVariant,
  ClassifiedTemplate,
} from '@space-cow-media/spellbook-client';
import React from 'react';
import CardImage from 'components/layout/CardImage/CardImage';
import styles from './DeckBracket.module.scss';
import ComboResults from 'components/search/ComboResults/ComboResults';
import { BRACKET_NAME_MAP, BRACKET_RANGE_MAP, computeBracketInfo, totalQuantity } from 'lib/brackets';
import BracketInfo from 'components/combo/BracketInfo/BracketInfo';
import TemplateCard from 'components/combo/TemplateCard/TemplateCard';

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

  const info = computeBracketInfo(results);

  return (
    <div className="py-4">
      <br />
      <h1 className="heading-subtitle">Commander Bracket Info</h1>
      <h1 className="heading-subtitle">
        <b>Our Estimate:</b> {BRACKET_NAME_MAP[results.bracketTag]} (Bracket {BRACKET_RANGE_MAP[results.bracketTag]})
      </h1>
      <BracketInfo bracketEstimate={results} />

      <CardList title="Banned Cards" cards={info.bannedCards} />
      <CardList title="Game Changers" cards={info.gameChangerCards} />
      <CardList
        title="Mass Land Denial Cards"
        cards={info.massLandDenialCards}
        templates={info.massLandDenialTemplates}
      />
      <CardList title="Extra Turn Cards" cards={info.extraTurnCards} templates={info.extraTurnTemplates} />

      <ComboList title="Fast, Game-Winning, Two Card Combos" combos={info.fastGameWinningTwoCardCombos} />
      <ComboList title="Fast, Game-Winning Combos Involving Few Cards" combos={info.fastGameWinningCombos} />
      <ComboList title="Fast, Powerful, Two Card Combos" combos={info.fastPowerfulTwoCardCombos} />
      <ComboList title="Game-Winning Combos Involving Few Cards" combos={info.normalGameWinningTwoCardCombos} />
      <ComboList title="Powerful, Two Card Combos" combos={info.normalPowerfulTwoCardCombos} />
      <ComboList title="Late Game, Game-Winning, Two Card Combos" combos={info.slowGameWinningTwoCardCombos} />
      <ComboList title="Controll All Opponents Combos" combos={info.controlAllOpponentsCombos} />
      <ComboList title="Control Some Opponents Combos" combos={info.controlSomeOpponentsCombos} />
      <ComboList title="Extra Turn Combos" combos={info.extraTurnsCombos} />
      <ComboList title="Lock Combos" combos={info.lockCombos} />
      <ComboList title="Mass Land Denial Combos" combos={info.massLandDenialCombos} />
      <ComboList title="Skip Turn Combos" combos={info.skipTurnsCombos} />
    </div>
  );
};

interface CardListProps {
  title: React.ReactNode;
  cards: ClassifiedCard[];
  templates?: ClassifiedTemplate[];
}
const CardList = ({ title, cards, templates = [] }: CardListProps) => {
  if (!cards.length && !templates.length) {
    return null;
  }
  return (
    <>
      <h2 className="heading-subtitle mt-4 mb-2">
        {title} ({totalQuantity(cards) + totalQuantity(templates)})
      </h2>
      <div className="flex justify-center w-full mb-8 flex-wrap gap-4">
        {cards.map(({ card, quantity }) => (
          <QuantityWrapper quantity={quantity} key={card.id}>
            <CardImage className={styles.card} card={card} />
          </QuantityWrapper>
        ))}
        {templates.map((template) => (
          <QuantityWrapper quantity={template.quantity} key={`template-${template.template.id}`}>
            <div className={styles.card}>
              <TemplateCard template={template} />
            </div>
          </QuantityWrapper>
        ))}
      </div>
    </>
  );
};

interface QuantityWrapperProps {
  quantity: number;
  children: React.ReactNode;
}
const QuantityWrapper = ({ quantity, children }: QuantityWrapperProps) => (
  <div className="relative">
    {children}
    {quantity > 1 && <span className={styles.quantityBadge}>{quantity}x</span>}
  </div>
);

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
