import React from 'react';
import styles from './manaSymbol.module.scss';
import scryfall from 'scryfall-client';

interface Props {
  symbol: string;
  size?: 'medium' | 'small';
  ariaHidden?: boolean;
  className?: string;
}

const ManaSymbol: React.FC<Props> = ({ symbol, size = 'medium', ariaHidden, className }) => {
  const url = scryfall.getSymbolUrl(symbol);

  let colorName = '';
  if (symbol === 'w') {
    colorName = 'White ';
  }
  if (symbol === 'u') {
    colorName = 'Blue ';
  }
  if (symbol === 'b') {
    colorName = 'Black ';
  }
  if (symbol === 'r') {
    colorName = 'Red ';
  }
  if (symbol === 'g') {
    colorName = 'Green ';
  }
  if (symbol === 'c') {
    colorName = 'Colorless ';
  }

  const altText = `${colorName}Mana Symbol`;

  return (
    <img
      src={url}
      alt={altText}
      className={`${styles.manaSymbol} ${styles[size]} ${className}`}
      aria-hidden={ariaHidden}
    />
  );
};

export default ManaSymbol;
