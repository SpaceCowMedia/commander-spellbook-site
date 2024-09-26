import React from 'react';
import styles from './placeholderText.module.scss';

type Props = {
  maxLength?: number;
  minLength?: number;
};

const PlaceholderText: React.FC<Props> = ({ maxLength = 90, minLength = 10 }) => {
  const length = Math.floor(Math.random() * maxLength) + minLength;

  const style = { width: `${length}%` };

  return (
    <span className={styles.placeholderText}>
      <div className={styles.textBar} style={style} />
    </span>
  );
};

export default PlaceholderText;
