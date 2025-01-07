import styles from './cardGroup.module.scss';
import React from 'react';

import CardImage from '../../layout/CardImage/CardImage';
import TemplateCard from 'components/combo/TemplateCard/TemplateCard';
import { CardInVariant, TemplateInVariant } from '@spacecowmedia/spellbook-client';

type Props = {
  cards: CardInVariant[];
  templates: TemplateInVariant[];
};

const CardGroup: React.FC<Props> = ({ cards, templates }) => {
  return (
    <div className={`${styles.cardImages} container hidden lg:flex${cards.length + templates.length < 4 ? ' justify-center' : ''}`}>
      {(cards as (CardInVariant | TemplateInVariant)[])
        .concat(templates)
        .flatMap((c) => Array<CardInVariant | TemplateInVariant>(c.quantity).fill(c))
        .map((card, index) => (
          <div key={`oracle-card-image-${index}`} className={styles.cardImgWrapper}>
            {'template' in card && <TemplateCard template={card} />}
            {'card' in card && (
              <div>
                <CardImage
                  img={`https://api.scryfall.com/cards/named?format=image&face=front&version=normal&exact=${encodeURIComponent(card.card.name)}`}
                  name={card.card.name}
                />
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default CardGroup;
