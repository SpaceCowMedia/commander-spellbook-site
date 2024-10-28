import styles from './cardGroup.module.scss';
import React, { useState } from 'react';

import CardImage from '../../layout/CardImage/CardImage';
import TemplateCard from 'components/combo/TemplateCard/TemplateCard';
import { CardInVariant, TemplateInVariant } from '@spacecowmedia/spellbook-client';

type Props = {
  cards: CardInVariant[];
  templates: TemplateInVariant[];
};

const CardGroup: React.FC<Props> = ({ cards, templates }) => {
  const [hoveredOverCardIndex, setHoveredOverCardIndex] = useState(-1);

  const shouldExpand = (index: number): boolean => {
    if (hoveredOverCardIndex < 0) {
      return false;
    }
    return index - 4 === hoveredOverCardIndex || index - 8 === hoveredOverCardIndex;
  };

  return (
    <div className={`${styles.cardImages} container hidden lg:flex ${cards.length < 4 && 'justify-center'}`}>
      {(cards as (CardInVariant | TemplateInVariant)[])
        .concat(templates)
        .flatMap((c) => Array<CardInVariant | TemplateInVariant>(c.quantity).fill(c))
        .map((card, index) => (
          <div
            key={`oracle-card-image-${index}`}
            className={`${styles.cardImgWrapper} ${shouldExpand(index) && styles.expand}`}
            onMouseEnter={() => setHoveredOverCardIndex(index)}
            onMouseLeave={() => setHoveredOverCardIndex(-1)}
            style={{
              zIndex: hoveredOverCardIndex === index ? 10 : 1, // Bring hovered card to the front
              transition: 'z-index 0.2s',
            }}
          >
            {'template' in card && <TemplateCard className={styles.cardImg} template={card} />}
            {'card' in card && (
              <div>
                <CardImage
                  img={`https://api.scryfall.com/cards/named?format=image&face=front&version=normal&exact=${encodeURIComponent(card.card.name)}`}
                  name={card.card.name}
                  className={styles.cardImg}
                />
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default CardGroup;
