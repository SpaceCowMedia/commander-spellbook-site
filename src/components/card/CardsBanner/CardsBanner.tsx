import React from 'react';
import { Card, CardInVariant } from '@space-cow-media/spellbook-client';
import { getUsedFaceArtCrop } from 'lib/types';
import styles from './cardsBanner.module.scss';

interface Props {
  cards: (Card | CardInVariant)[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

function getArts(card: Card | CardInVariant): (string | null)[] {
  return 'card' in card ? [getUsedFaceArtCrop(card)] : [card.imageUriFrontArtCrop, card.imageUriBackArtCrop];
}

const CardsBanner: React.FC<Props> = ({ cards, title, subtitle, className = '' }) => {
  const arts = cards.flatMap(getArts).filter((art) => art != null);
  return (
    <header className={`${styles.banner} ${className}`}>
      <div className={styles.arts}>
        {arts.length > 0 ? (
          arts.map((art, index) => <img key={index} src={art} alt="" className={styles.art} />)
        ) : (
          <div className={styles.noArt} />
        )}
      </div>
      <div className={styles.mask} />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </header>
  );
};

export default CardsBanner;
