import styles from './cardTooltip.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import Loader from 'components/layout/Loader/Loader';

const VISIBLE_TOOLTIP_DISPLAY = 'flex';
const TOOLTIP_RIGHT_SHIFT_PX = 50;

type Props = {
  cardName?: string;
  children?: React.ReactNode;
};

const CardTooltip: React.FC<Props> = ({ cardName, children }) => {
  const cardNames = cardName?.split(' // ') || [];
  const urls = cardNames.map(
    (name, index) =>
      `https://scryfall-api-prod.spacecowmedia.com/cards/named?format=image&version=normal&exact=${encodeURIComponent(name)}&face=${index == 1 ? 'back' : 'front'}`,
  );

  const divRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isImageRequested, setIsImageRequested] = useState(cardNames.map((_) => false));
  const [isImageLoaded, setIsImageLoaded] = useState(cardNames.map((_) => false));
  const [hasHovered, setHasHovered] = useState(false);
  const [currentlyHovered, setCurrentlyHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  });

  const allImagesGotRequested = isImageRequested.every((v) => v);
  const cardsToShow = allImagesGotRequested ? isImageLoaded.filter((v) => v).length : urls.length;

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

  const isMobile = () => window.innerWidth <= 1024;

  const handleMouseMove = (e: any) => {
    if (!divRef.current) {
      return;
    }

    if (!hasHovered) {
      setHasHovered(true);
    }

    if (divRef.current.style.display !== VISIBLE_TOOLTIP_DISPLAY) {
      // make tooltip movement smoother
      divRef.current.style.left = getTooltipLeft(e.clientX);
      divRef.current.style.top = getTooltipTop(e.clientY);
    }

    setCurrentlyHovered(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseOut = () => {
    if (divRef.current) {
      setCurrentlyHovered(false);
    }
  };

  const onImageLoaded = (imgIndex: number, wasSuccessful: boolean) => {
    setIsImageRequested((prev) => prev.map((val, i) => (i === imgIndex ? true : val)));
    setIsImageLoaded((prev) => prev.map((val, i) => (i === imgIndex ? wasSuccessful : val)));
  };

  const getTooltipTop = (mouseY: number): string => {
    return mouseY - 30 + 'px';
  };

  const isClickOnLeftSide = (clickX: number) => window?.innerWidth / 2 - clickX > 0;

  const getTooltipLeft = (mouseX: number): string => {
    if (!isMounted || !divRef?.current) {
      return '0px';
    }

    if(isMobile()) {
      const cardRightLimit = window.innerWidth - 10;
      const cardWidth = divRef.current.clientWidth;

      const cardRightXIfShiftedRight = mouseX + cardWidth + TOOLTIP_RIGHT_SHIFT_PX;

      if(cardRightXIfShiftedRight > cardRightLimit) {
        return cardRightLimit - cardWidth + 'px';
      } else {
        return mouseX + TOOLTIP_RIGHT_SHIFT_PX + 'px';
      }
    } else {
      if (isClickOnLeftSide(mouseX)) {
        return mouseX + TOOLTIP_RIGHT_SHIFT_PX + 'px';
      } else {
        return mouseX - 290 * cardsToShow + 'px';
      }
    }
  };

  return (
    <span
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseOut={handleMouseOut}
      onClick={handleSingleClick}
    >
      <div
        ref={divRef}
        className={`${styles.cardTooltip}`}
        style={{
          display: currentlyHovered ? VISIBLE_TOOLTIP_DISPLAY : 'none',
          top: getTooltipTop(mousePosition.y),
          left: getTooltipLeft(mousePosition.x),
        }}
      >
        <div className="relative flex">
          {!allImagesGotRequested && (
            <div className={styles.cardBack}>
              {urls.map((_, i) => (
                <img key={i} src={cardBack.src} className={styles.cardImage} alt="Card Back" />
              ))}
            </div>
          )}
          {!allImagesGotRequested && (
            <div className={styles.loader}>
              <Loader />
            </div>
          )}
          {hasHovered &&
            urls
              .filter((_, index) => !allImagesGotRequested || isImageLoaded[index])
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
