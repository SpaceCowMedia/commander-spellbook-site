import styles from './cardTooltip.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cardBack from 'assets/images/card-back.png';
import Loader from 'components/layout/Loader/Loader';
import { Card } from '@space-cow-media/spellbook-client';
import { BACK_FACE_INDEX } from 'lib/types';

const VISIBLE_TOOLTIP_DISPLAY = 'flex';
const TOOLTIP_RIGHT_SHIFT_PX = 30;
const TOOLTIP_TOP_SHIFT_PX = 30;
// browsers treat a touch that drifts this far as a tap, so we must too
const TAP_MOVE_TOLERANCE_PX = 16;
const EMULATED_MOUSE_WINDOW_MS = 1000;
const VIEWPORT_MARGIN_PX = 10;
const CARD_IMAGE_WIDTH_PX = 244;
const CARD_IMAGE_HEIGHT_PX = 340;

interface Props {
  card?: Card;
  faceToShow?: number | null;
  images?: string[];
  disableTapPreview?: boolean;
  children?: React.ReactNode;
}

interface CardImage {
  url: string;
  alt: string;
  isRequested: boolean;
  isLoaded: boolean;
}

function getFaceImages(card: Card, faceToShow?: number | null): { url: string; alt: string }[] {
  if (!card.imageUriFrontNormal) {
    return [];
  }
  const faces = [{ url: card.imageUriFrontNormal, alt: 'Front Image' }];
  if (card.imageUriBackNormal) {
    faces.push({ url: card.imageUriBackNormal, alt: 'Back Image' });
    if (faceToShow === BACK_FACE_INDEX) {
      faces.reverse();
    }
  }
  return faces;
}

const CardTooltip: React.FC<Props> = ({ card, faceToShow, images, disableTapPreview, children }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const emulatedMouseSuppressedRef = useRef(false);
  const emulatedMouseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const [currentlyHovered, setCurrentlyHovered] = useState(false);
  const [tapPreviewOpen, setTapPreviewOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cards, setCards] = useState<CardImage[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const faceImages =
      images && images.length > 0
        ? images.map((url, index) => ({ url, alt: index === 0 ? 'Front Image' : 'Back Image' }))
        : card
          ? getFaceImages(card, faceToShow)
          : [];
    setCards(
      faceImages.map((face) => ({
        ...face,
        isRequested: false,
        isLoaded: false,
      })),
    );
  }, [card, faceToShow, images]);

  const getCards = () => {
    return deviceIsMobile() ? cards.slice(0, 1) : cards;
  };

  const allImagesGotRequested = (): boolean => {
    return getCards().every((card) => card.isRequested);
  };

  const cardsToShow = allImagesGotRequested() ? cards.filter((card) => card.isLoaded).length : cards.length;

  const handleSingleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!deviceIsMobile()) {
      event.preventDefault();
    }
  };

  // a tap makes the browser fire a mouse sequence afterwards; those events must not be able to
  // show a preview, because that preview would have no tap catcher behind it to dismiss it
  const suppressEmulatedMouse = () => {
    emulatedMouseSuppressedRef.current = true;
    if (emulatedMouseTimerRef.current) {
      clearTimeout(emulatedMouseTimerRef.current);
    }
    emulatedMouseTimerRef.current = setTimeout(() => {
      emulatedMouseSuppressedRef.current = false;
    }, EMULATED_MOUSE_WINDOW_MS);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLSpanElement>) => {
    suppressEmulatedMouse();
    // a hover left over from a mouse must never survive into a touch interaction
    setCurrentlyHovered(false);

    const touch = e.touches[0];
    touchStartRef.current = e.touches.length > 1 || !touch ? null : { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLSpanElement>) => {
    suppressEmulatedMouse();

    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (disableTapPreview || cards.length === 0 || !start) {
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      return;
    }

    const movedLikeAScroll =
      Math.abs(touch.clientX - start.x) > TAP_MOVE_TOLERANCE_PX ||
      Math.abs(touch.clientY - start.y) > TAP_MOVE_TOLERANCE_PX;
    if (movedLikeAScroll) {
      return;
    }

    // cancels the emulated mouse sequence, so the tap never reaches links underneath
    e.preventDefault();
    setHasHovered(true);
    setMousePosition({ x: touch.clientX, y: touch.clientY });
    setTapPreviewOpen(true);
  };

  const closeTapPreview = () => {
    setTapPreviewOpen(false);
    setCurrentlyHovered(false);
  };

  const handleTapCatcherTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    closeTapPreview();
  };

  const handleTapCatcherClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    closeTapPreview();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || tapPreviewOpen || emulatedMouseSuppressedRef.current) {
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

  useEffect(() => {
    if (!tapPreviewOpen) {
      return;
    }
    const handleScroll = () => setTapPreviewOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tapPreviewOpen]);

  useEffect(() => {
    return () => {
      if (emulatedMouseTimerRef.current) {
        clearTimeout(emulatedMouseTimerRef.current);
      }
    };
  }, []);

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
    const preferredTop = mouseY - TOOLTIP_TOP_SHIFT_PX;

    if (!isMounted || !divRef?.current || !deviceIsMobile()) {
      return preferredTop + 'px';
    }

    const cardBottomLimit = window.innerHeight - VIEWPORT_MARGIN_PX;
    // the div is still hidden the first time a tap opens it, so clientHeight is 0
    const cardHeight = divRef.current.clientHeight || CARD_IMAGE_HEIGHT_PX;
    const clampedTop = Math.min(preferredTop, cardBottomLimit - cardHeight);

    return Math.max(VIEWPORT_MARGIN_PX, clampedTop) + 'px';
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
      const cardRightLimit = window.innerWidth - VIEWPORT_MARGIN_PX;
      // the div is still hidden the first time a tap opens it, so clientWidth is 0
      const cardWidth = divRef.current.clientWidth || CARD_IMAGE_WIDTH_PX * getCards().length;

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isMounted &&
        tapPreviewOpen &&
        createPortal(
          <div className={styles.tapCatcher} onTouchEnd={handleTapCatcherTouchEnd} onClick={handleTapCatcherClick} />,
          document.body,
        )}
      <div
        ref={divRef}
        className={`${styles.cardTooltip}`}
        style={{
          display: currentlyHovered || tapPreviewOpen ? VISIBLE_TOOLTIP_DISPLAY : 'none',
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
                  alt={card.alt}
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
