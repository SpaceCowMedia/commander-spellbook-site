import styles from './cardImage.module.scss';
import FlipperCard from '../FlipperCard/FlipperCard';
import React, { useEffect, useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import weatheredCardBack from 'assets/images/weathered-card-back.png';
import CardLink from '../../layout/CardLink/CardLink';
import isFoolsDay from 'lib/foolsDay';
import { Card } from '@space-cow-media/spellbook-client';

type Props = {
  card: Card;
};

function isLoaded(e: HTMLImageElement) {
  return e.complete && e.naturalHeight !== 0;
}

const CardImage: React.FC<Props> = ({ card }: Props) => {
  const frontImageRef = useRef<HTMLImageElement>(null);
  const [frontLoaded, setFrontLoaded] = useState(false);
  const backImageRef = useRef<HTMLImageElement>(null);
  const [backFacing, setBackFacing] = useState(true);
  const [readyToFlipToFront, setReadyToFlipToFront] = useState(false);

  const flip = () => {
    setBackFacing((prev) => !prev);
  };

  const clickFlip = (e: any) => {
    e.currentTarget.blur();
    flip();
  };

  useEffect(() => {
    setTimeout(() => {
      setReadyToFlipToFront(true);
    }, 350);
  }, [frontImageRef.current]);

  useEffect(() => {
    if (backFacing && backImageRef.current !== null && isLoaded(backImageRef.current) && readyToFlipToFront) {
      flip(); // reveal moment
    }
  }, [readyToFlipToFront, frontLoaded]);

  return (
    <div className={`${styles.centerContainer}`}>
      <FlipperCard
        flipped={backFacing}
        back={
          card.imageUriBackNormal != null ? (
            <CardLink className="relative" name={card.name} disableMobileSingleClickAsPreview={true}>
              <img
                className="rounded-xl"
                src={card.imageUriBackNormal!}
                ref={backImageRef}
                alt={`the back side of ${card.name}`}
              />
            </CardLink>
          ) : (
            <img
              className="rounded-xl"
              src={isFoolsDay() ? weatheredCardBack.src : cardBack.src}
              ref={backImageRef}
              alt="the back of a classic MtG card"
            />
          )
        }
        front={
          <CardLink className="relative" name={card.name} disableMobileSingleClickAsPreview={true}>
            <img
              className="rounded-xl"
              ref={frontImageRef}
              src={card.imageUriFrontNormal ?? (isFoolsDay() ? weatheredCardBack.src : cardBack.src)}
              alt={`the front side of ${card.name}`}
              onLoad={() => setFrontLoaded(true)}
              onError={() => setFrontLoaded(false)}
            />
          </CardLink>
        }
      />
      {readyToFlipToFront && card.imageUriBackNormal != null && (
        <button
          id={`flip-${card.name}`}
          className={`cardImage_${card.name} md:flex ${styles.flipperButton}`}
          onClick={(e) => clickFlip(e)}
          title="Flip card"
        >
          <svg
            height="30"
            focusable="false"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
          >
            <path d="M884.3,357.6c116.8,117.7,151.7,277-362.2,320V496.4L243.2,763.8L522,1031.3V860.8C828.8,839.4,1244.9,604.5,884.3,357.6z"></path>
            <path d="M557.8,288.2v138.4l230.8-213.4L557.8,0v142.8c-309.2,15.6-792.1,253.6-426.5,503.8C13.6,527.9,30,330.1,557.8,288.2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default CardImage;
