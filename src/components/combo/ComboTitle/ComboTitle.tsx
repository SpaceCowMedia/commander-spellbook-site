import React from 'react';
import { CardInVariant } from '@space-cow-media/spellbook-client';
import CardName from 'components/layout/CardName/CardName';
import { comboTitleCards, NO_CARDS_TITLE } from 'lib/comboTitle';

interface Props {
  cards: CardInVariant[];
}

const ComboTitle: React.FC<Props> = ({ cards }) =>
  cards.length === 0 ? (
    NO_CARDS_TITLE
  ) : (
    <>
      {comboTitleCards(cards).map(({ card, quantity }, index) => (
        <React.Fragment key={index}>
          {index > 0 && ' | '}
          {quantity > 1 && `${quantity} `}
          <CardName name={card.name} />
        </React.Fragment>
      ))}
    </>
  );

export default ComboTitle;
