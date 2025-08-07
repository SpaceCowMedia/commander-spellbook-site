import styles from './cardTooltip.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import Loader from 'components/layout/Loader/Loader';
import { Card } from '@space-cow-media/spellbook-client';

const VISIBLE_TOOLTIP_DISPLAY = 'flex';
const TOOLTIP_RIGHT_SHIFT_PX = 30;

type Props = {
  card?: Card;
  children?: React.ReactNode;
};

type CardImage = {
  url: string;
  isRequested: boolean;
  isLoaded: boolean;
};

const CardTooltip: React.FC<Props> = ({ card, children }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const [currentlyHovered, setCurrentlyHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cards, setCards] = useState<CardImage[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setCards(
      card && card.imageUriFrontNormal
        ? [
            { url: card.imageUriFrontNormal, isRequested: false, isLoaded: false },
            ...(card.imageUriBackNormal ? [{ url: card.imageUriBackNormal, isRequested: false, isLoaded: false }] : []),
          ]
        : [],
    );
  }, [card]);

  const getCards = () => {
    return deviceIsMobile() ? cards.slice(0, 1) : cards;
  };

  const allImagesGotRequested = (): boolean => {
    return getCards().every((card) => card.isRequested);
  };

  const cardsToShow = allImagesGotRequested() ? cards.filter((card) => card.isLoaded).length : cards.length;

  const handleSingleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (deviceIsMobile()) {
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
    setCards((previousCardsState) =>
      previousCardsState.map((card, index) => {
        if (index !== imgIndex) {
          return card;
        }

        return {
          ...card,
          isRequested: true,
          isLoaded: wasSuccessful,
        };
      }),
    );
  };

  const getTooltipTop = (mouseY: number): string => {
    return mouseY - 30 + 'px';
  };

  function deviceIsMobile(): boolean {
    return isMounted && window?.innerWidth <= 1024;
  }

  const isClickOnScreenLeftSide = (clickX: number) => window?.innerWidth / 2 - clickX > 0;

  const getTooltipLeft = (mouseX: number): string => {
    if (!isMounted || !divRef?.current) {
      return '0px';
    }

    if (deviceIsMobile()) {
      const cardRightLimit = window.innerWidth - 10;
      const cardWidth = divRef.current.clientWidth;

      const cardRightXIfShiftedRight = mouseX + cardWidth + TOOLTIP_RIGHT_SHIFT_PX;

      if (cardRightXIfShiftedRight > cardRightLimit) {
        return cardRightLimit - cardWidth + 'px';
      } else {
        return mouseX + TOOLTIP_RIGHT_SHIFT_PX + 'px';
      }
    } else {
      if (isClickOnScreenLeftSide(mouseX)) {
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
          {!allImagesGotRequested() && (
            <div className={styles.cardBack}>
              {getCards().map((_, i) => (
                <img key={i} src={cardBack.src} className={styles.cardImage} alt="Card Back" />
              ))}
            </div>
          )}
          {!allImagesGotRequested() && (
            <div className={styles.loader}>
              <Loader />
            </div>
          )}
          {hasHovered &&
            getCards()
              .filter((card) => !allImagesGotRequested() || card.isLoaded)
              .map((card, index) => (
                <img
                  key={index}
                  src={card.url}
                  alt={index === 0 ? 'Front Image' : 'Back Image'}
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
