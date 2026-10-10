import React, { useEffect, useRef, useState } from 'react';
import useFoolsDay from 'lib/foolsDay';

type Styles = Readonly<Record<string, string>>;

const PIECES = 7;

let stylesLoading: Promise<Styles> | undefined;

function loadStyles(): Promise<Styles> {
  stylesLoading ??= import('./edibleCard.module.scss').then((module) => module.default);
  return stylesLoading;
}

interface Eating {
  kind: 'bite' | 'tear';
  mirrored: boolean;
  piecesTaken: number;
  restoring: boolean;
}

function isOutside(rect: DOMRect, touch: React.Touch): boolean {
  return (
    touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom
  );
}

export interface EdibleCard {
  rootProps: React.HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;
  frontClassName: string;
  backClassName: string;
}

const INEDIBLE: EdibleCard = { rootProps: {}, frontClassName: '', backClassName: '' };

/* On April Fools' Day every pointer leaving the card, or swipe off it, takes a bite or tears a piece off.
   Once nothing is left, a bitten card drops back in whole as liquid and a torn one pieces itself back together. */
export default function useEdibleCard(edible: boolean): EdibleCard {
  const foolsDay = useFoolsDay();
  const active = edible && foolsDay;
  const [styles, setStyles] = useState<Styles>();
  const [eating, setEating] = useState<Eating>();
  const swipeStart = useRef<DOMRect>(null);

  useEffect(() => {
    if (active) {
      loadStyles().then(setStyles);
    }
  }, [active]);

  if (!active || !styles) {
    return INEDIBLE;
  }

  const takePiece = () => {
    setEating((previous) =>
      previous && previous.piecesTaken > PIECES
        ? previous
        : {
            kind: previous?.kind ?? (Math.random() < 0.5 ? 'bite' : 'tear'),
            mirrored: previous?.mirrored ?? Math.random() < 0.5,
            piecesTaken: (previous?.piecesTaken ?? 0) + 1,
            restoring: false,
          },
    );
  };

  const moveOnAfterAnimation = (e: React.AnimationEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget || e.pseudoElement) {
      return;
    }
    setEating((previous) => {
      if (!previous || previous.piecesTaken <= PIECES) {
        return previous;
      }
      return previous.restoring ? undefined : { ...previous, restoring: true };
    });
  };

  const eaten = !!eating && eating.piecesTaken > PIECES;
  const comesBackWhole = eating?.restoring && eating.kind === 'bite';
  const piecesShown = comesBackWhole ? 0 : Math.min(eating?.piecesTaken ?? 0, PIECES);

  return {
    rootProps: {
      className: styles.edible,
      'data-kind': eating?.kind,
      'data-mirrored': eating?.mirrored ? '' : undefined,
      'data-pieces': piecesShown ? Array.from({ length: piecesShown }, (_, i) => i + 1).join(' ') : undefined,
      'data-chomp': eating ? (eating.piecesTaken % 2 ? 'odd' : 'even') : undefined,
      'data-eaten': eaten && !eating?.restoring ? '' : undefined,
      'data-restoring': eating?.restoring ? '' : undefined,
      onAnimationEnd: moveOnAfterAnimation,
      onPointerLeave: (e) => {
        if (e.pointerType !== 'touch') {
          takePiece();
        }
      },
      onTouchStart: (e) => {
        swipeStart.current = e.currentTarget.getBoundingClientRect();
      },
      onTouchEnd: (e) => {
        const touch = e.changedTouches[0];
        if (swipeStart.current && touch && isOutside(swipeStart.current, touch)) {
          takePiece();
        }
        swipeStart.current = null;
      },
    },
    frontClassName: styles.face,
    backClassName: styles.mirroredFace,
  };
}
