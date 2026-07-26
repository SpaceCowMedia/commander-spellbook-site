import styles from './cardGroup.module.scss';
import React, { useRef, useState } from 'react';
import CardImage from '../../layout/CardImage/CardImage';
import TemplateCard from 'components/combo/TemplateCard/TemplateCard';
import { CardInVariant, Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ScryfallResultsPage } from 'services/scryfall.service';

interface Props {
  cards: CardInVariant[];
  templates: TemplateInVariant[];
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
  className?: string;
}

const MAX_DOTS = 8;

const CardGroup: React.FC<Props> = ({ cards, templates, fetchTemplateReplacements, className }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = (cards as (CardInVariant | TemplateInVariant)[])
    .concat(templates)
    .flatMap((c) => Array<CardInVariant | TemplateInVariant>(c.quantity).fill(c));

  // Items all have the same width, so scroll position maps linearly onto the item index.
  const scrollStep = (element: HTMLDivElement) =>
    items.length > 1 ? (element.scrollWidth - element.clientWidth) / (items.length - 1) : 0;

  const handleScroll = () => {
    const element = scrollerRef.current;
    if (element === null) {
      return;
    }
    const step = scrollStep(element);
    setActiveIndex(step > 0 ? Math.round(element.scrollLeft / step) : 0);
  };

  const scrollToIndex = (index: number) => {
    const element = scrollerRef.current;
    if (element === null) {
      return;
    }
    element.scrollTo({ left: scrollStep(element) * index, behavior: 'smooth' });
  };

  return (
    <div className={className ?? ''}>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className={`${styles.cardImages} flex ${cards.length + templates.length < 4 ? 'md:justify-center' : ''}`}
      >
        {items.map((card, index) => (
          <div key={`oracle-card-image-${index}`} className={styles.cardImgWrapper}>
            {'template' in card && (
              <TemplateCard template={card} fetchTemplateReplacements={fetchTemplateReplacements} />
            )}
            {'card' in card && <CardImage card={card.card} usedFace={card.usedFace} />}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className={styles.dots}>
          {items.length <= MAX_DOTS ? (
            items.map((_, index) => (
              <button
                key={`card-image-dot-${index}`}
                type="button"
                aria-label={`Show card ${index + 1}`}
                aria-current={index === activeIndex}
                className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
                onClick={() => scrollToIndex(index)}
              />
            ))
          ) : (
            <span className={styles.counter}>
              {activeIndex + 1} / {items.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CardGroup;
