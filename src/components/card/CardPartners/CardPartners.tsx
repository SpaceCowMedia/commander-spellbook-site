import React from 'react';
import Link from 'next/link';
import pluralize from 'pluralize';
import cardBack from 'assets/images/card-back.png';
import CardName from 'components/layout/CardName/CardName';
import CardTooltip from 'components/layout/CardTooltip/CardTooltip';
import SpoilerFog from 'components/layout/SpoilerFog/SpoilerFog';
import { CardPartner } from 'lib/cardCombos';
import { cardPath } from 'lib/cards';
import { formatCount } from 'lib/seo';
import sections from '../cardSections.module.scss';
import styles from './cardPartners.module.scss';

interface Props {
  cardName: string;
  partners: CardPartner[];
  sampleSize: number;
  combosCount: number;
}

const CardPartners: React.FC<Props> = ({ cardName, partners, sampleSize, combosCount }) => {
  if (partners.length === 0) {
    return null;
  }
  return (
    <section id="card-partners" className={sections.section}>
      <h2 className={sections.sectionTitle}>Frequently combined with</h2>
      <p className={sections.sectionNote}>
        The cards that most often join {cardName}
        {sampleSize < combosCount
          ? ` in its ${formatCount(sampleSize)} most popular combos.`
          : ` across all of its ${pluralize('combo', combosCount, true)}.`}
      </p>
      <ul className={styles.grid}>
        {partners.map(({ card, count }) => (
          <li key={card.id}>
            <CardTooltip card={card} disableTapPreview>
              <Link
                href={cardPath(card) ?? '#'}
                prefetch={false}
                className={styles.tile}
                title={`Open ${card.name} and its combos`}
              >
                <SpoilerFog name={card.name} spoiler={card.spoiler} interactive={false} className={styles.card}>
                  <img
                    src={card.imageUriFrontNormal ?? cardBack.src}
                    alt=""
                    width={488}
                    height={680}
                    loading="lazy"
                    className={styles.image}
                  />
                </SpoilerFog>
                <span className={styles.caption}>
                  <CardName name={card.name} className={styles.name} />
                  <span className={styles.count}>in {pluralize('combo', count, true)}</span>
                </span>
              </Link>
            </CardTooltip>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CardPartners;
