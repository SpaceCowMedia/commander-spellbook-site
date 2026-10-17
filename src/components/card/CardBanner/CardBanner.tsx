import React from 'react';
import { CardDetail } from '@space-cow-media/spellbook-client';
import CardName from 'components/layout/CardName/CardName';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import styles from './cardBanner.module.scss';

interface Props {
  card: CardDetail;
}

const CardBanner: React.FC<Props> = ({ card }) => {
  const arts = [card.imageUriFrontArtCrop, card.imageUriBackArtCrop].filter((art) => art != null);
  return (
    <header className={styles.banner}>
      {arts.length > 0 ? (
        arts.map((art) => <img key={art} src={art} alt="" className={styles.art} />)
      ) : (
        <div className={styles.noArt} />
      )}
      <div className={styles.mask} />
      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>
          <CardName name={card.name} />
        </h1>
        <p className={styles.subtitle}>
          {card.typeLine}
          {card.manaCost && (
            <>
              {' · '}
              <TextWithMagicSymbol text={card.manaCost} />
            </>
          )}
        </p>
      </div>
    </header>
  );
};

export default CardBanner;
