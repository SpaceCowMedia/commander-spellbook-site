import styles from '../HoverPreview/hoverPreview.module.scss';
import React, { useEffect, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import Loader from 'components/layout/Loader/Loader';
import HoverPreview from 'components/layout/HoverPreview/HoverPreview';
import SpoilerFog from 'components/layout/SpoilerFog/SpoilerFog';
import SpoilerCaption from 'components/layout/SpoilerFog/SpoilerCaption';
import { Card } from '@space-cow-media/spellbook-client';
import { BACK_FACE_INDEX } from 'lib/types';
import { revealAllSpoilers, useSpoilerFogged } from 'lib/spoilers';

interface Props {
  card?: Card;
  faceToShow?: number | null;
  images?: string[];
  disableTapPreview?: boolean;
  /* For a trigger wrapping the card's own link, which the preview stands in for on desktop. */
  suppressClick?: boolean;
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

const CardTooltip: React.FC<Props> = ({ card, faceToShow, images, disableTapPreview, suppressClick, children }) => {
  const [hasHovered, setHasHovered] = useState(false);
  const [cards, setCards] = useState<CardImage[]>([]);
  const [shown, setShown] = useState<'hovered' | 'tapped'>();
  const fogged = useSpoilerFogged(card);

  useEffect(() => {
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

  const allImagesGotRequested = (): boolean => {
    return cards.every((card) => card.isRequested);
  };

  const cardsToShow = allImagesGotRequested() ? cards.filter((card) => card.isLoaded).length : cards.length;

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

  return (
    <HoverPreview
      previewCount={cardsToShow}
      tapPreviewEnabled={!disableTapPreview && cards.length > 0}
      suppressClick={suppressClick}
      onFirstShow={() => setHasHovered(true)}
      onVisibleChange={(visible, tapped) => setShown(visible ? (tapped ? 'tapped' : 'hovered') : undefined)}
      onPreviewTap={fogged ? revealAllSpoilers : undefined}
      preview={
        <div className="relative flex min-w-0">
          {!allImagesGotRequested() && (
            <div className={styles.cardBack}>
              {cards.map((_, i) => (
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
            cards
              .filter((face) => !allImagesGotRequested() || face.isLoaded)
              .map((face, index) => (
                <SpoilerFog
                  key={index}
                  name={card?.name ?? ''}
                  spoiler={card?.spoiler ?? false}
                  interactive={false}
                  className="min-w-0"
                >
                  <img
                    src={face.url}
                    alt={face.alt}
                    className={styles.cardImage}
                    /* set flag after image loading is complete */
                    onLoad={() => onImageLoaded(index, true)}
                    onError={() => onImageLoaded(index, false)}
                  />
                </SpoilerFog>
              ))}
          {fogged && shown && <SpoilerCaption tapped={shown === 'tapped'} />}
        </div>
      }
    >
      {children}
    </HoverPreview>
  );
};

export default CardTooltip;
