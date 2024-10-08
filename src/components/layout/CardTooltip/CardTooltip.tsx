import styles from './cardTooltip.module.scss';
import React, { useRef, useState } from 'react';

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
  const [isImageLoaded, setIsImageLoaded] = useState(cardNames.map(() => false));
  const loadedImages = isImageLoaded.filter((val) => val).length;

  const handleMouseMove = (e: any) => {
    if (!divRef.current) {
      return;
    }
    const displayOnRightSide = window.innerWidth / 2 - e.clientX > 0;
    divRef.current.style.display = 'flex';
    divRef.current.style.top = e.clientY - 30 + 'px';

    if (displayOnRightSide) {
      divRef.current.style.left = e.clientX + 50 + 'px';
    } else {
      divRef.current.style.left = e.clientX - 290 * loadedImages + 'px';
    }
  };

  const handleMouseOut = () => {
    if (divRef.current) {
      divRef.current.style.display = 'none';
    }
  };

  return (
    <span onMouseMove={handleMouseMove} onMouseOut={handleMouseOut}>
      <div ref={divRef} className={styles.cardTooltip}>
        {urls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={cardNames[index]}
            style={{ ...(isImageLoaded[index] ? {} : { display: 'none' }) }}
            /* set flag after image loading is complete */
            onLoad={() => {
              setIsImageLoaded((prev) => prev.map((val, i) => (i === index ? true : val)));
            }}
          />
        ))}
      </div>
      {children}
    </span>
  );
};

export default CardTooltip;
