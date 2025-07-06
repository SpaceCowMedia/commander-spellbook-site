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
  const [isImageRequested, setIsImageRequested] = useState(cardNames.map((_) => false));
  const [isImageLoaded, setIsImageLoaded] = useState(cardNames.map((_) => false));
  const [hasHovered, setHasHovered] = useState(false);
  const [cardsShownCount, setCardsShownCount] = useState(urls.length);

  const mousePosition = { x: undefined, y: undefined };

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

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    mousePosition.x = mouseX;
    mousePosition.y = mouseY;

    moveTooltipAccordingToMouse(mouseX, mouseY, cardsShownCount);
  };

  function moveTooltipAccordingToMouse(mouseX: number, mouseY: number, cardsToShow: number): void {
    if (!divRef.current) {
      return;
    }

    const displayOnRightSide = window.innerWidth / 2 - mouseX > 0;
    divRef.current.style.display = 'flex';
    divRef.current.style.top = mouseY - 30 + 'px';

    console.log({ cardsToShow });

    if (displayOnRightSide) {
      divRef.current.style.left = mouseX + 50 + 'px';
    } else {
      divRef.current.style.left = mouseX - 290 * cardsToShow + 'px';
    }
  }

  const handleMouseOut = () => {
    if (divRef.current) {
      divRef.current.style.display = 'none';
    }
  };

  const onImageLoaded = (imgIndex: number, wasSuccessful: boolean) => {
    const imagesRequestedNextValue = isImageRequested.map((val, i) => (i === imgIndex ? true : val));
    setIsImageRequested(imagesRequestedNextValue);
    const imagesLoadedNextValue = isImageLoaded.map((val, i) => (i === imgIndex ? wasSuccessful : val));
    setIsImageLoaded(imagesLoadedNextValue);

    const imageLoadedCount = imagesLoadedNextValue.filter((loaded) => loaded).length;
    const allImagesRequested = imagesRequestedNextValue.every((loaded) => loaded);

    const cardsShownCount = allImagesRequested ? imageLoadedCount : urls.length;
    setCardsShownCount(cardsShownCount);

    if (mousePosition?.x && mousePosition?.y) {
      moveTooltipAccordingToMouse(mousePosition.x, mousePosition.y, cardsShownCount);
    }
  };

  const allImagesRequested = isImageRequested.every((gotRequested) => gotRequested);

  return (
    <span
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseOut={handleMouseOut}
      onClick={handleSingleClick}
    >
      <div ref={divRef} className={styles.cardTooltip}>
        <div className="relative flex">
          <div className={styles.cardBack} style={{ opacity: allImagesRequested ? 0 : 1 }}>
            {urls.map((_, i) => (
              <img key={i} src={cardBack.src} className={styles.cardImage} alt="Card Back" />
            ))}
          </div>
          {!allImagesRequested && (
            <div className={styles.loader}>
              <Loader />
            </div>
          )}
          {hasHovered &&
            urls
              .filter((_, index) => !allImagesRequested || isImageLoaded[index])
              .map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={cardNames[index]}
                  className={styles.cardImage}
                  /* set flag after image loading is complete */
                  onLoad={() => onImageLoaded(index, true)}
                  onError={() => onImageLoaded(index, false)}
                />
              ))}
        </div>
      </div>
      {children}
    </span>
  );
};

export default CardTooltip;
