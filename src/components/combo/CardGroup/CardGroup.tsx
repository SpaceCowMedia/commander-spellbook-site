import styles from './cardGroup.module.scss';
import React from 'react';
import CardImage from '../../layout/CardImage/CardImage';
import TemplateCard from 'components/combo/TemplateCard/TemplateCard';
import { CardInVariant, Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ScryfallResultsPage } from 'services/scryfall.service';

type Props = {
  cards: CardInVariant[];
  templates: TemplateInVariant[];
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
  className?: string;
};

const CardGroup: React.FC<Props> = ({ cards, templates, fetchTemplateReplacements, className }) => {
  return (
    <div
      className={`${styles.cardImages} ${className ?? ''} container flex ${cards.length + templates.length < 4 ? 'justify-center' : ''}`}
    >
      {(cards as (CardInVariant | TemplateInVariant)[])
        .concat(templates)
        .flatMap((c) => Array<CardInVariant | TemplateInVariant>(c.quantity).fill(c))
        .map((card, index) => (
          <div key={`oracle-card-image-${index}`} className={styles.cardImgWrapper}>
            {'template' in card && (
              <TemplateCard template={card} fetchTemplateReplacements={fetchTemplateReplacements} />
            )}
            {'card' in card && (
              <CardImage
                img={`https://scryfall-api-prod.spacecowmedia.com/cards/named?format=image&face=front&version=normal&exact=${encodeURIComponent(card.card.name)}`}
                name={card.card.name}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default CardGroup;
