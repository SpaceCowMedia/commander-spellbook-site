import styles from './cardImage.module.scss';
import FlipperCard from '../FlipperCard/FlipperCard';
import React, { useEffect, useRef, useState } from 'react';
import cardBack from 'assets/images/card-back.png';
import CardLink from '../../layout/CardLink/CardLink';

type Props = {
  img: string;
  name: string;
  className?: string;
};

const CardImage: React.FC<Props> = ({ img, name, className }: Props) => {
  //const CardImage: React.FC<Props> = forwardRef(({ img, imgBack, name, className }, ref) => {
  const imgBack = img.replaceAll('face=front', 'face=back');
  const [backImageSrc, setBackImageSrc] = useState(imgBack);
  const frontImageRef = useRef<HTMLImageElement>(null);
  const backImageRef = useRef<HTMLImageElement>(null);
  const [hasBack, setHasBack] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [readyToFlip, setReadyToFlip] = useState(false);
  const [backFacing, setBackFacing] = useState(!img.includes(encodeURIComponent(name)));

  const flip = () => {
    setBackFacing((prev) => !prev);
  };

  const clickFlip = (e: any) => {
    e.currentTarget.blur();
    flip();
  };

  useEffect(() => {
    if (loaded && !readyToFlip) {
      setTimeout(() => {
        setReadyToFlip(true);
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (backImageRef.current && backImageRef.current.complete && backImageSrc != cardBack.src) {
      //If there is no back image then set to cardBack.src
      if (backImageRef.current.naturalHeight == 0) {
        setBackImageSrc(cardBack.src);
      } else {
        setHasBack(true);
      }
    }
  }, [imgBack]);

  //removed isFoolsDay() ? weatheredCardBack.src : cardBack.src
  return (
    <div className={styles.centerContainer}>
      <CardLink className="relative" name={name}>
        <FlipperCard
          className={className}
          flipped={backFacing}
          back={<img className={styles.frontCard} src={backImageSrc} ref={backImageRef} alt="" />}
          front={
            <img ref={frontImageRef} className={styles.frontCard} src={img} alt={name} onLoad={() => setLoaded(true)} />
          }
        />
      </CardLink>
      {hasBack && (
        <button
          id={`flip-${name}`}
          className={`cardImage_${name} md:flex ${styles.flipperButton}`}
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
