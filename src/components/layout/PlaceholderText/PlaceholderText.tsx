import React, { useEffect, useState } from 'react';
import styles from './placeholderText.module.scss';

interface Props {
  maxLength?: number;
  minLength?: number;
}

const PlaceholderText: React.FC<Props> = ({ maxLength = 90, minLength = 10 }) => {
  const [length, setLength] = useState(0);

  const style = { width: `${length}%` };

  useEffect(() => {
    const randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    setLength(randomLength);
  }, [maxLength, minLength]);

  return (
    <span className={styles.placeholderText}>
      <div className={styles.textBar} style={style} />
    </span>
  );
};

export default PlaceholderText;
