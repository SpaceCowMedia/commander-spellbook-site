import styles from './flipperCard.module.scss';
import React, { ReactNode } from 'react';

interface Props {
  flipped: boolean;
  rotated: boolean;
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

const FlipperCard: React.FC<Props> = ({ flipped, rotated, front, back, className }) => {
  return (
    <div
      className={`${styles.flipContainer} ${(flipped && styles.flipped) || ''} ${rotated && styles.rotated} ${className || ''}`}
    >
      <div className={styles.flipper}>
        <div className={styles.front}>{front}</div>
        <div className={styles.back}>{back}</div>
      </div>
    </div>
  );
};

export default FlipperCard;
