import styles from './cardTooltip.module.scss';
import React, { useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import Loader from 'components/layout/Loader/Loader';

type Props = {
  cardName?: string;
  children?: React.ReactNode;
};

const CardTooltip: React.FC<Props> = ({ cardName, children }) => {
  const cardNames = cardName?.split(' // ') || [];
  const urls = cardNames.map(
    (name, index) =>
      `https://api.scryfall.com/cards/named?format=image&version=normal&exact=${encodeURIComponent(name)}&face=${index == 1 ? 'back' : 'front'}`,
  );

  const divRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(cardNames.map((_) => false));
  const [hasHovered, setHasHovered] = useState(false);

  const handleSingleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth <= 1024) {
      if (!divRef.current) {
        return;
      }
      divRef.current.style.display = 'flex';
    } else {
      event.preventDefault();
    }
  };

  const handleMouseMove = (e: any) => {
    if (!divRef.current) {
      return;
    }
    setHasHovered(true);
    const displayOnRightSide = window.innerWidth / 2 - e.clientX > 0;
    divRef.current.style.display = 'flex';
    divRef.current.style.top = e.clientY - 30 + 'px';

    if (displayOnRightSide) {
      divRef.current.style.left = e.clientX + 50 + 'px';
    } else {
      divRef.current.style.left = e.clientX - 290 * urls.length + 'px';
    }
  };

  const handleMouseOut = () => {
    if (divRef.current) {
      divRef.current.style.display = 'none';
    }
  };

  const allImagesLoaded = isImageLoaded.every((val) => val);

  return (
    <span
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseOut={handleMouseOut}
      onClick={handleSingleClick}
    >
      <div ref={divRef} className={styles.cardTooltip}>
        <div className="relative flex">
          <div className={styles.cardBack} style={{ opacity: allImagesLoaded ? 0 : 1 }}>
            {urls.map((_, i) => (
              <img key={i} src={cardBack.src} className={styles.cardImage} alt="Card Back" />
            ))}
          </div>
          {!allImagesLoaded && (
            <div className={styles.loader}>
              <Loader />
            </div>
          )}
          {hasHovered &&
            urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={cardNames[index]}
                className={styles.cardImage}
                style={{ opacity: allImagesLoaded ? 1 : 0 }}
                /* set flag after image loading is complete */
                onLoad={() => {
                  setIsImageLoaded((prev) => prev.map((val, i) => (i === index ? true : val)));
                }}
                onError={() => {
                  setIsImageLoaded((prev) => prev.map((val, i) => (i === index ? false : val)));
                }}
              />
            ))}
        </div>
      </div>
      {children}
    </span>
  );
};

export default CardTooltip;
