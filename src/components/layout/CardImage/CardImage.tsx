import styles from './cardImage.module.scss';
import FlipperCard from '../FlipperCard/FlipperCard';
import React, { useEffect, useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import weatheredCardBack from 'assets/images/weathered-card-back.png';
import CardLink from '../../layout/CardLink/CardLink';
import isFoolsDay from 'lib/foolsDay';
import { Card, LayoutRotationEnum } from '@space-cow-media/spellbook-client';

interface Props {
  card: Card;
  className?: string;
}

function isLoaded(e: HTMLImageElement) {
  return e.complete && e.naturalHeight !== 0;
}

const CardImage: React.FC<Props> = ({ card, className }: Props) => {
  const hasBack = card.imageUriBackNormal != null;
  const canRotate = card.layoutRotationFront != null;
  const frontImageRef = useRef<HTMLImageElement>(null);
  const [frontLoaded, setFrontLoaded] = useState(false);
  const backImageRef = useRef<HTMLImageElement>(null);
  const [backFacing, setBackFacing] = useState(true);
  const [rotated, setRotated] = useState(false);
  const [readyToFlipToFront, setReadyToFlipToFront] = useState(false);

  const flip = () => {
    setBackFacing((prev) => !prev);
  };

  const rotate = () => {
    setRotated((prev) => !prev);
  };

  const clickFlip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    flip();
  };

  const clickRotate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    rotate();
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
    <div
      className={`${styles.centerContainer} ${canRotate ? styles.canRotate : ''} ${rotated ? styles.rotated : ''} ${className}`}
    >
      <FlipperCard
        flipped={backFacing}
        rotated={rotated && card.layoutRotationFront != null ? card.layoutRotationFront : undefined}
        back={
          hasBack ? (
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
      <div className={styles.buttonsContainer}>
        {readyToFlipToFront && hasBack && (
          <button className={`md:flex ${styles.flipperButton}`} onClick={clickFlip} title="Flip card">
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
        {readyToFlipToFront && canRotate && !backFacing && (
          <button className={`md:flex ${styles.flipperButton}`} onClick={clickRotate} title="Rotate card">
            <svg
              height="30"
              focusable="false"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512.000000 512.000000"
              transform={card.layoutRotationFront === LayoutRotationEnum.Clockwise ? 'scale(-1,1)' : undefined}
            >
              <path d="M 282.5,31.5 C 285.187,31.3359 287.854,31.5026 290.5,32C 292.259,33.008 293.426,34.508 294,36.5C 294.499,41.8229 294.666,47.1563 294.5,52.5C 371.779,67.9459 427.279,111.279 461,182.5C 479.085,223.605 483.919,266.105 475.5,310C 470.222,313.351 465.722,312.518 462,307.5C 451.21,240.095 416.71,188.928 358.5,154C 338.716,142.905 317.716,135.072 295.5,130.5C 294.669,137.811 294.169,145.144 294,152.5C 291.774,156.861 288.274,158.361 283.5,157C 250.903,136.12 218.736,114.62 187,92.5C 184.731,88.2865 185.231,84.4531 188.5,81C 220.053,64.7257 251.386,48.2257 282.5,31.5 Z" />
              <path d="M 40.5,198.5 C 44.2208,198.783 47.0541,200.45 49,203.5C 61.8016,278.603 102.302,332.769 170.5,366C 185.014,372.338 200.014,377.171 215.5,380.5C 216.331,373.189 216.831,365.856 217,358.5C 219.226,354.139 222.726,352.639 227.5,354C 260.097,374.88 292.264,396.38 324,418.5C 326.269,422.714 325.769,426.547 322.5,430C 291.167,446.333 259.833,462.667 228.5,479C 224.409,480.227 220.909,479.394 218,476.5C 216.59,470.621 216.09,464.621 216.5,458.5C 154.021,446.694 104.854,414.694 69,362.5C 37.6007,313.897 25.934,260.897 34,203.5C 35.6027,200.965 37.7694,199.298 40.5,198.5 Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CardImage;
